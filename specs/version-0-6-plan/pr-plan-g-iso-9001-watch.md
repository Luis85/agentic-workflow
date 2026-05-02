# PR-G — ISO 9001:2026 watch item

> Implementer brief for the v0.6 ISO-9001-watch slice. Branch: `chore/v06-iso-9001-watch`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-013 | Add ISO 9001:2026 follow-up | qa | S |

## Goal

Record a watch item or follow-up issue so QA-track requirements are reviewed when ISO 9001:2026 is published or before v1.0 readiness — without making premature compliance changes.

## Spec references

- [requirements.md](./requirements.md) — REQ-V06-011
- [design.md](./design.md) — *Risks and mitigations* (RISK-V06-006)
- [spec.md](./spec.md) — SPEC-V06-008
- [tasks.md](./tasks.md) — T-V06-013

## Requirements satisfied

- REQ-V06-011 — Track ISO 9001:2026 impact (event-driven, should)
- SPEC-V06-008 — ISO 9001:2026 watch item

## Test scenario

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-011 | ISO 9001:2026 publication status changes | Tracked follow-up prompts QA track review before v1.0 or next QA release |

## Implementation outline

1. Pick a single watch-item home — recommend `docs/quality-assurance-track.md` *Watch items* section (add if missing) or a new `docs/iso-9001-watch.md`.
2. Capture: expected ISO/FDIS 9001 publication timeline, QA-track sections likely affected, review trigger ("publication" OR "v1.0 readiness — whichever first").
3. Open a tracking GitHub issue labelled `roadmap`, `qa`, scheduled review date — link from the doc.
4. Annotate `docs/quality-framework.md` (if needed) with a one-line pointer.
5. No requirement changes; **avoid** adding any clause that implies compliance.

## Files of interest

- `docs/quality-assurance-track.md` — preferred home
- New `docs/iso-9001-watch.md` (alternative)
- `docs/quality-framework.md` — pointer annotation
- New GitHub tracking issue

## Definition of Done

- [ ] Watch item recorded in chosen doc
- [ ] Tracking issue opened + linked
- [ ] Review trigger explicit (date or event)
- [ ] No premature requirement changes
- [ ] Append entry to `specs/version-0-6-plan/implementation-log.md` per Stage 7 (file is pending — first task to land creates it)
- [ ] `npm run verify` green
- [ ] PR title matches `chore(v06): ...` Conventional Commit pattern

## Workflow refs

- [`docs/quality-framework.md`](../../docs/quality-framework.md)
- [`docs/quality-assurance-track.md`](../../docs/quality-assurance-track.md)
- [`docs/specorator.md`](../../docs/specorator.md) — full lifecycle (Stage 7 = Implementation, current stage)
- [`AGENTS.md`](../../AGENTS.md)

## CLAR resolution

None required.

## Coordination

- **`docs/quality-framework.md` + `docs/quality-assurance-track.md` collision** — also touched by PR-E (#179 agentic security review) which may add new sections. Per [`feedback_parallel_pr_conflicts.md`](../../.claude/memory/feedback_parallel_pr_conflicts.md): merge not rebase. Recommend a dedicated *Watch items* subsection so PR-E and PR-G edit non-overlapping ranges.
- T-V06-014 (release readiness) confirms the watch item exists.
