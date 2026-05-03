---
id: IDEA-ADAPT-001
title: Multi-Framework Adapters for Cursor and Codex
stage: idea
feature: multi-framework-adapters
status: accepted
owner: analyst
created: 2026-05-03
updated: 2026-05-03
---

# Idea — Multi-Framework Adapters for Cursor and Codex

## Problem statement

The Specorator template is built and maintained through Claude Code: agents live under `.claude/agents/`, skills under `.claude/skills/`, and permissions in `.claude/settings.json`. Teams that adopt the template but work with Cursor or Codex must either ignore those richer surfaces or hand-translate them manually into `.cursor/rules/` and `.codex/` equivalents. That manual translation drifts silently — when the canonical Claude files change, the Cursor and Codex copies do not update with them. The result is that non-Claude-Code users receive a degraded, inconsistent view of the workflow, which undermines the strategic goal of keeping Specorator portable across AI coding tools while preserving `AGENTS.md` and the workflow docs as a single source of truth.

## Target users

- **Primary:** Template maintainers (typically Claude Code users on the main branch) who keep the `.claude/` surfaces current and need a low-friction mechanism to propagate those changes to peer frameworks without manual authoring.
- **Secondary:** Cursor and Codex users who adopt the template and expect the same workflow guidance, role scoping, and quality-gate instructions that Claude Code users get — without needing to understand or edit the Claude-specific folder structure.

## Desired outcome

After this feature is built and adopted:

1. A maintainer running a single script (or skill invocation) regenerates up-to-date Cursor rules and Codex instruction/workflow files from the canonical `.claude/` source, with no manual editing required.
2. A Cursor user opening the repo receives `.cursor/rules/` files that cover at minimum: project-wide operating rules (derived from `AGENTS.md`), role-specific rules for each agent (derived from `.claude/agents/`), and workflow procedure files for each lifecycle stage.
3. A Codex user receives `.codex/` instruction and workflow files that are structurally consistent with what the hand-authored files already provide, extended to cover agent roles and skill summaries.
4. The canonical Claude files are unchanged and continue to be the authoritative source; framework adapter files are clearly marked as generated artifacts.
5. Drift between the canonical source and generated outputs is detectable — either by a check in `npm run verify` or by a CI signal — so a stale adapter does not go unnoticed.

## Constraints

- **Technical — additive only:** Adapter scripts must not modify any file under `.claude/`, `AGENTS.md`, `CLAUDE.md`, or `memory/constitution.md`. The canonical baseline must remain untouched.
- **Technical — cross-platform paths:** Scripts must run on Windows (PowerShell) and macOS/Linux (POSIX shell) or be implemented in a cross-platform runtime (e.g., Node.js) consistent with the existing `npm run verify` toolchain.
- **Technical — sync strategy TBD:** Whether adapters are regenerated on-demand (script), on commit (git hook), or in CI (workflow) is an open question for research. The mechanism must integrate with the existing `npm run verify` gate without breaking it.
- **Technical — Cursor rules format TBD:** Cursor's `.cursor/rules/` format and its loading semantics (global vs. per-file vs. per-folder scoping) need to be confirmed. Rule length or token limits, if any, affect how fine-grained agent derivation can be.
- **Technical — Codex context loading TBD:** Codex already reads `AGENTS.md` directly and has hand-authored files in `.codex/instructions.md` and `.codex/workflows/`. The relationship between generated files and the existing hand-authored ones must be defined (replace, extend, or complement).
- **Policy — new frameworks require ADR:** Adding support for any framework beyond Cursor and Codex (e.g., Aider, Copilot, Gemini) is an irreversible template-scope change and must go through an ADR. This feature covers only Cursor and Codex v1.
- **Policy — generated files must be marked:** Generated adapter files must carry a header comment identifying them as generated and pointing to the canonical source, consistent with the "trace everything" principle.
- **Other — template-improvement scope:** Changes land in `docs/`, `templates/`, and `.claude/` only as template improvements per `CLAUDE.md`. The scripts and generated output folders (`.cursor/rules/`, `.codex/` additions) are template deliverables.

## Open questions

> These become the research agenda in Stage 2.

- Q1 — **Cursor rules format:** What does `.cursor/rules/` support today (file naming, frontmatter, glob scoping, rule types, token or length limits)? Are there documented best practices for structuring rules derived from large context sources?
- Q2 — **Codex context model:** Does Codex load `.codex/instructions.md` automatically, or does the user/operator configure context loading? If automatic, what is the file-size or file-count ceiling before context is truncated?
- Q3 — **Sync strategy:** What is the least-friction, most-reliable mechanism for keeping generated files current — on-demand script, pre-commit hook, or CI check? What are the tradeoffs for a team with mixed OS environments?
- Q4 — **Drift detection:** Is a hash-based or content-diff check sufficient to detect adapter staleness during `npm run verify`, or does the check need to regenerate and compare?
- Q5 — **Codex hand-authored overlap:** `.codex/instructions.md` and `.codex/workflows/pr-delivery.md` are already hand-authored and working. Should the adapter extend them (appending generated agent-role sections), replace them from source, or leave them as-is and only generate new files for agent and skill coverage?
- Q6 — **Aider:** `AGENTS.md` already mentions "Cursor / Aider" as sharing `.cursor/rules/`. Does Aider consume `.cursor/rules/` directly, or does it need its own adapter? Should Aider be in or out of this feature's scope?
- Q7 — **Cursor MDC vs plain markdown:** Cursor introduced `.mdc` (Markdown with Cursor frontmatter) files in addition to plain `.md` rules. Which format is current, and does Specorator need to adopt it?
- Q8 — **Validation of generated output:** What tooling exists (if any) to validate that a generated Cursor rule or Codex instruction file is well-formed? Can an existing linter cover it, or does a custom check need to be written?

## Out of scope (preliminary)

- Runtime agent orchestration across frameworks — this feature does not make Cursor agents "aware of" Claude Code agents at execution time; it only provides configuration files.
- GUI or web tooling for adapter management; all mechanics are CLI/script-level.
- Adapters for frameworks other than Cursor and Codex (Aider, Copilot, Gemini, etc.) in this iteration — each would require its own ADR.
- Automatic two-way sync (Cursor/Codex edits propagating back to `.claude/`); flow is one-directional: canonical baseline → adapters.
- Generating Specorator workflow templates or `templates/` files for other frameworks; the adapters cover AI tool configuration, not the artifact templates.
- Changes to the core Specorator lifecycle stages or agent scopes; this is a delivery-layer concern only.

## References

- `AGENTS.md` §"Tool-specific notes" — current statement of framework coverage and gaps
- `.codex/README.md` — entry point for existing Codex context; defines the load order and scope of `.codex/`
- `.codex/instructions.md` — hand-authored Codex default posture, context loading, and safety rails
- `.codex/workflows/pr-delivery.md` — existing Codex workflow file (example of what Cursor equivalent would look like)
- `CLAUDE.md` — Claude Code entry point; `@`-imports constitution, memory index, and product steering
- `.claude/agents/` — canonical agent definitions that adapters would derive from
- `.claude/skills/` — canonical skill definitions; coverage in adapters is TBD
- `docs/specorator-product/product.md` §"Strategic Priorities" — priority 3: "Keep the template portable across AI coding tools while preserving `AGENTS.md` and the workflow docs as source of truth"
- `docs/specorator-product/product.md` §"Non-Goals" — "Do not fragment the method into independent tool-specific manuals"
- `docs/sink.md` — canonical record of where artifacts land; adapter output folders must be registered here

---

## Quality gate

- [x] Problem statement is one paragraph and understandable to a non-expert.
- [x] Target users named.
- [x] Desired outcome stated.
- [x] Constraints listed.
- [x] Open questions captured.
- [x] Scope is bounded — no "boil the ocean" framing.
