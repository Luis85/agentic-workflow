---
id: PRD-QAW-001
title: Quality Assurance Track
stage: requirements
feature: quality-assurance-workflow
status: accepted
owner: pm
inputs:
  - IDEA-QAW-001
  - RESEARCH-QAW-001
created: 2026-04-28
updated: 2026-04-28
---

# PRD — Quality Assurance Track

## Summary

Add an ISO 9001-aligned Quality Assurance Track that guides users through planning, checklist execution, readiness review, and corrective action planning for project execution health.

## Functional requirements (EARS)

### REQ-QAW-001 — Start QA review

- **Pattern:** ubiquitous
- **Statement:** The template shall provide `/quality:start` so a user can open a scoped quality review for a project, portfolio, release, supplier, or active feature.
- **Acceptance:** The command creates or guides creation of `quality/<slug>/quality-state.md` and records scope, objectives, evidence sources, and ISO baseline.
- **Priority:** must
- **Satisfies:** IDEA-QAW-001

### REQ-QAW-002 — Plan QA evidence

- **Pattern:** ubiquitous
- **Statement:** The template shall provide `/quality:plan` so a user can create a quality assurance plan and checklist set before evidence review.
- **Acceptance:** The plan names scope, ISO 9001 areas, evidence sources, readiness criteria, and checklist files.
- **Priority:** must
- **Satisfies:** IDEA-QAW-001, RESEARCH-QAW-001

### REQ-QAW-003 — Execute evidence-backed checklists

- **Pattern:** ubiquitous
- **Statement:** The template shall provide `/quality:check` so a user can execute checklist items with evidence, status, severity, owner, due date, and notes.
- **Acceptance:** Checklist templates include evidence-first fields and preserve gaps as visible items.
- **Priority:** must
- **Satisfies:** IDEA-QAW-001

### REQ-QAW-004 — Review readiness

- **Pattern:** ubiquitous
- **Statement:** The template shall provide `/quality:review` so a user can summarize readiness, nonconformities, risks, and evidence gaps.
- **Acceptance:** The review template supports `ready`, `ready-with-conditions`, `not-ready`, and `blocked` verdicts.
- **Priority:** must
- **Satisfies:** IDEA-QAW-001

### REQ-QAW-005 — Plan corrective action

- **Pattern:** ubiquitous
- **Statement:** The template shall provide `/quality:improve` so a user can convert QA findings into corrective actions and effectiveness checks.
- **Acceptance:** The improvement template tracks source finding, owner, due date, verification method, and status.
- **Priority:** must
- **Satisfies:** IDEA-QAW-001

### REQ-QAW-006 — Avoid certification overclaim

- **Pattern:** unwanted-behaviour
- **Statement:** If the workflow describes ISO 9001 alignment, then it shall state that the track supports readiness and does not grant certification or replace an accredited auditor.
- **Acceptance:** The skill, docs, and commands include the limitation.
- **Priority:** must
- **Satisfies:** RESEARCH-QAW-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-QAW-001 | maintainability | The QA track must use established command, skill, template, sink, generated inventory, and spec traceability patterns. | No bespoke artifact model outside `quality/<slug>/`. |
| NFR-QAW-002 | accuracy | ISO references must be current as of 2026-04-28 and avoid copying protected standard text. | Short labels and official links only. |

## Quality gate

- [x] Functional requirements use EARS.
- [x] Acceptance criteria are testable.
- [x] Certification limitation is explicit.
