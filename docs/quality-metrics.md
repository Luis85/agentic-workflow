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

Claude workflow command:

```bash
/quality:status [--feature <feature-slug>] [--compare] [--save] [--json]
```

Persist a timestamped baseline snapshot:

```bash
npm run quality:metrics -- --save
```

Compare the current report with the latest saved baseline for the same scope:

```bash
npm run quality:metrics -- --compare
```

## Metric interpretation

| Metric | Meaning | Use it for | Do not use it for | Typical action |
|---|---|---|---|---|
| Overall workflow score | Average of each workflow's stage-aware score. | Repository-level health trend and triage. | Comparing people, teams, or velocity. | Inspect low-scoring workflow rows before acting. |
| Maturity assessment | Evidence-backed adoption level from local workflow, metadata, traceability, testing, and QA review signals. | Choosing the next realistic process improvement. | Certification, compliance claims, or ranking teams. | Work the stated next step and preserve evidence. |
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

## Trend snapshots

`--save` writes the current machine-readable report under `quality/metrics/<scope>/<timestamp>.json`. Scope is repository-wide by default, or feature-specific when `--feature <slug>` is present.

`--compare` reads the latest saved snapshot for the same scope and adds a trend section with deltas for:

- overall workflow score,
- maturity level,
- workflow states scanned,
- active blockers,
- open clarifications,
- Markdown frontmatter gaps,
- QA checklist gaps or nonconformities.

Use trends to spot drift or improvement between reviews. Do not treat a single delta as root-cause evidence; inspect the underlying workflow rows and attention signals before acting.

## Agent awareness

The `quality-metrics` skill and `/quality:status` command make KPI evidence available to agents at workflow handoffs:

- Orchestrator recommends status checks when readiness or next action is unclear.
- QA incorporates feature-scoped blockers, clarifications, traceability, and test evidence gaps into test planning/reporting.
- Reviewer uses JSON metrics as deterministic evidence before writing a verdict.
- Release manager checks feature-scoped quality status or trend before release readiness.
- Retrospective saves a post-learning baseline so future work can compare drift.
- Project, roadmap, and portfolio agents can consume JSON snapshots in status and planning artifacts.

Agents must cite the snapshot timestamp or command output they used. If no snapshot is available, they report it as missing evidence rather than inventing KPI values.

## Stage-aware scoring

Stage score avoids false negatives while a workflow is legitimately in progress:

- before Requirements, EARS and downstream traceability are not scored;
- at Specification, requirement-to-spec links are expected;
- at Tasks, requirement-to-task links are expected;
- at Testing and later, requirement-to-test links are expected;
- when a workflow is `done`, all lifecycle evidence is expected.

The lifecycle artifact percentage remains visible so readers can still see total progress across all 11 stages.

Open clarification signals count only unresolved checklist entries (`- [ ]`) under `## Open clarifications`. Resolved entries (`- [x]`) remain in the artifact history but do not count as active risks. Active workflows may carry unresolved clarifications as advisory signals; workflows marked `status: done` fail deterministic validation until all clarification checkboxes are resolved.

## Maturity model

The maturity assessment is an adoption guide. It uses observable repository evidence and reports the highest level currently supported by that evidence.

| Level | Name | Entry evidence | Next step |
|---:|---|---|---|
| 0 | Uninstrumented | No workflow-state files are present. | Create at least one workflow-state file through the relevant track. |
| 1 | Documented | Workflow state exists and required Markdown metadata is readable. | Keep workflow state current and run metrics regularly. |
| 2 | Managed | Stage-aware score is at least 80% and required metadata is complete. | Close blockers and clarifications, then strengthen traceability. |
| 3 | Traceable | Stage-aware requirement-chain coverage is at least 80%. | Drive completed workflows through testing and review evidence. |
| 4 | Verified | Completed workflows include downstream test evidence. | Add QA reviews and corrective-action evidence. |
| 5 | Improving | Quality reviews exist and open QA checklist gaps are cleared. | Use `--save` and `--compare` trend snapshots or periodic reviews to watch drift. |

The maturity level should always be read with its evidence and gaps. A repository can have a high maturity level and still have open clarifications or active work that needs attention.

## Guardrails

- Metrics are local repository evidence only.
- Metrics do not measure individual productivity.
- Metrics do not replace quality gates, critic review, stage-owner judgment, or release acceptance.
- Metrics do not grant ISO 9001 certification or external audit approval.
- Maturity levels describe repository evidence, not team capability or individual performance.
- Thresholds are project policy. Treat hard pass/fail thresholds as configuration, not universal truth.
