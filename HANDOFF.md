# HANDOFF: RGV AI Coalition platform

State as of branch `claude/platform-stabilize` (cut from `origin/wip/rescue-2026-09-24`, commit `0fc2a68`).

Stack: React 19 + Vite 8 + react-router-dom 7, plain CSS (no Tailwind, no CSS modules), Supabase JS client, Vercel (static SPA plus serverless functions in `api/`).

## 1. Router setup

- `src/main.jsx` mounts `<App />` inside `<StrictMode>` and `<BrowserRouter>`. It imports `src/index.css` (global reset, `:root` color variables, Google Fonts import).
- `src/App.jsx` holds the whole route table: one flat `<Routes>` inside a `<Suspense fallback={<PageLoader />}>`. There are no nested or layout routes and no `<Outlet>`.
- Every page is code-split with `React.lazy`. Pages that live in a multi-export file are loaded like this:
  ```js
  const AboutPage = lazy(() => import('./pages/AboutPages').then((m) => ({ default: m.AboutPage })))
  ```
- `src/App.jsx` also imports `src/App.css` (legacy/shared styles such as `.page`, `.site-header`, `.logo-badge`, `.site-nav`) and `src/platform.css` (platform styles).
- `vercel.json` rewrites every path to `/`, so deep links work in production. `/api/*` functions are served separately by Vercel.

### Route table (`src/App.jsx`)

| Path | Component | File |
|---|---|---|
| `/` | `PlatformHome` (default export) | `src/pages/PlatformHome.jsx` |
| `/learn` | `LearnHubPage` | `src/pages/LearnPages.jsx` |
| `/learn/courses` | `CourseCatalogPage` | `src/pages/LearnPages.jsx` |
| `/learn/courses/:slug` | `CourseDetailPage` | `src/pages/LearnPages.jsx` |
| `/learn/courses/:slug/lessons/:lessonSlug` | `LessonPage` | `src/pages/LearnPages.jsx` |
| `/learn/paths` | `PathsListPage` | `src/pages/LearnPages.jsx` |
| `/learn/paths/:slug` | `PathDetailPage` | `src/pages/LearnPages.jsx` |
| `/learn/instructors/:slug` | `InstructorPage` | `src/pages/LearnPages.jsx` |
| `/events` | `EventsPage` | `src/pages/EventsPages.jsx` |
| `/events/:slug` | `EventDetailPage` | `src/pages/EventsPages.jsx` |
| `/events/rgv-ai-coalition-kickoff/register` | `LegacyEventHome` (inline in App.jsx; renders `SignupForm`, then `SuccessScreen`) | `src/App.jsx` |
| `/community/partners` | `PartnersPage` | `src/pages/CommunityPages.jsx` |
| `/community/partners/:slug` | `PartnerDetailPage` | `src/pages/CommunityPages.jsx` |
| `/community/government` | `GovernmentPage` | `src/pages/CommunityPages.jsx` |
| `/community/educators` | `SectorPage sectorKey="educators"` (wrapper in App.jsx) | `src/pages/CommunityPages.jsx` |
| `/community/small-business` | `SectorPage sectorKey="small-business"` | `src/pages/CommunityPages.jsx` |
| `/community/nonprofits` | `SectorPage sectorKey="nonprofits"` | `src/pages/CommunityPages.jsx` |
| `/community/volunteer` | `VolunteerPage` | `src/pages/CommunityPages.jsx` |
| `/resources/news` | `NewsPage` | `src/pages/ResourcesPages.jsx` |
| `/resources/news/:slug` | `NewsArticlePage` | `src/pages/ResourcesPages.jsx` |
| `/resources/prompts` | `PromptsPage` | `src/pages/ResourcesPages.jsx` |
| `/resources/downloads` | `DownloadsPage` | `src/pages/ResourcesPages.jsx` |
| `/resources/tools` | `ToolsPage` | `src/pages/ResourcesPages.jsx` |
| `/about` | `AboutPage` | `src/pages/AboutPages.jsx` |
| `/about/sponsors` | `SponsorsPage` | `src/pages/AboutPages.jsx` |
| `/about/partner` | `PartnerWithUsPage` | `src/pages/AboutPages.jsx` |
| `/about/contact` | `ContactPage` | `src/pages/AboutPages.jsx` |
| `/digital-literacy` | `<Navigate to="/community/government" replace />` | `src/App.jsx` |
| `/admin` | `AdminRoute` → `AdminLogin` / `AdminDashboard` (token in `sessionStorage.admin_token`) | `src/App.jsx`, `src/components/Admin*.jsx` |
| `/superadmin` | `SuperAdminRoute` → `SuperAdminLogin` / `SuperAdminDashboard` (token in `sessionStorage.superadmin_token`) | `src/App.jsx`, `src/components/SuperAdmin*.jsx` |
| `/member` | `MemberPortal` (Supabase magic-link auth) | `src/components/MemberPortal.jsx` |
| `*` | `<Navigate to="/" replace />` | `src/App.jsx` |

`src/components/DigitalLiteracyPage.jsx` still exists but no route uses it (`/digital-literacy` redirects).

## 2. How PlatformLayout wraps pages

`src/components/layout/PlatformLayout.jsx` is **not** a router layout. Each page composes the shell by hand. Its exports:

- `AppShell` (default): outer `<div className="page ...">` plus a "Skip to main content" link.
- `PageLayout({ width })`: `<main id="main-content" className="platform-main platform-main--{width}">`. `width` is `'default'` (1080px), `'wide'` (1200px) or `'narrow'` (720px), defined in `src/platform.css`.
- `PageHeader({ eyebrow, title, description, actions })`: page `<h1>` block.
- `Breadcrumb({ items })`: `items` is `[{ label, to? }]`; the last item renders as the current page.
- `Section({ title, description, id, children })`: `<section className="platform-section">` with an optional `<h2>`.

Every platform page follows this pattern (see `src/pages/AboutPages.jsx`):

```jsx
<AppShell>
  <SiteHeader />
  <PageLayout>
    <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
    <PageHeader eyebrow="..." title="..." description="..." />
    <Section title="...">...</Section>
  </PageLayout>
  <SiteFooter />
</AppShell>
```

and calls `usePageMeta({ title, description, ogTitle?, ogDescription?, path })` from `src/hooks/usePageMeta.js` to set `document.title` and the description/OG meta tags.

Shared building blocks:

- `src/components/SiteHeader.jsx`: top nav. The dropdown menu is the `NAV` array at the top of the file (group `label`, `base` path for active state, `items: [{ to, label }]`), plus a "Sign in" link to `/member`.
- `src/components/SiteFooter.jsx`: footer.
- `src/components/ui/PlatformUI.jsx`: `Badge`, `Button` (`to` gives a router `Link`, `href` an `<a>`, otherwise a `<button>`; `variant` is `primary`/`secondary`), `Card`, `StatGrid`, `FaqList`, `EmptyState`.
- `src/components/learn/LearnCards.jsx`: `CourseCard`, `PathCard`, `EventCard`, `PartnerCard`, `FilterBar`.
- `src/components/forms/ContactForm.jsx`: props `subject`, `fields` (any of `name`, `email`, `organization`, `phone`, `program`, `message`), `submitLabel`. It validates client-side and then opens a `mailto:hello@rgvaicoalition.com` link. **It does not call Supabase or any API.**

## 3. Where page files live

`src/pages/`, grouped one file per section, with multiple named exports per file:

- `src/pages/PlatformHome.jsx` (default export)
- `src/pages/LearnPages.jsx`
- `src/pages/EventsPages.jsx`
- `src/pages/CommunityPages.jsx`
- `src/pages/ResourcesPages.jsx`
- `src/pages/AboutPages.jsx`

Legacy (pre-platform) screens live in `src/components/`: `SignupForm.jsx`, `SuccessScreen.jsx`, `MemberPortal.jsx`, `AdminLogin.jsx`, `AdminDashboard.jsx`, `SuperAdminLogin.jsx`, `SuperAdminDashboard.jsx`, `ConfirmModal.jsx`, `DigitalLiteracyPage.jsx` (unused).

## 4. Where content files live

Static content is plain JS modules in `src/content/`. There is no CMS and no database for platform content.

| File | Exports |
|---|---|
| `src/content/courses.js` | `DIFFICULTY_LABELS`, `courses` (each has `slug`, lessons with `slug`, external `resources`), `getCourse(slug)`, `formatDuration(minutes)` |
| `src/content/paths.js` | `learningPaths`, `getPath(slug)` |
| `src/content/events.js` | `events`, `getEvent(slug)`, `formatEventDate(iso)`, `formatEventTime(startIso, endIso)` |
| `src/content/community.js` | `partners`, `getPartner(slug)`, `impactStats`, `govPrograms`, `govAudiences`, `govFaqs` |
| `src/content/resources.js` | `newsArticles`, `getArticle(slug)`, `prompts`, `downloads`, `tools`, `instructors`, `getInstructor(slug)`, `sponsors`, `sectorContent` (keyed by `educators`, `small-business`, `nonprofits`; used by `SectorPage`) |

Detail pages look up records by `useParams().slug` through the `get*` helpers and `<Navigate>` back to the matching list page when the slug is unknown.

## 5. How to add a new page and route

1. Add a named export to the matching `src/pages/*Pages.jsx` file, or create a new `src/pages/XxxPage.jsx`. Use the `AppShell` / `SiteHeader` / `PageLayout` / `SiteFooter` pattern from section 2 and call `usePageMeta`.
2. If it needs data, add it to a file in `src/content/` (or a new one) and import it.
3. Register it in `src/App.jsx`:
   ```js
   const NewPage = lazy(() => import('./pages/AboutPages').then((m) => ({ default: m.NewPage })))
   // ...
   <Route path="/about/new" element={<NewPage />} />
   ```
   Put it above the `*` catch-all route.
4. If it should appear in the nav, add `{ to: '/about/new', label: '...' }` to the right group in the `NAV` array in `src/components/SiteHeader.jsx` (and the footer links in `src/components/SiteFooter.jsx` if wanted).
5. No `vercel.json` change is needed; the SPA rewrite already covers new paths.
6. Run `npm run build` and `npm run lint`.

## 6. Fonts and color variables

Fonts are loaded by the `@import` on line 1 of `src/index.css` (Google Fonts):

- **Bebas Neue**: display headings (`font-family: 'Bebas Neue', sans-serif` in `src/platform.css`, e.g. page and hero titles).
- **Barlow Condensed** (600/700/800): eyebrows, labels, nav, buttons, card titles.
- **DM Sans** (300/400/500): body text. Set on `body` in `src/index.css` as `'DM Sans', system-ui, sans-serif`.

Fonts are referenced by literal family name in each rule; there are no font variables.

Color variables are defined once in `:root` in `src/index.css`. `src/platform.css` defines none of its own and uses these:

| Variable | Value | Used for |
|---|---|---|
| `--bg-deep` | `#050a12` | page background |
| `--bg-card` | `#0c1524` | cards/panels |
| `--bg-input` | `#0f1d30` | form inputs |
| `--border` | `#1a3050` | borders |
| `--border-focus` | `#00d4ff` | focused inputs |
| `--cyan` | `#00d4ff` | accent, links, primary buttons |
| `--cyan-dim` | `#00a8cc` | accent hover |
| `--cyan-glow` | `rgba(0, 212, 255, 0.12)` | subtle glow |
| `--cyan-glow-strong` | `rgba(0, 212, 255, 0.28)` | strong glow |
| `--text-primary` | `#f0f6ff` | main text |
| `--text-secondary` | `#8aa4c2` | secondary text |
| `--text-muted` | `#4a6380` | muted text |
| `--error` | `#ff4d6d` | validation errors |

The theme is dark-only. `src/platform.css` also hard-codes a few hex values (5 occurrences, e.g. `#050a12` text on cyan buttons). Breakpoints are `@media (max-width: 900px)` and `(max-width: 720px)`, plus a `prefers-reduced-motion` block.

## 7. Supabase and environment

- Browser client: `src/supabase.js` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (implicit flow, `detectSessionInUrl`). It is imported by `SignupForm.jsx`, `MemberPortal.jsx` and `SuperAdminDashboard.jsx`. These files are unchanged from `main`.
- Serverless functions in `api/*.js` use `process.env.VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD` and `SUPER_ADMIN_PASSWORD`.
- `createClient` throws `supabaseUrl is required` at import time when `VITE_SUPABASE_URL` is unset. Any route that loads `SignupForm` or `MemberPortal` then renders blank: `/events`, `/events/:slug` (EventsPages imports SignupForm), `/events/rgv-ai-coalition-kickoff/register` and `/member`. Local dev therefore needs a `.env.local` with the two `VITE_` vars. Vercel already has them.
- Migrations live in `supabase/migrations/`. `supabase/.temp/` is CLI cache and is now git-ignored.

## 8. Known loose ends (not fixed; out of Mission 0 scope)

- 58 em dashes in platform copy (see `QA.md` for the file:line list), 18 more in legacy components.
- `src/assets/.!61159!hero.png` is a 0-byte stray file (it looks like an interrupted copy) and is tracked in git.
- `README.md` is still the Vite template boilerplate.
- `src/components/DigitalLiteracyPage.jsx` is unreferenced.
- `npm install` reports 13 audit vulnerabilities (1 low, 4 moderate, 8 high).
