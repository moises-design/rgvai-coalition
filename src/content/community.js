export const partners = [
  {
    slug: 'city-of-mcallen',
    name: 'City of McAllen',
    type: 'government',
    city: 'McAllen',
    summary: 'Partnering on public workforce AI literacy workshops and community technology access programs.',
    verified: true,
  },
  {
    slug: 'mcallen-chamber',
    name: 'McAllen Chamber of Commerce',
    type: 'chamber',
    city: 'McAllen',
    summary: 'Supporting small business AI adoption workshops and regional economic development initiatives.',
    verified: true,
  },
  {
    slug: 'mcallen-public-library',
    name: 'McAllen Public Library',
    type: 'library',
    city: 'McAllen',
    summary: 'Hosting free community AI and digital literacy classes for residents of all ages.',
    verified: true,
  },
  {
    slug: 'utrgv',
    name: 'The University of Texas Rio Grande Valley',
    type: 'university',
    city: 'Edinburg',
    summary: 'Collaborating on educator professional development, research partnerships, and student pathways.',
    verified: true,
  },
  {
    slug: 'united-way-rgv',
    name: 'United Way of Southern Cameron County',
    type: 'nonprofit',
    city: 'Harlingen',
    summary: 'Connecting nonprofit leaders with practical AI training to strengthen community programs.',
    verified: true,
  },
  {
    slug: 'rgv-workforce-solutions',
    name: 'Workforce Solutions Lower Rio Grande Valley',
    type: 'workforce',
    city: 'Weslaco',
    summary: 'Integrating AI readiness training into job seeker services and employer partnerships.',
    verified: true,
  },
]

export function getPartner(slug) {
  return partners.find((p) => p.slug === slug)
}

export const impactStats = [
  { value: '2,400+', label: 'Learners reached' },
  { value: '48', label: 'Workshops delivered' },
  { value: '18', label: 'Partner organizations' },
  { value: '8', label: 'Counties served' },
]

export const govPrograms = [
  { title: 'AI Literacy Programs', description: 'Foundational training for residents, staff, and community leaders on what AI is and how to use it responsibly.' },
  { title: 'Digital Literacy Programs', description: 'Internet safety, device skills, online services, and confidence-building for all ages.' },
  { title: 'Cybersecurity Awareness', description: 'Phishing prevention, password hygiene, and incident response basics for public employees and residents.' },
  { title: 'Employee Training', description: 'Department-specific workshops that help teams adopt AI tools without compromising public trust.' },
  { title: 'Community Workshops', description: 'Free or low-cost sessions hosted at libraries, community centers, and civic venues.' },
  { title: 'Senior Technology Classes', description: 'Patient, accessible instruction for older adults navigating smartphones, email, and online services.' },
  { title: 'Youth Programs', description: 'Age-appropriate AI and digital skills for students, with emphasis on creativity and critical thinking.' },
  { title: 'Teacher Professional Development', description: 'Support for school districts implementing classroom AI policies and educator training.' },
  { title: 'Grant Collaboration', description: 'Partnership on funding applications for regional digital equity and workforce initiatives.' },
  { title: 'Technology Assessments', description: 'Lightweight readiness reviews to help agencies plan responsible AI adoption.' },
]

export const govAudiences = [
  'Cities', 'Counties', 'School Districts', 'Universities', 'Economic Development', 'Libraries',
]

export const govFaqs = [
  {
    question: 'How do we schedule a workshop for our city or county?',
    answer: 'Submit a workshop request through our Government hub. We will follow up within three business days to confirm audience, goals, and logistics.',
  },
  {
    question: 'Can training be customized for our department?',
    answer: 'Yes. We tailor content for finance, public safety, parks and recreation, libraries, economic development, and other departments.',
  },
  {
    question: 'Do you support procurement and data privacy requirements?',
    answer: 'We provide documentation on data handling practices and can align sessions with your agency policies. We do not require access to sensitive government systems for standard workshops.',
  },
  {
    question: 'Is there a cost for government partnerships?',
    answer: 'Many introductory programs are grant-supported or sponsor-funded. Larger engagements are scoped based on audience size, duration, and customization.',
  },
]
