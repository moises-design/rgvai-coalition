"""Builds the table card for the "Learn or teach" board.

Writes public/learn/qr-learn.png (the QR code alone) and
public/learn/table-card.pdf (a letter page with two cards to cut apart and
stand on tables). The code opens /learn?from=qr, so answers from a table scan
are counted as coming from a meetup.

Usage:  python3 scripts/build-learn-qr.py
Needs:  reportlab, segno, and the Manrope font installed.
"""
import io, os, subprocess
import segno
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public', 'learn')
URL = 'https://rgvaicoalition.com/learn?from=qr'
SHOWN = 'rgvaicoalition.com/learn'

def font_path(weight):
    found = subprocess.run(['fc-match', '-f', '%{file}', f'Manrope:weight={weight}'], capture_output=True, text=True).stdout
    if 'anrope' not in found:
        raise SystemExit('Manrope font not installed; see AGENTS.md')
    return found
pdfmetrics.registerFont(TTFont('Body', font_path('regular')))
pdfmetrics.registerFont(TTFont('Bold', font_path('bold')))

os.makedirs(OUT_DIR, exist_ok=True)
qr = segno.make(URL, error='m')
qr.save(os.path.join(OUT_DIR, 'qr-learn.png'), scale=20, border=3, dark='#1F2533')
buffer = io.BytesIO(); qr.save(buffer, kind='png', scale=20, border=2, dark='#1F2533'); buffer.seek(0)
image = ImageReader(buffer)

INK, BODY, BLUE = HexColor('#1F2533'), HexColor('#4A5261'), HexColor('#1557FF')
W, H = letter
c = canvas.Canvas(os.path.join(OUT_DIR, 'table-card.pdf'), pagesize=letter)
c.setTitle('Learn or teach table card: RGV AI Coalition')
c.setAuthor('RGV AI Coalition')

def centered(y, s, font, size, color):
    c.setFillColor(color); c.setFont(font, size); c.drawCentredString(W / 2, y, s)

for top in (H, H / 2):  # two cards per page
    centered(top - 0.75 * inch, 'RGV AI COALITION', 'Bold', 11, BLUE)
    centered(top - 1.35 * inch, 'What should we cover next?', 'Bold', 30, INK)
    centered(top - 1.75 * inch, 'Tell us what you want to learn, or what you could teach.', 'Body', 14, BODY)
    side = 2.35 * inch
    c.drawImage(image, (W - side) / 2, top - 1.95 * inch - side, side, side)
    centered(top - 4.6 * inch, 'Scan with your phone camera. 20 seconds, no account.', 'Bold', 13, INK)
    centered(top - 4.9 * inch, SHOWN, 'Body', 12, BODY)

c.setStrokeColor(HexColor('#B8BEC9')); c.setDash(4, 4); c.line(0.5 * inch, H / 2, W - 0.5 * inch, H / 2)
c.save()
print('wrote', OUT_DIR)
