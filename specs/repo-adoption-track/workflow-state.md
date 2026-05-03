---
feature: repo-adoption-track
area: ADOPT
current_stage: design
status: active
last_updated: 2026-05-03
last_agent: architect
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
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
| 4. Design | `design.md` | complete |
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
- **7 open clarifications remaining after Stage 4.** CLAR-ADOPT-004, -005, -006, -007, -009, -012, -013, -014, -016, -017, -019, -021, -022, -024 resolved by architect during Part C (design.md C.6 / C.7 / C.11). Items still open and tracked into Stage 5: CLAR-ADOPT-008 (patch-file fallback details), -010 (PR-body template field set), -011 (ADR-0030 slot confirmation at filing time), -015 (language-census mapping), -023 (size pre-check for local paths), -025 (no-LICENSE-file PR-body branch), -026 (inputs/ selection handling). None block Stage 5 outright; -008, -010 block Stage 5 quality gate; -011 blocks the predecessor ADR PR merge.

## Hand-off notes

- 2026-05-03 (architect): Stage 4 Part C (Architecture) complete. `design.md` Part C filled with system overview Mermaid, component-and-responsibility table, data-model schemas (`adoption-state.md`, `parity.md` entry, `enrich-preview.md` entry, `push-record.md`, `.specorator-version`, `presets/manifest.json`), Phase 2 + Phase 4 data-flow sequence diagrams, TypeScript script CLI sketches, key-decisions table, alternatives table, eight-row risks table, and performance/security/observability narrative. Requirements coverage table populated for all 32 REQ-ADOPT-NNN. ADR-0030 (Add Repo Adoption Track as v1.1 opt-in companion track) drafted at `docs/adr/0030-add-repo-adoption-track.md` with status `proposed`; supersedes ADR-0026. ADR-0026 frontmatter updated (`status: superseded`, `superseded-by: [ADR-0030]`); body unchanged. ADR index in `docs/adr/README.md` updated.

  **Clarifications resolved during Part C (recorded in C.6 / C.7 / C.11):** CLAR-ADOPT-004 (keep `.specorator-version`, document v1.2 supersession trigger), -005 (frontmatter + `.claude/settings.json` deny rules; no new mechanism), -006 (`presets/manifest.json` JSON with named-renderer indirection), -007 (path-budget computed; dev validates in spec.md), -009 (branch suffix on collision), -012 (per-phase success contracts table), -013 (truncate to 32 chars at `-` boundary), -014 (resume restarts last phase from scratch), -016 (SHA-256 over CRLF-normalised bytes), -017 (direct edit of parity.md), -019 (idempotency + slug-collision guards complementary), -021 (SSH→HTTPS normalisation in push-adopt.ts), -022 (per-phase commits), -024 (parity-check.ts is the parity validation script).

  **Hand-off to planner (Tasks):**
  1. Stage 5 (Specification, `spec.md`) is unblocked. Architect resolved every Stage 5 blocker listed in the prior hand-off note: -005, -006, -009, -012, -013, -014, -016, -017, -021, -022, -024.
  2. **Open clarifications carried into Stage 5** (planner / pm to resolve in spec.md or before its quality gate):
     - CLAR-ADOPT-008 — patch-file fallback `git format-patch` flag set; `docs/manual-adoption.md` final shape (pm/architect; blocks Stage 5 quality gate).
     - CLAR-ADOPT-010 — `templates/adopt/pr-body.md.tmpl` field set and license-warning interpolation rule (architect; blocks Stage 5 quality gate).
     - CLAR-ADOPT-011 — confirm ADR-0030 slot is still free at filing time (pm/human; blocks the predecessor ADR PR merge).
     - CLAR-ADOPT-015 — file-extension → language-label mapping; metric (count/byte/line) (pm/architect; non-blocking for Stage 4, blocks `spec.md` Phase 1 contract).
     - CLAR-ADOPT-023 — large-repo size pre-check skipped for local-path inputs (pm/architect; spec.md restates the carve-out).
     - CLAR-ADOPT-025 — no-LICENSE-file branch of REQ-ADOPT-028 PR-body interpolation (pm).
     - CLAR-ADOPT-026 — handling of `inputs/` selection (passed to agent? recorded? acknowledged-and-discarded?) (pm/architect).
  3. **Spec.md scope (Stage 5):** the architect intentionally did not write spec.md; that is Stage 5 / planner. The TypeScript script CLI sketches in C.5 and the per-file YAML schemas in C.3 are the contract seeds; spec.md must turn them into full SPEC-ADOPT-NNN entries with pre/post-conditions, observability requirements, and edge-case enumeration (per the architect-agent procedure).
  4. **Implementation prerequisites flagged in design:** `templates/adopt/` directory must be created (housing `AGENTS.md`, `CLAUDE.md`, `package.json.tmpl`, `verify.yml`, `pr-body.md.tmpl`); `presets/manifest.json` and `presets/renderers/` must be created; `.claude/agents/repo-adopter.md` must declare the narrow tool list specified in C.10.2; `.claude/settings.json` deny rules must be added per C.10.2; `adoptions/README.md` folder entry-point ships in same PR (release criterion in PRD).
  5. **PR sequencing:** ADR-0030 ships in this PR set as required by REQ-ADOPT-031 and the chosen Q1 recommendation. Implementation PR opens after this ADR is merged.

- 2026-05-03 (pm/clarify): `/spec:clarify` audit complete. 15 new clarifications surfaced (CLAR-ADOPT-012 through CLAR-ADOPT-026) beyond the original 8. Total open: 23. **One new Stage 4 blocker found: CLAR-ADOPT-018** (accept-template-version conflict entries have no Phase 3 write action — correctness gap). 13 additional Stage 5 blockers. Recommended path: resolve CLAR-ADOPT-018 (user/PM decision) before Stage 4; architect resolves design-decision items during Stage 4; remaining PM-owned items resolved in parallel.

  **AWAITING HUMAN DECISION — CLAR-ADOPT-018 (blocks Stage 4):**
  When a parity conflict is resolved as `accept-template-version`, what does Phase 3 do?
  - **Option A** — Phase 3 handles it: writes template version over the existing file (confirmed overwrite). Phase 3 covers both `status: missing` and `resolution: accept-template-version` entries.
  - **Option B** — Phase 2 handles it: overwrite happens during the parity phase before Phase 3 runs. Phase 3 only handles `status: missing` entries.
  Start next session by saying "CLAR-ADOPT-018: A" or "CLAR-ADOPT-018: B" to unblock Stage 4.

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
- [x] CLAR-ADOPT-004 — Idempotency marker naming. *(resolved 2026-05-03 by architect — see design.md C.6 / C.11. Keep `.specorator-version`; v1.2 supersession to `.specorator/adoption.json` documented as the trigger if post-launch collision rate proves problematic. Phase 1 surfaces unparseable-content collisions per RISK-ADOPT-002.)*
- [x] CLAR-ADOPT-005 — Agent tool-list enforcement mechanism. *(resolved 2026-05-03 by architect — see design.md C.6 / C.10.2. Both: agent frontmatter declares the narrow tool list and Bash allowlist; `.claude/settings.json` adds path-scoped and verb-scoped deny rules. No new enforcement mechanism introduced; not ADR-class.)*
- [x] CLAR-ADOPT-006 — Preset manifest format. *(resolved 2026-05-03 by architect — see design.md C.3.6 / C.6. JSON file at `presets/manifest.json`, named-renderer indirection, optional `extends`, semver-versioned. New language presets in v1.2 add a manifest entry and a renderer file; Phase 3 logic unchanged. REQ-ADOPT-030 satisfied.)*
- [x] CLAR-ADOPT-007 — Windows MAX_PATH validation. *(resolved 2026-05-03 by architect — see design.md C.10.1. Specorator overhead = 22 chars + 32-char slug; 178 chars budgeted for foreign-repo paths under MAX_PATH=260. Adequate for typical repos. Dev validates against a real adoption in spec.md / Stage 7.)*
- [ ] CLAR-ADOPT-008 — Patch-file fallback specification: specify the exact `git format-patch` options for REQ-ADOPT-017, where written instructions live, what they contain, and whether `docs/manual-adoption.md` (referenced in REQ-ADOPT-018 error message) is in scope for v1.1. *(owner: pm/architect; blocks Stage 5)*
- [x] CLAR-ADOPT-009 — Adoption branch name and collision behaviour. *(resolved 2026-05-03 by architect — see design.md C.6. Branch is `adopt/specorator`; on remote-side collision, append numeric suffix (`adopt/specorator-2`, `-3`, …) and record in `push-record.md.branch`. Overwrite rejected on Article IX grounds (force-push is irreversible without explicit human authorisation for the destructive action).)*
- [ ] CLAR-ADOPT-010 — PR body template location and format: specify where the full PR body template lives, what fields it contains, and how Phase 1 license warnings are interpolated into it (REQ-ADOPT-028). *(owner: architect; does not block Stage 4)*
- [ ] CLAR-ADOPT-011 — ADR slot confirmation: verify the next available ADR slot (RISK-005 notes slots 0028/0029 may be pre-claimed); resolve the specific ADR number before opening the predecessor ADR PR (REQ-ADOPT-031). *(owner: pm/human maintainer; blocks predecessor ADR PR)*
- [x] CLAR-ADOPT-012 — Phase success definition. *(resolved 2026-05-03 by architect — see design.md C.7. Per-phase success contracts table specifies the deterministic criteria the conductor evaluates before presenting each gate. Phase 1 with zero findings is valid; Phase 3 generating zero files is valid iff manifest counts justify it; etc.)*
- [x] CLAR-ADOPT-013 — Slug truncation behaviour. *(resolved 2026-05-03 by architect — see design.md C.6 / C.7. Truncate to 32 chars at a `-` boundary in the last 8 characters when one exists; otherwise truncate at exactly 32. NFR-ADOPT-008 phrase "truncation or error" reconciled in favour of truncation; spec.md updates the NFR wording to reflect the choice.)*
- [x] CLAR-ADOPT-014 — Resumption scope. *(resolved 2026-05-03 by architect — see design.md C.6 / C.7. (a) Both interrupted and deliberate aborts produce `phase_status: gate_blocked` at the last completed phase; same `/adopt:start <url>` invocation resumes both; only `--refresh` distinguishes a deliberate restart. (b) Resume restarts the last phase from scratch — no mid-phase resumption. (c) Missing clone with recorded `clone_sha` triggers re-clone at that SHA; if the SHA cannot be fetched, surface the failure and offer `--refresh`.)*
- [ ] CLAR-ADOPT-015 — REQ-ADOPT-005 — Language census semantics: no mapping from file extension to language label; no behaviour for binary/config-only repos; no stated metric (file count, byte count, line count). Phase 3 preset selection depends on this signal but the linkage is not stated. *(owner: pm/architect; does not block Stage 4)*
- [x] CLAR-ADOPT-016 — Conflict comparison semantics. *(resolved 2026-05-03 by architect — see design.md C.6 / C.7. SHA-256 over CRLF-normalised, BOM-stripped, trailing-newline-normalised bytes. `parity.md` entry's `notes` field records `"CRLF normalisation applied"` when the foreign-repo bytes differed only by line endings. Superset detection not attempted; foreign superset is classified `conflict` and the human resolves via `parity.md`. Semantic comparison deferred to v1.2.)*
- [x] CLAR-ADOPT-017 — Manual-merge clearing mechanism. *(resolved 2026-05-03 by architect — see design.md C.6. Human edits `parity.md` directly, changing `resolution: manual-merge-needed` to either `accept-template-version` or `skip-this-file`. Phase 4 gate verifies zero `manual-merge-needed` entries remain before the irreversible push prompt. No dedicated `/adopt:resolve` command in v1.1.)*
- [x] CLAR-ADOPT-018 — REQ-ADOPT-009 — accept-template-version has no Phase 3 counterpart. RESOLVED 2026-05-03 (human: Option A): Phase 3 handles the overwrite. REQ-ADOPT-032 added — Phase 3 overwrites files with `resolution: accept-template-version` with the canonical template version and lists them in enrich-preview.md with `overwrite (accept-template-version)` notation. REQ-ADOPT-009 acceptance criterion updated to narrow the "no conflict overwritten" guard to `skip-this-file`, `manual-merge-needed`, and `TBD` resolutions only.
- [x] CLAR-ADOPT-019 — Idempotency-vs-abandonment coverage. *(resolved 2026-05-03 by architect — see design.md C.6. The two guards are complementary: `.specorator-version` exists ↔ adoption *completed* (REQ-ADOPT-014); `adoptions/<slug>/` exists ↔ adoption *started* (REQ-ADOPT-024). Together they cover all four states (never started / started-and-abandoned / completed / completed-and-refresh-requested). Resumption (REQ-ADOPT-004) covers abandoned adoptions via the slug-collision flow's `[2] Resume the existing adoption` option.)*
- [x] CLAR-ADOPT-020 — REQ-ADOPT-015 — Commit set boundary resolved by CLAR-ADOPT-018 Option A: the Phase 4 commit set is `status: missing` generated files + `accept-template-version` overwritten files + `.specorator-version`. REQ-ADOPT-015 acceptance criterion will be updated during Stage 5 (spec) to enumerate these three categories explicitly.
- [x] CLAR-ADOPT-021 — SSH remote URL handling. *(resolved 2026-05-03 by architect — see design.md C.3.1 / C.6. `push-adopt.ts` normalises SSH URLs (`git@github.com:owner/repo.git`) to HTTPS-equivalent form before applying the host check; `upstream_normalised_url` field in `adoption-state.md` records the canonical form. SSH-using adopters are *not* routed to the patch-fallback path.)*
- [x] CLAR-ADOPT-022 — Commit timing and atomicity. *(resolved 2026-05-03 by architect — see design.md C.6. Per-phase commits: each phase's artifacts are committed to the template repo immediately on phase completion, before the next gate is presented. This makes every gate boundary an atomic recovery point and reconciles with REQ-ADOPT-027 (orphan prevention) and NFR-ADOPT-013 (no inconsistent state). Single end-of-run commit rejected because it would break resumability on mid-pipeline aborts.)*
- [ ] CLAR-ADOPT-023 — REQ-ADOPT-025 — Size check for local-path input: GitHub API / git remote info is unavailable for local paths (REQ-ADOPT-002 second case). Whether the large-repo warning is skipped for local paths is not specified. *(owner: pm/architect; does not block Stage 4)*
- [x] CLAR-ADOPT-024 — Parity validation script. *(resolved 2026-05-03 by architect — see design.md C.2 / C.5 / C.6. `parity-check.ts` is the parity validation script — the same script Phase 2 uses to generate `parity.md`. `enrich-generate.ts` re-invokes `parity-check.ts` post-generation; on any `conflict` entry among the files Phase 3 wrote, `enrich-generate.ts` exits 6, removes every Phase-3-written file from the working tree, writes failure diagnostics into `enrich-preview.md.parity_validation.failures`, and the conductor re-presents the Phase 3 gate per REQ-ADOPT-026. Reusing one script for both generation and validation eliminates a class of inconsistency.)*
- [ ] CLAR-ADOPT-025 — REQ-ADOPT-028 — No-license-file case for PR body warning: REQ-ADOPT-028 interpolates a Phase 1 license warning "if a license warning was emitted." No LICENSE file present is not classified as a warning or non-warning case, leaving one branch of the PR body acceptance criterion unverifiable. *(owner: pm; does not block Stage 4)*
- [ ] CLAR-ADOPT-026 — REQ-ADOPT-029 — inputs/ selection handling undefined: the conductor asks which inputs items are relevant but no requirement states what it does with the answer (pass to Phase 1 agent? store in adoption-state.md? acknowledge and discard?). Acceptance criterion satisfied by any UI that asks the question regardless of handling. *(owner: pm/architect; does not block Stage 4)*
