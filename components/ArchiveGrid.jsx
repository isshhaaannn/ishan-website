'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import s from './ArchiveGrid.module.css'

// Everything, at once, filterable. Density is the point; the grid stays
// on a single column rhythm so 500 images still scan as one surface.
export default function ArchiveGrid({ slides, rooms, projects }) {
  const [room, setRoom] = useState('all')

  const projectRoom = useMemo(() => {
    const map = {}
    for (const p of projects) map[p.id] = p.room
    return map
  }, [projects])

  const shown = useMemo(() => {
    if (room === 'all') return slides
    return slides.filter((sl) => projectRoom[sl.project] === room)
  }, [slides, room, projectRoom])

  return (
    <div className={s.wrap}>
      <div className={s.barWrap}>
        <div className="shell">
          <div className={s.bar}>
            <div className={s.filters}>
              <button
                className={`${s.pill} ${room === 'all' ? s.on : ''}`}
                onClick={() => setRoom('all')}
              >
                All
              </button>
              {rooms.map((r) => (
                <button
                  key={r.id}
                  className={`${s.pill} ${room === r.id ? s.on : ''}`}
                  onClick={() => setRoom(r.id)}
                >
                  {r.name}
                </button>
              ))}
            </div>
            <span className="mono">
              {shown.length} {shown.length === 1 ? 'frame' : 'frames'}
            </span>
          </div>
        </div>
      </div>

      <div className={s.grid}>
        {shown.map((slide) => (
          <Link
            key={slide.id}
            href={`/work/${slide.project}`}
            className={s.cell}
            style={{ backgroundColor: slide.color }}
          >
            <img
              src={slide.small}
              srcSet={`${slide.small} 260w, ${slide.thumb} 520w`}
              sizes="(min-width: 1600px) 190px, (min-width: 1000px) 12vw, 135px"
              alt={`${slide.projectTitle}, ${slide.section}`}
              loading="lazy"
              decoding="async"
            />
            <span className={s.tag}>
              <span className={s.tagTitle}>{slide.projectTitle}</span>
              <span className="mono">{slide.section}</span>
            </span>
          </Link>
        ))}
      </div>

      {shown.length === 0 && <p className={s.empty}>Nothing filed here yet.</p>}
    </div>
  )
}
