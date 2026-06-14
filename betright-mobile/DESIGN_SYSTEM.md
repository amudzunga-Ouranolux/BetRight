# BetRight Design System & Standards

The **Home screen (`src/features/home/HomeScreen.tsx`) is the reference implementation.**
Every new screen must reuse these tokens and components so the app stays consistent.
Nothing renders raw pixels — all sizing flows through the responsive scaler and tokens
(enforced by the `no-restricted-syntax` ESLint rule).

## 1. Foundations

### Responsive scaling (`src/core/theme/responsive.ts`)
- `useResponsive().s(n)` — scale a guideline px value to the live viewport (clamped 0.85–1.12).
- `r.ms(n)` partial scale, `r.wp(%)` / `r.hp(%)` viewport percentages.
- Static `scale` / `moderateScale` / `fontScale` are used only inside `tokens.ts`.
- **Never** write a raw number for `width/height/fontSize/lineHeight/borderRadius` in a style.

### Spacing tokens (`tokens.ts` → `spacing`)
`none, xxs(2), xs(4), sm(8), md(12), lg(16), xl(24), xxl(32), xxxl(48)` — all responsive.
Section padding = `lg`. Card padding = `sm`. Tight stacks = `xs`/`xxs`.

### Radii (`tokens.ts` → `radii`)
`xs(4)` checkboxes · `sm(8)` chips/buttons/inputs · `md(12)` cards (standard) · `pill` toggles/badges.
Cards are **md** — not heavily rounded.

### Colour (per kit, via `useTheme().colors`)
`background, surface, surfaceAlt, surfaceElevated, primary, onPrimary, success, warning,
danger, textPrimary, textSecondary, border`. Accent = `primary` (green on Home/Third, teal on Away).
Never hard-code hex; for translucency append an alpha hex to a token (e.g. `primary + '1A'`).

## 2. Typography

Font: **Inter** (loaded in `app/_layout.tsx`). Select weight by family via `useTheme().fonts`:
`regular, medium, semibold, bold, extrabold`. Do not rely on `fontWeight` with custom fonts.

Use the `variant` on `BRText` as the standard scale; the user Text-Size setting scales these:

| variant | role | ~size |
|---|---|---|
| `display` | onboarding titles | 19 |
| `h1` / `h2` | screen titles | 17 / 15 |
| `title` | card / section emphasis | 13 |
| `body` | standard reading | 11 |
| `bodySmall` | **app-standard compact text** (team names, card values) | 9.5 |
| `caption` | secondary / meta | 8.5 |
| `label` | tiny labels (sentence case, never ALL CAPS) | 8 |
| `numberMd` / `numberLg` | odds / percentages (tabular) | 13 / 16 |

Home-screen roles map to these: section header ≈ `bodySmall` semibold; card label ≈ `label`;
card value/team name ≈ `bodySmall`; big percentage ≈ `numberLg`-ish; odds ≈ `numberMd`.
Keep **line-heights tight** on small custom text (set `lineHeight ≈ fontSize × 1.25`) — a loose
line-height is what makes small text look spaced-out.

## 3. Core components (reuse these — do not re-build)

- **`Screen`** (`components/layout/Screen`) — every screen's root. Paints the kit background
  image behind a `scrim` (default 0.6 so the kit shows through), safe-area insets, status bar.
- **`GlassCard`** (`components/primitives/GlassCard`) — the standard card: translucent
  (see-through, default ~70%), `md` radius, 1px border. Props: `accent` (green border),
  `glow` (soft accent glow, e.g. Trending), `opacityHex` (more/less see-through).
- **`BRCard`** — opaque-leaning card aligned to the same radius/translucency for legibility-heavy
  surfaces; prefer `GlassCard` for the premium look.
- **`SectionHeader`** (`components/nav/SectionHeader`) — `Title` + optional white "See all".
- **`BRText`, `BRButton`, `BRInput`, `BRChip`, `BRBadge`, `BRIconButton`** — primitives.
- **`OptionTable`** (`components/inputs/OptionTable`) — bordered row-table of selectable rows
  (checkbox or `toggle`), icon + title + description. Used by onboarding interests/notifications.
- **`QuickFilterChip`** — square icon-over-label filter chip.
- **`SegmentedTabs`, `SelectableRow`, `Toggle`** — inputs.
- **`BottomTabBar`** — active tab icon sits in a rounded accent pill.
- Data-viz: **`ProbabilityBar`, `ConfidenceGauge`** (180° speedometer), `ConfidenceRing`,
  `XgComparison`, `ConfidenceBadge`.

## 4. Patterns

### Tables (Followed Matches / News / OptionTable)
- One bordered `GlassCard` container with `overflow="hidden"` wrapping all rows.
- Rows separated by an **inset** divider (`height:1`, `marginHorizontal: md`) — the divider
  must not touch the left/right border. If a row has a leading icon, inset the divider past it.
- Vertical dividers between cells use `marginVertical`/`alignSelf:stretch` so they don't touch
  top/bottom.

### Buttons
- Primary form CTA height = `r.s(44)`, radius `sm`, `bold` label.
- Inline/compact CTA (e.g. View Prediction) height ≈ `r.s(28)`, small label.
- Bottom actions are pinned (last flex child), not scrolled.

### Cards
- Glass, `md` radius, `sm` padding, 1px border; `accent`/`glow` for hero/trending.
- Tight internal spacing (`xs`/`xxs`); labels sit close to their values.

### Lists / screens
- Wrap scrollable content in `ScrollView` (so long pages scroll); keep sections compact with
  `SectionHeader`. Headers sit close to their content (`marginBottom xxs`).

## 5. Hard rules
- No emojis (Lucide icons only) — enforced by `npm run lint:emoji`.
- No raw pixel sizes — enforced by ESLint `no-restricted-syntax`.
- No ALL-CAPS labels.
- Sentence case copy; responsible-use wording (never "guaranteed").
