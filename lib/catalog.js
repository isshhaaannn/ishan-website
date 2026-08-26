import catalog from '@/data/catalog.json'

export const ROOM_ORDER = ['social', 'identity', 'advertising', 'objects', 'studio']

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
