# AGENTS.md: rgvai-coalition (RGV AI Coalition)

> PROPOSED draft (Oct 10, 2026), not committed. Needs Moises's approval, then lands via PR (never a direct push to main).

## Stack
Unverified; read package.json/README before working.

## Commands
npm scripts in `package.json` (npm; lockfile is `package-lock.json`). `README.md` is the Vite template and does not document these. There is no `test` script.
- `npm run dev` — Vite dev server
- `npm run build` — production build (`vite build`)
- `npm run lint` — `eslint .`
- `npm run preview` — preview the production build

## Branch and merge workflow
Feature branch -> PR -> Moises approves -> merge to default branch. Never push to main directly.

## Standing rules (from Alfred, approved by Moises Oct 10)
Evidence before "done": When you report a mission complete, include the tests or checks you actually ran and their results, the list of changed files, and the deploy or preview link if there is one. Then list plainly what you did not verify. Without evidence, report it as unverified, not done.

Failed checks: If a check fails (yours, mine, or Startup QA Bot's), send the work back with the exact gap named: the failing test, the broken step, or the missing evidence. If the same task fails twice, stop retrying. Re-scope it or split it into smaller pieces and tell me the new plan.

Independent check: Treat Startup QA Bot's findings as the independent check on shipped work. Don't call a release verified while its open findings remain unaddressed. Say which ones are still open.

Repo rules files: Her Cycle, Cherish Us, and Vital Care each keep an AGENTS.md at the repo root holding standing security, privacy, and launch decisions. Read it before changing the repo, and add new decisions to it, not just to chat. Health-data must-pass items for these repos:
- No health data, or pages that imply a health condition, goes to ad pixels, analytics, or session-replay tools.
- Keep an inventory of every tool or vendor that receives data from health screens, and update it whenever one is added.

Launch-readiness audit: Run a launch-readiness audit (data access, third parties, privacy paperwork, consent, health data, payments, email) before each release. Run it again whenever a vendor, form, price, or AI feature is added or changed. Report each item as pass, fail, or unverified with file and line, and fix nothing without my approval.

## Safety rules
- No fabricated data: no invented testimonials, reviews, stats, customers, logos or test results. Mark unknowns "unverified".
- Evidence before done: list the commands run and their output, changed files, and the preview/deploy link. Say what was not verified.
- Secrets: never commit .env files, keys or tokens. Only .env.example with placeholders. Production env vars change only with approval.
- Migrations: additive and reversible where possible; tested locally; applied to production only with Moises's explicit approval.
- No destructive or external actions (deleting data, force-push, sending email/SMS, changing billing/Stripe/DNS) without approval.
- Record new standing decisions in this file, not just in chat.

## Launch-readiness audit
Before each release, and whenever a vendor, form, price or AI feature changes: check data access, third parties, privacy paperwork, consent, health data, payments and email. Report each as pass/fail/unverified with file:line. Fix nothing without approval.

## Decisions log
- Nov 18, 2026: `/ai-for-healthcare` hosts the AI Front Desk workshop deck. The address and its `#laptops` / `#slide-N` links are printed on QR codes (`public/ai-for-healthcare/qr-laptops.png`), so do not rename the route or renumber the slides without reissuing the QR code. (Nov 19: a fourth prompt was inserted as slide 16; slides 1 to 15 kept their numbers, so the QR code is unaffected.)
- Nov 18, 2026: The "Book your front desk review" form (`api/front-desk-review.js`, table `front_desk_review_requests`) collects clinic business contact details only. It must never ask for patient information.
- Nov 19, 2026: On `/ai-for-healthcare` the copyable prompts use sample clinic values (or the visitor's own, typed into the "Your clinic" box and kept only in their browser) instead of the slides' [brackets], so the page text intentionally differs from the slide images. The take-home scripts keep [date] and [time] brackets.
- Nov 19, 2026: The whole workshop deck is built by `scripts/build-deck.py` as an editable PowerPoint, then rendered to the PDF and slide images in `public/ai-for-healthcare/`. Prompt and script text comes from `src/data/aiForHealthcare.js`; other slide text and the layout live in the script. Change the deck there and rerun it; do not hand-edit the slide images. Minimum text size on slides is 13pt (Moises asked for larger text on Nov 19).
- Nov 19, 2026: Site redesign (Moises asked for a modern, light, Apple-style site that makes AI feel trustworthy). The whole site is light; do not reintroduce the dark theme. Colors and fonts are tokens in `src/index.css` (the `--cyan` names are kept from the old theme and now hold the brand blue). Shared header, footer and control styles are in `src/theme.css`, the home page in `src/home.css`. The `.afh-page` palette on `/ai-for-healthcare` still matches the workshop deck and is unchanged.
- Nov 19, 2026: New logo: a white "V" with a dot above it (the Valley, and a person with arms raised) on a blue, violet and coral gradient. Sources are `src/components/Logo.jsx` and `public/favicon.svg`; `public/apple-touch-icon.png` and `public/og-image.png` are rendered from the same mark. The old round logo `public/rgvai-logo.png` is kept only so old links keep working.
- Nov 19, 2026: The home page is a coalition landing page, not an event page. Do not hard-code meeting dates or venues in the site; the next meeting lives in the database and shows in the member portal. The home form still writes to the `rsvps` table and now reads "Join the coalition". The home page states no member counts, testimonials or statistics; add them only when there is a real source.
- Nov 19, 2026: The 3D hero (`src/components/HeroOrb.jsx`) is hand-written canvas code with no 3D library, to keep the page fast. It pauses off screen and shows a still frame for visitors who ask for reduced motion; keep both behaviors.
