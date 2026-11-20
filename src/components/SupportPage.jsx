import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { mailtoLink } from '../data/workshops'
import { IS_REGISTERED_NONPROFIT, WAYS_TO_SUPPORT, WHERE_SUPPORT_GOES } from '../data/support'

// For sponsors, hosts and volunteers. No payments happen on this site:
// every action is an email or a link to another page.
export default function SupportPage() {
  usePageMeta({
    title: 'Support — RGV AI Coalition',
    description: 'Sponsor a workshop, host a session or teach. How to support free, hands-on AI learning in the Rio Grande Valley.',
    ogTitle: 'Support hands-on AI learning in the Valley',
    path: '/support',
  })

  return (
    <div className="page">
      <SiteHeader />

      <main className="dl-main">
        <section className="dl-hero">
          <div className="event-badge">Support</div>
          <h1 className="dl-hero-title">Help the Valley learn AI, hands-on.</h1>
          <p className="dl-hero-subtitle">
            Our meetups and workshops are free to attend. Sponsors, hosts and volunteers keep them that way.
          </p>
          <div className="dl-cta-group">
            <a href={mailtoLink('Supporting RGV AI Coalition')} className="cta-btn-primary">Talk to us</a>
            <Link to="/workshops" className="cta-btn-secondary">See the workshops</Link>
          </div>
        </section>

        <section className="dl-section" aria-labelledby="ways-title">
          <h2 className="dl-section-title" id="ways-title">Three ways to help</h2>
          <div className="dl-card-grid ws-grid">
            {WAYS_TO_SUPPORT.map(way => (
              <article key={way.title} className="dl-info-card ws-card">
                <h3 className="dl-card-title">{way.title}</h3>
                <p className="dl-card-body">{way.body}</p>
                <ul className="ws-examples" aria-label={`What you get: ${way.title}`}>
                  {way.gets.map(item => <li key={item}>{item}</li>)}
                </ul>
                {way.to ? (
                  <Link to={way.to} className="ws-link">{way.cta} →</Link>
                ) : (
                  <a href={mailtoLink(way.subject)} className="ws-link">{way.cta} →</a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="dl-section" aria-labelledby="goes-title">
          <div className="dl-mission-card">
            <h2 className="dl-section-title" id="goes-title">Where support goes</h2>
            <ul className="dl-list ws-list">
              {WHERE_SUPPORT_GOES.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className="sc-note">
              {IS_REGISTERED_NONPROFIT
                ? 'RGV AI Coalition is a registered nonprofit. Ask us for a receipt for your records.'
                : 'RGV AI Coalition is a volunteer community group and is not a registered nonprofit yet, so contributions are not tax-deductible. We do not take payments on this website.'}
            </p>
          </div>
        </section>

        <section className="dl-section" aria-labelledby="talk-title">
          <div className="dl-contact-card">
            <h2 className="dl-section-title" id="talk-title">Have another idea?</h2>
            <p className="dl-contact-lead">
              Tell us what you have in mind and we will write back.
            </p>
            <a href={mailtoLink('Supporting RGV AI Coalition')} className="cta-btn-primary dl-inline-cta">
              Email hello@rgvaicoalition.com
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
