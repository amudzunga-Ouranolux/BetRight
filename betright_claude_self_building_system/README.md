# BetRight Claude Self-Building & Self-Testing System

This package gives the BetRight engineering team a Claude Code / Claude API operating structure:

```text
Claude Code / Claude API
    ├── Skills = reusable project knowledge and workflows
    ├── Agents = specialist workers
    ├── Main orchestrator = plans, assigns, reviews
    └── CI/CD + repo rules = keeps everything controlled
```

## Important product boundary

This setup frames BetRight as an **AI sports prediction analytics and intelligence platform**.

It must not build or assist with:
- real-money betting;
- gambling provider integrations;
- wagering;
- bet placement;
- betting account funding;
- gambling odds scraping;
- claims such as "guaranteed win" or "risk-free".

Allowed product language:
- AI prediction;
- confidence;
- saved prediction;
- analytics;
- match intelligence;
- model performance;
- responsible use.

This boundary is included in the `security-compliance-skill` and must be enforced by every agent.

## Recommended Claude model allocation

No Fable is used.

| Work type | Model |
|---|---|
| Main orchestration and final architectural review | Opus |
| Solution architecture, ML architecture, security and performance | Opus |
| Daily coding, UI, APIs, database migrations, normal tests | Sonnet |
| Logs, summaries, simple docs, changelogs, triage | Haiku |

## How to use

1. Copy the `.claude/` folder and `CLAUDE.md` into the root of the BetRight repo.
2. Open Claude Code in the repo.
3. Start with:

```text
Read CLAUDE.md and create the Sprint 0 implementation plan.
```

4. For local QA once the app exists:

```text
Use the qa-platform-runner agent to run localhost, click through the main flows, capture console/network errors, and write a QA report.
```

5. For release readiness:

```text
Use the release-manager agent to run the release gate and summarize what is safe or blocked.
```

## Package contents

```text
.claude/
  agents/
  skills/
  commands/
.github/
  workflows/
docs/
scripts/
examples/
CLAUDE.md
README.md
```
