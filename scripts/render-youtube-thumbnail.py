#!/usr/bin/env python3
"""
Renders the YouTube thumbnail (1280x720) for the promo video, in the same
brand look and from the same real app screenshot (the 108th-bead moment).

Thumbnails are read at ~200 px wide in search and suggestions, so it uses one
short, high-contrast promise, a big phone and nothing small that matters.

Usage:
  python3 scripts/render-youtube-thumbnail.py --shots <dir> [--out docs/store-assets/youtube-thumbnail.png]
"""

import argparse
import importlib.util
import os

from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('promo', os.path.join(HERE, 'render-promo-video.py'))
promo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(promo)

TW, TH = 1280, 720


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--shots', required=True)
    ap.add_argument('--out', default=os.path.join(promo.ROOT, 'docs/store-assets/youtube-thumbnail.png'))
    args = ap.parse_args()

    # Background: the video's maroon, with the mala arc behind the phone.
    bg = promo.radial_bg((132, 58, 42), promo.DEEPER, center=(0.68, 0.45)).resize((TW, TH)).convert('RGBA')
    arc = promo.mala_arc((214, 140, 100), 70, center=(1450, 540), radius=640, beads=72).resize((TW, TH))
    bg.alpha_composite(arc)

    # Phone at the 108th bead, tilted slightly, large and on the right.
    screen = promo.screen_from_capture(os.path.join(args.shots, 'round_02.png'))
    screen.putalpha(promo.rounded_mask((promo.SCREEN_W, promo.SCREEN_H), 54))
    phone = Image.new('RGBA', (promo.PHONE_W + 160, promo.PHONE_H + 160), (0, 0, 0, 0))
    phone.alpha_composite(promo.make_phone_shell())
    phone.alpha_composite(screen, (80 + promo.BEZEL, 80 + promo.BEZEL))
    # Saffron ring on the count panel, as in the video's bell moment.
    ring = Image.new('RGBA', phone.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    sx = lambda x: 80 + promo.BEZEL + x * promo.SCREEN_W / 1080
    sy = lambda y: 80 + promo.BEZEL + promo.STATUS_H + (y - promo.SRC_STATUS) * promo.CONTENT_H / (2400 - promo.SRC_STATUS)
    rd.rounded_rectangle([sx(752), sy(1244), sx(1046), sy(1774)], 22, outline=(*promo.SAFFRON_LIGHT, 255), width=7)
    phone.alpha_composite(ring.filter(ImageFilter.GaussianBlur(1.2)))
    scale = 0.92
    phone = phone.resize((int(phone.width * scale), int(phone.height * scale)), Image.LANCZOS)
    phone = phone.rotate(-6, resample=Image.BICUBIC, expand=True)
    bg.alpha_composite(phone, (TW - phone.width + 40, (TH - phone.height) // 2 + 70))

    # "108" medallion overlapping the phone: the number is the hook.
    med = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    md = ImageDraw.Draw(med)
    cx, cy, r = 770, 470, 92
    glow = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([cx - r - 30, cy - r - 30, cx + r + 30, cy + r + 30], fill=(240, 162, 84, 120))
    bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(28)))
    md.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*promo.SAFFRON_LIGHT, 255))
    md.ellipse([cx - r + 8, cy - r + 8, cx + r - 8, cy + r - 8], outline=(*promo.DEEPER, 90), width=2)
    promo.draw_line(med, (cx, cy + 26), '108', promo.SERIF, 82, promo.DEEPER, 'center')
    promo.draw_line(med, (cx, cy + 58), 'BEADS', promo.SANS_BOLD, 17, promo.DEEPER, 'center', tracking=3)
    bg.alpha_composite(med)

    # Text: brand, promise, Hindi accent.
    t = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    icon = Image.open(os.path.join(promo.ROOT, 'assets/icon.png')).convert('RGBA').resize((76, 76), Image.LANCZOS)
    icon.putalpha(promo.rounded_mask((76, 76), 18))
    t.alpha_composite(icon, (64, 58))
    promo.draw_line(t, (156, 112), 'Mantrika', promo.SERIF, 50, promo.CREAM_TEXT)
    promo.draw_line(t, (66, 300), 'Never lose', promo.SERIF, 118, promo.CREAM_TEXT)
    promo.draw_line(t, (66, 420), 'count again', promo.SERIF, 118, promo.CREAM_TEXT)
    td = ImageDraw.Draw(t)
    td.rounded_rectangle([68, 462, 148, 468], 3, fill=(*promo.SAFFRON_LIGHT, 255))
    promo.draw_line(t, (66, 540), 'मंत्र जाप काउंटर', promo.SERIF, 64, promo.SAFFRON_LIGHT)
    # Pill: free + no sign-up (both true; the strongest install reasons).
    pill = 'FREE · NO SIGN-UP'
    pw = promo.line_width(pill, promo.SANS_BOLD, 28) + 3 * len(pill) + 52
    td.rounded_rectangle([66, 590, 66 + pw, 646], 28, fill=(255, 255, 255, 40), outline=(255, 255, 255, 90), width=2)
    promo.draw_line(t, (66 + 26, 628), pill, promo.SANS_BOLD, 28, promo.CREAM_TEXT, tracking=3)
    # A soft shadow under the headline keeps it legible over the arc.
    shadow = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    shadow.paste((20, 6, 4, 160), mask=t.split()[3])
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(10)), (0, 4))
    bg.alpha_composite(t)

    out = bg.convert('RGB')
    out.save(args.out, optimize=True)
    print('wrote', args.out, os.path.getsize(args.out) // 1024, 'KB')


if __name__ == '__main__':
    main()
