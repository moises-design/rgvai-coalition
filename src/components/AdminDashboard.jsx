import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import ConfirmModal from './ConfirmModal'

const RSVP_COLUMNS = [
  { key: 'name',         label: 'Name' },
  { key: 'email',        label: 'Email' },
  { key: 'phone',        label: 'Phone' },
  { key: 'ai_primary',   label: 'Primary AI' },
  { key: 'ai_secondary', label: 'Secondary AI' },
  { key: 'created_at',   label: 'Signed Up' },
]

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function exportCsv(rows) {
  const headers = RSVP_COLUMNS.map(c => c.label).join(',')
  const lines = rows.map(r =>
    [r.name, r.email, r.phone || '', r.ai_primary, r.ai_secondary || '', formatDate(r.created_at)]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  const blob = new Blob([[headers, ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rgvai-rsvps-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── RSVP Tab ──────────────────────────────────────────────────────────────────
function RsvpTab({ token }) {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setFetchError('')
      const res = await fetch('/api/rsvps', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      if (!active) return
      if (!res.ok) setFetchError(data.error || 'Failed to load RSVPs.')
      else setRsvps(data)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [token])

  const sorted = [...rsvps].sort((a, b) => {
    const diff = new Date(a.created_at) - new Date(b.created_at)
    return sortAsc ? diff : -diff
  })

  async function handleConfirmSend() {
    setSending(true)
    setSendResult(null)
    const res = await fetch('/api/send-reminder', { method: 'POST', headers: { 'x-admin-token': token } })
    const data = await res.json()
    setSendResult(data)
    setSending(false)
    setModalOpen(false)
  }

  return (
    <>
      <div className="admin-tab-header">
        <div>
          <h2 className="form-title" style={{ fontSize: '1.3rem' }}>RSVPs</h2>
          {!loading && (
            <p style={{ fontSize: '0.9rem', color: 'var(--cyan)', marginTop: '4px' }}>
              {rsvps.length} {rsvps.length === 1 ? 'signup' : 'signups'}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="admin-btn" onClick={() => setSortAsc(v => !v)} disabled={loading}>
            Date {sortAsc ? '↑ Oldest' : '↓ Newest'}
          </button>
          <button className="admin-btn" onClick={() => exportCsv(sorted)} disabled={loading || rsvps.length === 0}>
            Export CSV
          </button>
          <button
            className="submit-btn"
            style={{ padding: '9px 20px', fontSize: '0.9rem', width: 'auto' }}
            onClick={() => setModalOpen(true)}
            disabled={sending || loading || rsvps.length === 0}
          >
            Send Reminder
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        count={rsvps.length}
        onConfirm={handleConfirmSend}
        onCancel={() => setModalOpen(false)}
        sending={sending}
      />

      {sendResult && (
        <div className={sendResult.failed > 0 ? 'server-error' : 'send-success'} role="status" style={{ marginBottom: '16px' }}>
          {sendResult.failed === 0
            ? `✓ Reminder sent to ${sendResult.sent} attendees.`
            : `Sent ${sendResult.sent} · Failed ${sendResult.failed}`}
        </div>
      )}
      {fetchError && <div className="server-error" role="alert">{fetchError}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading…</div>
      ) : rsvps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No signups yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>{RSVP_COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {sorted.map(row => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{row.ai_primary}</td>
                  <td>{row.ai_secondary || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Meeting Tab ───────────────────────────────────────────────────────────────
function MeetingTab({ token }) {
  const [form, setForm] = useState({ event_date: '', event_time: '', location: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('meeting_details').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm({ event_date: data.event_date, event_time: data.event_time, location: data.location, notes: data.notes || '' })
      })
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setResult(null)
    setError('')
    const res = await fetch('/api/meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Failed to save.'); return }
    setResult('✓ Meeting details updated. Members will see this immediately.')
  }

  return (
    <>
      <div className="admin-tab-header">
        <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Meeting Details</h2>
      </div>
      <div style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSave} className="signup-form">
          <div className="field-group">
            <label className="field-label" htmlFor="m-date">Date</label>
            <input id="m-date" className="field-input" value={form.event_date}
              onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
              placeholder="Wednesday, May 20, 2026" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="m-time">Time</label>
            <input id="m-time" className="field-input" value={form.event_time}
              onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))}
              placeholder="7:00 PM" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="m-location">Location</label>
            <input id="m-location" className="field-input" value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              placeholder="123 Main St, McAllen, TX" />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="m-notes">
              Notes <span className="optional-tag">optional</span>
            </label>
            <textarea id="m-notes" className="field-input field-textarea" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Parking info, dress code, agenda notes…" rows={3} />
          </div>
          {error && <div className="server-error" role="alert">{error}</div>}
          {result && <div className="send-success" role="status">{result}</div>}
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Update Meeting Details'}
          </button>
        </form>
      </div>
    </>
  )
}

// ── Announcements Tab ─────────────────────────────────────────────────────────
function AnnouncementsTab({ token }) {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState({ title: '', body: '' })
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  async function loadAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  useEffect(() => {
    let active = true
    supabase.from('announcements').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (active) setAnnouncements(data || []) })
    return () => { active = false }
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) { setError('Title and body are required.'); return }
    setPosting(true)
    setError('')
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(form),
    })
    setPosting(false)
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to post.'); return }
    setForm({ title: '', body: '' })
    loadAnnouncements()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return
    await fetch(`/api/announcements?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    })
    loadAnnouncements()
  }

  return (
    <>
      <div className="admin-tab-header">
        <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Announcements</h2>
      </div>

      <div className="announcements-layout">
        <div>
          <p className="field-label" style={{ marginBottom: '16px', textTransform: 'none', letterSpacing: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Post a new announcement — all members will see it when they log in.
          </p>
          <form onSubmit={handlePost} className="signup-form">
            <div className="field-group">
              <label className="field-label" htmlFor="a-title">Title</label>
              <input id="a-title" className="field-input" value={form.title}
                onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setError('') }}
                placeholder="Location confirmed!" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="a-body">Message</label>
              <textarea id="a-body" className="field-input field-textarea" value={form.body}
                onChange={e => { setForm(p => ({ ...p, body: e.target.value })); setError('') }}
                placeholder="We'll be at…" rows={4} />
            </div>
            {error && <div className="server-error" role="alert">{error}</div>}
            <button type="submit" className="submit-btn" disabled={posting}>
              {posting ? 'Posting…' : 'Post Announcement'}
            </button>
          </form>
        </div>

        <div>
          <p className="field-label" style={{ marginBottom: '16px', textTransform: 'none', letterSpacing: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {announcements.length} posted
          </p>
          {announcements.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No announcements yet.</p>
          ) : (
            <div className="announcement-list">
              {announcements.map(a => (
                <div key={a.id} className="announcement-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <p className="announcement-title">{a.title}</p>
                    <button className="admin-btn" onClick={() => handleDelete(a.id)}
                      style={{ fontSize: '0.72rem', padding: '4px 10px', flexShrink: 0, color: 'var(--error)', borderColor: 'rgba(255,77,109,0.3)' }}>
                      Delete
                    </button>
                  </div>
                  <p className="announcement-body">{a.body}</p>
                  <p className="announcement-date">{formatDate(a.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TABS = ['RSVPs', 'Meeting', 'Announcements']

export default function AdminDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('RSVPs')

  return (
    <div className="page">
      <header className="site-header" style={{ justifyContent: 'space-between' }}>
        <span className="logo-badge">RGV AI</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin</span>
      </header>

      <main style={{ flex: 1, padding: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`admin-tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="admin-tab-content">
          {activeTab === 'RSVPs'         && <RsvpTab token={token} />}
          {activeTab === 'Meeting'       && <MeetingTab token={token} />}
          {activeTab === 'Announcements' && <AnnouncementsTab token={token} />}
        </div>
      </main>

      <footer className="site-footer">
        <p>© 2026 RGV AI Coalition · McAllen, TX</p>
      </footer>
    </div>
  )
}
