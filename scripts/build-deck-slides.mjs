// Rebuilds deck slides 12 to 16 (Laptops out + the four prompt slides) from
// src/data/aiForHealthcare.js, in the deck's visual style, and reassembles the
// deck PDF and slide images in public/ai-for-healthcare/.
//
// Usage: node scripts/build-deck-slides.mjs <original-18-page-deck.pdf>
// Needs: playwright (Chromium), pdfseparate/pdfunite/pdftoppm (poppler).
// The original deck supplies slides 1 to 11 and its last three slides unchanged.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { LAPTOPS_STEPS, PROMPTS, SLIDES, fillTemplate } from '../src/data/aiForHealthcare.js'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/ai-for-healthcare')
const original = process.argv[2]
if (!original) throw new Error('Pass the path to the original 18-page deck PDF.')

// The slides show the same sample appointment date the page computes: a
// weekday about three weeks after the build date.
function sampleDate() {
  const date = new Date()
  date.setDate(date.getDate() + 21)
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const esc = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: 960px 540px; margin: 0; }
  html, body { width: 960px; height: 540px; }
  body { background: #f6f7fb; color: #1f2533; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  .slide { width: 960px; height: 540px; padding: 0 42px; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 40px; line-height: 1.12; letter-spacing: -0.01em; max-width: 860px; }
  .lead { font-size: 16.5px; color: #4a5261; margin-top: 12px; }
  .box { background: #e7eaf1; border-radius: 14px; padding: 22px 24px; margin-top: 38px; font-size: 13.2px; line-height: 1.5; color: #1f2533; }
  .foot { margin-top: 26px; font-size: 10.5px; line-height: 1.5; color: #4a5261; }
  .foot b { color: #2a5074; font-weight: 600; }
  .steps { margin-top: 26px; display: flex; flex-direction: column; gap: 17px; }
  .step { display: grid; grid-template-columns: 63px 1fr; align-items: start; }
  .num { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 30px; line-height: 1; color: #1b7480; padding-top: 2px; }
  .step h2 { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 18px; line-height: 1.25; }
  .step p { font-size: 12.4px; line-height: 1.5; color: #4a5261; margin-top: 3px; }
`

function promptSlide(slide, prompt, date) {
  const text = fillTemplate(prompt.text, {}, 'sample', date).map(segment => segment.text).join('')
  return `<div class="slide">
    <h1>${esc(slide.title)}</h1>
    <p class="lead">${esc(prompt.lead)}</p>
    <div class="box">&ldquo;${esc(text)}&rdquo;</div>
    <p class="foot"><b>Check it:</b> ${esc(prompt.check)} <b>Try next:</b> ${esc(prompt.next)}</p>
  </div>`
}

function laptopsSlide(slide) {
  return `<div class="slide">
    <h1>${esc(slide.title)}</h1>
    <div class="steps">${LAPTOPS_STEPS.map((step, i) => `
      <div class="step"><div class="num">${i + 1}</div><div><h2>${esc(step.title)}</h2><p>${esc(step.body)}</p></div></div>`).join('')}
    </div>
  </div>`
}

const date = sampleDate()
const rebuilt = [12, ...PROMPTS.map(prompt => prompt.slide)]
const work = mkdtempSync(join(tmpdir(), 'deck-'))
const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {})
const page = await browser.newPage({ viewport: { width: 960, height: 540 } })

for (const number of rebuilt) {
  const slide = SLIDES[number - 1]
  const prompt = PROMPTS.find(item => item.slide === number)
  const body = prompt ? promptSlide(slide, prompt, date) : laptopsSlide(slide)
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const overflow = await page.evaluate(() => document.querySelector('.slide').scrollHeight > 540)
  if (overflow) throw new Error(`Slide ${number} content does not fit on the slide.`)
  await page.pdf({ path: join(work, `new-${number}.pdf`), width: '960px', height: '540px', printBackground: true })
}
await browser.close()

// Original pages: 1-11 unchanged, then the original 16-18 become 17-19.
execFileSync('pdfseparate', [original, join(work, 'orig-%d.pdf')])
const pages = [
  ...Array.from({ length: 11 }, (_, i) => join(work, `orig-${i + 1}.pdf`)),
  ...rebuilt.map(number => join(work, `new-${number}.pdf`)),
  ...[16, 17, 18].map(number => join(work, `orig-${number}.pdf`)),
]
if (pages.length !== SLIDES.length) throw new Error(`Expected ${SLIDES.length} pages, built ${pages.length}.`)
const deck = join(work, 'deck.pdf')
execFileSync('pdfunite', [...pages, deck])
copyFileSync(deck, join(outDir, 'ai-front-desk-healthcare-deck.pdf'))
execFileSync('pdftoppm', ['-jpeg', '-jpegopt', 'quality=84,progressive=y', '-scale-to-x', '1600', '-scale-to-y', '-1', deck, join(outDir, 'slide')])
console.log(`Built ${pages.length}-slide deck with sample date ${date}.`)
