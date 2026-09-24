import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppShell, { PageLayout, Section } from '../components/layout/PlatformLayout'
import { Button, StatGrid } from '../components/ui/PlatformUI'
import { PathCard, EventCard } from '../components/learn/LearnCards'
import { learningPaths } from '../content/paths'
import { events } from '../content/events'
import { impactStats, partners } from '../content/community'
import { courses } from '../content/courses'

export default function PlatformHome() {
  usePageMeta({
    title: 'RGV AI Coalition — South Texas AI Learning Hub',
    description: 'Free and low-cost AI education, workforce training, and community workshops for the Rio Grande Valley. Trusted by cities, schools, businesses, and nonprofits.',
    ogTitle: 'South Texas\'s AI Academy — RGV AI Coalition',
    ogDescription: 'Learn AI skills, join workshops, and partner with the region\'s leading AI education platform.',
    path: '/',
  })

  const featuredPaths = learningPaths.slice(0, 3)
  const featuredEvents = events.filter((e) => e.featured).slice(0, 3)

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout width="wide">
        <section className="home-hero">
          <p className="home-hero-eyebrow">South Texas AI Academy</p>
          <h1 className="home-hero-title">
            Build digital and AI skills for work, school, and community
          </h1>
          <p className="home-hero-desc">
            RGV AI Coalition is the Rio Grande Valley&apos;s learning platform for residents, educators,
            small businesses, nonprofits, and public agencies. Learn with structured paths, workshops,
            and trusted resources.
          </p>
          <div className="home-hero-ctas">
            <Button to="/learn">Start learning</Button>
            <Button to="/about/partner" variant="secondary">Partner with us</Button>
          </div>
        </section>

        <Section title="Trusted across South Texas">
          <div className="partner-logo-strip" role="list" aria-label="Partner organizations">
            {partners.slice(0, 6).map((p) => (
              <span key={p.slug} className="partner-logo-pill" role="listitem">{p.name}</span>
            ))}
          </div>
        </Section>

        <Section title="Regional impact" description="Building AI literacy one workshop, classroom, and community at a time.">
          <StatGrid stats={impactStats} />
        </Section>

        <Section title="Featured learning paths" description="Structured journeys for your role and goals.">
          <div className="card-grid card-grid--3">
            {featuredPaths.map((p) => (
              <PathCard key={p.slug} path={p} courseCount={p.courseSlugs.length} />
            ))}
          </div>
          <div className="section-cta">
            <Button to="/learn/paths" variant="secondary">View all paths</Button>
          </div>
        </Section>

        <Section title="Upcoming workshops & events">
          <div className="card-grid card-grid--3">
            {featuredEvents.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
          <div className="section-cta">
            <Button to="/events" variant="secondary">View calendar</Button>
          </div>
        </Section>

        <Section title="Who we serve">
          <div className="sector-grid">
            {[
              { to: '/community/government', label: 'Cities & government', desc: 'Public sector AI and digital literacy' },
              { to: '/community/educators', label: 'Educators', desc: 'Classroom policies and professional development' },
              { to: '/community/small-business', label: 'Small business', desc: 'Practical AI for owners and teams' },
              { to: '/community/nonprofits', label: 'Nonprofits', desc: 'Mission-driven digital tools' },
              { to: '/learn/courses', label: 'Students & job seekers', desc: 'Foundations and workforce readiness' },
              { to: '/community/volunteer', label: 'Volunteers', desc: 'Support workshops and community programs' },
            ].map((s) => (
              <Link key={s.to} to={s.to} className="sector-card">
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Popular courses">
          <div className="card-grid card-grid--3">
            {courses.slice(0, 3).map((c) => (
              <Link key={c.slug} to={`/learn/courses/${c.slug}`} className="course-card">
                <h3 className="course-card-title">{c.title}</h3>
                <p className="course-card-summary">{c.summary}</p>
              </Link>
            ))}
          </div>
        </Section>

        <section className="home-cta-banner">
          <h2>Ready to bring AI training to your organization?</h2>
          <p>Cities, schools, libraries, chambers, and nonprofits partner with us to host workshops and workforce programs.</p>
          <div className="home-hero-ctas">
            <Button to="/community/government">Government programs</Button>
            <Button to="/about/partner" variant="secondary">Become a partner</Button>
          </div>
        </section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}
