---
id: TESTPLAN-IST-001
title: Specorator improvement commands — Test plan
stage: testing
feature: improve-specorator-tooling
status: complete
owner: qa
inputs:
  - PRD-IST-001
created: 2026-04-28
updated: 2026-04-28
---

# Test plan — Specorator improvement commands

### TEST-IST-001 — Command inventory check

- **Requirement:** REQ-IST-001, REQ-IST-002, REQ-IST-003, REQ-IST-004, REQ-IST-005
- **Method:** Run `npm run fix:commands` and `npm run check:commands`.

### TEST-IST-002 — Repository verification

- **Requirement:** NFR-IST-001
- **Method:** Run `npm run verify`.
