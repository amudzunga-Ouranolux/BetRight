# BetRight Claude Operating Architecture

```text
Claude Code / Claude API
    ├── Skills = reusable project knowledge and workflows
    ├── Agents = specialist workers
    ├── Main orchestrator = plans, assigns, reviews
    └── CI/CD + repo rules = keeps everything controlled
```

## Skills

Skills hold reusable domain knowledge:
- product rules;
- design system rules;
- mobile coding rules;
- API contracts;
- ML prediction methodology;
- database rules;
- QA automation;
- performance/load;
- security/compliance;
- CI/CD rules.

## Agents

Agents are specialist workers:
- they have specific roles;
- they use specific tools;
- they can use specific models;
- they keep side work out of the main context.

## Main orchestrator

The orchestrator coordinates:
- planning;
- agent routing;
- dependency sequencing;
- review;
- testing;
- release gates.

## CI/CD

CI/CD keeps the system controlled:
- no merge without tests;
- no release without QA;
- no performance-sensitive change without load checks;
- no compliance-sensitive change without compliance review.
