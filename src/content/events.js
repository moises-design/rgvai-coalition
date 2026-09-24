export const events = [
  {
    slug: 'rgv-ai-coalition-kickoff',
    title: 'RGV AI Coalition Community Kickoff',
    summary: 'Our founding gathering for builders, learners, educators, and curious minds across the Rio Grande Valley.',
    type: 'community',
    startAt: '2026-05-20T19:00:00-05:00',
    endAt: '2026-05-20T20:30:00-05:00',
    location: 'The Dog Stadium',
    address: '1402 N Closner Blvd, Ste A, Edinburg, TX 78541',
    capacity: 80,
    registrationOpen: true,
    featured: true,
  },
  {
    slug: 'ai-for-beginners-workshop-mcallen',
    title: 'AI for Beginners — McAllen Public Workshop',
    summary: 'Hands-on introduction to AI tools for residents, job seekers, and small business owners.',
    type: 'workshop',
    startAt: '2026-07-15T18:00:00-05:00',
    endAt: '2026-07-15T20:00:00-05:00',
    location: 'McAllen Public Library',
    address: '4001 N 23rd St, McAllen, TX 78504',
    capacity: 40,
    registrationOpen: true,
    featured: true,
  },
  {
    slug: 'government-ai-literacy-briefing',
    title: 'AI Literacy Briefing for Public Sector Leaders',
    summary: 'Executive briefing for city, county, and school district leaders on responsible AI adoption.',
    type: 'briefing',
    startAt: '2026-08-08T09:00:00-05:00',
    endAt: '2026-08-08T11:30:00-05:00',
    location: 'UTRGV Edinburg Campus',
    address: '1201 W University Dr, Edinburg, TX 78539',
    capacity: 60,
    registrationOpen: true,
    featured: false,
  },
  {
    slug: 'educator-ai-summer-institute',
    title: 'Educator AI Summer Institute',
    summary: 'Professional development for K-12 and higher-ed instructors on classroom AI policies and tools.',
    type: 'training',
    startAt: '2026-08-22T08:30:00-05:00',
    endAt: '2026-08-22T15:30:00-05:00',
    location: 'Brownsville Event Center',
    address: '1000 E Elizabeth St, Brownsville, TX 78520',
    capacity: 50,
    registrationOpen: true,
    featured: true,
  },
  {
    slug: 'nonprofit-ai-tools-lab',
    title: 'Nonprofit AI Tools Lab',
    summary: 'Practical lab for nonprofit directors and program staff on outreach, grants, and volunteer workflows.',
    type: 'workshop',
    startAt: '2026-09-12T13:00:00-05:00',
    endAt: '2026-09-12T16:00:00-05:00',
    location: 'Harlingen Chamber of Commerce',
    address: '311 E Tyler Ave, Harlingen, TX 78550',
    capacity: 35,
    registrationOpen: true,
    featured: false,
  },
  {
    slug: 'cybersecurity-awareness-community-day',
    title: 'Cybersecurity Awareness Community Day',
    summary: 'Free community training on passwords, phishing, and safe digital habits for families and seniors.',
    type: 'community',
    startAt: '2026-10-04T10:00:00-05:00',
    endAt: '2026-10-04T14:00:00-05:00',
    location: 'Weslaco Public Library',
    address: '525 S Kansas Ave, Weslaco, TX 78596',
    capacity: 100,
    registrationOpen: true,
    featured: false,
  },
]

export function getEvent(slug) {
  return events.find((e) => e.slug === slug)
}

export function formatEventDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  })
}

export function formatEventTime(startIso, endIso) {
  const opts = { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }
  const start = new Date(startIso).toLocaleTimeString('en-US', opts)
  const end = new Date(endIso).toLocaleTimeString('en-US', { ...opts, timeZoneName: 'short' })
  return `${start} – ${end}`
}
