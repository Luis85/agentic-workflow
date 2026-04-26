---
description: Stage 9 — Review. Invokes reviewer to produce review.md and validate traceability.md. Read-only on artifacts.
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write, Grep, Bash]
model: opus
---

# /spec:review

Run **stage 9 — Review**.

1. Resolve slug; verify the test report is `complete` and there are no S1/S2 open.
2. Build / refresh `specs/<slug>/traceability.md` from artifact frontmatter (mechanical pass).
3. **Spawn the `reviewer` subagent.** It reads everything and produces `specs/<slug>/review.md`:
   - requirements compliance (per-REQ verdict + evidence),
   - design compliance,
   - spec compliance (deviations logged + ADR-tracked when material),
   - constitution check,
   - risk status,
   - findings (severity, category, location, recommendation, owner),
   - traceability validation,
   - verdict: Approved / Approved with conditions / Blocked.
4. Update `workflow-state.md`. If Blocked, recommend going back to the owning stage. Else recommend `/spec:release`.

## Don't

- Don't edit artifacts during review. Findings get fixed in their owning stages.
- Don't approve to "unblock" — surface the issue.
