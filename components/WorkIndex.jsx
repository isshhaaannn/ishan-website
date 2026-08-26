'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import s from './WorkIndex.module.css'

// A typographic index that stays quiet until you point at it, then floods
// with the work. Hovering a row lifts its cover to the cursor.
export default function WorkIndex({ projects, heading = 'Index' }) {
  const [active, setActive] = useState(null)
  // Covers only enter the DOM once their row has been pointed at. Mounted at
  // opacity 0 they still downloaded — 25 images nobody had asked to see.
  // Once mounted they stay, so repeat hovers keep the cross-fade.
  const [seen, setSeen] = useState(() => new Set())
  const previewRef = useRef(null)
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const listRef = useRef(null)

  useEffect(() => {
    let frame
    const tick = () => {
      const p = pos.current
      p.x += (p.tx - p.x) * 0.13
      p.y += (p.ty - p.y) * 0.13
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const onMove = useCallback((e) => {
    const rect = listRef.current?.getBoundingClientRect()
    if (!rect) return
    pos.current.tx = e.clientX - rect.left
    pos.current.ty = e.clientY - rect.top
  }, [])

  const reveal = useCallback((project) => {
    setSeen((prev) => (prev.has(project.id) ? prev : new Set(prev).add(project.id)))
    setActive(project)
  }, [])

  const onEnterRow = (project, e) => {
    const rect = listRef.current?.getBoundingClientRect()
    if (rect) {
      // Jump the preview into place on first hover so it does not fly in.
      if (active === null) {
        pos.current.x = pos.current.tx = e.clientX - rect.left
        pos.current.y = pos.current.ty = e.clientY - rect.top
      }
    }
    reveal(project)
  }

  return (
    <section className={s.section}>
      <div className="shell">
        <div className={s.head}>
          <h2 className="mono">{heading}</h2>
          <span className="mono">{projects.length} projects</span>
        </div>

        <div
          ref={listRef}
          className={`${s.list} ${active ? s.dimmed : ''}`}
          onMouseMove={onMove}
          onMouseLeave={() => setActive(null)}
        >
          <div ref={previewRef} className={`${s.preview} ${active ? s.on : ''}`} aria-hidden="true">
            {projects.filter((p) => seen.has(p.id)).map((p) => (
              <img
                key={p.id}
                src={p.cover.thumb}
                srcSet={`${p.cover.small} 260w, ${p.cover.thumb} 520w`}
                sizes="(min-width: 1550px) 310px, (min-width: 1050px) 20vw, 210px"
                alt=""
                decoding="async"
                className={active?.id === p.id ? s.shown : ''}
                style={{ backgroundColor: p.cover.color }}
              />
            ))}
          </div>

          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/work/${p.id}`}
              className={`${s.row} ${active?.id === p.id ? s.active : ''}`}
              onMouseEnter={(e) => onEnterRow(p, e)}
              onFocus={() => setActive(p)}
              onBlur={() => setActive(null)}
            >
              <span className={`mono ${s.idx}`}>{String(i + 1).padStart(2, '0')}</span>
              <span className={`display ${s.title}`}>{p.title}</span>
              <span className={s.tags}>
                <span className="mono">{p.room}</span>
              </span>
              <span className={`num ${s.count}`}>{p.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
