# Ouranolux BetRight App Pages & Navigation PRD

_Converted from: `Ouranolux_BetRight_App_Pages_PRD(3).pdf`_

<!-- Page 2 -->

BetRight Mobile App

### App Pages, Navigation, Onboarding & UX Architecture PRD

Prepared for Ouranolux | Version 1.0 | 12 June 2026

### Product Positioning

BetRight should be positioned as an AI sports prediction intelligence platform, not merely a betting tips app. The core experience is personalised sports intelligence, deep prediction breakdowns, user-driven simulations, saved picks, and transparent model performance.

## 1. Executive Summary

This document defines the recommended page structure, navigation model, onboarding flow, mobile- first user experience, and future product modules for the BetRight AI sports prediction app.

The app should begin with user personalisation: favourite sports, leagues, competitions, teams, and prediction interests. From there, the experience should split into personalised favourites, general upcoming matches, manual prediction, saved picks, and profile/settings.

The recommended positioning is AI Sports Prediction Intelligence. This creates a stronger, more trustworthy product than a basic betting-tips app and keeps the platform scalable for prediction analytics, subscriptions, compliance controls, and later betting integrations where legally supported.

<!-- Page 3 -->

## 2. Product Principles

Principle Requirement

Personalised first The user should quickly see matches and predictions for the teams, leagues, and competitions they care about.

Mobile-first Components must be compact, modern, thumb-friendly, and suitable for quick match scanning.

Prediction credibility Every prediction should include probability, confidence, likely score, and clear AI reasoning.

Not just tips The product should explain the why behind predictions and show model accuracy over time.

Betting-style functionality must be region and age controlled. The app can operate as prediction analytics even without real- money betting.

Compliance-aware

Scalable sports design MVP can focus on football, but the architecture must support basketball, tennis, rugby, cricket, esports, and more.

## 3. Recommended Bottom Navigation

The MVP should use a five-item bottom navigation structure. This keeps the core app clear without burying the most important user journeys.

Tab Purpose Main Content

Home Main dashboard and daily intelligence hub

Top prediction, quick filters, trending AI picks, followed matches, relevant news.

Favourite team fixtures, league predictions, smart alerts, personalised analysis.

Favourites Personalised hub for selected teams, leagues, and competitions

Live, today, tomorrow, weekend, upcoming, filters and all-match prediction cards.

Matches General fixtures not limited to favourites

Choose teams, venue, home/away, scenarios, and generate prediction breakdowns.

Predict Manual team-vs-team prediction engine

Profile
User account and settings
Preferences, notifications, subscriptions,
saved teams, privacy, responsible use.

## 4. First-Time Onboarding Flow

Onboarding must be short, useful, and immediately improve the app experience. The aim is to make the first home screen feel personalised rather than generic.

Step Screen Required UX

User selects football first, with future support for basketball, tennis, rugby, cricket, esports, Formula 1, MMA, and

1 Choose Sports

<!-- Page 4 -->

boxing.

Allow quick selection of popular leagues
and tournaments such as EPL, La Liga,
UCL, World Cup, AFCON, PSL, Serie A,
Bundesliga, MLS.

2 Choose Leagues / Competitions

3
Choose Favourite Teams
Searchable team picker with popular
teams and region-based suggestions.

Ask whether the user cares about match
winner, exact score, over/under, BTTS,
player predictions, upsets, high-
confidence picks, or value picks.

4 Prediction Interests

Let the user choose alerts for favourite
team predictions, lineup confirmation,
prediction changes, match start, and
weekly recap.

5 Notification Preferences

### Onboarding rule

Ask only what improves the first experience. Anything else belongs in Profile or Settings. Users forgive a short setup. They do not forgive a form disguised as onboarding.

## 5. Authentication and Launch Pages

Page Purpose Key Elements

BetRight logo, slogan "Predict Smart. Bet Right.", dark premium background, subtle animation.

Splash / Launch Brand entry and loading state

Login
Returning user access
Email/password, Google, Apple, phone
login.

Name, email/phone, country, preferred sport, terms, privacy, age confirmation where required.

Register New user account creation

Forgot Password Account recovery Email/phone verification and reset flow.

## 6. Home Page

The Home page is the daily command centre. It should show the user what matters now: best predictions, followed matches, high-confidence picks, and match-relevant news.

- Header with greeting, profile avatar, search, notifications, and sport switcher.

- Top Prediction Card showing the best recommended match today.

- Quick filters: Today, Tomorrow, Weekend, Favourites, High Confidence, Over 2.5, BTTS, Upset Watch.

- Trending AI Picks: high confidence, value pick, risky favourite, likely draw, goal-heavy match.

- Followed Matches based on favourite teams and competitions.

<!-- Page 5 -->

- Prediction-relevant news feed focused on injuries, lineup updates, rotation, rest days, and

tactical context.

Home Section Displayed Data

Top Prediction Card Teams, competition, time, AI predicted result, confidence, likely score, key reason.

Trending AI Picks Pick type, match, confidence, odds/prediction indicator, risk label.

Followed Matches Upcoming favourite matches with quick prediction status.

News / Context Feed Only match-relevant news, not generic sports headlines.

## 7. Favourites Page

The Favourites page is the personalised prediction hub. It should feel like: everything I care about, already analysed.

Tab Purpose Content

Opponent, competition, date/time, AI prediction, confidence, predicted score, key risk, View Breakdown.

Favourite Teams Show upcoming games involving selected teams

Premier League today, PSL weekend fixtures, UCL upcoming, league-specific filters.

Favourite Leagues Show fixtures from selected leagues

World Cup, AFCON, Champions League, Euros, Copa America fixtures and predictions.

Favourite Competitions Tournament-focused hub

Prediction changed, high-confidence match found, lineup confirmed, goal- heavy weekend detected.

Smart Alerts Highlight personalised opportunities or risks

## 8. Matches / General Upcoming Page

This page shows all fixtures, not filtered by user favourites. It is the discovery and browsing area.

- Tabs: Live, Today, Tomorrow, Weekend, Upcoming.

- Filters: sport, league, country, competition, confidence level, prediction type, start time, favourites only, high

xG, likely goals, underdog alert.

- Compact match cards with teams, time, competition, AI probabilities, confidence, xG, likely score, and quick

market indicators.

- Live matches should show score, minute, status, and prediction shift indicators.

Match Card Field Example

Teams Real Madrid vs Manchester City

Competition / Time UCL | Today 21:00

AI Probabilities Madrid 42% | Draw 27% | City 31%

Likely Scores 2-1 / 1-1

<!-- Page 6 -->

Confidence Medium

Quick Indicator Over 2.5 likely | BTTS Yes | Upset Watch

## 9. Match Detail / Prediction Breakdown Page

This is the most important page in the app. It must be deep enough for serious users but simple enough for quick mobile reading.

Section Required Content

Match Header Team names, crests, competition, date/time, venue, home/away/neutral status, favourite toggle.

Main Prediction Home win %, draw %, away win %, predicted result, confidence, likely scorelines.

Expected Goals Home xG, away xG, total xG, xG bar comparison.

Scoreline Probabilities Top 5 likely scores with probability.

AI Reasoning Why this prediction, key advantages, risk factors, what could change the prediction.

Internal Tabs Overview, Stats, Form, H2H, Lineups, Players, Markets, News.

## 10. Match Detail Tabs

Tab Function

Overview Summary of prediction, confidence, likely score, and key AI explanation.

Stats Attack strength, defence strength, xG, shots, goals, clean sheets, BTTS and over/under history.

Form Last 5, last 10, home form, away form, streaks and momentum.

H2H Recent head-to-head, goal average, draw rate, rivalry or derby patterns.

Lineups Predicted lineup, confirmed lineup, missing players, replacement impact.

Players Key players, player form, top scorer probability, availability and player impact score.

Markets Prediction analytics for 1X2, over/under, BTTS, team goals, exact score, and player goal likelihood.

News Only match-relevant updates that could influence the prediction.

<!-- Page 7 -->

## 11. Manual Predict Page

The Predict page lets users choose any two teams and generate a fresh prediction. This is a powerful differentiator because it gives users control, not only pre-generated fixtures.

Area Requirement

Basic Input Sport, competition, Team A, Team B, home/away/neutral, date, optional venue.

Neutral venue, knockout match, derby/rivalry, home advantage level, injuries, recent form, history, player profiles, psychology/context.

Advanced Options

Prediction Output Result probabilities, xG, likely scores, confidence, AI breakdown, risk factors.

Scenario Simulator Compare full-strength teams, star player missing, neutral venue, rotation expected, derby pressure.

Premium feature opportunity

Scenario simulation is a strong Pro feature. Users can see how a prediction changes if a striker is unavailable, if the venue is neutral, or if lineups rotate.

## 12. AI Insights Page

AI Insights can be a dedicated page or a Home section. It should summarise the day from a prediction- intelligence perspective.

- Best predictions today.

- Highest confidence matches.

- Best underdog chances.

- Most likely draws.

- Goal-heavy matches.

- Low-scoring matches.

- BTTS candidates.

- Risky favourites.

- Prediction changes after team news.

## 13. Live Match Page

The Live Match page should eventually support in-play intelligence. For MVP, it can show live score and live probability updates. Later it can become a full momentum engine.

- Live score and match minute.

- Live win probability.

- Live xG and shot activity.

- Momentum graph.

- Cards, substitutions, and match incidents.

<!-- Page 8 -->

- Prediction changed indicator, e.g. before match home win 58%, after red card 41%.

## 14. My Picks / Saved Predictions Page

This page should first operate as a saved prediction tracker, not necessarily a real-money betting slip. If betting functionality is added later, this page can evolve into My Picks / Bet Slip.

Section Description

Saved Predictions Predictions the user saved for tracking.

Active Picks Upcoming or in-progress predictions.

Completed Picks Finished matches with result and model outcome.

Accuracy Summary Won/lost/pending, confidence performance, market performance.

Personal History User-specific tracked prediction performance.

## 15. Prediction History and Model Performance

Trust is built when the app shows its receipts. The model should reveal how well it performs by league, confidence level, and prediction type.

Page Metrics

Prediction History Previous predictions, actual results, correct/incorrect, scoreline accuracy, confidence accuracy.

Model Performance Accuracy by league, market, confidence bucket, model version, recent improvement, calibration score.

Example Output Last 50 predictions: Result accuracy 62%, Over 2.5 accuracy 67%, BTTS accuracy 59%, Exact score accuracy 11%.

## 16. Search, Notifications and Discovery

Page Purpose Content

Search
Global discovery
Teams, players, leagues, competitions,
matches, predictions, historical games.

Prediction ready, lineup confirmed, prediction changed, high-confidence match found, saved result completed.

Notifications All alerts in one place

Upcoming fixtures, form, home/away strength, attack/defence rating, xG trend, key players, injuries.

Team Profile Dedicated team intelligence profile

Form, minutes, xG/xA, injury status, importance score, pressure score, next- match influence.

Player Profile Player-level prediction intelligence

League / Competition Profile
Competition hub
Standings, fixtures, predictions, form
table, goal trends, top players, model

<!-- Page 9 -->

accuracy.

## 17. Profile and Settings

Profile should not be an afterthought. It is where users control the app experience and where compliance-sensitive settings should live.

Settings Area Items

Account Name, email, password, phone, country.

Preferences Default sport, default competition, favourite teams, preferred prediction types.

Notifications Push, email, match alerts, lineup alerts, prediction changes.

Appearance Dark mode, compact mode, odds format.

Odds Format Decimal, fractional, American.

Privacy Data permissions, export data, delete account.

Responsible Use Age/region controls, usage reminders, compliance notices.

## 18. Subscription / Pro Page

BetRight can monetise as an intelligence product without becoming a betting operator. Subscription should unlock analysis depth, not only more tips.

Tier Features

Free Limited daily predictions, favourite teams, basic match breakdown, basic upcoming fixtures.

Pro Unlimited predictions, advanced AI reasoning, player impact, lineup-based updates, confidence rankings, prediction history.

Elite / Analyst Scenario simulation, export reports, API access, team/player deep stats, advanced historical insights.

## 19. Help and Education Page

Users must understand probability. A 70% prediction still fails 30% of the time. Football is very good at reminding people of that.

- How predictions work.

- What confidence means.

- What expected goals means.

- Why predictions can change.

- Why no prediction is guaranteed.

<!-- Page 10 -->

- How to read AI insight.

- Responsible use and legal/compliance notices.

## 20. Internal Admin Pages

Admin Page Purpose

Admin Dashboard Fixture ingestion, prediction generation, model version, data quality, model performance.

Data Review Team mappings, player mappings, duplicate teams, missing fixtures, missing lineups, injury data gaps.

Model Control Retrain model, deploy model version, compare versions, view calibration, inspect failed predictions.

Performance Monitoring League accuracy, user activity, prediction error categories, model drift warnings.

## 21. Recommended MVP Pages

Do not build the entire ecosystem at once. The MVP should focus on proving the core user journey: personalisation, prediction discovery, deep match analysis, manual prediction, saved picks, and profile control.

## 1. Splash

## 2. Login / Register

## 3. Onboarding: Choose Sports

## 4. Onboarding: Choose Teams and Leagues

## 5. Home

## 6. Favourites

## 7. Matches / Upcoming

## 8. Match Detail

## 9. Manual Predict

## 10. My Picks / Saved Predictions

## 11. Notifications

## 12. Profile / Settings

## 22. Full Page Map

The page map below shows the complete target structure. MVP should build only the high-value subset first.

```
App
+-- Splash
+-- Auth
|   +-- Login
|   +-- Register
|   +-- Forgot Password
+-- Onboarding
|   +-- Choose Sports
|   +-- Choose Leagues
|   +-- Choose Teams
```

<!-- Page 11 -->

```
|   +-- Prediction Interests
|   +-- Notifications
+-- Main App
|   +-- Home
|   +-- Favourites
|   |   +-- Teams
|   |   +-- Leagues
|   |   +-- Competitions
|   +-- Matches
|   |   +-- Live
|   |   +-- Today
|   |   +-- Tomorrow
|   |   +-- Upcoming
|   +-- Predict
|   |   +-- Team vs Team
|   |   +-- Scenario Simulator
|   |   +-- Prediction Result
|   +-- Profile
|       +-- Account
|       +-- Favourites
|       +-- Notifications
|       +-- Prediction Preferences
|       +-- Subscription
|       +-- Settings
|       +-- Help
+-- Detail Pages
|   +-- Match Detail
|   +-- Team Profile
|   +-- Player Profile
|   +-- League Profile
|   +-- Prediction History
|   +-- Model Performance
|   +-- Notifications
+-- Internal Admin
+-- Admin Dashboard
+-- Data Review
+-- Model Control
+-- Performance Monitoring
```

## 23. Final Recommendation

The core user experience should be simple: choose what you care about, see personalised upcoming matches, open deep AI breakdowns, run your own predictions, save picks, and track how accurate the model is.

### Final Product Positioning

BetRight should become an AI Sports Prediction Intelligence app. This gives the product stronger trust, better compliance flexibility, more monetisation options, and a better long-term moat than a basic betting tips app.

## 24. Build Priority Summary

Priority Build Area Reason

P0
Onboarding + Favourites
Creates immediate personalisation and
retention.

P0 Matches + Match Detail Core prediction consumption journey.

P0
Manual Predict
Differentiating interactive prediction
engine.

P1 Saved Picks + History Builds trust and encourages repeat use.

P1 Profile + Settings Controls preferences, notifications and

<!-- Page 12 -->

responsible-use settings.

P2
AI Insights
Daily discovery and premium
intelligence layer.

P2
Team/Player Profiles
Supports deep analysis and future ML
features.

P3
Live/In-Play
Advanced future experience once data
pipeline is mature.

P3
Admin/Model Control
Required for operational scale and
model governance.

