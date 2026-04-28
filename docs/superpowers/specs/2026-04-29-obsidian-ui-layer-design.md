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
  - docs/adr/0010-shard-glossary-into-one-file-per-term.md
---

# Obsidian as opt-in UI layer

## Problem

The Specorator repo is markdown-native: every artifact under `specs/`, `docs/`, `projects/`, `discovery/`, `portfolio/`, `roadmaps/`, `quality/`, `sales/`, `stock-taking/`, and `scaffolding/` is markdown with YAML frontmatter, version-controlled in git and quality-assured by GitHub Actions. There is no UI for navigating, querying, or visualising the workflow state — readers fall back to terminal `ls` / `grep` and a text editor.

A team adopting the template needs:

- **Onboarding** — a new contributor opens the repo and immediately sees what stage every feature is in, what ADRs exist, and what's defined in the glossary.
- **Authoring** — a contributor edits artifacts with frontmatter awareness; new artifacts still go through the canonical slash commands.
- **Navigating** — a contributor finds related artifacts via live queries (e.g., "all REQ-AUTH-* across specs", "ADRs touching architecture") and sees relationships visually.

Obsidian fits: it treats a folder of markdown as a vault, supports YAML frontmatter natively, has Bases (live database-style queries over frontmatter), Canvas (spatial freeform layouts), backlinks, and graph view out of the box. The repo is *already* an Obsidian vault — it just needs setup.

Reversibility note (Constitution Article IX): phase 1 is fully reversible. Removing the layer is `rm -r docs/obsidian/` plus a `.gitignore` revert; canonical artifacts are untouched.

## Bases data-model constraint (load-bearing)

Obsidian Bases queries operate at **file granularity** — one row per file matched by the filter, columns sourced from each file's YAML frontmatter. Bases cannot synthesise rows from sections or tables *within* a single markdown file.

This means the Specorator artifacts split cleanly into two shapes:

- **File-per-entity (Bases-friendly):** `specs/<slug>/workflow-state.md` (one file per spec), `docs/adr/<NNNN>-*.md` (one file per ADR), `docs/glossary/<slug>.md` (one file per term, per ADR-0010). Each file represents one row in the natural Base.
- **File-per-log (Bases-incompatible without sharding):** `projects/<*>/followup-register.md`, `projects/<*>/health-register.md`, `projects/<*>/weekly-log.md`, `roadmaps/<*>/decision-log.md`, `roadmaps/<*>/communication-log.md`, `quality/<*>/improvement-plan.md`. Each of these is a single file containing many entries (markdown sections or tables). A Base over these yields one row per *register file*, not per *entry* — useless for the dashboard intent.

Phase 1 ships Bases only over the file-per-entity artifacts (specs, ADRs, glossary). A separate ADR (ADR-0014) is filed in the same PR proposing a shard pattern for log-shaped artifacts, modelled on ADR-0010's glossary shard. Implementation of that shard is deferred — each track shards on its own PR cadence, and a per-track Base is added when its register is sharded. ADR-0014's status starts as `proposed`.

## Scope

**In scope (phase 1):**
- Vault config conventions (`.obsidian/` and `.trash/` ignored; per-user state stays local).
- Setup guide explaining how to open the repo as a vault, which Obsidian version to use, and which plugins to install.
- Curated, committed Bases queries over file-per-entity artifacts: `specs.base`, `adrs.base`, `glossary.base`. **Three Bases**, not four — the followup Base is dropped from phase 1 because of the file-per-log constraint above.
- Curated, committed Canvas layouts (`home.canvas`, `lifecycle.canvas`).
- ADR-0013 recording the decision to add Obsidian as the official opt-in UI layer.
- ADR-0014 (status: `proposed`) recording the shard pattern for log-shaped artifacts so that Bases dashboards can cover follow-ups, decisions, and improvement plans on future per-track PRs. **Decision recorded; implementation deferred.**
- Sink doc updated with new paths, Ownership rows, and a narrative sub-section for the Obsidian UI layer.
- New CI guard (`check:obsidian-assets`) covering: no `.obsidian/` or `.trash/` files tracked, every shipped `.base` parses as YAML, every shipped `.canvas` parses as JSON. Wired into the existing verify-gate via `scripts/lib/tasks.ts` and `package.json`.

**Out of scope (deferred):**
- Custom Obsidian plugin to surface workflow state, dispatch slash commands, or embed an agent UI. Will be specced separately.
- Templater / QuickAdd / Shell-commands plugin integration that wraps `/spec:*`, `/adr:new`, `/glossary:new`, etc. Authoring stays in the terminal in v0.1.
- Opinions about which non-core Obsidian plugins users *must* install beyond the recommended baseline.
- Any guardrails inside Obsidian against breaking the workflow state machine — v0.1 trusts the user with full edit authority.
- Any Bases query over file-per-log artifacts (followups, health, weekly log, decisions, communication, improvement). These wait for ADR-0014 to be accepted and the relevant track's register sharded into one-file-per-entry. Each track's shard + Base ships in its own future PR.

## Goals

1. From `git clone` to a rendered `Specs Base` showing ≥1 row, with Bases and Canvas plugins enabled and `home.canvas` opened, in under 10 minutes — without the user manually editing any JSON, YAML, or symlinks.
2. The repo's canonical artifacts and frontmatter schema have **no required schema change** in phase 1. Bases consume existing file-per-entity frontmatter; the Obsidian layer introduces no new required keys. Users may add optional keys via Bases' property editor — those are user-owned and ignored by agents until promoted via ADR.
3. Per-user vault state never leaks into git.
4. Future additions (more Bases over freshly-sharded artifacts, more Canvases) ship as their own PRs without touching unrelated parts of the template.
5. The shard pattern for log-shaped artifacts is recorded as an accepted-or-proposed ADR so that future per-track shards have an architectural precedent and don't have to re-litigate the decision.

## Non-goals

- Replacing the terminal or slash commands as the workflow control plane.
- Enforcing Obsidian as the only UI. The repo remains usable from any markdown-aware editor.
- Bidirectional schema enforcement. Users may add custom frontmatter via Obsidian's property editor; the workflow tolerates unknown keys.
- Implementing the log-shaped-artifact shard in phase 1. ADR-0014 records the decision; per-track migration is deferred.

## Approach

**Approach 1 — Thin scaffolding, in-place assets, three Bases, two ADRs (selected).** Obsidian is opened on the repo root, so committed Bases and Canvas live at paths Obsidian opens by default. No copy step.

A single PR ships:
- ADR-0013 recording the Obsidian-as-UI-layer decision (cross-references ADR-0010 since glossary sharding shaped `glossary.base`, and ADR-0014 because both decisions land in the same PR).
- ADR-0014 (status: `proposed`) recording the shard pattern for log-shaped artifacts. Lists each affected register, names the precedent (ADR-0010), explicitly defers implementation.
- `docs/obsidian/README.md` — setup guide with required folder entry-point frontmatter, Obsidian version pin, plugin recommendations, screenshot, manual acceptance checklist, link to ADR-0013 + ADR-0014.
- `docs/obsidian/bases/{specs,adrs,glossary}.base` — three Bases queries (in-place, no copy step required).
- `docs/obsidian/canvas/{home,lifecycle}.canvas` — two Canvas files (in-place).
- `.gitignore` adds `.obsidian/` and `.trash/`.
- `docs/sink.md` rows for `docs/obsidian/`, plus a new narrative sub-section "Obsidian UI layer".
- `scripts/check-obsidian-assets.ts` plus `tests/scripts/obsidian-assets.test.ts`, wired into the verify gate via `scripts/lib/tasks.ts` and `package.json` (`check:obsidian-assets`).

**Approaches considered and rejected:**

- **Approach 2 — Scaffolding + authoring helpers.** Add Templater snippets that wrap `/adr:new`, `/glossary:new`, `/spec:start`. Rejected for v0.1: duplicates slash-command logic, drift risk, larger review surface. Reconsider in phase 2.
- **Approach 3 — Progressive ship across 4 PRs.** Split setup, Bases, Canvas, sink updates into separate PRs. Rejected: 4× review overhead, slower convergence on a coherent first cut. The same gradual-rollout intent is preserved by deferring phase 2 entirely and shipping per-track sharded Bases as their own follow-up PRs.
- **Approach 4 — Assets under `templates/obsidian/`.** Rejected after sink review: `templates/` per `docs/sink.md` holds blank artifacts that "stages copy + fill" (`*-template.md`). Bases and Canvas files are *committed reference artifacts* used in place, not stage-fill templates — putting them in `templates/` is a category mismatch. `docs/obsidian/` co-locates them with the setup guide, matches the setup-guide-plus-assets shape, and avoids inventing a new top-level folder.
- **Approach 5 — Shard log-shaped artifacts in this PR (option B from the brainstorming review).** Bigger atomic shipment but couples Obsidian-layer rollout to per-track agent updates and template changes (project-manager, roadmap-manager, quality skill). Rejected for two reasons: (a) blast radius — touching multiple tracks' agent prompts and templates in one PR is the kind of change that should land per-track with its own retrospective; (b) per-track sharding has the same cost whether it ships now or later, so deferring it doesn't lose anything except optionality on which tracks shard first. Approach 1 keeps optionality.
- **Approach 6 — Shard ALL log-shaped artifacts in this PR (option C).** Same problems as Approach 5, multiplied across six registers. Rejected.

## Architecture

```
Repo (markdown + git + CI)
├── canonical artifacts (specs/, docs/, projects/, ...)
├── slash commands + agents (.claude/)
├── vault gitignore (.obsidian/, .trash/)
└── Obsidian UI layer (docs/obsidian/)
    ├── README.md                        ← setup guide, plugin recs, manual acceptance
    ├── bases/                           ← live queries (read + property edit)
    │   ├── specs.base
    │   ├── adrs.base
    │   └── glossary.base
    └── canvas/                          ← spatial layouts
        ├── home.canvas
        └── lifecycle.canvas
```

**Boundary:**
- Repo owns canonical artifacts and frontmatter schema.
- `docs/obsidian/` owns setup guide and committed Bases / Canvas files.
- Slash commands and agents are unchanged. They tolerate user-added frontmatter keys (already do — schema is permissive).
- No Obsidian-specific files outside `docs/obsidian/`.

**User flow:**
1. Clone repo. Vault root = repo root.
2. Install Obsidian (pinned version range — see setup guide).
3. Open the repo folder as a vault.
4. Enable core plugins Bases and Canvas (and any community plugins explicitly recommended in the setup guide).
5. Open `docs/obsidian/canvas/home.canvas`. Read.
6. Click into any of the three Bases under `docs/obsidian/bases/`. They read the canonical frontmatter and render rows.

No copy step. Files live where they are committed; Obsidian opens them in place.

## Components

| Component | Path | Purpose |
|---|---|---|
| Setup guide | `docs/obsidian/README.md` | Folder entry point with required frontmatter (`title`, `folder`, `description`, `entry_point: true`). Install steps, Obsidian version pin, plugin list, opening instructions, screenshot, manual acceptance checklist (rows for the 10-minute target), link to ADR-0013 and ADR-0014. |
| Specs Base | `docs/obsidian/bases/specs.base` | Table over `specs/*/workflow-state.md`. Columns: `feature`, `area`, `current_stage`, `status`, `last_updated`, `last_agent`. Default filter: `status == "active"`. |
| ADRs Base | `docs/obsidian/bases/adrs.base` | Table over `docs/adr/*.md`. Columns: `id`, `title`, `status`, `date`, `supersedes`, `superseded-by`. Default sort: `id` asc. **Plan-stage prerequisite:** audit existing ADR-0001…0014 frontmatter to confirm every accepted ADR carries an `id: ADR-NNNN` key. |
| Glossary Base | `docs/obsidian/bases/glossary.base` | Table over `docs/glossary/*.md` per ADR-0010. Columns: `term`, `aliases`, `status`, `last-updated`, `tags`. Default sort: `term` asc. |
| Home Canvas | `docs/obsidian/canvas/home.canvas` | Landing hub. Cards link to README, AGENTS, constitution, MEMORY index, sink, traceability docs, ADR index, glossary index, each Base, each track doc. Includes a "coming when sharded" placeholder card pointing to ADR-0014. |
| Lifecycle Canvas | `docs/obsidian/canvas/lifecycle.canvas` | Stages 1–11 as labelled nodes wired with edges showing artifact flow. Side branches show optional tracks (Stock-taking, Discovery, Sales, Project, Roadmap, Portfolio, Quality, Scaffolding). |
| READMEs in `bases/` and `canvas/` | (none) | **Explicit non-deliverable.** Following the `docs/glossary/` precedent (per ADR-0010), the directory listing is the index. No `README.md` in `docs/obsidian/bases/` or `docs/obsidian/canvas/`. `npm run check:frontmatter` will not flag these directories because no README exists. |
| Gitignore additions | `.gitignore` | `.obsidian/` and `.trash/`. |
| Sink updates | `docs/sink.md` | (1) Layout-table addition for `docs/obsidian/` showing `README.md`, `bases/`, `canvas/`. (2) Ownership-table rows for the setup guide, the Bases assets, and the Canvas assets, with mutability notes. (3) New narrative sub-section "Obsidian UI layer sub-tree" mirroring the existing track sub-section style. |
| ADR-0013 | `docs/adr/0013-add-obsidian-as-ui-layer.md` | Records the decision. Status: `proposed`. References ADR-0010 (glossary shard precedent) and ADR-0014 (companion decision filed in the same PR). |
| ADR-0014 | `docs/adr/0014-shard-log-shaped-artifacts-for-bases.md` | Records the shard pattern for log-shaped artifacts so that Bases can cover them per-track later. Status: `proposed` (decision is "we will shard"; implementation is per-track and deferred). Lists the affected registers: `projects/<*>/followup-register.md`, `projects/<*>/health-register.md`, `projects/<*>/weekly-log.md`, `roadmaps/<*>/decision-log.md`, `roadmaps/<*>/communication-log.md`, `quality/<*>/improvement-plan.md`. References ADR-0010 as precedent. |
| State guard script | `scripts/check-obsidian-assets.ts` | TypeScript script invoked via `tsx`. Verifies (1) no `.obsidian/` or `.trash/` paths are tracked in git; (2) every shipped `*.base` under `docs/obsidian/bases/` parses as YAML; (3) every shipped `*.canvas` under `docs/obsidian/canvas/` parses as JSON. **Distinct from the existing `scripts/check-obsidian.ts`** (which validates Obsidian-compatibility of repo markdown). The two scripts coexist; the new check focuses on vault-asset hygiene. |
| State guard test | `tests/scripts/obsidian-assets.test.ts` | Colocated with existing `tests/scripts/*.test.ts` and exercised by `npm run test:scripts` (driven by `scripts/test-scripts.ts`). Covers: (1) clean repo passes; (2) tracked `.obsidian/workspace.json` fails; (3) malformed `.base` (invalid YAML) fails; (4) malformed `.canvas` (invalid JSON) fails. |
| Verify-gate wiring | `package.json` + `scripts/lib/tasks.ts` | (1) Add `"check:obsidian-assets": "tsx scripts/check-obsidian-assets.ts"` to `package.json` scripts. (2) Add a corresponding entry to the `checkTasks` array in `scripts/lib/tasks.ts` (consumed by `scripts/verify.ts`) so `npm run verify` runs the new check. |

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
  ├─ Bases at docs/obsidian/bases/*.base read frontmatter live → table view
  │   (also support inline edit via property panel)
  ├─ Canvas at docs/obsidian/canvas/*.canvas reads file links → spatial view
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
- Bases queries operate at file granularity (one row per file). The shipped three Bases respect this by filtering only file-per-entity artifacts.

## `.base` schema decision (resolved at design stage, not deferred)

**Pinned:** Obsidian 1.7+ ships Bases as a core plugin (no Community Plugins install needed). Setup guide pins "tested with Obsidian 1.7.x and Bases as enabled core plugin." Older Obsidian users are out of scope for v0.1 — the setup guide tells them to upgrade.

**Per-Base schema sketch** (final YAML keys validated during plan stage against the Obsidian 1.7 release notes; the *shape* below is design-locked):

```yaml
# specs.base
filters:
  - and:
      - file.path.startsWith("specs/")
      - file.name == "workflow-state.md"
formulas:
  feature: file.frontmatter.feature
  area: file.frontmatter.area
  current_stage: file.frontmatter.current_stage
  status: file.frontmatter.status
  last_updated: file.frontmatter.last_updated
  last_agent: file.frontmatter.last_agent
views:
  - type: table
    columns: [feature, area, current_stage, status, last_updated, last_agent]
    sort: [{ column: last_updated, direction: desc }]
    filter: status == "active"
```

```yaml
# adrs.base
filters:
  - and:
      - file.path.startsWith("docs/adr/")
      - file.frontmatter.id startsWith "ADR-"
formulas:
  id: file.frontmatter.id
  title: file.frontmatter.title
  status: file.frontmatter.status
  date: file.frontmatter.date
  supersedes: file.frontmatter.supersedes
  superseded_by: file.frontmatter["superseded-by"]
views:
  - type: table
    columns: [id, title, status, date, supersedes, superseded_by]
    sort: [{ column: id, direction: asc }]
```

```yaml
# glossary.base — per ADR-0010 (one file per term)
filters:
  - file.path.startsWith("docs/glossary/")
formulas:
  term: file.frontmatter.term
  aliases: file.frontmatter.aliases
  status: file.frontmatter.status
  last_updated: file.frontmatter["last-updated"]
  tags: file.frontmatter.tags
views:
  - type: table
    columns: [term, aliases, status, last_updated, tags]
    sort: [{ column: term, direction: asc }]
```

**Plan-stage responsibility:** validate the exact YAML keys against the Obsidian 1.7 Bases release notes before writing the three files; if Bases changed key names between 1.7 and the latest patch, update the three files consistently and pin the patch version in the setup guide.

## ADR-0014 outline (filed in this PR, body fleshed out at plan stage)

- **Title:** Shard log-shaped artifacts into one-file-per-entry to support Bases
- **Status:** proposed
- **Context:** ADR-0010 sharded the glossary so Bases could query terms; the same constraint applies to follow-up registers, health registers, weekly logs, decision logs, communication logs, and improvement plans. Each is currently a single markdown file holding many entries.
- **Decision:** Adopt the same shard pattern (one file per entry under a per-register subdirectory) for the six log-shaped artifacts listed in scope. Each per-track migration is its own PR with its own retrospective; this ADR records the *direction*, not the *schedule*.
- **Consequences (positive):** Bases dashboards become possible per track. Trace IDs become first-class file slugs. Backlinks land naturally on individual entries.
- **Consequences (negative):** More files in the tree. Templates, agents, and any scripts that read the registers as single files need updating per-track. Existing register history needs migrating (or accepting a clean break with an "as-of" date).
- **Alternatives:** (a) Keep registers single-file and write a custom Obsidian plugin parser. Rejected — phase 2 territory and reintroduces the drift risk Approach 1 avoided. (b) Skip dashboards for log-shaped artifacts entirely. Rejected — onboarding goal explicitly cites "open project followups" as a success surface.
- **Implementation:** deferred per-track. ADR-0014 stays `proposed` until the first track's shard PR lands and promotes it to `accepted`.
- **References:** ADR-0010 (glossary shard precedent), ADR-0013 (Obsidian UI layer rationale).

## Error handling

Phase 1 has no runtime — only markdown, git, and CI. "Errors" are misuse and drift.

| Category | Symptom | Detection | Recovery |
|---|---|---|---|
| User breaks workflow state via Obsidian edit | `workflow-state.md` frontmatter inconsistent with stage artifacts | Existing CI checks (`npm run check:frontmatter`, `npm run check:specs`) fail on PR | User reverts via git or fixes by hand. Setup guide warns. |
| Plugin compatibility break | Obsidian or Bases version bump breaks committed `.base` / `.canvas` | User opens vault, sees broken view | Setup guide pins "tested with Obsidian 1.7.x". ADR-0013 records compatibility risk. PR updates committed files when Obsidian releases break compatibility. |
| `.obsidian/` accidentally committed | Vault state leaks across users | `npm run check:obsidian-assets` fails CI | `git rm --cached`, push fix. |
| Malformed shipped asset | A `.base` or `.canvas` file breaks YAML / JSON | `npm run check:obsidian-assets` fails CI on the offending file | Fix syntax in PR. |
| User expects a follow-up Base in phase 1 | Empty home.canvas card or missing Base | Setup guide and ADR-0014 explicitly say sharding is deferred | No remediation — user reads the ADR, understands the per-track timeline. |

## Testing

| Layer | What | How |
|---|---|---|
| Existing frontmatter check | `docs/obsidian/README.md` validates against folder entry-point rules; ADR-0013 and ADR-0014 frontmatter validates against ADR conventions | `npm run check:frontmatter` (already wired) must exit 0 with the new files in place. New setup guide must include `title`, `folder: docs/obsidian`, `description`, `entry_point: true`. The `bases/` and `canvas/` subdirectories ship no README and so are not flagged. Test plan must include a positive run of `npm run check:frontmatter` post-merge to prove the new files satisfy the existing checker. |
| New CI guard | No `.obsidian/` or `.trash/` paths are tracked; shipped `.base` parses as YAML; shipped `.canvas` parses as JSON | `scripts/check-obsidian-assets.ts` + `tests/scripts/obsidian-assets.test.ts`. Wired into the verify gate via `package.json` (`check:obsidian-assets`) and `scripts/lib/tasks.ts` (`checkTasks` array). |
| Manual acceptance | Vault opens, plugins enable, three Bases render rows, two Canvases open with resolvable links, end-to-end under 10 minutes | Checklist in `docs/obsidian/README.md`; PR description must record the time-to-first-render to confirm the goal. |
| ADR acceptance criterion | Onboarding takes ≤10 minutes from clone to populated dashboard | Recorded in ADR-0013 consequences; revisited at next retrospective if the layer ships. |

No unit tests for the markdown content itself — that is data, not logic.

## Open questions (none load-bearing)

- Whether ADR-0014 should ship as `proposed` or `accepted`. **Resolution:** `proposed`. Acceptance comes when the first per-track shard PR lands; that PR also references ADR-0014 and bumps it to `accepted`.
- Which track shards first. **Resolution:** out of scope for this PR — deferred to whichever track has next demand.
- Whether the setup guide should script-check Obsidian version on the user's machine. **Resolution:** out of scope — version pin lives in prose; users self-verify.

## Risks

- **Obsidian compatibility churn.** Bases is relatively new in core. Format may change. Mitigation: pin tested Obsidian patch version in setup guide; treat `.base` files as living artifacts updated when Obsidian breaks them; ADR-0013 records compatibility as an accepted consequence.
- **User-added frontmatter polluting agent reads.** Agents tolerate unknown keys today; if agents start to fail on extra keys, that is a separate hardening task, not a v0.1 concern.
- **Plugin recommendation drift.** Recommended plugin set may change as Obsidian core absorbs more features. Setup guide notes "core if available, else community". Revisit annually.
- **Naming confusion with existing `check:obsidian`.** The existing `scripts/check-obsidian.ts` validates Obsidian-compatibility of all repo markdown. The new `check:obsidian-assets` validates only `docs/obsidian/` shipped assets and the gitignore boundary. ADR-0013 and `docs/sink.md` will document both checks side-by-side.
- **ADR-0014 stuck at `proposed` indefinitely.** Risk: ADR is filed, no track ever shards, dashboards remain three Bases forever. Mitigation: the next retrospective after ADR-0014 ships flags the proposed-state ADR for review; if no track has demand, ADR-0014 may be re-evaluated or superseded.

## Acceptance criteria for the implementation PR

1. ADR-0013 is filed with status `proposed`, includes the alternatives section, and references ADR-0010 and ADR-0014.
2. ADR-0014 is filed with status `proposed`, includes the body outline above, and references ADR-0010 and ADR-0013.
3. `docs/obsidian/README.md` exists with required folder entry-point frontmatter and includes the manual acceptance checklist with a recorded time-to-first-render.
4. Three `.base` files exist under `docs/obsidian/bases/` (`specs.base`, `adrs.base`, `glossary.base`) and two `.canvas` files exist under `docs/obsidian/canvas/`. No README files in those subdirectories. **No `project-followups.base`** — that comes with the relevant per-track shard PR.
5. `.gitignore` ignores `.obsidian/` and `.trash/`.
6. `docs/sink.md` includes Layout entries, Ownership rows, and a narrative sub-section for the Obsidian UI layer.
7. `scripts/check-obsidian-assets.ts` and `tests/scripts/obsidian-assets.test.ts` are present.
8. `package.json` includes `check:obsidian-assets` script entry.
9. `scripts/lib/tasks.ts` `checkTasks` array includes the new check.
10. `npm run check:frontmatter`, `npm run check:obsidian` (existing), and `npm run check:obsidian-assets` (new) all pass locally and in CI.
11. `npm run verify` passes locally before PR is opened.
12. Manual acceptance checklist walked once by the author and time-to-first-render recorded in the PR description.
