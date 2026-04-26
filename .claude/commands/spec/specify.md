---
description: Stage 5 — Specification. Invokes architect to produce implementation-ready spec.md (interfaces, data, edge cases, test scenarios).
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: opus
---

# /spec:specify

Run **stage 5 — Specification**.

1. Resolve slug; verify `requirements.md` and `design.md` are `complete`.
2. **Spawn the `architect` subagent.**
3. The architect produces `specs/<slug>/spec.md` from `templates/spec-template.md`:
   - precise interface contracts,
   - data structures + validation rules,
   - state transitions where relevant,
   - enumerated edge cases,
   - derivable test scenarios,
   - observability requirements,
   - performance budgets,
   - compatibility / migration plan.
4. Every spec item traces to ≥ 1 requirement ID.
5. Run the quality gate. Run `/spec:analyze` to cross-check spec ↔ requirements ↔ design consistency.
6. Update `workflow-state.md`. Recommend `/spec:tasks` next.
