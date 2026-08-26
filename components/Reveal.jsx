'use client'

import { useEffect, useRef } from 'react'

// One observer for the whole page. Elements reveal once and stay revealed.
let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const delay = Number(entry.target.dataset.revealDelay || 0)
        setTimeout(() => entry.target.classList.add('in'), delay)
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
  )
  return observer
}

export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }
    const io = getObserver()
    io.observe(el)
    return () => io.unobserve(el)
  }, [])

  return (
    <Tag ref={ref} data-reveal-delay={delay} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
