---
name: project-review
description: Review a project and its git/GitHub history to capture learnings, summarize findings, propose improvements, and hand off a first draft PR. Use when the user says "project review", "review this project", "capture learnings", or asks for an improvement review from project history.
argument-hint: "<phase> <review-slug> [scope]"
---

# Project Review

Use this skill to run the Project-review workflow defined in [`docs/project-review-workflow.md`](../../../docs/project-review-workflow.md).

The workflow is evidence-first: review artifacts and history, capture learnings, rank improvements, then create a tracking issue and first draft PR from a separate worktree.

## Phases

| Phase | Command | Primary outputs |
|---|---|---|
| Start | `/project-review:start <slug> <scope>` | `quality/<slug>/project-review-state.md` |
| Plan | `/project-review:plan <slug>` | `review-plan.md` |
| Inspect | `/project-review:inspect <slug>` | `history-review.md` |
| Synthesize | `/project-review:synthesize <slug>` | `findings.md` |
| Propose | `/project-review:propose <slug>` | `improvement-proposals.md` |
| Handoff | `/project-review:handoff <slug>` | GitHub issue + first draft PR |

## Procedure

0. **Intake gate.** List `inputs/` non-recursively before scoping. Surface relevant items to the user; never auto-extract archives. Cite consumed paths in `review-plan.md`.
1. **Start.** Create the review state file from `templates/project-review-state-template.md`; record scope, repo, integration branch, and review period.
2. **Plan.** Create `review-plan.md`; name artifact paths, git ranges, GitHub queries, CI evidence, review questions, exclusions, and first-PR selection criteria.
3. **Inspect.** Create `history-review.md`; summarize git, PR, issue, CI, workflow-state, and artifact signals. Link every claim to a source.
4. **Synthesize.** Create `findings.md`; distinguish strengths, friction, risks, root-cause hypotheses, and open questions.
5. **Propose.** Create `improvement-proposals.md`; rank proposals and pick one first draft PR candidate.
6. **Handoff.** Open a tracking issue when GitHub access is available, create a worktree for the first proposal, implement or scaffold it, verify, commit, push, and open a draft PR. Update `project-review-state.md` with issue URL, PR URL, branch, commit SHA, verification, and remaining risks.

## Evidence rules

- Prefer primary repo evidence: committed artifacts, commit SHAs, PRs, issues, CI runs, release tags, and command summaries.
- Label inferences explicitly.
- Keep unknowns visible in the relevant artifact.
- Do not use raw log dumps; summarize and cite.

## Do not

- Do not replace feature retrospectives; consume them.
- Do not edit source or workflow artifacts outside `quality/<slug>/` until the handoff worktree is created for the first proposal.
- Do not merge the draft PR or delete branches.
- Do not make constitution or governance changes without ADR/human approval.
