"""Builds a workshop deck from its data file (every workshop except healthcare,
which has its own script, build-deck.py).

Produces an editable PowerPoint with real text boxes, then renders it to the
PDF and slide images the workshop page serves from public/<slug>/.

Usage:  python3 scripts/build-workshop-deck.py <workshop> [output.pptx]
        <workshop> is one of the keys of WORKSHOPS below.
Needs:  python-pptx, segno, node, LibreOffice (soffice), poppler (pdftoppm),
        and the Manrope and Inter fonts installed.

Slides carry few words in large type (nothing under 16pt); the full wording
goes in the speaker notes. All slide text comes from the data file.
"""
import json, os, shutil, subprocess, sys, tempfile
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

# workshop key -> (data file, workshop export, fill export)
WORKSHOPS = {
    'small-business': ('aiForSmallBusiness.js', 'SMALL_BUSINESS', 'fillBusiness'),
    'nonprofits': ('aiForNonprofits.js', 'NONPROFITS', 'fillNonprofit'),
}
if len(sys.argv) < 2 or sys.argv[1] not in WORKSHOPS:
    sys.exit('usage: build-workshop-deck.py <%s> [output.pptx]' % '|'.join(WORKSHOPS))
DATA_FILE, WORKSHOP_EXPORT, FILL_EXPORT = WORKSHOPS[sys.argv[1]]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'scripts', 'deck-assets')

DUMP = """
import { %s as w, %s as fillOf } from './src/data/%s';
const fill = t => fillOf(t, {}).map(s => s.text).join('');
console.log(JSON.stringify({ titles: w.slides.map(s => s.title), steps: w.laptopsSteps, deck: w.deck,
  prompts: w.prompts.map(p => ({ ...p, text: fill(p.text) })),
  form: { ...w.formDemo, text: fill(w.formDemo.text) }, laptops: w.laptopsSlide, formSlide: w.formSlide }));
""" % (WORKSHOP_EXPORT, FILL_EXPORT, DATA_FILE)
D = json.loads(subprocess.run(['node', '--input-type=module', '-e', DUMP], cwd=ROOT, check=True, capture_output=True, text=True).stdout)
T = D['titles']; K = D['deck']
SLUG = K['slug']
PUBLIC = os.path.join(ROOT, 'public', SLUG)
os.makedirs(PUBLIC, exist_ok=True)
tmp = tempfile.mkdtemp(prefix='deck-')
NAME = SLUG + '-deck'
out = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(tmp, NAME + '.pptx')
PAGE = 'rgvaicoalition.com/' + SLUG

# The QR code opens the page on the "Laptops out" slide. It uses #laptops, not
# a slide number, so it keeps working when slides are added.
QR = os.path.join(PUBLIC, 'qr-laptops.png')
if not os.path.exists(QR):
    import segno
    segno.make('https://' + PAGE + '#laptops', error='m').save(QR, scale=30, border=2)

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


def card_grid(slide, items, rows, title_color=NAVY, head_size=24):
    for i, (head, body) in enumerate(items):
        x = 0.59 if i % 2 == 0 else 6.82; y, h = rows[i // 2]
        card(slide, x, y, 5.94, h, CARD)
        text(slide, x + 0.32, y, 5.3, h, [dict(text=head, font=HEAD, bold=True, size=head_size, color=title_color, after=6, line=1.15)] + body, anchor='middle')

# 1 cover
s = new_slide(T[0]); s.background.fill.fore_color.rgb = rgb(NAVY)
text(s, LEFT, 1.2, WIDTH, 0.6, [dict(text='RGV AI COALITION  ·  HANDS-ON WORKSHOP', size=18, bold=True, color=PALE, line=1.2)])
text(s, LEFT, 2.3, WIDTH, 2.4, [dict(text=T[0], font=HEAD, bold=True, size=72, color=WHITE, line=1.02)], name='Title')
text(s, LEFT, 4.7, WIDTH, 0.9, [dict(text=K['tagline'], size=32, color=PALE, line=1.2)])

# 2 who we are (the same short bios as the healthcare deck)
s = new_slide(notes_for(2, 'Moises Segovia. A healthcare and technology entrepreneur based in the Rio Grande Valley, owner of Life Star EMS and co-owner of Rio Care EMS. He worked as an EMT. Through Vital Care he is developing software and exploring practical uses of AI.\n\n'
    'Rich Gomez. He has done marketing for over 15 years and has worked with AI since it started, building the follow-up and automation that keeps schedules full. As a biomed tech he went into different clinics and saw the paperwork pile up while staff were stretched thin.'))
title(s, T[1], 0.55)
for x, who in zip((0.59, 6.82), K['presenters']):
    name, side, items = who['name'], who['side'], who['items']
    card(s, x, 2.15, 5.94, 3.3, CARD)
    text(s, x + 0.35, 2.4, 5.24, 3.0, [dict(text=name, font=HEAD, bold=True, size=26, color=INK, line=1.1, after=2),
        dict(text=side, size=18, bold=True, color=TEAL, after=10)] + plain_bullets(items, size=19, after=5))
card(s, LEFT, 5.7, WIDTH, 1.15, PALE)
text(s, LEFT + 0.4, 5.7, WIDTH - 0.8, 1.15, [dict(runs=[('The goal: ', dict(bold=True, color=NAVY)), (K['goal'], {})], font=HEAD, size=24, line=1.2)], anchor='middle')

# 3 what do you use AI for (audience question, same slide as the healthcare deck)
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

# 4 the problem
s = new_slide(notes_for(4, K['problem']['notes']))
title(s, T[3], 0.55)
card_grid(s, [(h, [dict(text=b, size=20, color=BODY, line=1.25)]) for h, b in K['problem']['cards']], [(2.2, 2.0), (4.45, 2.0)])

# 5 the rules
s = new_slide(notes_for(5, K['rules']['notes']))
title(s, T[4], 0.55)
text(s, LEFT, 1.42, 6.9, 5.5, lead_bullets([tuple(b) for b in K['rules']['bullets']], size=23, after=22), anchor='middle')
card(s, 7.75, 1.42, 5.0, 5.5, PALE)
text(s, 8.1, 1.42, 4.3, 5.5, [dict(text=K['rules']['cardTitle'], font=HEAD, bold=True, size=26, color=NAVY, after=12, line=1.15),
    dict(text=K['rules']['cardBody'], size=22, line=1.3)], anchor='middle')

# 6 laptops out
n = D['laptops']
s = new_slide(notes_for(n, '\n\n'.join(f"{i}. {st['title']}\n{st['body']}" for i, st in enumerate(D['steps'], 1)))); title(s, T[n - 1], 0.6)
numbered(s, [(st['title'], st['short']) for st in D['steps']], 1.85, 1.3, width=8.4, head_size=23, body_size=18)
card(s, 10.38, 2.0, 2.37, 2.37, WHITE, radius=0.16)
s.shapes.add_picture(QR, Inches(10.46), Inches(2.08), width=Inches(2.21), height=Inches(2.21))
text(s, 9.78, 4.5, 3.57, 1.4, [dict(text='Scan to follow along', font=HEAD, bold=True, size=18, color=INK, align='center', after=4),
    dict(text='rgvaicoalition.com', size=16, bold=True, color=NAVY, align='center', line=1.15),
    dict(text='/' + SLUG, size=16, bold=True, color=NAVY, align='center', line=1.15)])

# 7-10 prompts: the gist in large type; the full prompt is on the page and in the notes.
for p in D['prompts']:
    n = p['slide']
    s = new_slide(notes_for(n, p['lead'] + '\n\n' + p['text'] + '\n\nCheck it: ' + p['check'] + '\nTry next: ' + p['next']))
    title(s, T[n - 1], 0.55)
    card(s, LEFT, 2.35, WIDTH, 2.35, CARD)
    text(s, LEFT + 0.45, 2.35, WIDTH - 0.9, 2.35, [dict(text='“' + p['short'] + '”', size=24, line=1.35)], anchor='middle', name='Prompt')
    text(s, LEFT, 5.05, WIDTH, 0.6, [dict(runs=[('Check it: ', dict(bold=True, color=NAVY)), (p['shortCheck'], {})], size=24, color=INK, line=1.25)])
    text(s, LEFT, 6.2, WIDTH, 0.5, [dict(runs=[('Copy the full prompt: ', {}), (PAGE, dict(bold=True, color=NAVY))], size=18, color=BODY, line=1.25)])

# 11 one more thing: a customer survey form (presenter demo)
F = D['form']; n = D['formSlide']
s = new_slide(notes_for(n, F['lead'] + '\n\n' + F['text'] + '\n\n' + '\n'.join(f"{i}. {st['title']}. {st['body']}" for i, st in enumerate(F['steps'], 1)) + '\n\n' + F['note']))
title(s, T[n - 1], 0.55, h=0.8)
text(s, LEFT, 1.5, WIDTH, 0.6, [dict(text=F['lead'], size=24, color=BODY, line=1.2)])
card(s, LEFT, 2.3, WIDTH, 1.85, CARD)
text(s, LEFT + 0.4, 2.3, WIDTH - 0.8, 1.85, [dict(text='“' + F['text'] + '”', size=22, line=1.35)], anchor='middle', name='Prompt')
for i, st in enumerate(F['steps']):
    x = LEFT + i * 4.14
    text(s, x, 4.5, 0.6, 0.8, [dict(text=str(i + 1), font=HEAD, bold=True, size=40, color=TEAL, line=1.0)])
    text(s, x + 0.62, 4.55, 3.25, 1.2, [dict(text=st['title'], font=HEAD, bold=True, size=20, color=INK, line=1.2)])
card(s, LEFT, 6.1, WIDTH, 0.8, PALE, radius=0.16)
text(s, LEFT + 0.4, 6.1, WIDTH - 0.8, 0.8, [dict(text=F['slideNote'], size=19, bold=True, color=NAVY, line=1.2)], anchor='middle')

# 12 habit
s = new_slide(notes_for(12, K['habit']['notes']))
title(s, T[11], 0.7)
numbered(s, [tuple(item) for item in K['habit']['items']], 2.5, 1.4, head_size=26, body_size=20)

# 13 close
s = new_slide(notes_for(13, 'Thank the room. The prompts stay online at ' + PAGE + '. Groups that want this session can ask at rgvaicoalition.com/workshops, and anyone can join the coalition on the home page to hear about the next one.'))
title(s, T[12], 1.6, size=48, w=9.6, x=1.87, align='center', h=1.0)
text(s, 1.87, 3.0, 9.6, 1.2, [dict(text=K['closeLine'], size=24, color=BODY, align='center', line=1.35)])
btn = card(s, 3.67, 4.75, 6.0, 0.9, NAVY, radius=0.45)
btn.click_action.hyperlink.address = 'https://rgvaicoalition.com/workshops'
tf = btn.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; para = tf.paragraphs[0]; para.alignment = PP_ALIGN.CENTER
r = para.add_run(); r.text = 'rgvaicoalition.com/workshops'; r.font.name = HEAD; r.font.bold = True; r.font.size = Pt(22); r.font.color.rgb = rgb(WHITE)

assert len(prs.slides) == len(T), len(prs.slides)
prs.save(out); print('built', len(prs.slides), 'slides')

subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', tmp, out], check=True, capture_output=True)
pdf = os.path.join(tmp, os.path.splitext(os.path.basename(out))[0] + '.pdf')
shutil.copyfile(pdf, os.path.join(PUBLIC, NAME + '.pdf'))
subprocess.run(['pdftoppm', '-jpeg', '-jpegopt', 'quality=84,progressive=y', '-scale-to-x', '1600', '-scale-to-y', '-1', pdf, os.path.join(PUBLIC, 'slide')], check=True)
print('wrote', out, 'and', len(prs.slides), 'slide images')
