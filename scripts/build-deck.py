"""Builds the AI Front Desk workshop deck from src/data/aiForHealthcare.js.

Produces an editable PowerPoint (real text boxes), then renders it to the PDF
and slide images that /ai-for-healthcare serves from public/ai-for-healthcare/.

Usage:  python3 scripts/build-deck.py [output.pptx]
Needs:  python-pptx, node, LibreOffice (soffice), poppler (pdftoppm), and the
        Manrope and Inter fonts installed, or the rendered slides will not
        match the design.

Slide text for slides 9, 10 and 12 to 17 comes from the data file; the other
slides' text lives in this script. The cover photo (with its baked-in title)
and the two slide photos are in scripts/deck-assets/.
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
  prompts: d.PROMPTS.map(p => ({ slide: p.slide, lead: p.lead, text: fill(p.text, 'sample'), check: p.check, next: p.next })),
  reminders: d.REMINDER_TEXTS.map(r => ({ title: r.title, text: fill(r.text, 'bracket') })), reminderNote: d.REMINDER_NOTE,
  form: { ...d.FORM_DEMO, text: fill(d.FORM_DEMO.text, 'sample') },
  scripts: d.FRONT_DESK_SCRIPTS.map(r => ({ title: r.title, text: fill(r.text, 'bracket'), note: r.note })) }));
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

def lead_bullets(items, size=16, after=11):
    return [dict(runs=[(a, dict(bold=True, color=NAVY)), (b, {})], size=size, color=INK, bullet=True, after=after, line=1.3) for a, b in items]

def plain_bullets(items, color=INK, size=15.5, after=9):
    return [dict(text=t, size=size, color=color, bullet=True, after=after, line=1.3) for t in items]

def numbered(slide, items, y0, gap, num_size=34, width=11.3):
    y = y0
    for i, (head, body) in enumerate(items, 1):
        text(slide, LEFT, y - 0.04, 0.7, 0.6, [dict(text=str(i), font=HEAD, bold=True, size=num_size, color=TEAL, line=1.0)])
        text(slide, 1.46, y, width, gap, [dict(text=head, font=HEAD, bold=True, size=21, color=INK, after=3, line=1.15),
                                           dict(text=body, size=15.5, color=BODY, line=1.3)])
        y += gap

def notes_for(n, extra=None): return T[n - 1] if not extra else T[n - 1] + '\n\n' + extra

# 1 cover: the photo and its title are one image in the source deck, kept as is.
s = new_slide(T[0]); s.shapes.add_picture(os.path.join(ASSETS, 'cover.jpg'), 0, 0, width=prs.slide_width, height=prs.slide_height)

# 2 who we are
s = new_slide(T[1]); title(s, T[1], 0.55)
text(s, LEFT, 2.05, 6.75, 5.2, lead_bullets([
    ('Moises Segovia, the medical side.', ' A healthcare and technology entrepreneur based in the Rio Grande Valley. As the owner of Life Star EMS and co-owner of Rio Care EMS, he brings firsthand experience with the challenges healthcare teams face every day. He worked as an EMT, so he knows what happens when communication breaks down under pressure.'),
    ('Moises builds the tools, too.', ' Through Vital Care, he is developing software and exploring practical uses of AI to reduce paperwork, improve communication, and support healthcare professionals. His focus is simple: give teams more time to care for people.'),
    ('Rich Gomez, the systems side.', ' He has done marketing for over 15 years and has worked with AI since it started, building the follow-up and automation that keeps schedules full.'),
    ('Rich has seen your front desk up close.', ' As a biomed tech he went into different clinics, so he saw the phones, check-ins, and paperwork piling up while staff were stretched thin.'),
], size=14, after=8))
card(s, 7.75, 2.0, 5.0, 5.0, PALE)
text(s, 8.07, 2.0, 4.36, 5.0, [dict(text='The one thing', font=HEAD, bold=True, size=19, color=NAVY, after=8),
    dict(text='If every follow-up happens on time, every time, the schedule stays full and balances do not age in silence. Everything in this system exists to make that one thing true.', size=16.5, line=1.4)], anchor='middle')

# 3 the problem
s = new_slide(T[2]); title(s, T[2], 0.55)
text(s, LEFT, 2.0, 6.5, 4.92, [dict(text='Phones, check-ins, refills, billing questions, and follow-up all hit the same two people at once.', size=19, color=BODY, after=16, line=1.35)]
     + plain_bullets(['Calls go to voicemail while staff are with patients in the room', 'Refill and billing questions get routed by hand, every time', 'Reminders and callbacks happen only when someone finds a spare minute'], size=16, after=10), anchor='middle')
s.shapes.add_picture(os.path.join(ASSETS, 'photo3.jpg'), Inches(7.5), Inches(2.0), width=Inches(5.25), height=Inches(4.92))

# 4 the cost
s = new_slide(T[3]); title(s, T[3], 1.1)
text(s, LEFT, 2.55, WIDTH, 0.4, [dict(text='From a typical month in the example clinic data used in training:', size=19, color=BODY)])
for x, big, cap in [(0.59, '13.8%', 'of appointments were no-shows, 58 of 420 scheduled'), (4.78, '20%', 'no-show rate on Fridays, the worst day of the week'), (8.98, '33%', 'of billing dollars were over 60 days old, $7,000 of $21,000')]:
    text(s, x, 3.45, 3.8, 1.0, [dict(text=big, font=HEAD, bold=True, size=58, color=NAVY, line=1.0)])
    text(s, x, 4.5, 3.75, 0.7, [dict(text=cap, size=14, color=BODY, line=1.3)])
text(s, LEFT, 5.6, WIDTH, 0.9, [dict(text='Example figures from the workshop training dataset for one clinic month. Your numbers will differ. The pattern is the point: empty slots and aging balances grow when follow-up depends on spare time.', size=13, color=BODY, line=1.4)])

def card_grid(slide, items, rows, title_color=NAVY):
    for i, (head, body) in enumerate(items):
        x = 0.59 if i % 2 == 0 else 6.82; y, h = rows[i // 2]
        card(slide, x, y, 5.94, h, CARD)
        text(slide, x + 0.29, y + 0.27, 5.36, h - 0.4, [dict(text=head, font=HEAD, bold=True, size=21, color=title_color, after=5, line=1.15)] + body)

# 5 the solution
s = new_slide(T[4]); title(s, T[4], 0.55)
card_grid(s, [(h, [dict(text=b, size=16, line=1.35)]) for h, b in [
    ('Answers every call', '24/7 coverage in English and Spanish, including after hours and lunch, so no caller hits voicemail.'),
    ('Books the appointment', 'Finds an open slot, books it, and explains what documents to bring, using only your rules.'),
    ('Routes what it should not handle', 'Refills go to your clinical team. Billing questions go to your billing coordinator. Nothing gets approved or promised by the AI.'),
    ('Follows up automatically', 'Reminders, cancellation backfill, recall outreach, and billing follow-up run on schedule, not on spare time.')]], [(2.17, 1.95), (4.37, 2.25)])

# 6 control
s = new_slide(T[5]); title(s, T[5], 0.55)
text(s, LEFT, 1.42, 6.7, 5.5, lead_bullets([
    ('We build it on your rules.', ' Your hours, your services, your scripts, your routing, in English and Spanish.'),
    ('It works inside your systems.', ' Scheduling, phones, and follow-up connected within the permissions you approve.'),
    ('Your staff review and override.', ' Handoffs, status, and exceptions stay visible, and a person can step in at any point.')]), anchor='middle')
s.shapes.add_picture(os.path.join(ASSETS, 'photo6.jpg'), Inches(7.89), Inches(1.42), width=Inches(4.87), height=Inches(5.51))

def two_cards(slide, y, h, left, right):
    for x, fill, head_color, body_color, (head, items) in [(0.59, CARD, INK, INK, left), (6.84, NAVY, WHITE, WHITE, right)]:
        card(slide, x, y, 5.92, h, fill)
        text(slide, x + 0.33, y + 0.33, 5.26, h - 0.5, [dict(text=head, font=HEAD, bold=True, size=21, color=head_color, after=9, line=1.15)] + plain_bullets(items, color=body_color))

# 7 follow-up
s = new_slide(T[6]); title(s, T[6], 1.0)
two_cards(s, 2.05, 4.2,
    ('Today, by hand', ['One reminder, if someone remembers to send it', 'Cancelled slots sit empty for the day', 'Old balances get worked when there is time', 'Reviews and referrals answered late, or not at all']),
    ('With automated follow-up', ['Reminder sequence at 7 days, 2 days, and the morning of the visit', 'Cancellations trigger a call-back list to fill the opening', 'Billing follow-up prioritized by age and dollars, oldest first', 'Review replies and referral outreach drafted for your approval']))

# 8 compliance
s = new_slide(T[7]); title(s, T[7], 0.55)
text(s, LEFT, 1.42, 6.75, 5.5, lead_bullets([
    ('No patient data in consumer AI tools.', ' Real workflows run only on an approved setup with the right contract in place.'),
    ('Texas disclosure handled up front.', ' Patients are told when they are interacting with AI, as Texas law requires for healthcare services.'),
    ('Clear limits.', ' The AI never approves medication, never guarantees insurance payment, and never makes a clinical decision.'),
    ('Human review.', ' Your team approves scripts and can review any conversation.')]), anchor='middle')
card(s, 7.75, 1.42, 5.0, 5.5, PALE)
text(s, 8.07, 1.42, 4.36, 5.5, [dict(text='Compliance is the product.', font=HEAD, bold=True, size=19, color=NAVY, after=8),
    dict(text='A front desk system that cuts corners on privacy or disclosure is a liability, not a savings. We set up the guardrails first, then automate.', size=16.5, line=1.4)], anchor='middle')

# 9 reminder sequence
s = new_slide(notes_for(9, '\n'.join(f"{r['title']}: {r['text']}" for r in D['reminders']))); title(s, T[8], 0.8)
numbered(s, [(r['title'], '“' + r['text'] + '”') for r in D['reminders']], 2.45, 1.05)
text(s, LEFT, 5.75, WIDTH, 1.0, [dict(text=D['reminderNote'], size=13, color=BODY, line=1.4)])

# 10 scripts
s = new_slide(notes_for(10, '\n'.join(f"{r['title']}: {r['text']}" for r in D['scripts']))); title(s, T[9], 0.55)
def script_body(r):
    if r['title'].startswith('Every call'):
        return '“' + r['text'] + '” ' + r['note']
    return '“' + r['text'] + '” ' + r['note']
card_grid(s, [(r['title'], [dict(text=script_body(r), size=14.5, line=1.3)]) for r in D['scripts']], [(2.05, 2.5), (4.7, 2.55)])

# 11 run your numbers
s = new_slide(T[10]); title(s, T[10], 0.5)
two_cards(s, 1.95, 4.2,
    ('Your no-show rate', ['Count last month: appointments scheduled, and how many were no-shows', 'Divide no-shows by scheduled. In the example data: 58 ÷ 420 = 13.8%', 'Run the same math by weekday. Friday ran 20% and Monday 18% in the example, so that is where a reminder pilot pays first']),
    ('Your aging balances', ['Sort outstanding balances into four buckets: 0 to 30 days, 31 to 60, 61 to 90, and over 90', 'Add the dollars over 60 days old and divide by the total. In the example data: $7,000 ÷ $21,000 = 33%', 'Work the oldest bucket first, then 61 to 90, then 31 to 60, and keep routine watch on the newest']))
text(s, LEFT, 6.35, WIDTH, 0.8, [dict(text='The totals show you the pattern, not the cause. They will not tell you why patients missed or why a balance aged, and that is fine. You only need the pattern to pick the first workflow worth fixing.', size=13, color=BODY, line=1.35)])

# 12 laptops out
s = new_slide(notes_for(12, '\n\n'.join(f"{i}. {st['title']}\n{st['body']}" for i, st in enumerate(D['steps'], 1)))); title(s, T[11], 0.7)
numbered(s, [(st['title'], st['body']) for st in D['steps']], 1.95, 1.32, width=8.55)
# QR code to the page, opening on this slide. Same image the site serves.
card(s, 10.38, 2.0, 2.37, 2.37, WHITE, radius=0.16)
s.shapes.add_picture(os.path.join(PUBLIC, 'qr-laptops.png'), Inches(10.46), Inches(2.08), width=Inches(2.21), height=Inches(2.21))
text(s, 10.08, 4.5, 2.97, 1.2, [dict(text='Scan to follow along', font=HEAD, bold=True, size=16, color=INK, align='center', after=3),
    dict(text='or open on your laptop:', size=13, color=BODY, align='center', after=2),
    dict(text='rgvaicoalition.com', size=14, bold=True, color=NAVY, align='center', line=1.15),
    dict(text='/ai-for-healthcare', size=14, bold=True, color=NAVY, align='center', line=1.15)])

# 13-16 prompts
for p in D['prompts']:
    n = p['slide']
    s = new_slide(notes_for(n, p['lead'] + '\n\n' + p['text'] + '\n\nCheck it: ' + p['check'] + '\nTry next: ' + p['next']))
    title(s, T[n - 1], 0.55)
    text(s, LEFT, 2.05, WIDTH, 0.7, [dict(text=p['lead'], size=18, color=BODY, line=1.25)])
    top = 2.75 if len(p['lead']) <= 100 else 3.05
    lines = -(-len(p['text']) // 93)
    h = 0.6 + lines * 0.3
    card(s, LEFT, top, WIDTH, h, CARD)
    text(s, LEFT + 0.33, top, WIDTH - 0.66, h, [dict(text='“' + p['text'] + '”', size=15, line=1.4)], anchor='middle', name='Prompt')
    text(s, LEFT, top + h + 0.28, WIDTH, 0.9, [dict(runs=[('Check it: ', dict(bold=True, color=NAVY)), (p['check'] + ' ', {}), ('Try next: ', dict(bold=True, color=NAVY)), (p['next'], {})], size=13, color=BODY, line=1.4)])

# 17 one more thing: a staff survey form (demo, not hands-on)
F = D['form']
s = new_slide(notes_for(17, F['lead'] + '\n\n' + F['text'] + '\n\n' + '\n'.join(f"{i}. {st['title']}: {st['body']}" for i, st in enumerate(F['steps'], 1)) + '\n\n' + F['note']))
title(s, T[16], 0.5, h=0.8)
text(s, LEFT, 1.38, WIDTH, 0.5, [dict(text=F['lead'], size=17, color=BODY, line=1.25)])
card(s, LEFT, 1.98, 6.55, 3.98, CARD)
text(s, LEFT + 0.3, 1.98, 5.95, 3.98, [dict(text='“' + F['text'] + '”', size=13, line=1.33)], anchor='middle', name='Prompt')
y = 2.02
for i, st in enumerate(F['steps'], 1):
    text(s, 7.5, y - 0.03, 0.55, 0.6, [dict(text=str(i), font=HEAD, bold=True, size=30, color=TEAL, line=1.0)])
    text(s, 8.12, y, 4.64, 1.35, [dict(text=st['title'], font=HEAD, bold=True, size=17, color=INK, after=3, line=1.15),
                                    dict(text=st['body'], size=13, color=BODY, line=1.3)])
    y += 1.34
card(s, LEFT, 6.12, WIDTH, 1.08, PALE, radius=0.16)
text(s, LEFT + 0.28, 6.12, WIDTH - 0.56, 1.08, [dict(text=F['note'], size=13, color=INK, line=1.25)], anchor='middle')

# 18 do it yourself
s = new_slide(T[17]); title(s, T[17], 0.5)
numbered(s, [('Pick an approved tool first', 'No real patient information in a consumer AI tool. Your setup needs the right contract and covered features in place before any real workflow connects.'),
    ('Write every script yourself', 'Reminders, call routing, and review replies, in English and Spanish, with your manager confirming every policy detail: identity checks, documentation, transfers, and after-hours handling.'),
    ('Connect it, then test it', 'Scheduling, phones, and permissions wired together, tested on sample data, with every draft checked, because a confident answer can still be wrong.'),
    ('Run it and review it, every week', 'Handoffs, exceptions, and edits handled by your team, results and staff time measured, and the Texas AI disclosure kept up front. None of it is magic. It is setup, checking, and upkeep.')], 2.05, 1.32)

# 19 done for you
s = new_slide(T[18]); title(s, T[18], 0.9)
numbered(s, [('We map your first workflow', 'Pick the one that hurts most: missed calls, reminders, or billing follow-up. We map your current time, rework, and owner, so the pilot starts from your real numbers.'),
    ('We build the whole stack', 'The AI front desk configured on your rules, your reminder sequence and call routing scripts written for your clinic in English and Spanish, the Texas disclosure set up, and your team reviewing before anything goes live.'),
    ('We measure, then you decide', 'We compare no-shows, filled slots, staff time, and follow-up completed. If it earns its keep, we expand to the next workflow. If it does not, you stop with the numbers in hand.')], 2.6, 1.35)

# 20 close
s = new_slide(T[19]); title(s, T[19], 1.75, size=44, w=8.6, x=2.37, align='center', h=1.5)
text(s, 2.37, 3.42, 8.6, 1.3, [dict(text='Every call answered. Every appointment reminded. Every follow-up done. Book a short front desk review and we will map your first pilot workflow together.', size=19, color=BODY, align='center', line=1.4)])
btn = card(s, 4.67, 5.15, 4.0, 0.74, NAVY, radius=0.37)
LINK = 'https://rgvaicoalition.com/ai-for-healthcare#book'
btn.click_action.hyperlink.address = LINK
tf = btn.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; para = tf.paragraphs[0]; para.alignment = PP_ALIGN.CENTER
r = para.add_run(); r.text = 'Book your front desk review'; r.font.name = HEAD; r.font.bold = True; r.font.size = Pt(17); r.font.color.rgb = rgb(WHITE)

assert len(prs.slides) == len(T), len(prs.slides)
prs.save(out); print('built', len(prs.slides), 'slides')

# Render the deck to the PDF and slide images the page serves.
subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', tmp, out], check=True, capture_output=True)
pdf = os.path.join(tmp, os.path.splitext(os.path.basename(out))[0] + '.pdf')
shutil.copyfile(pdf, os.path.join(PUBLIC, 'ai-front-desk-healthcare-deck.pdf'))
subprocess.run(['pdftoppm', '-jpeg', '-jpegopt', 'quality=84,progressive=y', '-scale-to-x', '1600', '-scale-to-y', '-1', pdf, os.path.join(PUBLIC, 'slide')], check=True)
print('wrote', out, 'and', len(prs.slides), 'slide images')
