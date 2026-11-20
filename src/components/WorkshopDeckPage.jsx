import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { WorkshopDetailsContext } from './workshopDetailsContext'

// A workshop page driven entirely by a `workshop` object and a `fill`
// function (see src/data/aiForSmallBusiness.js): slide viewer, a details box
// that personalizes the prompts, the prompts with Copy buttons, and the
// survey-form demo. /ai-for-healthcare predates this component and has its
// own page; new workshops should use this one.

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

function loadDetails(details) {
  const empty = Object.fromEntries(details.fields.map(field => [field.key, '']))
  try {
    const saved = JSON.parse(window.localStorage.getItem(details.storageKey) || '{}')
    return Object.fromEntries(Object.keys(empty).map(key => [key, typeof saved[key] === 'string' ? saved[key] : '']))
  } catch {
    return empty
  }
}

function saveDetails(details, values) {
  try {
    window.localStorage.setItem(details.storageKey, JSON.stringify(values))
  } catch {
    // Private windows can block storage; the details then last until reload.
  }
}

function DetailsBox({ details, idPrefix }) {
  const { values, setField, clear } = useContext(WorkshopDetailsContext)
  const hasAny = Object.values(values).some(value => value.trim())

  return (
    <div className="afh-clinic">
      <div className="afh-clinic-head">
        <h3 className="afh-clinic-title">{details.title}</h3>
        {hasAny && (
          <button type="button" className="afh-clinic-clear" onClick={clear}>
            Back to sample details
          </button>
        )}
      </div>
      <p className="afh-clinic-lead">{details.lead}</p>
      <div className="afh-clinic-fields">
        {details.fields.map(field => (
          <div className="field-group" key={field.key}>
            <label className="field-label" htmlFor={`${idPrefix}-${field.key}`}>{field.label}</label>
            <input
              id={`${idPrefix}-${field.key}`} type={field.type || 'text'} maxLength={120}
              className="field-input" autoComplete={field.autoComplete}
              value={values[field.key]} onChange={e => setField(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CopyBlock({ title, text: template }) {
  const { fill } = useContext(WorkshopDetailsContext)
  const segments = fill(template)
  const text = segments.map(segment => segment.text).join('')
  const [status, setStatus] = useState('idle')

  async function handleCopy() {
    const ok = await copyText(text)
    setStatus(ok ? 'copied' : 'failed')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <article className="afh-copy afh-copy-large">
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
      <CopyBlock title={prompt.title} text={prompt.text} />
      <p className="afh-prompt-step"><strong>Check it:</strong> {prompt.check}</p>
      <p className="afh-prompt-step"><strong>Try next:</strong> {prompt.next}</p>
    </div>
  )
}

function FormDemo({ demo, headingId }) {
  return (
    <div className="afh-prompt">
      <p className="afh-prompt-lead">{demo.lead}</p>
      <CopyBlock title={demo.title} text={demo.text} />
      <ol className="afh-steps" aria-labelledby={headingId}>
        {demo.steps.map(step => (
          <li key={step.title}><strong>{step.title}.</strong> {step.body}</li>
        ))}
      </ol>
      <p className="afh-caution">{demo.note}</p>
    </div>
  )
}

function DetailsStatus({ details }) {
  const { values } = useContext(WorkshopDetailsContext)
  const hasAny = Object.values(values).some(value => value.trim())
  return (
    <p className="afh-clinic-status">
      {hasAny ? 'Using your details where you filled them in. ' : `Using a sample: ${details.sample[details.fields[0].key]}. `}
      <a href="#your-details">{hasAny ? 'Change them' : 'Use your own'}</a>
    </p>
  )
}

// What shows under the current slide, so attendees can copy what is on screen.
function SlideCompanion({ workshop, slide }) {
  const prompt = workshop.prompts.find(p => p.slide === slide)
  if (prompt) {
    return (
      <div className="afh-companion">
        <PromptCard prompt={prompt} />
        <DetailsStatus details={workshop.details} />
      </div>
    )
  }
  if (slide === workshop.laptopsSlide) {
    return (
      <div className="afh-companion">
        <p className="afh-companion-note">
          The next {workshop.prompts.length} slides are prompts. Each one has a Copy button right here
          under the slide, and runs as pasted with a sample.
        </p>
        <DetailsBox details={workshop.details} idPrefix="details-slide" />
      </div>
    )
  }
  if (slide === workshop.formSlide) {
    return (
      <div className="afh-companion">
        <FormDemo demo={workshop.formDemo} />
        <DetailsStatus details={workshop.details} />
      </div>
    )
  }
  if (slide === workshop.closeSlide) {
    return (
      <div className="afh-companion afh-companion-row">
        <p>{workshop.closing.title}</p>
        <Link to="/workshops#host" className="cta-btn-primary">Host a workshop</Link>
      </div>
    )
  }
  return null
}

export default function WorkshopDeckPage({ workshop, fill }) {
  const total = workshop.slides.length

  // #laptops opens the "Laptops out" slide whatever its number (it is what the
  // printed QR code uses); #slide-N opens slide N; other hashes are anchors.
  const slideFromHash = useCallback((hash) => {
    if (hash === '#laptops') return workshop.laptopsSlide
    const match = /^#slide-(\d+)$/.exec(hash)
    if (!match) return null
    const n = Number(match[1])
    return n >= 1 && n <= total ? n : null
  }, [workshop, total])

  const [slide, setSlide] = useState(() => slideFromHash(window.location.hash) || 1)
  const [values, setValues] = useState(() => loadDetails(workshop.details))

  const context = useMemo(() => ({
    values,
    fill: template => fill(template, values),
    setField(key, value) {
      setValues(prev => {
        const next = { ...prev, [key]: value }
        saveDetails(workshop.details, next)
        return next
      })
    },
    clear() {
      const empty = Object.fromEntries(workshop.details.fields.map(field => [field.key, '']))
      setValues(empty)
      saveDetails(workshop.details, empty)
    },
  }), [values, fill, workshop])

  const goTo = useCallback((n) => {
    const next = Math.min(total, Math.max(1, n))
    setSlide(next)
    window.history.replaceState(null, '', `#slide-${next}`)
  }, [total])

  useEffect(() => {
    function onHashChange() {
      const n = slideFromHash(window.location.hash)
      if (n) setSlide(n)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [slideFromHash])

  // The page renders after the browser already tried to scroll to the hash.
  useEffect(() => {
    const { hash } = window.location
    if (!hash) return
    const target = slideFromHash(hash) ? document.getElementById('slides') : document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
  }, [slideFromHash])

  // Arrow keys move through the deck unless the visitor is typing.
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

  const current = workshop.slides[slide - 1]
  const upcoming = workshop.slides[slide]

  return (
    <WorkshopDetailsContext.Provider value={context}>
      <div className="page afh-page">
        <SiteHeader />

        <main className="dl-main afh-main">
          <section className="afh-hero">
            <div className="event-badge">{workshop.badge}</div>
            <h1 className="dl-hero-title afh-hero-title">{workshop.title}</h1>
            <p className="dl-hero-subtitle afh-hero-subtitle">{workshop.subtitle}</p>
          </section>

          <section className="afh-viewer" id="slides" aria-label="Workshop slides">
            <div className="afh-stage">
              <img key={current.src} src={current.src} alt={`Slide ${current.number}: ${current.title}`} width="1600" height="900" />
            </div>

            <div className="afh-controls">
              <button type="button" className="afh-nav-btn" onClick={() => goTo(slide - 1)} disabled={slide === 1}>
                <span aria-hidden="true">←</span> Back
              </button>
              <p className="afh-counter" aria-live="polite">Slide {slide} of {total}</p>
              <button type="button" className="afh-nav-btn afh-nav-btn-next" onClick={() => goTo(slide + 1)} disabled={slide === total}>
                Next <span aria-hidden="true">→</span>
              </button>
            </div>

            <nav className="afh-jump" aria-label="Jump to a slide">
              {workshop.jumpLinks.map(link => (
                <button
                  key={link.slide} type="button"
                  className={`afh-chip${slide === link.slide ? ' active' : ''}`}
                  aria-current={slide === link.slide ? 'true' : undefined}
                  onClick={() => goTo(link.slide)}
                >
                  {link.label}
                </button>
              ))}
              <a className="afh-chip afh-chip-link" href={workshop.pdf} download>Download PDF</a>
            </nav>

            <SlideCompanion key={slide} workshop={workshop} slide={slide} />
            {upcoming && <link rel="preload" as="image" href={upcoming.src} />}
          </section>

          <section className="dl-section" id="prompts">
            <h2 className="dl-section-title">Hands-on prompts</h2>
            <p className="dl-section-lead">{workshop.promptsLead}</p>
            <div id="your-details" className="afh-clinic-anchor">
              <DetailsBox details={workshop.details} idPrefix="details-main" />
            </div>
            <div className="afh-prompt-list">
              {workshop.prompts.map(prompt => <PromptCard key={prompt.id} prompt={prompt} />)}
            </div>
          </section>

          <section className="dl-section" id={workshop.formDemo.id}>
            <h2 className="dl-section-title" id="form-demo-title">One more thing: let AI build your survey form</h2>
            <FormDemo demo={workshop.formDemo} headingId="form-demo-title" />
          </section>

          <section className="dl-section" id="host">
            <div className="dl-highlight-card">
              <h2 className="dl-section-title">{workshop.closing.title}</h2>
              <p>{workshop.closing.body}</p>
              <div className="dl-cta-group" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                <Link to="/workshops#host" className="cta-btn-primary">Host a workshop</Link>
                <Link to="/#join" className="cta-btn-secondary">Join the coalition</Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </WorkshopDetailsContext.Provider>
  )
}
