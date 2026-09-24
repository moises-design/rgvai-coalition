import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppShell, { PageLayout, PageHeader, Breadcrumb, Section } from '../components/layout/PlatformLayout'
import { Button } from '../components/ui/PlatformUI'
import { EventCard } from '../components/learn/LearnCards'
import { events, getEvent, formatEventDate, formatEventTime } from '../content/events'
import SignupForm from '../components/SignupForm'

export function EventsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const types = ['all', ...new Set(events.map((e) => e.type))]

  usePageMeta({
    title: 'Workshop Calendar — RGV AI Coalition',
    description: 'Upcoming AI and digital literacy workshops, trainings, and community events across the Rio Grande Valley.',
    path: '/events',
  })

  const filtered = useMemo(() => {
    return events
      .filter((e) => typeFilter === 'all' || e.type === typeFilter)
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  }, [typeFilter])

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Events' }]} />
        <PageHeader
          title="Workshops & events"
          description="In-person and hybrid sessions across South Texas — from community introductions to government briefings."
        />
        <div className="filter-chips" role="group" aria-label="Event type">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-chip${typeFilter === t ? ' active' : ''}`}
              onClick={() => setTypeFilter(t)}
              aria-pressed={typeFilter === t}
            >
              {t === 'all' ? 'All events' : t}
            </button>
          ))}
        </div>
        <div className="card-grid card-grid--2">
          {filtered.map((e) => <EventCard key={e.slug} event={e} />)}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function EventDetailPage() {
  const { slug } = useParams()
  const event = getEvent(slug)

  usePageMeta({
    title: event ? `${event.title} — Events` : 'Event',
    description: event?.summary || '',
    path: `/events/${slug}`,
  })

  if (!event) return <Navigate to="/events" replace />

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Events', to: '/events' }, { label: event.title }]} />
        <PageHeader title={event.title} description={event.summary} />
        <div className="event-detail-meta">
          <p><strong>Date:</strong> {formatEventDate(event.startAt)}</p>
          <p><strong>Time:</strong> {formatEventTime(event.startAt, event.endAt)}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Address:</strong> {event.address}</p>
          <p><strong>Capacity:</strong> {event.capacity} attendees</p>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-link"
        >
          Open in Maps →
        </a>
        {event.registrationOpen && (
          <Section title="Register" id="register">
            {slug === 'rgv-ai-coalition-kickoff' ? (
              <SignupForm onSuccess={() => {}} />
            ) : (
              <p>Registration opens through our member portal. <Link to="/member">Sign in</Link> or contact <a href="mailto:hello@rgvaicoalition.com">hello@rgvaicoalition.com</a> to reserve your seat.</p>
            )}
          </Section>
        )}
        <Button to="/events" variant="secondary">Back to calendar</Button>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}
