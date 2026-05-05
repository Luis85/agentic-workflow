# PR-F — Adoption profiles

> Implementer brief for the v0.6 adoption-profiles slice. Branch: `feat/v06-adoption-profiles`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-011 | Add adoption profiles | pm | M |

## Goal

Map common users to the smallest useful Specorator surface. Profiles are short maps to existing surfaces — no duplicate manuals.

## Spec references

- [requirements.md](./requirements.md) — REQ-V06-009
- [design.md](./design.md) — *Adoption profile model*
- [spec.md](./spec.md) — SPEC-V06-006
- [tasks.md](./tasks.md) — T-V06-011

## Requirements satisfied

- REQ-V06-009 — Add adoption profiles (should)
- NFR-V06-001 — First-run adoption legible without reading the whole repo
- SPEC-V06-006 — Adoption profiles

## Test scenario

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-009 | Solo builder or enterprise evaluator chooses a profile | Profile routes to a minimal, concrete starting path |

## Profiles (per design.md)

| Profile | Minimal path |
|---|---|
| Solo builder | README, tutorial, `orchestrate`, local verify, one feature |
| Product team | Discovery, requirements, design, roadmap, review gates |
| Agency / client delivery | Sales, project manager track, lifecycle, QA review, release notes |
| Enterprise governance | Quality metrics, agentic security, hooks, ADRs, CI, release workflow |
| Brownfield migration | Project scaffolding, stock-taking, discovery, first tracer-bullet feature |

## Implementation outline

1. Create `docs/adoption-profiles/` (with README.md frontmatter `entry_point: true`).
2. One file per profile: `solo-builder.md`, `product-team.md`, `agency-delivery.md`, `enterprise-governance.md`, `brownfield-migration.md`.
3. Each profile = persona summary + minimal path + links to existing docs (no duplicated content).
4. Add link from root `README.md` to the adoption-profiles index.
5. Verify each link resolves (`npm run check:links`).

## Files of interest

- New `docs/adoption-profiles/README.md` (folder entry_point)
- New `docs/adoption-profiles/{solo-builder,product-team,agency-delivery,enterprise-governance,brownfield-migration}.md`
- `README.md` — add adoption-profiles entry near "How to work here"
- Possibly `sites/index.html` deferred to PR-H (positioning) — do not touch here

## Definition of Done

- [ ] All 5 profiles landed
- [ ] Each profile links to existing surfaces, no duplicated content
- [ ] Folder README includes `entry_point: true` frontmatter
- [ ] Root README links the index
- [ ] Append entry to `specs/version-0-6-plan/implementation-log.md` per Stage 7 (file is pending — first task to land creates it)
- [ ] `npm run verify` green
- [ ] PR title matches `feat(v06): ...`

## Workflow refs

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/specorator.md`](../../docs/specorator.md) — full lifecycle (Stage 7 = Implementation, current stage)
- [`docs/discovery-track.md`](../../docs/discovery-track.md)
- [`docs/sales-cycle.md`](../../docs/sales-cycle.md)
- [`docs/project-track.md`](../../docs/project-track.md)
- [`docs/portfolio-track.md`](../../docs/portfolio-track.md)
- [`docs/project-scaffolding-track.md`](../../docs/project-scaffolding-track.md)
- [`docs/stock-taking-track.md`](../../docs/stock-taking-track.md)

## CLAR resolution

None required.

## Coordination

- **`README.md` collision** — Wave 2 PR-H (positioning, T-V06-012) also edits root README. Land this PR first; PR-H links these profiles from public surfaces after merge.
- No other file overlap with Wave 1 PRs.
