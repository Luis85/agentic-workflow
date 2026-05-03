---
id: PRD-PRV-001
title: Project-review workflow requirements
status: complete
created: 2026-05-03
inputs:
  - IDEA-PRV-001
---

# Requirements — Project-review workflow

## Functional requirements

### REQ-PRV-001 — Review project evidence

- **Statement:** WHEN a maintainer starts a project review, THE workflow SHALL inspect scoped project artifacts, git history, pull requests, issues, CI signals, and retrospectives as evidence sources.
- **Satisfies:** IDEA-PRV-001

### REQ-PRV-002 — Capture learnings

- **Statement:** WHEN review evidence has been inspected, THE workflow SHALL document strengths, friction, risks, root-cause hypotheses, and open questions with evidence links.
- **Satisfies:** IDEA-PRV-001

### REQ-PRV-003 — Propose improvements

- **Statement:** WHEN findings are available, THE workflow SHALL summarize improvement proposals with expected benefit, effort, affected surfaces, risk, owner, success signal, and first draft PR candidacy.
- **Satisfies:** IDEA-PRV-001

### REQ-PRV-004 — Create issue and draft PR

- **Statement:** WHEN the reviewer reaches handoff and GitHub access is available, THE workflow SHALL open a tracking issue and a first draft PR from a dedicated topic worktree.
- **Satisfies:** IDEA-PRV-001

### REQ-PRV-005 — Preserve branch hygiene

- **Statement:** WHEN the workflow creates implementation work, THE workflow SHALL create and use a dedicated worktree instead of editing the integration checkout directly.
- **Satisfies:** IDEA-PRV-001

### REQ-PRV-006 — Reuse existing quality sink

- **Statement:** WHEN project-review artifacts are persisted, THE workflow SHALL store them under `quality/<review-slug>/` so the change does not add a new top-level intake folder.
- **Satisfies:** IDEA-PRV-001

## Non-goals

- No mandatory lifecycle stage.
- No automatic merging.
- No forced branch deletion or history rewrite.
- No replacement for feature-level retrospectives.

## Acceptance criteria

- The workflow is documented in `docs/project-review-workflow.md`.
- Slash commands exist for start, plan, inspect, synthesize, propose, and handoff.
- A `project-reviewer` agent and `project-review` conductor skill describe boundaries.
- Templates exist for state, plan, history review, findings, and proposals.
- `docs/specorator.md`, `docs/workflow-overview.md`, `docs/sink.md`, `AGENTS.md`, and skill catalog references are updated.
