---
name: cicd-repo-rules-skill
description: BetRight repo rules, branch strategy, CI/CD gates, release process, code review, and documentation rules.
---

# CI/CD and Repo Rules Skill

## Branches

```text
main
develop
feature/*
release/*
hotfix/*
```

## Required gates

```text
lint
typecheck
unit tests
API contract tests
E2E smoke
security scan
performance smoke for key endpoints
release notes
```

Read `branch-rules.md`.
