// Content for /workshops. Keep it honest: a workshop is `ready` only when its
// page and deck exist. Everything else is offered on request, and no event
// counts, attendance numbers or testimonials are stated here.

export const CONTACT_EMAIL = 'hello@rgvaicoalition.com'

export function mailtoLink(subject) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

export const WORKSHOPS = [
  {
    id: 'healthcare',
    title: 'AI for Healthcare Front Desks',
    audience: 'Clinics and medical offices',
    examples: ['Appointment reminders', 'A no-show check', 'A bilingual service flyer'],
    ready: true,
    to: '/ai-for-healthcare',
  },
  {
    id: 'small-business',
    title: 'AI for Small Business',
    audience: 'Owners and their teams',
    examples: ['Replies to customer reviews', 'A week of social posts', 'A quote follow-up'],
    ready: true,
    to: '/ai-for-small-business',
  },
  {
    id: 'nonprofits',
    title: 'AI for Nonprofits',
    audience: 'Staff, boards and volunteers',
    examples: ['A grant paragraph', 'A volunteer schedule', 'A donor thank-you'],
    ready: true,
    to: '/ai-for-nonprofits',
  },
  {
    id: 'educators',
    title: 'AI for Educators',
    audience: 'Teachers and school staff',
    examples: ['A lesson plan', 'A grading rubric', 'A parent letter in English and Spanish'],
  },
  {
    id: 'government',
    title: 'AI for City and County Staff',
    audience: 'Local government teams',
    examples: ['A plain-language notice', 'A meeting summary', 'A resident FAQ'],
  },
]

// How every session runs. This is the format of the healthcare workshop.
export const FORMAT_STEPS = [
  { title: 'Start with a real problem', body: 'The work that eats your team’s day.' },
  { title: 'Laptops out', body: 'Everyone runs the same prompts, on sample data.' },
  { title: 'Check before you trust', body: 'Each prompt ends with one fact to verify.' },
  { title: 'Take it with you', body: 'Prompts and scripts stay online to copy later.' },
]

// What we bring and what a host provides.
export const HOST_WE_BRING = ['The slides and the presenters', 'A follow-along web page with copy buttons', 'QR codes for the tables']
export const HOST_YOU_BRING = ['A room and a screen', 'Wi-Fi for attendees', 'Your people, about an hour']
