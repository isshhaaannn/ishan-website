import { Fraunces, DM_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
  variable: '--font-fraunces',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-dm-mono',
})

// Every image now comes from the storage bucket, so the browser has to open a
// second connection before it can start the LCP image. Warming it here takes
// the DNS and TLS round trips off the critical path. Derived from the same env
// var lib/catalog.js rebases with, so it can never drift from the real origin.
const MEDIA_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_MEDIA_BASE).origin
  } catch {
    return null
  }
})()

export const metadata = {
  title: 'Ishan',
  description: 'Designer. Social first, everything after.',
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2EEE5' },
    { media: '(prefers-color-scheme: dark)', color: '#100F0C' },
  ],
}

export default function RootLayout({ children }) {
  return (
    // `js` is rendered on the server so hydration matches; CSS restores the
    // revealed state for anyone without scripting.
    <html lang="en" className={`${fraunces.variable} ${dmMono.variable} js`}>
      <head>
        {MEDIA_ORIGIN && (
          <>
            <link rel="preconnect" href={MEDIA_ORIGIN} />
            <link rel="dns-prefetch" href={MEDIA_ORIGIN} />
          </>
        )}
      </head>
      <body>
        <SmoothScroll />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
