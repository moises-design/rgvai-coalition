export const newsArticles = [
  {
    slug: 'south-texas-ai-learning-hub-launch',
    title: 'RGV AI Coalition Launches South Texas AI Learning Hub',
    date: '2026-06-28',
    category: 'announcement',
    excerpt: 'A new regional platform offers free and low-cost AI training for residents, schools, businesses, and public agencies.',
  },
  {
    slug: 'mcallen-library-partnership',
    title: 'McAllen Public Library Partners on Community AI Workshops',
    date: '2026-06-15',
    category: 'partnership',
    excerpt: 'Monthly beginner workshops will help residents build confidence with AI and digital tools.',
  },
  {
    slug: 'workforce-ai-skills-report',
    title: 'South Texas Employers Increasingly Seek AI-Ready Candidates',
    date: '2026-05-30',
    category: 'workforce',
    excerpt: 'Regional workforce boards report growing demand for digital and AI fluency across industries.',
  },
  {
    slug: 'educator-institute-registration-open',
    title: 'Educator AI Summer Institute Registration Now Open',
    date: '2026-05-22',
    category: 'education',
    excerpt: 'K-12 and higher-ed instructors can register for a full-day professional development session in Brownsville.',
  },
]

export function getArticle(slug) {
  return newsArticles.find((a) => a.slug === slug)
}

export const prompts = [
  {
    slug: 'meeting-summary',
    title: 'Meeting Summary for Staff',
    category: 'workplace',
    audience: 'government',
    body: 'Summarize the following meeting notes into three sections: Key Decisions, Action Items with owners, and Open Questions. Use plain language suitable for a public sector audience. Notes: [paste notes here]',
  },
  {
    slug: 'customer-follow-up',
    title: 'Customer Follow-Up Email',
    category: 'business',
    audience: 'small-business',
    body: 'Write a friendly follow-up email to a customer who inquired about [product/service]. Include: acknowledgment of their question, a clear answer, one helpful resource, and a call to schedule. Tone: professional and warm. Keep under 150 words.',
  },
  {
    slug: 'lesson-plan-outline',
    title: 'Lesson Plan Outline',
    category: 'education',
    audience: 'educators',
    body: 'Create a 45-minute lesson plan outline for [grade level] on [topic]. Include learning objectives, a hook activity, guided practice, independent practice, and a formative assessment. Note where students may use AI as a tool and where they must show original work.',
  },
  {
    slug: 'grant-program-description',
    title: 'Grant Program Description',
    category: 'nonprofit',
    audience: 'nonprofits',
    body: 'Draft a 200-word program description for a grant application. Program: [name]. Population served: [describe]. Outcomes: [list 2-3]. Tone: evidence-based and community-centered. Avoid jargon.',
  },
  {
    slug: 'job-description-ai-skills',
    title: 'Job Description — AI Skills Section',
    category: 'workforce',
    audience: 'government',
    body: 'Add a "Digital & AI Skills" section to a job description for [role title]. Include 4-5 realistic expectations for AI tool use, data privacy awareness, and continuous learning. Avoid requiring unnecessary technical credentials.',
  },
  {
    slug: 'community-announcement',
    title: 'Community Event Announcement',
    category: 'civic',
    audience: 'community',
    body: 'Write a community announcement for a free workshop on [topic] at [location] on [date]. Include who should attend, what they will learn, how to register, and accessibility accommodations. Tone: welcoming and clear.',
  },
]

export const downloads = [
  { title: 'Government Partnership Guide', description: 'Overview of programs, scheduling, and collaboration options for cities and counties.', category: 'government', fileType: 'PDF' },
  { title: 'Classroom AI Policy Template', description: 'Editable template for schools developing responsible AI use policies.', category: 'education', fileType: 'DOCX' },
  { title: 'Small Business AI Readiness Checklist', description: 'Self-assessment for owners evaluating AI tools and workflows.', category: 'business', fileType: 'PDF' },
  { title: 'Digital Safety Quick Reference', description: 'One-page guide to passwords, phishing, and safe sharing habits.', category: 'safety', fileType: 'PDF' },
  { title: 'Volunteer Onboarding Packet', description: 'Roles, expectations, and code of conduct for coalition volunteers.', category: 'community', fileType: 'PDF' },
]

export const tools = [
  { name: 'Microsoft Copilot', category: 'productivity', pricing: 'Freemium', url: 'https://www.microsoft.com/copilot', description: 'AI assistant integrated with Microsoft 365 for documents, email, and search.' },
  { name: 'Google Gemini', category: 'productivity', pricing: 'Freemium', url: 'https://gemini.google.com/', description: 'Google AI assistant for writing, research, and workspace tasks.' },
  { name: 'Canva AI', category: 'design', pricing: 'Freemium', url: 'https://www.canva.com/', description: 'Design and marketing visuals with AI-assisted templates.' },
  { name: 'Grammarly', category: 'writing', pricing: 'Freemium', url: 'https://www.grammarly.com/', description: 'Writing assistance for clarity, tone, and grammar.' },
  { name: 'Notion AI', category: 'productivity', pricing: 'Paid', url: 'https://www.notion.so/', description: 'Notes, wikis, and project docs with built-in AI features.' },
  { name: 'Otter.ai', category: 'meetings', pricing: 'Freemium', url: 'https://otter.ai/', description: 'Meeting transcription and summaries for teams and educators.' },
  { name: 'IBM SkillsBuild', category: 'learning', pricing: 'Free', url: 'https://skillsbuild.org/', description: 'Free digital and AI skills training from IBM.' },
  { name: 'Microsoft Learn', category: 'learning', pricing: 'Free', url: 'https://learn.microsoft.com/', description: 'Official Microsoft learning paths for AI, cloud, and productivity.' },
]

export const instructors = [
  {
    slug: 'moises-segovia',
    name: 'Moises Segovia',
    title: 'Founder, RGV AI Coalition',
    bio: 'Moises leads the coalition\'s mission to expand AI and digital literacy across South Texas through partnerships with cities, schools, libraries, and workforce organizations.',
    credentials: ['Regional AI education advocate', 'Workforce development partner', 'Community workshop facilitator'],
  },
]

export function getInstructor(slug) {
  return instructors.find((i) => i.slug === slug)
}

export const sponsors = [
  { name: 'Regional Workforce Partner', tier: 'Founding', description: 'Supporting free community workshops across the Rio Grande Valley.' },
  { name: 'South Texas Technology Council', tier: 'Program', description: 'Funding educator professional development and student pathways.' },
  { name: 'Community Foundation RGV', tier: 'Community', description: 'Investing in digital equity and nonprofit AI training programs.' },
]

export const sectorContent = {
  educators: {
    title: 'Educators',
    headline: 'AI literacy for classrooms, campuses, and professional development',
    description: 'Help teachers and faculty bring AI into learning environments with clear policies, practical tools, and student safety at the center.',
    recommendedPath: 'educator-ai-literacy',
    cta: { label: 'Request educator training', subject: 'Educator Training Request — RGV AI Coalition' },
  },
  'small-business': {
    title: 'Small Business',
    headline: 'Compete and grow with practical AI skills',
    description: 'Learn how South Texas small businesses use AI for marketing, customer service, and operations — without hiring a full tech team.',
    recommendedPath: 'small-business-ai',
    cta: { label: 'Request a business workshop', subject: 'Small Business Workshop Request — RGV AI Coalition' },
  },
  nonprofits: {
    title: 'Nonprofits',
    headline: 'Stretch your mission with modern digital tools',
    description: 'Training designed for nonprofit staff and volunteers who need to do more with limited time and resources.',
    recommendedPath: 'nonprofit-digital-impact',
    cta: { label: 'Request nonprofit training', subject: 'Nonprofit Training Request — RGV AI Coalition' },
  },
}
