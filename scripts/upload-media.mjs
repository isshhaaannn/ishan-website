// Pushes public/media to an S3-compatible bucket (Cloudflare R2, S3, B2,
// Spaces). Vercel caps static uploads at 100MB on Hobby and the derivatives
// are ~190MB, so they cannot ship inside the deployment.
//
//   npm i --no-save @aws-sdk/client-s3
//   S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com \
//   S3_BUCKET=Ishan-media \
//   S3_ACCESS_KEY_ID=... \
//   S3_SECRET_ACCESS_KEY=... \
//   node scripts/upload-media.mjs
//
// Then set NEXT_PUBLIC_MEDIA_BASE in Vercel to the bucket's public URL
// (for R2 that is the r2.dev domain, or your own CDN hostname).
//
// Re-runs are cheap: an object already present at the same byte length is
// skipped, so adding work only uploads the new frames.

import fs from 'node:fs/promises'
import path from 'node:path'
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

const ROOT = path.resolve(import.meta.dirname, '..')
const MEDIA = path.join(ROOT, 'public', 'media')

const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env
const CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY || 16)
const DRY = process.argv.includes('--dry-run')

const missing = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'].filter(
  (k) => !process.env[k]
)
if (missing.length && !DRY) {
  console.error(`Missing env: ${missing.join(', ')}\nSee the header of this file.`)
  process.exit(1)
}

const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' }

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    e.isDirectory() ? await walk(p, out) : out.push(p)
  }
  return out
}

// Objects are keyed exactly as catalog.json addresses them, so the only
// difference between local and hosted is the prefix in NEXT_PUBLIC_MEDIA_BASE.
const keyFor = (file) => 'media/' + path.relative(MEDIA, file).split(path.sep).join('/')

async function existingObjects(client) {
  const seen = new Map()
  let token
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: 'media/', ContinuationToken: token })
    )
    for (const o of res.Contents || []) seen.set(o.Key, o.Size)
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)
  return seen
}

async function main() {
  const files = await walk(MEDIA)
  const bytes = (await Promise.all(files.map((f) => fs.stat(f)))).reduce((n, s) => n + s.size, 0)
  console.log(`${files.length} files, ${(bytes / 1048576).toFixed(1)} MB in public/media`)

  if (DRY) {
    console.log('\nDry run. First 5 keys:')
    for (const f of files.slice(0, 5)) console.log('  ' + keyFor(f))
    return
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: S3_ENDPOINT,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  })

  console.log('Listing what is already there...')
  const seen = await existingObjects(client)
  const todo = []
  for (const f of files) {
    const key = keyFor(f)
    const { size } = await fs.stat(f)
    if (seen.get(key) === size) continue
    todo.push({ f, key, size })
  }
  console.log(`${todo.length} to upload, ${files.length - todo.length} already current\n`)
  if (!todo.length) return

  let done = 0
  let failed = 0
  const queue = [...todo]

  async function worker() {
    for (;;) {
      const job = queue.shift()
      if (!job) return
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: job.key,
            Body: await fs.readFile(job.f),
            ContentType: TYPES[path.extname(job.f)] || 'application/octet-stream',
            // Derivatives are content-addressed by the Drive id in the
            // filename, so they can be cached hard and forever.
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )
      } catch (e) {
        failed++
        console.error(`  FAIL ${job.key}: ${e.message}`)
      }
      if (++done % 50 === 0 || done === todo.length) {
        console.log(`  ${done}/${todo.length}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(`\nDone. ${done - failed} uploaded, ${failed} failed.`)
  if (failed) process.exitCode = 1
  else console.log('Now set NEXT_PUBLIC_MEDIA_BASE to the bucket public URL and redeploy.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
