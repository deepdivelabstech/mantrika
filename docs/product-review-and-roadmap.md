# Mantrika — Product Review & Roadmap (Director of Product lens)

## Context

Mantrika is a beautifully crafted japa-mala counter (Expo/RN, EN+HI, 12 bundled mantras, custom mantras, streaks, soundscapes, reminders, AdMob banners). Craft is high; the product loop is thin: tap → count → (maybe) come back tomorrow. There is no memory of what the user practised, no goal the user chose, no reason to return beyond a streak, and nothing that protects the user's data. This review lists what I'd fix, then what I'd build, ranked by impact on retention (D1/D7/D30) and monetization.

**North-star metric:** Weekly Practice Days per user (days/week with ≥1 completed mala). **Guardrails:** crash-free sessions, ad-induced churn, notification opt-outs.

## P0 — Trust & correctness bugs (ship this week)

These quietly break trust in a habit app; users notice wrong numbers immediately.

1. **Stale streak after absence.** `isStreakLapsed()` exists in `streak.ts` but no screen uses it. A user who returns after a week still sees "12 days" on Progress until they tap. Use it in `ProgressScreen.tsx` to show 0 / "streak paused".
2. **Stale "today" counts.** `beadsToday`/`roundsToday` only reset inside `tapBead()` (`useProgressStore.ts`). Opening the app the next morning shows yesterday's beads on Counter and Progress. Add a derived selector (`lastActiveDate !== today` ⇒ 0).
3. **Ad on the meditation screen.** The banner in `TabNavigator.tsx:124` renders on Counter — the one place a user wants calm. Expect it to hurt session length and ratings. Remove it from Counter; keep it on Library/Progress/Settings.
4. **Fixed 390×584 layout** in `CounterScreen.tsx` (`malaWrap`, absolute `left: 270`). This will clip on small Androids and look lost on tablets/Pro Max. `useMalaGeometry` already exists; drive layout from `useWindowDimensions`.
5. **No accidental-tap protection / undo.** One stray tap adds a bead and can't be reverted. Add "undo last bead" (long-press or a small ↺) — cheap and widely requested in japa apps.
6. **Data loss on reinstall/phone switch.** Everything lives in AsyncStorage only. At minimum: export/import JSON from Settings. (Full sync in P2.)

## P1 — Deepen the core loop (next 4–6 weeks)

Goal: turn a counter into a practice.

| #   | Feature                             | Why it matters                                                                                                                                                                                                                               | Notes                                                                                          |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Sankalpa (personal intention/goal)  | Hard-coded `DAILY_FOCUS_TARGET = 1008` fits few users. A user-chosen goal ("1 mala/day", "1.25 lakh Gayatri in 40 days") is the #1 retention lever in this category.                                                                         | Add to onboarding; replace constant in `models.ts`; goal progress on Counter + Progress.       |
| 2   | Session history & per-mantra totals | Today we only keep 30 `activeDates` and one lifetime number. Users want "I've chanted Om Namah Shivaya 54,000 times".                                                                                                                        | New `sessions[]` / `dailyLog{date→{mantraId→beads}}` in progress store with migration (`.v2`). |
| 3   | Progress screen v2                  | Calendar heatmap, weekly bar chart, per-mantra breakdown, best streak. Current screen is 4 static cards.                                                                                                                                     | Reuses `StatCard`, `ProgressRing`.                                                             |
| 4   | Round-complete moment               | Completing 108 is the emotional peak; make it felt: distinct haptic, bell/conch sound, gentle animation, optional auto-pause.                                                                                                                | `useHaptics`, `useSound` already exist.                                                        |
| 5   | Hands-free / eyes-closed mode       | Serious practitioners chant with eyes closed. Full-screen tap-anywhere, screen dimmed, keep-awake, volume-button counting (Android).                                                                                                         | Big differentiator vs. generic tally apps.                                                     |
| 6   | Smart reminders                     | Single fixed reminder today. Add streak-at-risk nudge (evening, only if not practised), festival/ekadashi reminders, and copy that rotates.                                                                                                  | `notifications.ts`. Track opt-in rate.                                                         |
| 7   | Richer mantra content               | 12 mantras with one-line descriptions. Add meaning, word-by-word translation, pronunciation audio, deity, benefits, recommended count. Remote catalog (`REMOTE_CATALOG_URL`) is already wired — use it to ship content without app releases. | Content is the moat; SEO/ASO benefit too.                                                      |
| 8   | Onboarding that sets intent         | Today it only asks for a name. Ask: experience level → favourite deity/mantra → goal → reminder time (with notification permission in context).                                                                                              | Expect large D1 lift; reminder opt-in in context converts far better.                          |

## P2 — Growth, monetization & platform (quarter)

- **Mantrika Plus (subscription) instead of leaning on banners.** Banner eCPMs in a calm, low-session-count app are tiny and degrade brand. Plus: ad-free, all soundscapes + new ones, guided chant audio, advanced stats, cloud backup, themes, unlimited custom mantras. Keep core counting free forever.
- **Cloud sync + account** (optional, Sign in with Apple/Google). Unlocks multi-device and kills data-loss churn.
- **Home-screen & lock-screen widgets / Live Activity.** Show streak + today's malas; a widget is a daily reminder that isn't a notification. Apple Watch / Wear OS counter is a natural extension (counting on the wrist mid-walk).
- **Shareable milestones.** Beautiful cards for "108 days streak", "1 lakh japa" — organic growth on WhatsApp/Instagram, the primary channels for this audience.
- **Group sankalpa / community japa.** "Our satsang is chanting 11 lakh Hanuman Chalisa this Navratri" — collective counter. Strong virality and festival-driven spikes.
- **Festival calendar & themed programs.** Navratri, Shivratri, Shravan, Ekadashi — curated 9/21/40-day programs. Drives seasonal re-engagement.
- **More languages.** i18n is already clean (README "Adding a new language"). Marathi, Gujarati, Tamil, Telugu, Bengali unlock most of the TAM; also IAST transliteration toggle.
- **Accessibility.** Dynamic type, screen-reader announcements every N beads, high-contrast/dark theme (also wanted for early-morning practice).

## Instrumentation (prerequisite for everything above)

There is no product analytics — only Sentry. Without it we can't prove any of this works.

- Add privacy-respecting analytics (e.g. PostHog / Firebase Analytics) with consent.
- Core events: `onboarding_completed`, `bead_tapped` (sampled/aggregated), `round_completed`, `session_ended{beads, duration, mantraId}`, `mantra_selected`, `reminder_set`, `notification_opened`, `ad_impression`, `paywall_viewed`.
- Dashboards: D1/D7/D30 retention, Weekly Practice Days, rounds/session, reminder opt-in → retention correlation.

## Suggested sequencing

- **Sprint 1:** P0 #1–#5 + analytics.
- **Sprint 2–3:** Sankalpa, session history (store v2 migration), round-complete moment, onboarding v2.
- **Sprint 4–5:** Progress v2, hands-free mode, smart reminders, content expansion via remote catalog.
- **Quarter:** Plus subscription + backup/sync, widgets, share cards, festival programs, group sankalpa.

## Verification (for whichever items we implement)

- Unit tests alongside existing ones in `src/shared/lib/__tests__/` (streak lapse, day-rollover selector, store migration).
- `npm run verify` (typecheck + lint + jest).
- Manual: change device date forward to confirm streak/today reset; test Counter on small Android + iPad simulators; confirm no banner on Counter.
- Extend the Maestro critical-path flow for onboarding v2 and round completion.
