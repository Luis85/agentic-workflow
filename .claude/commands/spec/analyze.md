---
description: Optional gate. Cross-checks consistency between requirements, design, spec, and tasks. Reports gaps and contradictions.
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Grep]
model: sonnet
---

# /spec:analyze

Optional quality gate — typically runs after Spec or after Tasks.

1. Resolve slug.
2. Read `requirements.md`, `design.md`, `spec.md`, and `tasks.md` (whichever exist).
3. Run **consistency checks**:
   - Every REQ has at least one design section addressing it.
   - Every REQ has at least one spec item satisfying it.
   - Every REQ has at least one task (and at least one *test* task once tasks exist).
   - Every spec item traces back to a REQ.
   - Every task traces back to a REQ or spec item.
   - No conflicting statements between artifacts (e.g., spec says 200 ms, PRD says 500 ms).
   - No silent design changes — design and spec agree on contracts.
4. Produce a report in `workflow-state.md` under `Open clarifications` (or a dedicated section). Each finding is actionable: which artifact owns the fix.
5. **Do not modify artifacts.** Surface the finding; the owning agent fixes it.
