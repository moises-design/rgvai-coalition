import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

const CONTACT_EMAIL = 'hello@rgvaicoalition.com'

const WHO_WE_SERVE = [
  {
    title: 'Students',
    description: 'Build confidence with digital tools and AI so young people can learn, create, and compete in a changing world.',
  },
  {
    title: 'Small Businesses',
    description: 'Learn practical ways to save time, reach customers, and stay competitive without needing a tech team.',
  },
  {
    title: 'Nonprofits',
    description: 'Use modern tools to stretch limited resources, communicate better, and serve communities more effectively.',
  },
  {
    title: 'Educators',
    description: 'Bring AI literacy into classrooms and professional development with responsible, age-appropriate guidance.',
  },
  {
    title: 'Local Government',
    description: 'Support residents and staff with training that improves access, transparency, and public service delivery.',
  },
  {
    title: 'Community Members',
    description: 'Help neighbors of all ages feel safer, more connected, and more capable online.',
  },
]

const PROGRAMS = [
  {
    title: 'AI for Beginners',
    description: 'A friendly introduction to what AI is, how it works, and how to start using it in everyday life.',
  },
  {
    title: 'AI for Small Businesses',
    description: 'Hands-on sessions on marketing, operations, customer service, and productivity tools that fit real budgets.',
  },
  {
    title: 'AI for Nonprofits',
    description: 'Training focused on grant writing, outreach, volunteer coordination, and mission-driven workflows.',
  },
  {
    title: 'Digital Safety & Cybersecurity Basics',
    description: 'Protect passwords, spot scams, avoid phishing, and build safer habits for individuals and organizations.',
  },
  {
    title: 'Responsible AI Use',
    description: 'Understand bias, privacy, accuracy, and ethical decision-making when using AI at work or in the community.',
  },
  {
    title: 'Prompt Engineering for Everyday Work',
    description: 'Learn how to ask better questions, get useful outputs, and apply AI to real tasks with confidence.',
  },
  {
    title: 'AI Tools for Students and Educators',
    description: 'Explore study support, lesson planning, and classroom applications with clear guardrails.',
  },
  {
    title: 'Workforce Readiness with AI',
    description: 'Prepare job seekers and employees for roles that increasingly expect digital and AI fluency.',
  },
]

function mailtoLink(subject) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

export default function DigitalLiteracyPage() {
  usePageMeta({
    title: 'Digital Literacy & AI Access — RGV AI Coalition',
    description:
      'RGV AI Coalition helps Rio Grande Valley residents, nonprofits, small businesses, educators, and local leaders build digital and AI skills through workshops, training, and community partnerships.',
    ogTitle: 'Digital Literacy & AI Access — RGV AI Coalition',
    ogDescription:
      'Workshops, training, and partnerships to help the Rio Grande Valley build digital and AI skills for students, businesses, nonprofits, educators, and community organizations.',
    path: '/digital-literacy',
  })

  return (
    <div className="page">
      <SiteHeader />

      <main className="dl-main">
        <section className="dl-hero">
          <div className="event-badge">Community Impact</div>
          <h1 className="dl-hero-title">
            Helping the Rio Grande Valley build digital and AI skills
          </h1>
          <p className="dl-hero-subtitle">
            RGV AI Coalition helps residents, nonprofits, small businesses, educators, and local leaders
            understand and use modern digital tools responsibly.
          </p>
          <div className="dl-cta-group">
            <a href="#partnership" className="cta-btn-primary">
              Partner With Us
            </a>
            <a href={mailtoLink('Workshop Request — RGV AI Coalition')} className="cta-btn-secondary">
              Request a Workshop
            </a>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Our Mission</h2>
          <div className="dl-mission-card">
            <p>
              Digital literacy today includes knowing how to navigate the internet, protect your information,
              communicate online, and use the tools that shape work, education, and civic life. AI literacy is
              now a core part of that foundation.
            </p>
            <p>
              RGV AI Coalition exists to expand access, deliver practical education, and help people build
              real skills they can use immediately. We focus on responsible use, community trust, and closing
              the digital divide so the Rio Grande Valley is not left behind as technology changes.
            </p>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Who We Serve</h2>
          <p className="dl-section-lead">
            We design workshops and training for the people and organizations that keep our region moving forward.
          </p>
          <div className="dl-card-grid">
            {WHO_WE_SERVE.map(({ title, description }) => (
              <article key={title} className="dl-info-card">
                <h3 className="dl-card-title">{title}</h3>
                <p className="dl-card-body">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Programs We Can Offer</h2>
          <p className="dl-section-lead">
            Sessions can be tailored for beginners, professionals, classrooms, and community groups.
          </p>
          <div className="dl-card-grid dl-card-grid-programs">
            {PROGRAMS.map(({ title, description }) => (
              <article key={title} className="dl-info-card">
                <h3 className="dl-card-title">{title}</h3>
                <p className="dl-card-body">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dl-section" id="partnership">
          <div className="dl-highlight-card">
            <h2 className="dl-section-title">Partnership Opportunity</h2>
            <p>
              RGV AI Coalition is open to partnering with cities, schools, chambers, nonprofits, libraries,
              and community organizations to host workshops, training days, and digital literacy events.
            </p>
            <p>
              Whether you need a one-time community session or an ongoing program, we can work with you to
              design something practical, accessible, and aligned with your audience.
            </p>
            <a href={mailtoLink('Partnership Inquiry — RGV AI Coalition')} className="cta-btn-primary dl-inline-cta">
              Start a Partnership Conversation
            </a>
          </div>
        </section>

        <section className="dl-section" id="contact">
          <div className="dl-contact-card">
            <h2 className="dl-section-title">Get in Touch</h2>
            <p className="dl-contact-lead">
              Interested in partnering with RGV AI Coalition?
            </p>
            <p className="dl-contact-name">Moises Segovia</p>
            <p className="dl-contact-role">Founder, RGV AI Coalition</p>
            <a href={mailtoLink('RGV AI Coalition — Digital Literacy Inquiry')} className="cta-btn-primary dl-inline-cta">
              Contact Us
            </a>
            <p className="dl-contact-email">
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
