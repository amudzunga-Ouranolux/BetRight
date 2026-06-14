# Migration Rules

- One migration per logical change.
- Include rollback where supported.
- Add indexes in separate migrations for high-risk tables.
- Never edit applied migrations.
- Test migrations against seeded data.
- Document expected row counts and performance risk.
