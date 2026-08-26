'use client'

import { useEffect, useRef, useState } from 'react'
import Rail from './webgl/Rail'
import s from './Hero.module.css'

// The rail drifts on its own, the way a feed scrolls past you.
// Pointer nudges it; it never stops entirely.
export default function Hero({ slides, stats }) {
  const progress = useRef(0)
  const velocity = useRef(0)
  const drift = useRef(0.000085)
  const target = useRef(0.000085)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      progress.current = 0.5
      return
    }

    let frame
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min(now - last, 48)
      last = now

      drift.current += (target.current - drift.current) * 0.06
      progress.current += drift.current * dt

      // Loop the rail rather than stopping at the end.
      if (progress.current > 1) progress.current -= 1
      if (progress.current < 0) progress.current += 1

      velocity.current += (drift.current * 900 - velocity.current) * 0.1
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5
      target.current = 0.000085 + x * 0.00034
    }
    const onLeave = () => { target.current = 0.000085 }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section className={s.hero}>
      <div className={s.copy}>
        <h1 className={`display display-xl ${s.title}`}>
          Social first,
          <br />
          <em>everything</em> after.
        </h1>
      </div>

      <div className={s.railWrap} aria-hidden="true">
        {ready && (
          <Rail
            slides={slides}
            progressRef={progress}
            velocityRef={velocity}
            planeH={3.0}
            gap={0.44}
            className={s.canvas}
          />
        )}
      </div>

      <div className={s.foot}>
        <div className={s.footL}>
          <p className={s.lede}>
            Ishan is a graphic designer. He makes the frames that stop a thumb,
            then the brand systems underneath them.
          </p>
        </div>
        <dl className={s.stats}>
          <div>
            <dt className="mono">Creatives</dt>
            <dd className="num">{stats.images}</dd>
          </div>
          <div>
            <dt className="mono">Projects</dt>
            <dd className="num">{stats.projects}</dd>
          </div>
          <div>
            <dt className="mono">Clients</dt>
            <dd className="num">{stats.clients}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
