import Hero from '@/components/Hero'
import Selected from '@/components/Selected'
import WorkIndex from '@/components/WorkIndex'
import ArchiveStrip from '@/components/ArchiveStrip'
import Reveal from '@/components/Reveal'
import { getCatalog, getProject, allSlides, spread } from '@/lib/catalog'
import s from './page.module.css'

// The ones that open the site. Range first, volume second.
// 'daily-mail' is withheld for now — see HIDDEN in data/structure.mjs.
const FEATURED = ['metromedia', 'vryks', /* 'daily-mail', */ 'kelme', 'berribot', 'jerseyfolio']

export default function Home() {
  const catalog = getCatalog()

  const featured = FEATURED.map(getProject).filter(Boolean)

  // The hero rail runs on covers, one per project, widest range first.
  const heroSlides = catalog.projects.slice(0, 14).map((p) => p.cover)

  const pool = spread(allSlides(), 11)
  const rows = [pool.slice(0, 22), pool.slice(22, 44)]

  return (
    <>
      <Hero slides={heroSlides} stats={catalog.stats} />

      <div className="shell">
        <hr className="rule" />
      </div>

      <section className={s.statement}>
        <div className="shell">
          <Reveal>
            <p className={`display display-l ${s.line}`}>
              Most of this was made to be seen for <em>two seconds</em> on a phone.
              That is the hardest brief there is.
            </p>
          </Reveal>
        </div>
      </section>

      <Selected projects={featured} />

      <WorkIndex projects={catalog.projects} heading="Everything" />

      <ArchiveStrip rows={rows} total={catalog.stats.images} />
    </>
  )
}
