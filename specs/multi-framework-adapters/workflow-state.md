---
feature: multi-framework-adapters
area: ADAPT            # short uppercase code; used in IDs (REQ-<AREA>-NNN)
current_stage: implementation     # idea | research | requirements | design | specification | tasks | implementation | testing | review | learning
status: active          # active | blocked | paused | done
last_updated: 2026-05-03
last_agent: planner
artifacts:              # canonical machine-readable map; the table below is its human view
  idea.md: complete              # pending | in-progress | complete | skipped | blocked
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: complete
  tasks.md: complete
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — multi-framework-adapters

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`.

## Skips

*(none)*

## Blocks

*(none)*

## Hand-off notes

```
2026-05-03 (orchestrator): Feature bootstrapped. Proceeding to /spec:idea.
2026-05-03 (analyst): Stage 1 complete. idea.md written (IDEA-ADAPT-001, status: accepted). Eight open questions captured for Stage 2 research agenda.
2026-05-03 (analyst): Stage 2 complete. research.md written (RESEARCH-ADAPT-001, status: complete). All 8 research questions answered. Recommendation: Alternative A (static Node.js generation script, on-demand + verify hash check + CI gate). Key open items for pm/architect: (1) mechanism for Codex agent file discovery (fallback filenames vs AGENTS.md reference), (2) generated file naming convention for drift manifest determinism, (3) cursor-doctor as devDependency vs npx. AGENTS.md wording correction for Aider flagged as a separate docs-only follow-up.
2026-05-03 (pm): Stage 3 complete. requirements.md written (PRD-ADAPT-001, status: accepted). 16 functional requirements (REQ-ADAPT-001 through REQ-ADAPT-016) in EARS notation, all must-priority. Three open items from research resolved: (1) Codex discovery via AGENTS.md reference + .codex/agents/INDEX.md (REQ-ADAPT-008), no config.toml changes; (2) naming convention agent-<slug>.mdc / skill-<slug>.mdc / project-conventions.mdc for Cursor, .codex/agents/<slug>.md / .codex/skills/<slug>.md for Codex (REQ-ADAPT-004, REQ-ADAPT-007); (3) cursor-doctor as pinned devDependency in package.json (REQ-ADAPT-013). No open clarifications. Handoff to design.
2026-05-03 (pm): /spec:clarify run against requirements.md. 29 clarifications raised (CLAR-001 through CLAR-029). Blockers: CLAR-011 (REQ-ADAPT-006 vs REQ-ADAPT-002 direct contradiction on header placement), CLAR-016 (REQ-ADAPT-008 vs NG5 direct contradiction on AGENTS.md modification), CLAR-025 (REQ-ADAPT-015 vs REQ-ADAPT-010 internal inconsistency on manifest content). requirements.md not edited; all items surface-only. PRD status remains accepted pending resolution.
2026-05-03 (pm): requirements.md revised (v2) — 29 clarifications resolved, 3 blockers fixed. Ready for design.
2026-05-03 (orchestrator): requirements.md amended (v2.1) — NG9 added (CI-provider-agnostic; no provider-specific files shipped); NFR-ADAPT-001/002 stripped of GitHub Actions hardware reference; NFR-ADAPT-003 scoped to "any release pipeline"; success metric and release criteria updated to reference npm run verify instead of CI-provider-specific steps.
2026-05-03 (architect): Stage 4 complete. design.md filled (DESIGN-ADAPT-001). Parts A/B/C complete. ADRs filed: ADR-0028 (Claude baseline as canonical source for multi-framework adapters), ADR-0029 (additive-only adapter pipeline). Requirements coverage table complete — every REQ-ADAPT-* and NFR-ADAPT-* mapped to one or more design sections. No new clarifications opened. Hand-off to planner (Tasks): no open clarifications; spec.md is the next artifact (architect owns) before tasks; key contracts to specify are the manifest JSON schema (C.3.1), the .mdc frontmatter schema (C.3.2), the Codex header schema (C.3.3), and the two scripts' CLI signatures (exit codes + stdout/stderr per Part B B.4.1–B.4.12).
2026-05-03 (architect): Stage 5 complete. spec.md filled (SPECDOC-ADAPT-001). 10 interfaces (SPEC-ADAPT-001..010), 5 data structures (ManifestObject, CursorFrontmatter, CodexHeader, CheckResult, SizeReport), 23 edge cases (EC-001..023), 40 test scenarios (TEST-ADAPT-001..040). Every spec item traces to ≥ 1 REQ-ADAPT-* ID. Cross-cutting requirements coverage table maps every PRD REQ and NFR to spec sections. State diagram for adapters:sync pipeline included. Performance budgets per-interface. No new clarifications surfaced; ready for planner. Hand-off to planner (Tasks): all upstream artifacts (requirements.md v2.1, design.md, spec.md, ADR-0028, ADR-0029) are stable inputs for task decomposition; tasks should follow the eleven-step C.4.1 sync pipeline plus the seven-step C.4.2 check pipeline as the natural decomposition spine; the cursor-doctor devDependency pinning and the package.json wiring of `adapters:sync` / `adapters:check` / `verify` are atomic implementation tasks; cross-platform parity tests (TEST-ADAPT-036) and performance tests (TEST-ADAPT-037/038) likely warrant their own tasks.
2026-05-03 (analyze): /spec:analyze completed. 7 findings (3 blockers, 4 nice-to-resolve). See ## Analyze findings.
2026-05-03 (pm): /spec:analyze blockers AN-001, AN-003 and nice-to-resolve AN-007 resolved in requirements.md (v2.2).
2026-05-03 (architect): /spec:analyze blocker AN-002 and nice-to-resolve AN-004, AN-005, AN-006 resolved. Design B.5.2/C.4.1 corrected to line 493 with explicit arithmetic; size-projection reordered to in-memory pre-write; spec script_hash STALE format anchored to REQ-ADAPT-011; NFR-ADAPT-004 added to idempotency test Satisfies line.
2026-05-03 (planner): Stage 6 complete. tasks.md filled (TASKS-ADAPT-001). 33 tasks across 10 phases. TDD ordering enforced: every 🧪 test task precedes its 🔨 implementation task for the same SPEC-ADAPT-NNN. Dependency graph (Mermaid) present. Parallelisable batches identified (9 batches). Phase 7 pipeline assembly tasks (T-ADAPT-025, T-ADAPT-026) marked 🪓 may-slice with explicit slice plans. Every REQ-ADAPT-*, SPEC-ADAPT-*, and TEST-ADAPT-* has at least one task in its Satisfies chain. First task to dispatch: T-ADAPT-001 (dev).
```

## Open clarifications

- [x] CLAR-001 — REQ-ADAPT-001: "full set" defined explicitly in REQ-ADAPT-018 (Cursor outputs) and REQ-ADAPT-019 (Codex outputs).
- [x] CLAR-002 — REQ-ADAPT-001: split into three requirements: REQ-ADAPT-001 (read sources), REQ-ADAPT-018 (write Cursor outputs), REQ-ADAPT-019 (write Codex outputs).
- [x] CLAR-003 — REQ-ADAPT-002: acceptance criterion split into two labelled sections: "direct file inspection" and "cursor-doctor validation".
- [x] CLAR-004 — REQ-ADAPT-002: YAML frontmatter validity defined explicitly: `---` delimiters, `description` (non-empty string), `alwaysApply` (boolean), `x-generated: true`, `x-source` (non-empty string), `x-regenerate: "npm run adapters:sync"`.
- [x] CLAR-005 — REQ-ADAPT-003: design language removed; requirement states only observable output values (`alwaysApply: false`, non-empty `description`, no `globs` field).
- [x] CLAR-006 — REQ-ADAPT-020: skill-derived rules specified: `alwaysApply: false`, non-empty `description`.
- [x] CLAR-007 — REQ-ADAPT-004: split into four requirements: REQ-ADAPT-004 (agent naming), REQ-ADAPT-022 (skill naming), REQ-ADAPT-023 (conventions naming), REQ-ADAPT-024 (flat layout).
- [x] CLAR-008 — REQ-ADAPT-025 added: slug collision causes non-zero exit with stderr identifying conflicting paths.
- [x] CLAR-009 — REQ-ADAPT-005: "nearest complete sentence" replaced with: truncate at line 490, append `<!-- TRUNCATED: source exceeded 500 lines -->` as line 491.
- [x] CLAR-010 — REQ-ADAPT-005: statement and criterion now consistently apply the 500-line limit to total file including frontmatter.
- [x] CLAR-011 (blocker) — REQ-ADAPT-006: two-path rule applied. Cursor `.mdc` files use frontmatter custom fields (`x-generated`, `x-source`, `x-regenerate`). Codex `.md` files use HTML comment on line 1.
- [x] CLAR-012 — REQ-ADAPT-007: duplicate Pattern field removed; single canonical "Event-driven" pattern retained.
- [x] CLAR-013 — REQ-ADAPT-007: heading updated to "idempotent overwrite"; generated files are created or overwritten on every sync run.
- [x] CLAR-014 — REQ-ADAPT-026 added: protection rule uses header-presence test, not a finite list; covers all unlabelled files under `.codex/`.
- [x] CLAR-015 — REQ-ADAPT-008: "append" replaced with explicit create-or-overwrite behaviour.
- [x] CLAR-016 (blocker) — REQ-ADAPT-008: script no longer modifies `AGENTS.md`. NG9 added. Manual one-time step documented in REQ-ADAPT-008 PM decision note.
- [x] CLAR-017 — REQ-ADAPT-009: duplicate Pattern field removed.
- [x] CLAR-018 — REQ-ADAPT-027 added: combined size above 32,768 bytes causes non-zero exit identifying contributing files.
- [x] CLAR-019 — REQ-ADAPT-010: duplicate Pattern field removed.
- [x] CLAR-020 — REQ-ADAPT-010: manifest JSON schema defined exactly: `{"generated_at", "script_hash", "sources": [{"path","sha256"}], "outputs": ["<rel-path>"]}`.
- [x] CLAR-021 — REQ-ADAPT-011: "human-readable message" replaced with: "emit to stderr the relative path of each changed or missing source file".
- [x] CLAR-022 — REQ-ADAPT-011: missing output file case added as a fourth acceptance scenario.
- [x] CLAR-023 — REQ-ADAPT-012: "regardless of the order of steps" clause removed; only observable behaviour retained.
- [x] CLAR-024 — REQ-ADAPT-014: folded into REQ-ADAPT-012 as a note; separate EARS statement removed.
- [x] CLAR-025 (blocker) — REQ-ADAPT-010 extended: manifest now records both source paths+hashes AND output paths. REQ-ADAPT-015 rewritten to enumerate output files using the `outputs` array.
- [x] CLAR-026 — REQ-ADAPT-017 added: explicit prohibition on timestamps, random values, and process IDs in generated files.
- [x] CLAR-027 — NFR-ADAPT-001/002: "commodity developer hardware" replaced with: "a machine with a quad-core CPU, 8 GB RAM, and NVMe storage, measured on the CI runner hardware in this repository's GitHub Actions configuration".
- [x] CLAR-028 — NFR-ADAPT-003: test scenario added: run generation script and check script on Windows 11 and macOS/Ubuntu in CI, zero failures.
- [x] CLAR-029 — NFR-ADAPT-006: point-in-time constraint replaced with: "no runtime `dependencies` in `package.json`; `cursor-doctor` in `devDependencies` only".

## Analyze findings — 2026-05-03

### Summary
- Total findings: 7 (3 blockers, 4 nice-to-resolve)
- Stage gate verdict: BLOCKED

### Blockers

1. **AN-001** — Cross-artifact contradiction: manifest `sources[]` membership of generation script
   - **Location:** `requirements.md:366` (REQ-ADAPT-010 acceptance), `requirements.md:377` (REQ-ADAPT-011 statement), `design.md §C.3.1` (lines 1166–1191), `spec.md` `ManifestObject` schema (lines 318–345) and SPEC-ADAPT-007 (lines 219–242).
   - **Description:** REQ-ADAPT-010 acceptance says: "And `sources` contains an entry for every `.md` file under `.claude/agents/`, every `.md` file under `.claude/skills/`, the root `AGENTS.md`, **and the generation script file**". REQ-ADAPT-011 states the check script "shall recompute the SHA-256 hash of each source file *and the generation script* and compare them to the values in the `sources` array". DESIGN C.3.1 and SPEC `ManifestObject` instead place the script under a separate top-level field `script_hash` and explicitly say "The script file is recorded in `script_hash`, not in `sources[]`" (design.md:1188, spec.md:339). SPEC-ADAPT-008 step 2 reflects the design (separate field). This is a real schema-level contradiction — implementations following the requirements will produce a manifest the spec rejects, and vice versa.
   - **Owner:** pm (requirements.md is the source of truth and must be reconciled first; architect updates design/spec to match the chosen wording).
   - **Fix:** Update REQ-ADAPT-010 acceptance bullet at `requirements.md:366` to remove "and the generation script file" from the `sources` enumeration and add a new bullet: "And the document contains a `script_hash` field with the SHA-256 hex digest of `scripts/adapters/generate.mjs`". Update REQ-ADAPT-011 statement at `requirements.md:377` to reference the `script_hash` field instead of "the values in the `sources` array" for the script. Design and spec already match the corrected wording — no change needed there.
   - → Resolved 2026-05-03 (pm): REQ-ADAPT-010 statement and acceptance rewritten to name `script_hash` as a top-level field and explicitly exclude the generation script from `sources[]`; REQ-ADAPT-011 statement rewritten to compare the script hash against the top-level `script_hash` field, not `sources`.

2. **AN-002** — Architect-flagged reconciliation: DESIGN B.5.2 line "492" vs SPEC interpretation "line 493"
   - **Location:** `design.md §B.5.2` (line 992: "truncation marker on line 492 if capped"), `design.md §C.4.1` step 5 (line 1255: "marker on line 492 of the file when capped"), `spec.md` SPEC-ADAPT-005 (lines 177 and 185: file line 493 = 1 + 1 + 490 + 1).
   - **Description:** SPEC explicitly walks the math (line 1 HTML header + line 2 blank + body lines 1–490 + marker = file line 493) and notes that DESIGN B.5.2's "line 492" is being updated. SPEC's arithmetic is correct; design.md is wrong. The discrepancy is currently papered over by SPEC's reconciliation note rather than fixed in the design.
   - **Owner:** architect.
   - **Fix:** Edit `design.md §B.5.2` (line 992) to read "truncation marker on line 493 if capped" and `design.md §C.4.1` step 5 (line 1255) to read "marker on line 493 of the file when capped". Then drop the SPEC-ADAPT-005 reconciliation note (spec.md:185) since design and spec will agree. Canonical statement (per spec.md:185): "the truncation marker always immediately follows source body line 490; the file-relative line number depends on the file type's header overhead — line 491 for `.mdc` files (frontmatter occupies the same number of lines after rendering), line 493 for `.codex/*.md` files (HTML comment on line 1 + blank line 2 + body lines 3–492 + marker on line 493)".
   - → Resolved 2026-05-03 (architect): design.md §B.5.2 and §C.4.1 step 5 corrected to "line 493" with explicit arithmetic (line 1 = HTML comment header, line 2 = blank, lines 3–492 = body 490 source lines max, line 493 = truncation marker).

3. **AN-003** — Silent design change: `adapters:check` "manifest absent" microcopy is reused for malformed-JSON case
   - **Location:** `requirements.md:387–391` (REQ-ADAPT-011 manifest-absent acceptance), `design.md §B.4.10` (lines 893–903), `spec.md` EC-017 (line 537).
   - **Description:** REQ-ADAPT-011 only specifies behaviour when "the manifest does not exist". SPEC EC-017 silently extends this: "Manifest file present but contains malformed JSON or fails schema validation → emits B.4.10 with `kind: \"no-manifest\"`; exit 1. The literal text 'no adapter manifest found' is used; no separate malformed-manifest message exists in v1." This is a new behavioural contract not present in REQ-ADAPT-011 or DESIGN — the user-visible message ("no adapter manifest found at .cursor/rules/.adapter-manifest.json") will be misleading when the manifest is on disk but malformed. Either REQ-ADAPT-011 needs a new acceptance scenario (malformed manifest) or the spec should not collapse the two cases under the same microcopy.
   - **Owner:** pm (decide whether malformed manifest is REQ-ADAPT-011 or a separate REQ); architect updates design/spec to match.
   - **Fix:** Two acceptable options. (1) Add a fifth REQ-ADAPT-011 acceptance scenario "malformed manifest" with its own message ("manifest is present but malformed; run `npm run adapters:sync` to regenerate"), and split DESIGN B.4.10 into two microcopy entries (B.4.10a manifest-absent / B.4.10b malformed). (2) Keep the collapse but amend REQ-ADAPT-011 to state explicitly that "manifest absent" includes structurally invalid manifests, and update DESIGN B.4.10 microcopy to use a phrase like "no usable adapter manifest found" so the message is accurate in both cases. EC-017 in spec.md must be re-grounded to whichever the PM picks.
   - → Resolved 2026-05-03 (pm): Added a 5th acceptance scenario to REQ-ADAPT-011 ("malformed manifest") — exit non-zero, stderr identifies manifest path and parse error, instructs user to run `npm run adapters:sync` to regenerate.

### Nice-to-resolve

4. **AN-004** — DESIGN C.4.1 step 8 contradicts itself on rollback semantics for the 32-KiB hard-fail case
   - **Location:** `design.md §C.4.1` step 8 (line 1258: "no outputs are kept on disk for this run — the script must roll back any partial writes from steps 5–7 before exiting"), `design.md §C.4.3` (line 1280: "Pre-write validation. Slug collisions and Codex size projections are computed before any file is written"), `design.md §A.1` Flow 1 (line 60: "Process exits non-zero", with no rollback specified), `design.md §B.4.6` ("No files are written before this message is emitted"), `spec.md` SPEC-ADAPT-001 errors table (line 69) and EC-011 (line 531: "no Codex outputs persisted (script must roll back any partial writes — see DESIGN C.4.3)").
   - **Description:** The rest of the design says size projection runs before any write (so no rollback is needed), but step 8 puts the size accounting after Codex render steps 5–7 and orders a rollback. EC-011 inherits the rollback wording. The cleaner interpretation matches DESIGN A.1, B.4.6, and C.4.3: project the Codex size from the rendered-in-memory content before writing any output to disk. This needs to be made explicit so the dev agent does not implement a half-written-then-deleted recovery path.
   - **Owner:** architect.
   - **Fix:** Move size accounting (DESIGN C.4.1 step 8) before the render-then-write boundary, or reword steps 5–7 to clarify that Codex outputs are constructed in memory and not yet written. Update SPEC EC-011 (spec.md:531) to drop "no Codex outputs persisted (script must roll back any partial writes …)" and replace with "no Codex outputs are written (size accounting runs on in-memory rendered content before any disk write)". Same for DESIGN C.4.1 step 8.
   - → Resolved 2026-05-03 (architect): design.md §C.4.1 reordered to twelve steps with all rendering (3–7) explicitly in memory, size-projection at step 8 running on in-memory content with no rollback needed, disk writes at step 9, cursor-doctor at step 10, manifest at step 11, summary at step 12; design.md §C.4.3 atomicity bullet updated; spec.md SPEC-ADAPT-001 behaviour text updated to "twelve-step pipeline"; spec.md EC-011 reworded to "no files written ... script exits 1 before disk writes begin"; cross-cutting coverage table step references updated for REQ-ADAPT-010, REQ-ADAPT-013, NFR-ADAPT-007.

5. **AN-005** — `script_hash` mismatch reporting drift between REQ, design, and spec
   - **Location:** `requirements.md:382` (REQ-ADAPT-011 stale-source acceptance: "stderr includes the relative path of each source file whose hash differs from the manifest"), `design.md §B.4.9` (line 884–887: STALE block lists source paths only), `spec.md` SPEC-ADAPT-008 step 2 (line 254: "synthetic 'scripts/adapters/generate.mjs' entry if the script hash changed"), `spec.md` C.4.2 step 4 (line 1270).
   - **Description:** SPEC-ADAPT-008 introduces the convention that a `script_hash` mismatch is reported under the existing STALE block by inserting a synthetic `scripts/adapters/generate.mjs` path into the listed paths. This is a sensible UX choice but is not anchored in REQ-ADAPT-011 or DESIGN B.4.9 — the design's STALE microcopy talks only about "source files". A reader of REQ-ADAPT-011 alone would not know that a `script_hash` change shows up there.
   - **Owner:** architect (update design); pm consulted only if the reporting channel itself needs to change.
   - **Fix:** Add a sentence to DESIGN B.4.9 noting "If the generation script's hash has changed since the manifest was written, the synthetic path `scripts/adapters/generate.mjs` is included in the listed paths." Update DESIGN C.4.2 step 3 (currently absent in design — only spec has C.4.2) by adding an explicit note in DESIGN C.4.2 step 3 to mirror SPEC C.4.2 step 3.
   - → Resolved 2026-05-03 (architect): SPEC-ADAPT-008 step 2 rewritten to make the STALE message format for `script_hash` mismatches explicit — script path rendered into the same B.4.9 STALE block as a source-file mismatch with the indented `  scripts/adapters/generate.mjs` line, inheriting the message format from REQ-ADAPT-011 acceptance scenario 1 ("changed source hash"); a normative note block was added below SPEC-ADAPT-008; the existing `Satisfies: REQ-ADAPT-011, REQ-ADAPT-015` line on SPEC-ADAPT-008 already anchored REQ-ADAPT-011, now reinforced by the explicit format text.

6. **AN-006** — NFR-ADAPT-004 has no direct `Satisfies:` line in any spec/EC/test
   - **Location:** `spec.md:741` (NFR-ADAPT-004 mapped via "REQ-ADAPT-016 / REQ-ADAPT-017" only).
   - **Description:** Every other NFR has at least one TEST-ADAPT-* with an explicit `Satisfies:` line. NFR-ADAPT-004 (idempotency) is satisfied transitively through REQ-ADAPT-016/017 and TEST-ADAPT-019, but no test explicitly cites NFR-ADAPT-004. Acceptable for now (per "implicit if traceable"), but a single explicit cite would close the loop.
   - **Owner:** architect (cosmetic spec edit).
   - **Fix:** Add `NFR-ADAPT-004` to the `Satisfies:` line of TEST-ADAPT-019 (`spec.md:571`) so the requirements coverage table is fully explicit.
   - → Resolved 2026-05-03 (architect): TEST-ADAPT-019 `Satisfies:` line now reads `REQ-ADAPT-016, REQ-ADAPT-017, NFR-ADAPT-004, EC-018`; cross-cutting coverage table entry for NFR-ADAPT-004 also notes "explicitly cited by TEST-ADAPT-019".

7. **AN-007** — REQ-ADAPT-007 vs REQ-ADAPT-016 scoping ambiguity flagged but not contradicted
   - **Location:** `requirements.md:283–294` (REQ-ADAPT-007), `requirements.md:453–464` (REQ-ADAPT-016).
   - **Description:** REQ-ADAPT-007 acceptance says: "running `adapters:sync` a second time produces byte-for-byte identical files to the first run (given unchanged sources)" — that is REQ-ADAPT-016's job. REQ-ADAPT-007 adds an idempotency clause that overlaps with REQ-ADAPT-016. The third bullet duplicates REQ-ADAPT-016's acceptance. Not a contradiction, but two requirements own the same property which makes traceability noisier than necessary.
   - **Owner:** pm (cosmetic requirements clarification).
   - **Fix:** Remove the third acceptance bullet from REQ-ADAPT-007 (`requirements.md:292`) and let REQ-ADAPT-016 own all idempotency assertions; or keep it but add a "see also REQ-ADAPT-016" note. No spec or design changes required.
   - → Resolved 2026-05-03 (pm): Removed duplicate idempotency acceptance bullet from REQ-ADAPT-007 and replaced with "Idempotency on unchanged sources is governed by REQ-ADAPT-016."

### Cleared checks

- REQ coverage (design): every REQ-ADAPT-001/b/c, REQ-ADAPT-002, REQ-ADAPT-003/b/c, REQ-ADAPT-004/b/c/d/e, REQ-ADAPT-005, REQ-ADAPT-006, REQ-ADAPT-007, REQ-ADAPT-026, REQ-ADAPT-008, REQ-ADAPT-009, REQ-ADAPT-027, REQ-ADAPT-010, REQ-ADAPT-011, REQ-ADAPT-012, REQ-ADAPT-013, REQ-ADAPT-015, REQ-ADAPT-016, REQ-ADAPT-017, NFR-ADAPT-001..007 each have ≥1 design section in design.md A.5, B.7, or Cross-cutting coverage tables. (REQ-ADAPT-014 is absent — correctly, since requirements.md:414 folds it into REQ-ADAPT-012.)
- REQ coverage (spec/test/EC): every REQ-ADAPT-* and NFR-ADAPT-* listed in PRD has ≥1 SPEC-ADAPT-NNN, EC-NNN, or TEST-ADAPT-NNN with `Satisfies:` line per spec.md cross-cutting table (lines 710–744). (NFR-ADAPT-004 is implicit only — see AN-006.)
- Spec → REQ traceability: every SPEC-ADAPT-001..010 has a `Satisfies:` line listing ≥1 REQ-ADAPT-* ID; every TEST-ADAPT-001..040 has a `Satisfies` column populated with ≥1 REQ or EC ID; every EC-001..023 has a `Satisfies` column with ≥1 REQ ID.
- Numeric thresholds: 28,672 (28 KiB) warn / 32,768 (32 KiB) hard limit — consistent across requirements.md REQ-ADAPT-009/009b, design.md B.3 numeric constants and B.4.4/B.4.6, spec.md SizeReport (lines 277–279). 500-line limit + line 490 truncation + line 491 marker — consistent for `.mdc` files across REQ-ADAPT-005, design.md B.3, spec.md SPEC-ADAPT-010 and EC-004/005/006 (the `.codex/*.md` line offset is the AN-002 finding, separate from this check). Performance budgets 5s check / 30s sync — consistent across requirements.md NFR-ADAPT-001/002, design.md C.8, spec.md performance budget. Hardware spec quad-core / 8 GB / NVMe — consistent across requirements.md NFR-ADAPT-001/002, spec.md performance budget.
- File paths: `.cursor/rules/*.mdc`, `.codex/agents/*.md`, `.codex/skills/*.md`, `.codex/agents/INDEX.md`, `.cursor/rules/.adapter-manifest.json` consistent across all four artifacts and ADR-0029.
- Manifest schema field names: `generated_at`, `script_hash`, `sources`, `outputs` consistent across requirements.md REQ-ADAPT-010, design.md C.3.1, spec.md ManifestObject. (Field-membership question is AN-001.)
- Frontmatter field names: `description`, `alwaysApply`, `x-generated`, `x-source`, `x-regenerate` consistent (and field order: same in design.md B.2 Component 7, design.md C.3.2, and spec.md CursorFrontmatter).
- HTML comment header format: `<!-- GENERATED — do not edit by hand. Source: <path>. Regenerate: npm run adapters:sync -->` (with U+2014 em dash) consistent across requirements.md REQ-ADAPT-006, design.md B.2 Component 8, design.md C.3.3, spec.md CodexHeader.
- ADR alignment: ADR-0028 ("Treat the Claude baseline as the canonical source for multi-framework adapters") and ADR-0029 ("Make the multi-framework adapter pipeline additive-only over canonical sources") are referenced in design.md C.5 (lines 1291–1292) with correct numbers, correct titles, and clickable relative links to `docs/adr/0028-…` and `docs/adr/0029-…`. design.md frontmatter `adrs:` list (lines 16–17) lists both. ADR-0028 and ADR-0029 reference each other and DESIGN-ADAPT-001/PRD-ADAPT-001 in their References sections.
