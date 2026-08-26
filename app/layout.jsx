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

export const metadata = {
  title: 'Ishaan',
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
      <body>
        <SmoothScroll />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
