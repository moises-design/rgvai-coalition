import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import usePageMeta from './hooks/usePageMeta'
import './App.css'
import './platform.css'

const PlatformHome = lazy(() => import('./pages/PlatformHome'))
const LearnHubPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.LearnHubPage })))
const CourseCatalogPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.CourseCatalogPage })))
const CourseDetailPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.CourseDetailPage })))
const LessonPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.LessonPage })))
const PathsListPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.PathsListPage })))
const PathDetailPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.PathDetailPage })))
const InstructorPage = lazy(() => import('./pages/LearnPages').then((m) => ({ default: m.InstructorPage })))
const EventsPage = lazy(() => import('./pages/EventsPages').then((m) => ({ default: m.EventsPage })))
const EventDetailPage = lazy(() => import('./pages/EventsPages').then((m) => ({ default: m.EventDetailPage })))
const PartnersPage = lazy(() => import('./pages/CommunityPages').then((m) => ({ default: m.PartnersPage })))
const PartnerDetailPage = lazy(() => import('./pages/CommunityPages').then((m) => ({ default: m.PartnerDetailPage })))
const GovernmentPage = lazy(() => import('./pages/CommunityPages').then((m) => ({ default: m.GovernmentPage })))
const SectorPage = lazy(() => import('./pages/CommunityPages').then((m) => ({ default: m.SectorPage })))
const VolunteerPage = lazy(() => import('./pages/CommunityPages').then((m) => ({ default: m.VolunteerPage })))
const NewsPage = lazy(() => import('./pages/ResourcesPages').then((m) => ({ default: m.NewsPage })))
const NewsArticlePage = lazy(() => import('./pages/ResourcesPages').then((m) => ({ default: m.NewsArticlePage })))
const PromptsPage = lazy(() => import('./pages/ResourcesPages').then((m) => ({ default: m.PromptsPage })))
const DownloadsPage = lazy(() => import('./pages/ResourcesPages').then((m) => ({ default: m.DownloadsPage })))
const ToolsPage = lazy(() => import('./pages/ResourcesPages').then((m) => ({ default: m.ToolsPage })))
const AboutPage = lazy(() => import('./pages/AboutPages').then((m) => ({ default: m.AboutPage })))
const SponsorsPage = lazy(() => import('./pages/AboutPages').then((m) => ({ default: m.SponsorsPage })))
const PartnerWithUsPage = lazy(() => import('./pages/AboutPages').then((m) => ({ default: m.PartnerWithUsPage })))
const ContactPage = lazy(() => import('./pages/AboutPages').then((m) => ({ default: m.ContactPage })))
const AdminLogin = lazy(() => import('./components/AdminLogin'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const MemberPortal = lazy(() => import('./components/MemberPortal'))
const SuperAdminLogin = lazy(() => import('./components/SuperAdminLogin'))
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'))
const SignupForm = lazy(() => import('./components/SignupForm'))
const SuccessScreen = lazy(() => import('./components/SuccessScreen'))

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="visually-hidden">Loading page</span>
      <span className="spinner" aria-hidden="true" />
    </div>
  )
}

function LegacyEventHome() {
  const [registrant, setRegistrant] = useState(null)

  usePageMeta({
    title: 'Event Registration — RGV AI Coalition Kickoff',
    description: 'Register for the RGV AI Coalition community kickoff, May 20, 2026 in Edinburg, TX.',
    path: '/events/rgv-ai-coalition-kickoff/register',
  })

  if (registrant) {
    return <SuccessScreen name={registrant.name} email={registrant.email} />
  }

  return <SignupForm onSuccess={setRegistrant} />
}

function AdminRoute() {
  const stored = sessionStorage.getItem('admin_token')
  const [token, setToken] = useState(stored || '')
  if (!token) return <AdminLogin onLogin={setToken} />
  return <AdminDashboard token={token} />
}

function SuperAdminRoute() {
  const stored = sessionStorage.getItem('superadmin_token')
  const [token, setToken] = useState(stored || '')
  if (!token) return <SuperAdminLogin onLogin={setToken} />
  return <SuperAdminDashboard token={token} />
}

function EducatorsPage() {
  return <SectorPage sectorKey="educators" />
}

function SmallBusinessPage() {
  return <SectorPage sectorKey="small-business" />
}

function NonprofitsPage() {
  return <SectorPage sectorKey="nonprofits" />
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<PlatformHome />} />

        <Route path="/learn" element={<LearnHubPage />} />
        <Route path="/learn/courses" element={<CourseCatalogPage />} />
        <Route path="/learn/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/learn/courses/:slug/lessons/:lessonSlug" element={<LessonPage />} />
        <Route path="/learn/paths" element={<PathsListPage />} />
        <Route path="/learn/paths/:slug" element={<PathDetailPage />} />
        <Route path="/learn/instructors/:slug" element={<InstructorPage />} />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/events/rgv-ai-coalition-kickoff/register" element={<LegacyEventHome />} />

        <Route path="/community/partners" element={<PartnersPage />} />
        <Route path="/community/partners/:slug" element={<PartnerDetailPage />} />
        <Route path="/community/government" element={<GovernmentPage />} />
        <Route path="/community/educators" element={<EducatorsPage />} />
        <Route path="/community/small-business" element={<SmallBusinessPage />} />
        <Route path="/community/nonprofits" element={<NonprofitsPage />} />
        <Route path="/community/volunteer" element={<VolunteerPage />} />

        <Route path="/resources/news" element={<NewsPage />} />
        <Route path="/resources/news/:slug" element={<NewsArticlePage />} />
        <Route path="/resources/prompts" element={<PromptsPage />} />
        <Route path="/resources/downloads" element={<DownloadsPage />} />
        <Route path="/resources/tools" element={<ToolsPage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/sponsors" element={<SponsorsPage />} />
        <Route path="/about/partner" element={<PartnerWithUsPage />} />
        <Route path="/about/contact" element={<ContactPage />} />

        <Route path="/digital-literacy" element={<Navigate to="/community/government" replace />} />

        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/superadmin" element={<SuperAdminRoute />} />
        <Route path="/member" element={<MemberPortal />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
