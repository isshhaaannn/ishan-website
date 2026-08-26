// Pushes public/media to Supabase Storage. The derivatives are ~190MB across
// 2000+ files, which is over Vercel's 100MB static-upload cap on Hobby, so
// they cannot ship inside the deployment.
//
//   node --env-file=.env scripts/upload-supabase.mjs
//   node --env-file=.env scripts/upload-supabase.mjs --dry-run
//
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The service role key
// bypasses RLS and storage policies, so it stays server-side only — never
// prefix it with NEXT_PUBLIC_ and never ship it to the browser.
//
// Afterwards set NEXT_PUBLIC_MEDIA_BASE (printed on success) so lib/catalog.js
// rebases every path onto the bucket.
//
// Re-runs are cheap: an object already present at the same byte length is
// skipped, so adding work only uploads the new frames.

import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const MEDIA = path.join(ROOT, 'public', 'media')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'Ishan-website assets'
const CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY || 12)
const DRY = process.argv.includes('--dry-run')

if (!DRY && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\nRun with: node --env-file=.env scripts/upload-supabase.mjs')
  process.exit(1)
}

// The bucket name contains a space, so every path segment gets encoded.
const BASE = `${SUPABASE_URL}/storage/v1`
const BUCKET_ENC = encodeURIComponent(BUCKET)
const encodeKey = (key) => key.split('/').map(encodeURIComponent).join('/')

const auth = {
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  apikey: SUPABASE_SERVICE_ROLE_KEY,
}

// The bucket only accepts image/* and video/*, so anything else (.DS_Store)
// is dropped here rather than failing 2000 requests in.
const TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, out)
    else if (TYPES[path.extname(e.name).toLowerCase()]) out.push(p)
  }
  return out
}

// Objects are keyed exactly as catalog.json addresses them, so the only
// difference between local and hosted is the prefix in NEXT_PUBLIC_MEDIA_BASE.
const keyFor = (file) => 'media/' + path.relative(MEDIA, file).split(path.sep).join('/')

// Storage list is non-recursive, so it runs once per directory that exists
// locally. 100 calls beats re-uploading 190MB on every run.
async function existingObjects(prefixes) {
  const seen = new Map()
  let scanned = 0
  const queue = [...prefixes]

  async function worker() {
    for (;;) {
      const prefix = queue.shift()
      if (!prefix) return
      let offset = 0
      for (;;) {
        const res = await fetch(`${BASE}/object/list/${BUCKET_ENC}`, {
          method: 'POST',
          headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
        })
        if (!res.ok) throw new Error(`list ${prefix} -> ${res.status} ${await res.text()}`)
        const page = await res.json()
        for (const o of page) {
          // Folders come back with a null id and no metadata.
          if (!o.id) continue
          seen.set(prefix + o.name, o.metadata?.size ?? -1)
        }
        if (page.length < 1000) break
        offset += page.length
      }
      if (++scanned % 25 === 0) console.log(`  scanned ${scanned}/${prefixes.length} prefixes`)
    }
  }

  await Promise.all(Array.from({ length: Math.min(8, prefixes.length) }, worker))
  return seen
}

async function put(job, attempt = 1) {
  const res = await fetch(`${BASE}/object/${BUCKET_ENC}/${encodeKey(job.key)}`, {
    method: 'POST',
    headers: {
      ...auth,
      'Content-Type': job.type,
      'x-upsert': 'true',
      // Derivatives are content-addressed by the Drive id in the filename,
      // so they can be cached hard and forever.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: await fs.readFile(job.file),
  })
  if (res.ok) return
  const body = await res.text()
  // 5xx and rate limits are worth another go; a 4xx is a real rejection.
  if (attempt < 3 && (res.status >= 500 || res.status === 429)) {
    await new Promise((r) => setTimeout(r, 400 * attempt))
    return put(job, attempt + 1)
  }
  throw new Error(`${res.status} ${body.slice(0, 200)}`)
}

async function main() {
  const files = await walk(MEDIA)
  const sizes = new Map()
  let bytes = 0
  for (const f of files) {
    const { size } = await fs.stat(f)
    sizes.set(f, size)
    bytes += size
  }
  console.log(`${files.length} files, ${(bytes / 1048576).toFixed(1)} MB in public/media`)
  console.log(`bucket: "${BUCKET}"`)

  if (DRY) {
    console.log('\nDry run. First 5 keys:')
    for (const f of files.slice(0, 5)) console.log('  ' + keyFor(f))
    return
  }

  const prefixes = [...new Set(files.map((f) => keyFor(f).replace(/[^/]+$/, '')))]
  console.log(`\nListing ${prefixes.length} prefixes already in the bucket...`)
  const seen = await existingObjects(prefixes)

  const todo = []
  for (const f of files) {
    const key = keyFor(f)
    if (seen.get(key) === sizes.get(f)) continue
    todo.push({ file: f, key, size: sizes.get(f), type: TYPES[path.extname(f).toLowerCase()] })
  }
  const skip = files.length - todo.length
  console.log(`${todo.length} to upload, ${skip} already current\n`)
  if (!todo.length) {
    printBase()
    return
  }

  let done = 0
  let failed = 0
  const queue = [...todo]

  async function worker() {
    for (;;) {
      const job = queue.shift()
      if (!job) return
      try {
        await put(job)
      } catch (e) {
        failed++
        console.error(`  FAIL ${job.key}: ${e.message}`)
      }
      if (++done % 100 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}`)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(`\nDone. ${done - failed} uploaded, ${failed} failed.`)
  if (failed) process.exitCode = 1
  else printBase()
}

function printBase() {
  const base = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_ENC}`
  console.log(`\nSet this in .env.local and in the Vercel project:\n  NEXT_PUBLIC_MEDIA_BASE=${base}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
