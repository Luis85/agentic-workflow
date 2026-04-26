---
id: TESTREPORT-<AREA>-NNN
title: <Feature name> — Test report
stage: testing
feature: <feature-slug>
status: draft           # draft | complete
owner: qa
inputs:
  - TESTPLAN-<AREA>-NNN
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Test report — <Feature name>

## Summary

| Total | Passed | Failed | Skipped | Coverage |
|---|---|---|---|---|
| … | … | … | … | …% |

## Per-requirement results

| REQ ID | Tests | Passed | Failed | Status |
|---|---|---|---|---|
| REQ-<AREA>-001 | TEST-<AREA>-001, TEST-<AREA>-002 | 2 | 0 | ✅ |
| REQ-<AREA>-002 | TEST-<AREA>-003 | 0 | 1 | ❌ |

## Failures

For each failure:

### TEST-<AREA>-NNN — <short title>

- **Requirement:** REQ-<AREA>-NNN
- **Expected:** …
- **Actual:** …
- **Reproduction:** steps or link to CI run
- **Severity:** S1 | S2 | S3 | S4
- **Suspected root cause:** …
- **Owner:** …

## Non-functional results

| Check | Result | Threshold | Pass? |
|---|---|---|---|
| API p95 latency | 187 ms | ≤ 200 ms | ✅ |
| a11y | 2 minor | 0 critical | ✅ |
| SAST | 0 high | 0 high | ✅ |

## Coverage gaps

Areas where coverage is incomplete and why. Risk of each gap.

## Recommendation

- [ ] Ready for `/spec:review`
- [ ] Needs more work — list blockers

---

## Quality gate

- [ ] Every EARS clause has ≥ 1 test executed.
- [ ] Critical paths covered.
- [ ] Failures reproducible from the report.
- [ ] Coverage gaps disclosed (not hidden).
