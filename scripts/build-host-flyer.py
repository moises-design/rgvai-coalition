"""Builds the one-page "Host a workshop" flyer: public/host-a-workshop.pdf.

A printable sheet to hand to a chamber, library, clinic, school or nonprofit.
Its wording comes from src/data/workshops.js, so it stays in step with
/workshops: only workshops marked ready are listed.

Usage:  python3 scripts/build-host-flyer.py
Needs:  reportlab, segno, node, and the Manrope font installed.
"""
import io, json, os, subprocess
import segno
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'host-a-workshop.pdf')
LINK = 'rgvaicoalition.com/workshops'

DUMP = """
import * as w from './src/data/workshops.js';
console.log(JSON.stringify({ ready: w.WORKSHOPS.filter(x => x.ready), steps: w.FORMAT_STEPS,
  we: w.HOST_WE_BRING, you: w.HOST_YOU_BRING, email: w.CONTACT_EMAIL }));
"""
D = json.loads(subprocess.run(['node', '--input-type=module', '-e', DUMP], cwd=ROOT, check=True, capture_output=True, text=True).stdout)

def font_path(weight):
    found = subprocess.run(['fc-match', '-f', '%{file}', f'Manrope:weight={weight}'], capture_output=True, text=True).stdout
    if 'anrope' not in found:
        raise SystemExit('Manrope font not installed; see AGENTS.md')
    return found
pdfmetrics.registerFont(TTFont('Body', font_path('regular')))
pdfmetrics.registerFont(TTFont('Bold', font_path('bold')))

INK, BODY, NAVY, TEAL = HexColor('#1F2533'), HexColor('#4A5261'), HexColor('#2A5074'), HexColor('#1B7480')
CARD, PALE = HexColor('#E7EAF1'), HexColor('#DDEBEE')
W, H = letter
M = 0.7 * inch

c = canvas.Canvas(OUT, pagesize=letter)
c.setTitle('Host a hands-on AI workshop: RGV AI Coalition')
c.setAuthor('RGV AI Coalition')

def text(x, y, s, font='Body', size=11, color=INK):
    c.setFillColor(color); c.setFont(font, size); c.drawString(x, y, s)

def wrap(x, y, s, width, font='Body', size=11, color=BODY, leading=None):
    leading = leading or size * 1.4
    words, line = s.split(), ''
    for word in words:
        trial = (line + ' ' + word).strip()
        if pdfmetrics.stringWidth(trial, font, size) > width and line:
            text(x, y, line, font, size, color); y -= leading; line = word
        else:
            line = trial
    if line:
        text(x, y, line, font, size, color); y -= leading
    return y

# header
y = H - M
text(M, y - 4, 'RGV AI COALITION', 'Bold', 11, TEAL)
y -= 50
text(M, y, 'Host a hands-on', 'Bold', 36, INK); y -= 42
text(M, y, 'AI workshop.', 'Bold', 36, INK); y -= 30
y = wrap(M, y, 'Laptops out, real work, and prompts your people take home. You bring the room. We bring the session.', W - 2 * M - 2.2 * inch, size=13.5, leading=20)

# QR, top right
qr = io.BytesIO(); segno.make('https://' + LINK, error='m').save(qr, kind='png', scale=20, border=2); qr.seek(0)
q = 1.75 * inch
c.drawImage(ImageReader(qr), W - M - q, H - M - q - 28, q, q)
c.setFillColor(BODY); c.setFont('Body', 8.5); c.drawCentredString(W - M - q / 2, H - M - q - 40, 'Scan to see the workshops')

# how a session runs
y -= 14
text(M, y, 'How every session runs', 'Bold', 15, NAVY); y -= 12
col = (W - 2 * M - 3 * 10) / 4
top = y
for i, step in enumerate(D['steps']):
    x = M + i * (col + 10)
    c.setFillColor(CARD); c.roundRect(x, top - 88, col, 88, 9, stroke=0, fill=1)
    text(x + 10, top - 22, str(i + 1), 'Bold', 16, TEAL)
    yy = wrap(x + 10, top - 40, step['title'], col - 18, 'Bold', 10, INK, 12)
    wrap(x + 10, yy - 2, step['body'], col - 18, 'Body', 8.6, BODY, 11)
y = top - 88 - 26

# workshops ready today
text(M, y, 'Workshops ready today', 'Bold', 15, NAVY); y -= 20
for workshop in D['ready']:
    text(M, y, workshop['title'], 'Bold', 11.5, INK)
    y = wrap(M, y - 15, 'For ' + workshop['audience'].lower() + ': ' + ', '.join(e[0].lower() + e[1:] for e in workshop['examples']) + '.', W - 2 * M, 'Body', 9.8, BODY, 13)
    y -= 9
y = wrap(M, y - 1, 'Have a different group in mind? Ask. We build new sessions on request.', W - 2 * M, 'Bold', 10, TEAL)

# we bring / you bring
y -= 12
half = (W - 2 * M - 14) / 2
box_h = 112
for i, (head, items, fill) in enumerate((('We bring', D['we'], PALE), ('You bring', D['you'], CARD))):
    x = M + i * (half + 14)
    c.setFillColor(fill); c.roundRect(x, y - box_h, half, box_h, 10, stroke=0, fill=1)
    text(x + 16, y - 26, head, 'Bold', 13.5, NAVY)
    yy = y - 48
    for item in items:
        c.setFillColor(TEAL); c.circle(x + 20, yy + 3.5, 2.2, stroke=0, fill=1)
        text(x + 30, yy, item, 'Body', 10.5, INK); yy -= 19
y -= box_h + 22

# contact
c.setFillColor(NAVY); c.roundRect(M, y - 76, W - 2 * M, 76, 12, stroke=0, fill=1)
c.setFillColor(HexColor('#FFFFFF')); c.setFont('Bold', 17); c.drawString(M + 22, y - 32, 'Ask about hosting')
c.setFont('Body', 12); c.drawString(M + 22, y - 54, D['email'] + '    ·    ' + LINK)

c.setFillColor(BODY); c.setFont('Body', 8.5)
c.drawString(M, 0.5 * inch, '© 2026 RGV AI Coalition · Edinburg, TX · Connect. Collaborate. Innovate.')
c.showPage(); c.save()
print('wrote', OUT)
