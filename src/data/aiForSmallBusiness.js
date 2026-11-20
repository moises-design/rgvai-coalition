// Content for /ai-for-small-business: the page and its deck
// (scripts/build-deck-small-business.py reads this file).
// The slides show the `short` versions in large type; the full wording here
// is what the page shows and what goes in the speaker notes. {{tokens}} are
// filled with a sample business or the visitor's own details.

import { makeFill } from './workshopFill.js'

const BASE = '/ai-for-small-business'

export const SMALL_BUSINESS = {
  path: BASE,
  badge: 'Workshop',
  title: 'AI for Small Business',
  subtitle: 'Follow along with the slides. When we say laptops out, every prompt is here with a Copy button.',
  pdf: `${BASE}/ai-for-small-business-deck.pdf`,

  slides: [
    { title: 'AI for Small Business' },
    { title: 'Two backgrounds. One goal: give you time back.' },
    { title: 'What do you use AI for?' },
    { title: 'The work that waits until after closing' },
    { title: 'AI drafts. You decide.' },
    { title: 'Laptops out: this part is hands-on, not a lecture' },
    { title: 'Try it now, prompt 1: answer a review' },
    { title: 'Try it now, prompt 2: a week of posts' },
    { title: 'Try it now, prompt 3: follow up on a quote' },
    { title: 'Try it now, prompt 4: a safe starter for any task' },
    { title: 'One more thing: let AI build your survey form' },
    { title: 'Make it a weekly habit' },
    { title: 'Get your evenings back' },
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

  // The "Your business" box. Details stay in the visitor's browser.
  details: {
    storageKey: 'asb-business',
    title: 'Your business',
    lead: 'Every prompt runs as pasted with a sample business. Type your details here and they replace the sample in every prompt. Business details only, never customer information. They stay in this browser and are not sent anywhere.',
    fields: [
      { key: 'business', label: 'Business name', autoComplete: 'organization' },
      { key: 'city', label: 'City', autoComplete: 'address-level2' },
      { key: 'phone', label: 'Business phone', autoComplete: 'tel', type: 'tel' },
      { key: 'hours', label: 'Days and hours', autoComplete: 'off' },
    ],
    // Fictional: the phone uses the reserved 555 exchange.
    sample: {
      business: 'Sample Bakery',
      city: 'Edinburg, Texas',
      phone: '(956) 555-0100',
      hours: 'Tuesday through Saturday, 7:00 AM to 3:00 PM',
    },
  },

  promptsLead: 'Use the AI tool you already have, and sample details only. Never type in customer names, phone numbers or payment details. Run each prompt, then check one thing before you use the answer.',

  prompts: [
    {
      id: 'prompt-1',
      slide: 7,
      title: 'Prompt 1: answer a review',
      short: 'Write a reply to this 3-star review. Thank them, apologize for the wait once, invite them back. Under 60 words. No discount.',
      shortCheck: 'Did it promise anything you would not?',
      lead: 'Copy this into your AI tool, run it, and check the result before we move on.',
      text: 'You answer online reviews for {{business}} in {{city}}. Write a reply to this 3-star review: “The food was great but we waited 20 minutes and nobody told us why.” Thank the customer, apologize for the wait once, and invite them back. Keep it under 60 words. Do not offer a discount, do not make excuses, and do not admit fault for anything the review does not mention. Then give me a second version in Spanish.',
      check: 'Did it promise anything you would not, or add a detail the review never mentioned?',
      next: 'Paste in one of your own reviews, with the customer’s name removed.',
    },
    {
      id: 'prompt-2',
      slide: 8,
      title: 'Prompt 2: a week of posts',
      short: 'Write five short social posts for next week, one per weekday. Use only these facts. English, then Spanish.',
      shortCheck: 'Read the Spanish out loud.',
      lead: 'Run it, then add your own business details and run it again.',
      text: 'You write social media posts for {{business}} in {{city}}. Write five short posts for next week, one for each weekday. Use only these facts: we are open {{hours}}, our phone is {{phone}}, and this week every dozen comes with a free coffee. Keep each post under 40 words, in English, followed by Spanish. Use at most two hashtags per post. Do not invent prices, awards, or customer quotes. Finish with a list of anything I should confirm before posting.',
      check: 'Read the Spanish out loud. Did any post state a fact you never supplied?',
      next: 'Ask for one photo idea to go with each post.',
    },
    {
      id: 'prompt-3',
      slide: 9,
      title: 'Prompt 3: follow up on a quote',
      short: 'Write a friendly follow-up text for a customer who got a quote 5 days ago. Under 160 characters. No pressure.',
      shortCheck: 'Count the characters.',
      lead: 'Run it, then count the characters yourself.',
      text: 'You handle customer follow-up for {{business}}. A customer got a quote from us 5 days ago and has not answered. Write a friendly follow-up text message. Keep it under 160 characters. Say they can call {{phone}} with questions. No pressure, no deadline, and no discount. Show the character count. Then write a second, shorter version.',
      check: 'Count the characters with a tool. Does it pressure the customer or offer something you did not?',
      next: 'Ask for the same message in Spanish, under 160 characters.',
    },
    {
      id: 'prompt-4',
      slide: 10,
      title: 'Prompt 4: a safe starter for any task',
      short: 'My task: write a sign saying we are closed Monday. Use only the facts I give you. No customer information. Ask me instead of guessing.',
      shortCheck: 'Did it add anything you never supplied?',
      lead: 'Use this frame for any task. Change the task sentence, keep the rules.',
      text: 'You are an assistant for {{business}} in {{city}}. My task: write a sign for our door saying we are closed next Monday for a holiday and reopen Tuesday. Use only the facts I give you: our normal hours are {{hours}} and our phone is {{phone}}. Do not use or ask for customer names, phone numbers, or payment details. Do not invent prices, policies, or promises. Write in plain language, in English, followed by Spanish. If you need a fact I did not give you, ask me instead of guessing. Finish with a short list of anything I should confirm before using it.',
      check: 'Did it add a fact, a promise, or a policy you never supplied? Read the Spanish out loud.',
      next: 'Change only the task sentence, for example a job posting or a thank-you note to a regular, and run it again.',
    },
  ],

  // Slide 11: a presenter demo, not a fifth hands-on prompt.
  formDemo: {
    id: 'survey-form',
    title: 'Customer survey: how did we do?',
    lead: 'Describe the survey. Let AI write it.',
    text: 'Create an anonymous customer survey for {{business}}. Title: How did we do? Write four short questions. No names, no phone numbers, no email addresses.',
    steps: [
      { title: 'Ask any AI for the questions', body: 'Paste the prompt into the AI tool you use.' },
      { title: 'Google Forms: “Help me create a form”', body: 'At forms.google.com, start a blank form and paste the same prompt. Your Google account needs Gemini features for this.' },
      { title: 'Link to Sheets, then share the link', body: 'Find “Link to Sheets” in the Responses tab. Every answer lands in the sheet.' },
    ],
    slideNote: 'Keep it anonymous. Ask for contact details only if you say why.',
    note: 'Keep the survey anonymous. If you do ask for a name, phone or email, say on the form why you want it and how you will use it.',
  },

  // Slide 6 steps.
  laptopsSteps: [
    { title: 'Open your AI tool', short: 'The next four slides are prompts. Copy them from the page.', body: 'Sign in to the AI tool you already use. The next four slides are complete prompts, ready to copy from the page exactly as written.' },
    { title: 'Use sample details only', short: 'Never customer names, numbers or cards.', body: 'Never type in customer names, phone numbers or payment details. Every prompt here runs on a sample business.' },
    { title: 'Run it, then check one thing', short: 'A confident answer can still be wrong.', body: 'A confident answer can still be wrong. Count the characters, read the Spanish out loud, and check that the draft added nothing you did not supply.' },
    { title: 'Swap in your business and run it again', short: 'Use the Your business box. Still no customer details.', body: 'Type your real business name, city, hours and phone into the Your business box on the page, still with no customer details, and compare the two results.' },
  ],

  closing: {
    title: 'Want this for your group?',
    body: 'We bring the slides, this follow-along page and the QR codes. You bring the room.',
  },

  // Text for the slides that are not prompts (scripts/build-workshop-deck.py).
  // `notes` is the fuller wording, kept in the speaker notes.
  deck: {
    slug: 'ai-for-small-business',
    tagline: 'Get your evenings back.',
    presenters: [
      { name: 'Moises Segovia', side: 'Runs businesses here', items: ['Owner, Life Star EMS', 'Co-owner, Rio Care EMS', 'Former EMT', 'Building Vital Care'] },
      { name: 'Rich Gomez', side: 'Marketing and systems', items: ['15+ years in marketing', 'Biomed tech in clinics', 'Builds follow-up automation'] },
    ],
    goal: 'less busywork after closing.',
    problem: {
      cards: [
        ['Reviews', 'Every one deserves an answer.'],
        ['Social posts', 'A week of them, every week.'],
        ['Quotes', 'Sent, then never chased.'],
        ['Follow-ups', 'The first thing to slip.'],
      ],
      notes: 'Ask the room which of these they did last night. Reviews that need an answer, the week of social posts, quotes that were sent and never chased, and follow-ups with customers. None of it is the work they opened the business to do.',
    },
    rules: {
      bullets: [
        ['Use only your facts.', ' Tell it what is true.'],
        ['No customer data.', ' Names, numbers and cards stay out.'],
        ['Check before you post.', ' Confident can still be wrong.'],
      ],
      cardTitle: 'You are still the owner.',
      cardBody: 'AI writes the first draft. You approve the last one.',
      notes: 'Use only your facts: tell the AI what is true, and tell it not to invent prices, awards or quotes.\nNo customer data: names, phone numbers and payment details stay out of the AI tool.\nCheck before you post: a confident answer can still be wrong. Read it, count it, read the Spanish out loud.\n\nAI writes the first draft. You approve the last one.',
    },
    habit: {
      items: [
        ['Monday: plan the week of posts', 'Prompt 2. Schedule them and you are done.'],
        ['Every day: answer new reviews', 'Prompt 1. Read each reply before you post.'],
        ['Friday: follow up on open quotes', 'Prompt 3. One short text each.'],
      ],
      notes: 'Monday: plan the week of posts with prompt 2, then schedule them.\nEvery day: answer new reviews with prompt 1, and read each reply before you post it.\nFriday: follow up on open quotes with prompt 3, one text each.\n\nThe point is a routine, so the work stops waiting until after closing.',
    },
    closeLine: 'The prompts stay online. Bring this workshop to your group.',
  },
}

export const fillBusiness = makeFill(SMALL_BUSINESS.details)
