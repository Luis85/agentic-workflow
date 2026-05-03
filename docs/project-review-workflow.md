---
title: Project-review workflow
folder: docs
description: Evidence-backed workflow for reviewing a project, its git history, lessons, and improvement proposals.
entry_point: false
---

# Project-review workflow

Opt-in workflow for reviewing an active or completed project as a whole. It reads the project artifacts, git history, merged PRs, issues, retrospectives, and verification evidence; captures learnings; proposes improvements; documents findings; opens a tracking issue; and creates a first draft PR from its own worktree.

This workflow is a Quality Assurance companion path, not a new mandatory lifecycle stage. It uses the existing `quality/<review-slug>/` sink so reviews can sit beside ISO-style readiness reviews without adding another top-level intake folder.

## When to use

- A project or feature has accumulated enough delivery history that local retrospectives are too narrow.
- A maintainer wants to learn from git history, PR review feedback, CI failures, issue churn, or workflow friction.
- A release, client engagement, or portfolio review needs concrete improvement proposals before the next cycle.
- The team wants a draft PR with the first improvement proposal instead of a report that stops at recommendations.

Not for:

- Replacing `/spec:retro` for a single feature. Run the retrospective first.
- Formal certification or compliance audit. Use `/quality:*` for ISO-aligned evidence review.
- Making product priority decisions. The workflow surfaces options; humans accept, reject, or sequence them.

## Inputs

- Review slug: `kebab-case`.
- Scope statement: project, feature, release, portfolio slice, or client engagement being reviewed.
- Local git repository with fetchable history.
- Relevant artifacts under `specs/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `docs/`, and `.github/`.
- Optional linked GitHub issues, PRs, CI runs, and review comments when GitHub access is available.
- Optional source packages from `inputs/`, surfaced through the canonical intake gate.

## Outputs

All durable review artifacts live under `quality/<review-slug>/`:

```
quality/<review-slug>/
├── project-review-state.md
├── review-plan.md
├── history-review.md
├── findings.md
└── improvement-proposals.md
```

Delivery outputs:

- A GitHub issue that summarizes the review scope, key learnings, proposed improvements, and the draft PR link when available.
- A dedicated worktree under `.worktrees/<proposal-slug>/` for the first accepted proposal.
- A topic branch and first draft PR linked to the issue.

## Flow

```
/project-review:start <slug> <scope>
   │
   ├─ Plan ─────────── define scope, evidence sources, review questions, and issue intent
   ├─ Inspect ──────── read artifacts, git history, issues, PRs, CI, and review feedback
   ├─ Synthesize ───── capture learnings, causes, repeated patterns, risks, and strengths
   ├─ Propose ──────── rank improvement proposals with effort, owner, success signal, and first PR candidate
   └─ Handoff ──────── open issue, create worktree, create first draft PR, update state
```

## Phases

### Start

Command: `/project-review:start <slug> <scope>`

Create `quality/<slug>/project-review-state.md`, record the scope, and list `inputs/` non-recursively. If any source packages are relevant, cite them in `review-plan.md`; never extract archives without explicit human approval.

Quality gate: scope, reviewer, repository, and review intent are named; the next command is clear.

### Plan

Command: `/project-review:plan <slug>`

Create `review-plan.md` from `templates/project-review-plan-template.md`. The plan names:

- artifact paths to inspect,
- git ranges and branch references,
- GitHub issues, PRs, labels, and CI checks to inspect when available,
- review questions,
- excluded areas,
- intended tracking issue title, and
- criteria for selecting the first draft PR proposal.

Quality gate: evidence sources are specific enough that another reviewer can repeat the review.

### Inspect

Command: `/project-review:inspect <slug>`

Create `history-review.md` from `templates/project-review-history-template.md`. Inspect:

- commit history shape, branch hygiene, revert/fixup patterns, and release tags;
- merged PR cadence, review feedback, reopened conversations, and CI failures;
- workflow-state drift, skipped artifacts, blocked stages, and overdue handoffs;
- docs, templates, scripts, and automation touched repeatedly;
- prior retrospectives, QA reviews, and issue-breakdown logs.

Quality gate: every claim links to a source path, commit, issue, PR, or command result summary. Unknowns stay visible.

### Synthesize

Command: `/project-review:synthesize <slug>`

Create `findings.md` from `templates/project-review-findings-template.md`. Separate:

- strengths to preserve,
- repeated friction,
- root-cause hypotheses,
- process gaps,
- tooling gaps,
- documentation gaps,
- governance gaps, and
- open questions.

Quality gate: findings distinguish evidence from inference and do not jump straight to solutions.

### Propose

Command: `/project-review:propose <slug>`

Create `improvement-proposals.md` from `templates/project-review-proposals-template.md`. Each proposal includes:

- problem statement,
- evidence,
- expected benefit,
- affected surfaces,
- effort,
- risks,
- owner,
- success signal,
- issue/PR plan, and
- whether it is the recommended first draft PR.

Quality gate: at least one proposal is small enough for a first draft PR, and no proposal silently changes requirements, governance, or constitution rules.

### Handoff

Command: `/project-review:handoff <slug>`

Complete the workflow:

1. Open a GitHub issue summarizing the review and proposals.
2. Create a fresh worktree under `.worktrees/<proposal-slug>/` from the integration branch.
3. Implement or scaffold the first proposal in that worktree.
4. Verify the targeted change.
5. Commit, push, and open a draft PR linked to the issue.
6. Update `project-review-state.md` with issue URL, PR URL, branch, commit SHA, verification, and remaining risks.

Quality gate: issue and draft PR are linked both ways; verification is reported; remaining risks are explicit.

## Agent boundary

Owner: `project-reviewer`.

The reviewer may read project artifacts, git history, GitHub issues/PRs, and CI status. It may write only `quality/<slug>/project-review-*`, `review-plan.md`, `history-review.md`, `findings.md`, `improvement-proposals.md`, issue/PR text, and the separate worktree for the first proposal.

It must not:

- edit `specs/` artifacts during review,
- rewrite git history,
- merge the draft PR,
- delete branches or worktrees, or
- mark improvement actions complete without evidence.

## Relationship to other workflows

- `/spec:retro` captures feature-level learning; Project Review aggregates across a project or period.
- `/quality:*` evaluates execution readiness; Project Review turns broader delivery history into improvement proposals and a first draft PR.
- `/portfolio:*` can consume Project Review findings as portfolio improvement signals.
- `/specorator:*` owns template changes that arise from a Project Review proposal.
