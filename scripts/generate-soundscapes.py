#!/usr/bin/env python3
"""
Synthesizes the ambient soundscape loops in assets/sounds/ using only the
Python standard library: the free ganga, forest and bowls, plus the premium
set unlocked by a rewarded ad (rain, ocean, thunder, crickets, havan,
windchimes, templebells, tanpura, om, himalaya), then encodes them to AAC with
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


def svf_band(x, freq, q=0.5):
    """Chamberlin state-variable bandpass. `freq` is a number or a per-sample callable."""
    low = band = 0.0
    out = [0.0] * len(x)
    fixed = None if callable(freq) else 2 * math.sin(math.pi * min(freq, SR / 6) / SR)
    for i, v in enumerate(x):
        f = fixed if fixed is not None else 2 * math.sin(math.pi * min(freq(i), SR / 6) / SR)
        low += f * band
        high = v - low - q * band
        band += f * high
        out[i] = band
    return out


def burst(seconds, rng, decay):
    """A short noise burst with an exponential tail: drops, crackles, pops."""
    n = max(1, int(seconds * SR))
    return [rng.uniform(-1.0, 1.0) * math.exp(-i / (decay * SR)) for i in range(n)]


def harmonic_tone(f0, seconds, weights, env, vibrato=0.0, vib_rate=5.0, phase_rng=None, kmax=40):
    """Sum of harmonics; `weights(k, t)` gives harmonic k's amplitude at time t, `env(t)` the overall level.

    Weights and envelope are evaluated at a control rate (every 32 samples)
    and held in between, which keeps pure-Python rendering tractable.
    """
    n = int(seconds * SR)
    out = [0.0] * n
    kmax = max(1, min(kmax, int((SR / 2 - 200) / f0)))
    ks = range(1, kmax + 1)
    phases = [(phase_rng.random() * TAU if phase_rng else 0.0) for _ in range(kmax + 1)]
    ph = 0.0
    active = []
    e = 0.0
    for i in range(n):
        t = i / SR
        if i % 32 == 0:
            e = env(t)
            active = [(k, w, phases[k]) for k in ks for w in (weights(k, t),) if w > 1e-4]
        f = f0 * (1 + vibrato * math.sin(TAU * vib_rate * t))
        ph += TAU * f / SR
        if e < 1e-5:
            continue
        acc = 0.0
        for k, w, p0 in active:
            acc += w * math.sin(k * ph + p0)
        out[i] = acc * e
    return out


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


# ── premium soundscapes ──────────────────────────────────────────────────────


def _rain_bed(rng, heaviness=1.0):
    extra = 3 * SR
    hiss = loopable(bandpass(pink(N + extra, rng), 900, 7000))
    body = loopable(lowpass(brown(N + extra, rng), 350))
    out = [0.0] * N
    for i in range(N):
        out[i] = (hiss[i] * 0.55 + body[i] * 0.5) * (0.88 + 0.08 * lfo(i, 8.0) + 0.04 * lfo(i, 5.0, 1.0))
    # individual drops on leaves and stone
    for _ in range(int(LOOP_SECONDS * 55 * heaviness)):
        d = svf_band(burst(rng.uniform(0.006, 0.02), rng, 0.003), rng.uniform(1500, 5500), 0.35)
        add_wrapped(out, rng.randrange(N), d, rng.uniform(0.04, 0.16))
    return out


def rain(rng):
    """Steady monsoon rain: a soft hiss, a low body of water and close drops."""
    return _rain_bed(rng)


def ocean(rng):
    """Waves on a quiet shore: slow swells that rise, break and wash back."""
    extra = 3 * SR
    roar = loopable(lowpass(brown(N + extra, rng), 700))
    foam = loopable(bandpass(pink(N + extra, rng), 600, 5000))
    out = [0.0] * N
    # five waves per loop with slightly different strengths
    waves = 5
    strengths = [rng.uniform(0.75, 1.0) for _ in range(waves)]
    for i in range(N):
        pos = i * waves / N
        w = int(pos)
        p = pos - w
        # fast rise to the break, long wash back
        swell = (p / 0.28) ** 2 if p < 0.28 else math.exp(-(p - 0.28) * 3.2)
        swell *= strengths[w % waves]
        out[i] = roar[i] * (0.35 + 0.65 * swell) + foam[i] * (0.08 + 0.75 * swell ** 1.6)
    return out


def thunder(rng):
    """Rain under a passing storm, with distant thunder rolling twice per loop."""
    out = _rain_bed(rng, heaviness=1.3)
    for start in (6.0, 26.0):
        n = int(9.0 * SR)
        rumble = lowpass(brown(n, rng), 140)
        crack = bandpass(white(n, rng), 200, 1800)
        roll = [0.0] * n
        # a few overlapping rolls make one long, uneven peal
        onsets = sorted(rng.uniform(0.0, 2.5) for _ in range(4))
        for i in range(n):
            t = i / SR
            e = 0.0
            for o in onsets:
                if t >= o:
                    dt = t - o
                    e += min(1.0, dt / 0.25) * math.exp(-dt / 2.2)
            c = math.exp(-max(0.0, t - onsets[0]) / 0.35) if t >= onsets[0] else 0.0
            roll[i] = rumble[i] * e * 2.2 + crack[i] * c * 0.25
        add_wrapped(out, int(start * SR), roll, rng.uniform(0.22, 0.28))
    return out


def crickets(rng):
    """A warm Indian night: crickets in several voices over a still, dark hush."""
    extra = 3 * SR
    hush = loopable(lowpass(pink(N + extra, rng), 600))
    out = [h * 0.25 for h in hush]
    for _ in range(6):
        f = rng.uniform(3800, 5200)
        pulse_rate = rng.uniform(25, 40)          # pulses within one chirp
        pulses = rng.randint(3, 5)
        chirp_gap = rng.uniform(0.45, 1.1)        # between chirps
        gain = rng.uniform(0.05, 0.12)
        one = []
        for k in range(pulses):
            m = int(SR / pulse_rate)
            for i in range(m):
                p = i / m
                one.append(math.sin(TAU * f * (len(one)) / SR) * (math.sin(math.pi * min(1.0, p / 0.6)) if p < 0.6 else 0.0))
        one = lowpass(one, rng.uniform(6500, 9000))
        t = rng.uniform(0.0, chirp_gap)
        while t < LOOP_SECONDS:
            add_wrapped(out, int(t * SR), one, gain * rng.uniform(0.8, 1.0))
            t += chirp_gap * rng.uniform(0.92, 1.08)
    # a faraway owl, once
    hoot = lowpass(chirp(420, 380, 0.45) + [0.0] * int(0.35 * SR) + chirp(410, 360, 0.7), 1500)
    add_wrapped(out, int(23.0 * SR), hoot, 0.06)
    return out


def havan(rng):
    """Sacred fire: a low breathing flame with crackles, sap pops and ember hiss."""
    extra = 3 * SR
    flame = loopable(lowpass(brown(N + extra, rng), 260))
    hiss = loopable(bandpass(pink(N + extra, rng), 1800, 6000))
    out = [0.0] * N
    for i in range(N):
        breath = 0.7 + 0.2 * lfo(i, 5.0, 0.4) + 0.1 * lfo(i, 13.3, 2.0)
        out[i] = flame[i] * 1.1 * breath + hiss[i] * 0.06 * breath
    # clustered crackles
    t = 0.0
    while t < LOOP_SECONDS:
        for _ in range(rng.randint(2, 9)):
            c = svf_band(burst(rng.uniform(0.002, 0.006), rng, 0.0012), rng.uniform(1800, 6000), 0.6)
            add_wrapped(out, int((t + rng.uniform(0, 0.25)) * SR), c, rng.uniform(0.15, 0.5))
        t += rng.uniform(0.15, 0.9)
    # a few bigger pops
    for _ in range(9):
        pop = svf_band(burst(0.03, rng, 0.008), rng.uniform(500, 1400), 0.4)
        add_wrapped(out, rng.randrange(N), pop, rng.uniform(0.35, 0.6))
    return out


def windchimes(rng):
    """Bamboo-and-brass chimes stirring in a light breeze, tuned pentatonic."""
    extra = 3 * SR
    breeze = loopable(bandpass(pink(N + extra, rng), 200, 1400))
    out = [0.0] * N
    for i in range(N):
        out[i] = breeze[i] * (1.0 + 0.3 * lfo(i, 10.0) + 0.2 * lfo(i, 6.7, 1.1))
    notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0]
    partials = [(1.0, 1.0, 1.0), (2.76, 0.35, 0.45), (5.40, 0.15, 0.25)]
    rendered = {f: lowpass(bell(f, 3.5, partials, 1.1, rng, detune=1.2), 7000) for f in notes}
    t = 0.3
    while t < LOOP_SECONDS:
        # gusts set several chimes going at once; lulls leave one or none
        for _ in range(rng.choice((1, 1, 2, 3, 4))):
            add_wrapped(out, int((t + rng.uniform(0, 0.6)) * SR), rendered[rng.choice(notes)], rng.uniform(0.04, 0.08))
        t += rng.uniform(1.0, 3.2)
    return out


def templebells(rng):
    """Mandir at aarti: a hand ghanti rung in bursts, a deep ghanta and a murmuring hall."""
    extra = 3 * SR
    hall = loopable(bandpass(pink(N + extra, rng), 150, 900))
    out = [h * 0.7 for h in hall]
    ghanti_p = [(1.0, 1.0, 1.0), (2.42, 0.6, 0.6), (4.10, 0.35, 0.35), (6.60, 0.18, 0.2)]
    ghanta_p = [(1.0, 1.0, 1.0), (2.76, 0.5, 0.55), (5.40, 0.3, 0.3), (8.93, 0.14, 0.2)]
    ghanti = lowpass(bell(1480, 1.8, ghanti_p, 0.55, rng, detune=2.0), 7500)
    # three bursts of rapid ringing per loop
    for start in (1.0, 14.5, 28.0):
        t = start
        end = start + rng.uniform(3.0, 4.5)
        while t < end:
            add_wrapped(out, int(t * SR), ghanti, rng.uniform(0.12, 0.2))
            t += rng.uniform(0.14, 0.2)
    for start in (0.2, 10.0, 20.0, 30.0):
        g = lowpass(bell(rng.uniform(205, 215), 10.0, ghanta_p, 3.6, rng, detune=0.5), 3000)
        add_wrapped(out, int(start * SR), g, 0.45)
    return out


def tanpura(rng):
    """Tanpura drone tuned Pa-Sa-Sa-Sa (C), with the jawari's moving buzz."""
    sa = 130.81
    cycle = 5.0  # four plucks per cycle, eight cycles per loop
    def pluck(f0):
        dur = 7.0
        def weights(k, t):
            # jawari: a bright band that sweeps up through the harmonics as the string rings
            centre = 3 + 14 * (1 - math.exp(-t / 1.6))
            band = math.exp(-((k - centre) ** 2) / 18.0)
            return (0.55 / k ** 0.9 + 0.6 * band / k ** 0.35) * math.exp(-t * (0.12 + 0.02 * k))
        env = lambda t: min(1.0, t / 0.01) * math.exp(-t / 3.0)
        return lowpass(harmonic_tone(f0, dur, weights, env, phase_rng=rng, kmax=36), 5000)
    voices = {'pa': pluck(sa * 0.75), 'sa': pluck(sa), 'low': pluck(sa / 2)}
    out = [0.0] * N
    for c in range(int(LOOP_SECONDS / cycle)):
        base = c * cycle
        for j, name in enumerate(('pa', 'sa', 'sa', 'low')):
            add_wrapped(out, int((base + j * cycle / 4) * SR), voices[name], rng.uniform(0.85, 1.0))
    return out


def om(rng):
    """A slow, low Om chanted four times per loop, two voices a breath apart."""
    f0 = 103.8  # G#2: a comfortable chanting pitch
    dur = 10.0
    # vowel formants (centre Hz, bandwidth Hz, gain) for A, U and the closed M
    A = ((730, 120, 1.0), (1090, 140, 0.55), (2440, 200, 0.18))
    U = ((320, 80, 1.0), (800, 110, 0.4), (2240, 200, 0.08))
    M = ((260, 70, 1.0), (1000, 300, 0.05), (2200, 300, 0.02))
    def vowel_at(t):
        # A 0-3 s, glide to U by 4 s, close to M by 6 s and hum out
        if t < 2.6:
            return A, A, 0.0
        if t < 4.0:
            return A, U, (t - 2.6) / 1.4
        if t < 5.8:
            return U, M, (t - 4.0) / 1.8
        return M, M, 0.0
    def weights(k, t):
        a, b, x = vowel_at(t)
        fk = k * f0
        acc = 0.0
        for (c1, w1, g1), (c2, w2, g2) in zip(a, b):
            c = c1 + (c2 - c1) * x
            w = w1 + (w2 - w1) * x
            g = g1 + (g2 - g1) * x
            acc += g * math.exp(-((fk - c) ** 2) / (2 * w * w))
        return acc / k ** 0.3
    def env(t):
        return min(1.0, t / 0.6) * (1.0 if t < 8.4 else max(0.0, (dur - t) / 1.6))
    voice1 = harmonic_tone(f0, dur, weights, env, vibrato=0.004, vib_rate=4.6, phase_rng=rng, kmax=32)
    voice2 = harmonic_tone(f0 * 1.004, dur, weights, env, vibrato=0.005, vib_rate=5.1, phase_rng=rng, kmax=32)
    out = [0.0] * N
    # a soft sub drone holds the space between chants
    cycles = round(f0 / 2 * LOOP_SECONDS)
    for i in range(N):
        out[i] = 0.05 * math.sin(TAU * cycles * i / N)
    for start in (0.0, 10.0, 20.0, 30.0):
        add_wrapped(out, int(start * SR), voice1, 0.6)
        add_wrapped(out, int((start + 0.18) * SR), voice2, 0.45)
    return lowpass(out, 4000)


def himalaya(rng):
    """High mountain air: wind whistling across a ridge over a deep valley rumble."""
    extra = 3 * SR
    total = N + extra
    rumble = loopable(lowpass(brown(total, rng), 180))
    def sweep(base, depth, period, phase):
        cycles = max(1, round(LOOP_SECONDS / period))
        return lambda i: base + depth * math.sin(TAU * cycles * (i % N) / N + phase)
    whistle1 = loopable(svf_band(pink(total, rng), sweep(700, 260, 13.3, 0.0), 0.08))
    whistle2 = loopable(svf_band(pink(total, rng), sweep(1250, 380, 8.0, 1.7), 0.1))
    gust_bed = loopable(bandpass(white(total, rng), 400, 3000))
    out = [0.0] * N
    for i in range(N):
        gust = max(0.0, 0.45 + 0.35 * lfo(i, 10.0, 0.3) + 0.2 * lfo(i, 4.0, 2.4))
        out[i] = (rumble[i] * 0.9
                  + whistle1[i] * 0.22 * gust
                  + whistle2[i] * 0.12 * (1 - 0.5 * gust)
                  + gust_bed[i] * 0.1 * gust)
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


SOUNDS = (
    ('ganga', ganga, 108),
    ('forest', forest, 27),
    ('bowls', bowls, 9),
    ('chime', chime, 3),
    ('rain', rain, 11),
    ('ocean', ocean, 21),
    ('thunder', thunder, 31),
    ('crickets', crickets, 41),
    ('havan', havan, 51),
    ('windchimes', windchimes, 61),
    ('templebells', templebells, 71),
    ('tanpura', tanpura, 81),
    ('om', om, 91),
    ('himalaya', himalaya, 101),
)

if __name__ == '__main__':
    wanted = set(sys.argv[1:])
    for name, fn, seed in SOUNDS:
        if not wanted or name in wanted:
            write_m4a(name, fn(random.Random(seed)))
