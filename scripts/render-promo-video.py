#!/usr/bin/env python3
"""
Renders the Google Play promo video (1920x1080, 30 fps, ~31 s) from real app
screenshots, in the same look as the store screenshots: cream ground, maroon
ink, Newsreader headlines, a phone on the right and a dotted mala arc.

Every screen shown is a real capture of the app (emulator screenshots, plus the
phone screens cropped from docs/store-assets/en/04-sankalpa.png and
05-progress.png), so the video never shows anything the app doesn't do.
Play rejects misleading media, and false claims cost ratings.

The soundtrack is the app's own tanpura loop and round-complete temple bell
(assets/sounds), so there is nothing to license.

Usage:
  python3 scripts/render-promo-video.py --shots <dir> [--out docs/store-assets/promo-video.mp4]

<dir> holds 1080x2400 emulator screenshots named as in SHOTS below. Capture
them with `adb exec-out screencap -p > <dir>/<name>.png`.
"""

import argparse
import hashlib
import math
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
W, H, FPS = 1920, 1080, 30
DURATION = 31.0

# ── brand ────────────────────────────────────────────────────────────────────
GROUND = (251, 247, 241)
GROUND_EDGE = (243, 230, 214)
INK = (58, 29, 22)
MUTED = (122, 91, 78)
SAFFRON = (196, 104, 31)
SAFFRON_LIGHT = (240, 162, 84)
MAROON = (107, 47, 37)
DEEP = (74, 27, 20)
DEEPER = (40, 14, 10)
NIGHT = (24, 15, 13)
CREAM_TEXT = (251, 238, 224)


def font(rel, size):
    return ImageFont.truetype(os.path.join(ROOT, 'node_modules/@expo-google-fonts', rel), size)


SERIF = 'newsreader/500Medium/Newsreader_500Medium.ttf'
SERIF_ITALIC = 'newsreader/400Regular_Italic/Newsreader_400Regular_Italic.ttf'
SANS = 'manrope/600SemiBold/Manrope_600SemiBold.ttf'
SANS_BOLD = 'manrope/700Bold/Manrope_700Bold.ttf'
DEVA = 'tiro-devanagari-hindi/400Regular/TiroDevanagariHindi_400Regular.ttf'

# ── timeline (seconds) ───────────────────────────────────────────────────────
T_HOOK_END = 3.5
T_COUNTER = 3.5
T_ROUND = 9.0
T_ROUND_TAP = 10.1
T_FOCUS = 13.0
T_LIBRARY = 16.5
T_PROGRESS = 20.5
T_HINDI = 24.5
T_CTA = 27.0

COUNTER_TAPS = [4.5 + i * 0.42 for i in range(10)]
FOCUS_TAPS = [13.9 + i * 0.5 for i in range(5)]

SHOTS = [
    *[f'counter_{i:02d}' for i in range(11)],
    'round_00', 'round_02',
    *[f'focus_{i:02d}' for i in range(1, 6)],
    'lib_01', 'lib_02', 'hi_counter', 'dark_counter',
]


# ── easing / helpers ─────────────────────────────────────────────────────────
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def lerp(a, b, t):
    return a + (b - a) * t


def lerp_rgb(c1, c2, t):
    return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))


def window(t, start, end, fade_in=0.45, fade_out=0.35):
    """0→1→0 visibility of a scene element living in [start, end)."""
    if t < start or t >= end + fade_out:
        return 0.0
    a = ease_out((t - start) / fade_in) if fade_in else 1.0
    b = 1.0 - ease_in_out((t - end) / fade_out) if t >= end else 1.0
    return a * b


def with_alpha(img, alpha):
    if alpha >= 0.999:
        return img
    r, g, b, a = img.split()
    a = a.point(lambda v: int(v * alpha))
    return Image.merge('RGBA', (r, g, b, a))


# ── backgrounds ──────────────────────────────────────────────────────────────
def radial_bg(inner, outer, center=(0.72, 0.55)):
    small = Image.new('RGB', (192, 108))
    px = small.load()
    cx, cy = center[0] * 192, center[1] * 108
    for y in range(108):
        for x in range(192):
            d = math.hypot((x - cx) / 192, (y - cy) / 108) / 0.75
            px[x, y] = lerp_rgb(inner, outer, clamp(d) ** 1.4)
    return small.resize((W, H), Image.BICUBIC)


def mala_arc(color, alpha, center=(1390, 560), radius=640, beads=72):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(beads):
        a = 2 * math.pi * i / beads
        x, y = center[0] + radius * math.cos(a), center[1] + radius * math.sin(a)
        r = 7
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*color, alpha))
    return layer


def make_backgrounds():
    cream = radial_bg(GROUND, GROUND_EDGE).convert('RGBA')
    cream.alpha_composite(mala_arc((214, 196, 180), 120))
    maroon = radial_bg((120, 52, 38), DEEPER, center=(0.5, 0.45)).convert('RGBA')
    maroon.alpha_composite(mala_arc((200, 120, 90), 60, center=(960, 540), radius=620, beads=80))
    night = radial_bg((52, 30, 25), NIGHT).convert('RGBA')
    night.alpha_composite(mala_arc((120, 80, 66), 70))
    return {'cream': cream, 'maroon': maroon, 'night': night}


# ── text ─────────────────────────────────────────────────────────────────────
def is_deva(ch):
    return 'ऀ' <= ch <= 'ॿ'


CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
_TEXT_CACHE = {}


def chrome_text(text, latin_rel, size, fill):
    """
    Renders one line with Chrome, which shapes Devanagari correctly (PIL without
    libraqm can't: matras land in the wrong place and conjuncts break apart).
    Returns (RGBA image, baseline y within it). Latin glyphs use latin_rel and
    Devanagari falls back to Tiro Devanagari Hindi, the app's own Hindi face.
    """
    key = (text, latin_rel, size, fill)
    if key in _TEXT_CACHE:
        return _TEXT_CACHE[key]
    lh = size * 2
    asc, desc = ImageFont.truetype(os.path.join(ROOT, 'node_modules/@expo-google-fonts', latin_rel), size).getmetrics()
    baseline = (lh - (asc + desc)) / 2 + asc
    fonts = os.path.join(ROOT, 'node_modules/@expo-google-fonts')
    html = f"""<!doctype html><meta charset="utf-8"><style>
@font-face {{ font-family: L; src: url('file://{fonts}/{latin_rel}'); }}
@font-face {{ font-family: D; src: url('file://{fonts}/{DEVA}'); }}
html, body {{ margin: 0; background: transparent; }}
span {{ font: {size}px/{lh}px L, D; color: rgb{fill}; white-space: pre; display: inline-block; }}
</style><span>{text}</span>"""
    with tempfile.TemporaryDirectory() as tmp:
        hp, pp = os.path.join(tmp, 't.html'), os.path.join(tmp, 't.png')
        open(hp, 'w', encoding='utf-8').write(html)
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                        '--force-device-scale-factor=1', '--default-background-color=00000000',
                        f'--window-size=1900,{lh}', f'--screenshot={pp}', 'file://' + hp],
                       check=True, capture_output=True)
        img = Image.open(pp).convert('RGBA')
    bbox = img.getbbox()
    img = img.crop((0, 0, (bbox[2] if bbox else 1) + 2, lh))
    _TEXT_CACHE[key] = (img, baseline)
    return _TEXT_CACHE[key]


def draw_line(layer, xy, text, latin_rel, size, fill, anchor_x='left', tracking=0):
    """Draws one line with its baseline at y. Hindi lines go through Chrome for shaping."""
    x, y = xy
    if any(is_deva(c) for c in text):
        img, base = chrome_text(text, latin_rel, size, fill)
        w = img.width
        if anchor_x == 'center':
            x -= w / 2
        layer.alpha_composite(img, (int(x), int(y - base)))
        return w
    f = font(latin_rel, size)
    d = ImageDraw.Draw(layer)
    if tracking:
        w = sum(f.getlength(c) + tracking for c in text) - tracking
        if anchor_x == 'center':
            x -= w / 2
        for c in text:
            d.text((x, y), c, font=f, fill=fill, anchor='ls')
            x += f.getlength(c) + tracking
        return w
    w = f.getlength(text)
    if anchor_x == 'center':
        x -= w / 2
    d.text((x, y), text, font=f, fill=fill, anchor='ls')
    return w


def line_width(text, latin_rel, size):
    if any(is_deva(c) for c in text):
        return chrome_text(text, latin_rel, size, (0, 0, 0))[0].width
    return font(latin_rel, size).getlength(text)


def text_block(kicker, headline, sub, dark=False):
    """Left-column caption: kicker, serif headline, sub. Returns an RGBA layer."""
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ink = CREAM_TEXT if dark else INK
    muted = (214, 190, 176) if dark else MUTED
    kick = SAFFRON_LIGHT if dark else SAFFRON
    lines = headline.split('\n')
    sub_lines = sub.split('\n') if sub else []
    block_h = 40 + len(lines) * 100 + 34 + len(sub_lines) * 48
    x, y = 150, (H - block_h) / 2 + 10
    draw_line(layer, (x, y + 26), kicker, SANS_BOLD, 26, kick, tracking=5)
    y += 40
    for line in lines:
        y += 100
        draw_line(layer, (x, y), line, SERIF, 92, ink)
    y += 36
    d.rounded_rectangle([x, y, x + 64, y + 4], 2, fill=kick)
    y += 22
    for line in sub_lines:
        y += 48
        draw_line(layer, (x, y), line, SANS, 34, muted)
    return layer


# ── phone ────────────────────────────────────────────────────────────────────
SCREEN_W, SCREEN_H = 412, 916
BEZEL = 13
PHONE_W, PHONE_H = SCREEN_W + 2 * BEZEL, SCREEN_H + 2 * BEZEL
PHONE_X, PHONE_Y = 1390 - PHONE_W // 2, (H - PHONE_H) // 2
STATUS_H = 30
CONTENT_H = SCREEN_H - STATUS_H
SRC_STATUS = 64  # emulator status bar height at 1080 px wide


def rounded_mask(size, radius):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius, fill=255)
    return m


def status_bar(dark=False):
    bar = Image.new('RGBA', (SCREEN_W, STATUS_H), (*((16, 10, 9) if dark else GROUND), 255))
    d = ImageDraw.Draw(bar)
    c = (200, 180, 170) if dark else INK
    d.text((30, STATUS_H / 2 + 1), '5:30', font=font(SANS_BOLD, 15), fill=c, anchor='lm')
    x = SCREEN_W - 32
    d.rounded_rectangle([x - 22, 10, x, 20], 3, outline=c, width=2)
    d.rectangle([x - 19, 13, x - 3, 17], fill=c)
    for i in range(4):
        bx = x - 56 + i * 5
        d.rectangle([bx, 20 - 3 - i * 2, bx + 3, 20], fill=c)
    return bar


def screen_from_capture(path):
    """1080x2400 emulator capture → phone screen image (status bar redrawn, consistent)."""
    img = Image.open(path).convert('RGB')
    dark = sum(img.getpixel((540, 1200))) < 150
    content = img.crop((0, SRC_STATUS, 1080, 2400)).resize((SCREEN_W, CONTENT_H), Image.LANCZOS)
    screen = Image.new('RGBA', (SCREEN_W, SCREEN_H))
    screen.paste(status_bar(dark), (0, 0))
    screen.paste(content, (0, STATUS_H))
    return screen


def screen_from_store_asset(path, top):
    """Crops the phone screen out of one of our own store screenshots (below its status bar)."""
    img = Image.open(path).convert('RGB')
    region = img.crop((236, top, 844, 1920))
    scale = SCREEN_W / region.width
    region = region.resize((SCREEN_W, int(region.height * scale)), Image.LANCZOS)
    screen = Image.new('RGBA', (SCREEN_W, SCREEN_H), (*GROUND, 255))
    screen.paste(status_bar(), (0, 0))
    screen.paste(region.crop((0, 0, SCREEN_W, min(region.height, CONTENT_H))), (0, STATUS_H))
    return screen


def make_phone_shell():
    shell = Image.new('RGBA', (PHONE_W + 160, PHONE_H + 160), (0, 0, 0, 0))
    shadow = Image.new('RGBA', shell.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [80 + 10, 80 + 40, 80 + PHONE_W - 10, 80 + PHONE_H + 20], 70, fill=(60, 25, 15, 120))
    shell.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(36)))
    body = Image.new('RGBA', (PHONE_W, PHONE_H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, PHONE_W - 1, PHONE_H - 1], 66, fill=(52, 26, 20, 255))
    bd.rounded_rectangle([3, 3, PHONE_W - 4, PHONE_H - 4], 63, outline=(96, 56, 44, 255), width=2)
    shell.alpha_composite(body, (80, 80))
    return shell


SCREEN_MASK = None


def compose_screen(screen_a, screen_b=None, mix=0.0):
    s = screen_a.copy()
    if screen_b is not None and mix > 0:
        s = Image.blend(s, screen_b, clamp(mix))
    return s


def screen_point(x, y):
    """Maps a point in a 1080x2400 capture to frame coordinates on the phone."""
    sx = PHONE_X + BEZEL + x * SCREEN_W / 1080
    sy = PHONE_Y + BEZEL + STATUS_H + (y - SRC_STATUS) * CONTENT_H / (2400 - SRC_STATUS)
    return sx, sy


def ripple(frame, center, age, color=(255, 255, 255)):
    """A soft touch indicator, so viewers see where a tap lands."""
    if age < 0 or age > 0.45:
        return
    p = age / 0.45
    r = 18 + 46 * ease_out(p)
    a = int(150 * (1 - p))
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a // 2), outline=(*color, a), width=3)
    frame.alpha_composite(layer)


# ── scenes ───────────────────────────────────────────────────────────────────
def build(shots_dir):
    bgs = make_backgrounds()
    shell = make_phone_shell()
    mask = rounded_mask((SCREEN_W, SCREEN_H), 54)

    def cap(name):
        return screen_from_capture(os.path.join(shots_dir, f'{name}.png'))

    counter = [cap(f'counter_{i:02d}') for i in range(11)]
    round_before, round_after = cap('round_00'), cap('round_02')
    focus = [cap(f'focus_{i:02d}') for i in range(1, 6)]
    lib_top, lib_list = cap('lib_01'), cap('lib_02')
    hindi = cap('hi_counter')
    dark_path = os.path.join(shots_dir, 'dark_counter.png')
    dark = cap('dark_counter') if os.path.exists(dark_path) else None
    store = os.path.join(ROOT, 'docs/store-assets/en')
    sankalpa = screen_from_store_asset(os.path.join(store, '04-sankalpa.png'), 668)
    progress = screen_from_store_asset(os.path.join(store, '05-progress.png'), 708)

    captions = [
        (T_COUNTER, T_ROUND, text_block('JAAP MALA COUNTER', 'Tap once for\nevery bead',
                                         'Mantrika counts all 108 for you,\nso your mind stays on the mantra.')),
        (T_ROUND, T_FOCUS, text_block('EVERY ROUND', 'A temple bell at\nevery 108th bead',
                                       'Rounds and malas are counted\nautomatically.')),
        (T_FOCUS, T_LIBRARY, text_block('FOCUS MODE', 'Chant with\nyour eyes closed',
                                         'A calm, dark screen.\nTap anywhere to count.', dark=True)),
        (T_LIBRARY, T_PROGRESS, text_block('SACRED LIBRARY', '35 sacred mantras,\nor your own',
                                            'Om Namah Shivaya, Gayatri,\nHare Krishna, Maha Mrityunjaya…')),
        (T_PROGRESS, T_HINDI, text_block('GOALS & SANKALPA', 'Watch your\nsadhana grow',
                                          'Daily goals, streaks, sankalpa vows\nand a practice calendar.')),
        (T_HINDI, T_CTA, text_block('YOUR LANGUAGE', 'English & हिंदी',
                                     'Light and dark themes\nfor brahma muhurta and night jaap.')),
    ]

    # hook
    hook_a = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw_line(hook_a, (W / 2, 470), 'Lost count in the', SERIF, 104, CREAM_TEXT, 'center')
    draw_line(hook_a, (W / 2, 590), 'middle of your mala?', SERIF, 104, CREAM_TEXT, 'center')
    hook_b = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw_line(hook_b, (W / 2, 720), 'Let Mantrika count every bead for you.', SERIF_ITALIC, 52, SAFFRON_LIGHT, 'center')

    # call to action
    icon = Image.open(os.path.join(ROOT, 'assets/icon.png')).convert('RGBA').resize((196, 196), Image.LANCZOS)
    icon.putalpha(rounded_mask((196, 196), 46))
    cta = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W / 2 - 150, 120, W / 2 + 150, 420], fill=(240, 162, 84, 70))
    cta.alpha_composite(glow.filter(ImageFilter.GaussianBlur(50)))
    cta.alpha_composite(icon, (W // 2 - 98, 170))
    d = ImageDraw.Draw(cta)
    draw_line(cta, (W / 2, 520), 'Mantrika', SERIF, 118, CREAM_TEXT, 'center')
    draw_line(cta, (W / 2, 600), 'Your mantra jaap counter', SERIF, 52, CREAM_TEXT, 'center')
    draw_line(cta, (W / 2, 668), 'मंत्र जाप · 108-bead digital mala', SERIF, 40, SAFFRON_LIGHT, 'center')
    chips = ['Free', 'No sign-up', 'Streaks & sankalpa', 'English & हिंदी']
    widths = [line_width(c, SANS_BOLD, 28) + 56 for c in chips]
    x = W / 2 - (sum(widths) + 18 * (len(chips) - 1)) / 2
    for c, w in zip(chips, widths):
        d.rounded_rectangle([x, 724, x + w, 784], 30, fill=(255, 255, 255, 34), outline=(255, 255, 255, 60), width=2)
        draw_line(cta, (x + w / 2, 764), c, SANS_BOLD, 28, CREAM_TEXT, 'center')
        x += w + 18
    cta_btn = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(cta_btn)
    bw = 520
    d.rounded_rectangle([W / 2 - bw / 2, 846, W / 2 + bw / 2, 930], 42, fill=(*SAFFRON_LIGHT, 255))
    draw_line(cta_btn, (W / 2, 900), 'Install free · start today', SANS_BOLD, 34, DEEPER, 'center')

    def phone_screen(t):
        """The phone's screen at time t (with crossfades between captures)."""
        if t < T_ROUND:
            idx = sum(1 for tap in COUNTER_TAPS if t >= tap + 0.06)
            return counter[min(idx, 10)]
        if t < T_FOCUS:
            return round_after if t >= T_ROUND_TAP + 0.06 else round_before
        if t < T_LIBRARY:
            idx = sum(1 for tap in FOCUS_TAPS if t >= tap + 0.06)
            prev = focus[0] if idx == 0 else focus[min(idx, 5) - 1]
            if t < T_FOCUS + 0.3:
                return compose_screen(round_after, prev, (t - T_FOCUS) / 0.3)
            return prev
        if t < T_PROGRESS:
            if t < T_LIBRARY + 0.3:
                return compose_screen(focus[4], lib_top, (t - T_LIBRARY) / 0.3)
            return compose_screen(lib_top, lib_list, (t - 18.6) / 0.35) if t >= 18.6 else lib_top
        if t < T_HINDI:
            if t < T_PROGRESS + 0.3:
                return compose_screen(lib_list, sankalpa, (t - T_PROGRESS) / 0.3)
            return compose_screen(sankalpa, progress, (t - 22.6) / 0.35) if t >= 22.6 else sankalpa
        if t < T_HINDI + 0.3:
            return compose_screen(progress, hindi, (t - T_HINDI) / 0.3)
        if dark is not None and t >= 25.9:
            return compose_screen(hindi, dark, (t - 25.9) / 0.35)
        return hindi

    def frame(t):
        # background: maroon hook → cream → night for focus → cream → maroon CTA
        f = bgs['cream'].copy()
        if t < T_HOOK_END + 0.5:
            f = Image.blend(bgs['maroon'], f, ease_in_out((t - T_HOOK_END) / 0.5))
        night = window(t, T_FOCUS, T_LIBRARY, 0.5, 0.5)
        if night > 0:
            f = Image.blend(f, bgs['night'], night)
        if t >= T_CTA - 0.1:
            f = Image.blend(f, bgs['maroon'], ease_in_out((t - (T_CTA - 0.1)) / 0.6))

        # hook
        if t < T_HOOK_END + 0.4:
            a = ease_out((t - 0.2) / 0.7) * (1 - ease_in_out((t - (T_HOOK_END - 0.45)) / 0.4))
            if a > 0:
                f.alpha_composite(with_alpha(hook_a, a), (0, int(20 * (1 - ease_out((t - 0.2) / 0.7)))))
            b = ease_out((t - 1.7) / 0.6) * (1 - ease_in_out((t - (T_HOOK_END - 0.45)) / 0.4))
            if b > 0:
                f.alpha_composite(with_alpha(hook_b, b))

        # phone: rises in with the counter scene, sinks out before the CTA
        if T_COUNTER <= t < T_CTA + 0.2:
            rise = ease_out((t - T_COUNTER - 0.05) / 0.9)
            sink = ease_in_out((t - (T_CTA - 0.45)) / 0.6)
            dy = int(520 * (1 - rise) + 700 * sink)
            screen = phone_screen(t).copy()
            screen.putalpha(mask)
            f.alpha_composite(shell, (PHONE_X - 80, PHONE_Y - 80 + dy))
            f.alpha_composite(screen, (PHONE_X + BEZEL, PHONE_Y + BEZEL + dy))
            # touch ripples
            for tap in COUNTER_TAPS:
                ripple(f, (lambda p: (p[0], p[1] + dy))(screen_point(540, 2000)), t - tap)
            ripple(f, (lambda p: (p[0], p[1] + dy))(screen_point(540, 2000)), t - T_ROUND_TAP)
            for tap in FOCUS_TAPS:
                ripple(f, (lambda p: (p[0], p[1] + dy))(screen_point(540, 1200)), t - tap, (240, 162, 84))
            # 108th bead: a warm glow around the count panel
            g = t - T_ROUND_TAP
            if 0 <= g < 2.4:
                p = g / 2.4
                a = int(200 * math.sin(math.pi * min(1, p * 1.6)) * (1 - p) + 30 * (1 - p))
                x0, y0 = screen_point(748, 1245)
                x1, y1 = screen_point(1058, 1772)
                glow_l = Image.new('RGBA', (W, H), (0, 0, 0, 0))
                gd = ImageDraw.Draw(glow_l)
                pad = 4 + 8 * ease_out(min(1, g / 0.5))
                right = PHONE_X + BEZEL + SCREEN_W - 5
                gd.rounded_rectangle([x0 - pad, y0 - pad + dy, min(x1 + pad, right), y1 + pad + dy], 22,
                                     outline=(*SAFFRON_LIGHT, max(0, a)), width=5)
                f.alpha_composite(glow_l.filter(ImageFilter.GaussianBlur(2)))

        # captions
        for start, end, layer in captions:
            a = window(t, start + 0.15, end - 0.05)
            if a > 0:
                slide = int(26 * (1 - ease_out((t - start - 0.15) / 0.5)))
                f.alpha_composite(with_alpha(layer, a), (0, slide))

        # call to action
        if t >= T_CTA + 0.25:
            a = ease_out((t - T_CTA - 0.25) / 0.7)
            f.alpha_composite(with_alpha(cta, a), (0, int(24 * (1 - a))))
            b = ease_out((t - T_CTA - 1.1) / 0.6)
            if b > 0:
                pulse = 1 + 0.025 * math.sin((t - T_CTA) * 4.2) if t > T_CTA + 1.7 else 1
                btn = cta_btn if pulse == 1 else cta_btn.resize((int(W * pulse), int(H * pulse)), Image.BICUBIC)
                ox, oy = (W - btn.width) // 2, int(888 - 888 * pulse)
                f.alpha_composite(with_alpha(btn, b), (ox, oy))

        # gentle fade from black at the start and to black at the very end
        if t < 0.25 or t > DURATION - 0.6:
            k = clamp(t / 0.25) if t < 0.25 else clamp((DURATION - t) / 0.6)
            f = Image.blend(Image.new('RGBA', (W, H), (0, 0, 0, 255)), f, k)
        return f.convert('RGB')

    return frame


def soundtrack(out_wav):
    """Tanpura bed with fades, plus the app's temple bell at the 108th bead and the CTA."""
    sounds = os.path.join(ROOT, 'assets/sounds')
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y',
        '-i', os.path.join(sounds, 'tanpura.m4a'),
        '-i', os.path.join(sounds, 'chime.m4a'),
        '-i', os.path.join(sounds, 'chime.m4a'),
        '-filter_complex',
        f'[0]atrim=0:{DURATION},volume=0.95,afade=t=in:d=1.5,afade=t=out:st={DURATION - 2.8}:d=2.8[bed];'
        f'[1]adelay={int((T_ROUND_TAP + 0.05) * 1000)}|{int((T_ROUND_TAP + 0.05) * 1000)},volume=1.5[c1];'
        f'[2]adelay={int((T_CTA + 0.3) * 1000)}|{int((T_CTA + 0.3) * 1000)},volume=0.8[c2];'
        f'[bed][c1][c2]amix=inputs=3:normalize=0,alimiter=limit=0.9,aresample=48000[a]',
        '-map', '[a]', '-ac', '2', out_wav,
    ], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--shots', required=True)
    ap.add_argument('--out', default=os.path.join(ROOT, 'docs/store-assets/promo-video.mp4'))
    ap.add_argument('--preview', type=float, nargs='*', help='write PNG stills at these times instead')
    args = ap.parse_args()

    missing = [s for s in SHOTS if s != 'dark_counter' and not os.path.exists(os.path.join(args.shots, f'{s}.png'))]
    if missing:
        sys.exit(f'missing screenshots: {", ".join(missing)}')

    frame = build(args.shots)
    if args.preview is not None:
        for t in args.preview:
            p = os.path.splitext(args.out)[0] + f'-{t:05.2f}.png'
            frame(t).save(p)
            print('wrote', p)
        return

    wav = os.path.splitext(args.out)[0] + '.wav'
    soundtrack(wav)
    enc = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-y',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-i', wav,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
        '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', args.out,
    ], stdin=subprocess.PIPE)
    total = int(DURATION * FPS)
    for i in range(total):
        enc.stdin.write(frame(i / FPS).tobytes())
        if i % 150 == 0:
            print(f'frame {i}/{total}', flush=True)
    enc.stdin.close()
    enc.wait()
    os.remove(wav)
    print('wrote', args.out)


if __name__ == '__main__':
    main()
