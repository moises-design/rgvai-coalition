# QA: Mission 0 (platform stabilize)

Branch: `claude/platform-stabilize`, cut from `origin/wip/rescue-2026-09-24` (`0fc2a68`).
Environment: Node v22.22.2, npm 10.9.7, Linux cloud container, Chromium via Playwright 1.56.1 (headless).

## 1. Install and build

```
$ git fetch origin && git status
On branch claude/pensive-dijkstra-e3c4ds
nothing to commit, working tree clean

$ git checkout -b claude/platform-stabilize origin/wip/rescue-2026-09-24
Switched to a new branch 'claude/platform-stabilize'

$ npm install
...
13 vulnerabilities (1 low, 4 moderate, 8 high)
```

`npm install` rewrote `package-lock.json` (it removed 30 `"libc": [...]` lines from optional platform binaries, an npm-version difference). I reverted that with `git checkout package-lock.json`, so the lockfile is unchanged.

### Build on the unmodified rescue branch (before any change)

```
$ npm run build

> rgvai-coalition@0.0.0 build
> vite build

vite v8.0.10 building client environment for production...
transforming...✓ 94 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                1.51 kB │ gzip:  0.60 kB
dist/assets/index-57syNYty.css                31.14 kB │ gzip:  6.01 kB
dist/assets/AdminLogin-CFa6PnWE.js             1.62 kB │ gzip:  0.78 kB
dist/assets/SuperAdminLogin-CrX0q3_R.js        1.73 kB │ gzip:  0.81 kB
dist/assets/paths-DDztAngn.js                  2.01 kB │ gzip:  0.76 kB
dist/assets/SuccessScreen-B-f9uZ1p.js          2.71 kB │ gzip:  1.14 kB
dist/assets/events-B5fLakOa.js                 2.86 kB │ gzip:  1.25 kB
dist/assets/EventsPages-C35hyf9O.js            3.05 kB │ gzip:  1.33 kB
dist/assets/ContactForm-lv1xm1XA.js            3.35 kB │ gzip:  1.20 kB
dist/assets/community-vRLmJihr.js              3.92 kB │ gzip:  1.69 kB
dist/assets/AdminDashboard-DoVBtm8s.js         4.01 kB │ gzip:  1.67 kB
dist/assets/PlatformHome-CTVK0O5y.js           4.46 kB │ gzip:  1.55 kB
dist/assets/SignupForm-CTvzHlLx.js             5.14 kB │ gzip:  1.82 kB
dist/assets/AboutPages-B5cu1DJp.js             5.19 kB │ gzip:  1.69 kB
dist/assets/ResourcesPages-DMMzUJBP.js         5.74 kB │ gzip:  1.84 kB
dist/assets/PlatformUI-gZzksE-L.js             6.66 kB │ gzip:  2.02 kB
dist/assets/resources-gjB_J7AY.js              7.26 kB │ gzip:  2.93 kB
dist/assets/CommunityPages-B0Q1vKzm.js         7.50 kB │ gzip:  2.33 kB
dist/assets/jsx-runtime-ByY1xr43.js            8.40 kB │ gzip:  3.20 kB
dist/assets/MemberPortal-B9D3hoe0.js          11.91 kB │ gzip:  3.36 kB
dist/assets/LearnPages-CfOTnp8U.js            12.29 kB │ gzip:  3.54 kB
dist/assets/LearnCards-DaYC1-2h.js            13.29 kB │ gzip:  4.28 kB
dist/assets/SuperAdminDashboard-BVgqnSlO.js   28.43 kB │ gzip:  6.32 kB
dist/assets/supabase-BfQ4Kca7.js             195.28 kB │ gzip: 49.78 kB
dist/assets/index-DoPr7hRu.js                232.32 kB │ gzip: 73.54 kB

✓ built in 281ms
```

**The build passed with no errors or warnings. No code fix was needed, so none was made.**

### Build after this mission's changes

```
$ npm run build

> rgvai-coalition@0.0.0 build
> vite build

vite v8.0.10 building client environment for production...
transforming...✓ 94 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                1.51 kB │ gzip:  0.60 kB
dist/assets/index-57syNYty.css                31.14 kB │ gzip:  6.01 kB
dist/assets/AdminLogin-CFa6PnWE.js             1.62 kB │ gzip:  0.78 kB
dist/assets/SuperAdminLogin-CrX0q3_R.js        1.73 kB │ gzip:  0.81 kB
dist/assets/paths-DDztAngn.js                  2.01 kB │ gzip:  0.76 kB
dist/assets/SuccessScreen-B-f9uZ1p.js          2.71 kB │ gzip:  1.14 kB
dist/assets/events-B5fLakOa.js                 2.86 kB │ gzip:  1.25 kB
dist/assets/EventsPages-C35hyf9O.js            3.05 kB │ gzip:  1.33 kB
dist/assets/ContactForm-lv1xm1XA.js            3.35 kB │ gzip:  1.20 kB
dist/assets/community-vRLmJihr.js              3.92 kB │ gzip:  1.69 kB
dist/assets/AdminDashboard-DoVBtm8s.js         4.01 kB │ gzip:  1.67 kB
dist/assets/PlatformHome-CTVK0O5y.js           4.46 kB │ gzip:  1.55 kB
dist/assets/SignupForm-CTvzHlLx.js             5.14 kB │ gzip:  1.82 kB
dist/assets/AboutPages-B5cu1DJp.js             5.19 kB │ gzip:  1.69 kB
dist/assets/ResourcesPages-DMMzUJBP.js         5.74 kB │ gzip:  1.84 kB
dist/assets/PlatformUI-gZzksE-L.js             6.66 kB │ gzip:  2.02 kB
dist/assets/resources-gjB_J7AY.js              7.26 kB │ gzip:  2.93 kB
dist/assets/CommunityPages-B0Q1vKzm.js         7.50 kB │ gzip:  2.33 kB
dist/assets/jsx-runtime-ByY1xr43.js            8.40 kB │ gzip:  3.20 kB
dist/assets/MemberPortal-B9D3hoe0.js          11.91 kB │ gzip:  3.36 kB
dist/assets/LearnPages-CfOTnp8U.js            12.29 kB │ gzip:  3.54 kB
dist/assets/LearnCards-DaYC1-2h.js            13.29 kB │ gzip:  4.28 kB
dist/assets/SuperAdminDashboard-BVgqnSlO.js   28.43 kB │ gzip:  6.32 kB
dist/assets/supabase-BfQ4Kca7.js             195.28 kB │ gzip: 49.78 kB
dist/assets/index-DoPr7hRu.js                232.32 kB │ gzip: 73.54 kB

✓ built in 318ms
```

Exit code 0. `npx eslint .` also exits clean (no output).

## 2. Route check

The command was `npx vite --port 5173`, then a headless Playwright script (kept in the session scratchpad, not committed). It opens each route, waits for `networkidle` + 400 ms, and records console errors, page errors, failed requests, the first `<h1>` and the length of `#root` text. Every route in `src/App.jsx` was visited, with one real slug for each dynamic route and an unknown path for the `*` catch-all.

### Run A: no env vars (repo as-is, no `.env*` file present)

```
FAIL / | h1="Build digital and AI skills for work, school, and community" | text=2883 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn | h1="Learn AI skills for work, school, and community" | text=2307 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/courses | h1="Course catalog" | text=1898 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/courses/ai-for-beginners | h1="AI for Beginners" | text=2125 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/courses/ai-for-beginners/lessons/what-is-ai | h1="What Is AI?" | text=1302 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/paths | h1="Learning paths" | text=1480 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/paths/community-ai-foundations | h1="Community AI Foundations" | text=752 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/instructors/moises-segovia | h1="Moises Segovia" | text=1412 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /events | h1="" | text=0 | errors=2
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
      pageerror: supabaseUrl is required.
FAIL /events/rgv-ai-coalition-kickoff | h1="" | text=0 | errors=2
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
      pageerror: supabaseUrl is required.
FAIL /events/rgv-ai-coalition-kickoff/register | h1="" | text=0 | errors=2
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
      pageerror: supabaseUrl is required.
FAIL /community/partners | h1="Partner organizations" | text=1708 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/partners/utrgv | h1="The University of Texas Rio Grande Valley" | text=677 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/government | h1="AI & digital literacy for cities, counties, and public agenc" | text=2965 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/educators | h1="AI literacy for classrooms, campuses, and professional devel" | text=1336 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/small-business | h1="Compete and grow with practical AI skills" | text=1161 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/nonprofits | h1="Stretch your mission with modern digital tools" | text=1109 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/volunteer | h1="Volunteer with the coalition" | text=899 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/news | h1="AI news & updates" | text=1252 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/news/south-texas-ai-learning-hub-launch | h1="RGV AI Coalition Launches South Texas AI Learning Hub" | text=930 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/prompts | h1="Prompt library" | text=2179 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/downloads | h1="Downloads" | text=1179 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/tools | h1="Tool directory" | text=1325 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about | h1="The AI learning hub for South Texas" | text=1197 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about/sponsors | h1="Sponsors" | text=986 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about/partner | h1="Become a partner" | text=891 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about/contact | h1="Contact us" | text=806 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /digital-literacy -> /community/government | h1="AI & digital literacy for cities, counties, and public agenc" | text=2965 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /admin | h1="Admin Access" | text=74 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /superadmin | h1="Super Admin Access" | text=98 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /member | h1="" | text=0 | errors=2
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
      pageerror: supabaseUrl is required.
FAIL /does-not-exist -> / | h1="Build digital and AI skills for work, school, and community" | text=2883 | errors=1
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
```

- `/events`, `/events/:slug`, `/events/rgv-ai-coalition-kickoff/register` and `/member` render blank with `supabaseUrl is required.` The cause is `src/supabase.js` calling `createClient(undefined, ...)` at import time. `EventsPages.jsx` imports `SignupForm`, which imports `src/supabase.js`. This is missing local env, not a code defect: `main` behaves the same way without env vars, and Vercel has `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` set. Per the mission boundaries, the Supabase code and env were left unchanged.
- `ERR_CERT_AUTHORITY_INVALID` is explained in Run B.

### Run B: placeholder env set in the shell only (`VITE_SUPABASE_URL=https://placeholder.supabase.co VITE_SUPABASE_ANON_KEY=placeholder npx vite ...`; no file written)

```
FAIL / | h1="Build digital and AI skills for work, school, and community" | text=2883 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn | h1="Learn AI skills for work, school, and community" | text=2307 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/courses | h1="Course catalog" | text=1898 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/courses/ai-for-beginners | h1="AI for Beginners" | text=2125 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/courses/ai-for-beginners/lessons/what-is-ai | h1="What Is AI?" | text=1302 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/paths | h1="Learning paths" | text=1480 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/paths/community-ai-foundations | h1="Community AI Foundations" | text=752 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /learn/instructors/moises-segovia | h1="Moises Segovia" | text=1412 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /events | h1="Workshops & events" | text=1052 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /events/rgv-ai-coalition-kickoff | h1="RGV AI Coalition Community Kickoff" | text=1302 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /events/rgv-ai-coalition-kickoff/register | h1="" | text=496 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/partners | h1="Partner organizations" | text=1708 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/partners/utrgv | h1="The University of Texas Rio Grande Valley" | text=677 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/government | h1="AI & digital literacy for cities, counties, and public agenc" | text=2965 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/educators | h1="AI literacy for classrooms, campuses, and professional devel" | text=1336 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/small-business | h1="Compete and grow with practical AI skills" | text=1161 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/nonprofits | h1="Stretch your mission with modern digital tools" | text=1109 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /community/volunteer | h1="Volunteer with the coalition" | text=899 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/news | h1="AI news & updates" | text=1252 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/news/south-texas-ai-learning-hub-launch | h1="RGV AI Coalition Launches South Texas AI Learning Hub" | text=930 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/prompts | h1="Prompt library" | text=2179 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/downloads | h1="Downloads" | text=1179 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /resources/tools | h1="Tool directory" | text=1325 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about | h1="The AI learning hub for South Texas" | text=1197 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about/sponsors | h1="Sponsors" | text=986 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about/partner | h1="Become a partner" | text=891 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /about/contact | h1="Contact us" | text=806 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /digital-literacy -> /community/government | h1="AI & digital literacy for cities, counties, and public agenc" | text=2965 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /admin | h1="Admin Access" | text=74 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /superadmin | h1="Super Admin Access" | text=98 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /member | h1="Sign in" | text=128 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
FAIL /does-not-exist -> / | h1="Build digital and AI skills for work, school, and community" | text=2883 | errors=2
      requestfailed: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;8 net::ERR_CERT_AUTHORITY_INVALID
      Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
```

The script marks every row FAIL only because of one failed request: `https://fonts.googleapis.com/css2?...` (the Google Fonts `@import` in `src/index.css`) fails TLS in this sandbox because the egress proxy's CA is not trusted by the bundled Chromium. It is an environment limitation and does not happen on a normal network or on Vercel. **Excluding that request, all 32 route checks render content with zero console errors and zero page errors.**

### Route status summary (Run B, fonts request excluded)

| Route | Status | Notes |
|---|---|---|
| `/` | OK | |
| `/learn` | OK | |
| `/learn/courses` | OK | |
| `/learn/courses/:slug` (`ai-for-beginners`) | OK | |
| `/learn/courses/:slug/lessons/:lessonSlug` (`ai-for-beginners/what-is-ai`) | OK | |
| `/learn/paths` | OK | |
| `/learn/paths/:slug` (`community-ai-foundations`) | OK | |
| `/learn/instructors/:slug` (`moises-segovia`) | OK | |
| `/events` | OK | needs Supabase env (blank without it) |
| `/events/:slug` (`rgv-ai-coalition-kickoff`) | OK | needs Supabase env |
| `/events/rgv-ai-coalition-kickoff/register` | OK | needs Supabase env; SignupForm has no `<h1>` |
| `/community/partners` | OK | |
| `/community/partners/:slug` (`utrgv`) | OK | |
| `/community/government` | OK | |
| `/community/educators` | OK | |
| `/community/small-business` | OK | |
| `/community/nonprofits` | OK | |
| `/community/volunteer` | OK | |
| `/resources/news` | OK | |
| `/resources/news/:slug` (`south-texas-ai-learning-hub-launch`) | OK | |
| `/resources/prompts` | OK | |
| `/resources/downloads` | OK | |
| `/resources/tools` | OK | |
| `/about` | OK | |
| `/about/sponsors` | OK | |
| `/about/partner` | OK | |
| `/about/contact` | OK | |
| `/digital-literacy` | OK | redirects to `/community/government` |
| `/admin` | OK | login screen |
| `/superadmin` | OK | login screen |
| `/member` | OK | sign-in screen; needs Supabase env |
| `*` (`/does-not-exist`) | OK | redirects to `/` |

## 3. Supabase / env check (no changes made)

```
$ git diff main -- src/supabase.js src/components/SignupForm.jsx api/ supabase/config.toml supabase/migrations
(no output: identical to main)
```

- `SignupForm` still imports `{ supabase } from '../supabase'` (`src/supabase.js`, `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`) and still inserts into `rsvps`, then POSTs `/api/send-magic-link`. It is unchanged from main.
- **`ContactForm` (`src/components/forms/ContactForm.jsx`) does not use Supabase or any env var.** It builds a `mailto:hello@rgvaicoalition.com` link with the form fields. So it does not "point at the same client". It points at nothing server-side. This is how the rescue branch was written. It was left as-is because this mission bans feature and Supabase changes.

## 4. supabase/.temp removed from tracking

`.gitignore` gained:

```
# Supabase CLI local cache
supabase/.temp/
```

```
$ git rm -r --cached supabase/.temp
rm 'supabase/.temp/cli-latest'
rm 'supabase/.temp/gotrue-version'
rm 'supabase/.temp/linked-project.json'
rm 'supabase/.temp/pooler-url'
rm 'supabase/.temp/postgres-version'
rm 'supabase/.temp/project-ref'
rm 'supabase/.temp/rest-version'
rm 'supabase/.temp/storage-migration'
rm 'supabase/.temp/storage-version'
```

The files remain on disk locally (`ls supabase/.temp` still lists all 9). They are now untracked and ignored.

## 5. Em dash (U+2014) report: not changed

The scan covered `src/pages`, `src/content`, `src/components/{layout,forms,learn,ui}`, `SiteHeader.jsx`, `SiteFooter.jsx`, `src/App.jsx` and `index.html`. There are **58 occurrences in 12 files**. No `&mdash;` or `—` escapes were found.

```
$ grep -rn "—" src/pages src/content src/components/layout src/components/forms src/components/learn src/components/ui src/components/SiteHeader.jsx src/components/SiteFooter.jsx src/App.jsx index.html
src/pages/CommunityPages.jsx:17: title: 'Partner Organizations — RGV AI Coalition',
src/pages/CommunityPages.jsx:49: title: partner ? `${partner.name} — Partner` : 'Partner',
src/pages/CommunityPages.jsx:75: title: 'Cities & Government — RGV AI Coalition',
src/pages/CommunityPages.jsx:146: subject="Government Workshop Request — RGV AI Coalition"
src/pages/CommunityPages.jsx:161: title: content ? `${content.title} — RGV AI Coalition` : 'Community — RGV AI Coalition',
src/pages/CommunityPages.jsx:203: title: 'Volunteer — RGV AI Coalition',
src/pages/CommunityPages.jsx:219: <li>Workshop assistant — help attendees during hands-on sessions</li>
src/pages/CommunityPages.jsx:220: <li>Event coordinator — support setup, registration, and logistics</li>
src/pages/CommunityPages.jsx:221: <li>Community ambassador — share programs with local organizations</li>
src/pages/CommunityPages.jsx:222: <li>Mentor-in-training — support learners in future mentor programs</li>
src/pages/CommunityPages.jsx:227: subject="Volunteer Registration — RGV AI Coalition"
src/pages/EventsPages.jsx:17: title: 'Workshop Calendar — RGV AI Coalition',
src/pages/EventsPages.jsx:35: description="In-person and hybrid sessions across South Texas — from community introductions to government briefings."
src/pages/EventsPages.jsx:64: title: event ? `${event.title} — Events` : 'Event',
src/pages/PlatformHome.jsx:15: title: 'RGV AI Coalition — South Texas AI Learning Hub',
src/pages/PlatformHome.jsx:17: ogTitle: 'South Texas\'s AI Academy — RGV AI Coalition',
src/pages/AboutPages.jsx:12: title: 'About — RGV AI Coalition',
src/pages/AboutPages.jsx:13: description: 'South Texas AI education and workforce development — mission, impact, and leadership.',
src/pages/AboutPages.jsx:31: workshops, and curated resources — with links to official training from leading providers.
src/pages/AboutPages.jsx:53: title: 'Sponsors — RGV AI Coalition',
src/pages/AboutPages.jsx:85: title: 'Become a Partner — RGV AI Coalition',
src/pages/AboutPages.jsx:86: description: 'Partner with the Rio Grande Valley AI education platform — cities, schools, libraries, chambers, and sponsors.',
src/pages/AboutPages.jsx:109: subject="Partnership Inquiry — RGV AI Coalition"
src/pages/AboutPages.jsx:122: title: 'Contact — RGV AI Coalition',
src/pages/AboutPages.jsx:140: <ContactForm subject="General Inquiry — RGV AI Coalition" />
src/pages/LearnPages.jsx:23: title: 'Learn — RGV AI Coalition',
src/pages/LearnPages.jsx:36: description="Structured courses and learning paths designed for South Texas — with links to official resources from leading providers."
src/pages/LearnPages.jsx:67: title: 'Course Catalog — RGV AI Coalition',
src/pages/LearnPages.jsx:110: title: course ? `${course.title} — RGV AI Coalition` : 'Course — RGV AI Coalition',
src/pages/LearnPages.jsx:167: <p className="section-description">Continue learning on official provider platforms. We link to these resources — we do not copy their materials.</p>
src/pages/LearnPages.jsx:234: title: lesson ? `${lesson.title} — ${course.title}` : 'Lesson',
src/pages/LearnPages.jsx:288: title: 'Learning Paths — RGV AI Coalition',
src/pages/LearnPages.jsx:315: title: path ? `${path.title} — Learning Path` : 'Learning Path',
src/pages/LearnPages.jsx:359: title: instructor ? `${instructor.name} — Instructor` : 'Instructor',
src/pages/ResourcesPages.jsx:12: title: 'AI News — RGV AI Coalition',
src/pages/ResourcesPages.jsx:43: title: article ? `${article.title} — AI News` : 'Article',
src/pages/ResourcesPages.jsx:78: title: 'Prompt Library — RGV AI Coalition',
src/pages/ResourcesPages.jsx:115: title: 'Downloads — RGV AI Coalition',
src/pages/ResourcesPages.jsx:149: title: 'Tool Directory — RGV AI Coalition',
src/content/resources.js:67: title: 'Job Description — AI Skills Section',
src/content/resources.js:126: cta: { label: 'Request educator training', subject: 'Educator Training Request — RGV AI Coalition' },
src/content/resources.js:131: description: 'Learn how South Texas small businesses use AI for marketing, customer service, and operations — without hiring a full tech team.',
src/content/resources.js:133: cta: { label: 'Request a business workshop', subject: 'Small Business Workshop Request — RGV AI Coalition' },
src/content/resources.js:140: cta: { label: 'Request nonprofit training', subject: 'Nonprofit Training Request — RGV AI Coalition' },
src/content/events.js:17: title: 'AI for Beginners — McAllen Public Workshop',
src/content/courses.js:26: { slug: 'how-ai-works', title: 'How AI Works — Without the Jargon', durationMinutes: 20 },
src/content/courses.js:32: { title: 'AI for Beginners — Microsoft Learn', url: 'https://learn.microsoft.com/en-us/training/paths/ai-for-beginners/', provider: 'Microsoft Learn' },
src/content/courses.js:33: { title: 'Introduction to Artificial Intelligence — IBM SkillsBuild', url: 'https://skillsbuild.org/', provider: 'IBM SkillsBuild' },
src/content/courses.js:40: summary: 'Practical AI workflows for marketing, customer service, and operations — built for owners without a tech team.',
src/content/courses.js:90: { title: 'IBM SkillsBuild — Nonprofit resources', url: 'https://skillsbuild.org/', provider: 'IBM SkillsBuild' },
src/content/courses.js:117: { title: 'Digital.gov — Security resources', url: 'https://digital.gov/', provider: 'Digital.gov' },
src/content/courses.js:173: { title: 'Microsoft Learn — Prompt engineering', url: 'https://learn.microsoft.com/', provider: 'Microsoft Learn' },
src/content/courses.js:201: { title: 'Khan Academy — AI education resources', url: 'https://www.khanacademy.org/', provider: 'Khan Academy' },
src/content/courses.js:230: { title: 'Per Scholas — Tech workforce training', url: 'https://www.perscholas.org/', provider: 'Per Scholas' },
src/components/forms/ContactForm.jsx:24: .map((f) => `${f.charAt(0).toUpperCase() + f.slice(1)}: ${form[f] || '—'}`)
src/App.jsx:52: title: 'Event Registration — RGV AI Coalition Kickoff',
index.html:7: <meta property="og:title" content="RGV AI Coalition — South Texas AI Learning Hub" />
index.html:18: <title>RGV AI Coalition — South Texas AI Learning Hub</title>
```

Counts per file: CommunityPages.jsx 11, AboutPages.jsx 9, LearnPages.jsx 9, courses.js 9, ResourcesPages.jsx 5, resources.js 5, EventsPages.jsx 3, PlatformHome.jsx 2, index.html 2, events.js 1, ContactForm.jsx 1 (placeholder for an empty field in the mailto body), App.jsx 1.

Most of these are in `<title>`/meta strings (`usePageMeta` titles) and `mailto` subjects. The visible body copy is at CommunityPages.jsx:219-222, EventsPages.jsx:35, AboutPages.jsx:31, LearnPages.jsx:36 and 167, resources.js:131, courses.js:26 and 40, plus the course/resource/event titles in `src/content/`.

Outside the platform scope, the legacy components have 18 more: AdminDashboard.jsx 3, DigitalLiteracyPage.jsx 5, SignupForm.jsx 2, SuccessScreen.jsx 3, SuperAdminDashboard.jsx 5.
