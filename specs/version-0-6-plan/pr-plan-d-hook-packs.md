# PR-D — Hook packs

> Implementer brief for the v0.6 hook-packs slice. Branch: `feat/v06-hook-packs`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-008 | Design opt-in hook packs | architect | M |
| T-V06-009 | Implement advisory hook examples | dev | L |

T-V06-009 depends on T-V06-008.

## Goal

Provide opt-in deterministic guardrails for worktree, branch, Markdown, secret, and risky-command checks. Start advisory/dry-run; promotion to blocking requires maintainer ADR.

## Spec references

- [requirements.md](./requirements.md) — REQ-V06-005, REQ-V06-006, REQ-V06-012
- [design.md](./design.md) — *Hook pack model*
- [spec.md](./spec.md) — SPEC-V06-004
- [tasks.md](./tasks.md) — T-V06-008, T-V06-009

## Requirements satisfied

- REQ-V06-005 — Add opt-in hook packs (should)
- REQ-V06-006 — Document hook safety + disable paths (must)
- REQ-V06-012 — Keep v0.6 opt-in and reversible (unwanted-behavior, must)
- NFR-V06-003 — Safety: hooks/security automation start opt-in and reversible
- SPEC-V06-004 — Hook pack contract

## Test scenarios

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-005 | Maintainer enables hook packs in advisory mode | Hooks report findings; no silent block on unrelated work |
| TEST-V06-006 | Hook false positive occurs | Docs explain disable, bypass, or remediation steps |
| TEST-V06-012 | Default contributor runs normal verification after v0.6 | New hooks impose no mandatory opt-in behavior |

## Hook packs (per design.md)

| Pack | Trigger class | Initial behavior |
|---|---|---|
| Worktree guard | session start / pre-tool-use | Warn when editing outside `.worktrees/<slug>` for non-trivial work |
| Branch guard | pre-git operation | Warn or block direct commits/pushes to `main` / `develop` |
| Markdown guard | post-edit / stop | Run targeted frontmatter, link, spec-state, product-page checks |
| Secret/risky guard | pre-tool-use | Warn on suspicious secrets, destructive commands, release/publish ops |
| Handoff context | session start | Surface current `workflow-state` + open clarifications |

## Implementation outline

### T-V06-008 (architect)

1. Define hook pack contracts — scope, dry-run defaults, false-positive handling, disable paths, promotion criteria.
2. Land contract in `docs/hooks.md` (new) or expand existing hook docs.
3. Confirm Claude Code hook config schema in `.claude/settings.json`; design example shape.

### T-V06-009 (dev)

1. Add example hooks under `.claude/hooks/` (or wherever the harness expects).
2. Provide enabling/disabling instructions per pack.
3. Document false-positive remediation per pack.
4. Optional: add a `.claude/settings.example.json` showing advisory enablement.

## Files of interest

- New `docs/hooks.md`
- New `.claude/hooks/` (advisory examples)
- New `.claude/settings.example.json`
- `.claude/settings.json` — only if absolutely required (default contributor path must remain unchanged — REQ-V06-012)
- `tools/automation-registry.yml` — register new automation if added

## Definition of Done

- [ ] T-V06-008 hook contracts landed
- [ ] T-V06-009 advisory example hooks landed for ≥3 packs
- [ ] Disable + bypass procedures documented per pack
- [ ] No mandatory opt-in change to default contributor path
- [ ] `npm run verify` green
- [ ] PR title matches `feat(v06): ...`

## Workflow refs

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/specorator.md`](../../docs/specorator.md)
- [`docs/verify-gate.md`](../../docs/verify-gate.md)
- [`docs/branching.md`](../../docs/branching.md)
- [`docs/worktrees.md`](../../docs/worktrees.md)
- [`tools/automation-registry.yml`](../../tools/automation-registry.yml)
- [`.claude/settings.json`](../../.claude/settings.json)

## Coordination

- No file overlap with other Wave 1 PRs.
- T-V06-012 (positioning) cites hook guardrails after merge.
