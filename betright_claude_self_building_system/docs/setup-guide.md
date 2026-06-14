# Setup Guide

1. Copy this package into the BetRight repository.
2. Start Claude Code in the repo.
3. Ask Claude to read `CLAUDE.md`.
4. Ask for Sprint 0 setup.
5. Let the orchestrator create tasks for each agent.

## First prompt

```text
Read CLAUDE.md and the .claude/skills folder. Create a Sprint 0 plan to initialise the BetRight React Native app, .NET BFF, Python prediction service, PostgreSQL schema, QA automation, and CI/CD.
```

## QA prompt

```text
Use qa-platform-runner to run localhost and click through the core flows. Produce the QA report.
```
