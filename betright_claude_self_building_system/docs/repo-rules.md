# Repo Rules

## Protected branches

```text
main
release/*
```

## PR requirements

- Clear description.
- Linked story/task.
- Tests or test-risk explanation.
- Screenshots for UI changes.
- API contract update for response changes.
- QA report for user-flow changes.
- Performance note for high-volume endpoints.
- Compliance note for auth/privacy/notifications/prediction wording.

## Merge blockers

- CI failure.
- Typecheck failure.
- No review.
- Broken QA flow.
- Security/compliance blocker.
- Direct gambling/wagering implementation.
