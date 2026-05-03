---
id: IDEA-ADOPT-001
title: Repo Adoption Track — Automated Scaffold Installation for Foreign Repositories
stage: idea
feature: repo-adoption-track
status: draft
owner: analyst
created: 2026-05-03
updated: 2026-05-03
---

# Idea — Repo Adoption Track

## Problem statement

A developer who already owns or maintains a git repository — one with its own history, CI configuration, and team conventions — has no supported path to bring that repository under the Specorator workflow template. The existing tracks (Discovery, Stock-taking, Project Scaffolding) all assume the adopter is working inside the template repository itself; none of them clone a foreign repository, transplant the scaffold into it, and return a reviewable PR to the foreign remote. Today an adopter must manually copy template files, inspect conflicts, adapt CI pipelines, and open their own pull request — a process with no quality gates, no traceability, and no standardised output. The gap matters because template adoption is a high-friction moment: complexity here directly converts to abandonment. A one-shot gated pipeline (review → parity → enrich → push) that handles the mechanical installation and hands off a PR for human inspection would reduce that friction to a single command.

## Target users

- **Primary:** any developer, team, or organisation that already owns or has push access to a foreign git repository and wants to adopt the Specorator workflow template without rebuilding their repository from scratch.
- **Secondary:** downstream contributors of an adopted repository who inherit the workflow scaffold — they benefit from consistent `AGENTS.md`, `CLAUDE.md`, `specs/`, `docs/`, and `templates/` conventions without having participated in the adoption step.

## Desired outcome

An adopter runs `/adopt:start <url>` and is guided through four gated phases. After reviewing what conflicts exist (Phase 1), confirming parity of essential files (Phase 2), optionally enriching the scaffold with language-specific extras (Phase 3), and approving the final push (Phase 4), they receive a pull request on the foreign remote whose description explains every change. The PR is mergeable immediately, or the adopter knows precisely what to adjust before merging. The entire operation is auditable: a local working tree under `.worktrees/adopt-<slug>/` captures what was done and why, with a `workflow-state.md` at the root.

## Constraints

- **Time:** v1.1 scope. A single one-shot adoption path (no drift detection, no sync loop) must ship before bi-directional sync is considered. The v1.0 taxonomy must be amended first via a superseding ADR (ADR-0030, since ADR-0027 was claimed by Shape B branching adoption and ADR-0028/0029 are pre-claimed by uncommitted parallel work (multi-framework-adapters)).
- **Budget:** no external service spend; implementation uses only TypeScript scripts, `git` CLI, and `gh` CLI already present in the template's toolchain.
- **Technical:** scripts in TypeScript; all workflow artifacts in Markdown; the foreign-code working tree is gitignored under `.worktrees/adopt-<slug>/`; `gh pr create` requires the adopter to be authenticated against the foreign remote's GitHub origin; no native support planned for non-GitHub remotes.
- **Policy / compliance:** Constitution Articles VI (agent surface narrow — the adoption agent must not invent what to install), VII (human oversight — push to a foreign remote is a shared-state irreversible action requiring explicit authorisation), and IX (reversibility — the local clone is disposable; the PR is the only persistent change, and it is reversible by not merging). Agent tool list for the `repo-adoption-agent` must not be broadened without an ADR.
- **Other:** ADR-0026 freezes the v1.0 track taxonomy; adding the Repo Adoption Track as a 13th first-party track requires a superseding ADR before v1.0 ships, or explicit deferral to v1.1 with the ADR filed before implementation begins.

## Open questions

> These become the research agenda in Stage 2.

Carried forward from `workflow-state.md` open clarifications:

- **Q1 (CLAR-ADOPT-001) — ADR sequencing:** Should ADR-0030 (amending ADR-0026 to add the Repo Adoption Track as a first-party track) be filed in a predecessor PR before implementation begins, or bundled with the implementation PR? The frozen taxonomy means work cannot proceed as a "13th track" without an accepted ADR. Filing early avoids rework if the ADR is rejected; bundling avoids two-PR overhead. What is the precedent from ADR-0007, ADR-0011, and ADR-0019?

- **Q2 (CLAR-ADOPT-002) — CI port-over scope:** Does the enrichment phase (Phase 3) install `verify.yml` (or an equivalent CI workflow file) into the adopted repository? If yes, how does the enrichment handle a repo that already has CI? If no, what is the boundary between scaffold installation and project-specific CI configuration? This affects the agent's allowed tool surface and the definition of "complete adoption."

- **Q3 (CLAR-ADOPT-003) — Language-specific renderer breadth:** Should Phase 3 enrichment support one generic enrichment path or offer specialised presets for Node/TypeScript, Python, and other ecosystems? A generic path reduces scope but may install a `package.json`-based verify gate that is meaningless for Python adopters. Specialised presets add combinatorial maintenance surface. What minimum set is viable for v1.1?

Additional research questions:

- **Q4 — Template-version pin strategy:** The adoption installs a snapshot of the template at a point in time. How should the adopted repository record which template version it was initialised from? Options include a `.specorator-version` file, a comment block in `AGENTS.md`, or nothing. This affects future drift-detection work (out of scope for v1.1 but should not be designed out).

- **Q5 — License of generated content:** Files installed into the adopted repository inherit the template's MIT license (or similar). If the adopted repository uses an incompatible license, is the adopter responsible for resolving this, or should the adoption agent warn and gate? What is the legal exposure for Specorator's maintainers?

- **Q6 — Agent tool-list enforcement mechanism:** The `repo-adoption-agent` must be prevented from writing to paths outside the working tree without human confirmation. The current enforcement is `.claude/settings.json` allow/deny rules. Is that mechanism sufficient for the adoption case, where the agent operates in a cloned foreign tree rather than the template repository itself? Does an adoption run inside a worktree satisfy the constraint, or is a separate mechanism needed?

- **Q7 — Phase-gate interface:** How does a human confirm each phase gate in a CLI context (slash command returning to the user vs. a scripted pipeline)? The current Specorator pattern uses `AskUserQuestion` callbacks. Does the adoption track's four-phase gating map cleanly to that pattern, or does it need a stateful confirmation protocol?

- **Q8 — Conflict resolution ownership:** In Phase 1 (review), the agent identifies conflicts between existing repository files and template files (e.g., an existing `CLAUDE.md`). Who resolves those conflicts — the agent (within defined rules), the human (interactively), or a merge strategy file checked into the template? How are resolution decisions recorded for traceability?

- **Q9 — Non-GitHub remotes:** The brief scopes to GitHub (`gh pr create`). What is the failure mode when the foreign remote is GitLab, Bitbucket, or a self-hosted instance? Should the agent fail loudly and clearly, or offer a partial path (local branch + instructions)?

- **Q10 — Relation to Project Scaffolding Track:** The Project Scaffolding Track and the Repo Adoption Track both operate on existing material. The Scaffolding Track reads documents and produces starter-pack drafts; the Adoption Track clones a live repository and installs files. Are there shared concerns (e.g., source inventory, conflict detection) that should be extracted into shared methodology, or are the two tracks sufficiently different to remain fully independent?

## Out of scope (preliminary)

- **Drift detection:** monitoring an adopted repository for divergence from the template after the initial PR is merged. Explicitly a post-v1.1 concern.
- **Bi-directional sync:** propagating changes from the adopted repository back to the template. Out of scope indefinitely.
- **Fork-PR mode:** where the adoption agent forks the foreign repository rather than operating against the upstream remote. Not planned.
- **Multi-PR phase split:** opening one PR per phase rather than a single adoption PR. Adds complexity; deferred unless a concrete use case emerges.
- **Monorepo sub-project adoption:** adopting a sub-directory within a monorepo rather than the repository root. Out of scope for v1.1.
- **Non-git VCS:** Mercurial, SVN, Perforce. Not planned.
- **Non-GitHub remotes for `gh pr create`:** GitLab, Bitbucket, and self-hosted Git forges. The adoption agent uses `gh` exclusively in v1.1; other remotes are a future extension.
- **Custom user-defined preset manifests:** allowing adopters to supply their own enrichment preset files at invocation time. The v1.1 preset set is template-defined only.
- **Auto-extracting `inputs/` archives:** consistent with `docs/inputs-ingestion.md`, the adoption track will never auto-extract archives from `inputs/`; extraction requires explicit approval.

## References

- Upstream design material: `docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md` (produced via superpowers brainstorming, not Specorator Improvement Track; treated as research input only — see GitHub issue #258)
- GitHub issue #257 — Repo Adoption Track tracking issue
- GitHub issue #258 — Process bug: repo-adoption design produced via wrong workflow
- ADR-0026 — Freeze the v1.0 workflow track taxonomy (the frozen taxonomy this work must amend)
- `docs/stock-taking-track.md` — sister track for brownfield system inventory (reads existing system, does not install files)
- `docs/project-scaffolding-track.md` — sister track for document-driven onboarding (reads documents, does not clone repositories)
- `docs/inputs-ingestion.md` — cross-track contract for the `inputs/` ingestion folder (auto-extract prohibition applies here too)

---

## Quality gate

- [x] Problem statement is one paragraph and understandable to a non-expert.
- [x] Target users named.
- [x] Desired outcome stated.
- [x] Constraints listed.
- [x] Open questions captured.
- [x] Scope is bounded — no "boil the ocean" framing.
