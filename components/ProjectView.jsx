'use client'

import Link from 'next/link'
import { useState } from 'react'
import SlideViewer from './SlideViewer'
import Reveal from './Reveal'
import s from './ProjectView.module.css'

// Each run in this project is one carousel, so it renders as one filmstrip.
// Clicking any frame opens that run in the scrubbable viewer.
export default function ProjectView({ project, next }) {
  const [open, setOpen] = useState(null)

  return (
    <>
      <article className={s.project}>
        <header className={s.head}>
          <div className="shell">
            <div className={s.headGrid}>
              <div className={s.headMain}>
                <p className="mono">{project.room}</p>
                <h1 className={`display display-xl ${s.title}`}>{project.title}</h1>
              </div>
              <div className={s.headSide}>
                <p className={s.blurb}>{project.blurb}</p>
                <dl className={s.facts}>
                  <div>
                    <dt className="mono">Client</dt>
                    <dd>{project.client}</dd>
                  </div>
                  <div>
                    <dt className="mono">Frames</dt>
                    <dd className="num">{project.count}</dd>
                  </div>
                  <div>
                    <dt className="mono">Sets</dt>
                    <dd className="num">{project.runs}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </header>

        <Reveal className={s.coverWrap}>
          <div className={s.cover} style={{ backgroundColor: project.cover.color }}>
            <img
              src={project.cover.src}
              alt={`${project.title} lead image`}
              width={project.cover.w}
              height={project.cover.h}
              className={s.coverImg}
            />
          </div>
        </Reveal>

        <div className={s.runs}>
          {project.sections.map((run, i) => (
            <section key={i} className={s.run}>
              <div className="shell">
                <div className={s.runHead}>
                  <h2 className={`display display-m ${s.runTitle}`}>{run.name}</h2>
                  <button className={s.scrub} onClick={() => setOpen(run)}>
                    Scrub
                    <span className="num">{String(run.slides.length).padStart(2, '0')}</span>
                  </button>
                </div>
              </div>

              <div className={s.strip}>
                {run.slides.map((slide, j) => (
                  <button
                    key={slide.id}
                    className={s.frame}
                    style={{ backgroundColor: slide.color, aspectRatio: `${slide.w} / ${slide.h}` }}
                    onClick={() => setOpen(run)}
                    aria-label={`Open ${run.name}, frame ${j + 1} of ${run.slides.length}`}
                  >
                    <img src={slide.thumb} alt="" loading="lazy" decoding="async" />
                    <span className={`num ${s.n}`}>{String(j + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {next && (
          <Link href={`/work/${next.id}`} className={s.next}>
            <div className="shell">
              <span className="mono">Next</span>
              <span className={`display display-l ${s.nextTitle}`}>{next.title}</span>
            </div>
            <div className={s.nextImg} style={{ backgroundColor: next.cover.color }}>
              <img src={next.cover.thumb} alt="" loading="lazy" decoding="async" />
            </div>
          </Link>
        )}
      </article>

      {open && (
        <SlideViewer run={open} projectTitle={project.title} onClose={() => setOpen(null)} />
      )}
    </>
  )
}
