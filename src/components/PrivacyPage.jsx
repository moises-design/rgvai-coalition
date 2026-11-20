import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

const CONTACT_EMAIL = 'hello@rgvaicoalition.com'
const LAST_UPDATED = 'November 20, 2026'

// Keep this page in step with the code. When a form, vendor or tracking tool
// is added or changed, update the matching section here in the same PR.
const COLLECTED = [
  {
    title: 'Joining the coalition',
    what: 'Your name, email address, phone number if you choose to give it, and the AI tools you pick.',
    why: 'To add you as a member, send you meeting updates and reminders by email, and let you sign in to the member portal.',
  },
  {
    title: 'Member portal',
    what: 'Your email address, used to send you a sign-in link, and a record of the meetings you confirm you will attend.',
    why: 'To show you member announcements, meeting details and resources, and to plan for attendance.',
  },
  {
    title: 'Keeping sign-in safe',
    what: 'When someone asks for a sign-in link or types an admin password wrong, we keep a scrambled record of the email or network address used. It cannot be turned back into the original.',
    why: 'To limit repeated attempts, so nobody can flood your inbox or guess a password. These records are deleted after one day.',
  },
  {
    title: 'The “Learn or teach” board',
    what: 'The topics you tap, and anything you type in “What would you show?” or “Something else?”. Your email address only if you give it; we ask for it when you offer to teach. If you answer from a link in one of our emails, the answer is saved with the email address that message was sent to. Your browser also keeps a random number so you can change your answers later.',
    why: 'To choose what our meetups and workshops cover, and to contact people who offered to teach. The site shows totals for each topic only, never who answered.',
  },
  {
    title: 'Front desk review request',
    what: 'Your name, clinic or practice name, email address, phone number if you choose to give it, the workflow you select, and any message you write.',
    why: 'To contact you about the front desk review you asked for. The request is emailed to Rich Gomez, the workshop co-presenter who follows up.',
  },
  {
    title: 'The “Your clinic” box on the AI for Healthcare page',
    what: 'The clinic name, city, phone and hours you type are saved only in your own browser.',
    why: 'To fill in the workshop prompts for you. These details are never sent to us.',
  },
  {
    title: 'Visiting the site',
    what: 'Like every website, our hosting provider receives the technical details your browser sends with each request, such as your IP address and browser type.',
    why: 'To deliver the pages and keep the site running.',
  },
]

const SERVICES = [
  { name: 'Supabase', role: 'stores sign-ups, member records, review requests and “Learn or teach” answers, and handles member sign-in.' },
  { name: 'Vercel', role: 'hosts the website.' },
  { name: 'Resend', role: 'sends our emails, such as sign-in links, event reminders and review request notices.' },
  { name: 'Google Fonts', role: 'supplies the fonts on our pages, so Google receives your IP address when the fonts load.' },
]

export default function PrivacyPage() {
  usePageMeta({
    title: 'Privacy Policy — RGV AI Coalition',
    description: 'What information the RGV AI Coalition website collects, why, which services handle it, and how to ask us to change or delete it.',
    ogTitle: 'Privacy Policy — RGV AI Coalition',
    path: '/privacy',
  })

  return (
    <div className="page">
      <SiteHeader />

      <main className="dl-main privacy-main">
        <section className="dl-hero privacy-hero">
          <h1 className="dl-hero-title">Privacy Policy</h1>
          <p className="dl-hero-subtitle">
            What we collect on this website, why we collect it, and how to reach us about it.
          </p>
          <p className="privacy-updated">Last updated {LAST_UPDATED}</p>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Who we are</h2>
          <div className="dl-mission-card">
            <p>
              This website is run by RGV AI Coalition, a community group in Edinburg, Texas. If you have a
              question about your information, email us at{' '}
              <a className="privacy-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">What we collect and why</h2>
          <p className="dl-section-lead">We only collect what you give us through the forms on this site.</p>
          <div className="privacy-list">
            {COLLECTED.map(item => (
              <article key={item.title} className="dl-info-card">
                <h3 className="dl-card-title">{item.title}</h3>
                <p className="dl-card-body"><strong>What:</strong> {item.what}</p>
                <p className="dl-card-body"><strong>Why:</strong> {item.why}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Please do not send us patient information</h2>
          <div className="dl-highlight-card">
            <p>
              Our forms ask for business contact details only. Do not enter patient names, health details or
              any other patient information anywhere on this site. If you send some by mistake, email us and
              we will delete it.
            </p>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">What we do not do</h2>
          <div className="dl-mission-card">
            <ul className="privacy-bullets">
              <li>We do not sell your information.</li>
              <li>We do not use advertising pixels, analytics trackers or session-recording tools on this site.</li>
              <li>We do not use your information for anything other than the purposes listed above.</li>
            </ul>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Services that handle your information</h2>
          <p className="dl-section-lead">
            We rely on a small number of companies to run the site. They process information on our behalf.
          </p>
          <div className="dl-mission-card">
            <ul className="privacy-bullets">
              {SERVICES.map(service => (
                <li key={service.name}><strong>{service.name}</strong> {service.role}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">What is stored in your browser</h2>
          <div className="dl-mission-card">
            <p>
              If you sign in to the member portal, your browser keeps a sign-in record so you stay signed in.
              If you use the “Your clinic” box, your browser keeps what you typed. If you answer the “Learn or teach” board,
              your browser keeps your picks and a random number that lets you change them. We do not use advertising
              cookies. Clearing your browser’s site data removes all of this.
            </p>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Seeing, changing or deleting your information</h2>
          <div className="dl-mission-card">
            <p>
              We keep the information you give us until you ask us to remove it or we no longer need it.
              To see what we hold about you, correct it, or have it deleted, email{' '}
              <a className="privacy-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <p>
              Every meeting reminder we send has an Unsubscribe link. Using it stops the reminders and
              keeps your membership. Sign-in links you ask for are still sent.
            </p>
          </div>
        </section>

        <section className="dl-section">
          <h2 className="dl-section-title">Changes to this policy</h2>
          <div className="dl-mission-card">
            <p>
              If we change what we collect or which services we use, we will update this page and the date at
              the top.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
