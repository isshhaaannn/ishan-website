import Link from 'next/link'
import s from './Footer.module.css'

const ELSEWHERE = [
  { label: 'Instagram', href: 'https://instagram.com/isshhaaannn_' },
  { label: 'Email', href: 'mailto:hello@ishaan.design' },
]

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className="shell">
        <div className={s.top}>
          <a href="mailto:hello@ishaan.design" className={`display display-l ${s.pitch}`}>
            Got something
            <br />
            worth <em>making</em>?
          </a>

          <nav className={s.cols} aria-label="Footer">
            <div>
              <span className="mono">Pages</span>
              <Link href="/work">Work</Link>
              <Link href="/archive" prefetch={false}>Archive</Link>
              <Link href="/about">About</Link>
            </div>
            <div>
              <span className="mono">Elsewhere</span>
              {ELSEWHERE.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className={s.base}>
          <span className="mono">Ishaan &middot; Graphic designer</span>
          <span className="mono">Think. Design. Win.</span>
        </div>
      </div>
    </footer>
  )
}
