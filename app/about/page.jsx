import Link from 'next/link'
import { getCatalog } from '@/lib/catalog'
import s from './about.module.css'

export const metadata = {
  title: 'About — Ishan',
  description: 'Graphic designer. Social first, everything after.',
}

const CLIENTS = [
  // 'Daily Mail' withheld for now — see HIDDEN in data/structure.mjs.
  'MetroMedia', /* 'Daily Mail', */ 'Steven Bartlett', 'eu.vc', 'Journey Club',
  'Arthur Brooks', 'Berribot', 'Vryks', 'Kelme India', 'Chris Goode',
  'Kane Kallaway', 'Bizzie', 'SeeIt', 'BYL Ventures', 'Wild Oak', 'Firi',
]

const SERVICES = [
  { name: 'Social systems', note: 'Carousels, covers, formats that survive a hundred posts.' },
  { name: 'Brand identity', note: 'Marks, type, colour and the deck that sells it internally.' },
  { name: 'Advertising', note: 'Performance creative that does not look like performance creative.' },
  { name: 'Print and packaging', note: 'Cards, brochures, backdrops, boxes.' },
]

export default function AboutPage() {
  const { stats } = getCatalog()

  return (
    <div className={s.page}>
      <section className="shell">
        <h1 className={`display display-l ${s.lead}`}>
          I design the frame that has to work before anyone decides to care.
        </h1>
      </section>

      <section className={`shell ${s.split}`}>
        <div className={s.bio}>
          <p className="body">
            Most of my work runs on social, where a piece gets about two seconds to
            earn a third. That constraint shapes everything else I do. Type has to
            carry at thumbnail size. Images have to hold at a glance. Nothing
            decorative survives.
          </p>
          <p className="body">
            The rest is what happens when a client asks for more than a post.
            Identity systems, decks, campaigns, packaging. Same eye, longer form.
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
      </section>

      <section className={`shell ${s.block}`}>
        <h2 className="mono">What I do</h2>
        <div className={s.services}>
          {SERVICES.map((x) => (
            <div key={x.name} className={s.service}>
              <h3 className={s.serviceName}>{x.name}</h3>
              <p className={s.serviceNote}>{x.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`shell ${s.block}`}>
        <h2 className="mono">Worked with</h2>
        <ul className={s.clients}>
          {CLIENTS.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className={`shell ${s.block}`}>
        <Link href="/work" className={`display display-m ${s.cta}`}>
          See the work
        </Link>
      </section>
    </div>
  )
}
