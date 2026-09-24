import { useMemo, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppShell, { PageLayout, PageHeader, Breadcrumb } from '../components/layout/PlatformLayout'
import { Button } from '../components/ui/PlatformUI'
import { newsArticles, getArticle, prompts, downloads, tools } from '../content/resources'

export function NewsPage() {
  usePageMeta({
    title: 'AI News — RGV AI Coalition',
    description: 'Updates on AI education, partnerships, and workforce development across South Texas.',
    path: '/resources/news',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'AI News' }]} />
        <PageHeader title="AI news & updates" description="Regional announcements, partnerships, and workforce insights." />
        <div className="news-list">
          {newsArticles.map((a) => (
            <article key={a.slug} className="news-item">
              <p className="news-meta">{a.date} · {a.category}</p>
              <h2><Link to={`/resources/news/${a.slug}`}>{a.title}</Link></h2>
              <p>{a.excerpt}</p>
            </article>
          ))}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function NewsArticlePage() {
  const { slug } = useParams()
  const article = getArticle(slug)

  usePageMeta({
    title: article ? `${article.title} — AI News` : 'Article',
    description: article?.excerpt || '',
    path: `/resources/news/${slug}`,
  })

  if (!article) return <Navigate to="/resources/news" replace />

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout width="narrow">
        <Breadcrumb items={[
          { label: 'Home', to: '/' }, { label: 'AI News', to: '/resources/news' }, { label: article.title },
        ]} />
        <p className="news-meta">{article.date} · {article.category}</p>
        <h1 className="page-title">{article.title}</h1>
        <article className="lesson-content">
          <p>{article.excerpt}</p>
          <p>
            RGV AI Coalition continues to expand access to AI and digital literacy across the Rio Grande Valley through
            partnerships with cities, libraries, schools, and workforce organizations. Visit our <Link to="/events">events calendar</Link> or
            <Link to="/learn"> learning hub</Link> to get involved.
          </p>
        </article>
        <Button to="/resources/news" variant="secondary">Back to news</Button>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function PromptsPage() {
  const [search, setSearch] = useState('')

  usePageMeta({
    title: 'Prompt Library — RGV AI Coalition',
    description: 'Practical AI prompt templates for government, business, education, and nonprofit work.',
    path: '/resources/prompts',
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return prompts.filter((p) => !q || p.title.toLowerCase().includes(q) || p.category.includes(q))
  }, [search])

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'Prompt library' }]} />
        <PageHeader title="Prompt library" description="Copy, adapt, and use these templates responsibly in your work." />
        <label className="filter-search">
          <span className="visually-hidden">Search prompts</span>
          <input type="search" placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <div className="prompt-list">
          {filtered.map((p) => (
            <article key={p.slug} className="platform-card prompt-card">
              <p className="news-meta">{p.category} · {p.audience}</p>
              <h2 className="course-card-title">{p.title}</h2>
              <pre className="prompt-body">{p.body}</pre>
            </article>
          ))}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function DownloadsPage() {
  usePageMeta({
    title: 'Downloads — RGV AI Coalition',
    description: 'Guides, templates, and checklists for AI adoption and digital literacy.',
    path: '/resources/downloads',
  })

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'Downloads' }]} />
        <PageHeader title="Downloads" description="Request guides and templates for your organization." />
        <div className="card-grid card-grid--2">
          {downloads.map((d) => (
            <article key={d.title} className="platform-card">
              <p className="news-meta">{d.category} · {d.fileType}</p>
              <h3 className="course-card-title">{d.title}</h3>
              <p className="course-card-summary">{d.description}</p>
              <Button href={`mailto:hello@rgvaicoalition.com?subject=Download%20Request%3A%20${encodeURIComponent(d.title)}`} variant="secondary">
                Request download
              </Button>
            </article>
          ))}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}

export function ToolsPage() {
  const [category, setCategory] = useState('all')
  const categories = ['all', ...new Set(tools.map((t) => t.category))]

  usePageMeta({
    title: 'Tool Directory — RGV AI Coalition',
    description: 'Curated AI and learning tools for South Texas residents, businesses, and educators.',
    path: '/resources/tools',
  })

  const filtered = tools.filter((t) => category === 'all' || t.category === category)

  return (
    <AppShell>
      <SiteHeader />
      <PageLayout>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'Tool directory' }]} />
        <PageHeader title="Tool directory" description="Curated tools with links to official provider sites." />
        <div className="filter-chips" role="group" aria-label="Tool category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c === 'all' ? 'All tools' : c}
            </button>
          ))}
        </div>
        <div className="card-grid card-grid--2">
          {filtered.map((t) => (
            <article key={t.name} className="platform-card">
              <p className="news-meta">{t.category} · {t.pricing}</p>
              <h3 className="course-card-title">
                <a href={t.url} target="_blank" rel="noopener noreferrer">{t.name}</a>
              </h3>
              <p className="course-card-summary">{t.description}</p>
            </article>
          ))}
        </div>
      </PageLayout>
      <SiteFooter />
    </AppShell>
  )
}
