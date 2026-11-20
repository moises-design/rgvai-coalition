// Content for /ai-for-nonprofits: the page and its deck
// (scripts/build-workshop-deck.py nonprofits). Same shape as
// aiForSmallBusiness.js. The slides show the `short` versions in large type;
// the full wording is on the page and in the speaker notes.
//
// The rule that shapes these prompts: AI must never invent a number. Grant
// and donor writing is where a made-up statistic does the most damage, so
// the prompts tell the AI to leave a marked gap for every real figure.

import { makeFill } from './workshopFill.js'

const BASE = '/ai-for-nonprofits'

export const NONPROFITS = {
  path: BASE,
  badge: 'Workshop',
  title: 'AI for Nonprofits',
  subtitle: 'Follow along with the slides. When we say laptops out, every prompt is here with a Copy button.',
  pdf: `${BASE}/ai-for-nonprofits-deck.pdf`,

  slides: [
    { title: 'AI for Nonprofits' },
    { title: 'Two backgrounds. One goal: more time for the mission.' },
    { title: 'What do you use AI for?' },
    { title: 'The work that never fits in the day' },
    { title: 'AI drafts. You decide.' },
    { title: 'Laptops out: this part is hands-on, not a lecture' },
    { title: 'Try it now, prompt 1: a grant paragraph' },
    { title: 'Try it now, prompt 2: a volunteer schedule' },
    { title: 'Try it now, prompt 3: a donor thank-you' },
    { title: 'Try it now, prompt 4: a safe starter for any task' },
    { title: 'One more thing: let AI build your survey form' },
    { title: 'Make it a routine' },
    { title: 'More mission, less paperwork' },
  ].map((slide, i) => ({ ...slide, number: i + 1, src: `${BASE}/slide-${String(i + 1).padStart(2, '0')}.jpg` })),

  laptopsSlide: 6,
  formSlide: 11,
  closeSlide: 13,

  jumpLinks: [
    { slide: 1, label: 'Start' },
    { slide: 6, label: 'Laptops out' },
    { slide: 7, label: 'Prompt 1' },
    { slide: 8, label: 'Prompt 2' },
    { slide: 9, label: 'Prompt 3' },
    { slide: 10, label: 'Prompt 4' },
    { slide: 11, label: 'Survey form' },
    { slide: 13, label: 'What next' },
  ],

  details: {
    storageKey: 'anp-organization',
    title: 'Your organization',
    lead: 'Every prompt runs as pasted with a sample organization. Type your details here and they replace the sample in every prompt. Organization details only, never information about clients or donors. They stay in this browser and are not sent anywhere.',
    fields: [
      { key: 'org', label: 'Organization name', autoComplete: 'organization' },
      { key: 'city', label: 'City', autoComplete: 'address-level2' },
      { key: 'program', label: 'Your main program', autoComplete: 'off' },
      { key: 'phone', label: 'Office phone', autoComplete: 'tel', type: 'tel' },
    ],
    // Fictional: the phone uses the reserved 555 exchange.
    sample: {
      org: 'Sample Community Pantry',
      city: 'Edinburg, Texas',
      program: 'weekend food pantry',
      phone: '(956) 555-0100',
    },
  },

  promptsLead: 'Use the AI tool your organization has approved, and sample details only. Never type in client names, case details or donor information. Run each prompt, then check one thing before you use the answer.',

  prompts: [
    {
      id: 'prompt-1',
      slide: 7,
      title: 'Prompt 1: a grant paragraph',
      short: 'Write one paragraph on the need our program meets. Use only these facts. Where a number belongs, write [NUMBER NEEDED].',
      shortCheck: 'Did it invent a number?',
      lead: 'Copy this into your AI tool, run it, and check the result before we move on.',
      text: 'You help write grant applications for {{org}} in {{city}}. Write one paragraph, under 120 words, describing the need our {{program}} meets. Use only these facts: the program is run by volunteers, it is open every weekend, and more families have asked for help this year than last. Do not invent statistics, dollar amounts, or numbers of people served. Wherever a real number would make the paragraph stronger, write [NUMBER NEEDED] so I can add the true figure. Finish with a list of every fact I should verify before submitting.',
      check: 'Did it invent any number, percentage or dollar amount? Every figure should be a [NUMBER NEEDED] gap.',
      next: 'Fill the gaps with your real numbers, then ask it to tighten the paragraph without changing them.',
    },
    {
      id: 'prompt-2',
      slide: 8,
      title: 'Prompt 2: a volunteer schedule',
      short: 'Schedule 9 volunteers across 3 stations, 8 AM to noon. At least 2 per station. Everyone gets one break.',
      shortCheck: 'Count each time block yourself.',
      lead: 'Run it, then count one time block by hand.',
      text: 'You coordinate volunteers for {{org}}. Build a schedule for a Saturday event from 8:00 AM to 12:00 PM with three stations: check-in, sorting, and distribution. I have 9 volunteers; call them Volunteer 1 through Volunteer 9. Every station needs at least 2 people at all times, and every volunteer gets one 15-minute break. Show the schedule as a table in 30-minute blocks. Then list any block where a station has fewer than 2 people.',
      check: 'Pick two time blocks and count the people at each station yourself. Does everyone have exactly one break?',
      next: 'Change it to 7 volunteers and ask what has to give.',
    },
    {
      id: 'prompt-3',
      slide: 9,
      title: 'Prompt 3: a donor thank-you',
      short: 'Write a thank-you note to a donor. Under 90 words. No dollar amounts, no numbers helped. English, then Spanish.',
      shortCheck: 'Did it promise or count anything?',
      lead: 'Run it, then read the Spanish version out loud before you trust it.',
      text: 'Write a thank-you note from {{org}} to a donor who gave to our {{program}}. Keep it under 90 words. Be warm and specific about what the gift supports, without stating a dollar amount or how many people it helped. Do not give tax advice; say a receipt will follow separately. Use [DONOR NAME] as a placeholder and do not ask me for the donor’s real name. Write it in English, followed by Spanish.',
      check: 'Did it state an amount, a number of people, or a tax promise you never supplied? Read the Spanish out loud.',
      next: 'Ask for a shorter version for a handwritten card.',
    },
    {
      id: 'prompt-4',
      slide: 10,
      title: 'Prompt 4: a safe starter for any task',
      short: 'My task: write a post asking for volunteers. Use only the facts I give you. No client stories. Ask me instead of guessing.',
      shortCheck: 'Did it add anything you never supplied?',
      lead: 'Use this frame for any task. Change the task sentence, keep the rules.',
      text: 'You are an assistant for {{org}} in {{city}}. My task: write a short social media post asking for volunteers for our {{program}}. Use only the facts I give you: we need help on Saturday mornings, no experience is needed, and people can call {{phone}} to sign up. Do not use or ask for the names or stories of the people we serve, and do not mention donors. Do not invent numbers, awards, or promises. Write in plain language, in English, followed by Spanish. If you need a fact I did not give you, ask me instead of guessing. Finish with a short list of anything I should confirm before posting.',
      check: 'Did it add a fact, a number, or a story you never supplied? Read the Spanish out loud.',
      next: 'Change only the task sentence, for example a board meeting agenda or an event announcement, and run it again.',
    },
  ],

  formDemo: {
    id: 'survey-form',
    title: 'Volunteer survey: how was your shift?',
    lead: 'Describe the survey. Let AI write it.',
    text: 'Create an anonymous volunteer survey for {{org}}. Title: How was your shift? Write four short questions. No names, no phone numbers, no email addresses.',
    steps: [
      { title: 'Ask any AI for the questions', body: 'Paste the prompt into the AI tool your organization has approved.' },
      { title: 'Google Forms: “Help me create a form”', body: 'At forms.google.com, start a blank form and paste the same prompt. Your Google account needs Gemini features for this.' },
      { title: 'Link to Sheets, then share the link', body: 'Find “Link to Sheets” in the Responses tab. Every answer lands in the sheet.' },
    ],
    slideNote: 'Surveying the people you serve? Keep it anonymous.',
    note: 'Start with volunteers. If you survey the people you serve, keep it anonymous: no names, addresses, or details about their situation. Ask for contact details only if you say on the form why you want them.',
  },

  laptopsSteps: [
    { title: 'Open your approved AI tool', short: 'The next four slides are prompts. Copy them from the page.', body: 'Sign in to the AI tool your organization has approved. The next four slides are complete prompts, ready to copy from the page exactly as written.' },
    { title: 'Use sample details only', short: 'Never client, case or donor information.', body: 'Never type in client names, case details or donor information. Every prompt here runs on a sample organization.' },
    { title: 'Run it, then check one thing', short: 'A confident answer can still be wrong.', body: 'A confident answer can still be wrong. Look for invented numbers, count the schedule by hand, and read the Spanish out loud.' },
    { title: 'Swap in your organization and run it again', short: 'Use the Your organization box. Still no client details.', body: 'Type your real organization name, city, program and phone into the Your organization box on the page, still with no client or donor details, and compare the two results.' },
  ],

  closing: {
    title: 'Want this for your team or board?',
    body: 'We bring the slides, this follow-along page and the QR codes. You bring the room.',
  },

  deck: {
    slug: 'ai-for-nonprofits',
    tagline: 'More mission, less paperwork.',
    presenters: [
      { name: 'Moises Segovia', side: 'Founder, RGV AI Coalition', items: ['Owner, Life Star EMS', 'Co-owner, Rio Care EMS', 'Former EMT', 'Building Vital Care'] },
      { name: 'Rich Gomez', side: 'Marketing and systems', items: ['15+ years in marketing', 'Biomed tech in clinics', 'Builds follow-up automation'] },
    ],
    goal: 'more time for the mission.',
    problem: {
      cards: [
        ['Grants', 'Deadlines that never stop.'],
        ['Volunteers', 'Schedules, reminders, no-shows.'],
        ['Donors', 'Every gift deserves a thank-you.'],
        ['Outreach', 'Posts, flyers, newsletters.'],
      ],
      notes: 'Ask the room which of these fell behind this month. Grant deadlines, volunteer scheduling, thanking donors, and outreach all compete with the work the organization exists to do, usually with a small staff or none.',
    },
    rules: {
      bullets: [
        ['Never let it invent a number.', ' Leave a gap for the real one.'],
        ['No client or donor data.', ' Names and stories stay out.'],
        ['Check before you send.', ' Confident can still be wrong.'],
      ],
      cardTitle: 'Your name is on it.',
      cardBody: 'AI writes the first draft. You sign the last one.',
      notes: 'Never let it invent a number: a made-up statistic in a grant application or donor letter can cost trust and funding. Tell the AI to mark a gap, then add the true figure yourself.\\nNo client or donor data: names, case details, stories and giving history stay out of the AI tool.\\nCheck before you send: a confident answer can still be wrong.\\n\\nAI writes the first draft. You sign the last one.',
    },
    habit: {
      items: [
        ['Each grant: draft, then add real numbers', 'Prompt 1. Fill every gap yourself.'],
        ['Before each event: build the schedule', 'Prompt 2. Count one block by hand.'],
        ['Each week: thank your donors', 'Prompt 3. Read it before you sign it.'],
      ],
      notes: 'Each grant: draft the narrative with prompt 1, then fill every [NUMBER NEEDED] gap with a real figure.\\nBefore each event: build the volunteer schedule with prompt 2 and count one block by hand.\\nEach week: draft donor thank-you notes with prompt 3, and read each one before you sign it.\\n\\nThe point is a routine, so the paperwork stops crowding out the mission.',
    },
    closeLine: 'The prompts stay online. Bring this workshop to your team.',
  },
}

export const fillNonprofit = makeFill(NONPROFITS.details)
