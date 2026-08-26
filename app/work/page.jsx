import WorkIndex from '@/components/WorkIndex'
import { getCatalog, getRooms, projectsInRoom } from '@/lib/catalog'
import s from './work.module.css'

export const metadata = {
  title: 'Work — Ishaan',
  description: 'Every project, grouped by what it is.',
}

export default function WorkPage() {
  const catalog = getCatalog()
  const rooms = getRooms()

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div className="shell">
          <h1 className={`display display-xl ${s.title}`}>Work</h1>
          <div className={s.rooms}>
            {rooms.map((r) => {
              const projects = projectsInRoom(r.id)
              const frames = projects.reduce((n, p) => n + p.count, 0)
              return (
                <div key={r.id} className={s.room}>
                  <h2 className={s.roomName}>{r.name}</h2>
                  <p className={s.roomNote}>{r.note}</p>
                  <span className="mono">
                    {projects.length} projects &middot; {frames} frames
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <WorkIndex projects={catalog.projects} heading="All projects" />
    </div>
  )
}
