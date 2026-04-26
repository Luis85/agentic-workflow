---
description: Stage 9 — Review. Invokes reviewer to produce review.md and refresh traceability.md. Writes only its own review artifacts; does not modify specs, code, tests, or other agents' outputs.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Grep, Bash]
model: opus
---

# /spec:review

Run **stage 9 — Review**.

1. Resolve slug; verify the test report is `complete` and there are no S1/S2 open.
2. Build / refresh `specs/<slug>/traceability.md` by parsing the artifacts' structured content: document-level YAML frontmatter, plus the marked-up per-item entries in body — `### REQ-<AREA>-NNN` headings in `requirements.md`, `### SPEC-<AREA>-NNN` blocks and `Satisfies:` lines in `spec.md`, `### T-<AREA>-NNN` blocks and `Satisfies:` lines in `tasks.md`, test IDs and REQ references in the test report, and `Files changed:` / `Spec reference:` lines in `implementation-log.md` for the `Code` column (`file:line`). The pass is mechanical but reads body content, not just frontmatter.
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
