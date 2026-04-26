# Traceability

Every artifact links back to its inputs. The chain:

```
Requirement (REQ-X-NNN)
  └── Spec item (SPEC-X-NNN)
        └── Task (T-X-NNN)
              └── Code (file:line, commit SHA)
                    └── Test (TEST-X-NNN)
                          └── Review finding (R-X-NNN, optional)
```

## ID scheme

| Kind | Pattern | Example |
|---|---|---|
| Idea | `IDEA-<AREA>-NNN` | `IDEA-AUTH-001` |
| Research | `RESEARCH-<AREA>-NNN` | `RESEARCH-AUTH-001` |
| PRD (document) | `PRD-<AREA>-NNN` | `PRD-AUTH-001` |
| Requirement (per-item, in PRD) | `REQ-<AREA>-NNN` | `REQ-AUTH-001` |
| NFR (per-item, in PRD) | `NFR-<AREA>-NNN` | `NFR-AUTH-002` |
| Design (document) | `DESIGN-<AREA>-NNN` | `DESIGN-AUTH-001` |
| Spec (document) | `SPECDOC-<AREA>-NNN` | `SPECDOC-AUTH-001` |
| Spec item (per-item, in spec) | `SPEC-<AREA>-NNN` | `SPEC-AUTH-001` |
| Tasks (document) | `TASKS-<AREA>-NNN` | `TASKS-AUTH-001` |
| Task (per-item, in tasks) | `T-<AREA>-NNN` | `T-AUTH-014` |
| Implementation log | `IMPL-LOG-<AREA>-NNN` | `IMPL-LOG-AUTH-001` |
| Test plan | `TESTPLAN-<AREA>-NNN` | `TESTPLAN-AUTH-001` |
| Test report | `TESTREPORT-<AREA>-NNN` | `TESTREPORT-AUTH-001` |
| Test (per-item, in plan/report) | `TEST-<AREA>-NNN` | `TEST-AUTH-007` |
| Review | `REVIEW-<AREA>-NNN` | `REVIEW-AUTH-001` |
| Review finding (per-item) | `R-<AREA>-NNN` | `R-AUTH-002` |
| Release notes | `RELEASE-<AREA>-NNN` | `RELEASE-AUTH-001` |
| Retrospective | `RETRO-<AREA>-NNN` | `RETRO-AUTH-001` |
| Traceability matrix | `RTM-<AREA>-NNN` | `RTM-AUTH-001` |
| Checklist | `CHECKLIST-<AREA>-NNN` | `CHECKLIST-AUTH-001` |
| ADR | `ADR-NNNN` | `ADR-0007` |
| Risk | `RISK-NNN` | `RISK-014` |
| Clarification | `CLAR-NNN` | `CLAR-014` |

`<AREA>` is a short feature/domain code (e.g., `AUTH`, `PAY`, `SEARCH`). Pick one when starting the feature; record it in `workflow-state.md`.

`NNN` is a zero-padded sequence within the area, never reused.

## YAML frontmatter and body markup

Traceability is mechanical because IDs live in two predictable places — never in prose:

- **Document-level YAML frontmatter** at the top of every artifact (the example below).
- **Per-item entries in body**, for multi-item artifacts: REQs in `requirements.md` use `### REQ-<AREA>-NNN` headings; SPEC items in `spec.md` use `### SPEC-<AREA>-NNN` headings; tasks in `tasks.md` use `### T-<AREA>-NNN` headings; cross-links use `Satisfies:`, `Depends on:`, `Links:` fields directly under each heading.

The RTM generator parses both — frontmatter for document-level metadata, marked-up headings and fields for per-item links.

Document-level frontmatter shape (this is a PRD; substitute the right document prefix for other artifacts — `DESIGN-`, `SPECDOC-`, `TASKS-`, `TESTPLAN-`, etc.):

```yaml
---
id: PRD-AUTH-001         # document prefix — distinct from per-item REQ-/SPEC-/T-/TEST- IDs
title: Auth redesign — PRD
stage: requirements
feature: auth-redesign
status: accepted          # draft | proposed | accepted | superseded
owner: pm
inputs:                   # IDs of upstream documents this artifact derives from
  - IDEA-AUTH-001
  - RESEARCH-AUTH-001
created: 2026-04-26
updated: 2026-04-26
---
```

Per-item entries inside the document use marked-up headings (e.g. `### REQ-AUTH-001 — <title>`); their cross-links to upstream items go in inline `Satisfies:` / `Depends on:` / `Links:` fields under the heading, not in YAML frontmatter.

## Traceability matrix (RTM)

Lives at `specs/<feature>/traceability.md`. Generated mechanically by walking the artifacts and parsing both surfaces above (frontmatter + marked-up body entries). Template at [`templates/traceability-template.md`](../templates/traceability-template.md).

Example shape:

| Req | Spec | Tasks | Code | Tests | Status |
|---|---|---|---|---|---|
| REQ-AUTH-001 | SPEC-AUTH-001 | T-AUTH-013, T-AUTH-014 | `src/auth/reset.ts:42–98` | TEST-AUTH-007, TEST-AUTH-008 | ✅ passing |
| REQ-AUTH-002 | SPEC-AUTH-002 | T-AUTH-015 | `src/auth/lockout.ts:12–60` | TEST-AUTH-009 | ⚠️ 1 failing |

The RTM **must be complete before `/spec:review` exits**. Any row with empty cells is a defect.

## Commit and PR conventions

- Commit messages reference task IDs:
  ```
  feat(auth): add T-AUTH-014 password reset confirmation flow

  Implements REQ-AUTH-001 step 3. See SPEC-AUTH-001 §4.
  ```
- PR titles include the feature slug and the primary REQ:
  ```
  [auth-redesign] REQ-AUTH-001 password reset
  ```
- PR descriptions auto-link to the feature's spec, plan, and RTM.

## Forward and backward checks

- **Forward**: every REQ must end up in the RTM with downstream IDs filled.
- **Backward**: every test, task, and code change must reference an upstream ID. Orphan tests and orphan tasks are defects.

## When IDs change

Don't. IDs are immutable once issued. If a requirement is dropped, mark it `status: superseded` (point to its replacement) or `status: withdrawn` — never delete or renumber.
