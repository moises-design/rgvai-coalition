import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import ConfirmModal from './ConfirmModal'

// ── Shared helpers ────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const ROLE_COLORS = {
  member:      { color: '#8aa4c2', border: 'rgba(138,164,194,0.3)' },
  admin:       { color: '#f0b429', border: 'rgba(240,180,41,0.3)' },
  super_admin: { color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
}

function RoleBadge({ role }) {
  const s = ROLE_COLORS[role] || ROLE_COLORS.member
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
      border: `1px solid ${s.border}`, color: s.color, background: `${s.color}12`, whiteSpace: 'nowrap',
    }}>
      {role.replace('_', ' ')}
    </span>
  )
}

const CATEGORY_COLORS = {
  article: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  tool:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  video:   { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  other:   { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

function CategoryBadge({ category }) {
  const s = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
      color: s.color, background: s.bg, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {category}
    </span>
  )
}

// ── Members Tab ───────────────────────────────────────────────────────────────
function MembersTab({ token }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [roleChanging, setRoleChanging] = useState({})
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('rsvps')
      .select('id, name, email, phone, role, created_at')
      .order('created_at', { ascending: false })
    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleRoleChange(email, role) {
    setRoleChanging(p => ({ ...p, [email]: true }))
    await fetch('/api/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-superadmin-token': token },
      body: JSON.stringify({ email, role }),
    })
    setMembers(p => p.map(m => m.email === email ? { ...m, role } : m))
    setRoleChanging(p => ({ ...p, [email]: false }))
  }

  async function handleRemove() {
    setRemoving(true)
    await fetch('/api/remove-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-superadmin-token': token },
      body: JSON.stringify({ email: removeTarget }),
    })
    setMembers(p => p.filter(m => m.email !== removeTarget))
    setRemoving(false)
    setRemoveTarget(null)
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <>
      <ConfirmModal
        isOpen={!!removeTarget}
        count={1}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
        sending={removing}
        message={`Remove ${removeTarget} from the member list? This cannot be undone.`}
        confirmLabel="Remove"
      />

      <div className="admin-tab-header">
        <div>
          <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Members</h2>
          {!loading && <p style={{ fontSize: '0.9rem', color: 'var(--cyan)', marginTop: '4px' }}>{members.length} total</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            style={{ width: '200px', padding: '7px 12px', fontSize: '0.85rem' }}
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="select-wrapper" style={{ width: '140px' }}>
            <select
              className="field-input field-select"
              style={{ padding: '7px 12px', fontSize: '0.85rem' }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No members match your search.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Signed Up</th><th>Role</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(m.created_at)}</td>
                  <td><RoleBadge role={m.role || 'member'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="select-wrapper" style={{ width: '130px' }}>
                        <select
                          className="field-input field-select"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          value={m.role || 'member'}
                          disabled={roleChanging[m.email]}
                          onChange={e => handleRoleChange(m.email, e.target.value)}
                        >
                          <option value="member">member</option>
                          <option value="admin">admin</option>
                          <option value="super_admin">super admin</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▾</span>
                      </div>
                      <button
                        className="admin-btn"
                        style={{ fontSize: '0.72rem', padding: '4px 10px', color: 'var(--error)', borderColor: 'rgba(255,77,109,0.3)', flexShrink: 0 }}
                        onClick={() => setRemoveTarget(m.email)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('rsvps').select('name, created_at, ai_primary, ai_secondary, role')
      .order('created_at', { ascending: true })
      .then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading…</div>
  if (members.length === 0) return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No data yet.</div>

  const now = new Date()
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(now)
    start.setDate(start.getDate() - (7 * (7 - i)) - start.getDay())
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const count = members.filter(m => {
      const d = new Date(m.created_at)
      return d >= start && d < end
    }).length
    return { label, count }
  })
  const maxWeekCount = Math.max(...weeks.map(w => w.count), 1)

  const toolCounts = {}
  members.forEach(m => {
    if (m.ai_primary) toolCounts[m.ai_primary] = (toolCounts[m.ai_primary] || 0) + 1
    if (m.ai_secondary) toolCounts[m.ai_secondary] = (toolCounts[m.ai_secondary] || 0) + 1
  })
  const tools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])
  const maxToolCount = Math.max(...tools.map(t => t[1]), 1)

  const last30 = members.filter(m => new Date(m.created_at) > new Date(Date.now() - 30 * 86400000)).length
  const prev30 = members.filter(m => {
    const d = new Date(m.created_at)
    return d > new Date(Date.now() - 60 * 86400000) && d <= new Date(Date.now() - 30 * 86400000)
  }).length
  const growthRate = prev30 === 0 ? null : Math.round(((last30 - prev30) / prev30) * 100)

  const statStyle = {
    background: 'var(--card-bg, #0c1524)', border: '1px solid var(--border)', borderRadius: '10px',
    padding: '20px 24px', flex: '1', minWidth: '140px',
  }

  return (
    <>
      <div className="admin-tab-header">
        <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Analytics</h2>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={statStyle}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Signups</p>
          <p style={{ margin: '8px 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--cyan)' }}>{members.length}</p>
        </div>
        <div style={statStyle}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last 30 Days</p>
          <p style={{ margin: '8px 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--cyan)' }}>{last30}</p>
        </div>
        <div style={statStyle}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth Rate</p>
          <p style={{ margin: '8px 0 0', fontSize: '2rem', fontWeight: 800, color: growthRate > 0 ? '#4ade80' : growthRate < 0 ? 'var(--error)' : 'var(--cyan)' }}>
            {growthRate === null ? 'N/A' : `${growthRate > 0 ? '+' : ''}${growthRate}%`}
          </p>
        </div>
        <div style={statStyle}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top AI Tool</p>
          <p style={{ margin: '8px 0 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--cyan)' }}>{tools[0]?.[0] || '—'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'var(--card-bg, #0c1524)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Signups per Week</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 600 }}>{w.count || ''}</span>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: `${Math.max((w.count / maxWeekCount) * 90, w.count > 0 ? 8 : 2)}px`,
                  background: w.count > 0 ? 'var(--cyan)' : 'var(--border)',
                  opacity: w.count > 0 ? 0.85 : 0.3,
                  transition: 'height 0.3s',
                }} />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg, #0c1524)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px', overflowY: 'auto', maxHeight: '280px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Tools</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tools.map(([tool, count]) => (
              <div key={tool}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{tool}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / maxToolCount) * 100}%`, background: 'var(--cyan)', borderRadius: '3px', opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Communications Tab ────────────────────────────────────────────────────────
function CommunicationsTab({ token }) {
  const [announcements, setAnnouncements] = useState([])
  const [annForm, setAnnForm] = useState({ title: '', body: '' })
  const [posting, setPosting] = useState(false)
  const [annError, setAnnError] = useState('')

  const [targetRole, setTargetRole] = useState('all')
  const [blastCount, setBlastCount] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

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
    if (!annForm.title.trim() || !annForm.body.trim()) { setAnnError('Title and body are required.'); return }
    setPosting(true)
    setAnnError('')
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(annForm),
    })
    setPosting(false)
    if (!res.ok) { const d = await res.json(); setAnnError(d.error || 'Failed to post.'); return }
    setAnnForm({ title: '', body: '' })
    loadAnnouncements()
  }

  async function handleDelete(id) {
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } })
    loadAnnouncements()
  }

  async function openBlastModal() {
    let query = supabase.from('rsvps').select('email', { count: 'exact', head: true })
    if (targetRole !== 'all') query = query.eq('role', targetRole)
    const { count } = await query
    setBlastCount(count || 0)
    setSendResult(null)
    setModalOpen(true)
  }

  async function handleSend() {
    setSending(true)
    const res = await fetch('/api/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ targetRole: targetRole === 'all' ? null : targetRole }),
    })
    const data = await res.json()
    setSendResult(data)
    setSending(false)
    setModalOpen(false)
  }

  return (
    <>
      <ConfirmModal
        isOpen={modalOpen}
        count={blastCount}
        onConfirm={handleSend}
        onCancel={() => setModalOpen(false)}
        sending={sending}
      />

      <div className="admin-tab-header">
        <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Communications</h2>
      </div>

      <div className="announcements-layout">
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Post a new announcement — all members will see it when they log in.
          </p>
          <form onSubmit={handlePost} className="signup-form">
            <div className="field-group">
              <label className="field-label" htmlFor="sa-title">Title</label>
              <input id="sa-title" className="field-input" value={annForm.title}
                onChange={e => { setAnnForm(p => ({ ...p, title: e.target.value })); setAnnError('') }}
                placeholder="Location confirmed!" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="sa-body">Message</label>
              <textarea id="sa-body" className="field-input field-textarea" value={annForm.body}
                onChange={e => { setAnnForm(p => ({ ...p, body: e.target.value })); setAnnError('') }}
                placeholder="We'll be at…" rows={4} />
            </div>
            {annError && <div className="server-error" role="alert">{annError}</div>}
            <button type="submit" className="submit-btn" disabled={posting}>
              {posting ? 'Posting…' : 'Post Announcement'}
            </button>
          </form>

          <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Email Blast</h3>
            <div className="field-group" style={{ marginBottom: '16px' }}>
              <label className="field-label">Send to</label>
              <div className="select-wrapper">
                <select className="field-input field-select" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                  <option value="all">All members</option>
                  <option value="member">Members only</option>
                  <option value="admin">Admins only</option>
                  <option value="super_admin">Super admins only</option>
                </select>
                <span className="select-arrow" aria-hidden="true">▾</span>
              </div>
            </div>
            {sendResult && (
              <div className={sendResult.failed > 0 ? 'server-error' : 'send-success'} role="status" style={{ marginBottom: '12px' }}>
                {sendResult.failed === 0
                  ? `✓ Sent to ${sendResult.sent} recipient${sendResult.sent !== 1 ? 's' : ''}.`
                  : `Sent ${sendResult.sent} · Failed ${sendResult.failed}`}
              </div>
            )}
            <button className="submit-btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={openBlastModal}>
              Send Reminder Email
            </button>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
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

// ── Meetings Tab ──────────────────────────────────────────────────────────────
function MeetingsTab({ token }) {
  const [form, setForm] = useState({ event_date: '', event_time: '', location: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [confirmations, setConfirmations] = useState([])
  const [confLoading, setConfLoading] = useState(true)
  const [totalMembers, setTotalMembers] = useState(0)

  useEffect(() => {
    supabase.from('meeting_details').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm({ event_date: data.event_date, event_time: data.event_time, location: data.location, notes: data.notes || '' })
      })
    supabase.from('meetings_history').select('*').order('recorded_at', { ascending: false }).limit(20)
      .then(({ data }) => setHistory(data || []))
    fetch('/api/confirm-attendance', { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(data => { setConfirmations(Array.isArray(data) ? data : []); setConfLoading(false) })
    supabase.from('rsvps').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalMembers(count || 0))
  }, [token])

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
    setResult('✓ Meeting details updated.')
    supabase.from('meetings_history').select('*').order('recorded_at', { ascending: false }).limit(20)
      .then(({ data: h }) => setHistory(h || []))
  }

  async function handleResetConfirmations() {
    await fetch('/api/confirm-attendance', {
      method: 'DELETE',
      headers: { 'x-superadmin-token': token },
    })
    setConfirmations([])
  }

  return (
    <>
      <div className="admin-tab-header">
        <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Meetings</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Update the current meeting. Members see this in real time.
          </p>
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
                placeholder="123 Main St, Edinburg, TX" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="m-notes">Notes <span className="optional-tag">optional</span></label>
              <textarea id="m-notes" className="field-input field-textarea" value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Parking info, agenda…" rows={3} />
            </div>
            {error && <div className="server-error" role="alert">{error}</div>}
            {result && <div className="send-success" role="status">{result}</div>}
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Update Meeting Details'}
            </button>
          </form>
        </div>

        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Meeting history ({history.length} entries)
          </p>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No history yet. Save a meeting to start logging.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {history.map(h => (
                <div key={h.id} style={{ padding: '14px', background: 'var(--card-bg, #0c1524)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {h.event_date} · {h.event_time}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{h.location}</p>
                  {h.notes && <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.notes}</p>}
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Saved {new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmations section */}
      <div style={{ marginTop: '32px', padding: '24px', background: 'var(--card-bg, #0c1524)', border: '1px solid var(--border)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Attendance Confirmations</h3>
            {!confLoading && (
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--cyan)' }}>
                {confirmations.length} confirmed{totalMembers > 0 ? ` of ${totalMembers} total` : ''}
              </p>
            )}
          </div>
          <button
            className="admin-btn"
            style={{ fontSize: '0.78rem', color: 'var(--error)', borderColor: 'rgba(255,77,109,0.3)' }}
            onClick={handleResetConfirmations}
            disabled={confirmations.length === 0}
          >
            Reset
          </button>
        </div>
        {confLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</p>
        ) : confirmations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No confirmations yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {confirmations.map(c => (
              <div key={c.id} style={{ padding: '6px 12px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.rsvps?.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{c.rsvps?.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── Resources Tab ─────────────────────────────────────────────────────────────
function ResourcesTab({ token }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', url: '', description: '', category: 'article' })
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  async function loadResources() {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
    setResources(data || [])
    setLoading(false)
  }

  useEffect(() => { loadResources() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) { setError('Title and URL are required.'); return }
    setPosting(true)
    setError('')
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-superadmin-token': token },
      body: JSON.stringify(form),
    })
    setPosting(false)
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to add.'); return }
    setForm({ title: '', url: '', description: '', category: 'article' })
    loadResources()
  }

  async function handleDelete(id) {
    await fetch(`/api/resources?id=${id}`, { method: 'DELETE', headers: { 'x-superadmin-token': token } })
    setResources(p => p.filter(r => r.id !== id))
  }

  return (
    <>
      <div className="admin-tab-header">
        <h2 className="form-title" style={{ fontSize: '1.3rem' }}>Resource Library</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Add a resource — members see it in their portal.
          </p>
          <form onSubmit={handleAdd} className="signup-form">
            <div className="field-group">
              <label className="field-label" htmlFor="r-title">Title</label>
              <input id="r-title" className="field-input" value={form.title}
                onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setError('') }}
                placeholder="Intro to Prompt Engineering" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="r-url">URL</label>
              <input id="r-url" type="url" className="field-input" value={form.url}
                onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setError('') }}
                placeholder="https://…" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="r-desc">Description <span className="optional-tag">optional</span></label>
              <input id="r-desc" className="field-input" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Short description…" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="r-cat">Category</label>
              <div className="select-wrapper">
                <select id="r-cat" className="field-input field-select" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="article">Article</option>
                  <option value="tool">Tool</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
                <span className="select-arrow" aria-hidden="true">▾</span>
              </div>
            </div>
            {error && <div className="server-error" role="alert">{error}</div>}
            <button type="submit" className="submit-btn" disabled={posting}>
              {posting ? 'Adding…' : 'Add Resource'}
            </button>
          </form>
        </div>

        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {resources.length} resource{resources.length !== 1 ? 's' : ''} posted
          </p>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
          ) : resources.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No resources yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
              {resources.map(r => (
                <div key={r.id} style={{ padding: '14px', background: 'var(--card-bg, #0c1524)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <CategoryBadge category={r.category} />
                      <p style={{ margin: '6px 0 0', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{r.title}</p>
                      {r.description && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.description}</p>}
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: 'var(--cyan)', opacity: 0.8, wordBreak: 'break-all' }}>
                        {r.url}
                      </a>
                    </div>
                    <button className="admin-btn" onClick={() => handleDelete(r.id)}
                      style={{ fontSize: '0.72rem', padding: '4px 10px', flexShrink: 0, color: 'var(--error)', borderColor: 'rgba(255,77,109,0.3)' }}>
                      Delete
                    </button>
                  </div>
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
const TABS = ['Members', 'Analytics', 'Communications', 'Meetings', 'Resources']

export default function SuperAdminDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('Members')

  return (
    <div className="page">
      <header className="site-header" style={{ justifyContent: 'space-between' }}>
        <span className="logo-badge">RGV AI</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Super Admin</span>
      </header>

      <main style={{ flex: 1, padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
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
          {activeTab === 'Members'        && <MembersTab token={token} />}
          {activeTab === 'Analytics'      && <AnalyticsTab />}
          {activeTab === 'Communications' && <CommunicationsTab token={token} />}
          {activeTab === 'Meetings'       && <MeetingsTab token={token} />}
          {activeTab === 'Resources'      && <ResourcesTab token={token} />}
        </div>
      </main>

      <footer className="site-footer">
        <p>© 2026 RGV AI Coalition · Edinburg, TX</p>
      </footer>
    </div>
  )
}
