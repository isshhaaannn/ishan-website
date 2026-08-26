import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { ROOMS, PROJECTS, SOCIAL_HANDLED, SOCIAL_META } from '../data/structure.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const RAW = path.join(ROOT, 'assets', 'raw')
const OUT = path.join(ROOT, 'public', 'media')

const SIZES = { thumb: 520, full: 1400 }

const exists = async (p) => !!(await fs.stat(p).catch(() => null))

async function listDir(rel) {
  const dir = path.join(RAW, rel)
  if (!(await exists(dir))) return []
  const names = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith('.jpg'))
    .map((e) => e.name)
  return names.sort(naturalSort).map((n) => path.join(rel, n))
}

// Slides are numbered 1..n in the filenames; sort them the way a human reads them.
function naturalSort(a, b) {
  return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
}

async function subdirs(rel) {
  const dir = path.join(RAW, rel)
  if (!(await exists(dir))) return []
  return (await fs.readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort(naturalSort)
}

// Walks a source dir: files directly inside become one run; each subdir becomes its own run.
async function collectRuns(rel) {
  const runs = []
  const loose = await listDir(rel)
  if (loose.length) runs.push({ name: null, files: loose })
  for (const sub of await subdirs(rel)) {
    const nested = await collectRuns(path.join(rel, sub))
    for (const n of nested) runs.push({ name: n.name ? `${sub} / ${n.name}` : sub, files: n.files })
  }
  return runs
}

let processed = 0
const total = { n: 0 }

async function processImage(rel) {
  const src = path.join(RAW, rel)
  const key = rel.replace(/\.jpg$/, '')
  const img = sharp(src, { failOn: 'none' })
  const meta = await img.metadata()

  const out = {}
  for (const [label, w] of Object.entries(SIZES)) {
    const dest = path.join(OUT, `${key}--${label}.webp`)
    await fs.mkdir(path.dirname(dest), { recursive: true })
    if (!(await exists(dest))) {
      await sharp(src, { failOn: 'none' })
        .resize({ width: Math.min(w, meta.width || w), withoutEnlargement: true })
        .webp({ quality: label === 'thumb' ? 72 : 82, effort: 4 })
        .toFile(dest)
    }
    out[label] = `/media/${key}--${label}.webp`
  }

  // Average colour drives the placeholder tint and the archive hover state.
  const { dominant } = await sharp(src, { failOn: 'none' }).stats()
  const hex =
    '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')

  processed++
  if (processed % 40 === 0) console.log(`  ${processed}/${total.n}`)

  return {
    id: key.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
    src: out.full,
    thumb: out.thumb,
    w: meta.width || 1000,
    h: meta.height || 1000,
    color: hex,
  }
}

async function buildProject(def) {
  const sections = []
  for (const s of def.sections) {
    const runs = await collectRuns(s.src)
    for (const run of runs) {
      if (!run.files.length) continue
      sections.push({
        name: run.name ? `${s.name} / ${run.name}` : s.name,
        files: run.files,
      })
    }
  }
  const flat = sections.flatMap((s) => s.files)
  total.n += flat.length
  return { def, sections }
}

async function main() {
  console.log('Building catalog...')

  // --- assemble project definitions, including auto-generated social clients
  const defs = [...PROJECTS]

  for (const client of await subdirs('social-media-design')) {
    if (SOCIAL_HANDLED.includes(client)) continue
    const meta = SOCIAL_META[client] || {}
    defs.push({
      id: client,
      room: 'social',
      client: meta.title || client,
      title: meta.title || client,
      blurb: meta.blurb || '',
      sections: [{ name: 'Work', src: path.join('social-media-design', client) }],
    })
  }

  const staged = []
  for (const def of defs) staged.push(await buildProject(def))

  console.log(`  ${total.n} images to process`)

  const projects = []
  for (const { def, sections } of staged) {
    const built = []
    for (const s of sections) {
      const slides = []
      for (const f of s.files) slides.push(await processImage(f))
      built.push({ name: s.name, slides })
    }
    const all = built.flatMap((s) => s.slides)
    if (!all.length) {
      console.warn(`  ! ${def.id} has no images, skipping`)
      continue
    }
    // The cover is the first slide of the first run, which is how the carousel opens.
    projects.push({
      id: def.id,
      room: def.room,
      alsoIn: def.alsoIn || [],
      client: def.client,
      title: def.title,
      blurb: def.blurb || '',
      count: all.length,
      runs: built.length,
      cover: all[0],
      sections: built,
    })
  }

  projects.sort((a, b) => b.count - a.count)

  const catalog = {
    rooms: ROOMS.map((r) => ({
      ...r,
      projects: projects.filter((p) => p.room === r.id || p.alsoIn.includes(r.id)).map((p) => p.id),
    })),
    projects,
    stats: {
      images: projects.reduce((n, p) => n + p.count, 0),
      projects: projects.length,
      clients: new Set(projects.map((p) => p.client)).size,
    },
  }

  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true })
  await fs.writeFile(path.join(ROOT, 'data', 'catalog.json'), JSON.stringify(catalog, null, 1))

  console.log(`\nDone. ${catalog.stats.images} images, ${catalog.stats.projects} projects.`)
  for (const r of catalog.rooms) console.log(`  ${r.name.padEnd(13)} ${r.projects.length} projects`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
