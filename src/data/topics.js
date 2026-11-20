// Topics on the "Learn or teach" board. This one list feeds the board, the
// results strip, the reminder email buttons, the dashboard and the API, so
// add, rename or remove a topic here only. Keep each `id` once it has votes:
// answers are stored by id.
export const TOPICS = [
  { id: 'basics', label: 'Getting started with AI', hint: 'ChatGPT, Claude and Gemini, from zero', inEmail: true },
  { id: 'prompts', label: 'Writing better prompts', hint: 'Ask clearly, get useful answers' },
  { id: 'business', label: 'AI for my business', hint: 'Customer replies, quotes, marketing', inEmail: true },
  { id: 'automation', label: 'Automating repetitive work', hint: 'Let the busywork run itself', inEmail: true },
  { id: 'agents', label: 'AI agents', hint: 'AI that takes steps for you', inEmail: true },
  { id: 'building', label: 'Building apps with AI', hint: 'From an idea to a working app' },
  { id: 'content', label: 'Images, video and voice', hint: 'Create media with AI tools' },
  { id: 'data', label: 'Spreadsheets and data', hint: 'Clean it, sum it up, chart it' },
  { id: 'safety', label: 'Privacy, safety and trust', hint: 'What to share and what to keep out' },
  { id: 'careers', label: 'AI skills for jobs', hint: 'Resumes, interviews, new skills' },
]

export const TOPIC_IDS = TOPICS.map(topic => topic.id)

// The public results strip stays hidden until this many people have answered,
// so a handful of early answers is never presented as what the Valley wants.
export const RESULTS_MIN_PEOPLE = 10
