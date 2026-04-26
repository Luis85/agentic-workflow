---
id: TESTPLAN-<AREA>-NNN
title: <Feature name> — Test plan
stage: testing
feature: <feature-slug>
status: draft         # draft | accepted | executing | complete
owner: qa
inputs:
  - PRD-<AREA>-NNN
  - SPECDOC-<AREA>-NNN
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Test plan — <Feature name>

## Scope

What this plan validates, and what it doesn't.

## Test types in scope

- [ ] Unit
- [ ] Integration
- [ ] End-to-end
- [ ] Contract
- [ ] Performance
- [ ] Security
- [ ] Accessibility
- [ ] Localisation
- [ ] Manual exploratory

## Entry criteria

- [ ] Spec accepted.
- [ ] Implementation complete for the scope under test.
- [ ] Test environment provisioned and seeded.

## Exit criteria

- [ ] Every EARS clause has ≥ 1 test referencing its REQ ID.
- [ ] Critical paths covered.
- [ ] Coverage threshold met.
- [ ] No critical defects open.
- [ ] Failures reproducible from the report.

## Test inventory

| Test ID | Requirement | Type | Description | Owner |
|---|---|---|---|---|
| TEST-<AREA>-001 | REQ-<AREA>-001 | unit | Happy path: … | qa |
| TEST-<AREA>-002 | REQ-<AREA>-001 | integration | Edge: … | qa |
| TEST-<AREA>-003 | REQ-<AREA>-002 | e2e | Full flow: … | qa |

## Non-functional checks

| Check | Tool | Threshold |
|---|---|---|
| API p95 latency | k6 / wrk | ≤ 200 ms |
| Bundle size | size-limit | ≤ X KB |
| a11y | axe-core | 0 critical |
| SAST | <tool> | 0 high |

## Test data

Where test data comes from, how it's seeded, how secrets are handled.

## Risks to test coverage

- (Areas where coverage will be partial and why.)

---

## Quality gate

- [ ] Every functional requirement has at least one planned test.
- [ ] Edge cases from spec have planned tests.
- [ ] Non-functional checks listed with tools and thresholds.
- [ ] Entry and exit criteria stated.
