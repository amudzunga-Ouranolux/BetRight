# BetRight Mobile App Tech Stack — React Native Capability-First Recommendation

**Product:** BetRight  
**Prepared for:** Ouranolux  
**Document type:** Mobile App Tech Stack & Data Models Recommendation  
**Status:** Revised recommendation — not Flutter  
**Date:** 12 June 2026  

---

## 1. Executive Summary

The mobile app should **not use Flutter** if the priority is maximum ecosystem flexibility, premium UI packages, easier access to native mobile capabilities, better web-style UI development, advanced animations, and a wider pool of developers familiar with React/TypeScript.

The recommended mobile stack is:

```text
React Native + Expo Development Builds + TypeScript
```

This does **not** mean using basic Expo Go only. BetRight should use **Expo Dev Client / Development Builds**, which allow the project to use native modules, custom native code, push notifications, app links, custom splash screens, device APIs, advanced animation libraries, and production-grade builds.

The best technical direction is:

```text
Mobile App:
React Native + Expo Dev Builds + TypeScript

UI/UX:
React Native Reanimated + Gesture Handler + Skia + NativeWind + Tamagui/Restyle

State:
Zustand or Redux Toolkit Query

API:
TanStack Query + Axios

Forms:
React Hook Form + Zod

Navigation:
Expo Router / React Navigation

Charts:
Victory Native XL / React Native Skia / Gifted Charts

Local Storage:
MMKV + SQLite/WatermelonDB

Push:
Firebase Cloud Messaging / Expo Notifications with production builds

Auth:
Firebase Auth, Auth0, or custom JWT/OAuth

Backend:
.NET 8 Backend-for-Frontend

ML Prediction:
Python FastAPI ML service

Database:
PostgreSQL + Redis + S3

Realtime:
WebSocket / Server-Sent Events

Analytics:
Firebase Analytics / PostHog / Amplitude

Crash / Monitoring:
Sentry + Firebase Crashlytics
```

The mobile app must remain a **sports prediction intelligence app**. The prediction and ML models should run on the backend, not inside the app, except for lightweight offline cache, UI personalisation, and simple local ranking.

---

## 2. Best Framework Choice

## 2.1 Absolute Maximum Capability

If money, team size, and delivery speed are not constraints, the most capable mobile approach is:

```text
Native iOS: Swift + SwiftUI
Native Android: Kotlin + Jetpack Compose
```

This gives the deepest possible platform access, best native performance, and full control. But it means building and maintaining two separate apps.

## 2.2 Best Practical Choice for BetRight

For BetRight, the best practical stack is:

```text
React Native + Expo Dev Builds + TypeScript
```

This gives:

```text
one codebase
strong native access
fast UI development
huge package ecosystem
excellent animations
custom native modules when needed
good developer availability
easier design iteration
strong web-style component thinking
good integration with Firebase and modern APIs
```

## 2.3 Final Decision

| Option | Capability | Speed | UI Flexibility | Native Access | Recommended? |
|---|---:|---:|---:|---:|---|
| Swift + Kotlin Native | 10/10 | 5/10 | 10/10 | 10/10 | Best if you have two native teams |
| React Native + Expo Dev Builds | 9/10 | 9/10 | 9/10 | 9/10 | Best for BetRight |
| Flutter | 8/10 | 8/10 | 8/10 | 7/10 | Not recommended based on your preference |
| Ionic / Capacitor | 6/10 | 8/10 | 7/10 | 6/10 | Too web-app-like for premium sports UI |
| .NET MAUI | 6/10 | 6/10 | 6/10 | 6/10 | Not ideal for this UI-heavy product |

---

## 3. Recommended Mobile Stack

| Layer | Technology | Why |
|---|---|---|
| App framework | React Native | Native mobile apps using React and native UI primitives. |
| App platform | Expo Development Builds | Gives Expo tooling without the limits of Expo Go. |
| Language | TypeScript | Strong typing for APIs, prediction models, user preferences, and app state. |
| Routing | Expo Router or React Navigation | Handles tabs, stacks, deep links, auth guards, modals, and nested match pages. |
| State management | Zustand | Simple and fast for app state, theme state, and user preferences. |
| Server state | TanStack Query | Best for API fetching, caching, retries, pagination, refresh, and stale data. |
| API client | Axios | Interceptors for tokens, request IDs, retries, and logging. |
| Validation | Zod | Validates API responses and forms. |
| Forms | React Hook Form | Good for onboarding, login, profile, manual predict, and settings forms. |
| Styling | NativeWind or Tamagui | Fast design-system-driven UI development. |
| Animation | React Native Reanimated | Smooth native-thread animation for premium mobile interactions. |
| Gestures | React Native Gesture Handler | Swipes, sheets, cards, drag interactions, tabs, and match-detail gestures. |
| Graphics | React Native Skia | High-performance custom charts, probability visuals, radar charts, and advanced UI. |
| Charts | Victory Native XL / Skia / Gifted Charts | xG charts, probability bars, performance graphs, radar charts. |
| Icons | Lucide React Native / Phosphor Icons | Clean sports-tech icon system. |
| Local storage | MMKV | Very fast key-value storage for themes, preferences, tokens metadata, cache flags. |
| Local database | SQLite / WatermelonDB | Structured offline cache for fixtures, teams, predictions, and saved picks. |
| Secure storage | Expo SecureStore / Keychain | Tokens and sensitive local session data. |
| Push notifications | FCM / Expo Notifications | Match alerts, lineup alerts, prediction changes, saved result updates. |
| Analytics | Firebase Analytics / PostHog / Amplitude | Product usage, funnels, retention, feature analytics. |
| Crash reporting | Sentry + Crashlytics | Error monitoring and production issue diagnosis. |
| Feature flags | LaunchDarkly / Firebase Remote Config / custom backend config | Roll out features, themes, experiments, and region-based controls. |

---

## 4. Why React Native Is Better for This App

BetRight needs a modern premium UI, rapid theming, data-heavy cards, live updates, charts, animations, notifications, deep links, authentication, subscriptions, and possible native SDK access.

React Native gives the app:

```text
better access to the JavaScript/TypeScript ecosystem
more UI libraries and animation libraries
easier integration with web-style design systems
faster iteration for custom screens
easier hiring for React/TypeScript developers
custom native modules when required
excellent bridge into native SDKs
```

The key is to use React Native properly:

```text
Do not use plain Expo Go as the production path.
Use Expo Development Builds.
Use native modules when needed.
Use TypeScript everywhere.
Use strong API models and validation.
Keep ML prediction on the backend.
```

---

## 5. BetRight Mobile App Architecture

```text
BetRight Mobile App
    |
    | React Native + Expo Dev Build
    |
    +-- UI Layer
    |     +-- Screens
    |     +-- Components
    |     +-- Theme system
    |     +-- Animations
    |     +-- Charts
    |
    +-- App State Layer
    |     +-- Auth state
    |     +-- Theme state
    |     +-- User preferences
    |     +-- Local app settings
    |
    +-- Server State Layer
    |     +-- TanStack Query
    |     +-- API cache
    |     +-- Pagination
    |     +-- Background refresh
    |
    +-- Data Layer
    |     +-- Axios API client
    |     +-- Zod validators
    |     +-- MMKV local cache
    |     +-- SQLite structured cache
    |
    +-- Native Layer
    |     +-- Push notifications
    |     +-- App links
    |     +-- Biometrics if needed
    |     +-- Secure storage
    |     +-- Native modules
    |
    v
Backend-for-Frontend API
    |
    +-- User service
    +-- Match service
    +-- Prediction service
    +-- Favourites service
    +-- Notification service
    +-- Subscription service
    +-- Model performance service
```

---

## 6. Frontend Folder Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    auth/
    onboarding/
    tabs/
      home/
      favourites/
      matches/
      predict/
      profile/
    match/
      [fixtureId].tsx
    player/
      [playerId].tsx
    team/
      [teamId].tsx

  core/
    api/
      apiClient.ts
      endpoints.ts
      queryKeys.ts
    auth/
      authStore.ts
      tokenManager.ts
    config/
      env.ts
      featureFlags.ts
    storage/
      mmkv.ts
      sqlite.ts
      secureStore.ts
    theme/
      tokens.ts
      themes.ts
      ThemeProvider.tsx
    utils/
    validation/

  features/
    onboarding/
    home/
    favourites/
    matches/
    match-detail/
    predict/
    saved-predictions/
    notifications/
    profile/
    settings/
    subscription/
    model-performance/

  components/
    cards/
    buttons/
    charts/
    tabs/
    sheets/
    forms/
    loaders/
    icons/

  models/
    user.model.ts
    team.model.ts
    player.model.ts
    fixture.model.ts
    prediction.model.ts
    theme.model.ts
    notification.model.ts
    subscription.model.ts
```

---

## 7. Required Mobile Data Models

The app must have strong TypeScript models. This is not optional. BetRight will become messy if predictions are passed around as loose JSON.

---

## 7.1 User Model

```ts
export type UserRole = "free" | "pro" | "elite" | "admin";

export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  countryCode: string;
  role: UserRole;
  preferredSport: SportCode;
  preferredThemeId: string;
  oddsFormat: OddsFormat;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 7.2 User Preferences Model

```ts
export type OddsFormat = "decimal" | "fractional" | "american";

export interface UserPreferences {
  userId: string;
  favouriteSportCodes: SportCode[];
  favouriteTeamIds: string[];
  favouriteCompetitionIds: string[];
  predictionInterests: PredictionInterest[];
  notificationPreferences: NotificationPreferences;
  themeId: string;
  compactMode: boolean;
  oddsFormat: OddsFormat;
}
```

---

## 7.3 Sport Model

```ts
export type SportCode =
  | "football"
  | "basketball"
  | "tennis"
  | "rugby"
  | "cricket"
  | "esports"
  | "formula1"
  | "mma";

export interface Sport {
  code: SportCode;
  name: string;
  iconUrl?: string;
  isEnabled: boolean;
  sortOrder: number;
}
```

---

## 7.4 Competition Model

```ts
export interface Competition {
  competitionId: string;
  sportCode: SportCode;
  name: string;
  countryCode?: string;
  region?: string;
  type: "league" | "cup" | "tournament" | "international";
  logoUrl?: string;
  isFavourite?: boolean;
  season?: string;
}
```

---

## 7.5 Team Model

```ts
export interface Team {
  teamId: string;
  sportCode: SportCode;
  name: string;
  shortName?: string;
  countryCode?: string;
  competitionIds: string[];
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isFavourite?: boolean;

  ratings?: TeamRatings;
}

export interface TeamRatings {
  overall: number;
  attack: number;
  defence: number;
  homeAttack: number;
  homeDefence: number;
  awayAttack: number;
  awayDefence: number;
  recentForm: number;
  confidence: number;
}
```

---

## 7.6 Player Model

```ts
export interface Player {
  playerId: string;
  teamId: string;
  name: string;
  position: PlayerPosition;
  age?: number;
  nationality?: string;
  imageUrl?: string;
  status: PlayerStatus;
  importanceScore?: number;
  formScore?: number;
  fitnessScore?: number;
  pressureScore?: number;
}

export type PlayerPosition =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "forward"
  | "unknown";

export type PlayerStatus =
  | "available"
  | "injured"
  | "suspended"
  | "doubtful"
  | "unknown";
```

---

## 7.7 Fixture Model

```ts
export interface Fixture {
  fixtureId: string;
  sportCode: SportCode;
  competitionId: string;
  competitionName: string;
  season?: string;

  homeTeam: TeamSummary;
  awayTeam: TeamSummary;

  kickoffTime: string;
  status: FixtureStatus;
  venue?: Venue;
  neutralVenue: boolean;

  liveState?: LiveMatchState;
  predictionSummary?: PredictionSummary;
}

export type FixtureStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled";

export interface TeamSummary {
  teamId: string;
  name: string;
  logoUrl?: string;
}
```

---

## 7.8 Live Match State Model

```ts
export interface LiveMatchState {
  minute?: number;
  period?: "first_half" | "halftime" | "second_half" | "extra_time" | "penalties";
  homeScore: number;
  awayScore: number;
  homeRedCards?: number;
  awayRedCards?: number;
  lastUpdatedAt: string;
}
```

---

## 7.9 Prediction Summary Model

```ts
export interface PredictionSummary {
  predictionId: string;
  fixtureId: string;
  modelVersion: string;

  predictedResult: MatchOutcome;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  likelyScore: string;

  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;

  quickFlags: PredictionFlag[];
  generatedAt: string;
}
```

---

## 7.10 Full Prediction Model

```ts
export interface MatchPrediction {
  predictionId: string;
  fixtureId: string;
  modelVersion: string;
  generatedAt: string;

  outcome: OutcomeProbabilities;
  expectedGoals: ExpectedGoals;
  scorelines: ScorelineProbability[];
  markets: PredictionMarkets;

  confidence: PredictionConfidence;
  dataQuality: DataQualityScore;
  explanation: PredictionExplanation;
  riskFactors: RiskFactor[];

  inputSnapshotId: string;
}
```

---

## 7.11 Outcome Probabilities

```ts
export type MatchOutcome = "home_win" | "draw" | "away_win";

export interface OutcomeProbabilities {
  homeWin: number;
  draw: number;
  awayWin: number;
  predictedOutcome: MatchOutcome;
}
```

---

## 7.12 Expected Goals Model

```ts
export interface ExpectedGoals {
  homeXg: number;
  awayXg: number;
  totalXg: number;
  homeTeamName: string;
  awayTeamName: string;
}
```

---

## 7.13 Scoreline Probability Model

```ts
export interface ScorelineProbability {
  score: string;
  homeGoals: number;
  awayGoals: number;
  probability: number;
  rank: number;
}
```

---

## 7.14 Prediction Markets Model

```ts
export interface PredictionMarkets {
  over15: number;
  over25: number;
  over35: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  homeCleanSheet?: number;
  awayCleanSheet?: number;
  homeTeamOver15?: number;
  awayTeamOver15?: number;
}
```

---

## 7.15 Confidence Model

```ts
export type ConfidenceLabel =
  | "low"
  | "medium_low"
  | "medium"
  | "high"
  | "very_high";

export interface PredictionConfidence {
  score: number;
  label: ConfidenceLabel;
  probabilitySeparationScore: number;
  modelAgreementScore: number;
  dataQualityScore: number;
  lineupCertaintyScore: number;
  teamStabilityScore: number;
  historicalAccuracyScore: number;
}
```

---

## 7.16 Data Quality Model

```ts
export interface DataQualityScore {
  score: number;
  label: "poor" | "fair" | "good" | "excellent";
  missingFields: string[];
  warnings: DataQualityWarning[];
}

export interface DataQualityWarning {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
}
```

---

## 7.17 Prediction Explanation Model

```ts
export interface PredictionExplanation {
  headline: string;
  summary: string;
  keyReasons: ExplanationReason[];
  riskNotes: ExplanationReason[];
  whatCouldChange: ExplanationReason[];
}

export interface ExplanationReason {
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  strength: number;
  category:
    | "form"
    | "home_away"
    | "opposition_strength"
    | "lineup"
    | "player"
    | "history"
    | "tactical"
    | "psychology"
    | "data_quality";
}
```

---

## 7.18 Saved Prediction Model

```ts
export interface SavedPrediction {
  savedPredictionId: string;
  userId: string;
  predictionId: string;
  fixtureId: string;
  savedAt: string;
  note?: string;
  status: "active" | "completed" | "cancelled";
  result?: SavedPredictionResult;
}

export interface SavedPredictionResult {
  actualOutcome: MatchOutcome;
  actualScore: string;
  predictedOutcomeCorrect: boolean;
  scorelineCorrect: boolean;
  marketResults: Record<string, boolean>;
  completedAt: string;
}
```

---

## 7.19 Notification Model

```ts
export type NotificationType =
  | "prediction_ready"
  | "lineup_confirmed"
  | "prediction_changed"
  | "match_starting"
  | "saved_prediction_result"
  | "weekly_recap"
  | "high_confidence_found";

export interface AppNotification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink?: string;
  fixtureId?: string;
  predictionId?: string;
  read: boolean;
  createdAt: string;
}
```

---

## 7.20 Theme Model

```ts
export interface AppTheme {
  themeId: string;
  name: string;
  mode: "dark" | "light";
  accentStyle: "soft" | "vibrant" | "neon";

  colors: ThemeColors;
  typography: ThemeTypography;
  cardStyle: ThemeCardStyle;
  logoVariant: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  numberFont: string;
}

export interface ThemeCardStyle {
  radius: number;
  blurEnabled: boolean;
  gradientEnabled: boolean;
  borderGlowEnabled: boolean;
}
```

---

## 7.21 Subscription Model

```ts
export type SubscriptionTier = "free" | "pro" | "elite";

export interface SubscriptionStatus {
  userId: string;
  tier: SubscriptionTier;
  active: boolean;
  platform?: "ios" | "android" | "web";
  renewsAt?: string;
  entitlements: Entitlement[];
}

export type Entitlement =
  | "unlimited_predictions"
  | "advanced_reasoning"
  | "player_impact"
  | "lineup_updates"
  | "scenario_simulator"
  | "model_performance"
  | "export_reports";
```

---

## 8. Theme System Requirements

BetRight must support user-selectable themes.

Required MVP themes:

```text
1. Lime Premium
2. Ocean Mint / Teal Glass
3. Red Energy
4. Carbon Black
```

Theme switching must affect:

```text
app background
cards
buttons
tabs
bottom navigation
prediction charts
confidence indicators
logos
icons
loading skeletons
status badges
```

Implementation:

```ts
export const themes: Record<string, AppTheme> = {
  "lime-premium": { ... },
  "ocean-mint": { ... },
  "red-energy": { ... },
  "carbon-black": { ... }
};
```

The app must not hard-code colors inside components. Components should consume theme tokens.

Bad:

```tsx
<View style={{ backgroundColor: "#ff0000" }} />
```

Good:

```tsx
<Card variant="prediction" />
```

---

## 9. Required Screen Stack

```text
Auth
- Splash
- Login
- Register
- Forgot Password

Onboarding
- Choose Sport
- Choose Leagues
- Choose Teams
- Prediction Interests
- Notification Preferences
- Choose Theme

Main Tabs
- Home
- Favourites
- Matches
- Predict
- Profile

Detail Pages
- Match Detail
- Team Profile
- Player Profile
- League Profile
- Prediction History
- Model Performance
- Notification Centre
- Saved Prediction Detail

Settings
- Account
- Favourites
- Notifications
- Prediction Preferences
- Theme Settings
- Odds Format
- Privacy
- Responsible Use
- Subscription
- Help
```

---

## 10. Required UI Component Library

Build a BetRight component library.

```text
BRButton
BRIconButton
BRCard
PredictionCard
MatchCard
TeamCrest
PlayerAvatar
ConfidenceBadge
ProbabilityBar
XgComparison
ScorelineChip
MarketProbabilityCard
FixtureStatusPill
ThemePreviewCard
SmartAlertCard
SavedPredictionCard
RadarChart
MomentumChart
BottomSheet
SegmentedTabs
SearchInput
SkeletonLoader
ErrorState
EmptyState
```

---

## 11. Mobile API Stack

The app should call a mobile Backend-for-Frontend, not the ML service directly.

```text
React Native App
    ↓
.NET 8 Mobile BFF API
    ↓
Core Services
    ↓
Python Prediction / ML Service
```

Main endpoints:

```http
GET    /v1/mobile/home
GET    /v1/mobile/favourites
GET    /v1/matches
GET    /v1/matches/{fixtureId}/detail
GET    /v1/teams/{teamId}
GET    /v1/players/{playerId}
POST   /v1/predictions/manual
POST   /v1/predictions/scenario
GET    /v1/users/me/profile
PUT    /v1/users/me/preferences
GET    /v1/users/me/saved-predictions
POST   /v1/users/me/saved-predictions
DELETE /v1/users/me/saved-predictions/{id}
GET    /v1/notifications
PUT    /v1/notifications/preferences
GET    /v1/subscriptions/status
```

---

## 12. Backend Stack

```text
Backend-for-Frontend:
.NET 8 ASP.NET Core

Prediction Service:
Python FastAPI

Database:
PostgreSQL

Cache:
Redis

Storage:
AWS S3

Realtime:
WebSockets / Server-Sent Events

Jobs:
Hangfire / Quartz.NET / AWS EventBridge

Search:
PostgreSQL full-text search for MVP
OpenSearch later

Model Registry:
MLflow

Analytics Warehouse:
BigQuery / Redshift / Snowflake later
```

---

## 13. Prediction and ML Service Stack

The mobile app must request predictions. It must not calculate serious predictions locally.

Recommended ML stack:

```text
Python
FastAPI
Pydantic
pandas
NumPy
scikit-learn
LightGBM
XGBoost
CatBoost
MLflow
SHAP
PostgreSQL
Redis
S3
```

Models:

```text
Poisson / Dixon-Coles scoreline model
Elo/team rating model
LightGBM/XGBoost 1X2 model
Goal expectation model
BTTS model
Over/Under model
Player impact model
Lineup model
Confidence model
Calibration model
Ensemble model
```

The app receives:

```text
probabilities
likely scores
xG
confidence
risk factors
explanation
data quality
model version
```

---

## 14. Mobile-Side ML / On-Device Intelligence

The app should not run the main prediction model locally.

Optional on-device intelligence:

```text
personalised sorting
recent screen recommendations
offline favourite match ranking
theme recommendation
notification preference suggestions
```

Optional libraries:

```text
TensorFlow Lite
ONNX Runtime React Native
ML Kit
```

Use on-device models only when:

```text
the model is small
privacy matters
offline behaviour is needed
latency must be instant
prediction accuracy is not dependent on fresh sports data
```

Do not put the main football prediction model on-device because it depends on:

```text
latest fixtures
lineups
injuries
team ratings
player profiles
model versions
post-match learning
data quality
calibration
```

---

## 15. Realtime Strategy

MVP:

```text
REST API
refresh on app open
pull-to-refresh
short polling for match detail
push notifications for important changes
```

V2:

```text
Server-Sent Events for match detail
WebSockets for live matches
```

Realtime events:

```ts
export type RealtimeEvent =
  | PredictionChangedEvent
  | LineupConfirmedEvent
  | MatchStatusChangedEvent
  | LiveScoreChangedEvent;

export interface PredictionChangedEvent {
  type: "prediction_changed";
  fixtureId: string;
  oldPredictionId: string;
  newPredictionId: string;
  reason: string;
  changedAt: string;
}
```

---

## 16. Analytics Events

```text
app_opened
onboarding_started
onboarding_completed
sport_selected
league_selected
team_favourited
home_loaded
match_card_opened
match_detail_tab_opened
prediction_generated
scenario_simulated
prediction_saved
notification_opened
theme_changed
subscription_started
model_performance_viewed
```

These events help answer:

```text
Do users understand the predictions?
Which screens drive retention?
Which teams/leagues matter most?
Which prediction types are most used?
Which themes convert best?
Where do users drop off?
```

---

## 17. Testing Stack

```text
Unit tests:
Jest

Component tests:
React Native Testing Library

E2E:
Detox or Maestro

API contract tests:
MSW + OpenAPI validation

Visual regression:
Storybook + screenshot testing

Device testing:
Firebase Test Lab

Beta distribution:
EAS Submit / TestFlight / Google Play Internal Testing
```

Critical test flows:

```text
login
onboarding
choose theme
add favourite team
load home
open match detail
generate manual prediction
save prediction
receive notification
change settings
subscription gating
offline cache
```

---

## 18. CI/CD Stack

```text
GitHub Actions or Azure DevOps
EAS Build
EAS Submit
EAS Update
Sentry release upload
Automated versioning
Environment-specific builds
```

Environments:

```text
development
qa
staging
production
```

Build profiles:

```text
development
preview
internal
production
```

---

## 19. Recommended Package List

Core:

```text
react-native
expo
expo-router
typescript
```

State and data:

```text
zustand
@tanstack/react-query
axios
zod
react-hook-form
```

UI:

```text
nativewind
tamagui or @shopify/restyle
react-native-reanimated
react-native-gesture-handler
@shopify/react-native-skia
react-native-svg
lucide-react-native
```

Storage:

```text
react-native-mmkv
expo-sqlite
expo-secure-store
```

Media and images:

```text
expo-image
react-native-fast-image if bare native path is selected
```

Notifications:

```text
expo-notifications
@react-native-firebase/messaging if using Firebase-native setup
```

Auth:

```text
expo-auth-session
firebase/auth or Auth0
expo-apple-authentication
expo-crypto
```

Monitoring:

```text
sentry-expo / @sentry/react-native
firebase crashlytics if Firebase native setup
```

Payments:

```text
react-native-purchases RevenueCat
or native Apple/Google billing through backend validation
```

---

## 20. What To Avoid

```text
Do not use Flutter for this version.
Do not build a PWA and pretend it is a premium mobile app.
Do not use plain Expo Go for production architecture.
Do not put ML prediction logic inside the mobile app.
Do not hard-code themes.
Do not call the prediction service directly from mobile.
Do not make one API call per widget on the Home page.
Do not ship without response validation.
Do not skip offline cache for favourites and recent predictions.
Do not show confidence as certainty.
Do not use real-money betting flows in MVP.
```

---

## 21. Final Recommended Stack

```text
Mobile:
React Native + Expo Development Builds + TypeScript

Navigation:
Expo Router / React Navigation

State:
Zustand + TanStack Query

UI:
NativeWind + Tamagui/Restyle + Reanimated + Gesture Handler + Skia

Validation:
Zod + React Hook Form

Local:
MMKV + SQLite + SecureStore

Backend:
.NET 8 Backend-for-Frontend

Prediction:
Python FastAPI + LightGBM/XGBoost + MLflow

Database:
PostgreSQL

Cache:
Redis

Storage:
AWS S3

Realtime:
SSE first, WebSockets later

Notifications:
FCM / Expo Notifications

Analytics:
Firebase Analytics + PostHog or Amplitude

Monitoring:
Sentry + Crashlytics

CI/CD:
GitHub Actions or Azure DevOps + EAS Build + EAS Submit
```

---

## 22. Final Recommendation

Use **React Native with Expo Development Builds**, not Flutter.

This gives BetRight the best balance of:

```text
premium UI capability
advanced animation
large ecosystem
native access
fast development
TypeScript models
theme flexibility
push notifications
deep links
subscriptions
charts
custom graphics
backend-driven prediction
future live match intelligence
```

If you want the absolute maximum possible platform control and have the budget for two native teams, use SwiftUI for iOS and Jetpack Compose for Android. But for BetRight’s product scope, delivery speed, theme system, API-heavy prediction experience, and premium UI requirements, **React Native + Expo Dev Builds is the better stack**.
