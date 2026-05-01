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
3. **Dispatch both review subagents together in a single batch — `reviewer` and (when applicable) `brand-reviewer` — and wait for both to return before any verdict is written.** Order matters: the `reviewer` agent's verdict must be computed *after* brand findings are folded into `review.md`, otherwise blocking brand issues (token literal, emoji, icon-library import without ADR, gradient/texture introduced, white page background) can be omitted from the Stage 9 decision.
   - **Always:** spawn the `reviewer` subagent. It reads every artifact, prepares findings (requirements compliance with per-REQ verdict + evidence; design compliance; spec compliance with deviations logged + ADR-tracked when material; constitution check; risk status; findings with severity/category/location/recommendation/owner; traceability validation), and **defers writing the verdict line** until step 4 completes.
   - **Conditionally, in the same batch:** spawn the `brand-reviewer` subagent when the diff touches `sites/`, `.claude/skills/specorator-design/`, any `*.html` / `*.css` / `*.jsx` producing user-visible UI, or `templates/` files emitting HTML/CSS. Pass the same `$BASE` resolution as the reviewer. The brand-reviewer returns a structured findings block.
   - If the diff touches no UI surfaces, skip the brand-reviewer dispatch and record `Brand review: not-applicable` in `review.md`.
4. **Once both subagents have returned, the `reviewer` agent merges brand findings into `review.md` under a `## Brand review` section, then computes the final verdict: Approved / Approved with conditions / Blocked.** Blocking brand findings flip the verdict to `Blocked` or `Approved with conditions` per the severity model in `.claude/agents/brand-reviewer.md`. The verdict line is written exactly once, after all findings (general + brand) are present in `review.md`.
5. Update `workflow-state.md`. If Blocked, recommend going back to the owning stage. Else recommend `/spec:release`.

## Don't

- Don't edit artifacts during review. Findings get fixed in their owning stages.
- Don't approve to "unblock" — surface the issue.
