import { useParams, Navigate, Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppShell, { PageLayout, PageHeader, Breadcrumb, Section } from '../components/layout/PlatformLayout'
import { Button, FaqList } from '../components/ui/PlatformUI'
import { PartnerCard } from '../components/learn/LearnCards'
import { partners, getPartner, govPrograms, govAudiences, govFaqs } from '../content/community'
import { sectorContent } from '../content/resources'
import { getPath } from '../content/paths'
import { courses } from '../content/courses'
import { PathCard } from '../components/learn/LearnCards'
import ContactForm from '../components/forms/ContactForm'

export function PartnersPage() {
  usePageMeta({
    title: 'Partner Organizations — RGV AI Coalition',
    description: 'Cities, libraries, universities, chambers, and nonprofits partnering on AI education across South Texas.',
    path: '/community/partners',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Community' }, { label: 'Partners' }]} />
        <PageHeader
          title="Partner organizations"
          description="We collaborate with public, private, and nonprofit organizations to expand AI access across the Rio Grande Valley."
        />
        <div className="card-grid card-grid--3">
          {partners.map((p) => <PartnerCard key={p.slug} partner={p} />)}
        </div>
        <Section title="Become a partner">
          <p>Libraries, schools, chambers, workforce boards, and community organizations are welcome to partner with us.</p>
          <Button to="/about/partner">Partnership information</Button>
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function PartnerDetailPage() {
  const { slug } = useParams()
  const partner = getPartner(slug)

  usePageMeta({
    title: partner ? `${partner.name} — Partner` : 'Partner',
    description: partner?.summary || '',
    path: `/community/partners/${slug}`,
  })

  if (!partner) return <Navigate to="/community/partners" replace />

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[
          { label: 'Home', to: '/' }, { label: 'Partners', to: '/community/partners' }, { label: partner.name },
        ]} />
        <PageHeader title={partner.name} description={`${partner.type} · ${partner.city}, TX`} />
        <p>{partner.summary}</p>
        {partner.verified && <p className="partner-verified">Verified coalition partner</p>}
        <Button to="/about/partner" variant="secondary">Explore partnership</Button>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function GovernmentPage() {
  usePageMeta({
    title: 'Cities & Government — RGV AI Coalition',
    description: 'AI literacy, digital skills, cybersecurity, and workforce training for cities, counties, school districts, and public agencies.',
    path: '/community/government',
  })

  const path = getPath('public-sector-ai')

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Community' }, { label: 'Government' }]} />
        <section className="gov-hero">
          <p className="page-eyebrow">Public sector</p>
          <h1 className="page-title">AI & digital literacy for cities, counties, and public agencies</h1>
          <p className="page-description">
            Trusted training for South Texas governments, school districts, universities, libraries, and economic development organizations.
          </p>
          <div className="home-hero-ctas">
            <Button href="#request-workshop">Request a workshop</Button>
            <Button href="mailto:hello@rgvaicoalition.com?subject=Schedule%20a%20Meeting%20%E2%80%94%20RGV%20AI%20Coalition" variant="secondary">Schedule a meeting</Button>
          </div>
        </section>

        <Section title="Who we serve">
          <div className="audience-pills">
            {govAudiences.map((a) => <span key={a} className="audience-pill">{a}</span>)}
          </div>
        </Section>

        <Section title="Programs we offer">
          <div className="card-grid card-grid--2">
            {govPrograms.map((p) => (
              <article key={p.title} className="platform-card">
                <h3 className="course-card-title">{p.title}</h3>
                <p className="course-card-summary">{p.description}</p>
              </article>
            ))}
          </div>
        </Section>

        {path && (
          <Section title="Recommended learning path">
            <PathCard path={path} courseCount={path.courseSlugs.length} />
          </Section>
        )}

        <Section title="Success stories">
          <div className="card-grid card-grid--2">
            <article className="platform-card">
              <h3>McAllen Public Library community workshops</h3>
              <p>Monthly beginner sessions helped residents build confidence with AI tools and online safety.</p>
            </article>
            <article className="platform-card">
              <h3>Regional workforce AI readiness</h3>
              <p>Workforce partners integrated coalition training into job seeker services across Hidalgo and Cameron counties.</p>
            </article>
          </div>
        </Section>

        <Section title="Partnership guide">
          <p>Download our overview of programs, scheduling options, and collaboration models for public agencies.</p>
          <Button href="mailto:hello@rgvaicoalition.com?subject=Partnership%20Guide%20Request" variant="secondary">Request partnership guide</Button>
        </Section>

        <Section title="Frequently asked questions">
          <FaqList items={govFaqs} />
        </Section>

        <Section title="Request a workshop" id="request-workshop">
          <ContactForm
            subject="Government Workshop Request — RGV AI Coalition"
            fields={['name', 'email', 'organization', 'phone', 'program', 'message']}
            submitLabel="Submit workshop request"
          />
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function SectorPage({ sectorKey }) {
  const content = sectorContent[sectorKey]

  usePageMeta({
    title: content ? `${content.title} — RGV AI Coalition` : 'Community — RGV AI Coalition',
    description: content?.description || '',
    path: `/community/${sectorKey}`,
  })

  if (!content) return null

  const path = getPath(content.recommendedPath)
  const sectorCourses = courses.filter((c) => c.audiences.includes(sectorKey))

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Community' }, { label: content.title }]} />
        <PageHeader title={content.headline} description={content.description} />
        {path && (
          <Section title="Recommended path">
            <PathCard path={path} courseCount={path.courseSlugs.length} />
          </Section>
        )}
        <Section title="Related courses">
          <div className="card-grid card-grid--2">
            {sectorCourses.map((c) => (
              <Link key={c.slug} to={`/learn/courses/${c.slug}`} className="course-card">
                <h3 className="course-card-title">{c.title}</h3>
                <p className="course-card-summary">{c.summary}</p>
              </Link>
            ))}
          </div>
        </Section>
        <Section title="Request training">
          <ContactForm subject={content.cta.subject} submitLabel={content.cta.label} />
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function VolunteerPage() {
  usePageMeta({
    title: 'Volunteer — RGV AI Coalition',
    description: 'Support AI education workshops and community programs across the Rio Grande Valley.',
    path: '/community/volunteer',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Community' }, { label: 'Volunteer' }]} />
        <PageHeader
          title="Volunteer with the coalition"
          description="Help deliver workshops, support events, and expand AI access across South Texas."
        />
        <Section title="Volunteer roles">
          <ul className="objectives-list">
            <li>Workshop assistant — help attendees during hands-on sessions</li>
            <li>Event coordinator — support setup, registration, and logistics</li>
            <li>Community ambassador — share programs with local organizations</li>
            <li>Mentor-in-training — support learners in future mentor programs</li>
          </ul>
        </Section>
        <Section title="Register as a volunteer">
          <ContactForm
            subject="Volunteer Registration — RGV AI Coalition"
            fields={['name', 'email', 'organization', 'message']}
            submitLabel="Submit volunteer application"
          />
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}
