---
description: Stage 5 — Specification. Invokes architect to produce implementation-ready spec.md (interfaces, data, edge cases, test scenarios).
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: opus
---

# /spec:specify

Run **stage 5 — Specification**.

1. Resolve slug; verify `requirements.md` and `design.md` are each `complete`. The architect agent reads both as mandatory inputs (see `.claude/agents/architect.md`) — a `skipped` upstream is a hard escalation, not a passable state.
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `architect` subagent.**
4. The architect produces `specs/<slug>/spec.md` from `templates/spec-template.md`:
   - precise interface contracts,
   - data structures + validation rules,
   - state transitions where relevant,
   - enumerated edge cases,
   - derivable test scenarios,
   - observability requirements,
   - performance budgets,
   - compatibility / migration plan.
5. Every spec item traces to ≥ 1 requirement ID.
6. Run the quality gate. **Recommend the user run `/spec:analyze`** to cross-check spec ↔ requirements ↔ design consistency before proceeding (slash commands are user-invoked).
7. Update `workflow-state.md`.
8. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch. Do not mark PR ready yet — PR stays draft through planning stages.
9. Recommend `/spec:analyze` (optional gate) followed by `/spec:tasks` next.
10. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: specify` and `artifact_path: specs/<slug>/spec.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
