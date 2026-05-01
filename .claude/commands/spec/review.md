---
description: Stage 9 — Review. Invokes reviewer to produce review.md and refresh traceability.md. Writes only its own review artifacts; does not modify specs, code, tests, or other agents' outputs.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Grep, Bash]
model: opus
---

# /spec:review

Run **stage 9 — Review**.

1. Resolve slug; verify `test-report.md` is `complete` and there are no S1/S2 open. The reviewer agent treats `test-plan.md` and `test-report.md` as core review inputs (see `.claude/agents/reviewer.md`); a `skipped` test report would let Stage 9 produce a release-signaling verdict without Stage 8 evidence — escalate instead.
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
4. **Spawn the `brand-reviewer` subagent in parallel** when the diff touches `sites/`, `.claude/skills/specorator-design/`, any `*.html` / `*.css` / `*.jsx` producing user-visible UI, or `templates/` files emitting HTML/CSS. Run it as a separate `Agent` call with `subagent_type: brand-reviewer` and pass the same `$BASE` resolution as the reviewer. The brand-reviewer returns a structured findings block; the `reviewer` agent merges any findings into `review.md` under a `## Brand review` section before computing its verdict. **Blocking** brand findings (token literal, emoji, icon-library import without ADR, gradient/texture introduced, white page background) flip the verdict to `Blocked` or `Approved with conditions` per the severity model in `.claude/agents/brand-reviewer.md`. If the diff touches no UI surfaces, skip this step and record `Brand review: not-applicable` in `review.md`.
5. Update `workflow-state.md`. If Blocked, recommend going back to the owning stage. Else recommend `/spec:release`.

## Don't

- Don't edit artifacts during review. Findings get fixed in their owning stages.
- Don't approve to "unblock" — surface the issue.
