# Self-Building and Self-Testing Loop

The system should work like this:

```text
User/product request
    ↓
Main orchestrator plans
    ↓
Specialist agents build
    ↓
Tests run
    ↓
QA platform runner clicks through localhost
    ↓
Performance/load agent checks scalability
    ↓
Security/compliance review
    ↓
Release manager approves or blocks
```

## Self-building

Claude can:
- create components;
- create APIs;
- create migrations;
- create tests;
- write docs;
- update CI.

But Claude must not merge/release without gates.

## Self-testing

Claude must:
- run existing tests;
- add tests for new logic;
- run QA click-through for UI;
- inspect logs;
- produce reports.

## Human approval points

Human approval is required for:
- production release;
- destructive database changes;
- security policy changes;
- payment/subscription changes;
- compliance-sensitive features;
- large architecture changes.
