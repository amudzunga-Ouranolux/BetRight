# BetRight Frontend Build Plan — Kit-Based Theme System

**Product:** BetRight
**Prepared for:** Ouranolux
**Document type:** Frontend Build Plan & Action Sequence
**Date:** 12 June 2026
**Stack (per Tech Stack doc):** React Native + Expo Development Builds + TypeScript

---

## 1. The Core Idea: Kits, Not Themes

BetRight does not have "light mode and dark mode". It has **kits** — the same football language the user already speaks. The user picks their kit during onboarding and can change it any time in Theme Settings.

| Kit | Identity | Mode | Surfaces | Accent | Brand asset |
|---|---|---|---|---|---|
| **Home** | Carbon + Volt | Dark | Near-black carbon (#0A0F0A range), deep green-tinted cards | Volt lime (#C8F031 range), lime gradients, subtle lime glow | `brand/Full Logo.png`, `brand/Icon_Emblem.png` |
| **Away** | Teal Glass | Light | Soft mint/ice white, frosted teal glass cards | Deep teal (#0E6E66 range), mint chips, teal gradients | `brand/BetRight Away look logo's.png` |
| **Third** | Red Energy | Dark | Pure black, red-tinted carbon cards | Signal red (#E0202A range), red gradients, red glow | `brand/BetRight third look logo.png` |

Reference designs: `Docs/App CI/BetRight Home Feel.png`, `BetRight Away feel.png`, `BetRight Away Feel predictions.png`, `BetRight Third feel.png`.

The Theme Settings screen in the Away predictions mock is the model: a "Choose Your Theme" grid with live preview cards, plus a Customise section (accent colour, background style, font style) in later versions. MVP ships the three kits; customisation comes after.

### Non-negotiable rules

1. **No emoticons/emojis anywhere in the UI.** All iconography is Lucide (`lucide-react-native`) — consistent stroke weight, sports-tech feel.
2. **No hard-coded colours in components.** Every component consumes theme tokens through the ThemeProvider. A component that passes review must render correctly in all three kits without modification.
3. **Premium means restraint.** Glow, gradients, and blur are theme-token-driven (`cardStyle.borderGlowEnabled`, `gradientEnabled`, `blurEnabled`) so the Away kit can be flat-glass while Home/Third carry the glow.
4. **Logo variants are theme-driven.** `AppTheme.logoVariant` switches wordmark/emblem assets when the kit changes — the brand changes shirt with the UI.

---

## 2. Theme Architecture

Follows the `AppTheme` model from the Tech Stack doc (§7.20), with `themeId` values:

```ts
export const themes: Record<string, AppTheme> = {
  "home-kit":  { name: "Home — Carbon Volt",  mode: "dark",  accentStyle: "neon",    ... },
  "away-kit":  { name: "Away — Teal Glass",   mode: "light", accentStyle: "soft",    ... },
  "third-kit": { name: "Third — Red Energy",  mode: "dark",  accentStyle: "vibrant", ... },
};
```

### Layers

```text
core/theme/
  tokens.ts          — raw scales: spacing, radii, type scale, motion durations (kit-agnostic)
  palette.ts         — raw colour ramps per kit (volt, teal, red, carbon, mint ramps)
  themes.ts          — the three AppTheme objects assembled from palette + tokens
  ThemeProvider.tsx  — React context; resolves active kit, exposes useTheme()/useTokens()
  themeStore.ts      — Zustand store; persists themeId to MMKV; hydrates before first paint
  assets.ts          — logoVariant → require() map for wordmark/emblem/app-icon per kit
```

### How switching works

1. `themeStore` holds `themeId`, persisted in MMKV (instant, synchronous read at startup — no theme flash).
2. `ThemeProvider` wraps the app in `app/_layout.tsx`; switching kit triggers a single re-render with a 250ms cross-fade (Reanimated) so the change feels deliberate, not jarring.
3. NativeWind colour aliases (`bg-surface`, `text-accent`, `border-subtle`) are wired to CSS variables that the provider updates, so utility classes are theme-aware too.
4. StatusBar style, navigation bar tint, and splash background follow `theme.mode`.

### Token categories (each kit defines all of them)

```text
colors:      background, surface, surfaceAlt, primary, secondary,
             success, warning, danger, textPrimary, textSecondary, border
gradients:   accentGradient, cardGradient, ctaGradient
effects:     glowColor, glowEnabled, blurEnabled (Away uses blur-glass, Home/Third use glow)
typography:  displayFont, bodyFont, numberFont (tabular numerals for odds/probabilities)
cardStyle:   radius, border treatment
charts:      probability bar ramps, confidence ring colours, xG comparison colours
states:      skeleton base/highlight, pressed/disabled overlays
```

---

## 3. Project Scaffold

```text
Action: npx create-expo-app betright-mobile --template (Expo SDK latest, TypeScript)
```

Install per the Tech Stack doc §19:

- **Navigation:** `expo-router`
- **State:** `zustand`, `@tanstack/react-query`
- **Styling:** `nativewind`, `react-native-reanimated`, `react-native-gesture-handler`
- **Graphics/charts:** `@shopify/react-native-skia`, `react-native-svg`
- **Icons:** `lucide-react-native`
- **Storage:** `react-native-mmkv`, `expo-secure-store`
- **Data/forms:** `axios`, `zod`, `react-hook-form`
- **Media:** `expo-image`

Folder structure exactly as Tech Stack doc §6 (`src/app`, `src/core`, `src/features`, `src/components`, `src/models`).

**Data during FE phase:** no backend exists yet. Generate a static `fixtures.json` from `predict.py` output (it already emits the exact market shape: homeWin/draw/awayWin, over/under, BTTS, confidence, xG) and serve it through a mock API module behind TanStack Query. The query layer is real; only the transport is mocked, so the backend swap later is a one-file change.

---

## 4. Component Library (built theme-first)

Build order — primitives before composites, every component reviewed in all three kits via a dev-only Kit Gallery screen:

**Tier 1 — Primitives**
`BRText` (type scale + numberFont), `BRButton` (primary/secondary/ghost), `BRIconButton`, `BRCard` (glass vs carbon vs glow variants driven by kit), `FixtureStatusPill`, `ScorelineChip`, `SkeletonLoader`, `SegmentedTabs`, `SearchInput`, `EmptyState`, `ErrorState`

**Tier 2 — Domain components**
`TeamCrest`, `ConfidenceBadge` (ring + label, colour from confidence band), `ProbabilityBar` (three-segment 1X2 bar, animated fill), `XgComparison`, `MarketProbabilityCard` (Over/Under, BTTS), `MatchCard` (list row: crests, kickoff, league, mini probability strip), `PredictionCard` (hero card: big percentages, predicted result, confidence — the centrepiece of the Home feel mock), `ThemePreviewCard` (miniature live-rendered kit preview for Theme Settings)

**Tier 3 — Composites**
`BottomSheet`, bottom tab bar (custom, theme-aware, active glow per kit), `SmartAlertCard`, `SavedPredictionCard`, chart components on Skia (probability distribution, momentum)

---

## 5. Screen Build Sequence (MVP per Pages PRD §21)

**Phase A — Shell & Theme (the foundation everything sits on)**
1. Splash (kit-aware background + emblem)
2. Root layout, ThemeProvider, fonts, bottom tab shell (Home / Favourites / Matches / Predict / Profile)
3. **Theme Settings screen** — the three-kit chooser with `ThemePreviewCard`s. Built early because every later screen gets validated against it.
4. Dev-only Kit Gallery (all components × 3 kits)

**Phase B — Core value screens**
5. Home — greeting header, "Top AI Pick Today" hero `PredictionCard`, quick filters, favourites strip, trending picks (mirrors the Home Feel mock layout)
6. Matches / Upcoming — Live/Today/Tomorrow/Upcoming segmented tabs, league-grouped `MatchCard` lists, league filter chips
7. Match Detail — sticky header with crests + kickoff, tabs (Overview / Stats / Lineups / Insights), 1X2 probability display, likely scorelines, xG, market probabilities, AI insight summary block

**Phase C — Engagement screens**
8. Onboarding flow — choose sport → leagues → teams → prediction interests → **choose kit** → done
9. Favourites — favourite teams/leagues with next-fixture predictions
10. Manual Predict — team pickers + generate (calls mock prediction)
11. My Picks / Saved Predictions

**Phase D — Account**
12. Login / Register (UI only; auth wiring when backend lands)
13. Profile / Settings (account, odds format, notifications prefs UI, theme entry point)
14. Notifications centre (UI with mock data)

---

## 6. Action Plan — Concrete Order of Work

| # | Action | Output |
|---|---|---|
| 1 | Scaffold Expo app with TypeScript, folder structure, path aliases, lint/prettier (no-emoji lint rule in strings) | Running blank app |
| 2 | Extract exact hex values from the three CI mocks; build `palette.ts` + `tokens.ts` | Token files |
| 3 | Build `themes.ts` (3 kits), `ThemeProvider`, MMKV-persisted `themeStore`, NativeWind variable bridge | Kit switching works on a test screen |
| 4 | Slice brand assets (per-kit wordmark, emblem, app icon from `brand/`), wire `assets.ts` logoVariant map | Theme-driven logo |
| 5 | Load fonts (display + body + tabular-numeral number font) | Typography locked |
| 6 | Tier 1 primitives + Kit Gallery dev screen | Reviewable component base |
| 7 | Generate `fixtures.json` from `predict.py`; build mock API + TanStack Query hooks + Zod models (`Fixture`, `PredictionSummary`, `MatchPrediction` from Tech Stack doc §7) | Typed data layer |
| 8 | Tier 2 domain components | MatchCard, PredictionCard etc. live in gallery |
| 9 | Tab shell + custom theme-aware bottom nav + Splash | App skeleton navigable |
| 10 | Theme Settings screen with live previews | User-facing kit selection |
| 11 | Home screen | First full screen, validated ×3 kits |
| 12 | Matches list + Match Detail | Core loop complete |
| 13 | Onboarding flow (incl. kit picker step) | First-run experience |
| 14 | Favourites, Manual Predict, My Picks | Engagement complete |
| 15 | Auth screens, Profile/Settings, Notifications UI | MVP screen set complete |
| 16 | Polish pass: Reanimated micro-interactions (card press, probability bar fill, kit cross-fade, tab transitions), skeleton loaders everywhere, haptics on key actions | Premium feel |
| 17 | Jest + RNTL tests for theme resolution and core components; screenshot pass per kit | Quality gate |

### Definition of done (every screen)

- Renders pixel-faithful in **all three kits** (Home, Away, Third)
- Zero hard-coded colours; zero emojis; Lucide icons only
- Loading skeleton + empty state + error state present
- Numbers use tabular numerals; probabilities animate on mount
- Validated against the corresponding CI mock

---

## 7. What This Phase Does NOT Include

Per the Tech Stack doc: no on-device ML, no real backend calls (mock layer only), no payments/subscription logic (gating UI shells only), no push wiring (preference UI only), no real-money betting flows.
