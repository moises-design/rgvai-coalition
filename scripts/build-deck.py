"""Builds the AI Front Desk workshop deck from src/data/aiForHealthcare.js.

Produces an editable PowerPoint (real text boxes), then renders it to the PDF
and slide images that /ai-for-healthcare serves from public/ai-for-healthcare/.

Usage:  python3 scripts/build-deck.py [output.pptx]
Needs:  python-pptx, node, LibreOffice (soffice), poppler (pdftoppm), and the
        Manrope and Inter fonts installed, or the rendered slides will not
        match the design.

Slide text for slides 11, 12 and 14 to 19 comes from the data file; the other
slides' text lives in this script. Slides carry few words in large type; the
full wording goes in the speaker notes. The cover photo (with its baked-in title)
and the slide photos are in scripts/deck-assets/.
"""
import json, os, shutil, subprocess, sys, tempfile
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'scripts', 'deck-assets')
PUBLIC = os.path.join(ROOT, 'public', 'ai-for-healthcare')
tmp = tempfile.mkdtemp(prefix='deck-')
out = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(tmp, 'ai-front-desk-healthcare-deck.pptx')

# The slides print a fixed sample appointment date; the page computes a current one.
SAMPLE_DATE = 'Thursday, December 10, 2026'
DUMP = """
import * as d from './src/data/aiForHealthcare.js';
const fill = (t, m) => d.fillTemplate(t, {}, m, process.argv[1]).map(s => s.text).join('');
console.log(JSON.stringify({ titles: d.SLIDES.map(s => s.title), steps: d.LAPTOPS_STEPS,
  prompts: d.PROMPTS.map(p => ({ slide: p.slide, lead: p.lead, text: fill(p.text, 'sample'), check: p.check, next: p.next, short: p.short, shortCheck: p.shortCheck })),
  reminders: d.REMINDER_TEXTS.map(r => ({ title: r.title, text: fill(r.text, 'bracket') })), reminderNote: d.REMINDER_NOTE, reminderShortNote: d.REMINDER_SHORT_NOTE,
  form: { ...d.FORM_DEMO, text: fill(d.FORM_DEMO.text, 'sample') },
  scripts: d.FRONT_DESK_SCRIPTS.map(r => ({ title: r.title, text: fill(r.text, 'bracket'), note: r.note, shortNote: r.shortNote })) }));
"""
D = json.loads(subprocess.run(['node', '--input-type=module', '-e', DUMP, SAMPLE_DATE], cwd=ROOT, check=True, capture_output=True, text=True).stdout)
T = D['titles']
INK, BODY, NAVY, TEAL = '1F2533', '4A5261', '2A5074', '1B7480'
BG, CARD, PALE, WHITE = 'F6F7FB', 'E7EAF1', 'DDEBEE', 'FFFFFF'
HEAD, TEXT = 'Manrope', 'Inter'
LEFT, WIDTH = 0.59, 12.17

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]

def rgb(h): return RGBColor.from_string(h)

def new_slide(notes):
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(BG)
    s.notes_slide.notes_text_frame.text = notes
    return s

def text(slide, x, y, w, h, paras, anchor='top', name=None):
    """paras: list of dicts {runs:[(text, {opts})] or text:str, size, color, font, bold, bullet, after, align, line}"""
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name: box.name = name
    tf = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = {'top': MSO_ANCHOR.TOP, 'middle': MSO_ANCHOR.MIDDLE, 'bottom': MSO_ANCHOR.BOTTOM}[anchor]
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = {'left': PP_ALIGN.LEFT, 'center': PP_ALIGN.CENTER}[p.get('align', 'left')]
        para.line_spacing = p.get('line', 1.2)
        para.space_after = Pt(p.get('after', 0))
        runs = p.get('runs') or [(p['text'], {})]
        for txt, o in runs:
            r = para.add_run(); r.text = txt; f = r.font
            f.name = o.get('font', p.get('font', TEXT)); f.size = Pt(o.get('size', p.get('size', 13)))
            f.bold = o.get('bold', p.get('bold', False)); f.color.rgb = rgb(o.get('color', p.get('color', INK)))
            if o.get('link'): r.hyperlink.address = o['link']
        if p.get('bullet'):
            pPr = para._p.get_or_add_pPr(); pPr.set('marL', str(Inches(0.23))); pPr.set('indent', str(-Inches(0.23)))
            bu = etree.SubElement(pPr, qn('a:buChar')); bu.set('char', '•')
    return box

def title(slide, t, y, size=38, w=WIDTH, align='left', x=LEFT, h=1.5):
    return text(slide, x, y, w, h, [dict(text=t, font=HEAD, bold=True, size=size, color=INK, line=1.05, align=align)], name='Title')

def card(slide, x, y, w, h, fill, radius=0.2):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = min(0.5, radius / min(w, h))
    sh.fill.solid(); sh.fill.fore_color.rgb = rgb(fill); sh.line.fill.background()
    spPr = sh._element.spPr
    for old in spPr.findall(qn('a:effectLst')): spPr.remove(old)
    etree.SubElement(spPr, qn('a:effectLst'))
    if sh._element.find(qn('p:style')) is not None: sh._element.remove(sh._element.find(qn('p:style')))
    return sh

def lead_bullets(items, size=21, after=14):
    return [dict(runs=[(a, dict(bold=True, color=NAVY)), (b, {})], size=size, color=INK, bullet=True, after=after, line=1.25) for a, b in items]

def plain_bullets(items, color=INK, size=20, after=12):
    return [dict(text=t, size=size, color=color, bullet=True, after=after, line=1.25) for t in items]

def numbered(slide, items, y0, gap, num_size=40, width=11.3, head_size=24, body_size=19):
    y = y0
    for i, (head, body) in enumerate(items, 1):
        text(slide, LEFT, y - 0.05, 0.75, 0.7, [dict(text=str(i), font=HEAD, bold=True, size=num_size, color=TEAL, line=1.0)])
        text(slide, 1.5, y, width, gap, [dict(text=head, font=HEAD, bold=True, size=head_size, color=INK, after=3, line=1.15),
                                          dict(text=body, size=body_size, color=BODY, line=1.25)])
        y += gap

# The slides are presented live, so each one carries few words in large type
# (nothing under 16pt). The full wording that used to be on the slide is kept
# in the speaker notes, passed as `full`.
def notes_for(n, full=None): return T[n - 1] if not full else T[n - 1] + '\n\n' + full

# 1 cover: the photo and its title are one image in the source deck, kept as is.
s = new_slide(T[0]); s.shapes.add_picture(os.path.join(ASSETS, 'cover.jpg'), 0, 0, width=prs.slide_width, height=prs.slide_height)

# 2 who we are
s = new_slide(notes_for(2, 'Moises Segovia, the medical side. A healthcare and technology entrepreneur based in the Rio Grande Valley. As the owner of Life Star EMS and co-owner of Rio Care EMS, he brings firsthand experience with the challenges healthcare teams face every day. He worked as an EMT, so he knows what happens when communication breaks down under pressure.\n\n'
    'Moises builds the tools, too. Through Vital Care, he is developing software and exploring practical uses of AI to reduce paperwork, improve communication, and support healthcare professionals. His focus is simple: give teams more time to care for people.\n\n'
    'Rich Gomez, the systems side. He has done marketing for over 15 years and has worked with AI since it started, building the follow-up and automation that keeps schedules full.\n\n'
    'Rich has seen your front desk up close. As a biomed tech he went into different clinics, so he saw the phones, check-ins, and paperwork piling up while staff were stretched thin.\n\n'
    'The one thing: If every follow-up happens on time, every time, the schedule stays full and balances do not age in silence. Everything in this system exists to make that one thing true.'))
title(s, T[1], 0.55)
for x, name, side, items in [
    (0.59, 'Moises Segovia', 'The medical side', ['Owner, Life Star EMS', 'Co-owner, Rio Care EMS', 'Former EMT', 'Building Vital Care']),
    (6.82, 'Rich Gomez', 'The systems side', ['15+ years in marketing', 'Biomed tech in clinics', 'Builds follow-up automation'])]:
    card(s, x, 2.15, 5.94, 3.3, CARD)
    text(s, x + 0.35, 2.4, 5.24, 3.0, [dict(text=name, font=HEAD, bold=True, size=26, color=INK, line=1.1, after=2),
        dict(text=side, size=18, bold=True, color=TEAL, after=10)] + plain_bullets(items, size=19, after=5))
card(s, LEFT, 5.7, WIDTH, 1.15, PALE)
text(s, LEFT + 0.4, 5.7, WIDTH - 0.8, 1.15, [dict(runs=[('The one thing: ', dict(bold=True, color=NAVY)), ('every follow-up, on time, every time.', {})], font=HEAD, size=24, line=1.2)], anchor='middle')

# 3 what do you use AI for (audience question)
s = new_slide(notes_for(3, 'Ask the room first: what do you use AI for? Then: what CAN you use it for?\n\n'
    'Writing & Editing: Draft emails, summarize articles, brainstorm ideas, and fix grammar.\n'
    'Learning & Research: Explain complex topics simply, build study plans, and look up information faster.\n'
    'Media Creation: Generate images, video clips, and marketing copy.\n'
    'Productivity & Automation: Organize notes, handle routine customer replies, and automate data entry or scheduling.\n'
    'Data & Decision Support: Spot trends, forecast demand, and flag fraud or anomalies.\n'
    'Coding & Tech Help: Write, debug, and explain code or technical steps.'))
title(s, T[2], 0.55, h=0.8)
s.shapes.add_picture(os.path.join(ASSETS, 'photo-ai-uses.jpg'), Inches(LEFT), Inches(1.75), width=Inches(5.15), height=Inches(5.15))
text(s, 6.3, 1.75, 6.45, 0.8, [dict(text='What CAN you use it for?', font=HEAD, bold=True, size=28, color=NAVY, line=1.1)])
text(s, 6.3, 2.65, 6.45, 4.3, lead_bullets([
    ('Writing', '  emails, summaries, ideas'),
    ('Learning', '  explain it simply'),
    ('Media', '  images, video, marketing copy'),
    ('Productivity', '  notes, replies, scheduling'),
    ('Data', '  trends, forecasts, red flags'),
    ('Coding', '  write, fix, and explain code')], size=21, after=13))

# 4 medical offices and clinics
s = new_slide(notes_for(4, 'Ambient Clinical Scribing: Tools listen to patient visits and automatically generate structured SOAP notes directly into your EHR.\n'
    '24/7 Patient Scheduling & Triage: Automated phone and chat assistants answer common questions, book appointments, and send reminders.\n'
    'Billing & Coding Assistance: Software scans clinical notes to suggest accurate ICD-10 and CPT codes and flags missing details before claims go out.\n'
    'Insurance & Prior Authorization: AI drafts prior authorization letters and checks insurance eligibility automatically.\n'
    'Patient Education & Follow-Ups: Generate easy-to-read after-visit summaries, translate instructions into other languages, and send post-care check-ins.\n'
    'Marketing & Content Creation: Draft compliant social media posts, educational newsletters, and video scripts for clinic services.\n\n'
    'Its primary use is to reduce administrative burnout, automate patient communication, and streamline documentation.'))
title(s, T[3], 0.55, h=0.8)
for i, (head_, body_) in enumerate([
    ('Clinical scribing', 'Visit notes, into your EHR'),
    ('Scheduling and triage', 'Phone and chat, 24/7'),
    ('Billing and coding', 'Suggests ICD-10 and CPT codes'),
    ('Prior authorization', 'Drafts letters, checks eligibility'),
    ('Patient follow-ups', 'Summaries, translations, check-ins'),
    ('Marketing and content', 'Posts, newsletters, video scripts')]):
    x = LEFT + (i % 3) * 4.14; y = 1.75 + (i // 3) * 1.95
    card(s, x, y, 3.89, 1.75, CARD)
    text(s, x + 0.28, y, 3.33, 1.75, [dict(text=head_, font=HEAD, bold=True, size=21, color=NAVY, after=5, line=1.15),
                                      dict(text=body_, size=17, color=BODY, line=1.25)], anchor='middle')
card(s, LEFT, 5.75, WIDTH, 1.15, PALE)
text(s, LEFT + 0.4, 5.75, WIDTH - 0.8, 1.15, [dict(runs=[('The point: ', dict(bold=True, color=NAVY)), ('less admin burnout, automatic patient communication, faster documentation.', {})], font=HEAD, size=20, line=1.25)], anchor='middle')

# 5 the problem
s = new_slide(notes_for(5, 'Phones, check-ins, refills, billing questions, and follow-up all hit the same two people at once.\n- Calls go to voicemail while staff are with patients in the room\n- Refill and billing questions get routed by hand, every time\n- Reminders and callbacks happen only when someone finds a spare minute'))
title(s, T[4], 0.55)
text(s, LEFT, 2.0, 6.5, 4.92, [dict(text='Everything hits the same two people at once.', size=24, color=BODY, after=20, line=1.25)]
     + plain_bullets(['Calls go to voicemail', 'Refills and billing routed by hand', 'Reminders only in a spare minute'], size=22, after=14), anchor='middle')
s.shapes.add_picture(os.path.join(ASSETS, 'photo3.jpg'), Inches(7.5), Inches(2.0), width=Inches(5.25), height=Inches(4.92))

# 6 the cost
s = new_slide(notes_for(6, 'From a typical month in the example clinic data used in training:\n13.8% of appointments were no-shows, 58 of 420 scheduled.\n20% no-show rate on Fridays, the worst day of the week.\n33% of billing dollars were over 60 days old, $7,000 of $21,000.\n\nExample figures from the workshop training dataset for one clinic month. Your numbers will differ. The pattern is the point: empty slots and aging balances grow when follow-up depends on spare time.'))
title(s, T[5], 0.8)
text(s, LEFT, 2.5, WIDTH, 0.5, [dict(text='One example clinic month:', size=22, color=BODY)])
for x, big, cap in [(0.59, '13.8%', 'no-shows'), (4.78, '20%', 'no-shows on Fridays'), (8.98, '33%', 'of billing over 60 days old')]:
    text(s, x, 3.35, 3.8, 1.2, [dict(text=big, font=HEAD, bold=True, size=72, color=NAVY, line=1.0)])
    text(s, x, 4.65, 3.75, 0.7, [dict(text=cap, size=21, color=INK, line=1.25)])
text(s, LEFT, 6.1, WIDTH, 0.6, [dict(text='Example training data. Your numbers will differ.', size=17, color=BODY, line=1.3)])

def card_grid(slide, items, rows, title_color=NAVY, head_size=24):
    for i, (head, body) in enumerate(items):
        x = 0.59 if i % 2 == 0 else 6.82; y, h = rows[i // 2]
        card(slide, x, y, 5.94, h, CARD)
        text(slide, x + 0.32, y, 5.3, h, [dict(text=head, font=HEAD, bold=True, size=head_size, color=title_color, after=6, line=1.15)] + body, anchor='middle')

# 7 the solution
s = new_slide(notes_for(7, 'Answers every call: 24/7 coverage in English and Spanish, including after hours and lunch, so no caller hits voicemail.\nBooks the appointment: Finds an open slot, books it, and explains what documents to bring, using only your rules.\nRoutes what it should not handle: Refills go to your clinical team. Billing questions go to your billing coordinator. Nothing gets approved or promised by the AI.\nFollows up automatically: Reminders, cancellation backfill, recall outreach, and billing follow-up run on schedule, not on spare time.'))
title(s, T[6], 0.55)
card_grid(s, [(h, [dict(text=b, size=20, color=BODY, line=1.25)]) for h, b in [
    ('Answers every call', '24/7, in English and Spanish.'),
    ('Books the appointment', 'Using only your rules.'),
    ('Routes what it should not handle', 'Refills and billing go to your team.'),
    ('Follows up automatically', 'On schedule, not on spare time.')]], [(2.2, 2.0), (4.45, 2.0)])

# 8 control
s = new_slide(notes_for(8, 'We build it on your rules. Your hours, your services, your scripts, your routing, in English and Spanish.\nIt works inside your systems. Scheduling, phones, and follow-up connected within the permissions you approve.\nYour staff review and override. Handoffs, status, and exceptions stay visible, and a person can step in at any point.'))
title(s, T[7], 0.55)
text(s, LEFT, 1.42, 6.9, 5.5, lead_bullets([
    ('Built on your rules.', ' English and Spanish.'),
    ('Works inside your systems.', ' Only the permissions you approve.'),
    ('Your staff can override.', ' A person can step in anytime.')], size=23, after=22), anchor='middle')
s.shapes.add_picture(os.path.join(ASSETS, 'photo6.jpg'), Inches(7.89), Inches(1.42), width=Inches(4.87), height=Inches(5.51))

def two_cards(slide, y, h, left, right, size=20):
    for x, fill, head_color, body_color, (head, items) in [(0.59, CARD, INK, INK, left), (6.84, NAVY, WHITE, WHITE, right)]:
        card(slide, x, y, 5.92, h, fill)
        text(slide, x + 0.38, y + 0.36, 5.16, h - 0.5, [dict(text=head, font=HEAD, bold=True, size=25, color=head_color, after=12, line=1.15)] + plain_bullets(items, color=body_color, size=size, after=11))

# 9 follow-up
s = new_slide(notes_for(9, 'Today, by hand:\n- One reminder, if someone remembers to send it\n- Cancelled slots sit empty for the day\n- Old balances get worked when there is time\n- Reviews and referrals answered late, or not at all\n\nWith automated follow-up:\n- Reminder sequence at 7 days, 2 days, and the morning of the visit\n- Cancellations trigger a call-back list to fill the opening\n- Billing follow-up prioritized by age and dollars, oldest first\n- Review replies and referral outreach drafted for your approval'))
title(s, T[8], 0.8)
two_cards(s, 2.05, 4.4,
    ('Today, by hand', ['One reminder, if someone remembers', 'Cancelled slots sit empty', 'Old balances wait', 'Reviews answered late']),
    ('With automated follow-up', ['Reminders at 7 days, 2 days, morning of', 'Cancellations fill from a call-back list', 'Billing follow-up, oldest first', 'Review replies drafted for approval']))

# 10 compliance
s = new_slide(notes_for(10, 'No patient data in consumer AI tools. Real workflows run only on an approved setup with the right contract in place.\nTexas disclosure handled up front. Patients are told when they are interacting with AI, as Texas law requires for healthcare services.\nClear limits. The AI never approves medication, never guarantees insurance payment, and never makes a clinical decision.\nHuman review. Your team approves scripts and can review any conversation.\n\nCompliance is the product. A front desk system that cuts corners on privacy or disclosure is a liability, not a savings. We set up the guardrails first, then automate.'))
title(s, T[9], 0.55)
text(s, LEFT, 1.42, 6.9, 5.5, plain_bullets([
    'No patient data in consumer AI tools',
    'Texas AI disclosure, up front',
    'AI makes no medication, payment, or clinical decisions',
    'Your team approves every script'], size=22, after=18), anchor='middle')
card(s, 7.75, 1.42, 5.0, 5.5, PALE)
text(s, 8.1, 1.42, 4.3, 5.5, [dict(text='Compliance is the product.', font=HEAD, bold=True, size=26, color=NAVY, after=12, line=1.15),
    dict(text='Guardrails first. Then automate.', size=22, line=1.3)], anchor='middle')

# 11 reminder sequence
s = new_slide(notes_for(11, '\n'.join(f"{r['title']}: {r['text']}" for r in D['reminders']) + '\n\n' + D['reminderNote'])); title(s, T[10], 0.6)
numbered(s, [(r['title'], '“' + r['text'] + '”') for r in D['reminders']], 2.15, 1.4, head_size=23, body_size=18)
text(s, LEFT, 6.45, WIDTH, 0.6, [dict(text=D['reminderShortNote'], size=18, bold=True, color=NAVY, line=1.3)])

# 12 scripts: the quotes are meant to be used word for word, so they stay whole.
s = new_slide(notes_for(12, '\n'.join(f"{r['title']}: {r['text']} {r['note']}" for r in D['scripts']))); title(s, T[11], 0.45)
card_grid(s, [(r['title'], [dict(text='“' + r['text'] + '”', size=16, line=1.3, after=6),
                            dict(text=r['shortNote'], size=16, bold=True, color=TEAL, line=1.25)]) for r in D['scripts']], [(1.9, 2.3), (4.35, 3.0)], head_size=21)

# 13 run your numbers
s = new_slide(notes_for(13, 'Your no-show rate:\n- Count last month: appointments scheduled, and how many were no-shows\n- Divide no-shows by scheduled. In the example data: 58 ÷ 420 = 13.8%\n- Run the same math by weekday. Friday ran 20% and Monday 18% in the example, so that is where a reminder pilot pays first\n\nYour aging balances:\n- Sort outstanding balances into four buckets: 0 to 30 days, 31 to 60, 61 to 90, and over 90\n- Add the dollars over 60 days old and divide by the total. In the example data: $7,000 ÷ $21,000 = 33%\n- Work the oldest bucket first, then 61 to 90, then 31 to 60, and keep routine watch on the newest\n\nThe totals show you the pattern, not the cause. They will not tell you why patients missed or why a balance aged, and that is fine. You only need the pattern to pick the first workflow worth fixing.'))
title(s, T[12], 0.5)
two_cards(s, 1.95, 4.0,
    ('Your no-show rate', ['No-shows ÷ appointments scheduled', 'Example: 58 ÷ 420 = 13.8%', 'Then by weekday. Start with the worst day.']),
    ('Your aging balances', ['Dollars over 60 days ÷ total owed', 'Example: $7,000 ÷ $21,000 = 33%', 'Work the oldest first.']))
text(s, LEFT, 6.25, WIDTH, 0.6, [dict(text='Totals show the pattern, not the cause.', size=19, bold=True, color=NAVY, line=1.3)])

# 14 laptops out
s = new_slide(notes_for(14, '\n\n'.join(f"{i}. {st['title']}\n{st['body']}" for i, st in enumerate(D['steps'], 1)))); title(s, T[13], 0.6)
numbered(s, [(st['title'], st['short']) for st in D['steps']], 1.85, 1.3, width=8.4, head_size=23, body_size=18)
# QR code to the page, opening on this slide. Same image the site serves.
card(s, 10.38, 2.0, 2.37, 2.37, WHITE, radius=0.16)
s.shapes.add_picture(os.path.join(PUBLIC, 'qr-laptops.png'), Inches(10.46), Inches(2.08), width=Inches(2.21), height=Inches(2.21))
text(s, 9.98, 4.5, 3.17, 1.4, [dict(text='Scan to follow along', font=HEAD, bold=True, size=18, color=INK, align='center', after=4),
    dict(text='rgvaicoalition.com', size=16, bold=True, color=NAVY, align='center', line=1.15),
    dict(text='/ai-for-healthcare', size=16, bold=True, color=NAVY, align='center', line=1.15)])

# 15-18 prompts: the slide shows the gist in large type; the full prompt, ready
# to copy, is on the page (and in the speaker notes).
for p in D['prompts']:
    n = p['slide']
    s = new_slide(notes_for(n, p['lead'] + '\n\n' + p['text'] + '\n\nCheck it: ' + p['check'] + '\nTry next: ' + p['next']))
    title(s, T[n - 1], 0.55)
    card(s, LEFT, 2.35, WIDTH, 2.35, CARD)
    text(s, LEFT + 0.45, 2.35, WIDTH - 0.9, 2.35, [dict(text='“' + p['short'] + '”', size=24, line=1.35)], anchor='middle', name='Prompt')
    text(s, LEFT, 5.05, WIDTH, 0.6, [dict(runs=[('Check it: ', dict(bold=True, color=NAVY)), (p['shortCheck'], {})], size=24, color=INK, line=1.25)])
    text(s, LEFT, 6.2, WIDTH, 0.5, [dict(runs=[('Copy the full prompt: ', {}), ('rgvaicoalition.com/ai-for-healthcare', dict(bold=True, color=NAVY))], size=18, color=BODY, line=1.25)])

# 19 one more thing: a staff survey form (demo, not hands-on). Few words, big type:
# the detail lives in the speaker notes and on the page.
F = D['form']
s = new_slide(notes_for(19, F['lead'] + '\n\n' + F['text'] + '\n\n' + '\n'.join(f"{i}. {st['title']}. {st['body']}" for i, st in enumerate(F['steps'], 1)) + '\n\n' + F['note']))
title(s, T[18], 0.55, h=0.8)
text(s, LEFT, 1.5, WIDTH, 0.6, [dict(text=F['lead'], size=24, color=BODY, line=1.2)])
card(s, LEFT, 2.3, WIDTH, 1.85, CARD)
text(s, LEFT + 0.4, 2.3, WIDTH - 0.8, 1.85, [dict(text='“' + F['text'] + '”', size=22, line=1.35)], anchor='middle', name='Prompt')
for i, st in enumerate(F['steps']):
    x = LEFT + i * 4.14
    text(s, x, 4.5, 0.6, 0.8, [dict(text=str(i + 1), font=HEAD, bold=True, size=40, color=TEAL, line=1.0)])
    text(s, x + 0.62, 4.55, 3.25, 1.2, [dict(text=st['title'], font=HEAD, bold=True, size=20, color=INK, line=1.2)])
card(s, LEFT, 6.1, WIDTH, 0.8, PALE, radius=0.16)
text(s, LEFT + 0.4, 6.1, WIDTH - 0.8, 0.8, [dict(text=F['slideNote'], size=19, bold=True, color=NAVY, line=1.2)], anchor='middle')

# 20 do it yourself
s = new_slide(notes_for(20, '1. Pick an approved tool first. No real patient information in a consumer AI tool. Your setup needs the right contract and covered features in place before any real workflow connects.\n2. Write every script yourself. Reminders, call routing, and review replies, in English and Spanish, with your manager confirming every policy detail: identity checks, documentation, transfers, and after-hours handling.\n3. Connect it, then test it. Scheduling, phones, and permissions wired together, tested on sample data, with every draft checked, because a confident answer can still be wrong.\n4. Run it and review it, every week. Handoffs, exceptions, and edits handled by your team, results and staff time measured, and the Texas AI disclosure kept up front. None of it is magic. It is setup, checking, and upkeep.'))
title(s, T[19], 0.5)
numbered(s, [('Pick an approved tool first', 'No patient information in a consumer AI tool.'),
    ('Write every script yourself', 'English and Spanish. Your manager confirms each policy.'),
    ('Connect it, then test it', 'On sample data. Check every draft.'),
    ('Run it and review it, every week', 'Setup, checking, and upkeep. No magic.')], 2.25, 1.2)

# 21 done for you
s = new_slide(notes_for(21, '1. We map your first workflow. Pick the one that hurts most: missed calls, reminders, or billing follow-up. We map your current time, rework, and owner, so the pilot starts from your real numbers.\n2. We build the whole stack. The AI front desk configured on your rules, your reminder sequence and call routing scripts written for your clinic in English and Spanish, the Texas disclosure set up, and your team reviewing before anything goes live.\n3. We measure, then you decide. We compare no-shows, filled slots, staff time, and follow-up completed. If it earns its keep, we expand to the next workflow. If it does not, you stop with the numbers in hand.'))
title(s, T[20], 0.7)
numbered(s, [('We map your first workflow', 'Start with the one that hurts most.'),
    ('We build the whole stack', 'On your rules, in English and Spanish.'),
    ('We measure, then you decide', 'Expand if it earns its keep. Stop if it does not.')], 2.7, 1.4, head_size=26, body_size=20)

# 22 close
s = new_slide(notes_for(22, 'Every call answered. Every appointment reminded. Every follow-up done. Book a short front desk review and we will map your first pilot workflow together.'))
title(s, T[21], 1.6, size=48, w=9.6, x=1.87, align='center', h=1.7)
text(s, 1.87, 3.55, 9.6, 1.2, [dict(text='Every call answered. Every appointment reminded. Every follow-up done.', size=24, color=BODY, align='center', line=1.35)])
btn = card(s, 4.17, 5.2, 5.0, 0.9, NAVY, radius=0.45)
LINK = 'https://rgvaicoalition.com/ai-for-healthcare#book'
btn.click_action.hyperlink.address = LINK
tf = btn.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; para = tf.paragraphs[0]; para.alignment = PP_ALIGN.CENTER
r = para.add_run(); r.text = 'Book your front desk review'; r.font.name = HEAD; r.font.bold = True; r.font.size = Pt(22); r.font.color.rgb = rgb(WHITE)

assert len(prs.slides) == len(T), len(prs.slides)
prs.save(out); print('built', len(prs.slides), 'slides')

# Render the deck to the PDF and slide images the page serves.
subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', tmp, out], check=True, capture_output=True)
pdf = os.path.join(tmp, os.path.splitext(os.path.basename(out))[0] + '.pdf')
shutil.copyfile(pdf, os.path.join(PUBLIC, 'ai-front-desk-healthcare-deck.pdf'))
subprocess.run(['pdftoppm', '-jpeg', '-jpegopt', 'quality=84,progressive=y', '-scale-to-x', '1600', '-scale-to-y', '-1', pdf, os.path.join(PUBLIC, 'slide')], check=True)
print('wrote', out, 'and', len(prs.slides), 'slide images')
