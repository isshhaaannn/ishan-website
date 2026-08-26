'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import s from './Nav.module.css'

const LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/archive', label: 'Archive' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const pathname = usePathname()
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${s.nav} ${lifted ? s.lifted : ''}`}>
      <a href="#main" className={s.skip}>Skip to content</a>
      <div className={s.inner}>
        <Link href="/" className={s.mark}>
          Ishan
          <span className={s.dot} aria-hidden="true" />
        </Link>
        <nav className={s.links} aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? s.on : undefined}
            >
              {l.label}
            </Link>
          ))}
          <a href="mailto:hello@Ishan.design" className={s.cta}>Available</a>
        </nav>
      </div>
    </header>
  )
}
