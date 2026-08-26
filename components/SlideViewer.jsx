'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Rail from './webgl/Rail'
import s from './SlideViewer.module.css'

// The carousel is the format this work actually lives in, so it gets a
// dedicated viewer: drag, wheel or arrow keys scrub along a curved rail.
export default function SlideViewer({ run, projectTitle, onClose }) {
  const progress = useRef(0)
  const velocity = useRef(0)
  const targetProgress = useRef(0)
  const [index, setIndex] = useState(0)

  const count = run?.slides?.length || 0
  const step = count > 1 ? 1 / (count - 1) : 1

  const clamp = (v) => Math.max(0, Math.min(1, v))

  const nudge = useCallback(
    (delta) => {
      targetProgress.current = clamp(targetProgress.current + delta)
    },
    []
  )

  useEffect(() => {
    if (!count) return

    let frame
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - last) / 16.667, 3)
      last = now

      const prev = progress.current
      progress.current += (targetProgress.current - progress.current) * 0.09 * dt
      const v = (progress.current - prev) * (count - 1) * 6
      velocity.current += (v - velocity.current) * 0.2

      const i = Math.round(progress.current / step)
      setIndex((cur) => (cur === i ? cur : i))

      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [count, step])

  // Wheel and trackpad. Horizontal intent wins, vertical falls back to scrub.
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault()
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      nudge((d / window.innerWidth) * 0.9)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nudge(step) }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); nudge(-step) }
      if (e.key === 'Home') { e.preventDefault(); targetProgress.current = 0 }
      if (e.key === 'End') { e.preventDefault(); targetProgress.current = 1 }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    window.__lenis?.stop()

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      window.__lenis?.start()
    }
  }, [nudge, onClose, step])

  // Drag to scrub.
  const drag = useRef(null)
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, start: targetProgress.current }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    targetProgress.current = clamp(drag.current.start - (dx / window.innerWidth) * 1.5)
  }
  const onPointerUp = (e) => {
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    // Settle onto the nearest slide.
    targetProgress.current = clamp(Math.round(targetProgress.current / step) * step)
  }

  if (!count) return null

  return (
    <div className={s.wrap} role="dialog" aria-modal="true" aria-label={`${projectTitle}, ${run.name}`}>
      <div
        className={s.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Rail
          slides={run.slides}
          progressRef={progress}
          velocityRef={velocity}
          planeH={3.2}
          gap={0.5}
          quality="full"
          cameraZ={7.4}
          className={s.canvas}
        />
      </div>

      <header className={s.bar}>
        <div className={s.meta}>
          <span className={s.title}>{projectTitle}</span>
          <span className="mono">{run.name}</span>
        </div>
        <button className={s.close} onClick={onClose} aria-label="Close viewer">
          Close
          <span aria-hidden="true">&times;</span>
        </button>
      </header>

      <footer className={s.foot}>
        <div className={s.counter}>
          <span className="num">{String(index + 1).padStart(2, '0')}</span>
          <span className={s.slash}>/</span>
          <span className="num">{String(count).padStart(2, '0')}</span>
        </div>
        <div className={s.track} aria-hidden="true">
          <span className={s.fill} style={{ transform: `scaleX(${count > 1 ? index / (count - 1) : 1})` }} />
        </div>
        <span className="mono">Drag or scroll to scrub</span>
      </footer>
    </div>
  )
}
