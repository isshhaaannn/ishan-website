import ArchiveGrid from '@/components/ArchiveGrid'
import { allSlides, getRooms, getProjects, getCatalog, spread } from '@/lib/catalog'
import s from './archive.module.css'

export const metadata = {
  title: 'Archive — Ishan',
  description: 'Every frame in the studio, filterable.',
}

export default function ArchivePage() {
  const catalog = getCatalog()
  // Interleaved rather than grouped, so the grid reads as one body of work.
  const slides = spread(allSlides(), 23)

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div className="shell">
          <h1 className={`display display-xl ${s.title}`}>Archive</h1>
          <p className={`lede ${s.lede}`}>
            {catalog.stats.images} frames across {catalog.stats.projects} projects.
            No case studies, no order, no commentary. Just the work.
          </p>
        </div>
      </header>

      <ArchiveGrid slides={slides} rooms={getRooms()} projects={getProjects()} />
    </div>
  )
}
