---
title: Obsidian as opt-in UI layer for the Specorator template
date: 2026-04-29
status: draft
phase: design (pre-/spec:idea)
authors:
  - human + claude (brainstorming)
related:
  - docs/sink.md
  - memory/constitution.md
  - .claude/memory/MEMORY.md
---

# Obsidian as opt-in UI layer

## Problem

The Specorator repo is markdown-native: every artifact under `specs/`, `docs/`, `projects/`, `discovery/`, `portfolio/`, `roadmaps/`, `quality/`, `sales/`, `stock-taking/`, and `scaffolding/` is markdown with YAML frontmatter, version-controlled in git and quality-assured by GitHub Actions. There is no UI for navigating, querying, or visualising the workflow state — readers fall back to terminal `ls` / `grep` and a text editor.

A team adopting the template needs:

- **Onboarding** — a new contributor opens the repo and immediately sees what stage every feature is in, what ADRs exist, what's defined in the glossary, and which followups are open.
- **Authoring** — a contributor writes a new ADR / glossary entry / spec with frontmatter pre-filled, lands in the correct sink path.
- **Navigating** — a contributor finds related artifacts via live queries (e.g., "all REQ-AUTH-* across specs", "all open followups", "ADRs touching architecture") and sees relationships visually.

Obsidian is a good fit: it treats a folder of markdown as a vault, supports YAML frontmatter natively, has Bases (live database-style queries over frontmatter), Canvas (spatial freeform layouts), backlinks, and graph view out of the box. The repo is *already* an Obsidian vault — it just needs setup.

## Scope

**In scope (phase 1):**
- Vault config conventions (`.obsidian/` ignored, per-user state stays local).
- Setup guide explaining how to open the repo as a vault and which plugins to install.
- Curated, committed Bases queries over existing frontmatter (`specs.base`, `adrs.base`, `glossary.base`, `followups.base`).
- Curated, committed Canvas layouts (`home.canvas`, `lifecycle.canvas`).
- ADR recording the decision to add Obsidian as the official opt-in UI layer.
- Sink doc updated with new paths.
- CI guard against accidentally committing per-user vault state.

**Out of scope (deferred):**
- Custom Obsidian plugin to surface workflow state, dispatch slash commands, or embed an agent UI. Will be specced separately in a future feature.
- Templater / QuickAdd / Shell-commands plugin integration that wraps `/spec:*`, `/adr:new`, `/glossary:new`, etc. Authoring stays in the terminal in v0.1.
- Any opinion about which non-core Obsidian plugins users *must* install.
- Any guardrails inside Obsidian against breaking the workflow state machine — v0.1 trusts the user.

## Goals

1. A team member can clone the repo, install Obsidian, follow the setup guide, and reach a populated dashboard with working Bases + Canvas in under 10 minutes.
2. The repo's canonical artifacts and frontmatter schema are unchanged. Bases consume existing frontmatter; the Obsidian layer introduces no new required keys.
3. Per-user vault state never leaks into git.
4. Future additions (more Bases, more Canvases) ship as their own PRs without touching unrelated parts of the template.

## Non-goals

- Replacing the terminal or slash commands as the workflow control plane.
- Enforcing Obsidian as the only UI. The repo remains usable from any markdown-aware editor.
- Bidirectional schema enforcement. Users may add custom frontmatter via Obsidian's property editor; the workflow tolerates unknown keys.

## Approach

**Approach 1 — Thin scaffolding (selected).** A single PR ships:
- ADR-0013 recording the decision.
- `docs/obsidian/README.md` — setup guide, plugin recommendations (core: Bases, Canvas; optional: Templater, Dataview as fallback for older Obsidian versions), screenshot, manual acceptance checklist, link to ADR.
- `templates/obsidian/bases/{specs,adrs,glossary,followups}.base` — four Bases queries over existing frontmatter.
- `templates/obsidian/canvas/{home,lifecycle}.canvas` — two Canvas files.
- `.gitignore` adds `.obsidian/` and `.trash/`.
- `docs/sink.md` rows for `docs/obsidian/` and `templates/obsidian/`.
- `scripts/check-no-obsidian-state.mjs` plus its test, wired into the verify gate, validating that no `.obsidian/` files are tracked and that shipped `.base` / `.canvas` files parse.

**Approaches considered and rejected:**

- **Approach 2 — Scaffolding + authoring helpers.** Add Templater snippets that wrap `/adr:new`, `/glossary:new`, `/spec:start`. Rejected for v0.1: duplicates slash-command logic, drift risk between Templater and the canonical commands, larger review surface. Reconsider in phase 2.
- **Approach 3 — Progressive ship across 4 PRs.** Split setup, Bases, Canvas, sink updates into separate PRs to honour "gradual rollout" literally. Rejected: 4× review overhead, slower convergence on a coherent first cut. The same gradual-rollout intent is achieved by deferring phase 2 (custom plugin) and shipping future Bases / Canvases as their own PRs.

## Architecture

```
Repo (markdown + git + CI)
├── canonical artifacts (specs/, docs/, projects/, ...)
├── slash commands + agents (.claude/)
├── vault gitignore (.obsidian/, .trash/)
└── Obsidian layer
    ├── docs/obsidian/README.md          ← setup guide, plugin recs, manual acceptance
    └── templates/obsidian/
        ├── bases/                        ← live queries (read + property edit)
        │   ├── specs.base
        │   ├── adrs.base
        │   ├── glossary.base
        │   └── followups.base
        └── canvas/                       ← spatial layouts
            ├── home.canvas
            └── lifecycle.canvas
```

**Boundary:**
- Repo owns canonical artifacts and frontmatter schema.
- Obsidian layer owns vault config recommendations and committed Bases / Canvas files.
- Slash commands and agents are unchanged. They tolerate user-added frontmatter keys (already do — schema is permissive).
- No Obsidian-specific files outside `docs/obsidian/` and `templates/obsidian/`.

**User flow:**
1. Clone repo.
2. Install Obsidian.
3. Open the repo folder as a vault.
4. Install recommended community plugins (or use core if version supports it).
5. Copy `templates/obsidian/bases/*.base` and `templates/obsidian/canvas/*.canvas` into the vault location of choice (vault root, or a dedicated folder the user picks).
6. Open `home.canvas`. Read.

## Components

| Component | Path | Purpose |
|---|---|---|
| Setup guide | `docs/obsidian/README.md` | Folder entry point with frontmatter (`title`, `folder`, `description`, `entry_point: true`). Install steps, plugin list, import instructions, screenshot, manual acceptance checklist, link to ADR-0013. |
| Specs Base | `templates/obsidian/bases/specs.base` | Table over `specs/*/workflow-state.md`. Columns: `feature`, `area`, `current_stage`, `status`, `last_updated`, `last_agent`. Default filter: `status == "active"`. |
| ADRs Base | `templates/obsidian/bases/adrs.base` | Table over `docs/adr/*.md`. Columns: `id`, `title`, `status`, `date`, `supersedes`, `superseded-by`. Default sort: `id` asc. |
| Glossary Base | `templates/obsidian/bases/glossary.base` | Table over `docs/glossary/*.md`. Columns: `term`, `aliases`, `status`, `last-updated`, `tags`. Default sort: `term` asc. |
| Followups Base | `templates/obsidian/bases/followups.base` | Table over `projects/*/followup-register.md`. Columns: `id`, `type`, `owner`, `status`, `due`. Empty until Project Manager Track is in use. |
| Home Canvas | `templates/obsidian/canvas/home.canvas` | Landing hub. Cards link to README, AGENTS, constitution, MEMORY index, sink, traceability docs, ADR index, glossary index, each Base, each track doc. |
| Lifecycle Canvas | `templates/obsidian/canvas/lifecycle.canvas` | Stages 1–11 as labelled nodes wired with edges showing artifact flow. Side branches show optional tracks (Stock-taking, Discovery, Sales, Project, Roadmap, Portfolio, Quality, Scaffolding). |
| Gitignore additions | `.gitignore` | `.obsidian/` and `.trash/`. |
| Sink updates | `docs/sink.md` | Rows for `docs/obsidian/` and `templates/obsidian/` under Layout + Ownership tables. |
| ADR-0013 | `docs/adr/0013-add-obsidian-as-ui-layer.md` | Records the decision. Status: proposed. Numbering after current ADR-0012. |
| State guard script | `scripts/check-no-obsidian-state.mjs` | Greps tracked-file list; fails if any `.obsidian/` or `.trash/` path appears. Also parses each shipped `.base` (YAML) and `.canvas` (JSON). |
| State guard test | `tests/scripts/check-no-obsidian-state.test.mjs` | Clean repo passes, tracked `.obsidian/workspace.json` fails, malformed `.base` / `.canvas` fail. |
| Verify-gate wiring | `package.json` | Adds the new script to the existing verify pipeline. |

## Data flow

```
Author runs /spec:* | /adr:new | /glossary:new (terminal)
        │
        ▼
Markdown artifact created/updated under specs/, docs/, projects/, ...
        │
        ▼
Frontmatter (YAML) + body persisted; git tracks change
        │
        ▼
─────────────────────────────────────────────
Obsidian vault (= repo root, .obsidian/ ignored)
  ├─ Bases reads frontmatter live → table view (also supports inline edit)
  ├─ Canvas reads file links → spatial view
  └─ Backlinks/graph reads [[wikilinks]] + plain links
        │
        ▼
Reader navigates, edits inline, or drops to terminal for stage transitions
```

**Edit paths (v0.1 stance — full user control):**
- User has full edit authority in Obsidian — frontmatter, body, properties, state — via Bases UI, the property editor, or text editing.
- Slash commands remain the *recommended* path for stage transitions and new-artifact creation (frontmatter pre-fill, sink path correctness, downstream agent inputs preserved). The setup guide says so but does not enforce.
- If the user breaks workflow state via Obsidian, that is user error in v0.1. CI / git revert is the recovery path. Phase 2 plugin is where guardrails could come back.

**Invariants:**
- Bases and Canvas are bidirectional editing surfaces — Bases especially, because the user can add new frontmatter keys through the property editor.
- New user-added frontmatter keys are tolerated by agents (the schema is already permissive). Such keys remain user-owned and are not consumed by workflow agents until promoted into the canonical schema via an ADR.
- `.obsidian/` per-user state stays local and never reaches git.

## Error handling

Phase 1 has no runtime — only markdown, git, and CI. "Errors" are misuse and drift.

| Category | Symptom | Detection | Recovery |
|---|---|---|---|
| User breaks workflow state via Obsidian edit | `workflow-state.md` frontmatter inconsistent with stage artifacts | Existing CI checks (`npm run check:frontmatter`, schema validators) fail on PR | User reverts via git or fixes by hand. Setup guide warns. |
| Plugin compatibility break | Obsidian or Bases version bump breaks committed `.base` / `.canvas` | User opens vault, sees broken view | Setup guide pins "tested with Obsidian X.Y / Bases vN". ADR-0013 records compatibility risk. PR updates committed files when Obsidian releases break compatibility. |
| `.obsidian/` accidentally committed | Vault state leaks across users | `scripts/check-no-obsidian-state.mjs` fails CI | `git rm --cached`, push fix. |
| Bases query references missing path | Empty Base when no artifacts exist (e.g., `followups.base` on a repo with no projects) | Empty table renders | Documented as expected — "empty until track is used." No remediation needed. |

## Testing

| Layer | What | How |
|---|---|---|
| Existing frontmatter check | `docs/obsidian/README.md` validates against folder entry-point rules | `npm run check:frontmatter` (already wired). New setup guide must include `title`, `folder`, `description`, `entry_point: true`. |
| New tracked-files check | No `.obsidian/` or `.trash/` paths are tracked; shipped `.base` and `.canvas` parse cleanly | `scripts/check-no-obsidian-state.mjs` + `tests/scripts/check-no-obsidian-state.test.mjs`. Wired into the verify gate. |
| Manual acceptance | Vault opens, plugins install, Bases render rows, Canvas opens with resolvable links | Checklist in `docs/obsidian/README.md`; future PRs that change the layer must walk the checklist before merge. |
| ADR acceptance criterion | Onboarding takes ≤10 minutes from clone to populated dashboard | Recorded in ADR-0013 consequences; revisited at next retrospective if the layer ships. |

No unit tests for the markdown content itself — that is data, not logic.

## Open questions

- Exact Bases YAML syntax depends on Obsidian Bases release (1.0+); the implementation pass should pin a tested version in the setup guide and freeze the `.base` shape against it.
- Whether `templates/obsidian/` should ship a third "imports" Canvas linking to all shipped Bases for users who want a single import surface — defer to plan stage.
- Whether the `Followups Base` should also query `projects/<*>/health-register.md` and `roadmaps/<*>/communication-log.md` — defer to plan stage, lean toward "no, keep first cut tight."

## Risks

- **Obsidian compatibility churn.** Bases is a relatively new feature. Format may change. Mitigation: pin tested version in setup guide; treat `.base` files as living artifacts updated when Obsidian breaks them.
- **User-added frontmatter polluting agent reads.** Agents tolerate unknown keys today; if agents start to fail on extra keys, that is a separate hardening task, not a v0.1 concern.
- **Plugin recommendation drift.** Recommended plugin set may change as Obsidian core absorbs features (Bases moved from community to core in 2024–2025). Setup guide should note "core if available, else community". Revisit annually.

## Acceptance criteria for the implementation PR

1. ADR-0013 is filed with status `proposed`, includes the alternatives section.
2. `docs/obsidian/README.md` exists with required folder entry-point frontmatter and includes the manual acceptance checklist.
3. Four `.base` files and two `.canvas` files exist under `templates/obsidian/`.
4. `.gitignore` ignores `.obsidian/` and `.trash/`.
5. `docs/sink.md` includes rows for both new paths.
6. `scripts/check-no-obsidian-state.mjs` and its test are present and wired into the verify gate.
7. `npm run check:frontmatter` passes.
8. The new check passes locally and in CI.
9. Manual acceptance checklist walked once by the author and recorded in the PR description.
