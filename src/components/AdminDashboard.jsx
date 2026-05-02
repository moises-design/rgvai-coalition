import { useEffect, useState } from 'react'

const RSVP_COLUMNS = [
  { key: 'name',         label: 'Name' },
  { key: 'email',        label: 'Email' },
  { key: 'phone',        label: 'Phone' },
  { key: 'ai_primary',   label: 'Primary AI' },
  { key: 'ai_secondary', label: 'Secondary AI' },
  { key: 'role',         label: 'Role' },
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
    [r.name, r.email, r.phone || '', r.ai_primary, r.ai_secondary || '', r.role, formatDate(r.created_at)]
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
      border: `1px solid ${s.border}`, color: s.color,
      background: `${s.color}12`, whiteSpace: 'nowrap',
    }}>
      {role.replace('_', ' ')}
    </span>
  )
}

export default function AdminDashboard({ token }) {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [sortAsc, setSortAsc] = useState(false)

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

  return (
    <div className="page">
      <header className="site-header" style={{ justifyContent: 'space-between' }}>
        <span className="logo-badge">RGV AI</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin</span>
      </header>

      <main style={{ flex: 1, padding: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
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
          </div>
        </div>

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
                    <td><RoleBadge role={row.role || 'member'} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>© 2026 RGV AI Coalition · Edinburg, TX</p>
      </footer>
    </div>
  )
}
