import Link from 'next/link'
import Reveal from './Reveal'
import s from './Selected.module.css'

// Lead with the artefact, keep the writing to a caption.
export default function Selected({ projects }) {
  return (
    <section className={s.section}>
      <div className="shell">
        <div className={s.head}>
          <h2 className="mono">Selected</h2>
          <span className="mono">2024 to 2026</span>
        </div>

        <div className={s.grid}>
          {projects.map((p, i) => (
            <Reveal
              key={p.id}
              as="article"
              delay={(i % 2) * 90}
              className={s.item}
            >
              <Link href={`/work/${p.id}`} className={s.link}>
                <div
                  className={s.frame}
                  style={{
                    backgroundColor: p.cover.color,
                    aspectRatio: `${p.cover.w} / ${p.cover.h}`,
                  }}
                >
                  {/* The hero is 100svh, so every card here starts below the
                      fold behind a Reveal. Eager loading only stole bandwidth
                      from the hero. */}
                  <img
                    src={p.cover.mid}
                    srcSet={`${p.cover.thumb} 520w, ${p.cover.mid} 900w, ${p.cover.src} 1400w`}
                    sizes="(max-width: 760px) 92vw, (min-width: 1520px) 690px, 45vw"
                    alt={`${p.title} cover`}
                    width={p.cover.w}
                    height={p.cover.h}
                    loading="lazy"
                    decoding="async"
                    className={s.img}
                  />
                  <span className={`mono ${s.badge}`}>{p.count} frames</span>
                </div>

                <div className={s.meta}>
                  <h3 className={`display display-m ${s.title}`}>{p.title}</h3>
                  <p className={s.blurb}>{p.blurb}</p>
                  <span className={`mono ${s.more}`}>
                    View
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M2.5 10.5L10.5 2.5M10.5 2.5H4M10.5 2.5V9" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
