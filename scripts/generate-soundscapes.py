#!/usr/bin/env python3
"""
Synthesizes the ambient soundscape loops in assets/sounds/ (ganga, forest,
bowls) using only the Python standard library, then encodes them to AAC with
macOS `afconvert`. Everything is generated, so there are no licensing
questions, and every run with the same seed gives the same output.

Each loop is rendered into a circular buffer: noise beds get their tail
crossfaded into their head, and one-shot events (bird calls, bowl strikes)
wrap around the end. Playback with `player.loop = true` is therefore seamless.

It also renders `chime`, the one-shot temple bell played when a mala round
completes (not a loop, so it is written as-is).

Usage:  python3 scripts/generate-soundscapes.py [name ...]   (default: all)
"""

import math
import os
import random
import struct
import subprocess
import sys
import tempfile
import wave

SR = 22050  # ambient content has little energy above ~8 kHz
LOOP_SECONDS = 40
N = SR * LOOP_SECONDS
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
TAU = 2 * math.pi


# ── building blocks ──────────────────────────────────────────────────────────


def white(n, rng):
    return [rng.uniform(-1.0, 1.0) for _ in range(n)]


def pink(n, rng):
    """Paul Kellet's economy pink-noise filter."""
    b0 = b1 = b2 = 0.0
    out = [0.0] * n
    for i in range(n):
        w = rng.uniform(-1.0, 1.0)
        b0 = 0.99765 * b0 + w * 0.0990460
        b1 = 0.96300 * b1 + w * 0.2965164
        b2 = 0.57000 * b2 + w * 1.0526913
        out[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12
    return out


def brown(n, rng):
    out = [0.0] * n
    y = 0.0
    for i in range(n):
        y = (y + rng.uniform(-1.0, 1.0) * 0.02) * 0.998
        out[i] = y * 3.5
    return out


def lowpass(x, cutoff):
    a = 1 - math.exp(-TAU * cutoff / SR)
    y = 0.0
    out = [0.0] * len(x)
    for i, v in enumerate(x):
        y += a * (v - y)
        out[i] = y
    return out


def highpass(x, cutoff):
    lp = lowpass(x, cutoff)
    return [v - l for v, l in zip(x, lp)]


def bandpass(x, lo, hi):
    return lowpass(highpass(x, lo), hi)


def loopable(bed, fade_seconds=3.0):
    """Takes a bed of length N + fade and crossfades its tail into its head."""
    f = int(fade_seconds * SR)
    out = bed[:N]
    for i in range(f):
        t = i / f
        # equal-power crossfade keeps loudness steady through the seam
        out[i] = bed[N + i] * math.cos(t * math.pi / 2) + out[i] * math.sin(t * math.pi / 2)
    return out


def lfo(i, period_s, phase=0.0):
    """Sine LFO whose period divides the loop, so it is continuous at the seam."""
    cycles = max(1, round(LOOP_SECONDS / period_s))
    return math.sin(TAU * cycles * i / N + phase)


def add_wrapped(buf, start, samples, gain=1.0):
    for j, v in enumerate(samples):
        buf[(start + j) % N] += v * gain


def normalize(x, peak_db=-3.0):
    peak = max(abs(v) for v in x) or 1.0
    g = 10 ** (peak_db / 20) / peak
    return [v * g for v in x]


# ── events ───────────────────────────────────────────────────────────────────


def bell(freq, seconds, partials, decay, rng, detune=0.6):
    """Struck metal: inharmonic partials, each a slightly detuned pair (beating)."""
    n = int(seconds * SR)
    out = [0.0] * n
    for ratio, amp, dec_mul in partials:
        f = freq * ratio
        d = detune * ratio
        ph1, ph2 = rng.random() * TAU, rng.random() * TAU
        k = decay * dec_mul
        for i in range(n):
            t = i / SR
            env = math.exp(-t / k) * min(1.0, t / 0.004)
            out[i] += amp * env * (math.sin(TAU * f * t + ph1) + math.sin(TAU * (f + d) * t + ph2)) * 0.5
    return out


def chirp(f0, f1, seconds, curve=1.0, vibrato=0.0, vib_rate=30.0):
    n = int(seconds * SR)
    out = [0.0] * n
    ph = 0.0
    for i in range(n):
        p = i / n
        f = f0 + (f1 - f0) * (p ** curve) + vibrato * math.sin(TAU * vib_rate * i / SR)
        ph += TAU * f / SR
        env = math.sin(math.pi * p) ** 1.5
        out[i] = math.sin(ph) * env
    return out


# ── soundscapes ──────────────────────────────────────────────────────────────


def ganga(rng):
    """River at the ghats: deep flowing water, surface ripples, a distant temple bell."""
    extra = 3 * SR
    deep = lowpass(brown(N + extra, rng), 500)
    surface = bandpass(pink(N + extra, rng), 300, 2800)
    bed = loopable([d * 0.9 + s * 0.45 for d, s in zip(deep, surface)])
    out = [0.0] * N
    for i in range(N):
        swell = 0.78 + 0.12 * lfo(i, 13.3) + 0.08 * lfo(i, 6.7, 1.3)
        out[i] = bed[i] * swell

    # water trickles: tiny rising bubbles, scattered
    for _ in range(int(LOOP_SECONDS * 9)):
        f0 = rng.uniform(500, 1100)
        b = chirp(f0, f0 * rng.uniform(1.4, 2.2), rng.uniform(0.012, 0.035), curve=0.6)
        add_wrapped(out, rng.randrange(N), b, rng.uniform(0.015, 0.05))

    # a far-off temple bell, twice per loop
    partials = [(1.0, 1.0, 1.0), (2.76, 0.45, 0.55), (5.40, 0.25, 0.3), (8.93, 0.12, 0.2)]
    for start in (2.5, 22.5):
        b = lowpass(bell(rng.uniform(560, 600), 9.0, partials, 3.2, rng), 2500)
        add_wrapped(out, int(start * SR), b, 0.07)
    return out


def forest(rng):
    """Morning forest: soft wind through leaves and scattered bird calls."""
    extra = 3 * SR
    wind = loopable(bandpass(pink(N + extra, rng), 150, 1600))
    leaves = loopable(bandpass(white(N + extra, rng), 2500, 6000))
    out = [0.0] * N
    for i in range(N):
        gust = 0.55 + 0.25 * lfo(i, 10.0) + 0.15 * lfo(i, 4.0, 2.1)
        rustle = max(0.0, 0.35 + 0.4 * lfo(i, 8.0, 0.7))
        out[i] = wind[i] * gust + leaves[i] * 0.12 * rustle

    def songbird():
        notes = []
        base = rng.uniform(2600, 3800)
        for _ in range(rng.randint(3, 6)):
            f0 = base * rng.uniform(0.85, 1.15)
            notes.append(chirp(f0, f0 * rng.uniform(1.1, 1.5), rng.uniform(0.05, 0.11), vibrato=60))
            notes.append([0.0] * int(rng.uniform(0.03, 0.08) * SR))
        return [v for note in notes for v in note]

    def cuckoo():
        f = rng.uniform(650, 760)
        return chirp(f * 1.25, f * 1.2, 0.22) + [0.0] * int(0.08 * SR) + chirp(f, f * 0.97, 0.32)

    def trill():
        f = rng.uniform(4200, 5200)
        return chirp(f, f * 0.8, rng.uniform(0.5, 0.9), vibrato=500, vib_rate=rng.uniform(22, 32))

    t = 0.6
    while t < LOOP_SECONDS:
        kind = rng.random()
        if kind < 0.6:
            call, gain = songbird(), rng.uniform(0.10, 0.20)
        elif kind < 0.82:
            call, gain = trill(), rng.uniform(0.04, 0.08)
        else:
            call, gain = cuckoo(), rng.uniform(0.10, 0.14)
        # a little air absorption so distant birds sound distant
        call = lowpass(call, rng.uniform(4500, 8000))
        add_wrapped(out, int(t * SR), call, gain)
        t += rng.uniform(1.4, 4.2)
    return out


def bowls(rng):
    """Tibetan singing bowls struck slowly over a soft resonant drone."""
    out = [0.0] * N
    # drone: low sustained tones; integer cycles per loop so the seam is clean
    for f, amp in ((110.0, 0.05), (165.0, 0.03), (220.5, 0.02)):
        cycles = round(f * LOOP_SECONDS)
        for i in range(N):
            out[i] += amp * math.sin(TAU * cycles * i / N) * (0.8 + 0.2 * lfo(i, 20.0, f))

    # measured-ish ratios for a hand-hammered bowl
    partials = [(1.0, 1.0, 1.0), (2.71, 0.55, 0.6), (5.13, 0.28, 0.35), (8.30, 0.12, 0.2)]
    strikes = [(0.0, 196.0), (8.0, 261.6), (16.0, 220.0), (24.0, 293.7), (32.0, 246.9)]
    for start, f in strikes:
        b = bell(f * rng.uniform(0.995, 1.005), 14.0, partials, 4.5, rng, detune=0.8)
        add_wrapped(out, int(start * SR), b, rng.uniform(0.32, 0.4))
    return lowpass(out, 6000)


def chime(rng):
    """Round-complete chime: one clear temple-bell strike that rings out in ~3 s."""
    partials = [(1.0, 1.0, 1.0), (2.76, 0.5, 0.5), (5.40, 0.22, 0.3), (8.93, 0.1, 0.18)]
    n = int(3.2 * SR)
    out = lowpass(bell(659.3, 3.2, partials, 0.9, rng, detune=0.9), 5000)
    # fade the last 300 ms so the file ends in silence rather than a cut
    f = int(0.3 * SR)
    for i in range(f):
        out[n - f + i] *= 1 - i / f
    return out


# ── output ───────────────────────────────────────────────────────────────────


def write_m4a(name, samples):
    samples = normalize(samples)
    os.makedirs(OUT_DIR, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, f'{name}.wav')
        with wave.open(wav_path, 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 32767)) for v in samples))
        out_path = os.path.abspath(os.path.join(OUT_DIR, f'{name}.m4a'))
        subprocess.run(
            ['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', wav_path, out_path],
            check=True,
        )
    print(f'wrote {os.path.relpath(out_path)} ({os.path.getsize(out_path) // 1024} KB)')


SOUNDS = (('ganga', ganga, 108), ('forest', forest, 27), ('bowls', bowls, 9), ('chime', chime, 3))

if __name__ == '__main__':
    wanted = set(sys.argv[1:])
    for name, fn, seed in SOUNDS:
        if not wanted or name in wanted:
            write_m4a(name, fn(random.Random(seed)))
