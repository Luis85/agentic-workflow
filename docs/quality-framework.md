# Quality Framework

## Six dimensions

| Dimension | Question | Where it bites first |
|---|---|---|
| **Correctness** | Does the artifact match its inputs? | Implementation, Spec |
| **Completeness** | Are all required sections present? | Requirements, Design |
| **Consistency** | Do artifacts agree with each other? | Spec ↔ Tasks ↔ Tests |
| **Testability** | Can each requirement be verified? | Requirements (EARS), Test plan |
| **Maintainability** | Can a stranger pick this up cold? | Implementation, Design |
| **Traceability** | Does every output link to its inputs? | All stages |

## Validation philosophy

1. **Validate early.** A defect found at Requirements is 100× cheaper than the same defect found at Review.
2. **Validate continuously.** Don't batch validation to the end of a stage.
3. **Prefer explicit checks over assumptions.** "Should be fine" is never a quality argument.
4. **Two layers per gate:**
   - **Deterministic checks first** — schema validation, linters, tests, ID uniqueness, cross-ref resolution. Fast, free, reliable.
   - **Critic-agent review second** — judgment calls: "Is this requirement actually testable?", "Does this design honour the constitution?". Returns pass/fail + rationale.

## Per-stage Definition of Done

### Idea
- [ ] Problem statement is one paragraph and understandable to a non-expert.
- [ ] Target users named.
- [ ] Desired outcome stated.
- [ ] Constraints listed.
- [ ] Open questions captured (these become research items).
- [ ] Scope is bounded — no "boil the ocean" framing.

### Research
- [ ] Each research question from the idea is addressed.
- [ ] Sources cited (URLs or internal docs).
- [ ] ≥ 2 alternative approaches considered.
- [ ] User needs validated (data, interviews, or stated assumptions if neither).
- [ ] Technical considerations noted.
- [ ] Risks listed with severity (low/med/high).

### Requirements (PRD)
- [ ] Goals and non-goals explicit.
- [ ] Personas / stakeholders named.
- [ ] Jobs to be done captured.
- [ ] **All functional requirements use EARS notation** (`docs/ears-notation.md`).
- [ ] Each requirement has a stable ID (`REQ-<AREA>-NNN`).
- [ ] Non-functional requirements (NFRs) listed: performance, security, accessibility, etc.
- [ ] Acceptance criteria are testable.
- [ ] Success metrics defined.
- [ ] `/spec:clarify` returned no open questions.

### Design
- [ ] **UX:** primary flows mapped; information architecture clear.
- [ ] **UI:** key screens / states identified; design system referenced.
- [ ] **Architecture:** components and responsibilities listed; data flow shown; integration points named.
- [ ] Alternatives considered and rejected with rationale.
- [ ] Irreversible architectural decisions have ADRs.
- [ ] Risks have mitigations.
- [ ] Cross-stage check: every requirement is addressed somewhere in the design.

### Specification
- [ ] Interfaces defined (schemas, signatures, API contracts).
- [ ] Data structures defined.
- [ ] Commands / behaviours enumerated.
- [ ] State transitions modelled (where relevant).
- [ ] Validation rules explicit.
- [ ] Edge cases listed.
- [ ] Test scenarios derivable from the spec alone.
- [ ] Each spec item has an ID and traces to ≥ 1 requirement.

### Tasks
- [ ] Each task ≤ ~½ day.
- [ ] Each task has a stable ID (`T-<AREA>-NNN`).
- [ ] Each task references ≥ 1 requirement ID.
- [ ] Dependencies between tasks explicit.
- [ ] Each task has a Definition of Done.
- [ ] **TDD ordering:** test tasks precede implementation tasks for the same requirement.
- [ ] Owner assigned (agent or human).

### Implementation
- [ ] Implementation matches the spec (no silent deviations).
- [ ] Any deviations documented in `implementation-log.md` with rationale.
- [ ] Lint clean.
- [ ] Type checks pass.
- [ ] Unit tests pass for changed surface.
- [ ] No unrelated changes ("scope creep") in the same task.
- [ ] Commit messages reference task IDs.

### Testing
- [ ] Every EARS clause has ≥ 1 test (`TEST-<AREA>-NNN`).
- [ ] Critical paths covered (happy + key edge cases).
- [ ] Coverage threshold met (project-defined).
- [ ] Failures reproducible from the report.
- [ ] Gaps acknowledged (not hidden).
- [ ] Non-functional checks run where relevant (perf, security, a11y).

### Review
- [ ] Requirements satisfied (verified against RTM).
- [ ] Design honoured (no off-design implementation).
- [ ] No critical findings open.
- [ ] Risk assessment current.
- [ ] Traceability matrix complete and consistent.
- [ ] Constitution check passes.

### Release
- [ ] Summary of changes written.
- [ ] User-visible impact stated.
- [ ] Known limitations disclosed.
- [ ] Verification steps documented.
- [ ] Rollback plan documented.
- [ ] Observability (logs, metrics, alerts) in place.
- [ ] Communication plan (if user-facing) ready.

### Retrospective
- [ ] What worked / what didn't / what to change — each with an owner.
- [ ] Spec-adherence assessed (did we drift?).
- [ ] Lessons fed back as proposed amendments to templates, agents, or the constitution.

## When to skip a stage

Trivial work (typo fix, dependency bump, copy change) may skip stages. Document the skip in `workflow-state.md`:

```yaml
artifacts:
  idea.md: skipped (trivial: typo fix)
  research.md: skipped
  ...
```

A retrospective is **never** skipped, even for trivial work — though for trivial work it may be a single sentence.

## Failure modes to watch for

- **Spec drift** — implementation diverges from spec without updating it. Catch in Review.
- **Test theatre** — tests exist but don't actually exercise the EARS clauses. Catch via RTM.
- **Decision evaporation** — choices made in implementation without ADRs. Catch in Review.
- **Premature abstraction** — speculative generality added during implementation. Catch in Review.
- **Quality-gate erosion** — gates softened to "unblock" delivery. Surface in Retrospective; fix the gate or fix the upstream stage.
