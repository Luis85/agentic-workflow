---
title: "Quality Metrics"
folder: "docs"
description: "Interpretation guide for deterministic quality KPI reports."
entry_point: false
---
# Quality Metrics

`npm run quality:metrics` reports deterministic repository health signals from local artifacts. It is a quality-status snapshot, not a productivity score, certification result, or replacement for human acceptance.

## How to run

```bash
npm run quality:metrics
```

Scope to one workflow:

```bash
npm run quality:metrics -- --feature <feature-slug>
```

Use JSON for tooling:

```bash
npm run quality:metrics -- --json
```

## Metric interpretation

| Metric | Meaning | Use it for | Do not use it for | Typical action |
|---|---|---|---|---|
| Overall workflow score | Average of each workflow's stage-aware score. | Repository-level health trend and triage. | Comparing people, teams, or velocity. | Inspect low-scoring workflow rows before acting. |
| Stage score | Evidence expected by the workflow's current stage. Future stages are not treated as defects. | Deciding whether the active stage has enough evidence to proceed. | Claiming the whole lifecycle is complete. | Fill missing current-stage artifacts, trace links, or required metadata. |
| Lifecycle artifacts | Completion across all canonical lifecycle artifacts. | Understanding total lifecycle progress. | Penalizing active features that have not reached later stages. | Use as progress context, not a readiness gate. |
| Expected artifacts | Completion for artifacts expected up to the current stage. | Current-stage readiness. | Hiding skipped artifacts without rationale. | Create or complete the current stage artifact, or document an allowed skip. |
| Frontmatter | Workflow artifacts with required metadata. | Mechanical traceability and automation readiness. | Judging artifact content quality. | Add missing frontmatter fields and rerun `npm run check:frontmatter`. |
| Req chain | Requirement links expected by the current stage: specs at Specification, tasks at Tasks, tests at Testing. | Detecting traceability gaps at the right time. | Requiring tests before the Testing stage. | Add missing `Satisfies:` or `Requirement:` links in the owning artifact. |
| Test coverage | Requirements with downstream test IDs once Testing is expected. | Testing-stage readiness and review preparation. | Measuring runtime code coverage or test quality. | Add test-plan/report entries mapped to requirement IDs. |
| EARS | Functional requirements with EARS-style structure once Requirements is expected. | Requirements quality and testability. | Guaranteeing requirements are complete or correct. | Rewrite vague requirements before downstream work proceeds. |
| Blocks | Explicit blockers in workflow state. | Escalation and planning. | Treating absence of blockers as proof of readiness. | Resolve, owner, or escalate the blocker. |
| Clarifications | Open questions in workflow state. | Human decision queue. | Deferring unanswered scope or requirement gaps. | Answer or convert to a tracked requirement/risk. |
| QA checklist gaps | `gap` and `nonconformity` statuses under `quality/`. | QA readiness and corrective-action planning. | ISO certification claims. | Assign owners, due dates, and effectiveness checks. |

## Stage-aware scoring

Stage score avoids false negatives while a workflow is legitimately in progress:

- before Requirements, EARS and downstream traceability are not scored;
- at Specification, requirement-to-spec links are expected;
- at Tasks, requirement-to-task links are expected;
- at Testing and later, requirement-to-test links are expected;
- when a workflow is `done`, all lifecycle evidence is expected.

The lifecycle artifact percentage remains visible so readers can still see total progress across all 11 stages.

## Guardrails

- Metrics are local repository evidence only.
- Metrics do not measure individual productivity.
- Metrics do not replace quality gates, critic review, stage-owner judgment, or release acceptance.
- Metrics do not grant ISO 9001 certification or external audit approval.
- Thresholds are project policy. Treat hard pass/fail thresholds as configuration, not universal truth.
