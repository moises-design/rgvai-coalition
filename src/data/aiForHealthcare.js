// Content for /ai-for-healthcare, transcribed from the workshop deck
// (public/ai-for-healthcare/ai-front-desk-healthcare-deck.pdf).
// Wording follows the slides, except that the slides' [brackets] are written
// here as {{tokens}} so the page can fill them: with sample values (prompts)
// or the visitor's own clinic details (prompts and scripts). See fillTemplate.

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
  { title: 'Try it now, prompt 4: a safe starter for any front desk task' },
  { title: 'One more thing: let AI build your survey form' },
  { title: 'Doing it yourself is doable. Here is the real workload.' },
  { title: 'Done for you: we build it, run the pilot, and prove it' },
  { title: 'Let your front desk breathe again' },
].map((slide, i) => ({
  ...slide,
  number: i + 1,
  src: `/ai-for-healthcare/slide-${String(i + 1).padStart(2, '0')}.jpg`,
}))

export const LAPTOPS_SLIDE = 12
export const FORM_SLIDE = 17
export const BOOK_SLIDE = 20

export const JUMP_LINKS = [
  { slide: 1, label: 'Start' },
  { slide: 9, label: 'Take-home scripts' },
  { slide: LAPTOPS_SLIDE, label: 'Laptops out' },
  { slide: 13, label: 'Prompt 1' },
  { slide: 14, label: 'Prompt 2' },
  { slide: 15, label: 'Prompt 3' },
  { slide: 16, label: 'Prompt 4' },
  { slide: FORM_SLIDE, label: 'Survey form' },
  { slide: BOOK_SLIDE, label: 'Book a review' },
]

export const PROMPTS = [
  {
    id: 'prompt-1',
    slide: 13,
    title: 'Prompt 1: build your reminder sequence',
    lead: 'Copy this into your AI tool, run it, and check the result before we move on.',
    text: 'You coordinate scheduling for {{clinic}}. Draft three short text reminders for an appointment on {{date}} at {{time}}: one for 7 days before, one for 2 days before, and one for the morning of. The office phone is {{phone}}. Tell patients to call the office if the appointment needs to change. Do not say patients can reply to the text. Keep each message under 160 characters. Show the send date, the message, and the character count. Then suggest two practical ways a two-person front desk could track cancellations and fill openings using its existing scheduling system and phone.',
    check: 'Count the characters with a tool, and confirm the dates and time match in all three texts.',
    next: 'Ask it to rewrite all three in Spanish, under 160 characters each, with the counts shown.',
  },
  {
    id: 'prompt-2',
    slide: 14,
    title: 'Prompt 2: find your worst no-show day',
    lead: 'Run it first on this training data, then swap in your own month of totals, no patient names needed.',
    text: 'You support operations at {{clinic}}. Analyze this training dataset for one month: Monday 100 scheduled and 18 no-shows; Tuesday 80 and 8; Wednesday 100 and 12; Thursday 80 and 8; Friday 60 and 12. Calculate the no-show rate for each day and the overall rate, showing your arithmetic. Rank the days by rate. Explain why these totals cannot tell us what caused the pattern. Propose one two-week reminder pilot that a two-person front desk can run using the existing scheduling system and phone. Define a primary metric and a balancing metric. Do not claim the pilot has already improved results.',
    check: 'Redo the totals yourself, 58 no-shows out of 420 scheduled is 13.8%, and separate the highest rate, Friday at 20%, from the highest count.',
    next: 'Ask for a simple weekly pilot tracker.',
  },
  {
    id: 'prompt-3',
    slide: 15,
    title: 'Prompt 3: draft a bilingual service flyer',
    lead: 'Run it, then add your clinic details and run it again. Read the Spanish version out loud before you trust it.',
    text: 'You are the communications coordinator for {{clinic}} in {{city}}. Write a service flyer in English, followed by Spanish, for our appointment scheduling assistance service. Staff help callers find an available appointment and explain what documents the office requests. Office hours are {{hours}}. Call {{phone}} to ask about scheduling. Use a clear headline, two short benefit statements, and one call to action in each language. Keep each version under 80 words. Use only these facts. Do not promise medical outcomes or same-day availability. Finish with a separate note listing anything the office should confirm before publishing.',
    check: 'Does the Spanish preserve every fact, the hours and the phone, and did the draft add a benefit you never supplied?',
    next: 'Shorten both versions for a square social post, keeping the phone and hours.',
  },
  {
    id: 'prompt-4',
    slide: 16,
    title: 'Prompt 4: a safe starter for any front desk task',
    lead: 'Use this frame for any task. Change the task sentence, keep the rules.',
    text: 'You are a front desk assistant for {{clinic}} in {{city}}. My task: write a voicemail greeting for callers who reach us after hours. Use only the facts I give you: office hours are {{hours}} and the office phone is {{phone}}. Do not use or ask for patient names or any patient information. Do not give medical advice, approve medication, or promise insurance payment or same-day availability. Write in plain language a patient can follow quickly, in English, followed by Spanish. If you need a fact I did not give you, ask me instead of guessing. Finish with a short list of anything the office should confirm before using it.',
    check: 'Did it add a fact, a promise, or a policy you never supplied? Read the Spanish out loud.',
    next: 'Change only the task sentence, for example a no-show follow-up call script or a holiday closure notice, and run it again.',
  },
]

// Slide 17: a demo, not a fifth hands-on prompt. The presenter builds the form
// once on screen; attendees copy the prompt and try it back at the office.
// The example is a staff survey on purpose: it involves no patient information.
export const FORM_DEMO = {
  id: 'survey-form',
  slide: FORM_SLIDE,
  title: 'Staff survey: what slows down our front desk?',
  lead: 'Stop building forms one question at a time. Describe the survey and let AI draft it. Start with your own staff.',
  text: 'Create a short anonymous staff survey for the front desk team at {{clinic}}. Title it “What slows down our front desk?” Do not ask for names and do not collect email addresses. Question 1, multiple choice, required: Which task takes the most of your day? Choices: phones, check-in, scheduling, reminder calls, billing questions, refill requests, other. Question 2, scale from 1 (rarely) to 5 (all day): How often do calls go to voicemail because everyone is busy? Question 3, short answer: Which task would you hand off first if you could? Question 4, paragraph: What is one thing that would make your day easier? Do not ask about patients. If you cannot create the form yourself, write out the questions and choices so I can paste them into a form.',
  steps: [
    {
      title: 'Any AI tool writes the questions',
      body: 'Paste the prompt into the tool your office has approved. You get the questions and answer choices back in about a minute.',
    },
    {
      title: 'In Google Forms, Gemini builds the form',
      body: 'Go to forms.google.com, start a blank form, choose “Help me create a form”, and paste the same prompt. Your Google account needs Gemini features for this.',
    },
    {
      title: 'Link it to a sheet and share the link',
      body: 'In the Responses tab choose “Link to Sheets”, then send the form link to your team. Every answer lands in the sheet.',
    },
  ],
  note: 'Thinking of a patient survey next? Keep it anonymous: no names, birth dates, or visit details. Google’s HIPAA agreement is only for paid Google Workspace accounts, so never collect anything that identifies a patient in a free Gmail account. Texting a survey link needs the patient’s consent to be texted.',
}

export const REMINDER_TEXTS = [
  {
    id: 'reminder-7',
    slide: 9,
    title: 'Seven days before',
    text: '{{Clinic}} reminder: Your appointment is [date] at [time]. Need to change it? Call {{officePhone}}.',
  },
  {
    id: 'reminder-2',
    slide: 9,
    title: 'Two days before',
    text: '{{Clinic}}: Your appointment is [date] at [time]. For changes, call {{officePhone}}.',
  },
  {
    id: 'reminder-0',
    slide: 9,
    title: 'Morning of the visit',
    text: '{{Clinic}}: Appointment today at [time]. Need a change? Call {{officePhone}}.',
  },
]

export const REMINDER_NOTE =
  'Copy them as written, swap in your clinic name, date, time, and phone, and keep each one under 160 characters. Tell patients to call to change, never to reply to the text. Then keep a daily cancellation log and a call-back list of patients who agreed to be called about earlier openings, so a cancelled slot gets offered the same day.'

export const FRONT_DESK_SCRIPTS = [
  {
    id: 'script-opening',
    slide: 10,
    title: 'Every call, the opening',
    text: 'Thank you for calling {{clinic}}. How can I help?',
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
    text: 'Thank you for sharing this concern. Clear communication matters to our team. Please contact our office manager at {{officePhone}} so we can listen and address your feedback privately.',
    note: 'Never confirm the reviewer was a patient.',
  },
]

export const WORKFLOW_OPTIONS = [
  'Missed calls',
  'Reminders and no-shows',
  'Billing follow-up',
  'Not sure yet',
]

// Sample clinic used in the prompts until the visitor types their own details,
// so every prompt runs as pasted. Fictional: the phone uses the reserved 555
// exchange. The sample appointment date is computed in the page (a weekday
// about three weeks out) so the 7-day reminder always falls in the future.
export const SAMPLE_CLINIC = {
  clinic: 'Sample Family Clinic',
  city: 'Edinburg, Texas',
  phone: '(956) 555-0100',
  hours: 'Monday through Friday, 8:00 AM to 5:00 PM',
  time: '10:30 AM',
}

export const CLINIC_FIELDS = [
  { key: 'clinic', label: 'Clinic name', autoComplete: 'organization' },
  { key: 'city', label: 'City', autoComplete: 'address-level2' },
  { key: 'phone', label: 'Office phone', autoComplete: 'tel', type: 'tel' },
  { key: 'hours', label: 'Days and hours', autoComplete: 'off' },
]

const BRACKETS = {
  clinic: '[clinic name]',
  Clinic: '[Clinic name]',
  city: '[city]',
  phone: '[phone]',
  officePhone: '[office phone]',
  hours: '[days and hours]',
  date: '[date]',
  time: '[time]',
}

// Which of the visitor's fields each token reads.
const TOKEN_FIELD = { clinic: 'clinic', Clinic: 'clinic', city: 'city', phone: 'phone', officePhone: 'phone', hours: 'hours' }

// Splits a template into segments: plain text, the visitor's own value
// ('own'), a sample value ('sample'), or an unfilled [bracket] ('bracket').
// mode 'sample' falls back to SAMPLE_CLINIC; mode 'bracket' keeps the slide's
// [brackets] when the visitor has not supplied that detail.
export function fillTemplate(template, clinic, mode, sampleDate) {
  return template.split(/(\{\{\w+\}\})/).filter(Boolean).map(part => {
    const match = /^\{\{(\w+)\}\}$/.exec(part)
    if (!match) return { text: part, kind: 'text' }
    const token = match[1]
    const own = (clinic[TOKEN_FIELD[token]] || '').trim()
    if (own) return { text: own, kind: 'own' }
    if (mode === 'sample') {
      const sample = token === 'date' ? sampleDate : SAMPLE_CLINIC[TOKEN_FIELD[token] || token]
      if (sample) return { text: sample, kind: 'sample' }
    }
    return { text: BRACKETS[token] || part, kind: 'bracket' }
  })
}

// Slide 12 ("Laptops out") steps, used to rebuild that slide in the deck.
export const LAPTOPS_STEPS = [
  {
    title: 'Open your approved AI tool',
    body: 'Sign in to the tool your office has approved. The next four slides are complete prompts, ready to copy from the page exactly as written.',
  },
  {
    title: 'Use sample data only',
    body: 'Never type in real patient information. Every prompt here runs on a sample clinic and the example numbers on the slide.',
  },
  {
    title: 'Run it, then check one fact',
    body: 'A confident answer can still be wrong. Recount the characters, redo the arithmetic, and check that the draft added nothing you did not supply.',
  },
  {
    title: 'Swap in your clinic and run it again',
    body: 'Type your real clinic name, city, hours, and phone into the Your clinic box on the page, still with no patient details, and compare the two results side by side.',
  },
]
