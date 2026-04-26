# Quality Steering

> **Replace this whole file** with your project's testing reality.

## Test pyramid

- **Unit:** target coverage for changed code: ≥ X%. Run on every commit.
- **Integration:** key adapters and module boundaries. Run on every PR.
- **End-to-end:** critical user journeys. Run on PR + nightly.
- **Contract:** for service boundaries (consumer-driven if applicable).
- **Non-functional:** perf, a11y, security — scheduled and gated on releases.

## Test framework(s)

- Unit: …
- Integration: …
- E2E: …
- Snapshot policy: …
- Test data fixtures: location and ownership …

## Definition of "tested"

A requirement is **tested** when:

1. There is at least one automated test referencing the requirement ID in its name or metadata.
2. The test exercises the EARS clause's trigger and verifies the response.
3. Edge cases listed in the spec each have a corresponding test.

A test that doesn't fail when the implementation is broken is not a test. Mutation-testing or deliberate-break checks are encouraged on critical paths.

## Code review checklist

- [ ] Spec-matched: behaviour matches the spec; deviations logged.
- [ ] Tests reference requirement IDs.
- [ ] No commented-out code, no dead code.
- [ ] Errors handled at boundaries, not papered over with try/catch swallow.
- [ ] No new dependency without justification.
- [ ] Security: input validated at boundaries, no secrets in code, no SSRF/SQLi/XSS surface.
- [ ] Observability: logs at the right level, metrics for new SLIs.
- [ ] Docs updated (README, runbooks, this kit if process changed).

## Bug triage

- **Severity 1** (data loss, security, full outage): drop everything.
- **Severity 2** (broken critical flow): fix this sprint.
- **Severity 3** (broken non-critical, has workaround): backlog with priority.
- **Severity 4** (cosmetic, polish): backlog.

Every bug fix should produce or update a test that would have caught the bug.

## Performance gates

- Bundle size budget: …
- p95 latency budget: …
- Memory: …
- Regressions auto-flagged in CI when budgets exceeded.

## Things agents commonly get wrong here

- (List as you discover them.)
