import raw from '@/data/catalog.json'

export const ROOM_ORDER = ['social', 'identity', 'advertising', 'objects', 'studio']

// catalog.json stores deployment-relative paths like /media/foo--full.webp.
// In production the 2000-odd derivatives live off the deployment (Vercel caps
// static uploads at 100MB on Hobby), so every path gets rewritten to the
// bucket once, here, rather than at each of the dozen call sites.
// Unset locally, which leaves the paths relative and serves from public/.
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || '').replace(/\/+$/, '')

const TIERS = ['src', 'mid', 'thumb', 'small']

function rebase(slide) {
  const out = { ...slide }
  for (const tier of TIERS) {
    if (typeof out[tier] === 'string' && out[tier].startsWith('/')) {
      out[tier] = MEDIA_BASE + out[tier]
    }
  }
  return out
}

const catalog = MEDIA_BASE
  ? {
      ...raw,
      projects: raw.projects.map((p) => ({
        ...p,
        cover: rebase(p.cover),
        sections: p.sections.map((s) => ({ ...s, slides: s.slides.map(rebase) })),
      })),
    }
  : raw

export function getCatalog() {
  return catalog
}

export function getProject(id) {
  return catalog.projects.find((p) => p.id === id) || null
}

export function getProjects() {
  return catalog.projects
}

export function getRooms() {
  return catalog.rooms
}

export function projectsInRoom(roomId) {
  const room = catalog.rooms.find((r) => r.id === roomId)
  if (!room) return []
  return room.projects.map((id) => getProject(id)).filter(Boolean)
}

// Every slide in the archive, flattened, with its project attached.
export function allSlides() {
  const out = []
  for (const p of catalog.projects) {
    for (const section of p.sections) {
      for (const slide of section.slides) {
        out.push({ ...slide, project: p.id, projectTitle: p.title, section: section.name })
      }
    }
  }
  return out
}

// Deterministic shuffle so server and client agree and the order is stable
// between builds. Straight interleave would clump one client together.
export function spread(items, seed = 7) {
  const arr = [...items]
  let s = seed
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function nextProject(id) {
  const list = catalog.projects
  const i = list.findIndex((p) => p.id === id)
  if (i === -1) return null
  return list[(i + 1) % list.length]
}
