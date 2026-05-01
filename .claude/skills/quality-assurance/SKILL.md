---
name: quality-assurance
description: Run ISO 9001-aligned QA workflow — plan, execute, review, improve via evidence-backed checklists. Triggers "quality assurance", "ISO 9001 readiness", "delivery readiness", "corrective actions".
argument-hint: "<phase> <quality-review-slug>"
---

# Quality Assurance

Use this skill to guide a project, portfolio, release, or feature through an ISO 9001-aligned quality assurance workflow. The goal is to determine whether project execution is controlled enough to deliver a quality product, then turn gaps into corrective actions.

This skill supports readiness and evidence gathering. It does not certify the organization, replace an accredited auditor, or reproduce ISO standard text.

## ISO baseline

As of 2026-04-28, ISO 9001:2015 remains the current published ISO 9001 requirements edition, with ISO 9001:2015/Amd 1:2024 listed by ISO and ISO/FDIS 9001 under development for a future edition. Use clause labels and the team's own evidence questions; do not copy standard text.

Reference: <https://www.iso.org/standard/62085.html>

## Phases

| Phase | Command | Primary outputs |
|---|---|---|
| Start | `/quality:start <slug> [scope]` | `quality/<slug>/quality-state.md` |
| Plan | `/quality:plan <slug>` | `quality-plan.md`, `checklists/project-execution.md` |
| Check | `/quality:check <slug>` | Completed checklist evidence and gap statuses |
| Review | `/quality:review <slug>` | `quality-review.md` |
| Improve | `/quality:improve <slug>` | `improvement-plan.md` |

## Review dimensions

Tailor every checklist to the scope, but keep these dimensions visible:

- Context and interested parties.
- Leadership, roles, responsibilities, and quality policy alignment.
- Planning, risks, opportunities, and quality objectives.
- Support: resources, competence, awareness, communication, documented information.
- Operation: requirements, design, development, controls, suppliers, release readiness.
- Performance evaluation: monitoring, measurement, internal review, customer satisfaction, audit evidence.
- Improvement: nonconformity, corrective action, continual improvement.

## Checklist item format

Every check uses this evidence-first shape:

```markdown
- [ ] QA-<AREA>-NNN — <question>
  - ISO 9001 area: <short label only>
  - Evidence required: <file, command, meeting record, approval, metric, or checklist>
  - Status: open | satisfied | gap | nonconformity | not-applicable
  - Severity: S1 | S2 | S3 | S4
  - Owner: <role/person>
  - Due: YYYY-MM-DD | n/a
  - Evidence: <links or "none yet">
  - Notes: <short rationale>
```

## Procedure

0. **Intake gate.** List `inputs/` non-recursively before scoping. Surface every item via a single `AskUserQuestion`: "I see N items in `inputs/`. Which are relevant for this quality review?" Common QA inputs: prior audit reports, supplier evidence packs, customer complaints, regulator letters, certificate copies. Never auto-extract archives. Cite paths into `inputs/` from `quality-plan.md` and checklist evidence fields. Full contract: [`docs/inputs-ingestion.md`](../../../docs/inputs-ingestion.md). Decision: [ADR-0017](../../../docs/adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md).
1. **Start.** Establish scope, product/service boundary, interested parties, applicable lifecycle/project artifacts, quality objectives, and evidence locations. Record whether this is internal readiness, supplier assurance, release readiness, or formal audit preparation.
2. **Plan.** Create a quality plan and checklist set. Derive checks from scoped artifacts instead of using only generic ISO labels.
3. **Check.** Execute checklist items against evidence. Run deterministic verification where available. Record gaps plainly and keep open items visible.
4. **Review.** Summarize readiness, nonconformities, risks, and evidence gaps. Use `ready`, `ready-with-conditions`, `not-ready`, or `blocked`.
5. **Improve.** Convert findings into corrective actions, assign owners, define effectiveness checks, and link actions into the active project/spec/release artifacts.

## Severity guide

- `S1` — delivery should stop: missing product requirements, uncontrolled release, severe compliance/security/data risk, or no owner for a critical nonconformity.
- `S2` — delivery at risk unless corrected before the next gate.
- `S3` — manageable gap with an owner and follow-up date.
- `S4` — improvement opportunity or minor documentation cleanup.

## Reporting

Report:

- quality review path,
- readiness verdict,
- S1/S2 findings count,
- verification commands run,
- corrective actions opened,
- remaining evidence gaps.

For a deterministic KPI snapshot before or during the review, use the `quality-metrics` skill or run:

```bash
npm run quality:metrics
```

## Do not

- Do not claim ISO certification or external audit approval.
- Do not quote long ISO text or embed copyrighted standard content.
- Do not hide a gap by marking it `not-applicable` without a rationale.
- Do not close corrective actions without an effectiveness check.
