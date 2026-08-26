import Link from 'next/link'
import s from './ArchiveStrip.module.css'

// The are.na move: show the sheer volume, keep it calm.
// Two rows drifting against each other, duplicated so the loop never seams.
export default function ArchiveStrip({ rows, total }) {
  return (
    <section className={s.section}>
      <div className="shell">
        <div className={s.head}>
          <h2 className="mono">Archive</h2>
          {/* The archive RSC payload is ~53KB (524 slides of props), and
              viewport-prefetch pulled it on every page that links here.
              prefetch={false} keeps hover-prefetch, drops the idle fetch. */}
          <Link href="/archive" className={s.link} prefetch={false}>
            All {total} creatives
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M2.5 10.5L10.5 2.5M10.5 2.5H4M10.5 2.5V9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </Link>
        </div>
      </div>

      <div className={s.rails} aria-hidden="true">
        {rows.map((row, r) => (
          <div key={r} className={`${s.rail} ${r % 2 ? s.back : s.forward}`}>
            <div className={s.track}>
              {[0, 1].map((copy) => (
                <div className={s.set} key={copy}>
                  {row.map((img, i) => (
                    <div className={s.cell} key={`${copy}-${i}`} style={{ backgroundColor: img.color }}>
                      <img
                        src={img.small}
                        srcSet={`${img.small} 260w, ${img.thumb} 520w`}
                        sizes="(min-width: 1550px) 186px, (min-width: 934px) 12vw, 112px"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
