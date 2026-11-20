import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TOPICS, TOPIC_IDS } from '../data/topics'

const STORE = 'rgvai-learn-teach'

// A random id kept in this browser, so a person can change their answers
// later without an account. It is never tied to a name unless they add one.
function browserId() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}')
    if (saved.id) return saved.id
    const id = crypto.randomUUID()
    localStorage.setItem(STORE, JSON.stringify({ ...saved, id }))
    return id
  } catch {
    return crypto.randomUUID()
  }
}

function savedPicks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}')
    const known = list => (Array.isArray(list) ? list : []).filter(id => TOPIC_IDS.includes(id))
    return { learn: known(saved.learn), teach: known(saved.teach) }
  } catch {
    return { learn: [], teach: [] }
  }
}

// What people have asked for so far. Renders nothing until the server says
// enough people have answered.
export function InterestResults({ refreshKey = 0 }) {
  const [results, setResults] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/api/interest')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (active && data?.ready) setResults(data) })
      .catch(() => {})
    return () => { active = false }
  }, [refreshKey])

  if (!results) return null
  const top = results.topics
    .filter(topic => topic.learn > 0)
    .sort((a, b) => b.learn - a.learn)
    .slice(0, 5)
  if (!top.length) return null
  const most = top[0].learn

  return (
    <div className="lt-results" aria-labelledby="lt-results-title">
      <p className="eyebrow">So far</p>
      <h3 className="lt-results-title" id="lt-results-title">What the Valley wants to learn</h3>
      <ol className="lt-results-list">
        {top.map(topic => (
          <li key={topic.id} className="lt-result">
            <span className="lt-result-label">{TOPICS.find(t => t.id === topic.id)?.label}</span>
            <span className="lt-result-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((topic.learn / most) * 100)}%` }} />
            </span>
            <span className="lt-result-count">{topic.learn}</span>
          </li>
        ))}
      </ol>
      <p className="lt-results-note">
        From {results.people} {results.people === 1 ? 'person' : 'people'} who answered. Counts update as answers come in.
      </p>
    </div>
  )
}

// The no-login board: tap what you want to learn and what you could teach.
// `source` records where the answer came from ("web", "qr" or "email").
// `closedNote` is shown instead of nothing when the board is not open yet.
export default function LearnTeachBoard({ source = 'web', closedNote = null }) {
  const [params] = useSearchParams()
  const linkEmail = params.get('e') || ''
  const linkToken = params.get('t') || ''
  const fromEmail = Boolean(linkEmail && linkToken)

  const [picks, setPicks] = useState(() => {
    const start = savedPicks()
    const topic = params.get('topic')
    if (TOPIC_IDS.includes(topic) && !start.learn.includes(topic)) start.learn.push(topic)
    return start
  })
  const [teachNote, setTeachNote] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | working | done | error
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Hide the board if its database table is not there yet.
  useEffect(() => {
    let active = true
    fetch('/api/interest')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (active && data && data.open === false) setOpen(false) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  function toggle(kind, id) {
    setState('idle')
    setPicks(prev => {
      const list = prev[kind].includes(id) ? prev[kind].filter(x => x !== id) : [...prev[kind], id]
      return { ...prev, [kind]: list }
    })
  }

  async function submit(e) {
    e.preventDefault()
    if (!picks.learn.length && !picks.teach.length && !suggestion.trim()) {
      setMessage('Pick at least one topic first.')
      setState('error')
      return
    }
    setState('working')
    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter: browserId(),
          learn: picks.learn,
          teach: picks.teach,
          teachNote,
          suggestion,
          email,
          e: linkEmail,
          t: linkToken,
          source: fromEmail ? 'email' : source,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || 'Something went wrong. Please try again.')
        setState('error')
        return
      }
      try {
        const saved = JSON.parse(localStorage.getItem(STORE) || '{}')
        localStorage.setItem(STORE, JSON.stringify({ ...saved, learn: picks.learn, teach: picks.teach }))
      } catch { /* answers are saved on the server either way */ }
      setState('done')
      setRefreshKey(key => key + 1)
    } catch {
      setMessage('Something went wrong. Please try again.')
      setState('error')
    }
  }

  if (!open) return closedNote

  const teaching = picks.teach.length > 0
  const picked = picks.learn.length + picks.teach.length

  return (
    <div className="lt-board">
      <form className="lt-card" onSubmit={submit} noValidate>
        <ul className="lt-topics">
          {TOPICS.map(topic => {
            const learn = picks.learn.includes(topic.id)
            const teach = picks.teach.includes(topic.id)
            return (
              <li key={topic.id} className="lt-topic">
                <div className="lt-topic-text">
                  <p className="lt-topic-label">{topic.label}</p>
                  <p className="lt-topic-hint">{topic.hint}</p>
                </div>
                <div className="lt-topic-actions">
                  <button type="button" className={`lt-chip${learn ? ' lt-chip-on' : ''}`} aria-pressed={learn}
                    aria-label={`I want to learn: ${topic.label}`} onClick={() => toggle('learn', topic.id)}>
                    {learn ? '✓ ' : ''}Learn
                  </button>
                  <button type="button" className={`lt-chip lt-chip-teach${teach ? ' lt-chip-on' : ''}`} aria-pressed={teach}
                    aria-label={`I can teach: ${topic.label}`} onClick={() => toggle('teach', topic.id)}>
                    {teach ? '✓ ' : ''}Teach
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="lt-extra">
          {teaching && (
            <div className="field-group">
              <label className="field-label" htmlFor="lt-note">What would you show? <span className="optional-tag">one line</span></label>
              <input id="lt-note" className="field-input" maxLength={200} value={teachNote}
                onChange={e => setTeachNote(e.target.value)} placeholder="Example: how I built a booking bot for my shop" />
            </div>
          )}
          <div className="field-group">
            <label className="field-label" htmlFor="lt-suggestion">Something else? <span className="optional-tag">optional</span></label>
            <input id="lt-suggestion" className="field-input" maxLength={200} value={suggestion}
              onChange={e => setSuggestion(e.target.value)} placeholder="A topic we missed" />
          </div>
          {fromEmail ? (
            <p className="lt-as">Answering as <strong>{linkEmail}</strong>, from the link in your email.</p>
          ) : (
            <div className="field-group">
              <label className="field-label" htmlFor="lt-email">
                Email {teaching ? <span className="optional-tag">so we can reach you about teaching</span> : <span className="optional-tag">optional</span>}
              </label>
              <input id="lt-email" type="email" className="field-input" autoComplete="email" value={email}
                required={teaching} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              {!teaching && <p className="lt-help">Leave it blank to answer without giving your name.</p>}
            </div>
          )}
        </div>

        {state === 'error' && <div className="server-error" role="alert">{message}</div>}
        {state === 'done' ? (
          <p className="lt-done" role="status">
            Thank you. Your answers are in. Change them any time by sending again.
          </p>
        ) : null}
        <div className="lt-submit">
          <button type="submit" className="btn btn-primary" disabled={state === 'working'}>
            {state === 'working' ? 'Sending…' : state === 'done' ? 'Send again' : picked ? `Send my ${picked === 1 ? 'answer' : `${picked} answers`}` : 'Send my answers'}
          </button>
          <p className="lt-privacy">
            No account needed. We show totals only, never who answered. <Link to="/privacy">Privacy</Link>
          </p>
        </div>
      </form>

      <InterestResults refreshKey={refreshKey} />
    </div>
  )
}
