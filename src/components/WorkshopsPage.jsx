import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import {
  FORMAT_STEPS,
  HOST_WE_BRING,
  HOST_YOU_BRING,
  WORKSHOPS,
  mailtoLink,
} from '../data/workshops'

export default function WorkshopsPage() {
  usePageMeta({
    title: 'Hands-on AI Workshops — RGV AI Coalition',
    description: 'Hands-on AI workshops for clinics, small businesses, nonprofits, educators and local government in the Rio Grande Valley. Laptops out, real tasks, prompts to take home.',
    ogTitle: 'Hands-on AI Workshops — RGV AI Coalition',
    path: '/workshops',
  })

  return (
    <div className="page">
      <SiteHeader />

      <main className="dl-main">
        <section className="dl-hero">
          <div className="event-badge">Workshops</div>
          <h1 className="dl-hero-title">Laptops out. Real work. Take it home.</h1>
          <p className="dl-hero-subtitle">
            Our workshops are hands-on. You run real prompts on your own laptop, check the results,
            and leave with something you can use the next morning.
          </p>
          <div className="dl-cta-group">
            <a href="#host" className="cta-btn-primary">Host a workshop</a>
            <a href={mailtoLink('Workshop idea for RGV AI Coalition')} className="cta-btn-secondary">
              Tell us what to teach next
            </a>
          </div>
        </section>

        <section className="dl-section" aria-labelledby="format-title">
          <h2 className="dl-section-title" id="format-title">How every session runs</h2>
          <ol className="ws-steps">
            {FORMAT_STEPS.map((step, i) => (
              <li key={step.title} className="ws-step">
                <span className="ws-step-number" aria-hidden="true">{i + 1}</span>
                <h3 className="dl-card-title">{step.title}</h3>
                <p className="dl-card-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="dl-section" aria-labelledby="series-title">
          <h2 className="dl-section-title" id="series-title">Pick your audience</h2>
          <p className="dl-section-lead">
            Same format, different work. Open the ones marked ready today. The others we build
            with you when you ask for them.
          </p>
          <div className="dl-card-grid ws-grid">
            {WORKSHOPS.map(workshop => (
              <article key={workshop.id} className="dl-info-card ws-card">
                <span className={`ws-status${workshop.ready ? ' ws-status-ready' : ''}`}>
                  {workshop.ready ? 'Ready now' : 'By request'}
                </span>
                <h3 className="dl-card-title">{workshop.title}</h3>
                <p className="dl-card-body">{workshop.audience}</p>
                <ul className="ws-examples" aria-label={`Example tasks in ${workshop.title}`}>
                  {workshop.examples.map(example => <li key={example}>{example}</li>)}
                </ul>
                {workshop.ready ? (
                  <Link to={workshop.to} className="ws-link">Open the workshop →</Link>
                ) : (
                  <a href={mailtoLink(`Workshop request: ${workshop.title}`)} className="ws-link">
                    Request this workshop →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="dl-section" id="host" aria-labelledby="host-title">
          <div className="dl-highlight-card">
            <h2 className="dl-section-title" id="host-title">Host a workshop</h2>
            <p>
              Chambers, libraries, clinics, schools and nonprofits: you bring the room, we bring the session.
            </p>
            <div className="ws-host">
              <div>
                <h3 className="afh-subhead">We bring</h3>
                <ul className="ws-list">
                  {HOST_WE_BRING.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="afh-subhead">You bring</h3>
                <ul className="ws-list">
                  {HOST_YOU_BRING.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="ws-host-actions">
              <a href={mailtoLink('Host a workshop with RGV AI Coalition')} className="cta-btn-primary">
                Ask about hosting
              </a>
              <a href="/host-a-workshop.pdf" className="cta-btn-secondary" target="_blank" rel="noopener">
                Download the one-page flyer (PDF)
              </a>
            </div>
          </div>
        </section>

        <section className="dl-section" aria-labelledby="members-title">
          <div className="dl-contact-card">
            <h2 className="dl-section-title" id="members-title">Want to hear about the next one?</h2>
            <p className="dl-contact-lead">
              Join the coalition. Members get the next meeting details by email and in the member portal.
            </p>
            <Link to="/#join" className="cta-btn-primary dl-inline-cta">Join the coalition</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
