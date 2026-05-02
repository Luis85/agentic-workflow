# PR-C — Cross-tool adapters

> Implementer brief for the v0.6 cross-tool-adapters slice. Branch: `feat/v06-cross-tool-adapters`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-005 | Design cross-tool adapter inventory | architect | M |
| T-V06-006 | Add first cross-tool adapters | dev | L |
| T-V06-007 | Add adapter drift checks or maintenance docs | dev | M |

Linear deps: T-V06-005 → T-V06-006 → T-V06-007.

## Goal

Make Copilot, Codex, Cursor/Aider-style consumers first-class without fragmenting the source of truth in `AGENTS.md`. Adapters are thin projections, not independent methodologies.

## Spec references

- [requirements.md](./requirements.md) — REQ-V06-003, REQ-V06-004
- [design.md](./design.md) — *Cross-tool adapter model*
- [spec.md](./spec.md) — SPEC-V06-003
- [tasks.md](./tasks.md) — T-V06-005, T-V06-006, T-V06-007

## Requirements satisfied

- REQ-V06-003 — Add cross-tool adapter surfaces (must)
- REQ-V06-004 — Preserve `AGENTS.md` as source of truth (unwanted-behavior, must)
- NFR-V06-002 — Adapter ownership clear; drift checks where practical
- NFR-V06-004 — Markdown remains canonical artifact format
- SPEC-V06-003 — Cross-tool adapter inventory

## Test scenarios

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-003 | Copilot/Codex user looks for native setup files | Adapter path exists; points to canonical workflow rules |
| TEST-V06-004 | Adapter content compared with canonical instructions | Drift prevented by generation, validation, or documented ownership |

## CLAR resolution required (BLOCKING)

**CLAR-V06-001** — Confirm whether v0.6 ships the full cross-tool adapter set or starts with Claude Code, Codex, and Copilot only. **Resolve in #91 before T-V06-005 begins.** The answer scopes T-V06-006 and T-V06-007.

## Adapter inventory (per design.md)

| Surface | Candidate path | Role |
|---|---|---|
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/agents/`, `.github/skills/` | GitHub-native instructions |
| Codex | `.codex/`, `.agents/skills/`, plugin package | Codex delivery + reusable workflows |
| Cursor / Aider / generic | `.cursor/rules/`, `.aider.conf.yml`, `AGENTS.md` references | Thin pointers |
| All tools | `AGENTS.md`, `docs/workflow-overview.md`, `templates/` | Canonical shared contract |

## Implementation outline

### T-V06-005 (architect)

1. Map canonical source files (`AGENTS.md`, `.codex/`, `.claude/`, `templates/`) to each adapter surface.
2. Decide ownership policy per surface: hand-authored vs generated.
3. Define drift policy: deterministic check vs documented maintenance.
4. Land inventory as `docs/adapters.md` (or `docs/adapter-inventory.md`).

### T-V06-006 (dev)

1. Add or update adapter files per the inventory:
   - `.github/copilot-instructions.md` — Copilot entry point pointing to `AGENTS.md`.
   - `.codex/` — confirm/extend existing surface.
   - At least one editor-agent path (e.g. `.cursor/rules/agents.mdc` or `.aider.conf.yml`).
2. Each adapter file states authority and points back to canonical sources.

### T-V06-007 (dev)

1. Add a deterministic drift check (`scripts/check-adapter-drift.ts`) where generation is stable; OR
2. Add explicit maintenance docs in `docs/adapters.md` listing manual sync triggers.
3. Register the new check in `tools/automation-registry.yml` if added.

## Files of interest

- `AGENTS.md` — *Tool-specific notes* section
- `.github/copilot-instructions.md` (new)
- `.codex/instructions.md`, `.codex/README.md`
- `CLAUDE.md` (root)
- `.cursor/rules/` (new)
- `.aider.conf.yml` (new, optional)
- `docs/adapters.md` (new)
- `scripts/check-adapter-drift.ts` (new, conditional)
- `tools/automation-registry.yml`

## Definition of Done

- [ ] CLAR-V06-001 resolved on #91
- [ ] T-V06-005 inventory doc landed
- [ ] T-V06-006 adapter surfaces for at least Copilot + Codex + one editor-agent path
- [ ] All adapter files reference `AGENTS.md` as source of truth
- [ ] T-V06-007 drift check or maintenance doc landed
- [ ] Append entry to `specs/version-0-6-plan/implementation-log.md` per Stage 7 (file is pending — first task to land creates it)
- [ ] `npm run verify` green
- [ ] PR title matches `feat(v06): ...`

## Workflow refs

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/specorator.md`](../../docs/specorator.md) — full lifecycle (Stage 7 = Implementation, current stage)
- [`.codex/README.md`](../../.codex/README.md)
- [`docs/verify-gate.md`](../../docs/verify-gate.md)
- [`tools/automation-registry.yml`](../../tools/automation-registry.yml)

## Coordination

- **`AGENTS.md` collision** — also touched by PR-A (#175 *Read these first*) and PR-E (#179 pointer entry). Per [`feedback_parallel_pr_conflicts.md`](../../.claude/memory/feedback_parallel_pr_conflicts.md): merge not rebase. Land PR-A first if practical so the *Read these first* shape stabilises.
- **`CLAUDE.md` collision** — also touched by PR-A (#175) and PR-E (#179).
- **`tools/automation-registry.yml` collision** — also touched by PR-B (#176), PR-D (#178), PR-E (#179).
- T-V06-012 (positioning) cites adapters after merge.
