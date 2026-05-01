---
id: DESIGN-V06-001
title: Version 0.6 productization and trust plan - Design
stage: design
feature: version-0-6-plan
status: accepted
owner: architect
inputs:
  - PRD-V06-001
created: 2026-05-01
updated: 2026-05-01
---

# Design - Version 0.6 productization and trust plan

## Product shape

v0.6 has six connected slices:

1. **Steering profile:** make this repository's own product steering concrete while preserving blank downstream templates.
2. **Golden-path proof:** replace desk-only tutorial confidence with verified demo evidence.
3. **Cross-tool adapters:** make Copilot, Codex, Cursor/Aider-style consumers first-class without fragmenting the source of truth.
4. **Hook packs:** provide opt-in deterministic guardrails for worktree, branch, Markdown, secret, and risky-command checks.
5. **Agentic security review:** add an OWASP-aligned review path for risks unique to autonomous tool-using agents.
6. **Adoption and positioning:** add persona adoption profiles and evidence-first public messaging.

## Steering model

The current `docs/steering/*.md` files are blank adopter templates. v0.6 should avoid losing that template value while still documenting Specorator's own product reality.

Recommended shape:

| Surface | Purpose |
|---|---|
| `docs/steering/README.md` | Explain downstream steering and link to examples. |
| `docs/steering/*.md` | Remain starter templates for adopters unless maintainers decide to move template copies elsewhere. |
| `docs/specorator-product/` or equivalent | Hold Specorator's own product, UX, tech, quality, and operations steering profile. |
| `AGENTS.md` / `CLAUDE.md` | Point agents to the right steering source for template improvements. |

If the project chooses to repurpose `docs/steering/*.md` for Specorator itself, it should add blank templates elsewhere in the same change.

## Golden-path model

The golden path should prove one small workflow end to end without making contributors run a long interactive session on every PR.

Recommended layers:

| Layer | Behavior |
|---|---|
| Tutorial | Human-readable walkthrough, updated after live execution. |
| Example artifacts | A complete or near-complete `examples/<slug>/` workflow showing accepted outputs. |
| Deterministic check | Validates the example's state, traceability, links, and frontmatter. |
| Evidence note | Records date, commit, commands, and caveats from the live run. |

CI can initially validate the artifacts and evidence note. Fully automating the interactive tutorial can be a later promotion if the run stabilizes.

## Cross-tool adapter model

Adapters should be thin projections, not independent methodologies.

| Tool surface | Candidate path | Role |
|---|---|---|
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/agents/`, `.github/skills/` | GitHub-native instructions, agents, and skills. |
| Codex | `.codex/`, `.agents/skills/`, plugin package | Codex-specific delivery mechanics and installable reusable workflows. |
| Cursor / Aider / generic agents | `.cursor/rules/`, `.aider.conf.yml`, `AGENTS.md` references | Thin pointers to canonical rules and manual stage order. |
| All tools | `AGENTS.md`, `docs/workflow-overview.md`, `templates/` | Canonical shared workflow and artifact contract. |

The adapter docs should state what is authoritative and what is generated or maintained manually.

## Hook pack model

Hooks should start opt-in and advisory. Suggested packs:

| Pack | Trigger class | Initial behavior |
|---|---|---|
| Worktree guard | session start / pre-tool use | Warn when working outside `.worktrees/<slug>` for non-trivial edits. |
| Branch guard | pre-git operation | Warn or block direct commits/pushes to `main` or `develop`. |
| Markdown guard | post-edit / stop | Run targeted frontmatter, link, spec-state, or product-page checks. |
| Secret/risky command guard | pre-tool use | Warn on suspicious secrets, destructive commands, or release/publish operations. |
| Handoff context | session start | Surface current workflow-state and open clarifications. |

Blocking behavior should require explicit maintainer promotion after false positives are understood.

## Agentic security review model

The first version should be an optional workflow/checklist, not a claim of complete security. It can live as a dedicated doc, QA checklist extension, or skill. Minimum review categories:

- Goal and instruction hijacking.
- Tool misuse, unsafe permissions, and destructive operations.
- Excessive agency and missing human authorization.
- Memory, context, or artifact poisoning.
- Secrets, credentials, and private data exposure.
- Inter-agent handoff failures and unreviewed autonomous outputs.
- Observability and audit trail for agent actions.

The review should produce findings, mitigations, residual risk, and follow-up actions.

## Adoption profile model

Profiles should be short maps to existing surfaces:

| Profile | Minimal path |
|---|---|
| Solo builder | Start with README, tutorial, `orchestrate`, local verify, one feature. |
| Product team | Discovery, requirements, design, roadmap, review gates. |
| Agency/client delivery | Sales, project manager track, lifecycle, QA review, release notes. |
| Enterprise governance | Quality metrics, agentic security, hooks, ADRs, CI, release workflow. |
| Brownfield migration | Project scaffolding, stock-taking, discovery, first tracer-bullet feature. |

## ADR impact

An ADR is likely required if v0.6 makes hooks mandatory, changes canonical steering ownership, or introduces a new formal workflow track. No ADR is required for docs-only adapter pointers, optional checklists, or non-blocking hook examples.

## Risks and mitigations

- RISK-V06-001: Keep adapters thin and verify source-of-truth references.
- RISK-V06-002: Start hook packs in advisory mode and document disable paths.
- RISK-V06-003: State security limits and avoid certification language.
- RISK-V06-004: Validate golden-path artifacts before attempting full CI automation.
- RISK-V06-005: Keep adoption profiles as maps, not duplicate manuals.
- RISK-V06-006: Track ISO 9001:2026 without updating QA requirements before final publication.
