---
id: PRD-GRAPH-001
title: Graphify Knowledge Graph Integration
stage: requirements
feature: graphify-integration
status: draft
owner: pm
inputs:
  - idea.md (lean stub)
created: 2026-05-03
updated: 2026-05-03
---

# PRD — Graphify Knowledge Graph Integration

## Summary

Integrate [graphify](https://github.com/safishamsi/graphify) into the agentic-workflow repo as a local developer tool that transforms the growing codebase and documentation into an interactive, queryable knowledge graph. The repo will store the invocation configuration and commit the generated graph artifacts (`graph.html`, `graph.json`, `GRAPH_REPORT.md`) so any contributor can browse them without installing graphify. Contributors who want to regenerate the graph install graphify globally and run an npm script. This extends the repo's existing tool-belt with discovery, structural insight, and navigation capabilities.

## Goals

- G1 — Make graph artifacts browsable from the repo without requiring graphify to be installed.
- G2 — Provide one-command full-build and one-command incremental-update scripts for contributors who do have graphify installed.
- G3 — Keep graph cache files out of git and the npm package so repo weight stays manageable.
- G4 — Document the external dependency clearly so setup friction is zero.

## Non-goals

- NG1 — Serving `graph.html` via GitHub Pages (separate concern; may follow in a later cycle).
- NG2 — Running graphify in CI on every commit (too heavy; may be considered later).
- NG3 — Adding graphify as an npm/node_modules dependency (it ships as a global executable).
- NG4 — Building a wrapper API around graphify queries (future; graphify's CLI handles ad-hoc queries).

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| Template maintainer (Luis) | Navigate and communicate the shape of the growing workflow system | Repo is large and cross-linked; graph gives a structural overview |
| Template adopter | Understand what they've inherited when they fork the template | Graph speeds onboarding vs. reading dozens of Markdown files |
| New contributor | Quickly find where something lives without `grep` | Reduces time-to-first-contribution |

## Jobs to be done

- When **navigating an unfamiliar part of the codebase**, I want to **see how files and concepts connect**, so I can **find the right place to make a change without reading everything**.
- When **onboarding a new adopter or contributor**, I want to **point them at a single visual artifact**, so I can **reduce their ramp-up from hours to minutes**.
- When **the codebase changes significantly**, I want to **regenerate the graph in one command**, so I can **keep the artifact current without manual bookkeeping**.

## Functional requirements (EARS)

### REQ-GRAPH-001 — Graphify configuration at repo root

- **Pattern:** Ubiquitous
- **Statement:** The repository shall include npm scripts that encode all graphify flags (include paths, exclude patterns, and processing mode) so the full-build and update commands reproduce identical results on any machine.
- **Acceptance:**
  - Given a fresh clone of the repo
  - When a developer inspects `package.json`
  - Then `graph` and `graph:update` scripts are present and their flags fully specify the graphify invocation scope and mode
- **Priority:** must
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-002 — Full-build npm script

- **Pattern:** Event-driven
- **Statement:** WHEN a developer runs `npm run graph`, the graphify integration shall invoke graphify in deep-analysis mode against the repository root and write `graph.html`, `graph.json`, and `GRAPH_REPORT.md` to the `graph/` directory at the repository root.
- **Acceptance:**
  - Given graphify is installed globally and accessible in PATH
  - When the developer runs `npm run graph` from the repo root
  - Then graphify runs in deep mode, completes without error, and the three output artifacts appear in the graph output directory
- **Priority:** must
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-003 — Incremental-update npm script

- **Pattern:** Event-driven
- **Statement:** WHEN a developer runs `npm run graph:update`, the graphify integration shall invoke graphify with the `--update` flag so only nodes whose source files have changed since the last run are reprocessed.
- **Acceptance:**
  - Given graphify has previously produced output artifacts (cache present)
  - When the developer runs `npm run graph:update`
  - Then graphify runs in update mode, only reprocesses changed files, and overwrites the output artifacts with the refreshed graph
- **Priority:** should
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-004 — Graph artifacts committed to version control

- **Pattern:** Ubiquitous
- **Statement:** The repository shall track `graph/graph.html`, `graph/graph.json`, and `graph/GRAPH_REPORT.md` in version control so contributors can inspect the knowledge graph without running graphify locally.
- **Acceptance:**
  - Given a fresh clone of the repo
  - When a contributor opens `graph.html` in a browser
  - Then the interactive knowledge graph loads and is navigable without any local graphify installation
- **Priority:** must
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-005 — Cache directory excluded from version control

- **Pattern:** Ubiquitous
- **Statement:** The repository's `.gitignore` shall exclude `graph/cache/` so per-machine SHA256 tracking files are never committed.
- **Acceptance:**
  - Given a developer has run `npm run graph` locally (cache populated)
  - When they run `git status`
  - Then `graph/cache/` does not appear as untracked or modified
- **Priority:** must
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-006 — Graph output directory excluded from npm package

- **Pattern:** Ubiquitous
- **Statement:** The `graph/` directory shall not appear in the `files` array in `package.json` so graph artifacts are not bundled into the `@luis85/agentic-workflow` release package and do not inflate adopter installs.
- **Acceptance:**
  - Given an npm pack dry-run (`npm pack --dry-run`)
  - When the output file list is inspected
  - Then no file under `graph/` appears in the list
- **Priority:** must
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-007 — Installation documentation

- **Pattern:** Ubiquitous
- **Statement:** The repository shall document graphify as an external development tool dependency, including the installation command and the minimum version required, so any contributor can set up the tool without external research.
- **Acceptance:**
  - Given a developer reads the designated setup documentation
  - When they follow the graphify installation step
  - Then `graphify --version` succeeds in their shell
- **Priority:** must
- **Satisfies:** IDEA-GRAPH-001

---

### REQ-GRAPH-008 — Missing binary error message

- **Pattern:** Unwanted behaviour
- **Statement:** IF a developer runs `npm run graph` or `npm run graph:update` and the `graphify` executable is not found in PATH, THEN the script shall exit with a non-zero status code and print a message directing the developer to the installation documentation.
- **Acceptance:**
  - Given graphify is not installed (or not in PATH)
  - When the developer runs `npm run graph`
  - Then the script exits non-zero and the terminal output contains a human-readable message with the documentation location
- **Priority:** should
- **Satisfies:** IDEA-GRAPH-001

---

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-GRAPH-001 | performance | Full graph build completes on the current repo | ≤ 5 minutes on a developer laptop |
| NFR-GRAPH-002 | compatibility | npm scripts run on macOS, Windows (PowerShell), and Linux | All three platforms pass without shell-specific changes |
| NFR-GRAPH-003 | maintainability | Graphify configuration format follows graphify's documented schema | No custom or undocumented flags |
| NFR-GRAPH-004 | security | Graphify config shall contain no credentials, tokens, or personal data | Reviewable and committable without redaction |
| NFR-GRAPH-005 | size | Graph output artifacts (html + json) committed to git | Combined size ≤ 10 MB |

## Success metrics

- **North star:** Any contributor can open `graph.html` in a browser within 60 seconds of cloning and begin navigating the knowledge graph.
- **Supporting:** `npm run graph` completes without error on a fresh clone + graphify installed.
- **Counter-metric:** `npm pack --dry-run` file count does not increase after this integration (graph artifacts excluded).

## Release criteria

- [ ] All `must` requirements pass acceptance.
- [ ] All NFRs met (or explicitly waived with ADR).
- [ ] `npm run graph` and `npm run graph:update` execute cleanly on macOS and Windows.
- [ ] `npm pack --dry-run` confirms graph output directory absent from package files.
- [ ] Installation documentation committed and linked from an appropriate entry point.
- [ ] No S1/S2 bugs open.

## Open questions / clarifications

- Q1 — ~~Does graphify support a declarative config file?~~ **Resolved 2026-05-03:** No separate config file — graphify CLI flags only. A thin wrapper script (`scripts/graphify-run.ts`) is permitted per design for cross-platform PATH check (REQ-GRAPH-008); the wrapper bakes flags inline and reads no config file. REQ-GRAPH-001 artifact = the npm scripts in `package.json` plus the wrapper.
- Q2 — ~~What is the canonical output directory?~~ **Resolved 2026-05-03:** `graph/` at repo root. Not in `files` array — naturally excluded from npm package. No `.npmignore` changes needed.

## Out of scope

- GitHub Pages deployment of `graph.html`.
- CI graph regeneration on push.
- Graphify query scripts (`graphify query`, `graphify explain`) as npm scripts (power-user feature; not needed for initial integration).
- Any changes to graphify itself (MIT upstream; we consume only).

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has an ID.
- [x] Acceptance criteria testable.
- [x] NFRs listed with targets.
- [x] Success metrics defined (including a counter-metric).
- [x] Release criteria stated.
- [x] `/spec:clarify` returned no open questions. ← Q1 + Q2 resolved inline 2026-05-03.
