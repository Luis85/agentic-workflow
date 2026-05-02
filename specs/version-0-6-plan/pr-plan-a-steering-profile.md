# PR-A — Steering profile

> Implementer brief for the v0.6 steering-profile slice. Branch: `feat/v06-steering-profile`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-001 | Decide steering profile location | architect | M |
| T-V06-002 | Fill Specorator product steering | pm | M |

T-V06-002 depends on T-V06-001 — the decision must land first (in this same PR).

## Goal

Distinguish Specorator's own product steering from the blank downstream steering templates without erasing adopter-facing template guidance.

## Spec references

- [idea.md](./idea.md)
- [research.md](./research.md)
- [requirements.md](./requirements.md) — REQ-V06-001
- [design.md](./design.md) — see *Steering model*
- [spec.md](./spec.md) — SPEC-V06-001
- [tasks.md](./tasks.md) — T-V06-001, T-V06-002

## Requirements satisfied

- REQ-V06-001 — Fill Specorator product steering (ubiquitous, must)
- NFR-V06-001 — First-run adoption legible without reading the whole repo
- SPEC-V06-001 — Specorator steering profile

## Test scenario

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-001 | Contributor searches for Specorator's own product steering | Correct steering source explicit; adopter templates not erased |

## Decision points (T-V06-001)

Pick one location model from `design.md` and record it. Options:
1. Repurpose `docs/steering/*.md` for Specorator and add blank templates elsewhere.
2. Keep `docs/steering/*.md` as adopter blanks; add `docs/specorator-product/` (or equivalent) for Specorator's own steering.
3. Keep `docs/steering/*.md` as adopter blanks; mark each one with a clearly-scoped section per audience.

If the decision changes ownership semantics → file ADR-0022 via [`/adr:new`](../../.claude/skills/new-adr/SKILL.md). ADR is **required** for option 1.

## Implementation outline (T-V06-002)

1. Land the location decision (commit + ADR if option 1).
2. Fill Specorator's own product, UX, tech, quality, operations steering at the chosen location, sourcing facts from `README.md`, `AGENTS.md`, `docs/specorator.md`, `docs/quality-framework.md`.
3. Update `AGENTS.md` and `CLAUDE.md` "Read these first" sections so agents pick the right steering source for template improvements vs adopter projects.
4. Update `docs/steering/README.md` to explain the split.

## Files of interest

- `docs/steering/README.md`
- `docs/steering/{product,ux,tech,quality,operations}.md`
- New `docs/specorator-product/` (option 2) or new blank-template home (option 1)
- `AGENTS.md` — *Read these first* section
- `CLAUDE.md` — primary context import list
- `docs/adr/0022-*.md` — only if ownership semantics change

## Definition of Done

- [ ] T-V06-001 decision recorded in commit + ADR-0022 if required
- [ ] T-V06-002 Specorator steering filled at chosen location
- [ ] Adopter template guidance preserved (no silent overwrite)
- [ ] `AGENTS.md` + `CLAUDE.md` point to the correct steering source for template improvements
- [ ] Append entry to [`specs/version-0-6-plan/implementation-log.md`](./implementation-log.md) per Stage 7
- [ ] `npm run verify` green
- [ ] PR title matches `feat(v06): ...` Conventional Commit pattern (PR-title CI)
- [ ] References issue #91 + task IDs in commits

## Workflow refs

- [`AGENTS.md`](../../AGENTS.md) — operating rules + agent classes
- [`docs/specorator.md`](../../docs/specorator.md) — full lifecycle (Stage 7 = Implementation, current stage)
- [`docs/steering/README.md`](../../docs/steering/README.md)
- [`docs/branching.md`](../../docs/branching.md) — branch-per-concern
- [`docs/verify-gate.md`](../../docs/verify-gate.md) — verify before push
- [`templates/adr-template.md`](../../templates/adr-template.md)
- [`memory/constitution.md`](../../memory/constitution.md) — Article VIII Plain Language

## CLAR resolution required

None.

## Coordination

- **`AGENTS.md` collision** — also touched by PR-C (#177 *Tool-specific notes*) and PR-E (#179 pointer entry). Per [`feedback_parallel_pr_conflicts.md`](../../.claude/memory/feedback_parallel_pr_conflicts.md): merge not rebase to preserve reviewer line anchors.
- **`CLAUDE.md` collision** — also touched by PR-E (#179 pointer entry).
- T-V06-012 (public positioning) reads the steering decision after this PR merges.
- Land first if possible — PR-C/PR-E read the *Read these first* structure once it stabilises here.
