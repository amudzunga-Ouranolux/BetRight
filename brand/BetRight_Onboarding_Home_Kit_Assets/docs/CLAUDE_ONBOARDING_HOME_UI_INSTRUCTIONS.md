# Claude UI Implementation Instructions — BetRight Lime Premium Onboarding Flow

## Source of truth

Use the file:

```text
assets/reference/choose_favourites_home_reference.png
```

as the visual source of truth.

Do **not** redesign this screen. Do **not** make it generic. Copy the layout, spacing, dark stadium mood, logo placement, step indicator, buttons, cards and premium neon-lime feel as closely as possible.

The provided ZIP includes:
- sports selection icons;
- UI icons;
- prediction interest icons;
- notification icons;
- a high-quality lime stadium onboarding background;
- token JSON;
- the reference screenshot;
- this implementation guide.

---

## Screen identity

This is the **Home / Lime Premium onboarding kit**.

Code name:

```ts
kitId = "lime-premium"
```

Do not call it `"home"` in code because Home is also an app page.

---

## Overall look

The screen must feel:

```text
premium
dark
sports-first
stadium-lit
compact
sharp
neon-lime
mobile-native
```

Avoid:
- flat black only;
- grey corporate cards;
- white backgrounds;
- generic forms;
- oversized components;
- random spacing;
- changing the layout away from the reference.

---

## App artboard

Design against this base size:

```text
logical width: 430
logical height: 932
asset scale: 3x
background image size: 1290 x 2796
```

The layout must also work on 390px wide iPhones by using responsive widths, but the reference proportions should be based on 430 x 932.

---

## Background photo and black page area

Use:

```text
assets/backgrounds/onboarding_home_lime_stadium_background_1290x2796.png
```

or the smaller preview:

```text
assets/backgrounds/onboarding_home_lime_stadium_background_430x932.png
```

### How the background fits

Place it as an absolute full-screen background:

```tsx
<ImageBackground
  source={require("../assets/backgrounds/onboarding_home_lime_stadium_background_1290x2796.png")}
  resizeMode="cover"
  style={StyleSheet.absoluteFill}
/>
```

### Where the black is on the page

The page is not just a photo. The photo sits behind a black/dark overlay.

Layer order:

```text
1. Root background colour: #020604
2. Stadium background image, full screen, cover, top-centre aligned
3. Full-screen black overlay: rgba(0,0,0,0.48)
4. Vertical black gradient:
   top: rgba(0,0,0,0.18)
   25%: rgba(0,0,0,0.42)
   55%: rgba(1,4,3,0.78)
   100%: rgba(1,4,3,0.96)
5. Screen content
```

The stadium lights must be visible behind the logo and upper title area. From roughly the middle of the screen downward, the page should feel mostly black with only a faint green stadium glow.

Do **not** place bright photo details behind form/list text.

---

## Safe area and root screen

Use a full-screen root:

```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: "#020604" }}>
```

Main content wrapper:

```text
paddingHorizontal: 24
paddingTop: safeAreaTop + 10
paddingBottom: safeAreaBottom + 18
```

Do not add a yellow border around the full screen in the real app. The yellow outer edge in the reference is the device/mockup frame, not part of the app UI.

---

## Logo placement

The BetRight logo sits centered at the top on every onboarding screen.

Reference position:

```text
top: 54px from screen top
centered horizontally
width: 140–150px
height: 42–48px
```

Implementation:

```tsx
<Image
  source={require("../assets/logo/betright_lime_logo.png")}
  resizeMode="contain"
  style={{
    width: 148,
    height: 46,
    alignSelf: "center",
    marginTop: 10
  }}
/>
```

The ZIP includes:

```text
assets/logo/betright_lime_logo_reference_crop.png
```

This is a visual reference crop only. In production, use the proper exported transparent logo asset/SVG from the brand folder.

Do not recreate the BetRight logo using text.

---

## Back arrow

For steps 2–4, show a back arrow at the top-left.

Position:

```text
left: 24
top: around 68
icon size: 24
colour: #FFFFFF
opacity: 0.95
```

Use:

```text
assets/icons/ui/back-arrow.svg
```

On step 1, do not show the back arrow.

---

## Step setup indicator

The step indicator appears below the logo.

Position:

```text
top: about 134
centered
height: 28
```

Visual structure:

```text
thin horizontal line left
rounded step pill in middle
thin horizontal line right
```

Pill:

```text
height: 28
min width: 68
border radius: 999
background: rgba(10, 18, 13, 0.86)
border: 1px solid rgba(214, 255, 25, 0.28)
text: "1 OF 4", "2 OF 4", etc.
font size: 12
font weight: 800
text colour: #D6FF19
```

Lines:

```text
height: 1
width: 88–96 each side
background: linear gradient / rgba(214,255,25,0.35)
```

Do not use standard progress dots. The reference uses a premium pill indicator.

---

## Page title and subtitle

Title block position:

```text
top: about 178
left/right padding: 24
centered text
```

Title:

```text
font: Saira Condensed or Rajdhani
size: 28
line-height: 32
weight: 800
colour: #FFFFFF
```

Subtitle:

```text
font: Inter
size: 15
line-height: 21
weight: 500
colour: #DDE8D6
opacity: 0.90
max width: 320
centered
```

Text per step:

```text
Step 1 title: Choose Sports
Step 1 subtitle: Select the sports you love. We'll personalize your experience.

Step 2 title: Choose Favourites
Step 2 subtitle: Pick your leagues, competitions and teams to get started.

Step 3 title: Choose Prediction Interests
Step 3 subtitle: Tell us what predictions interest you most.

Step 4 title: Notification Preferences
Step 4 subtitle: Choose what you'd like to be notified about. You can change this anytime.
```

---

# Step 1: Choose Sports screen

## Sports grid

Position:

```text
top: about 263
left/right: 24
columns: 2
gap: 12
```

For a 430 width screen:

```text
content width = 430 - 48 = 382
card width = (382 - 12) / 2 = 185
card height = 132
```

For 390 width:

```text
content width = 342
card width = 165
card height = 132
```

Card style:

```text
background: rgba(11, 20, 15, 0.78)
border: 1px solid rgba(255,255,255,0.13)
selected border: 2px solid #D6FF19
border radius: 18
padding: 16
```

Selected card glow:

```text
shadow colour: #D6FF19
shadow opacity: 0.22
shadow radius: 18
elevation: 4
```

Icon:

```text
size: 58–64
centered horizontally
top area
```

Label:

```text
font: Inter
size: 16
weight: 800
colour selected: #D6FF19
colour unselected: #FFFFFF
```

Selected tick:

```text
top right: 12
size: 26
background: #D6FF19
icon colour: #071007
border radius: 999
```

Use sports icons:

```text
assets/icons/sports/png/football.png
assets/icons/sports/png/basketball.png
assets/icons/sports/png/tennis.png
assets/icons/sports/png/rugby.png
assets/icons/sports/png/cricket.png
assets/icons/sports/png/esports.png
```

or SVG versions from:

```text
assets/icons/sports/svg/
```

## Help note card

Position below sports grid:

```text
marginTop: 28
height: 64
left/right: 24
```

Style:

```text
background: rgba(11, 20, 15, 0.78)
border: 1px solid rgba(214,255,25,0.16)
border radius: 16
paddingHorizontal: 16
```

Icon:

```text
shield icon 32x32
colour: #D6FF19
```

Text:

```text
"You can update your choices anytime in settings."
font size: 13
line height: 18
colour: #DDE8D6
```

---

# Step 2: Choose Favourites screen

## Search input

Position:

```text
below subtitle, top around 256
height: 46
left/right: 24
```

Style:

```text
background: rgba(11, 20, 15, 0.72)
border: 1px solid rgba(255,255,255,0.18)
border radius: 14
paddingHorizontal: 14
```

Search icon:

```text
assets/icons/ui/search.svg
size: 18
colour: #A3AD9C
```

Placeholder:

```text
"Search leagues, competitions or teams"
font size: 13
colour: #A3AD9C
```

## Sections

Use section labels:

```text
LEAGUES
COMPETITIONS
TEAMS
```

Position:

```text
marginTop after search: 18
label left aligned
"Select all" right aligned
```

Section label style:

```text
font size: 12
font weight: 800
letter spacing: 0.2
colour: #FFFFFF
opacity: 0.90
```

Select all style:

```text
font size: 12
font weight: 800
colour: #D6FF19
```

## List rows

Row height:

```text
40–44
```

Row style:

```text
background: rgba(11, 20, 15, 0.55)
border bottom: rgba(255,255,255,0.08)
```

Icon size:

```text
22–26
```

Text:

```text
font size: 14
font weight: 600
colour: #FFFFFF
```

Checkbox:

```text
size: 24
checked fill: #D6FF19
unchecked border: rgba(255,255,255,0.30)
border radius: 6
```

Use official team/league logos only if the app has licensed assets. For now, use provider images or placeholder crests. Do not redraw real club logos manually.

---

# Step 3: Prediction Interests screen

## List position

```text
top: about 256
left/right: 24
```

Rows:

```text
height: 54–58
gap: 8
border radius: 14
background: rgba(11,20,15,0.72)
border: 1px solid rgba(255,255,255,0.11)
```

Left icon:

```text
container size: 32
icon size: 22
colour: #D6FF19
```

Title:

```text
font size: 14
weight: 800
colour: #FFFFFF
```

Description:

```text
font size: 12
weight: 500
colour: #A3AD9C
```

Checkbox right:

```text
size: 24
```

Use icons:

```text
assets/icons/prediction/match-winner.svg
assets/icons/prediction/exact-score.svg
assets/icons/prediction/over-under-goals.svg
assets/icons/prediction/btts.svg
assets/icons/prediction/player-predictions.svg
assets/icons/prediction/upset-alerts.svg
assets/icons/prediction/high-confidence.svg
assets/icons/prediction/team-form.svg
assets/icons/prediction/goal-heavy-matches.svg
```

---

# Step 4: Notification Preferences screen

## List position

```text
top: about 260
left/right: 24
```

Rows:

```text
height: 56–60
gap: 8
border radius: 14
background: rgba(11,20,15,0.72)
border: 1px solid rgba(214,255,25,0.16)
```

Left icon:

```text
size: 24
colour: #D6FF19
```

Text:

```text
title size: 14
title weight: 800
description size: 12
description colour: #A3AD9C
```

Toggle:

```text
width: 48
height: 28
radius: 999
active background: #D6FF19
inactive background: rgba(255,255,255,0.30)
knob size: 22
active knob: #FFFFFF
```

Use icons:

```text
assets/icons/notifications/favourite-team-alerts.svg
assets/icons/notifications/match-starting-soon.svg
assets/icons/notifications/lineup-confirmed.svg
assets/icons/notifications/prediction-changed.svg
assets/icons/notifications/live-momentum-shift.svg
assets/icons/notifications/result-recap.svg
assets/icons/notifications/weekly-summary.svg
```

Bottom info card:

```text
height: 64
border: 1px solid rgba(214,255,25,0.20)
icon: bell
headline: "Stay informed. Stay ahead."
subtext: "We'll only send you what matters."
```

---

# Bottom buttons

All steps have bottom action buttons pinned near bottom.

Position:

```text
left/right: 24
bottom: safeAreaBottom + 20 to 34
height: 52
gap: 16
```

Button rules:

Primary button:

```text
height: 52
border radius: 14
background: #D6FF19
text colour: #071007
font size: 15
font weight: 800
right arrow icon: 20
```

Secondary/back/skip button:

```text
height: 52
border radius: 14
background: rgba(11,20,15,0.72)
border: 1px solid rgba(255,255,255,0.16)
text colour: #FFFFFF
font size: 15
font weight: 700
```

Step 1:

```text
left button: Skip
right button: Next
```

Steps 2–3:

```text
left button: Back
right button: Next
```

Step 4:

```text
left button: Back
right button: Continue
```

Button widths:

```text
Use flex row.
Left button flex: 1
Right button flex: 1.1
Minimum width: 148
```

---

# Icons included in this ZIP

## Sports

```text
football
basketball
tennis
rugby
cricket
esports
```

Available as:

```text
assets/icons/sports/png/*.png
assets/icons/sports/svg/*.svg
```

## UI

```text
search
back-arrow
arrow-right
check
check-square
checkbox-empty
star
bell
shield
calendar
clock
users
refresh
bar-chart
mail
trophy
target
lightning
soccer-ball-line
gamepad-line
```

Available in:

```text
assets/icons/ui/*.svg
```

## Prediction interests

Available in:

```text
assets/icons/prediction/*.svg
```

## Notifications

Available in:

```text
assets/icons/notifications/*.svg
```

---

# Implementation rules

Use Restyle theme tokens.

Do not do this:

```tsx
style={{ backgroundColor: "#111", borderColor: "#d6ff19" }}
```

Do this:

```tsx
<BRCard variant="onboardingSelectableCard" selected={selected}>
```

Then the component consumes:

```ts
theme.colors.surface
theme.colors.primary
theme.colors.border
```

---

# Required component structure

Create these components:

```text
OnboardingShell
OnboardingLogo
OnboardingStepIndicator
OnboardingTitleBlock
SportsSelectionGrid
SportSelectionCard
FavouritesSelector
SearchInput
SelectionRow
PredictionInterestRow
NotificationPreferenceRow
OnboardingBottomActions
```

Each component must accept:

```text
testID
loading state where relevant
selected state where relevant
disabled state where relevant
```

---

# QA checklist

Claude must run visual and functional QA against this exact reference.

Check:
- Logo is centered and correctly sized.
- Step indicator is below logo and matches pill style.
- Background stadium is visible in upper half only.
- Lower half stays dark/black for readability.
- Sports grid has 2 columns.
- Cards match dark premium style.
- Selected sports card has lime border and tick.
- Search input and list rows match reference.
- Bottom buttons are pinned, same height, correct lime/black styling.
- Text is not too large.
- Components are compact.
- No flat grey generic UI.
- No white background on this Home/Lime kit.
- No full screen yellow app border in real app implementation.

---

# Final instruction

Follow the uploaded image exactly. The goal is not a new interpretation. The goal is to implement the Home / Lime Premium onboarding flow as close as possible to the reference, using reusable React Native components and the assets in this ZIP.
