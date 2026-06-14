# QA Localhost Playbook

## Goal

The QA agent must interact with the built product and prove the flows work.

## Standard command

```text
Use the qa-platform-runner agent to run localhost, click all core flows, capture screenshots and errors, and write a QA report.
```

## What QA checks

```text
- app loads
- login/register routes work
- onboarding works
- home loads
- favourites loads
- matches loads
- match detail loads
- manual predict validates/generates
- AI insights loads
- live match loads
- saved predictions loads
- prediction history loads
- profile/settings loads
- theme switching works
- no console errors
- no failed unexpected network calls
```

## Output

```text
reports/qa/QA_REPORT_<date>.md
reports/qa/screenshots/
reports/qa/videos/
```
