import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppShell, { PageLayout, PageHeader, Breadcrumb, Section } from '../components/layout/PlatformLayout'
import { Button, StatGrid } from '../components/ui/PlatformUI'
import { impactStats } from '../content/community'
import { sponsors } from '../content/resources'
import ContactForm from '../components/forms/ContactForm'

export function AboutPage() {
  usePageMeta({
    title: 'About — RGV AI Coalition',
    description: 'South Texas AI education and workforce development — mission, impact, and leadership.',
    path: '/about',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <PageHeader
          eyebrow="Our mission"
          title="The AI learning hub for South Texas"
          description="RGV AI Coalition expands access to AI and digital literacy through education, partnerships, and community programs."
        />
        <Section title="What we do">
          <p>
            We help residents, students, job seekers, small businesses, nonprofits, educators, and public agencies
            understand and use modern digital tools responsibly. Our platform combines structured learning paths,
            workshops, and curated resources — with links to official training from leading providers.
          </p>
        </Section>
        <Section title="Regional impact">
          <StatGrid stats={impactStats} />
        </Section>
        <Section title="Leadership">
          <div className="platform-card">
            <h3 className="course-card-title">Moises Segovia</h3>
            <p className="course-card-summary">Founder, RGV AI Coalition</p>
            <p>Moises leads the coalition&apos;s work to close the digital divide and build AI-ready communities across the Rio Grande Valley.</p>
          </div>
        </Section>
        <Button to="/about/contact">Contact us</Button>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function SponsorsPage() {
  usePageMeta({
    title: 'Sponsors — RGV AI Coalition',
    description: 'Organizations investing in AI education and digital equity across South Texas.',
    path: '/about/sponsors',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }, { label: 'Sponsors' }]} />
        <PageHeader title="Sponsors" description="Thank you to the organizations making regional AI education possible." />
        <div className="card-grid card-grid--2">
          {sponsors.map((s) => (
            <article key={s.name} className="platform-card">
              <p className="news-meta">{s.tier} sponsor</p>
              <h3 className="course-card-title">{s.name}</h3>
              <p>{s.description}</p>
            </article>
          ))}
        </div>
        <Section title="Become a sponsor">
          <p>Support workshops, educator training, and community access programs across the Rio Grande Valley.</p>
          <Button to="/about/partner">Partnership opportunities</Button>
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function PartnerWithUsPage() {
  usePageMeta({
    title: 'Become a Partner — RGV AI Coalition',
    description: 'Partner with the Rio Grande Valley AI education platform — cities, schools, libraries, chambers, and sponsors.',
    path: '/about/partner',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }, { label: 'Become a partner' }]} />
        <PageHeader
          title="Become a partner"
          description="Join cities, universities, libraries, chambers, nonprofits, and sponsors building South Texas's AI future."
        />
        <Section title="Partnership opportunities">
          <ul className="objectives-list">
            <li>Host workshops and training days at your venue</li>
            <li>Co-develop programs for your workforce or community</li>
            <li>Sponsor free access for residents and students</li>
            <li>Connect your organization to regional AI education networks</li>
          </ul>
        </Section>
        <Section title="Start a conversation">
          <ContactForm
            subject="Partnership Inquiry — RGV AI Coalition"
            fields={['name', 'email', 'organization', 'phone', 'message']}
            submitLabel="Submit partnership inquiry"
          />
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function ContactPage() {
  usePageMeta({
    title: 'Contact — RGV AI Coalition',
    description: 'Contact RGV AI Coalition for partnerships, workshops, and general inquiries.',
    path: '/about/contact',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }, { label: 'Contact' }]} />
        <PageHeader title="Contact us" description="We respond to most inquiries within three business days." />
        <div className="contact-grid">
          <div>
            <h2 className="section-title">Moises Segovia</h2>
            <p>Founder, RGV AI Coalition</p>
            <p><a href="mailto:hello@rgvaicoalition.com">hello@rgvaicoalition.com</a></p>
            <p>Edinburg, Texas</p>
          </div>
          <ContactForm subject="General Inquiry — RGV AI Coalition" />
        </div>
        <Section title="Accessibility">
          <p>We are committed to WCAG 2.1 AA accessibility. To request accommodations for workshops or report a barrier on this site, contact us at hello@rgvaicoalition.com.</p>
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}
