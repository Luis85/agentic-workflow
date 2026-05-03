---
feature: repo-adoption-track
area: ADOPT
current_stage: requirements
status: active
last_updated: 2026-05-03
last_agent: pm
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: pending
  spec.md: pending
  tasks.md: pending
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — repo-adoption-track

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | pending |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- **ADR-0030 required before implementation begins.** REQ-ADOPT-031 codifies this as a must requirement. The predecessor ADR PR must be merged before the implementation PR opens. CLAR-ADOPT-011 tracks slot confirmation.
- **23 open clarifications (CLAR-ADOPT-004 through CLAR-ADOPT-026) must be resolved before Stage 5 (Specification).** CLAR-ADOPT-018 (accept-template-version has no Phase 3 counterpart) also blocks Stage 4. Items that block Stage 5: 004 (idempotency marker), 005 (agent enforcement), 006 (preset manifest), 008 (patch-file fallback), 009 (branch collision), 012 (phase success definition), 013 (slug truncation), 014 (resumption scope), 016 (conflict comparison semantics), 017 (manual-merge clearing), 020 (commit set boundary), 021 (SSH remote guard), 022 (commit timing), 024 (parity validation script).

## Hand-off notes

- 2026-05-03 (pm/clarify): `/spec:clarify` audit complete. 15 new clarifications surfaced (CLAR-ADOPT-012 through CLAR-ADOPT-026) beyond the original 8. Total open: 23. **One new Stage 4 blocker found: CLAR-ADOPT-018** (accept-template-version conflict entries have no Phase 3 write action — correctness gap). 13 additional Stage 5 blockers. Recommended path: resolve CLAR-ADOPT-018 (user/PM decision) before Stage 4; architect resolves design-decision items during Stage 4; remaining PM-owned items resolved in parallel. Next: present clarification summary to human maintainer for triage.

- 2026-05-03 (pm): `requirements.md` complete (PRD-ADOPT-001, status: draft). Summary for architect (Stage 4):

  **Must-have requirements count:** 28 must-priority functional requirements (REQ-ADOPT-001 through REQ-ADOPT-029 and REQ-ADOPT-031, minus REQ-ADOPT-025 which is `should` and REQ-ADOPT-030 which is `must`). Full count: 30 must, 1 should.

  **NFR coverage (14 NFRs):** performance (NFR-ADOPT-001, 002), reliability (003, 004), security (005, 006), portability (007, 008), usability (009, 010), traceability (011, 012), operability (013, 014).

  **EARS pattern distribution:** Ubiquitous 18, Event-driven 4, Unwanted behaviour 8, Optional feature 1, State-driven 0.

  **Open clarifications for architect (8 items):**
  - CLAR-ADOPT-004 — Idempotency marker name validation (architect; does not block Stage 4)
  - CLAR-ADOPT-005 — Agent tool-list enforcement mechanism (architect; blocks Stage 5)
  - CLAR-ADOPT-006 — Preset manifest format and schema (architect; blocks Stage 5)
  - CLAR-ADOPT-007 — Windows MAX_PATH slug-length validation (architect/dev; does not block Stage 4)
  - CLAR-ADOPT-008 — Patch-file fallback specification and `docs/manual-adoption.md` scope (pm/architect; blocks Stage 5)
  - CLAR-ADOPT-009 — Adoption branch name and collision behaviour (architect; blocks Stage 5)
  - CLAR-ADOPT-010 — PR body template location and format (architect; does not block Stage 4)
  - CLAR-ADOPT-011 — ADR slot confirmation (pm/human maintainer; blocks predecessor ADR PR)

  **Key corrections from idea.md carried into requirements:**
  - Working tree location corrected from `.worktrees/adopt-<slug>/` to `adoptions/<slug>/repo/` (REQ-ADOPT-003).
  - Idempotency marker named `.specorator-version` with PM rationale recorded in REQ-ADOPT-013; architect to validate collision risk.

  **`/spec:clarify` recommended** before Stage 4 design is committed; the 8 open clarifications are surfaced above. None block Stage 4 outright but the architect benefits from resolving all before producing the design document.

- 2026-05-03 (analyst): `research.md` complete. Recommended alternative: **Alternative A — Agent-orchestrated four-phase skill** (conductor skill + specialist agent + three TypeScript scripts + `adoptions/<slug>/` state directory). Reasons: strongest constitutional fit (Articles VI, VII, IX); consistent with all 12 existing track shapes; agent judgment concentrated at the phases that need it (Phase 1 conflict classification, Phase 3 preset selection).

  Items still needing validation before Stage 3 can close:
  1. **Agent tool list scope** — the path-scope gap in `.claude/settings.json` enforcement (the deny rules do not cover foreign-repo paths) must be resolved by the architect. This is potentially ADR-class.
  2. **ADR-0030 filing and acceptance** — blocking dependency. Recommend a dedicated predecessor PR. PM to confirm with human maintainer.
  3. **`verify.yml` opt-in mechanics** — the exact Phase 3 UI for CI workflow installation must be specified as acceptance criteria.
  4. **Idempotency marker naming** — `.specorator-version` vs. `.specorator/adoption.json`. Architect decision.
  5. **Preset manifest format** — must support future language presets without changing Phase 3 logic. Architect decision.
  6. **Windows MAX_PATH constraint** — maximum slug length must be defined. Architect/dev decision.
  7. **Patch-file fallback specification** — for GitHub repos where push access is unavailable. PM/architect decision.
  8. **Working tree location** — `idea.md`'s `.worktrees/adopt-<slug>/` framing is incorrect (a foreign-repo clone is not a git worktree of the template repo). Correct to `adoptions/<slug>/repo/` in Requirements.

  Superpowers design spec (`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`) was not on `feat/repo-adoption-track` at research time; cherry-picked from `docs/repo-adoption-track-design` after Stage 2 commit. Now available as prior-art research input for Stage 4 (architect) — Q1–Q10 there are hypotheses, not binding architecture. The matching plan draft (`docs/superpowers/plans/2026-05-03-repo-adoption-track.md`) was deleted as obsolete (wrong shape — no REQ/T IDs, no traceability; superseded by the Specorator stages).

- 2026-05-03 (analyst): `idea.md` complete. See prior research agenda bullet in this section for full detail.

## Open clarifications

- [x] CLAR-ADOPT-001 — ADR sequencing: should ADR-0030 be filed in a predecessor PR before implementation, or bundled with the implementation PR? *(resolved 2026-05-03 — see research.md §Q1. Recommendation: file ADR-0030 in a dedicated predecessor PR before implementation begins. No sister-track precedent exists for this pattern, but ADR-0030 supersedes a freeze decision, making early filing lower-risk than normal.)*
- [x] CLAR-ADOPT-002 — CI port-over scope: does Phase 3 enrichment install `verify.yml` or equivalent into the adopted repository, and how are conflicts with existing CI handled? *(resolved 2026-05-03 — see research.md §Q2. Recommendation: install `verify.yml` as an opt-in Phase 3 enrichment step, explicitly gated with human approval. Foreign-repo CI conflicts surfaced in adoption state; not silently resolved.)*
- [x] CLAR-ADOPT-003 — Language-specific renderer breadth: one generic enrichment preset vs. specialised Node/Python presets for v1.1? *(resolved 2026-05-03 — see research.md §Q3. Recommendation: ship v1.1 with one generic preset (always) and one optional Node/TypeScript preset (proposed but not auto-installed). Python-specific enrichment deferred to v1.2.)*
- [ ] CLAR-ADOPT-004 — Idempotency marker naming: validate that `.specorator-version` (PM's chosen name per REQ-ADOPT-013) does not have a meaningful collision rate in real foreign repositories. If collision is observed at scale, fall back to `.specorator/adoption.json`. *(owner: architect; does not block Stage 4)*
- [ ] CLAR-ADOPT-005 — Agent tool-list enforcement mechanism: specify whether the adoption agent's restricted Bash allowlist (REQ-ADOPT-021) is enforced via agent definition file frontmatter, `.claude/settings.json` deny rules, or both; assess whether a new enforcement mechanism is needed for path-scoped writes (research §Q6 gap). *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-006 — Preset manifest format: specify the schema (file format, location, renderer reference convention, versioning) for the preset manifest that Phase 3 loads at runtime (REQ-ADOPT-030). Must support adding v1.2 language presets without modifying Phase 3 pipeline logic. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-007 — Windows MAX_PATH validation: compute the maximum total path depth for `adoptions/<slug>/repo/<deepest-file>` given the template repository's actual root path and validate the 32-character slug limit (REQ-ADOPT-002, NFR-ADOPT-008). *(owner: architect/dev; does not block Stage 4)*
- [ ] CLAR-ADOPT-008 — Patch-file fallback specification: specify the exact `git format-patch` options for REQ-ADOPT-017, where written instructions live, what they contain, and whether `docs/manual-adoption.md` (referenced in REQ-ADOPT-018 error message) is in scope for v1.1. *(owner: pm/architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-009 — Adoption branch name and collision behaviour: confirm `adopt/specorator` as the branch name (REQ-ADOPT-015); define behaviour when that branch already exists on the foreign remote (append suffix / overwrite / abort). *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-010 — PR body template location and format: specify where the full PR body template lives, what fields it contains, and how Phase 1 license warnings are interpolated into it (REQ-ADOPT-028). *(owner: architect; does not block Stage 4)*
- [ ] CLAR-ADOPT-011 — ADR slot confirmation: verify the next available ADR slot (RISK-005 notes slots 0028/0029 may be pre-claimed); resolve the specific ADR number before opening the predecessor ADR PR (REQ-ADOPT-031). *(owner: pm/human maintainer; blocks predecessor ADR PR)*
- [ ] CLAR-ADOPT-012 — REQ-ADOPT-001 — Phase success definition: "completed successfully" is undefined for each phase. Phase 1 with zero findings is valid; Phase 3 generating zero files (all entries already present) may be degenerate or valid. Without a per-phase success criterion the gate condition cannot be tested. *(owner: pm/architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-013 — REQ-ADOPT-002 — Slug truncation behaviour: NFR-ADOPT-008 says "truncation or error" but REQ-ADOPT-002 says "bounded to a maximum." Two incompatible behaviours; acceptance test cannot be written until one is chosen. *(owner: pm; blocks Stage 5)*
- [ ] CLAR-ADOPT-014 — REQ-ADOPT-004 — Resumption scope: (a) boundary between "interrupted" and "deliberate abort at gate" is not stated; (b) whether resumption restarts last completed phase from scratch or continues mid-phase is not stated; (c) whether a missing clone triggers re-clone is not stated. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-015 — REQ-ADOPT-005 — Language census semantics: no mapping from file extension to language label; no behaviour for binary/config-only repos; no stated metric (file count, byte count, line count). Phase 3 preset selection depends on this signal but the linkage is not stated. *(owner: pm/architect; does not block Stage 4)*
- [ ] CLAR-ADOPT-016 — REQ-ADOPT-007/008 — Conflict comparison semantics: "different content" is not defined (byte-for-byte, checksum, semantic / whitespace-tolerant). Windows CRLF vs. LF would produce false positives under byte comparison. Superset files are unclassified. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-017 — REQ-ADOPT-008 — Manual-merge clearing mechanism: `resolution: manual-merge-needed` blocks Phase 4 "until the human clears it" — but no clearing mechanism is defined (direct parity.md edit? re-present at gate? dedicated command?). Phase 4 gate cannot be implemented without this. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-018 — REQ-ADOPT-009 — accept-template-version has no Phase 3 counterpart: REQ-ADOPT-009 only handles `status: missing` entries. Files whose conflict resolution is `accept-template-version` have no stated Phase 3 write action. This is a correctness gap in the Phase 3 write logic. *(owner: pm; blocks Stage 4)*
- [ ] CLAR-ADOPT-019 — REQ-ADOPT-013/014 — Idempotency guard only catches completed adoptions: `.specorator-version` is written in Phase 4 (REQ-ADOPT-013) but the guard runs at Phase 2 start (REQ-ADOPT-014). A previously started but abandoned adoption (no Phase 4 commit) is not caught. G4 guarantee is partial. *(owner: architect; does not block Stage 4)*
- [ ] CLAR-ADOPT-020 — REQ-ADOPT-015 — Commit set boundary is undefined: "exactly the enriched files from Phase 3 plus .specorator-version" does not state whether `accept-template-version` conflict resolutions contribute files. The word "exactly" implies a closed set but the set is not fully defined. *(owner: pm; blocks Stage 5 — depends on CLAR-ADOPT-018 resolution)*
- [ ] CLAR-ADOPT-021 — REQ-ADOPT-018 — SSH remote URLs not covered: the non-GitHub guard matches on `github.com` as host, which is ambiguous for SSH remotes (`git@github.com:owner/repo.git`). Adopters using SSH would incorrectly trigger the fallback path. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-022 — REQ-ADOPT-020 — Commit timing and atomicity: per-phase commits vs. single end-of-run commit is not stated. REQ-ADOPT-027 (orphan prevention) implies Phase 1 must commit before Phase 2 begins, but this is not stated. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-023 — REQ-ADOPT-025 — Size check for local-path input: GitHub API / git remote info is unavailable for local paths (REQ-ADOPT-002 second case). Whether the large-repo warning is skipped for local paths is not specified. *(owner: pm/architect; does not block Stage 4)*
- [ ] CLAR-ADOPT-024 — REQ-ADOPT-026 — Parity validation script undefined: REQ-ADOPT-026 references a "post-generation parity validation script" that exits non-zero to trigger Phase 3 rollback, but no other requirement defines this script, its location, or its exit codes. Phase 3 rollback path is entirely dependent on an undefined artefact. *(owner: architect; blocks Stage 5)*
- [ ] CLAR-ADOPT-025 — REQ-ADOPT-028 — No-license-file case for PR body warning: REQ-ADOPT-028 interpolates a Phase 1 license warning "if a license warning was emitted." No LICENSE file present is not classified as a warning or non-warning case, leaving one branch of the PR body acceptance criterion unverifiable. *(owner: pm; does not block Stage 4)*
- [ ] CLAR-ADOPT-026 — REQ-ADOPT-029 — inputs/ selection handling undefined: the conductor asks which inputs items are relevant but no requirement states what it does with the answer (pass to Phase 1 agent? store in adoption-state.md? acknowledge and discard?). Acceptance criterion satisfied by any UI that asks the question regardless of handling. *(owner: pm/architect; does not block Stage 4)*
