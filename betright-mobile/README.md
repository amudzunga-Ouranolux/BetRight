# BetRight Mobile

AI sports‑prediction intelligence app (iOS + Android, React Native first). The
frontend is built around **three swappable "kits"** (visual identities) the user
chooses and can change anytime:

| Kit | Identity | Mode |
|---|---|---|
| **Home** | Carbon + Volt lime | Dark |
| **Away** | Ocean Mint (teal/cyan) | Light |
| **Third** | Red Energy | Dark |

Switching a kit re‑colours the whole app, swaps the logo and background, and even
changes layout where the brand designs genuinely differ (not just colour).

## Stack

- **React Native + Expo (SDK 56) + TypeScript**, Expo Router (file‑based nav)
- **Styling/theming:** `@shopify/restyle` + `react-native-reanimated`, Inter via `@expo-google-fonts/inter`
- **State/data:** `zustand` (UI/prefs, persisted to MMKV), `@tanstack/react-query` (server state), `zod` (validation), `axios`
- **Graphics:** `react-native-svg`, `@shopify/react-native-skia`, `expo-linear-gradient`, `expo-blur`
- **Icons:** `lucide-react-native` (no emojis anywhere)

## Run it

```bash
npm install
npm run start      # Expo dev client (then press i / a for iOS / Android)
npm run web        # browser (localhost:8081) — quickest way to review
```

Native screens use modules that require a **development build** (MMKV, Skia,
Reanimated 4) — not Expo Go. The web target is the fastest way to review the UI.

## Quality gates

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (incl. the no-fixed-size rule, see below)
npm run lint:emoji  # fails on any emoji in src
npm run check       # all of the above
```

## Project structure

```
src/
  app/                 # Expo Router routes (thin — delegate to features/)
    auth/  onboarding/  (tabs)/  match/[fixtureId]  settings/  top-picks
  core/
    api/               # mock transport, TanStack Query hooks, mock data
    theme/             # tokens, palette, kits (Restyle), ThemeProvider, responsive, variants
    prefs/  storage/  utils/
  components/
    primitives/        # BRText, BRButton, BRInput, BRCard, GlassCard, BRChip, BRBadge, BRIconButton
    cards/             # MatchCard, FixtureCard, ThemePreviewCard
    data-viz/          # ProbabilityBar, ConfidenceGauge, ConfidenceBadge
    inputs/            # SegmentedTabs, SelectableRow, Toggle, QuickFilterChip, Calendar, OptionTable
    layout/            # Screen, Divider
    nav/               # BottomTabBar, ScreenHeader, SectionHeader
    media/             # TeamCrest, KitBackground
    variants/          # per-kit divergent components (favourites-selector, auth-social)
  features/            # screen logic per area (home, matches, favourites, match-detail, predict, …)
  models/              # zod schemas + inferred types
  assets/              # per-kit logos/backgrounds, fonts, sport icons
```

## Design system

See **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** — the single source of truth for
type scale, spacing/radii tokens, the glass card / table / button patterns, and
the responsive rules. Home and Match Detail are the reference implementations.

Two enforced rules worth calling out:

- **No fixed pixel sizes.** All sizing flows through the responsive scalers
  (`useResponsive().s(n)`, `scale`, etc.) or theme tokens — enforced by an ESLint
  `no-restricted-syntax` rule.
- **No emojis.** Lucide icons only — enforced by `npm run lint:emoji`.

### Kits & variants

The three kits are Restyle theme objects (`core/theme/kits.ts`) sharing one shape,
swapped at runtime by `ThemeProvider` with a cross‑fade. Most screens are token‑
driven; the few that genuinely diverge per kit (e.g. the onboarding favourites
selector, auth social buttons) register per‑kit implementations resolved via
`useKitVariant()`.

## Data

The app runs on a **mock data layer** for the FE phase: `core/api/mock/*` produces
the same envelope shape the real .NET BFF will return, behind real TanStack Query
hooks + Zod validators. Swapping to the live backend is a one‑file transport change
(`core/api/client.ts`). All predictions, odds, news and stats are sample data.

## Out of scope (this phase)

On‑device ML, real backend calls, payments/subscription logic, push wiring, and
real‑money betting flows. Some destination screens referenced by the hubs (Team
Profile, League Profile, Saved Prediction Detail) are not built yet.
