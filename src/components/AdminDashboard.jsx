import { useEffect, useState, useCallback } from 'react'

const COLUMNS = [
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
  const headers = COLUMNS.map(c => c.label).join(',')
  const lines = rows.map(r =>
    [
      r.name, r.email, r.phone || '',
      r.ai_primary, r.ai_secondary || '',
      formatDate(r.created_at),
    ]
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

export default function AdminDashboard({ token }) {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const fetchRsvps = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    const res = await fetch('/api/rsvps', {
      headers: { 'x-admin-token': token },
    })
    const data = await res.json()
    if (!res.ok) {
      setFetchError(data.error || 'Failed to load RSVPs.')
    } else {
      setRsvps(data)
    }
    setLoading(false)
  }, [token])

  useEffect(() => { fetchRsvps() }, [fetchRsvps])

  const sorted = [...rsvps].sort((a, b) => {
    const diff = new Date(a.created_at) - new Date(b.created_at)
    return sortAsc ? diff : -diff
  })

  async function handleSendReminder() {
    if (!window.confirm(`Send reminder email to all ${rsvps.length} RSVPs?`)) return
    setSending(true)
    setSendResult(null)
    const res = await fetch('/api/send-reminder', {
      method: 'POST',
      headers: { 'x-admin-token': token },
    })
    const data = await res.json()
    setSendResult(data)
    setSending(false)
  }

  return (
    <div className="page">
      <header className="site-header" style={{ justifyContent: 'space-between' }}>
        <span className="logo-badge">RGV AI</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin</span>
      </header>

      <main style={{ flex: 1, padding: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 className="form-title" style={{ fontSize: '1.6rem' }}>RSVPs</h1>
            {!loading && (
              <p style={{ fontSize: '0.9rem', color: 'var(--cyan)', marginTop: '4px' }}>
                {rsvps.length} {rsvps.length === 1 ? 'signup' : 'signups'}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="admin-btn"
              onClick={() => setSortAsc(v => !v)}
              disabled={loading}
            >
              Date {sortAsc ? '↑ Oldest' : '↓ Newest'}
            </button>
            <button
              className="admin-btn"
              onClick={() => exportCsv(sorted)}
              disabled={loading || rsvps.length === 0}
            >
              Export CSV
            </button>
            <button
              className="submit-btn"
              style={{ padding: '9px 20px', fontSize: '0.9rem', width: 'auto' }}
              onClick={handleSendReminder}
              disabled={sending || loading || rsvps.length === 0}
            >
              {sending ? 'Sending…' : 'Send Reminder'}
            </button>
          </div>
        </div>

        {sendResult && (
          <div
            className={sendResult.failed > 0 ? 'server-error' : 'send-success'}
            role="status"
            style={{ marginBottom: '20px' }}
          >
            {sendResult.failed === 0
              ? `✓ Reminder sent to ${sendResult.sent} attendees.`
              : `Sent ${sendResult.sent} · Failed ${sendResult.failed}`}
          </div>
        )}

        {fetchError && (
          <div className="server-error" role="alert">{fetchError}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading…
          </div>
        ) : rsvps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No signups yet.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {COLUMNS.map(c => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
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
      </main>
    </div>
  )
}
