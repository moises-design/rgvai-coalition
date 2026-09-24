export const learningPaths = [
  {
    slug: 'community-ai-foundations',
    title: 'Community AI Foundations',
    summary: 'Start here if you are new to AI and want practical skills for everyday life, school, or work.',
    audiences: ['community', 'students'],
    courseSlugs: ['ai-for-beginners', 'responsible-ai-use', 'prompt-engineering-everyday-work'],
    estimatedHours: 4,
  },
  {
    slug: 'workforce-ai-readiness',
    title: 'Workforce AI Readiness',
    summary: 'Build job-ready AI skills for South Texas employers, workforce programs, and career changers.',
    audiences: ['community', 'government'],
    courseSlugs: ['ai-for-beginners', 'prompt-engineering-everyday-work', 'workforce-readiness-ai', 'digital-safety-basics'],
    estimatedHours: 6,
  },
  {
    slug: 'small-business-ai',
    title: 'Small Business AI Adoption',
    summary: 'Adopt AI tools responsibly to save time, reach customers, and compete without hiring a tech team.',
    audiences: ['small-business'],
    courseSlugs: ['ai-for-beginners', 'ai-for-small-business', 'prompt-engineering-everyday-work', 'digital-safety-basics'],
    estimatedHours: 5,
  },
  {
    slug: 'educator-ai-literacy',
    title: 'Educator AI Literacy',
    summary: 'Bring AI into classrooms and professional development with policies, lesson support, and student safety.',
    audiences: ['educators'],
    courseSlugs: ['ai-for-beginners', 'responsible-ai-use', 'ai-tools-educators', 'digital-safety-basics'],
    estimatedHours: 5,
  },
  {
    slug: 'nonprofit-digital-impact',
    title: 'Nonprofit Digital Impact',
    summary: 'Use AI and digital tools to stretch staff capacity and serve communities more effectively.',
    audiences: ['nonprofits'],
    courseSlugs: ['ai-for-beginners', 'ai-for-nonprofits', 'responsible-ai-use', 'digital-safety-basics'],
    estimatedHours: 5,
  },
  {
    slug: 'public-sector-ai',
    title: 'Public Sector AI & Digital Literacy',
    summary: 'Training path for cities, counties, libraries, and public agencies serving South Texas residents.',
    audiences: ['government'],
    courseSlugs: ['digital-safety-basics', 'responsible-ai-use', 'prompt-engineering-everyday-work', 'workforce-readiness-ai'],
    estimatedHours: 6,
  },
]

export function getPath(slug) {
  return learningPaths.find((p) => p.slug === slug)
}
