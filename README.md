# Mantrika

A mantra / japa mala counter app, built with Expo (managed workflow) + React Native +
TypeScript.

## Stack

- Expo SDK 57 + TypeScript (strict)
- React Navigation (native-stack + bottom-tabs)
- Zustand (persisted to AsyncStorage) for settings, progress, and mantra state
- React Native Reanimated + Gesture Handler for the mala/rising-mantra animations
- i18next / react-i18next for English + Hindi
- expo-av for ambient soundscapes, expo-haptics for bead-tap feedback
- expo-font + @expo-google-fonts/{manrope,newsreader,tiro-devanagari-hindi} for brand
  typefaces (bundled locally, not fetched from a CDN)
- expo-notifications for the daily practice reminder
- Sentry (`@sentry/react-native`), env-gated behind `SENTRY_DSN`
- Jest + React Native Testing Library for unit/component tests; Maestro for one
  critical-path E2E flow

## Architecture

```
src/
  app/            navigation container, providers, entry point (App.tsx re-exports this)
  features/
    counter/        Counter (home) screen: mala loop, tap logic, mantra display
    mantra-library/ Select Mantra screen: search, catalog, custom mantras
    progress/       Your Progress screen: stats, streak, daily focus ring
    settings/       Settings & Guidance screen
  shared/
    components/    generic reusable UI (Button, Card, Header, ProgressRing, ...)
    theme/          design tokens: colors, typography, spacing
    i18n/            i18next setup + locale JSON files
    store/            Zustand slices + AsyncStorage persistence
    hooks/              useHaptics, useSound, useMalaGeometry, useAppFonts
    lib/                 pure functions: streak calc, bead/round math, date helpers
    data/                 bundled mantra catalog (+ optional remote fetch w/ local fallback)
    types/                 shared data model
assets/
  fonts/ (via @expo-google-fonts/*), images/, sounds/
```

**Rule:** each feature folder is self-contained; only `shared/` is imported across features.
No feature imports another feature directly — this is what keeps the app scalable as more
screens are added.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in as needed; every value is optional for local dev
npm start
```

Requires Node 20+. Run on a simulator/device with `npm run ios` / `npm run android`, or
`npm run web` for a quick check (native modules like haptics/audio degrade gracefully there).

## Environment variables

See `.env.example` for the full list. Locally, none are required — the app runs fully
offline with sane defaults (no Sentry, no remote catalog, bundled fonts/sounds). For EAS
builds, set the same variable names via `eas env:create` / the EAS dashboard, scoped to the
`development` / `preview` / `production` profiles in `eas.json`.

Read at build time by `app.config.ts` (`APP_ENV`, Sentry org/project, EAS project id/update
URL, `REMOTE_CATALOG_URL`) and surfaced to the app at runtime via `expo-constants`
(`Constants.expoConfig.extra`).

## Adding a new language

1. Add `src/shared/i18n/locales/<code>.json` with the same keys as `en.json`.
2. Register it in `src/shared/i18n/index.ts` (`resources` + it's picked up by
   `supportedLanguages` automatically).
3. Add it as an option in the language picker in
   `src/features/settings/SettingsScreen.tsx`.
4. If the script needs its own typeface (like Devanagari does), add the font package under
   `shared/hooks/useAppFonts.ts` and reference it from `shared/theme/typography.ts`.

No other code changes needed — `displayName()` in `shared/lib/mantraDisplay.ts` already
switches to a mantra's `deva` field for any non-`en` language; extend that if a language
needs its own script field instead of reusing `deva`.

## Adding a mantra to the catalog

Edit `src/shared/data/mantraCatalog.json` and add an entry:

```json
{
  "id": "kebab-case-id",
  "name": "English name",
  "deva": "Devanagari",
  "chant": "Romanized chant",
  "description": "One sentence."
}
```

`id` must be unique and must not start with `custom-` (that prefix is reserved for
user-added mantras). If `REMOTE_CATALOG_URL` is configured, the same shape is expected from
that endpoint — the bundled JSON is always the offline/failure fallback (see
`shared/data/mantraCatalog.ts`).

## Placeholder assets

- `assets/sounds/*.wav` are silent stub files so the ambient-soundscape lifecycle
  (load/loop/stop) is real end-to-end without shipping licensed audio. Swap in real loops at
  the same paths — nothing in `shared/hooks/useSound.ts` needs to change.
- `assets/icon.png`, `assets/splash-icon.png`, and the Android adaptive-icon layers are the
  Expo template defaults. Before release, replace them with exported PNGs of the
  `BrandMark` component (`src/shared/components/BrandMark.tsx`) — the ring-of-beads mark
  with the rudraksha pendant, using `assets/images/rudraksha-bead.png`.

## Testing

```bash
npm run typecheck
npm run lint
npm test
```

Unit tests cover the logic that's easy to get subtly wrong: streak calculation
(`shared/lib/__tests__/streak.test.ts`), bead/round math
(`shared/lib/__tests__/beadMath.test.ts`), and i18n fallback resolution
(`shared/lib/__tests__/i18nResolve.test.ts` — a missing key falls back to English, then to
the raw key, never a blank string). There's also one component test for the Counter screen's
tap-to-increment flow.

For the one true end-to-end path (open app → tap bead 10× → see the count), run:

```bash
maestro test e2e/counter-flow.yaml
```

against a running dev client or simulator build.

## EAS Build / Submit

```bash
eas login
eas build --profile development --platform ios   # or android / all
eas build --profile preview --platform all
eas build --profile production --platform all
eas submit --profile production --platform ios
```

`eas.json` defines the three profiles; `runtimeVersion.policy` is `appVersion`, and
`eas update` publishes JS-only updates against the matching runtime version.

## Production-readiness notes

- Offline-first: counting, progress, and mantra selection never block on network.
- Error boundaries wrap each top-level screen (`shared/components/ErrorBoundary.tsx`) so a
  crash in one tab doesn't blank the others.
- Every icon-only control goes through `shared/components/IconButton.tsx`, which requires an
  `accessibilityLabel`.
- Pre-commit hook (husky + lint-staged) runs ESLint + Prettier on staged files.
- CI (`.github/workflows/ci.yml`) runs typecheck + lint + test on every PR; tagging `v*`
  triggers an EAS production build (`.github/workflows/eas-build.yml`, requires the
  `EXPO_TOKEN` repo secret).
