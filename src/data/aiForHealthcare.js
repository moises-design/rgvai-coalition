// Content for /ai-for-healthcare, transcribed from the workshop deck
// (public/ai-for-healthcare/ai-front-desk-healthcare-deck.pdf).
// Keep the wording identical to the slides: attendees copy these verbatim.

export const DECK_PDF = '/ai-for-healthcare/ai-front-desk-healthcare-deck.pdf'

// Rich Gomez's public contact details for the "Book your front desk review"
// section, supplied by Moises on Nov 19, 2026. Empty values are not shown.
export const RICH_CONTACT = {
  name: 'Rich Gomez',
  email: 'richard+med@rebelleads.com',
  phone: '956-777-4567',
}

export const SLIDES = [
  { title: 'AI Front Desk Automation for Healthcare' },
  { title: 'Two backgrounds. One front desk problem we both know firsthand.' },
  { title: 'Your front desk is drowning in work that never stops' },
  { title: 'Missed calls and missed follow-up cost real money' },
  { title: 'An AI front desk that answers, books, and follows up' },
  { title: 'Your team stays in control at every step' },
  { title: 'Follow-up is where the money is recovered' },
  { title: 'Built for healthcare rules, not around them' },
  { title: 'Take this with you: the three-text reminder sequence' },
  { title: 'Take this with you: words your front desk can use verbatim' },
  { title: 'Take this with you: run your own numbers this week' },
  { title: 'Laptops out: this part is hands-on, not a lecture' },
  { title: 'Try it now, prompt 1: build your reminder sequence' },
  { title: 'Try it now, prompt 2: find your worst no-show day' },
  { title: 'Try it now, prompt 3: draft a bilingual service flyer' },
  { title: 'Doing it yourself is doable. Here is the real workload.' },
  { title: 'Done for you: we build it, run the pilot, and prove it' },
  { title: 'Let your front desk breathe again' },
].map((slide, i) => ({
  ...slide,
  number: i + 1,
  src: `/ai-for-healthcare/slide-${String(i + 1).padStart(2, '0')}.jpg`,
}))

export const LAPTOPS_SLIDE = 12
export const BOOK_SLIDE = 18

export const JUMP_LINKS = [
  { slide: 1, label: 'Start' },
  { slide: 9, label: 'Take-home scripts' },
  { slide: LAPTOPS_SLIDE, label: 'Laptops out' },
  { slide: 13, label: 'Prompt 1' },
  { slide: 14, label: 'Prompt 2' },
  { slide: 15, label: 'Prompt 3' },
  { slide: BOOK_SLIDE, label: 'Book a review' },
]

export const PROMPTS = [
  {
    id: 'prompt-1',
    slide: 13,
    title: 'Prompt 1: build your reminder sequence',
    lead: 'Copy this into your AI tool, run it, and check the result before we move on.',
    text: 'You coordinate scheduling for [clinic name]. Draft three short text reminders for an appointment on [date] at [time]: one for 7 days before, one for 2 days before, and one for the morning of. The office phone is [phone]. Tell patients to call the office if the appointment needs to change. Do not say patients can reply to the text. Keep each message under 160 characters. Show the send date, the message, and the character count. Then suggest two practical ways a two-person front desk could track cancellations and fill openings using its existing scheduling system and phone.',
    check: 'Count the characters with a tool, and confirm the dates and time match in all three texts.',
    next: 'Ask it to rewrite all three in Spanish, under 160 characters each, with the counts shown.',
  },
  {
    id: 'prompt-2',
    slide: 14,
    title: 'Prompt 2: find your worst no-show day',
    lead: 'Run it first on this training data, then swap in your own month of totals, no patient names needed.',
    text: 'You support operations at [clinic name]. Analyze this training dataset for one month: Monday 100 scheduled and 18 no-shows; Tuesday 80 and 8; Wednesday 100 and 12; Thursday 80 and 8; Friday 60 and 12. Calculate the no-show rate for each day and the overall rate, showing your arithmetic. Rank the days by rate. Explain why these totals cannot tell us what caused the pattern. Propose one two-week reminder pilot that a two-person front desk can run using the existing scheduling system and phone. Define a primary metric and a balancing metric. Do not claim the pilot has already improved results.',
    check: 'Redo the totals yourself, 58 no-shows out of 420 scheduled is 13.8%, and separate the highest rate, Friday at 20%, from the highest count.',
    next: 'Ask for a simple weekly pilot tracker.',
  },
  {
    id: 'prompt-3',
    slide: 15,
    title: 'Prompt 3: draft a bilingual service flyer',
    lead: 'Fill the brackets with your clinic, run it, and read the Spanish version out loud before you trust it.',
    text: 'You are the communications coordinator for [clinic name] in [city]. Write a service flyer in English, followed by Spanish, for our appointment scheduling assistance service. Staff help callers find an available appointment and explain what documents the office requests. Office hours are [days and hours]. Call [phone] to ask about scheduling. Use a clear headline, two short benefit statements, and one call to action in each language. Keep each version under 80 words. Use only these facts. Do not promise medical outcomes or same-day availability. Finish with a separate note listing anything the office should confirm before publishing.',
    check: 'Does the Spanish preserve every fact, the hours and the phone, and did the draft add a benefit you never supplied?',
    next: 'Shorten both versions for a square social post, keeping the phone and hours.',
  },
]

export const REMINDER_TEXTS = [
  {
    id: 'reminder-7',
    slide: 9,
    title: 'Seven days before',
    text: '[Clinic name] reminder: Your appointment is [date] at [time]. Need to change it? Call [office phone].',
  },
  {
    id: 'reminder-2',
    slide: 9,
    title: 'Two days before',
    text: '[Clinic name]: Your appointment is [date] at [time]. For changes, call [office phone].',
  },
  {
    id: 'reminder-0',
    slide: 9,
    title: 'Morning of the visit',
    text: '[Clinic name]: Appointment today at [time]. Need a change? Call [office phone].',
  },
]

export const REMINDER_NOTE =
  'Copy them as written, swap in your clinic name, date, time, and phone, and keep each one under 160 characters. Tell patients to call to change, never to reply to the text. Then keep a daily cancellation log and a call-back list of patients who agreed to be called about earlier openings, so a cancelled slot gets offered the same day.'

export const FRONT_DESK_SCRIPTS = [
  {
    id: 'script-opening',
    slide: 10,
    title: 'Every call, the opening',
    text: 'Thank you for calling [clinic name]. How can I help?',
    note: 'For scheduling, ask: “Are you calling to schedule or change an appointment?” Then offer only slots the system actually shows.',
  },
  {
    id: 'script-refill',
    slide: 10,
    title: 'Refill requests',
    text: 'Are you calling about a medication refill request? I can route your request to our clinical team. They handle refill decisions.',
    note: 'The front desk never approves medication or promises a completion time.',
  },
  {
    id: 'script-billing',
    slide: 10,
    title: 'Billing questions',
    text: 'Is your question about a statement or insurance payment? I can route your question to our billing coordinator.',
    note: 'The front desk never guarantees insurance payment.',
  },
  {
    id: 'script-review',
    slide: 10,
    title: 'A public review reply',
    text: 'Thank you for sharing this concern. Clear communication matters to our team. Please contact our office manager at [office phone] so we can listen and address your feedback privately.',
    note: 'Never confirm the reviewer was a patient.',
  },
]

export const WORKFLOW_OPTIONS = [
  'Missed calls',
  'Reminders and no-shows',
  'Billing follow-up',
  'Not sure yet',
]
