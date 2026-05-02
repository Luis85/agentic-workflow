# PR-B — Golden-path proof

> Implementer brief for the v0.6 golden-path slice. Branch: `feat/v06-golden-path`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-003 | Define golden-path demo contract | analyst | M |
| T-V06-004 | Execute and record golden-path evidence | qa | L |

T-V06-004 depends on T-V06-003.

## Goal

Replace the current desk-only tutorial caveat with a verified golden-path demo. Cover demo subject, expected artifacts, evidence note format, validation scope, and success criteria. Then run or deterministically validate the demo and record date/commit/commands/caveats.

## Spec references

- [idea.md](./idea.md)
- [research.md](./research.md)
- [requirements.md](./requirements.md) — REQ-V06-002
- [design.md](./design.md) — *Golden-path model*
- [spec.md](./spec.md) — SPEC-V06-002
- [tasks.md](./tasks.md) — T-V06-003, T-V06-004

## Requirements satisfied

- REQ-V06-002 — Provide live golden-path demo (must)
- NFR-V06-005 — Public claims backed by repository evidence
- SPEC-V06-002 — Golden-path proof package

## Test scenario

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-002 | First-time user follows golden-path docs | Docs point to verified artifacts + evidence from live or deterministic run |

## CLAR resolution required (BLOCKING)

**CLAR-V06-003** — Confirm whether the golden-path demo is fully automated in CI or documented as a maintainer-run release evidence check first. Resolve in [#91](https://github.com/Luis85/agentic-workflow/issues/91) before T-V06-003 starts. The chosen path drives the contract.

## Layers (from design.md)

| Layer | Behavior |
|---|---|
| Tutorial | Human walkthrough updated after live execution |
| Example artifacts | Complete `examples/<slug>/` with accepted outputs |
| Deterministic check | Validates state, traceability, links, frontmatter |
| Evidence note | Date, commit, commands, caveats |

## Implementation outline

### T-V06-003 (analyst)

1. Pick a demo subject: smallest meaningful end-to-end Specorator run.
2. Define expected artifacts (idea → retrospective) + accepted-state shape.
3. Define evidence-note format (frontmatter fields for date/commit/commands/caveats).
4. Define validation scope: which deterministic checks run on the example folder.
5. Define success criteria for "tutorial caveat removed".
6. Land contract as a doc, e.g. `docs/golden-path-contract.md`.

### T-V06-004 (qa)

1. Build `examples/<demo-slug>/` matching the contract.
2. Run or simulate the lifecycle, recording every step.
3. Add deterministic-check script integration (extend `scripts/check-*.ts` if needed).
4. Write `examples/<demo-slug>/EVIDENCE.md` per the contract.
5. Update tutorial doc to remove desk-only caveat.

## Files of interest

- New `docs/golden-path-contract.md`
- New `examples/<demo-slug>/` (full lifecycle artifacts + EVIDENCE.md)
- `scripts/check-*.ts` (new or extended deterministic check)
- Tutorial doc(s) referenced from README — locate via grep before starting
- Possibly `tools/automation-registry.yml` for new check entry

## Definition of Done

- [ ] CLAR-V06-003 resolved
- [ ] T-V06-003 contract doc landed
- [ ] T-V06-004 example folder + evidence note landed
- [ ] Deterministic check passes against the example
- [ ] Tutorial no longer carries "No live run yet" caveat
- [ ] `npm run verify` green
- [ ] PR title matches `feat(v06): ...` Conventional Commit pattern

## Workflow refs

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/specorator.md`](../../docs/specorator.md)
- [`docs/quality-framework.md`](../../docs/quality-framework.md)
- [`docs/verify-gate.md`](../../docs/verify-gate.md)
- [`docs/traceability.md`](../../docs/traceability.md)
- [`tools/automation-registry.yml`](../../tools/automation-registry.yml)

## Coordination

- No file overlap with other Wave 1 PRs.
- T-V06-012 (positioning) cites this evidence after merge.
- T-V06-014 (release readiness) re-runs the deterministic check.
