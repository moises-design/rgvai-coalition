import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

// Opened from the "Unsubscribe" link in a reminder email. Nothing changes
// until the person presses the button.
export default function UnsubscribePage() {
  const [params] = useSearchParams()
  const email = params.get('e') || ''
  const token = params.get('t') || ''
  const [state, setState] = useState('idle') // idle | working | off | on | error
  const [message, setMessage] = useState('')

  usePageMeta({
    title: 'Email preferences — RGV AI Coalition',
    description: 'Stop or restart reminder emails from the RGV AI Coalition.',
    path: '/unsubscribe',
  })

  async function send(action) {
    setState('working')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ e: email, t: token, action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || 'Something went wrong. Please email hello@rgvaicoalition.com.')
        setState('error')
        return
      }
      setState(action === 'resubscribe' ? 'on' : 'off')
    } catch {
      setMessage('Something went wrong. Please email hello@rgvaicoalition.com.')
      setState('error')
    }
  }

  const missing = !email || !token

  return (
    <div className="page">
      <SiteHeader />
      <main className="success-container">
        <div className="success-card" aria-live="polite">
          {missing ? (
            <>
              <h1 className="success-title">This link is incomplete</h1>
              <p className="success-body">
                Open the Unsubscribe link from one of our emails again, or write to{' '}
                <a href="mailto:hello@rgvaicoalition.com">hello@rgvaicoalition.com</a> and we will take you off the list.
              </p>
            </>
          ) : state === 'off' ? (
            <>
              <h1 className="success-title">You're unsubscribed</h1>
              <p className="success-body">
                We won't send reminder emails to <strong>{email}</strong>. You are still a member, and sign-in
                links you ask for will still arrive.
              </p>
              <button type="button" className="admin-btn" onClick={() => send('resubscribe')}>
                Undo, keep sending reminders
              </button>
            </>
          ) : state === 'on' ? (
            <>
              <h1 className="success-title">Reminders are back on</h1>
              <p className="success-body">We'll keep sending meeting reminders to <strong>{email}</strong>.</p>
            </>
          ) : (
            <>
              <h1 className="success-title">Stop reminder emails?</h1>
              <p className="success-body">
                This stops meeting reminders to <strong>{email}</strong>. You stay a member.
              </p>
              {state === 'error' && <div className="server-error" role="alert" style={{ marginBottom: '16px' }}>{message}</div>}
              <button type="button" className="submit-btn" onClick={() => send('unsubscribe')} disabled={state === 'working'}>
                {state === 'working' ? 'Working…' : 'Unsubscribe'}
              </button>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
