---
id: PRD-ADAPT-001
title: Multi-Framework Adapters for Cursor and Codex
stage: requirements
feature: multi-framework-adapters
status: accepted
owner: pm
inputs:
  - IDEA-ADAPT-001
  - RESEARCH-ADAPT-001
created: 2026-05-03
updated: 2026-05-03
version: 2.2
---

# PRD — Multi-Framework Adapters for Cursor and Codex

## Summary

Specorator is built and maintained through Claude Code; its agent definitions, skill definitions, and operating conventions live under `.claude/`. Teams who adopt the template but work in Cursor or Codex receive no equivalent guidance unless they hand-translate those files, which drifts silently. This feature adds a Node.js generation script (`npm run adapters:sync`) that converts the canonical `.claude/agents/`, `.claude/skills/`, and `AGENTS.md` sources into properly formatted Cursor `.mdc` rule files and new supplementary Codex instruction files. A companion hash-based check (`npm run adapters:check`) is wired into `npm run verify` and the existing CI workflow to detect staleness before a stale adapter reaches a user. Generated files are additive and clearly labelled — no canonical Claude file is touched.

---

## Goals

- G1. Enable a Cursor user who clones the Specorator template to receive agent-role context and project-wide operating conventions from `.cursor/rules/` without any manual authoring.
- G2. Enable a Codex user to receive agent-role detail and skill summaries that supplement the auto-loaded `AGENTS.md`, without disrupting the existing hand-authored `.codex/` files.
- G3. Make adapter staleness visible before it reaches users: the local verify gate and CI both detect when canonical source files have changed without a corresponding regeneration.
- G4. Keep the generation step low-friction for a template maintainer: one command regenerates all adapter files from the canonical source.
- G5. Align generated adapter files with Strategic Priority 3: keeping the template portable across AI coding tools while preserving `AGENTS.md` and the workflow docs as source of truth.

---

## Non-goals

- NG1. Adapters for Aider, Copilot, Gemini, or any framework beyond Cursor and Codex. Adding another framework requires a separate ADR per the constraint in `idea.md`.
- NG2. Two-way sync: edits to Cursor or Codex adapter files are not propagated back to `.claude/`. The flow is strictly one-directional.
- NG3. GUI or web tooling for adapter management. All mechanics are CLI and script-level.
- NG4. Modification of any existing hand-authored file under `.codex/` (`.codex/README.md`, `.codex/instructions.md`, `.codex/workflows/*.md`). Those files are left as-is.
- NG5. Modification of any canonical file: `.claude/`, `AGENTS.md`, `CLAUDE.md`, `memory/constitution.md`. The adapter script is additive-only.
- NG6. Runtime orchestration: the adapters provide configuration context files, not execution wiring between Claude Code agents and Cursor or Codex agents.
- NG7. Generating Specorator `templates/` artifacts for other frameworks; the adapters cover AI tool configuration files only.
- NG8. Semantic validation of generated rule content (whether a rule will be effective in practice). Structural validation only.
- NG9. CI-provider-specific configuration: this feature ships no CI-provider-specific files (e.g., `.github/workflows/`, `Jenkinsfile`, `.circleci/`). CI integration is achieved solely by invoking `npm run verify`, which any CI provider or release pipeline can call.
- NG10. The adapter script shall not modify `AGENTS.md`; the `AGENTS.md` pointer to `.codex/agents/INDEX.md` is a manual one-time setup step documented in the adapter README, not automated.

---

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| Template maintainer (Claude Code user) | Run one command to push canonical agent/skill changes to Cursor and Codex users without manual file editing | Manual translation does not scale; drift is invisible without this feature |
| Cursor adopter | Receive role-scoped Cursor rules and project-wide conventions on first open, without needing to understand `.claude/` structure | Without adapter files, Cursor agent receives no Specorator workflow context |
| Codex adopter | Receive agent-role detail and skill summaries beyond what `AGENTS.md` alone provides | `AGENTS.md` gives project-wide context but lacks the depth of per-agent definitions in `.claude/agents/` |
| Future contributor | Recognise generated files as generated and not edit them by hand | Prevents silent loss of changes on next regeneration |

---

## Jobs to be done

- When **I update an agent definition in `.claude/agents/`**, I want to **run a single command and know all adapter files are updated**, so I can **trust that Cursor and Codex users see the same role guidance I just changed**.
- When **I open the Specorator template in Cursor IDE for the first time**, I want to **have role-specific rules loaded automatically**, so I can **operate within the correct agent role without reading the `.claude/` folder structure**.
- When **I run `npm run verify` or push a PR**, I want to **get a clear failure if adapter files are stale**, so I can **regenerate before the stale state is visible to other users**.
- When **I am working in Codex and need deeper guidance on a specific agent role**, I want to **find a generated file that supplements `AGENTS.md`**, so I can **understand the agent's scope without leaving my tool**.

---

## Functional requirements (EARS)

### REQ-ADAPT-001 — Adapter generation: read canonical sources

- **Pattern:** Event-driven
- **Statement:** WHEN a maintainer invokes `npm run adapters:sync`, the adapter generation script shall read every `.md` file under `.claude/agents/`, every `.md` file under `.claude/skills/`, and the root `AGENTS.md` file.
- **Acceptance:**
  - Given the canonical source files exist at `.claude/agents/`, `.claude/skills/`, and `AGENTS.md`
  - When the maintainer runs `npm run adapters:sync`
  - Then the script reads every `.md` file under `.claude/agents/`, every `.md` file under `.claude/skills/`, and the root `AGENTS.md`
  - And no file under `.claude/`, `AGENTS.md`, `CLAUDE.md`, or `memory/constitution.md` is modified, created, or deleted
- **Priority:** must
- **Satisfies:** IDEA-ADAPT-001 (desired outcomes 1, 4), RESEARCH-ADAPT-001 (Alternative A, Q3 verdict)

---

### REQ-ADAPT-018 — Adapter generation: write Cursor outputs

- **Pattern:** Event-driven
- **Statement:** WHEN a maintainer invokes `npm run adapters:sync`, the adapter generation script shall write the full set of Cursor adapter output files to `.cursor/rules/`, where the full set is: one `.mdc` file per `.md` file under `.claude/agents/`, one `.mdc` file per `.md` file under `.claude/skills/`, and `project-conventions.mdc`.
- **Acceptance:**
  - Given the canonical source files exist at `.claude/agents/` and `.claude/skills/`
  - When the maintainer runs `npm run adapters:sync`
  - Then `.cursor/rules/agent-<slug>.mdc` exists for every `.md` file under `.claude/agents/`
  - And `.cursor/rules/skill-<slug>.mdc` exists for every `.md` file under `.claude/skills/`
  - And `.cursor/rules/project-conventions.mdc` exists
  - And the command exits with code 0 on success
- **Priority:** must
- **Satisfies:** IDEA-ADAPT-001 (desired outcomes 1, 4), RESEARCH-ADAPT-001 (Alternative A, Q3 verdict)

---

### REQ-ADAPT-019 — Adapter generation: write Codex outputs

- **Pattern:** Event-driven
- **Statement:** WHEN a maintainer invokes `npm run adapters:sync`, the adapter generation script shall write the full set of Codex adapter output files, where the full set is: one `.md` file per `.md` file under `.claude/agents/` written to `.codex/agents/<slug>.md`, one `.md` file per `.md` file under `.claude/skills/` written to `.codex/skills/<slug>.md`, and `.codex/agents/INDEX.md`.
- **Acceptance:**
  - Given the canonical source files exist at `.claude/agents/` and `.claude/skills/`
  - When the maintainer runs `npm run adapters:sync`
  - Then `.codex/agents/<slug>.md` exists for every `.md` file under `.claude/agents/`
  - And `.codex/skills/<slug>.md` exists for every `.md` file under `.claude/skills/`
  - And `.codex/agents/INDEX.md` exists
  - And the command exits with code 0 on success
- **Priority:** must
- **Satisfies:** IDEA-ADAPT-001 (desired outcomes 1, 4), RESEARCH-ADAPT-001 (Alternative A, Q3 verdict)

---

### REQ-ADAPT-002 — Cursor adapter file format

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall produce every Cursor adapter file as a `.mdc` file containing a valid YAML frontmatter block before any body content, where valid means: a YAML block delimited by `---` on line 1 and a closing `---`, containing at minimum the fields `description` (non-empty string), `alwaysApply` (boolean), `x-generated: true` (boolean literal), `x-source` (non-empty string containing the repository-root-relative path of the canonical source file), and `x-regenerate: "npm run adapters:sync"` (string literal).
- **Acceptance (direct file inspection):**
  - Given a Cursor adapter file has been generated by `adapters:sync`
  - When the file is read directly
  - Then the file extension is `.mdc`
  - And line 1 is `---`
  - And the frontmatter block contains a non-empty string value for `description`
  - And the frontmatter block contains a boolean value for `alwaysApply`
  - And the frontmatter block contains `x-generated: true`
  - And the frontmatter block contains a non-empty string value for `x-source`
  - And the frontmatter block contains `x-regenerate: "npm run adapters:sync"`
- **Acceptance (cursor-doctor validation):**
  - Given a Cursor adapter file has been generated by `adapters:sync`
  - When the file is passed to `cursor-doctor`
  - Then `cursor-doctor` reports no structural errors on the file
- **Priority:** must
- **Satisfies:** IDEA-ADAPT-001 (constraint: generated files marked), RESEARCH-ADAPT-001 (Q7 verdict, Q1 — frontmatter schema)

---

### REQ-ADAPT-003 — Cursor rule type for agent-derived rules

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall set `alwaysApply: false` and a non-empty `description` field, and shall not set a `globs` field, in every Cursor rule derived from a `.claude/agents/` source file.
- **Acceptance:**
  - Given adapter files have been generated by `adapters:sync`
  - When all `.mdc` files in `.cursor/rules/` derived from `.claude/agents/` are inspected
  - Then every such file has `alwaysApply: false`
  - And every such file has a non-empty string value for `description`
  - And no such file contains a `globs` field
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — always-apply budget ≈2,000 tokens, RISK-ADAPT-002)

---

### REQ-ADAPT-020 — Cursor rule type for skill-derived rules

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall set `alwaysApply: false` and a non-empty `description` field in every Cursor rule derived from a `.claude/skills/` source file.
- **Acceptance:**
  - Given adapter files have been generated by `adapters:sync`
  - When all `.mdc` files in `.cursor/rules/` derived from `.claude/skills/` are inspected
  - Then every such file has `alwaysApply: false`
  - And every such file has a non-empty string value for `description`
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — always-apply budget ≈2,000 tokens, RISK-ADAPT-002)

---

### REQ-ADAPT-021 — Cursor rule type for project-conventions rule

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall set `alwaysApply: true` in exactly one Cursor rule, the rule derived from `AGENTS.md` named `project-conventions.mdc`, and shall set `alwaysApply: false` in every other generated `.mdc` file.
- **Acceptance:**
  - Given adapter files have been generated by `adapters:sync`
  - When all `.mdc` files in `.cursor/rules/` are inspected
  - Then exactly one file has `alwaysApply: true`
  - And that file is `.cursor/rules/project-conventions.mdc`
  - And no other generated `.mdc` file has `alwaysApply: true`
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — always-apply budget ≈2,000 tokens, RISK-ADAPT-002)

---

### REQ-ADAPT-004 — Cursor adapter file naming: agent-derived files

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall name each Cursor adapter file derived from a `.claude/agents/` source file using the kebab-case prefix `agent-` followed by the source file's base name without extension, with the `.mdc` extension.
- **Acceptance:**
  - Given the source file `.claude/agents/analyst.md` exists
  - When `adapters:sync` runs
  - Then the output file `.cursor/rules/agent-analyst.mdc` is created
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — flat layout required, RISK-ADAPT-005)

---

### REQ-ADAPT-022 — Cursor adapter file naming: skill-derived files

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall name each Cursor adapter file derived from a `.claude/skills/` source file using the kebab-case prefix `skill-` followed by the source file's base name without extension, with the `.mdc` extension.
- **Acceptance:**
  - Given the source file `.claude/skills/verify.md` exists
  - When `adapters:sync` runs
  - Then the output file `.cursor/rules/skill-verify.mdc` is created
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — flat layout required, RISK-ADAPT-005)

---

### REQ-ADAPT-023 — Cursor adapter file naming: conventions file

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall name the Cursor adapter file derived from `AGENTS.md` exactly `project-conventions.mdc`.
- **Acceptance:**
  - Given `AGENTS.md` exists at the repository root
  - When `adapters:sync` runs
  - Then the output file `.cursor/rules/project-conventions.mdc` is created
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — flat layout required, RISK-ADAPT-005)

---

### REQ-ADAPT-024 — Cursor adapter flat layout constraint

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall place all generated `.mdc` files directly in `.cursor/rules/` with no subdirectory nesting.
- **Acceptance:**
  - Given `adapters:sync` has completed
  - When the `.cursor/rules/` directory tree is inspected
  - Then no `.mdc` file exists in any subdirectory of `.cursor/rules/`
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — flat layout required, RISK-ADAPT-005)

---

### REQ-ADAPT-025 — Slug collision detection

- **Pattern:** IF two source files under `.claude/agents/` or two source files under `.claude/skills/` share the same base name, THEN the adapter generation script shall fail with a non-zero exit code and emit a message to stderr identifying the conflicting paths.
- **Acceptance:**
  - Given two source files exist with the same base name (e.g., `.claude/agents/foo/analyst.md` and `.claude/agents/bar/analyst.md`)
  - When `adapters:sync` runs
  - Then the script exits with a non-zero exit code
  - And stderr contains the relative paths of both conflicting source files
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — naming convention, RISK-ADAPT-005)

---

### REQ-ADAPT-005 — Cursor adapter individual file size limit

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall produce each Cursor `.mdc` file with a total line count (including frontmatter) of no more than 500 lines, and if any source file would produce more than 500 lines, the script shall truncate the output at 490 lines and append `<!-- TRUNCATED: source exceeded 500 lines -->` as line 491.
- **Acceptance:**
  - Given all generated `.mdc` files in `.cursor/rules/`
  - When each file's total line count (including frontmatter) is measured
  - Then no file exceeds 491 lines
  - And any file whose source would have produced more than 500 lines contains the text `<!-- TRUNCATED: source exceeded 500 lines -->` on line 491
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q1 — size and token limits: 500 lines/file)

---

### REQ-ADAPT-006 — Generated file header

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall mark every generated Cursor `.mdc` file as generated using the YAML frontmatter custom fields `x-generated: true`, `x-source: <canonical-relative-path>`, and `x-regenerate: "npm run adapters:sync"` within the frontmatter block (as defined in REQ-ADAPT-002), and shall mark every generated Codex `.md` file (under `.codex/agents/`, `.codex/skills/`, and `.codex/agents/INDEX.md`) with the HTML comment `<!-- GENERATED — do not edit by hand. Source: <canonical-relative-path>. Regenerate: npm run adapters:sync -->` as line 1 of the file.
- **Acceptance (Cursor .mdc files):**
  - Given any `.mdc` file written by `adapters:sync`
  - When the YAML frontmatter is parsed
  - Then the frontmatter contains `x-generated: true`
  - And the frontmatter contains an `x-source` field whose value is the repository-root-relative path of the source file that produced this adapter file
  - And the frontmatter contains `x-regenerate: "npm run adapters:sync"`
- **Acceptance (Codex .md files):**
  - Given any `.md` file written by `adapters:sync` under `.codex/agents/` or `.codex/skills/`
  - When line 1 of the file is read
  - Then it matches the pattern: `<!-- GENERATED — do not edit by hand. Source: <canonical-relative-path>. Regenerate: npm run adapters:sync -->`
  - And `<canonical-relative-path>` is the repository-root-relative path of the source file that produced this adapter file
- **Priority:** must
- **Satisfies:** IDEA-ADAPT-001 (constraint: generated files must be marked), RESEARCH-ADAPT-001 (technical consideration 3, RISK-ADAPT-003)

---

### REQ-ADAPT-007 — Codex adapter file generation (idempotent overwrite)

- **Pattern:** Event-driven
- **Statement:** WHEN `npm run adapters:sync` is invoked, the adapter generation script shall create or overwrite one markdown file per source file under `.claude/agents/` at the path `.codex/agents/<slug>.md` and one markdown file per source file under `.claude/skills/` at the path `.codex/skills/<slug>.md`, where `<slug>` is the source file's base name without extension.
- **Acceptance:**
  - Given source files exist under `.claude/agents/` and `.claude/skills/`
  - When `adapters:sync` runs
  - Then `.codex/agents/<slug>.md` is created or overwritten for each agent source file
  - And `.codex/skills/<slug>.md` is created or overwritten for each skill source file
  - Idempotency on unchanged sources is governed by REQ-ADAPT-016.
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q5 verdict — Option 1, hand-authored overlap)

---

### REQ-ADAPT-026 — Codex hand-authored file protection

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall not modify or delete any file under `.codex/` whose content does not carry the generated-file header (`<!-- GENERATED` on line 1 or `x-generated: true` in YAML frontmatter).
- **Acceptance:**
  - Given `.codex/README.md`, `.codex/instructions.md`, and all files under `.codex/workflows/` exist and do not carry the generated-file header
  - When `adapters:sync` runs
  - Then `.codex/README.md`, `.codex/instructions.md`, and every file under `.codex/workflows/` remain byte-for-byte unchanged
  - And no other file under `.codex/` that lacks the generated-file header is modified or deleted
- **Priority:** must
- **Satisfies:** NG4, RESEARCH-ADAPT-001 (Q5 verdict — hand-authored overlap)

---

### REQ-ADAPT-008 — Codex agent file discovery index

- **Pattern:** Event-driven
- **Statement:** WHEN `npm run adapters:sync` is invoked, the adapter generation script shall create or overwrite `.codex/agents/INDEX.md`, listing the relative path of every generated `.codex/agents/<slug>.md` file.
- **Acceptance:**
  - Given `adapters:sync` has run and at least one `.codex/agents/<slug>.md` file exists
  - When `.codex/agents/INDEX.md` is read
  - Then it lists the relative path of every generated `.codex/agents/<slug>.md` file
  - And if `.codex/agents/INDEX.md` did not exist before the run, it is created
  - And if `.codex/agents/INDEX.md` existed before the run, it is overwritten with the complete, freshly generated index
  - And no new key is added to `.codex/config.toml` by the generation script
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q2 — Codex context model, "What still needs validating" — Codex discovery mechanism; technical consideration 4)

> **PM decision — AGENTS.md pointer:** The adapter script does not add the `AGENTS.md` pointer to `INDEX.md` (per NG10). The adapter README documents a one-time manual step: the human maintainer adds a "See also" reference to `.codex/agents/INDEX.md` in `AGENTS.md` after first running `adapters:sync`. This keeps the script additive-only with respect to canonical files.

---

### REQ-ADAPT-009 — Codex adapter combined-size warning

- **Pattern:** IF the projected combined byte size of all files generated under `.codex/agents/` and `.codex/skills/` exceeds 28,672 bytes, THEN the adapter generation script shall emit a warning message to stderr stating the projected total size and the value 32,768.
- **Acceptance (warning threshold):**
  - Given a repository where the combined size of generated `.codex/agents/` and `.codex/skills/` files would exceed 28,672 bytes
  - When `adapters:sync` runs
  - Then stderr contains a warning that includes the projected combined byte size and the value 32768
  - And the command still exits with code 0 and all files are written (the warning does not abort generation)
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q2 — 32 KiB limit, RISK-ADAPT-004)

---

### REQ-ADAPT-027 — Codex adapter combined-size hard limit

- **Pattern:** IF the projected combined byte size of all files generated under `.codex/agents/` and `.codex/skills/` exceeds 32,768 bytes, THEN the adapter generation script shall exit with a non-zero exit code and emit a message to stderr identifying the files contributing to the excess.
- **Acceptance:**
  - Given a repository where the combined size of generated `.codex/agents/` and `.codex/skills/` files would exceed 32,768 bytes
  - When `adapters:sync` runs
  - Then the script exits with a non-zero exit code
  - And stderr identifies which generated files contribute to the excess
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q2 — 32 KiB limit, RISK-ADAPT-004)

---

### REQ-ADAPT-010 — Drift detection manifest

- **Pattern:** Event-driven
- **Statement:** WHEN `npm run adapters:sync` completes successfully, the adapter generation script shall write `.cursor/rules/.adapter-manifest.json` conforming exactly to the schema `{"generated_at": "<ISO-8601>", "script_hash": "<sha256>", "sources": [{"path": "<rel-path>", "sha256": "<hash>"}], "outputs": ["<rel-path>"]}`, where the manifest contains four top-level fields: `generated_at` (ISO-8601 timestamp), `script_hash` (the SHA-256 hex digest of the generation script `scripts/adapters/generate.mjs`), `sources` (an array of objects each having a `path` string and a `sha256` string recording every canonical source file read during generation), and `outputs` (an array of repository-root-relative paths of every generated output file). The `script_hash` field is a top-level field parallel to `sources` and `outputs`; the generation script itself is not recorded inside `sources[]`.
- **Acceptance:**
  - Given `adapters:sync` has run successfully
  - When `.cursor/rules/.adapter-manifest.json` is read and parsed as JSON
  - Then the document contains a `generated_at` field with a valid ISO-8601 timestamp
  - And the document contains a `script_hash` field at the top level (not nested inside `sources`) with a valid 64-character lowercase hex string representing the SHA-256 digest of `scripts/adapters/generate.mjs`
  - And the document contains a `sources` array where each entry has a `path` string and a `sha256` string (64-character hex); `sources` contains one entry for every `.md` file under `.claude/agents/`, every `.md` file under `.claude/skills/`, and the root `AGENTS.md`; the generation script file is not present in `sources[]`
  - And the document contains an `outputs` array listing the repository-root-relative path of every file written by `adapters:sync` in this run
  - And no other top-level fields are present in the document
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q4 verdict — hash-based check; technical consideration 3 — template hash in manifest)

---

### REQ-ADAPT-011 — Drift check command

- **Pattern:** Event-driven
- **Statement:** WHEN `npm run adapters:check` is invoked, the adapter check script shall recompute the SHA-256 hash of each source file listed in the `sources` array of `.cursor/rules/.adapter-manifest.json` and compare those hashes to the recorded values, shall separately recompute the SHA-256 hash of `scripts/adapters/generate.mjs` and compare it to the top-level `script_hash` field in the manifest, and shall exit with a non-zero code and emit to stderr the relative path of each changed or missing file if any hash differs, or if the manifest file is absent or cannot be parsed as valid JSON conforming to the schema.
- **Acceptance (stale source detected):**
  - Given `.cursor/rules/.adapter-manifest.json` exists and records baseline hashes
  - When a canonical source file is modified without running `adapters:sync`, and then `adapters:check` is run
  - Then the command exits with a non-zero exit code
  - And stderr includes the relative path of each source file whose hash differs from the manifest
- **Acceptance (clean state):**
  - Given `.cursor/rules/.adapter-manifest.json` exists and all source file hashes match
  - When `adapters:check` is run
  - Then the command exits with code 0 and produces no error output
- **Acceptance (manifest absent):**
  - Given `.cursor/rules/.adapter-manifest.json` does not exist
  - When `adapters:check` is run
  - Then the command exits with a non-zero code
  - And stderr states that adapters have never been generated
- **Acceptance (missing output file):**
  - Given `.cursor/rules/.adapter-manifest.json` exists and its `outputs` array lists a file path that is absent from the working tree
  - When `adapters:check` is run
  - Then the command exits with a non-zero exit code
  - And stderr reports the missing output file path
- **Acceptance (malformed manifest):**
  - Given the manifest file at `.cursor/rules/.adapter-manifest.json` exists but cannot be parsed as valid JSON conforming to the schema
  - When `adapters:check` runs
  - Then the script shall exit non-zero, emit to stderr a message identifying the manifest path and the parse error, and instruct the user to run `npm run adapters:sync` to regenerate
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q4 verdict, Q3 — verify integration)

---

### REQ-ADAPT-012 — Drift check wired into verify gate

- **Pattern:** Ubiquitous
- **Statement:** The `npm run verify` script shall invoke `npm run adapters:check` as one of its steps, such that a stale adapter causes `npm run verify` to exit with a non-zero code.
- **Acceptance:**
  - Given a repository where a canonical source file has been modified without running `adapters:sync`
  - When `npm run verify` is run
  - Then it exits with a non-zero code
  - And the output contains the adapter staleness message from `adapters:check`
- **Priority:** must
- **Satisfies:** IDEA-ADAPT-001 (desired outcome 5), RESEARCH-ADAPT-001 (Q3 — verify integration, Q4)

> **Note:** REQ-ADAPT-014 has been folded into this requirement. CI fails when adapters are stale because `npm run verify` is already the CI verify step and it calls `adapters:check`. No new CI workflow file is required.

---

### REQ-ADAPT-013 — Cursor adapter structural validation via cursor-doctor

- **Pattern:** Event-driven
- **Statement:** WHEN `npm run adapters:sync` completes, the adapter generation script shall invoke `cursor-doctor` as a locally installed `devDependency` against all generated `.mdc` files in `.cursor/rules/`, and shall exit with a non-zero code and print the `cursor-doctor` output if any structural error is reported.
- **Acceptance:**
  - Given `cursor-doctor` is installed as a `devDependency` in `package.json`
  - When `adapters:sync` runs and generates `.mdc` files
  - Then `cursor-doctor` is invoked against `.cursor/rules/`
  - And if `cursor-doctor` reports any error (missing frontmatter, invalid `alwaysApply`, empty body, invalid glob), `adapters:sync` exits with a non-zero code and prints the `cursor-doctor` error output
  - And if `cursor-doctor` reports no errors, `adapters:sync` exits with code 0
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Q8 verdict, RISK-ADAPT-001)

> **PM decision — cursor-doctor dependency:** `cursor-doctor` is added as a pinned `devDependency` in `package.json` rather than fetched via `npx cursor-doctor`. Rationale: the repo already pin-manages devDependencies; offline CI environments must not be blocked by a network fetch; and a pinned version prevents a `cursor-doctor` schema change from silently breaking CI without a deliberate version bump. The architect records the chosen version in `package.json`. RISK-ADAPT-001 mitigation requires monitoring the `cursor-doctor` changelog at each Specorator release and bumping the pinned version deliberately.

---

### REQ-ADAPT-015 — Generated header integrity check

- **Pattern:** Event-driven
- **Statement:** WHEN `npm run adapters:check` is invoked, the adapter check script shall inspect every file path listed in the `outputs` array of `.cursor/rules/.adapter-manifest.json` and exit with a non-zero code and identify the offending file(s) if the generated-file header is absent or malformed in any of those files.
- **Acceptance:**
  - Given a generated adapter file whose header has been manually edited to remove the generated-file marker
  - When `adapters:check` runs
  - Then it exits with a non-zero code
  - And stderr identifies the file whose header is absent or malformed
- **Acceptance (only manifest-listed files checked):**
  - Given a file path that was never written by `adapters:sync` and is not in the manifest's `outputs` array
  - When `adapters:check` runs
  - Then that file is not inspected for header presence
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (RISK-ADAPT-003 — hand-edit detection, technical consideration 3)

---

### REQ-ADAPT-016 — Idempotent generation

- **Pattern:** Ubiquitous
- **Statement:** The adapter generation script shall produce byte-for-byte identical output files when invoked multiple times in succession against unchanged source files.
- **Acceptance:**
  - Given `adapters:sync` has run once against a stable set of source files
  - When `adapters:sync` is run a second time without any source file change
  - Then every generated file has the same content as after the first run
  - And the manifest SHA-256 values are unchanged
  - And `adapters:check` exits with code 0 after either run
- **Priority:** must
- **Satisfies:** RESEARCH-ADAPT-001 (Alternative A — generation and verification cleanly separated)

---

### REQ-ADAPT-017 — No non-deterministic content in generated files

- **Pattern:** Ubiquitous
- **Statement:** Generated files shall not contain content that changes between runs on identical inputs, including timestamps, random values, and process IDs.
- **Acceptance:**
  - Given `adapters:sync` has run once against a stable set of source files
  - When `adapters:sync` is run a second time without any source file change
  - Then no generated file contains a value that differs between the two runs due to a timestamp, random value, or process ID
- **Priority:** must
- **Satisfies:** REQ-ADAPT-016 (idempotency precondition)

> **Note:** The manifest's `generated_at` field is exempted from this requirement as it records execution time for traceability purposes and is not part of the generated adapter content. The `generated_at` field changes between runs; this is expected and does not affect `adapters:check` hash comparisons, which operate on source file hashes.

---

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-ADAPT-001 | Performance | `npm run adapters:check` execution time on a repository containing up to 50 agent files and 30 skill files | ≤ 5 seconds wall-clock on a machine with a quad-core CPU, 8 GB RAM, and NVMe storage |
| NFR-ADAPT-002 | Performance | `npm run adapters:sync` execution time on a repository containing up to 50 agent files and 30 skill files | ≤ 30 seconds wall-clock on a machine with a quad-core CPU, 8 GB RAM, and NVMe storage |
| NFR-ADAPT-003 | Portability | The generation script and check script shall execute without modification on Windows 11 (PowerShell, Node.js LTS) and macOS/Linux (POSIX shell, Node.js LTS), regardless of CI provider or release pipeline tooling | Zero platform-specific failures on either OS family. Validated by running both scripts on a Windows 11 environment and a macOS/Linux environment (in any Node.js LTS context). |
| NFR-ADAPT-004 | Reliability | Running `adapters:sync` multiple times against unchanged source files shall produce identical output (idempotency, formalized in REQ-ADAPT-016 and REQ-ADAPT-017) | 100% identical bytes across repeated runs |
| NFR-ADAPT-005 | Maintainability | Every generated file shall carry the header marker defined in REQ-ADAPT-006, enabling automated identification without inspecting file content | Header present in 100% of generated files as verified by REQ-ADAPT-015 |
| NFR-ADAPT-006 | Maintainability | The generation script shall introduce no runtime `dependencies` in `package.json`; `cursor-doctor` shall be added to `devDependencies` only | No net-new runtime `dependencies`; `cursor-doctor` in `devDependencies` only |
| NFR-ADAPT-007 | Correctness | `cursor-doctor` shall report zero structural errors on any set of `.mdc` files generated by `adapters:sync` | 0 structural errors on every generation run |

> **Note on NFR thresholds:** `docs/steering/quality.md` and `docs/steering/operations.md` are placeholder starter templates with no project-specific thresholds set. All NFR targets above are introduced by this PRD. They are documented here as the authoritative source and must be restated (not linked) in downstream specs.

---

## Success metrics

- **North star:** Fraction of Specorator releases where `.cursor/rules/` and `.codex/agents/` are up-to-date with the canonical `.claude/` source at the time of tagging, measured by `adapters:check` passing on the release commit. Target: 100% within 2 releases of shipping this feature.
- **Supporting — coverage:** All agent roles defined under `.claude/agents/` at the time of generation have a corresponding `.mdc` rule in `.cursor/rules/` and a corresponding file in `.codex/agents/`. Target: 100%.
- **Supporting — verify integrity:** `npm run verify` catches a simulated stale-adapter scenario (source file modified, `adapters:sync` not re-run) in the automated test suite. Target: pass rate 100%.
- **Supporting — adoption signal:** At least one downstream adopter (or the Specorator main branch itself) ships a PR where `npm run verify` (including `adapters:check`) passes, within one release cycle of this feature landing. The adopter may use any CI provider or release pipeline.
- **Counter-metric:** Number of manual edits to generated adapter files detected by `adapters:check` (header missing or malformed) per month. Target: 0 after the first 30 days post-release. A rising count indicates the generated-file boundary is unclear to contributors and the documentation or header warning needs strengthening.

---

## Release criteria

- [ ] All `must`-priority requirements pass their acceptance criteria.
- [ ] All NFRs met: NFR-ADAPT-001 (≤5s check), NFR-ADAPT-002 (≤30s sync), NFR-ADAPT-003 (cross-platform), NFR-ADAPT-007 (zero cursor-doctor errors), or explicitly waived with an ADR.
- [ ] `npm run verify` passes on a clean clone on both Windows and macOS/Linux after adapter files are generated.
- [ ] `npm run verify` (including `adapters:check`) passes on the feature branch with at least one synthetic stale-adapter scenario that the check catches. No CI-provider-specific configuration file is required or shipped.
- [ ] `cursor-doctor` (pinned `devDependency`) reports zero errors on all generated `.mdc` files.
- [ ] All generated Codex `.md` files carry the HTML comment header on line 1 (REQ-ADAPT-006) and the header integrity check (REQ-ADAPT-015) passes.
- [ ] All generated Cursor `.mdc` files carry the frontmatter `x-generated`, `x-source`, and `x-regenerate` fields (REQ-ADAPT-006) and the header integrity check (REQ-ADAPT-015) passes.
- [ ] `.codex/README.md`, `.codex/instructions.md`, and all `.codex/workflows/*.md` files are byte-for-byte unchanged from their pre-feature state.
- [ ] No canonical source file (`.claude/`, `AGENTS.md`, `CLAUDE.md`, `memory/constitution.md`) is modified by the feature implementation.
- [ ] `docs/sink.md` updated to register `.cursor/rules/` and the new `.codex/agents/` and `.codex/skills/` paths as generated-artifact sinks.
- [ ] Adapter README (or relevant `docs/` section) documents: the one-directional flow, the regeneration command, the drift check, the cursor-doctor dependency, the Codex 32 KiB ceiling warning, the flat-file layout constraint for `.cursor/rules/`, and the manual one-time step for adding the `AGENTS.md` pointer to `INDEX.md`.
- [ ] RISK-ADAPT-006 follow-up confirmed: a separate docs-only PR correcting `AGENTS.md` wording on Aider is tracked (need not land in the same PR as this feature).
- [ ] Test plan executed; no open severity-1 or severity-2 bugs.

---

## Open questions / clarifications

None. All 29 clarifications (CLAR-001 through CLAR-029) raised during `/spec:clarify` have been resolved in this revision (v2). See `workflow-state.md` for the resolution record.

---

## Out of scope

Identical to the preliminary out-of-scope list from `idea.md`, confirmed:

- Adapters for Aider, Copilot, Gemini, or any other framework (requires ADR each).
- Two-way sync from Cursor or Codex adapter files back to `.claude/`.
- GUI or web tooling for adapter management.
- Modification of existing hand-authored `.codex/` files.
- Generation of Specorator `templates/` artifacts for other frameworks.
- Changes to Specorator lifecycle stages or agent scopes.
- Semantic (effectiveness) validation of generated rule content.
- Aider `.cursor/rules/` consumption (Aider does not auto-load those files; out of scope pending ADR).
- Automated modification of `AGENTS.md` to add the `INDEX.md` pointer (manual one-time setup step per NG10).

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has a stable ID.
- [x] No hidden conjunctions — requirements that previously bundled multiple actions (REQ-ADAPT-001, REQ-ADAPT-003, REQ-ADAPT-004, REQ-ADAPT-007, REQ-ADAPT-009) have been split into separate numbered requirements.
- [x] Acceptance criteria testable — triggers are concrete, responses are measurable, no hidden conjunctions.
- [x] "Full set" defined explicitly in REQ-ADAPT-018 and REQ-ADAPT-019.
- [x] YAML frontmatter validity defined explicitly in REQ-ADAPT-002 (field names, types, and minimum set).
- [x] Two-path generated-file header rule: frontmatter fields for `.mdc` files, HTML comment line 1 for `.md` files (REQ-ADAPT-006).
- [x] Manifest JSON schema defined exactly (REQ-ADAPT-010); no "array or map" ambiguity.
- [x] Manifest records both source paths+hashes and output paths (REQ-ADAPT-010, REQ-ADAPT-015 consistent).
- [x] AGENTS.md contradiction resolved: script does not modify AGENTS.md; manual step documented in NG10 and REQ-ADAPT-008 PM decision note.
- [x] Codex 32 KiB hard limit added as REQ-ADAPT-027 (failure, not just warning).
- [x] Slug collision detection added as REQ-ADAPT-025.
- [x] Non-deterministic content prohibition explicit in REQ-ADAPT-017.
- [x] NFR hardware reference concrete (quad-core, 8 GB RAM, NVMe, CI runner).
- [x] NFR-ADAPT-003 test scenario defined.
- [x] NFR-ADAPT-006 constraint scoped to runtime dependencies (not point-in-time).
- [x] Duplicate Pattern fields removed from REQ-ADAPT-007, REQ-ADAPT-009, REQ-ADAPT-010.
- [x] REQ-ADAPT-014 folded into REQ-ADAPT-012 note (was redundant).
- [x] No design language in functional requirements.
- [x] EARS quality bar: triggers concrete, responses testable, one requirement per statement, system named, no design language.
- [x] AN-001 resolved: `script_hash` is unambiguously a top-level field in REQ-ADAPT-010 statement and acceptance; generation script is explicitly excluded from `sources[]`; REQ-ADAPT-011 statement references `script_hash` as a separate top-level field, not `sources`.
- [x] AN-003 resolved: REQ-ADAPT-011 has a 5th acceptance scenario covering malformed manifest JSON with its own exit-non-zero + stderr message + regeneration instruction.
- [x] AN-007 resolved: REQ-ADAPT-007 duplicate idempotency bullet replaced with cross-reference to REQ-ADAPT-016.
