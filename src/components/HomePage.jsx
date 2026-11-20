import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import SignupForm from './SignupForm'
import SuccessScreen from './SuccessScreen'
import HeroOrb from './HeroOrb'
import TiltCard from './TiltCard'
import NextMeetup from './NextMeetup'
import LearnTeachBoard from './LearnTeachBoard'

const PILLARS = [
  {
    title: 'Connect',
    body: 'Meet people across the Valley who are curious about AI, from first-timers to full-time builders.',
  },
  {
    title: 'Collaborate',
    body: 'Learn side by side. Members get meeting details, announcements and shared resources in the member portal.',
  },
  {
    title: 'Innovate',
    body: 'Turn what you learn into something real for your classroom, clinic, shop or city.',
  },
]

const PRINCIPLES = [
  {
    icon: 'M5 6h14M5 12h14M5 18h8',
    title: 'Plain language',
    body: 'No jargon and no hype. We explain what AI is, what it does well, and where it falls short.',
  },
  {
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
    title: 'People stay in charge',
    body: 'AI drafts. A person decides. We teach AI as a tool that works for you, never the other way around.',
  },
  {
    icon: 'M12 3 5 6v5.5c0 4.2 2.9 7.7 7 9.5 4.1-1.8 7-5.3 7-9.5V6l-7-3Z',
    title: 'Privacy first',
    body: 'We practice with sample data. Private, patient and customer information stays out of AI tools.',
  },
  {
    icon: 'm5 12.5 4.5 4.5L19 7.5',
    title: 'Check before you trust',
    body: 'AI can be confidently wrong. We build the habit of checking the facts before you rely on an answer.',
  },
]

const AUDIENCES = [
  'Students',
  'Small businesses',
  'Nonprofits',
  'Educators',
  'Local government',
  'Community members',
]

function Arrow() {
  return (
    <svg className="arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HomePage() {
  const [registrant, setRegistrant] = useState(null)
  const { hash } = useLocation()

  usePageMeta({
    title: 'RGV AI Coalition: AI the Valley can trust',
    description: "The Rio Grande Valley's AI community. Learn AI in plain language, use it responsibly, and build with it alongside your neighbors.",
    ogTitle: 'RGV AI Coalition: Connect. Collaborate. Innovate.',
    ogDescription: "The Rio Grande Valley's AI community. Learn AI in plain language, use it responsibly, and build with it alongside your neighbors.",
    path: '/',
  })

  // Arriving from another page with /#join should land on the form.
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView()
  }, [hash])

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]')
    const watcher = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          watcher.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    items.forEach(item => watcher.observe(item))
    return () => watcher.disconnect()
  }, [registrant])

  if (registrant) {
    return <SuccessScreen name={registrant.name} email={registrant.email} />
  }

  return (
    <div className="page home">
      <SiteHeader />

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="eyebrow">Rio Grande Valley, Texas</p>
            <h1 className="home-hero-title">
              AI the Valley <span className="gradient-text">can trust.</span>
            </h1>
            <p className="home-hero-lead">
              We are neighbors, business owners, educators and builders learning AI together.
              In plain language, with people in charge, right here in the RGV.
            </p>
            <div className="home-cta-row">
              <a href="#join" className="btn btn-primary">Join the coalition</a>
              <a href="#programs" className="btn btn-quiet">See what we teach <Arrow /></a>
            </div>
          </div>
          <HeroOrb />
        </section>

        <NextMeetup />

        <section className="home-section home-pillars" aria-label="What we do">
          {PILLARS.map((pillar, i) => (
            <div className="pillar" key={pillar.title} data-reveal style={{ '--delay': `${i * 90}ms` }}>
              <h2 className="pillar-title">{pillar.title}.</h2>
              <p className="pillar-body">{pillar.body}</p>
            </div>
          ))}
        </section>

        <section className="home-band" aria-labelledby="trust-title">
          <div className="home-section">
            <div className="section-head" data-reveal>
              <p className="eyebrow">Our approach</p>
              <h2 className="section-title" id="trust-title">
                Trust is earned. <span className="section-title-soft">Here is how we teach it.</span>
              </h2>
            </div>
            <div className="principle-grid">
              {PRINCIPLES.map((item, i) => (
                <div className="principle" key={item.title} data-reveal style={{ '--delay': `${i * 70}ms` }}>
                  <span className="principle-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </span>
                  <h3 className="principle-title">{item.title}</h3>
                  <p className="principle-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section" id="programs" aria-labelledby="programs-title">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Programs</p>
            <h2 className="section-title" id="programs-title">
              Start where you are. <span className="section-title-soft">Leave knowing more.</span>
            </h2>
          </div>

          <div className="program-grid">
            <div data-reveal>
              <TiltCard to="/digital-literacy" className="program program-literacy">
                <span className="program-tag">Training</span>
                <h3 className="program-title">Digital Literacy and AI Training</h3>
                <p className="program-body">
                  Practical sessions on AI basics, online safety and responsible use for the whole community.
                </p>
                <span className="program-link">Explore the program <Arrow /></span>
              </TiltCard>
            </div>
            <div data-reveal style={{ '--delay': '90ms' }}>
              <TiltCard to="/ai-for-healthcare" className="program program-health">
                <span className="program-tag">Workshop</span>
                <h3 className="program-title">AI Front Desk Automation for Healthcare</h3>
                <p className="program-body">
                  A hands-on workshop for clinics, with slides, copy-ready prompts and take-home scripts.
                </p>
                <span className="program-link">Open the workshop <Arrow /></span>
              </TiltCard>
            </div>
          </div>

          <div className="host-band" data-reveal>
            <div>
              <h3 className="host-band-title">Bring a hands-on workshop to your group.</h3>
              <p className="host-band-body">You bring the room. We bring the slides, a follow-along page and the QR codes.</p>
            </div>
            <Link to="/workshops" className="btn btn-dark">See workshops <Arrow /></Link>
          </div>

          <ul className="audience-list" aria-label="Who our programs are for" data-reveal>
            {AUDIENCES.map(name => (
              <li key={name} className="audience">{name}</li>
            ))}
          </ul>
        </section>

        <section className="home-section" id="learn" aria-labelledby="learn-title">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Learn or teach</p>
            <h2 className="section-title" id="learn-title">
              What should we cover next? <span className="section-title-soft">You tell us.</span>
            </h2>
            <p className="lt-lead">
              Tap what you want to learn and what you could teach. It takes 20 seconds and needs no account.
            </p>
          </div>
          <LearnTeachBoard />
        </section>

        <section className="home-section home-join" id="join" aria-labelledby="join-title">
          <div className="home-join-copy" data-reveal>
            <p className="eyebrow">Membership</p>
            <h2 className="section-title" id="join-title">Be part of it.</h2>
            <p className="home-join-lead">
              Joining is free. Builders, learners and the simply curious are all welcome.
            </p>
            <ul className="check-list">
              <li>A personal link to the member portal, sent by email</li>
              <li>Next meeting details as soon as they are set</li>
              <li>Announcements and shared resources in one place</li>
            </ul>
          </div>
          <div data-reveal style={{ '--delay': '90ms' }}>
            <SignupForm onSuccess={setRegistrant} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
