import { Link } from 'react-router-dom'
import { DIFFICULTY_LABELS, formatDuration } from '../../content/courses'
import { Badge } from '../ui/PlatformUI'

export function CourseCard({ course }) {
  return (
    <Link to={`/learn/courses/${course.slug}`} className="course-card">
      <div className="course-card-top">
        <Badge tone={course.difficulty}>{DIFFICULTY_LABELS[course.difficulty]}</Badge>
        <span className="course-card-time">{formatDuration(course.durationMinutes)}</span>
      </div>
      <h3 className="course-card-title">{course.title}</h3>
      <p className="course-card-summary">{course.summary}</p>
      <p className="course-card-meta">{course.lessonCount} lessons</p>
    </Link>
  )
}

export function PathCard({ path, courseCount }) {
  return (
    <Link to={`/learn/paths/${path.slug}`} className="path-card">
      <p className="path-card-eyebrow">Learning path</p>
      <h3 className="path-card-title">{path.title}</h3>
      <p className="path-card-summary">{path.summary}</p>
      <p className="path-card-meta">{courseCount} courses · ~{path.estimatedHours} hrs</p>
    </Link>
  )
}

export function EventCard({ event }) {
  const date = new Date(event.startAt)
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'America/Chicago' })
  const day = date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'America/Chicago' })

  return (
    <Link to={`/events/${event.slug}`} className="event-card">
      <div className="event-card-date" aria-hidden="true">
        <span className="event-card-month">{month}</span>
        <span className="event-card-day">{day}</span>
      </div>
      <div className="event-card-body">
        <Badge tone="default">{event.type}</Badge>
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-location">{event.location}</p>
      </div>
    </Link>
  )
}

export function PartnerCard({ partner }) {
  return (
    <Link to={`/community/partners/${partner.slug}`} className="partner-card">
      <div className="partner-card-logo" aria-hidden="true">{partner.name.charAt(0)}</div>
      <h3 className="partner-card-name">{partner.name}</h3>
      <p className="partner-card-type">{partner.type.replace('-', ' ')} · {partner.city}</p>
      <p className="partner-card-summary">{partner.summary}</p>
      {partner.verified && <span className="partner-verified">Verified partner</span>}
    </Link>
  )
}

export function FilterBar({ search, onSearchChange, filters, activeFilter, onFilterChange, filterLabel }) {
  return (
    <div className="filter-bar" role="search">
      <label className="filter-search">
        <span className="visually-hidden">Search</span>
        <input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      </label>
      {filters && (
        <div className="filter-chips" role="group" aria-label={filterLabel || 'Filters'}>
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`filter-chip${activeFilter === f.value ? ' active' : ''}`}
              onClick={() => onFilterChange(f.value)}
              aria-pressed={activeFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
