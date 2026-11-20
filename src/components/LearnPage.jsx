import { useSearchParams } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import LearnTeachBoard from './LearnTeachBoard'

// The Learn or teach board on its own page. The table QR code and the topic
// buttons in reminder emails open this page. `?from=qr` marks a table scan.
export default function LearnPage() {
  const [params] = useSearchParams()

  usePageMeta({
    title: 'Learn or teach — RGV AI Coalition',
    description: 'Tell the RGV AI Coalition what you want to learn about AI and what you could teach. No account needed.',
    ogTitle: 'What do you want to learn about AI?',
    path: '/learn',
  })

  return (
    <div className="page">
      <SiteHeader />
      <main className="lt-page">
        <div className="section-head">
          <p className="eyebrow">Learn or teach</p>
          <h1 className="section-title">
            What should we cover next? <span className="section-title-soft">You tell us.</span>
          </h1>
          <p className="lt-lead">
            Tap what you want to learn and what you could teach. It takes 20 seconds and needs no account.
          </p>
        </div>
        <LearnTeachBoard
          source={params.get('from') === 'qr' ? 'qr' : 'web'}
          closedNote={<p className="lt-lead">The board opens soon. Please check back.</p>}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
