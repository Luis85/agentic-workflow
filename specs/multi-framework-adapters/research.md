---
id: RESEARCH-ADAPT-001
title: Multi-Framework Adapters — Cursor and Codex Context Sync
stage: research
feature: multi-framework-adapters
status: complete
owner: analyst
inputs:
  - IDEA-ADAPT-001
created: 2026-05-03
updated: 2026-05-03
---

# Research — Multi-Framework Adapters for Cursor and Codex

## Research questions

| ID | Question | Status |
|---|---|---|
| Q1 | Cursor rules format: file naming, frontmatter, glob scoping, rule types, size limits, best practices | answered |
| Q2 | Codex context model: auto-load of `.codex/instructions.md`? File-size or count ceiling? | answered |
| Q3 | Sync strategy: on-demand script vs. pre-commit hook vs. CI check; tradeoffs for mixed OS | answered |
| Q4 | Drift detection: hash check vs. regenerate-and-compare for `npm run verify` | answered |
| Q5 | Codex hand-authored overlap: extend, replace, or leave hand-authored files alone? | answered |
| Q6 | Aider: reads `.cursor/rules/` automatically? Own adapter needed? In or out of scope? | answered |
| Q7 | Cursor MDC vs plain markdown: which format is current? | answered |
| Q8 | Validation of generated output: what tooling validates a Cursor rule or Codex instruction file? | answered |

---

## Q1 — Cursor rules format

**File location and naming.** Cursor project rules live in `.cursor/rules/`. Each file must be a flat file at that level — subdirectory nesting is supported by the Cursor file tree but is unreliable in practice: rules placed in nested subdirectories (e.g., `.cursor/rules/agents/foo.mdc`) are reported by forum users to silently fail to load, while the same rules at `.cursor/rules/foo.mdc` work correctly. The safe convention is flat files with descriptive kebab-case names.

**File extension.** Cursor introduced `.mdc` (Markdown with Cursor frontmatter) as the current format, superseding the legacy `.cursorrules` single-file approach and plain `.md` rules files. The Cursor IDE requires `.mdc` for frontmatter-controlled rules; plain `.md` files are still loaded in some modes but provide no frontmatter-based routing control. The `.mdc` extension should be treated as the required format for generated adapter files.

**Frontmatter schema.** Three optional YAML keys control routing:

| Field | Type | Effect |
|---|---|---|
| `description` | string | Human-readable summary. Used by the agent to decide whether to pull the rule in agent-requested mode. Required for agent-requested rules. |
| `globs` | string or array | File glob patterns; rule auto-attaches when a matching file is in context. |
| `alwaysApply` | boolean | `true` = rule is injected into every chat session regardless of context. |

**Rule types.** Frontmatter combinations produce four distinct rule types:

| Type | Configuration | When included |
|---|---|---|
| Always Apply | `alwaysApply: true` | Every chat session |
| Auto-attached | `globs` set, `alwaysApply: false` | When a matching file is referenced |
| Agent-requested | `description` set, `alwaysApply: false`, no globs | Agent pulls it in based on relevance |
| Manual | No frontmatter | Only when user @-mentions the rule |

**Size and token limits.** Cursor documentation recommends keeping individual rule files under 500 lines. Practitioners recommend under 100 lines per rule for token efficiency. The combined token budget for always-apply rules should stay under approximately 2,000 tokens. For an adapter generating agent role definitions from `.claude/agents/` files (which can be several hundred lines each), splitting by role rather than generating one monolithic file is essential.

**Best practices for large context sources.** The Cursor documentation recommends referencing files rather than copying their contents, using composable multi-file rule sets, and avoiding large rules that import an entire style guide. For Specorator's use case (deriving rules from `.claude/agents/` files), the practical approach is one rule file per agent role, plus one always-apply rule covering project-wide conventions from `AGENTS.md`.

---

## Q2 — Codex context model

**Primary context discovery.** Codex does not auto-load `.codex/instructions.md`. Its primary instruction discovery mechanism is a three-tier `AGENTS.md` walk:

1. Global: `~/.codex/AGENTS.override.md` then `~/.codex/AGENTS.md`
2. Project: walks from Git root to current directory checking `AGENTS.override.md`, then `AGENTS.md`, then `AGENTS.override.md` and `AGENTS.md` in sequence at each level
3. Fallback names: configured via `project_doc_fallback_filenames` in `.codex/config.toml`

This means the existing `AGENTS.md` in this repository's root is already automatically loaded by Codex on every session start, with no additional configuration required.

**`.codex/instructions.md` loading.** This file is not auto-loaded by Codex out of the box. It is a Specorator convention documented in `.codex/README.md` and loaded only when a human or agent reads it explicitly. It can be made auto-loadable by adding it to `project_doc_fallback_filenames` in `.codex/config.toml`, or by pointing `model_instructions_file` in `.codex/config.toml` to it.

**File-size ceiling.** The default combined instruction limit is 32 KiB (`project_doc_max_bytes`). This ceiling can be raised up to 65,536 bytes in `.codex/config.toml`. Codex skips empty files and stops adding additional files once the combined size limit is reached. For a project with a detailed `AGENTS.md` (~3–4 KB) plus generated agent-role files, staying within 32 KiB is feasible if generated files are well-scoped.

**Implication for adapters.** Because Codex already reads `AGENTS.md` automatically, generated Codex adapter files serve a supplementary purpose: deeper agent-role detail and skill summaries that exceed what belongs in `AGENTS.md`. Those files need to be discoverable either through `project_doc_fallback_filenames` or through explicit operator configuration — not implicitly auto-loaded by Codex itself.

---

## Q3 — Sync strategy

Three mechanisms were evaluated for keeping generated adapter files current:

**On-demand script.** A developer runs `npm run adapters:sync` (or equivalent) whenever canonical `.claude/` files change. No automation; relies entirely on human discipline. Lowest friction for initial implementation; highest risk of drift in practice. Suitable as the generation mechanism in all alternatives, but insufficient alone as the enforcement mechanism.

**Pre-commit hook (Husky / native git hooks).** Hook runs before `git commit`, checks whether source files have changed since last generation, and either regenerates or blocks the commit. Provides enforcement at commit time. Key cross-platform tradeoffs: Git hooks are shell scripts by default, which requires either maintaining two hook scripts (`.sh` / `.ps1`) or routing through Node.js via Husky for platform-neutral execution. This project already uses `npm run verify` and has a Node.js toolchain, which makes Husky viable. However, pre-commit hooks can be skipped with `git commit --no-verify`, and the repository's `.claude/settings.json` already denies `--no-verify`, so this skip path is mitigated by existing policy.

**CI check.** A GitHub Actions step runs after every push and fails the check if generated files are stale. Strongest enforcement guarantee — no commit can merge without green CI. However, CI feedback loop is slower (minutes, not seconds) and requires a push before discovering staleness. Best used as a safety net on top of one of the local mechanisms above.

**Verdict for Q3.** The optimal strategy is a layered approach: on-demand script as the generation primitive, `npm run verify` integration as the local staleness check, and a CI step as the merge gate. This maps cleanly to how the repository already handles other verification concerns.

---

## Q4 — Drift detection

Two approaches were considered:

**Hash-based check.** Compute a hash (e.g., SHA-256) of each canonical source file at generation time and store it in a sidecar file (e.g., `.cursor/rules/.adapter-manifest.json`). During `npm run verify`, recompute hashes of source files and compare to the stored values. If any source hash has changed, the check fails with "adapter files may be stale." This approach is fast (no regeneration needed), works across platforms via Node.js `crypto`, and does not modify the generated files during verification.

**Regenerate-and-compare.** During `npm run verify`, regenerate all adapter files into a temp directory and diff them against the committed versions. If any diff is non-empty, the check fails. This approach is definitive — it catches drift regardless of cause (source change, manual edit of generated file, template change) — but it adds regeneration cost to every verify run and requires a stable temp directory, which complicates cross-platform paths.

**Verdict for Q4.** The hash-based check is recommended for `npm run verify`. It is fast, platform-neutral, and sufficient to catch the primary drift scenario (source file changed without regeneration). The regenerate-and-compare approach is better suited as an optional deep-check (`npm run adapters:check:deep`) run only in CI or on demand, not in the default verify gate.

A known limitation of hash-only: if the generation *template* changes but the source files do not, drift is undetected. Mitigation: include the template version or template file hash in the manifest alongside the source file hashes.

---

## Q5 — Codex hand-authored overlap

The existing `.codex/` files are:

- `README.md` — entry point; defines load order
- `instructions.md` — Codex default posture, context loading rules, safety rails
- `workflows/pr-delivery.md` — PR delivery loop
- `workflows/review-response.md` — PR review response loop
- `workflows/cleanup-after-merge.md` — post-merge cleanup

These files are well-authored, stable, and represent Codex-specific operational procedure that cannot be mechanically derived from `.claude/agents/` or `.claude/skills/` files without losing nuance. Replacing them would require reimplementing that nuance in the generation template — high cost, high fragility.

Three options were evaluated:

**Option 1 — Leave hand-authored files as-is; generate only new files.** The adapter generates new files for agent-role detail and skill summaries that do not currently exist in `.codex/`. Existing files are untouched. A clear boundary is maintained: hand-authored files = operational procedure; generated files = agent and skill reference. This is the lowest-risk path and aligns with the constraint that canonical sources remain authoritative.

**Option 2 — Extend hand-authored files by appending generated sections.** The adapter appends agent-role summaries to `instructions.md`. This creates hybrid files: partly hand-authored, partly generated. Hybrid files are hard to maintain: manual edits in the generated section get overwritten on re-run, and the boundary between the two sections must be delimited by a sentinel comment. Risk is high that a maintainer edits the generated section by hand and then loses changes on re-sync.

**Option 3 — Replace hand-authored files from canonical source.** The adapter replaces `instructions.md` and workflow files entirely from templates derived from `.claude/` files. This requires encoding all existing hand-authored procedure into generation templates. High effort and high risk of regression for an existing working system.

**Verdict for Q5.** Option 1 is strongly recommended. The adapter extends `.codex/` with new files (e.g., `agents/` subfolder with one file per agent role, `skills/` subfolder with skill summaries) without modifying any existing hand-authored files.

---

## Q6 — Aider

`AGENTS.md` notes "Cursor / Aider" as sharing `.cursor/rules/`, suggesting Aider reads those files. The research found that Aider does **not** auto-load `.cursor/rules/`. Aider reads conventions from files specified explicitly via `--read CONVENTIONS.md` or via `.aider.conf.yml`'s `read:` key. A GitHub issue requesting Cursor Rules support in Aider was opened in February 2025 and remained open and unresolved as of the research date.

Aider does read `AGENTS.md` if it is passed via `--read` or included in `.aider.conf.yml`; it does not do so automatically.

**Verdict for Q6.** Aider does not share `.cursor/rules/` and would need its own adapter (a conventions file readable via `--read` or `.aider.conf.yml`). Per the constraint in `idea.md` (Q8 of idea open questions), adding Aider requires a separate ADR. Aider is out of scope for this feature. The statement in `AGENTS.md` that "Cursor / Aider" share `.cursor/rules/` is inaccurate and should be corrected as a low-cost follow-up (a docs-only PR, not part of this feature). TBD — owner: pm to confirm whether the `AGENTS.md` wording correction should be bundled or separate.

---

## Q7 — Cursor MDC vs plain markdown

The `.mdc` format is current and required for frontmatter-controlled rule routing. Plain `.md` files can still be placed in `.cursor/rules/` and are loaded by Cursor, but they only function as manual rules (no automatic attachment, no agent-requested routing, no glob scoping) because Cursor reads frontmatter only from `.mdc` files. The older `.cursorrules` file (a single flat file at the project root) is the legacy format, deprecated in favour of the `.cursor/rules/` directory approach.

**Verdict for Q7.** Specorator adapters must generate `.mdc` files with YAML frontmatter. Plain `.md` files in `.cursor/rules/` are insufficient for the routing behaviour needed to deliver role-scoped rules to the Cursor agent.

---

## Q8 — Validation of generated output

**Cursor rules validation.** `cursor-doctor` (available as `npx cursor-doctor`) is a standalone CLI tool that validates `.mdc` files for: missing or malformed YAML frontmatter, missing `alwaysApply` field, empty rule bodies, invalid glob patterns, and legacy `.cursorrules` issues. It requires no IDE installation and no configuration. It also has a GitHub Action (`cursor-lint-action`) for CI integration. This tool can be added to `npm run verify` as a post-generation check.

Limitations: `cursor-doctor` validates structure, not semantic correctness (it cannot know whether the rule content will be effective). A custom check can supplement it by verifying that required Specorator-specific fields are present (e.g., a `description` field for all agent-requested rules, a generated-file header comment).

**Codex instruction file validation.** No equivalent dedicated linter exists for Codex instruction files. The files are plain markdown (or TOML for `config.toml`). Validation can be handled by: the existing markdown linter already in the repo (for prose quality), a TOML parser for `config.toml` files, and a custom check that asserts the generated-file header comment is present.

**Verdict for Q8.** `npx cursor-doctor` covers Cursor rule structural validation and can run in `npm run verify` and CI. Codex adapter validation relies on the existing markdown linter plus a custom generated-file header check. No new external tooling dependency is needed for Codex validation beyond what already exists.

---

## Market / ecosystem

| Solution | Approach | Strengths | Weaknesses | Source |
|---|---|---|---|---|
| Manual hand-authoring (current state) | Human writes Cursor and Codex files by reading `.claude/` files | Full control; no tooling dependency | Drifts silently; requires expertise in two formats | This repo's `.codex/` state |
| awesome-cursor-rules-mdc | Community-maintained collection of example `.mdc` rule files for various frameworks | Good reference for format and content patterns | Not a generator; no connection to Specorator canonical source | [github.com/sanjeed5/awesome-cursor-rules-mdc](https://github.com/sanjeed5/awesome-cursor-rules-mdc) |
| cursor-doctor | CLI linter for `.mdc` files | No-config validation; CI-ready | Validates structure only, not semantic correctness; does not generate files | [dev.to/nedcodes](https://dev.to/nedcodes/how-to-lint-your-cursor-rules-in-ci-so-broken-rules-dont-ship-2n7a) |
| Husky + custom generation script | Pre-commit hook triggers regeneration when source files change | Enforces sync at commit time; cross-platform via Node.js | Skippable (though `--no-verify` is denied in this repo); adds commit latency | [pre-commit.com](https://pre-commit.com/) |
| Codex `model_instructions_file` + `project_doc_fallback_filenames` | Config-level pointers to instruction files | Official Codex mechanism; no generator needed for basic AGENTS.md coverage | Does not cover agent-role detail beyond AGENTS.md; requires config maintenance | [developers.openai.com/codex/config-reference](https://developers.openai.com/codex/config-reference) |
| Symlinks | Generated files are symlinks to canonical source files | Zero drift by definition | Platform inconsistency (Windows symlinks require elevated privileges or Developer Mode); Cursor and Codex may not resolve symlinks correctly; cannot apply transformations (e.g., adding frontmatter) | General knowledge |

---

## User needs

No primary user research (interviews, surveys) was conducted — this is an internal template improvement. The following assumptions must hold and will be validated through requirements and implementation:

- **Assumption A.** A Cursor user who clones the Specorator template and opens it in Cursor IDE expects the same workflow guidance that a Claude Code user gets from `.claude/agents/`. Without adapter files, they receive no agent-role context.
- **Assumption B.** Template maintainers (typically Claude Code users) are unwilling to hand-maintain two or three parallel files whenever an agent definition changes. The manual translation burden is high enough that adapters will simply not be kept current.
- **Assumption C.** A Codex user already receives adequate project-wide context from `AGENTS.md` (auto-loaded) but lacks agent-role detail and skill summaries that are buried in `.claude/` paths Codex is not directed to read.
- **Assumption D.** Drift between canonical source and generated adapters is not currently visible: no check in `npm run verify` flags it, and no CI step detects it. Stakeholders have no signal that adapters are stale.

Supporting evidence from the repository:
- `AGENTS.md` §"Tool-specific notes" explicitly acknowledges the gap ("`.cursor/rules/` optional") for Cursor and Aider, indicating the intended coverage is not yet realised.
- `docs/specorator-product/product.md` Strategic Priority 3 directly names keeping the template portable across AI coding tools as a priority, indicating stakeholder intent.
- The existing `.codex/` files are manually written and cover only Codex delivery mechanics — agent roles and skill summaries are absent.

---

## Alternatives considered

### Alternative A — Static file generation script (Node.js, on-demand)

A Node.js script (e.g., `scripts/adapters/generate.mjs`) reads source files from `.claude/agents/`, `.claude/skills/`, and `AGENTS.md`, applies a set of Mustache or template-literal templates, and writes `.mdc` files to `.cursor/rules/` and markdown files to new paths in `.codex/`. The script is invoked on demand via `npm run adapters:sync`. A separate `npm run adapters:check` script computes and compares source hashes against a manifest to detect staleness; this check is wired into `npm run verify`. A CI step runs `adapters:check` on every PR.

- **Pros.** Simple to understand and debug. No new runtime dependencies beyond Node.js (already required). On-demand invocation means the maintainer controls when generation runs. Cross-platform by construction (Node.js). Straightforward to extend with new source types. Generation and verification are cleanly separated.
- **Cons.** Relies on human discipline for `adapters:sync`; staleness is only caught at verify/CI time, not at the moment of the source change. The manifest-based drift check adds a file to maintain.
- **Feasibility note for architect.** The script can use Node.js built-in `fs`, `crypto`, and simple template literals — no framework needed. Agent `.md` files have consistent frontmatter structure amenable to parsing with a small YAML parser (e.g., `js-yaml`, already commonly used in the Node.js ecosystem).

### Alternative B — Template-based generation with a lightweight framework (EJS or Handlebars)

Same generation trigger as Alternative A (on-demand + verify check), but uses a proper template engine (EJS, Handlebars, or Nunjucks) to define the mapping from canonical source to adapter output. Templates live in a new `templates/adapters/` folder. The generation script instantiates templates with parsed agent data.

- **Pros.** Cleaner separation between generation logic (script) and output structure (templates). Easier for non-developers to modify what the generated files look like without touching script code. Template files are versioned and reviewable. Scales better if additional frameworks are added in future.
- **Cons.** Adds a runtime dependency (template engine package). More surface area to maintain than simple template literals. For the current scope (Cursor + Codex only), the additional abstraction may be premature. The template format itself needs to be learned by maintainers.
- **Feasibility note for architect.** EJS and Handlebars both have zero native Node.js dependencies and are widely used. The additional `package.json` dependency is low risk. This approach is the right choice if the scope is expected to expand to Aider and other frameworks within one or two iterations.

### Alternative C — Symlink or include approach

Generated "files" are actually symlinks pointing to the canonical source files, or the canonical source files are extended with embedded include directives that Cursor or Codex resolve at load time.

- **Pros.** Zero drift by definition — any change to the source is immediately reflected. No generation step needed. No manifest to maintain.
- **Cons.** Windows symlinks require Developer Mode or Administrator privileges, making this approach non-portable for the target user base (Windows is an explicit platform). Neither Cursor nor Codex has a documented include/transclusion mechanism for rule files. Cursor `.mdc` files require their own frontmatter (e.g., `alwaysApply`, `description`, `globs`) that cannot be present in the canonical `.claude/agents/` files without polluting them. The adapter's value-add (frontmatter routing, generated header comment, format transformation) cannot be achieved through symlinks. This alternative does not satisfy the constraints.

---

## Technical considerations

1. **Cross-platform paths.** Node.js `path` module handles forward/back slash normalisation. Scripts must avoid shell-specific commands (e.g., `cp`, `cat`) and use `fs` APIs instead. Windows Developer Mode symlink requirement rules out Alternative C and any symlink-based shortcut in Alternatives A and B.

2. **`.mdc` frontmatter generation.** Every generated Cursor rule must include at minimum `description` and `alwaysApply: false` (or `true` for project-wide rules). The generation script must decide rule type per agent: lifecycle agent rules should be `agent-requested` (description only, no globs) so the Cursor agent pulls them when relevant, not injected into every session. Always-apply token budget (≈2,000 tokens) must not be exhausted by agent rules.

3. **Generated file header.** Per the "trace everything" principle and the constraint in `idea.md`, every generated file must carry a header comment of the form `<!-- GENERATED — do not edit by hand. Source: <canonical-path>. Regenerate: npm run adapters:sync -->`. This header also serves as the sentinel for the drift check and for `cursor-doctor` validation.

4. **Codex `project_doc_fallback_filenames`.** To make generated Codex agent files discoverable, either: (a) add their names to `project_doc_fallback_filenames` in `.codex/config.toml`, or (b) reference them from `AGENTS.md` or `instructions.md` (which are already loaded). Option (b) is simpler and does not require maintainers to update `config.toml`. This is a feasibility input for the architect and pm — the exact mechanism should be decided in requirements.

5. **Cursor nested subdirectory limitation.** Generated `.cursor/rules/` files should all be placed flat at `.cursor/rules/` level, not in subdirectories, due to the known unreliability of nested rule loading documented in community forums. Agent-role rules should be named descriptively (e.g., `agent-analyst.mdc`, `agent-pm.mdc`) rather than placed in an `agents/` subfolder.

6. **Codex 32 KiB limit.** If the total size of auto-loaded Codex context (AGENTS.md + any fallback files) approaches 32 KiB, generated agent files added to the fallback list will be silently truncated. The generation script or a companion check should warn if the combined size exceeds a configurable threshold (e.g., 28 KiB as a warning waterline).

7. **CI integration.** `npm run adapters:check` should be added as a step in the existing verify workflow. No new CI workflow file is needed; the check slots into the existing `npm run verify` gate that CI already runs.

8. **`cursor-doctor` dependency.** `npx cursor-doctor` runs without a local install (fetched from npm registry). If offline CI environments are a concern, it can be added as a `devDependency` in `package.json`. This is a feasibility input for the architect.

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-ADAPT-001 | Cursor changes its `.mdc` frontmatter schema or rule-loading behaviour in a future release, silently breaking generated rules. Cursor's schema is not formally published. | med | med | Pin `cursor-doctor` version in `package.json`. Include a CI step that runs `npx cursor-doctor` on generated files after each adapter sync. Monitor Cursor changelog at each Specorator release. |
| RISK-ADAPT-002 | Generated Cursor rules consume too many tokens (always-apply budget ≈2,000 tokens), degrading Cursor response quality for users who load all agent rules. | med | med | Make all agent-role rules `agent-requested` type (not `alwaysApply: true`). Generate one always-apply rule only for project-wide conventions (small). The generation script enforces this as a hard constraint. |
| RISK-ADAPT-003 | A maintainer edits a generated file by hand, believing it will persist. The next `adapters:sync` run silently overwrites the change. | high | high | Generated file header comment explicitly warns against hand editing. A custom lint check in `npm run verify` warns if the generated header is absent or modified (indicating a hand edit). Document the one-directional flow prominently in the adapter README. |
| RISK-ADAPT-004 | Codex adds the generated agent-role files to its `project_doc_fallback_filenames`, causing total context to approach the 32 KiB ceiling, silently truncating instructions mid-file. | med | low | The generation script checks combined file sizes and emits a warning if the projected total exceeds 28 KiB. The adapter README documents the ceiling. |
| RISK-ADAPT-005 | Nested subdirectory limitation in Cursor means any future refactor that moves generated rules into subfolders breaks rule loading silently. | low | low | Enforce flat-file layout in `.cursor/rules/` via a lint check (naming convention) and document this constraint in the adapter README and ADR. |
| RISK-ADAPT-006 | The `AGENTS.md` statement that "Cursor / Aider" share `.cursor/rules/` misleads future maintainers into assuming Aider is covered. | low | med | Correct the `AGENTS.md` wording in a separate docs-only PR (does not require this feature to land first). Note this as a follow-up action in requirements. |

---

## Recommendation

**Recommended alternative: Alternative A — Static file generation script (Node.js, on-demand).**

Rationale:

1. The scope is well-bounded: Cursor and Codex only, two output formats. A template engine (Alternative B) adds abstraction and a dependency without a proportionate benefit at this scope. If Aider or other frameworks are added in a subsequent ADR, the generation script can be refactored to use templates at that point.

2. Alternative C (symlinks) is disqualified by the Windows platform constraint and by the structural requirement for `.mdc` frontmatter that cannot exist in canonical source files.

3. The layered sync strategy (on-demand script + hash-based verify check + CI gate) satisfies the drift-detection requirement without adding commit-time latency or requiring every contributor to install a pre-commit hook.

4. For the Codex side, the adapter should generate new files only (leaving `.codex/instructions.md` and `.codex/workflows/*.md` untouched), using the `project_doc_fallback_filenames` mechanism or AGENTS.md references to make them discoverable — the exact mechanism is a requirements-stage decision.

5. `cursor-doctor` (`npx cursor-doctor`) provides structural validation of generated `.mdc` files at zero configuration cost and can be wired into `npm run verify` in the same PR that ships the generation script.

**What still needs validating before requirements:**

- The exact mechanism for making generated Codex agent files discoverable (fallback filenames in `config.toml` vs. references in `AGENTS.md`) needs a decision by the pm and architect — it affects what the generation script must write.
- The naming convention for generated `.mdc` files (e.g., `agent-analyst.mdc`, `skill-verify.mdc`) needs to be agreed so the drift manifest is deterministic.
- Whether `cursor-doctor` should be a `devDependency` in `package.json` or always fetched via `npx` needs to be decided before the implementation task is written.

---

## Sources

- Cursor Rules official docs — [cursor.com/docs/context/rules](https://cursor.com/docs/context/rules)
- Cursor Rules deep dive — [mer.vin/2025/12/cursor-ide-rules-deep-dive](https://mer.vin/2025/12/cursor-ide-rules-deep-dive/)
- Cursor MDC format specification (community reference) — [github.com/sanjeed5/awesome-cursor-rules-mdc](https://github.com/sanjeed5/awesome-cursor-rules-mdc/blob/main/cursor-rules-reference.md)
- Cursor MDC best practices (forum) — [forum.cursor.com/t/my-best-practices-for-mdc-rules-and-troubleshooting](https://forum.cursor.com/t/my-best-practices-for-mdc-rules-and-troubleshooting/50526)
- Cursor nested rules subdirectory limitation (forum) — [forum.cursor.com/t/why-don-t-nested-cursor-rules-directories-work](https://forum.cursor.com/t/why-don-t-nested-cursor-rules-directories-work-for-mdc-rules/100859)
- cursor-doctor linting tool — [dev.to/nedcodes — How to Lint Your Cursor Rules in CI](https://dev.to/nedcodes/how-to-lint-your-cursor-rules-in-ci-so-broken-rules-dont-ship-2n7a)
- Codex AGENTS.md auto-loading guide — [developers.openai.com/codex/guides/agents-md](https://developers.openai.com/codex/guides/agents-md)
- Codex configuration reference (`project_doc_max_bytes`, `model_instructions_file`, `project_doc_fallback_filenames`) — [developers.openai.com/codex/config-reference](https://developers.openai.com/codex/config-reference)
- Aider conventions file loading — [aider.chat/docs/usage/conventions.html](https://aider.chat/docs/usage/conventions.html)
- Aider Cursor Rules feature request (open, unresolved as of 2026-05-03) — [github.com/Aider-AI/aider/issues/3303](https://github.com/Aider-AI/aider/issues/3303)
- Cursor token budget guidance — [medium.com/@peakvance — Guide to Cursor Rules token tax](https://medium.com/@peakvance/guide-to-cursor-rules-engineering-context-speed-and-the-token-tax-16c0560a686a)
- Pre-commit hooks vs CI for generated files — [blog.openreplay.com/automating-code-checks-with-git-pre-commit-hooks](https://blog.openreplay.com/automating-code-checks-git-pre-commit-hooks/)

---

## Quality gate

- [x] Each research question is answered or marked open.
- [x] Sources cited.
- [x] ≥ 2 alternatives explored (three explored; one disqualified).
- [x] User needs supported by evidence (assumptions explicit, grounded in repository artifacts).
- [x] Technical considerations noted.
- [x] Risks listed with severity and mitigation.
- [x] Recommendation made.
