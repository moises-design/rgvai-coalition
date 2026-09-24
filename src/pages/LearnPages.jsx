import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppShell, { PageLayout, PageHeader, Breadcrumb, Section } from '../components/layout/PlatformLayout'
import { Button, Badge, FaqList } from '../components/ui/PlatformUI'
import { CourseCard, FilterBar } from '../components/learn/LearnCards'
import { courses, getCourse, DIFFICULTY_LABELS, formatDuration } from '../content/courses'
import { learningPaths, getPath } from '../content/paths'
import { PathCard } from '../components/learn/LearnCards'
import { getInstructor } from '../content/resources'

const DIFFICULTY_FILTERS = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function LearnHubPage() {
  usePageMeta({
    title: 'Learn — RGV AI Coalition',
    description: 'Explore courses, learning paths, and official resources for AI and digital literacy in South Texas.',
    path: '/learn',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Learn' }]} />
        <PageHeader
          eyebrow="Learning hub"
          title="Learn AI skills for work, school, and community"
          description="Structured courses and learning paths designed for South Texas — with links to official resources from leading providers."
        />
        <div className="learn-hub-actions">
          <Button to="/learn/courses">Browse courses</Button>
          <Button to="/learn/paths" variant="secondary">View learning paths</Button>
        </div>
        <Section title="Start with a learning path">
          <div className="card-grid card-grid--2">
            {learningPaths.slice(0, 4).map((p) => (
              <PathCard key={p.slug} path={p} courseCount={p.courseSlugs.length} />
            ))}
          </div>
        </Section>
        <Section title="Popular courses">
          <div className="card-grid card-grid--3">
            {courses.slice(0, 6).map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function CourseCatalogPage() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('all')

  usePageMeta({
    title: 'Course Catalog — RGV AI Coalition',
    description: 'Browse AI and digital literacy courses for beginners through workforce professionals.',
    path: '/learn/courses',
  })

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = !q || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
      const matchDiff = difficulty === 'all' || c.difficulty === difficulty
      return matchSearch && matchDiff
    })
  }, [search, difficulty])

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: 'Courses' }]} />
        <PageHeader title="Course catalog" description="Filter by level and search topics across our regional curriculum." />
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          filters={DIFFICULTY_FILTERS}
          activeFilter={difficulty}
          onFilterChange={setDifficulty}
          filterLabel="Difficulty level"
        />
        <p className="results-count" aria-live="polite">{filtered.length} courses</p>
        <div className="card-grid card-grid--3">
          {filtered.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function CourseDetailPage() {
  const { slug } = useParams()
  const course = getCourse(slug)

  usePageMeta({
    title: course ? `${course.title} — RGV AI Coalition` : 'Course — RGV AI Coalition',
    description: course?.summary || '',
    path: `/learn/courses/${slug}`,
  })

  if (!course) return <Navigate to="/learn/courses" replace />

  const instructor = getInstructor('moises-segovia')
  const recommended = course.recommendedNext.map((s) => getCourse(s)).filter(Boolean)

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[
          { label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' },
          { label: 'Courses', to: '/learn/courses' }, { label: course.title },
        ]} />
        <div className="course-detail-layout">
          <div className="course-detail-main">
            <div className="course-detail-meta">
              <Badge tone={course.difficulty}>{DIFFICULTY_LABELS[course.difficulty]}</Badge>
              <span>{formatDuration(course.durationMinutes)}</span>
              <span>{course.lessonCount} lessons</span>
            </div>
            <h1 className="page-title">{course.title}</h1>
            <p className="page-description">{course.summary}</p>

            <Section title="Overview">
              <p>{course.summary} This coalition course combines original instruction with links to official learning resources you can continue on provider platforms.</p>
            </Section>

            <Section title="Learning objectives">
              <ul className="objectives-list">
                {course.objectives.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </Section>

            <Section title="Prerequisites">
              <p>{course.prerequisites.join(' · ')}</p>
            </Section>

            <Section title="Lessons">
              <ol className="lesson-list">
                {course.lessons.map((l, i) => (
                  <li key={l.slug}>
                    <Link to={`/learn/courses/${course.slug}/lessons/${l.slug}`}>
                      <span className="lesson-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="lesson-title">{l.title}</span>
                      <span className="lesson-dur">{l.durationMinutes} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Official learning resources">
              <p className="section-description">Continue learning on official provider platforms. We link to these resources — we do not copy their materials.</p>
              <ul className="external-links">
                {course.externalLinks.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.title} <span className="provider-tag">{l.provider}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Practice exercises">
              <p>Apply what you learn with short exercises at the end of each lesson. Complete all lessons to unlock the knowledge check and certificate (coming soon for enrolled members).</p>
            </Section>

            <Section title="FAQ">
              <FaqList items={[
                { question: 'Is this course free?', answer: 'Coalition courses are free or low-cost for South Texas residents. Some linked external resources may have their own terms.' },
                { question: 'Do I need technical experience?', answer: `This course is rated ${DIFFICULTY_LABELS[course.difficulty]}. See prerequisites above.` },
                { question: 'Can my organization request a live workshop?', answer: 'Yes. Visit our Government or sector pages to request an in-person session for your team.' },
              ]} />
            </Section>
          </div>

          <aside className="course-sidebar">
            <div className="sidebar-card">
              <Button to={`/learn/courses/${course.slug}/lessons/${course.lessons[0].slug}`} className="sidebar-btn">Start course</Button>
              <Button to="/member" variant="secondary" className="sidebar-btn">Sign in to track progress</Button>
            </div>
            {instructor && (
              <div className="sidebar-card">
                <p className="sidebar-label">Instructor</p>
                <Link to={`/learn/instructors/${instructor.slug}`} className="instructor-link">{instructor.name}</Link>
                <p className="sidebar-muted">{instructor.title}</p>
              </div>
            )}
            {recommended.length > 0 && (
              <div className="sidebar-card">
                <p className="sidebar-label">Recommended next</p>
                <ul className="sidebar-links">
                  {recommended.map((r) => (
                    <li key={r.slug}><Link to={`/learn/courses/${r.slug}`}>{r.title}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="sidebar-card">
              <p className="sidebar-label">Community</p>
              <p className="sidebar-muted">Join a workshop to learn alongside others in the Rio Grande Valley.</p>
              <Button to="/events" variant="secondary" className="sidebar-btn">View events</Button>
            </div>
          </aside>
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function LessonPage() {
  const { slug, lessonSlug } = useParams()
  const course = getCourse(slug)
  const lessonIndex = course?.lessons.findIndex((l) => l.slug === lessonSlug) ?? -1
  const lesson = lessonIndex >= 0 ? course.lessons[lessonIndex] : null

  usePageMeta({
    title: lesson ? `${lesson.title} — ${course.title}` : 'Lesson',
    description: lesson ? `Lesson ${lessonIndex + 1} of ${course.lessonCount}: ${lesson.title}` : '',
    path: `/learn/courses/${slug}/lessons/${lessonSlug}`,
  })

  if (!course || !lesson) return <Navigate to="/learn/courses" replace />

  const prev = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null
  const next = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[
          { label: 'Home', to: '/' }, { label: 'Courses', to: '/learn/courses' },
          { label: course.title, to: `/learn/courses/${course.slug}` }, { label: lesson.title },
        ]} />
        <p className="lesson-progress-label">Lesson {lessonIndex + 1} of {course.lessons.length}</p>
        <h1 className="page-title">{lesson.title}</h1>
        <article className="lesson-content">
          <p>
            In this lesson, you will build practical understanding of <strong>{lesson.title.toLowerCase()}</strong> as part of
            the {course.title} curriculum. RGV AI Coalition lessons combine clear explanations, regional examples, and exercises
            you can apply immediately at work, in the classroom, or in your community.
          </p>
          <h2>Key ideas</h2>
          <ul>
            <li>Learn the concept in plain language without unnecessary jargon.</li>
            <li>See how it applies to real situations in South Texas organizations.</li>
            <li>Practice with a short exercise before moving to the next lesson.</li>
          </ul>
          <h2>Practice exercise</h2>
          <p>
            Write a short reflection (3–5 sentences) on how this topic applies to your role. If you are using an AI tool to help,
            note what you asked and what you verified before trusting the output.
          </p>
          <h2>Knowledge check</h2>
          <p>Complete all lessons to access the course knowledge check and certificate through your member account.</p>
        </article>
        <nav className="lesson-nav" aria-label="Lesson navigation">
          {prev ? <Link to={`/learn/courses/${course.slug}/lessons/${prev.slug}`} className="platform-btn platform-btn--secondary">← Previous</Link> : <span />}
          {next ? <Link to={`/learn/courses/${course.slug}/lessons/${next.slug}`} className="platform-btn platform-btn--primary">Next lesson →</Link> : (
            <Link to={`/learn/courses/${course.slug}`} className="platform-btn platform-btn--primary">Back to course</Link>
          )}
        </nav>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function PathsListPage() {
  usePageMeta({
    title: 'Learning Paths — RGV AI Coalition',
    description: 'Curated learning journeys for community members, workforce programs, educators, businesses, and government.',
    path: '/learn/paths',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: 'Learning paths' }]} />
        <PageHeader title="Learning paths" description="Follow a structured sequence of courses designed for your role and goals." />
        <div className="card-grid card-grid--2">
          {learningPaths.map((p) => (
            <PathCard key={p.slug} path={p} courseCount={p.courseSlugs.length} />
          ))}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function PathDetailPage() {
  const { slug } = useParams()
  const path = getPath(slug)

  usePageMeta({
    title: path ? `${path.title} — Learning Path` : 'Learning Path',
    description: path?.summary || '',
    path: `/learn/paths/${slug}`,
  })

  if (!path) return <Navigate to="/learn/paths" replace />

  const pathCourses = path.courseSlugs.map((s) => getCourse(s)).filter(Boolean)

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[
          { label: 'Home', to: '/' }, { label: 'Learning paths', to: '/learn/paths' }, { label: path.title },
        ]} />
        <PageHeader title={path.title} description={path.summary} />
        <p className="path-meta">{pathCourses.length} courses · approximately {path.estimatedHours} hours</p>
        <Section title="Courses in this path">
          <ol className="path-course-list">
            {pathCourses.map((c, i) => (
              <li key={c.slug}>
                <Link to={`/learn/courses/${c.slug}`}>
                  <span className="lesson-num">{i + 1}</span>
                  <span>{c.title}</span>
                  <Badge tone={c.difficulty}>{DIFFICULTY_LABELS[c.difficulty]}</Badge>
                </Link>
              </li>
            ))}
          </ol>
        </Section>
        <Button to={`/learn/courses/${pathCourses[0]?.slug}`}>Start path</Button>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function InstructorPage() {
  const { slug } = useParams()
  const instructor = getInstructor(slug)
  const taught = courses.filter(() => true).slice(0, 4)

  usePageMeta({
    title: instructor ? `${instructor.name} — Instructor` : 'Instructor',
    description: instructor?.bio || '',
    path: `/learn/instructors/${slug}`,
  })

  if (!instructor) return <Navigate to="/learn" replace />

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: instructor.name }]} />
        <PageHeader title={instructor.name} description={instructor.title} />
        <p>{instructor.bio}</p>
        <Section title="Credentials">
          <ul>{instructor.credentials.map((c) => <li key={c}>{c}</li>)}</ul>
        </Section>
        <Section title="Courses">
          <div className="card-grid card-grid--2">
            {taught.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
        </Section>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}
