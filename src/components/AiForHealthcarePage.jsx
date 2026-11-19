import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import FrontDeskReviewForm from './FrontDeskReviewForm'
import { ClinicContext } from './clinicContext'
import {
  BOOK_SLIDE,
  CLINIC_FIELDS,
  DECK_PDF,
  FORM_DEMO,
  FORM_SLIDE,
  FRONT_DESK_SCRIPTS,
  JUMP_LINKS,
  LAPTOPS_SLIDE,
  PROMPTS,
  REMINDER_NOTE,
  REMINDER_TEXTS,
  RICH_CONTACT,
  SLIDES,
  fillTemplate,
} from '../data/aiForHealthcare'

const TOTAL = SLIDES.length

// #laptops and #slide-12 both open the "Laptops out" slide; other hashes
// (#prompts, #book) are ordinary in-page anchors.
function slideFromHash(hash) {
  if (hash === '#laptops') return LAPTOPS_SLIDE
  const match = /^#slide-(\d+)$/.exec(hash)
  if (!match) return null
  const n = Number(match[1])
  return n >= 1 && n <= TOTAL ? n : null
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers and non-secure contexts: fall back to a hidden textarea.
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      document.body.removeChild(el)
    }
  }
}

const STORAGE_KEY = 'afh-clinic'
const EMPTY_CLINIC = { clinic: '', city: '', phone: '', hours: '' }

function loadClinic() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return Object.fromEntries(
      Object.keys(EMPTY_CLINIC).map(key => [key, typeof saved[key] === 'string' ? saved[key] : '']),
    )
  } catch {
    return EMPTY_CLINIC
  }
}

function saveClinic(clinic) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clinic))
  } catch {
    // Private windows can block storage; the details then last until reload.
  }
}

// A weekday about three weeks out, so the sample 7-day reminder is in the future.
function sampleAppointmentDate() {
  const date = new Date()
  date.setDate(date.getDate() + 21)
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function ClinicBox({ idPrefix }) {
  const { clinic, setField, clear } = useContext(ClinicContext)
  const hasAny = Object.values(clinic).some(value => value.trim())

  return (
    <div className="afh-clinic">
      <div className="afh-clinic-head">
        <h3 className="afh-clinic-title">Your clinic</h3>
        {hasAny && (
          <button type="button" className="afh-clinic-clear" onClick={clear}>
            Back to sample details
          </button>
        )}
      </div>
      <p className="afh-clinic-lead">
        Every prompt runs as pasted with a sample clinic. Type your details here and they replace the
        sample in all four prompts and the take-home scripts. Clinic details only, never patient
        information. They stay in this browser and are not sent anywhere.
      </p>
      <div className="afh-clinic-fields">
        {CLINIC_FIELDS.map(field => (
          <div className="field-group" key={field.key}>
            <label className="field-label" htmlFor={`${idPrefix}-${field.key}`}>{field.label}</label>
            <input
              id={`${idPrefix}-${field.key}`} type={field.type || 'text'} maxLength={120}
              className="field-input" autoComplete={field.autoComplete}
              value={clinic[field.key]} onChange={e => setField(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CopyBlock({ title, text: template, note, large, mode = 'bracket' }) {
  const { clinic, sampleDate } = useContext(ClinicContext)
  const segments = fillTemplate(template, clinic, mode, sampleDate)
  const text = segments.map(segment => segment.text).join('')
  const [status, setStatus] = useState('idle')

  async function handleCopy() {
    const ok = await copyText(text)
    setStatus(ok ? 'copied' : 'failed')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <article className={`afh-copy${large ? ' afh-copy-large' : ''}`}>
      <div className="afh-copy-head">
        <h3 className="afh-copy-title">{title}</h3>
        <button type="button" className="afh-copy-btn" onClick={handleCopy}>
          {status === 'copied' ? 'Copied' : status === 'failed' ? 'Select and copy' : 'Copy'}
        </button>
      </div>
      <p className="afh-copy-text">
        {segments.map((segment, i) => (
          segment.kind === 'text'
            ? segment.text
            : <span key={i} className={`afh-fill afh-fill-${segment.kind}`}>{segment.text}</span>
        ))}
      </p>
      {note && <p className="afh-copy-note">{note}</p>}
      <span className="afh-sr-only" role="status">
        {status === 'copied' ? `${title} copied to clipboard` : ''}
      </span>
    </article>
  )
}

function PromptCard({ prompt }) {
  return (
    <div className="afh-prompt" id={prompt.id}>
      <p className="afh-prompt-lead">{prompt.lead}</p>
      <CopyBlock title={prompt.title} text={prompt.text} large mode="sample" />
      <p className="afh-prompt-step"><strong>Check it:</strong> {prompt.check}</p>
      <p className="afh-prompt-step"><strong>Try next:</strong> {prompt.next}</p>
    </div>
  )
}

// The "one more thing" demo: a prompt that drafts a staff survey, the steps to
// turn it into a Google Form, and the patient-information warning.
function FormDemo({ headingId }) {
  return (
    <div className="afh-prompt">
      <p className="afh-prompt-lead">{FORM_DEMO.lead}</p>
      <CopyBlock title={FORM_DEMO.title} text={FORM_DEMO.text} large mode="sample" />
      <ol className="afh-steps" aria-labelledby={headingId}>
        {FORM_DEMO.steps.map(step => (
          <li key={step.title}>
            <strong>{step.title}.</strong> {step.body}
          </li>
        ))}
      </ol>
      <p className="afh-caution">{FORM_DEMO.note}</p>
    </div>
  )
}

// One line under each prompt slide saying whose details the prompt is using.
function ClinicStatus() {
  const { clinic } = useContext(ClinicContext)
  const hasAny = Object.values(clinic).some(value => value.trim())
  return (
    <p className="afh-clinic-status">
      {hasAny ? 'Using your clinic details where you filled them in. ' : 'Using a sample clinic. '}
      <a href="#your-clinic">{hasAny ? 'Change them' : 'Use your own clinic'}</a>
    </p>
  )
}

// What the viewer shows under the current slide, so attendees can copy the
// text that is on screen without scrolling.
function SlideCompanion({ slide }) {
  const prompt = PROMPTS.find(p => p.slide === slide)
  if (prompt) {
    return (
      <div className="afh-companion">
        <PromptCard prompt={prompt} />
        <ClinicStatus />
      </div>
    )
  }

  const reminders = REMINDER_TEXTS.filter(item => item.slide === slide)
  const scripts = FRONT_DESK_SCRIPTS.filter(item => item.slide === slide)
  const items = [...reminders, ...scripts]
  if (items.length > 0) {
    return (
      <div className="afh-companion">
        <p className="afh-companion-label">Copy from this slide</p>
        <div className="afh-copy-grid">
          {items.map(item => <CopyBlock key={item.id} {...item} />)}
        </div>
      </div>
    )
  }

  if (slide === LAPTOPS_SLIDE) {
    return (
      <div className="afh-companion">
        <p className="afh-companion-note">
          The next four slides are prompts. Each one has a Copy button right here under the slide,
          and runs as pasted with a sample clinic.
        </p>
        <ClinicBox idPrefix="clinic-slide" />
      </div>
    )
  }

  if (slide === FORM_SLIDE) {
    return (
      <div className="afh-companion">
        <FormDemo />
        <ClinicStatus />
      </div>
    )
  }

  if (slide === BOOK_SLIDE) {
    return (
      <div className="afh-companion afh-companion-row">
        <p>Ready to map your first pilot workflow?</p>
        <a href="#book" className="cta-btn-primary">Book your front desk review</a>
      </div>
    )
  }

  return null
}

export default function AiForHealthcarePage() {
  usePageMeta({
    title: 'AI Front Desk Automation for Healthcare — RGV AI Coalition',
    description:
      'Follow along with the AI Front Desk Automation for Healthcare workshop: the slides, four hands-on prompts ready to copy, and take-home front desk scripts.',
    ogTitle: 'AI Front Desk Automation for Healthcare — RGV AI Coalition',
    ogDescription:
      'Workshop slides, hands-on prompts ready to copy, and take-home front desk scripts for healthcare teams in the Rio Grande Valley.',
    path: '/ai-for-healthcare',
  })

  const [slide, setSlide] = useState(() => slideFromHash(window.location.hash) || 1)
  const [clinic, setClinic] = useState(loadClinic)
  const [sampleDate] = useState(sampleAppointmentDate)

  const clinicContext = useMemo(() => ({
    clinic,
    sampleDate,
    setField(key, value) {
      setClinic(prev => {
        const next = { ...prev, [key]: value }
        saveClinic(next)
        return next
      })
    },
    clear() {
      setClinic(EMPTY_CLINIC)
      saveClinic(EMPTY_CLINIC)
    },
  }), [clinic, sampleDate])

  const goTo = useCallback((n) => {
    const next = Math.min(TOTAL, Math.max(1, n))
    setSlide(next)
    window.history.replaceState(null, '', `#slide-${next}`)
  }, [])

  // Keep the viewer in sync when the hash changes (back button, typed links).
  useEffect(() => {
    function onHashChange() {
      const n = slideFromHash(window.location.hash)
      if (n) setSlide(n)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // The page renders after the browser has already tried to scroll to the
  // hash, so do it once here for links like /ai-for-healthcare#book.
  useEffect(() => {
    const { hash } = window.location
    if (!hash) return
    const target = slideFromHash(hash)
      ? document.getElementById('slides')
      : document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
  }, [])

  // Arrow keys move through the deck unless the visitor is typing in the form.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight') goTo(slide + 1)
      if (e.key === 'ArrowLeft') goTo(slide - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [slide, goTo])

  const current = SLIDES[slide - 1]
  const upcoming = SLIDES[slide]
  const hasContact = Boolean(RICH_CONTACT.email || RICH_CONTACT.phone)

  return (
    <ClinicContext.Provider value={clinicContext}>
    <div className="page afh-page">
      <SiteHeader />

      <main className="dl-main afh-main">
        <section className="afh-hero">
          <div className="event-badge">Workshop</div>
          <h1 className="dl-hero-title afh-hero-title">AI Front Desk Automation for Healthcare</h1>
          <p className="dl-hero-subtitle afh-hero-subtitle">
            Follow along with the slides. When we say laptops out, every prompt is here with a Copy button.
          </p>
        </section>

        <section className="afh-viewer" id="slides" aria-label="Workshop slides">
          <div className="afh-stage">
            <img
              key={current.src}
              src={current.src}
              alt={`Slide ${current.number}: ${current.title}`}
              width="1600"
              height="900"
            />
          </div>

          <div className="afh-controls">
            <button
              type="button" className="afh-nav-btn"
              onClick={() => goTo(slide - 1)} disabled={slide === 1}
            >
              <span aria-hidden="true">←</span> Back
            </button>
            <p className="afh-counter" aria-live="polite">
              Slide {slide} of {TOTAL}
            </p>
            <button
              type="button" className="afh-nav-btn afh-nav-btn-next"
              onClick={() => goTo(slide + 1)} disabled={slide === TOTAL}
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </div>

          <nav className="afh-jump" aria-label="Jump to a slide">
            {JUMP_LINKS.map(link => (
              <button
                key={link.slide} type="button"
                className={`afh-chip${slide === link.slide ? ' active' : ''}`}
                aria-current={slide === link.slide ? 'true' : undefined}
                onClick={() => goTo(link.slide)}
              >
                {link.label}
              </button>
            ))}
            <a className="afh-chip afh-chip-link" href={DECK_PDF} download>
              Download PDF
            </a>
          </nav>

          <SlideCompanion key={slide} slide={slide} />

          {upcoming && <link rel="preload" as="image" href={upcoming.src} />}
        </section>

        <section className="dl-section" id="prompts">
          <h2 className="dl-section-title">Hands-on prompts</h2>
          <p className="dl-section-lead">
            Use the AI tool your office has approved, and sample data only. Never type in real patient
            information. Run each prompt, then check one fact before you trust the answer.
          </p>
          <div id="your-clinic" className="afh-clinic-anchor">
            <ClinicBox idPrefix="clinic-main" />
          </div>
          <div className="afh-prompt-list">
            {PROMPTS.map(prompt => <PromptCard key={prompt.id} prompt={prompt} />)}
          </div>
        </section>

        <section className="dl-section" id={FORM_DEMO.id}>
          <h2 className="dl-section-title" id="survey-form-title">One more thing: let AI build your survey form</h2>
          <FormDemo headingId="survey-form-title" />
        </section>

        <section className="dl-section" id="scripts">
          <h2 className="dl-section-title">Take-home scripts</h2>

          <h3 className="afh-subhead">The three-text reminder sequence</h3>
          <div className="afh-copy-grid afh-copy-grid-3">
            {REMINDER_TEXTS.map(item => <CopyBlock key={item.id} {...item} />)}
          </div>
          <p className="afh-footnote">{REMINDER_NOTE}</p>

          <h3 className="afh-subhead">Words your front desk can use verbatim</h3>
          <div className="afh-copy-grid">
            {FRONT_DESK_SCRIPTS.map(item => <CopyBlock key={item.id} {...item} />)}
          </div>
        </section>

        <section className="dl-section" id="book">
          <div className="dl-highlight-card afh-book">
            <div className="afh-book-intro">
              <h2 className="dl-section-title">Book your front desk review</h2>
              <p>
                Every call answered. Every appointment reminded. Every follow-up done. Book a short
                front desk review and we will map your first pilot workflow together.
              </p>
              <div className="afh-contact">
                <p className="afh-contact-label">Your contact</p>
                <p className="dl-contact-name">{RICH_CONTACT.name}</p>
                {hasContact && (
                  <ul className="afh-contact-list">
                    {RICH_CONTACT.email && (
                      <li><a href={`mailto:${RICH_CONTACT.email}`}>{RICH_CONTACT.email}</a></li>
                    )}
                    {RICH_CONTACT.phone && (
                      <li><a href={`tel:${RICH_CONTACT.phone.replace(/[^\d+]/g, '')}`}>{RICH_CONTACT.phone}</a></li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            <FrontDeskReviewForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
    </ClinicContext.Provider>
  )
}
