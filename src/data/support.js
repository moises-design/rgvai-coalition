// Content for /support. Keep it honest: no member counts, attendance,
// testimonials or sponsor logos unless they are real, and no payments on the
// site. Every "what you get" line is a promise Moises has to keep, so change
// these only with his say-so.

// Set to true only once the coalition is a registered 501(c)(3) (or has a
// fiscal sponsor) and Moises confirms it. Until then the page says plainly
// that contributions are not tax-deductible.
export const IS_REGISTERED_NONPROFIT = false

export const WAYS_TO_SUPPORT = [
  {
    title: 'Sponsor a workshop',
    body: 'Cover a room, food or printing for one hands-on session.',
    gets: ['Named as the sponsor when the session opens', 'Named on that session’s invitation', 'A few minutes to greet the room'],
    subject: 'Sponsoring an RGV AI Coalition workshop',
    cta: 'Ask about sponsoring',
  },
  {
    title: 'Host us',
    body: 'Lend a room with a screen and Wi-Fi. We bring the session.',
    gets: ['A workshop built for your people', 'Slides, a follow-along page and table QR codes'],
    to: '/workshops',
    cta: 'See what hosting takes',
  },
  {
    title: 'Teach or mentor',
    body: 'Show something you built, or help a table during the hands-on part.',
    gets: ['A room of people who want to learn it', 'Your project on the showcase, if you want'],
    to: '/learn',
    cta: 'Tell us what you can teach',
  },
]

export const WHERE_SUPPORT_GOES = [
  'Rooms and Wi-Fi for hands-on sessions',
  'Printed table cards and handouts',
  'Food and water for attendees',
  'Keeping this website and its workshop pages free',
]
