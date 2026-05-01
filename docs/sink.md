# Markdown sink

Where every markdown artifact in this kit lives, who owns it, and how it evolves. This is the single reference for any agent, skill, or human that needs to know "where does this go?"

## Layout

```
.
├── README.md                                # repo entry point
├── AGENTS.md                                # cross-tool root context
├── CLAUDE.md                                # Claude Code entry, imports AGENTS.md
├── memory/
│   └── constitution.md                      # principles loaded ahead of every workflow command
├── docs/
│   ├── specorator.md                          # workflow definition (read first)
│   ├── workflow-overview.md                 # one-page cheat sheet
│   ├── quality-framework.md                 # quality dimensions, gates, DoD
│   ├── quality-metrics.md                   # deterministic KPI interpretation guide
│   ├── release-readiness-guide.md           # Stage 10 go/no-go guide across product perspectives and stakeholders
│   ├── traceability.md                      # ID scheme REQ → SPEC → T → code → TEST
│   ├── ears-notation.md                     # EARS reference
│   ├── sink.md                              # this file
│   ├── inputs-ingestion.md                  # cross-track contract for inputs/ ingestion folder (per ADR-0017)
│   ├── steering/                            # persistent scoped context
│   │   ├── product.md
│   │   ├── tech.md
│   │   ├── ux.md
│   │   ├── quality.md
│   │   └── operations.md
│   ├── adr/                                 # Architecture Decision Records
│   │   ├── 0001-record-architecture-decisions.md
│   │   └── NNNN-<slug>.md                   # one per accepted decision
│   ├── CONTEXT.md                           # living domain context map (LAZY)
│   ├── CONTEXT-MAP.md                       # multi-context only (LAZY)
│   ├── contexts/                            # multi-context only (LAZY)
│   │   └── <name>.md
│   ├── glossary/                            # one file per term (per ADR-0010)
│   │   └── <slug>.md                        # docs/glossary/<slug>.md, e.g. quality-gate.md
│   ├── obsidian/                            # optional Obsidian vault UI layer
│   │   ├── README.md                        # setup guide and manual acceptance checklist
│   │   ├── bases/                           # committed .base query definitions
│   │   │   ├── specs.base
│   │   │   ├── adrs.base
│   │   │   └── glossary.base
│   │   └── canvas/                          # committed JSON Canvas layouts
│   │       ├── home.canvas
│   │       └── lifecycle.canvas
│   └── UBIQUITOUS_LANGUAGE.md               # deprecated by ADR-0010; kept for forks on earlier template versions (LAZY)
├── templates/                               # blank artifacts; stages copy + fill
│   └── *-template.md
├── scaffolding/                             # one folder per source-led project onboarding engagement
│   └── <project-slug>/
│       ├── scaffolding-state.md             # engagement state machine, owned by /scaffold:* commands
│       ├── intake.md                        # phase 1 — source pointers, adoption context, desired outputs
│       ├── source-inventory.md              # phase 1 — source reliability and coverage map
│       ├── extraction.md                    # phase 2 — evidence-backed distilled facts
│       ├── starter-pack.md                  # phase 3 — draft steering/spec/discovery/project starter content
│       └── handoff.md                       # handoff — promotion checklist and next-track recommendation
├── stock-taking/                            # one folder per legacy-system engagement (opt-in, brownfield projects)
│   └── <project-slug>/
│       ├── stock-taking-state.md            # engagement state machine, owned by /stock:* commands
│       ├── scope.md                         # phase 1 (legacy-auditor — boundary, stakeholders, source material)
│       ├── audit.md                         # phase 2 (legacy-auditor — processes, use-cases, integrations, data, debt)
│       ├── synthesis.md                     # phase 3 (legacy-auditor — gaps, constraints, opportunities, migration)
│       └── stock-taking-inventory.md        # handoff — input to /discovery:start or /spec:idea
├── sales/                                   # one folder per client deal (pre-project, service-provider opt-in)
│   └── <deal-slug>/
│       ├── deal-state.md                    # deal state machine, owned by /sales:* commands
│       ├── qualification.md                 # phase 1 (sales-qualifier) — BANT/MEDDIC + go/no-go verdict
│       ├── scope.md                         # phase 2 (scoping-facilitator) — bounded problem + in/out scope
│       ├── estimation.md                    # phase 3 (estimator) — WBS, PERT, risk register, pricing model
│       ├── proposal.md                      # phase 4 (proposal-writer) — SOW / client-facing offer
│       ├── revisions/                       # proposal revision history (LAZY)
│       │   └── proposal-v2.md
│       └── order.md                         # phase 5 (proposal-writer) — acceptance record + Project Kickoff Brief
├── discovery/                               # one folder per discovery sprint (pre-stage 1, opt-in)
│   └── <sprint-slug>/
│       ├── discovery-state.md               # sprint state machine, owned by /discovery:* commands
│       ├── frame.md                         # phase 1 (facilitator + product-strategist + user-researcher)
│       ├── divergence.md                    # phase 2 (facilitator + divergent-thinker + game-designer)
│       ├── convergence.md                   # phase 3 (facilitator + critic + product-strategist)
│       ├── prototype.md                     # phase 4 (facilitator + prototyper + game-designer)
│       ├── validation.md                    # phase 5 (facilitator + user-researcher + critic)
│       ├── chosen-brief.md                  # handoff — input to /spec:idea (0..N per sprint)
│       └── assets/                          # binary prototype assets (LAZY)
├── projects/                                # one folder per client engagement (Project Manager Track, opt-in)
│   └── <project-slug>/
│       ├── project-state.md                 # state machine, owned by /project:* commands
│       ├── project-description.md           # P3 Doc 1: scope, objectives, stakeholders, budget
│       ├── deliverables-map.md              # P3 Doc 2: WBS, milestones, feature links
│       ├── followup-register.md             # P3 Doc 3: risks + issues + changes + lessons (one register)
│       ├── health-register.md               # P3 Doc 4: satisfaction scores, peer reviews
│       ├── weekly-log.md                    # Groups C+D weekly entries (append-only)
│       ├── status-report.md                 # client-facing RAG snapshot (replaced each /project:report run)
│       └── project-closure.md              # Group F: handover, satisfaction, lessons, archive
├── roadmaps/                                # one folder per product/project roadmap (Roadmap Management Track, opt-in)
│   └── <roadmap-slug>/
│       ├── roadmap-state.md                 # state machine, owned by /roadmap:* commands
│       ├── roadmap-strategy.md              # scope, audiences, outcomes, constraints, linked artifacts
│       ├── roadmap-board.md                 # Now / Next / Later outcome roadmap
│       ├── delivery-plan.md                 # milestones, dependencies, risks, capacity assumptions
│       ├── stakeholder-map.md               # stakeholders, decision owners, alignment risks
│       ├── communication-log.md             # planned and sent roadmap updates
│       └── decision-log.md                  # priority, commitment, and communication decisions
├── quality/                                 # one folder per QA review (ISO 9001-aligned, opt-in)
│   └── <quality-review-slug>/
│       ├── quality-state.md                 # QA review state machine, owned by /quality:* commands
│       ├── quality-plan.md                  # plan, scope, ISO 9001 alignment, readiness criteria
│       ├── checklists/
│       │   └── project-execution.md         # evidence-backed checklist items
│       ├── quality-review.md                # readiness verdict, findings, risks
│       └── improvement-plan.md              # corrective actions and effectiveness checks
├── specs/                                   # one folder per feature
│   └── <slug>/
│       ├── workflow-state.md                # state machine, owned by /spec:* commands
│       ├── idea.md                          # stage 1 (analyst)
│       ├── research.md                      # stage 2 (analyst)
│       ├── requirements.md                  # stage 3 (pm) — EARS-formatted
│       ├── design.md                        # stage 4 (ux + ui + architect)
│       ├── arc42-questionnaire.md           # stage 4, arc42-baseline only (LAZY)
│       ├── design-alt-A.md                  # stage 4, design-twice only (LAZY)
│       ├── design-alt-B.md                  # stage 4, design-twice only (LAZY)
│       ├── design-alt-C.md                  # stage 4, design-twice only (LAZY)
│       ├── design-comparison.md             # stage 4, design-twice synthesis (LAZY)
│       ├── spec.md                          # stage 5 (architect)
│       ├── tasks.md                         # stage 6 (planner)
│       ├── implementation-log.md            # stage 7 (dev)
│       ├── test-plan.md                     # stage 8 (qa)
│       ├── test-report.md                   # stage 8 (qa)
│       ├── review.md                        # stage 9 (reviewer)
│       ├── traceability.md                  # stage 9 (reviewer) — RTM
│       ├── release-readiness-guide.md       # stage 10 optional companion (release-manager, LAZY)
│       ├── release-notes.md                 # stage 10 (release-manager)
│       └── retrospective.md                 # stage 11 (retrospective)
├── portfolio/                               # one folder per portfolio (opt-in, P5 Express track)
│   └── <portfolio-slug>/
│       ├── portfolio-state.md               # cycle state machine, owned by /portfolio:* commands
│       ├── portfolio-definition.md          # Doc 1 — scope, projects, governance, resources
│       ├── portfolio-roadmap.md             # Doc 2 — 6-monthly strategy (X cycle)
│       ├── portfolio-progress.md            # Doc 3 — monthly health snapshot (Y cycle)
│       ├── portfolio-improvements.md        # Doc 4 — monthly improvement plan (Y cycle)
│       └── portfolio-log.md                 # Doc 5 — daily operations log (Z cycle, append-only)
├── examples/                                # demonstration artifacts — NOT the template's own workflow (see §Examples sub-tree)
│   └── <feature-slug>/
│       ├── workflow-state.md                # mirrors specs/<slug>/workflow-state.md shape
│       ├── idea.md, research.md, …          # same artifact set as specs/<slug>/
│       └── adr/                             # project-local ADRs for the example (NOT docs/adr/)
│           └── NNNN-<slug>.md               # project-local sequence, e.g. ADR-CLI-0001
├── inputs/                                  # canonical ingestion folder for new work packages (per ADR-0017)
│   └── README.md                            # purpose, retention rules, what does/does not belong here
├── sites/                                   # public product page (directly openable static entrypoint)
│   ├── index.html
│   ├── styles.css                           # optional
│   └── assets/                              # optional visuals and media
└── .claude/
    ├── agents/                              # subagent definitions (specialists)
    ├── commands/                            # slash commands (entry points per stage)
    └── skills/                              # auto-discoverable skill bundles
```

## README entry points

Any folder may include one `README.md`, but it is optional. When present, it is the folder's entry point for Markdown viewers such as GitHub's repository browser: it should orient readers to the folder's purpose, link to the important files below it, and explain any local maintenance rules.

Every tracked `README.md` below the repository root starts with YAML frontmatter:

```yaml
---
title: Human-readable folder title
folder: path/from/repo/root
description: One-sentence description of the folder
entry_point: true
---
```

The root `README.md` is the public repository entry point and is exempt from this frontmatter rule. For folder entry points, the `folder` value must match the README's containing directory, and `npm run check:frontmatter` enforces this along with the one-README-per-folder rule.

## Ownership

| Path | Owner | Mutability |
|---|---|---|
| `memory/constitution.md` | Human (amended by ADR) | Append-only after amendments |
| `docs/specorator.md`, `docs/quality-framework.md`, `docs/traceability.md`, `docs/ears-notation.md` | Human | Versioned (v0.1, v0.2…) |
| `docs/sink.md` | Human | Versioned alongside specorator |
| `docs/steering/*` | Human | Updated as project evolves |
| `docs/adr/NNNN-*.md` | Architect / any agent that flags | **Immutable from creation** per ADR-0001: only YAML `status` (proposed → accepted → deprecated → superseded) and `supersedes` / `superseded-by` pointers may change. Body (Context, Decision, Alternatives, Consequences) is frozen on creation. To revise rationale, supersede via new ADR. |
| `docs/CONTEXT.md`, `docs/CONTEXT-MAP.md`, `docs/contexts/*.md` | `domain-context` skill | Additive, agent-updated |
| `docs/glossary/<slug>.md` | `new-glossary-entry` skill | Additive, agent-updated; refine in place with dated note. Renames create a new file with the old slug in `aliases:`; deprecated entries remain as historical record |
| `docs/UBIQUITOUS_LANGUAGE.md` | `ubiquitous-language` skill (**deprecated by [ADR-0010](adr/0010-shard-glossary-into-one-file-per-term.md)**) | Frozen for new content; kept readable for projects on earlier template versions |
| `docs/obsidian/README.md` | Repo maintainers | Living setup guide for the optional Obsidian UI layer |
| `docs/obsidian/bases/*.base` | Repo maintainers | Living query assets; validated by `check:obsidian-assets` |
| `docs/obsidian/canvas/*.canvas` | Repo maintainers | Living JSON Canvas assets; validated by `check:obsidian-assets` |
| `templates/*-template.md` | Human | Versioned; updates propagate to new features only |
| `scaffolding/<project>/scaffolding-state.md` | `/scaffold:start`, then `/scaffold:*` commands on transition | Engagement state machine; project-scaffolder-owned |
| `scaffolding/<project>/intake.md` | `project-scaffolder` | Written once in Phase 1; records source pointers, adoption context, desired outputs |
| `scaffolding/<project>/source-inventory.md` | `project-scaffolder` | Written once in Phase 1; rates source reliability and coverage |
| `scaffolding/<project>/extraction.md` | `project-scaffolder` | Written once in Phase 2; evidence-backed facts and ambiguities |
| `scaffolding/<project>/starter-pack.md` | `project-scaffolder` | Written once in Phase 3; reviewable draft content, not canonical promotion |
| `scaffolding/<project>/handoff.md` | `project-scaffolder` | Written once in Handoff; promotion checklist and next-track recommendation |
| `stock-taking/<project>/stock-taking-state.md` | `/stock:start`, then `/stock:*` commands on transition | Engagement state machine; legacy-auditor-owned |
| `stock-taking/<project>/<phase>.md` | `legacy-auditor` (per `docs/stock-taking-track.md` §3) | Each phase writes once; later phases never rewrite upstream phase artifacts |
| `stock-taking/<project>/stock-taking-inventory.md` | `legacy-auditor` (Handoff) | Consolidated inventory; mandatory input to `/discovery:start` or `/spec:idea` when a legacy system is in scope |
| `sales/<deal>/deal-state.md` | `/sales:start`, then `/sales:*` commands on transition | Deal state machine; sales-cycle skill-owned |
| `sales/<deal>/qualification.md` | `sales-qualifier` | Written once in Phase 1; later phases never rewrite |
| `sales/<deal>/scope.md` | `scoping-facilitator` | Written once in Phase 2 |
| `sales/<deal>/estimation.md` | `estimator` | Written once in Phase 3; re-run triggers a revision |
| `sales/<deal>/proposal.md` | `proposal-writer` | Current accepted version; revisions go to `revisions/` |
| `sales/<deal>/revisions/proposal-vN.md` | `proposal-writer` | Created lazily on each negotiation revision (LAZY) |
| `sales/<deal>/order.md` | `proposal-writer` (human sign-off required) | Written once in Phase 5; links to downstream workflow |
| `projects/<project>/project-state.md` | `/project:start`, then `/project:*` commands on transition | Project state machine; project-manager-owned |
| `projects/<project>/project-description.md` | `project-manager` (Initiation) | Living — updated on approved changes |
| `projects/<project>/deliverables-map.md` | `project-manager` (Initiation + weekly) | Baselined on A08 approval; refined each week |
| `projects/<project>/followup-register.md` | `project-manager` | Living — append-only; status updated in-place |
| `projects/<project>/health-register.md` | `project-manager` | Append-only |
| `projects/<project>/weekly-log.md` | `project-manager` | Append-only |
| `projects/<project>/status-report.md` | `project-manager` | Replaced each `/project:report` run |
| `projects/<project>/project-closure.md` | `project-manager` (Closure) | Frozen on client sign-off; G01 evaluations appended |
| `roadmaps/<roadmap>/roadmap-state.md` | `/roadmap:start`, then `/roadmap:*` commands on transition | Roadmap state machine; roadmap-manager-owned |
| `roadmaps/<roadmap>/roadmap-strategy.md` | `roadmap-manager` (Start + review) | Living — scope, audience, outcomes, constraints, linked artifacts |
| `roadmaps/<roadmap>/roadmap-board.md` | `roadmap-manager` (Shape + review) | Living — Now / Next / Later roadmap; change summary records movements |
| `roadmaps/<roadmap>/delivery-plan.md` | `roadmap-manager` (Shape + review) | Living — delivery confidence, dependencies, risks, milestones; does not replace `projects/` or `specs/` |
| `roadmaps/<roadmap>/stakeholder-map.md` | `roadmap-manager` (Align + review) | Living — stakeholder needs, stance, cadence, and decision owners |
| `roadmaps/<roadmap>/communication-log.md` | `roadmap-manager` (Align + communicate + review) | Append-oriented; sent updates are historical |
| `roadmaps/<roadmap>/decision-log.md` | `roadmap-manager` (Communicate + review) | Append-oriented; records roadmap priority and communication decisions, not ADRs |
| `quality/<review>/quality-state.md` | `/quality:start`, then `/quality:*` commands on transition | QA review state machine; quality-assurance skill-owned |
| `quality/<review>/quality-plan.md` | `quality-assurance` skill | Written in Plan; defines scope, ISO 9001 alignment, checklist set, and readiness criteria |
| `quality/<review>/checklists/*.md` | `quality-assurance` skill | Evidence-backed checklists; updated during Check, preserving gaps |
| `quality/<review>/quality-review.md` | `quality-assurance` skill | Written in Review; states readiness, nonconformities, risks, and evidence gaps |
| `quality/<review>/improvement-plan.md` | `quality-assurance` skill | Written in Improve; corrective actions remain open until effectiveness is verified |
| `discovery/<sprint>/discovery-state.md` | `/discovery:start`, then `/discovery:*` commands on transition | Sprint state machine; facilitator-owned |
| `discovery/<sprint>/<phase>.md` | The phase's owning facilitator + consulted specialists (per `docs/discovery-track.md` §3) | Each phase writes once; later phases never rewrite upstream phase artifacts |
| `discovery/<sprint>/chosen-brief.md` | `facilitator` (Handoff) | One per surviving concept; mandatory input to `/spec:idea` |
| `specs/<slug>/workflow-state.md` | `/spec:start`, then `/spec:*` commands on transition | State machine; orchestrator amends final fields |
| `specs/<slug>/<artifact>.md` | The stage's owning agent (per `docs/specorator.md` §3) | Each stage writes once; later stages **never rewrite** upstream artifacts |
| `specs/<slug>/release-readiness-guide.md` | `release-manager` (Stage 10, optional) | Lazy go/no-go packet; feeds `release-notes.md`, release authorization, quality review, and retrospective follow-up |
| `portfolio/<slug>/portfolio-state.md` | `/portfolio:start`, then `/portfolio:*` commands on each cycle | Cycle state machine; portfolio-manager-owned |
| `portfolio/<slug>/portfolio-definition.md` | `/portfolio:start` (created), Z cycle Z2 (status updates) | Ongoing; X and Y cycles read but do not rewrite |
| `portfolio/<slug>/portfolio-roadmap.md` | X cycle (X2, X3) | Updated in place each X run; previous exec summaries appended |
| `portfolio/<slug>/portfolio-progress.md` | Y cycle (Y4) | Replaced each Y run; history in git |
| `portfolio/<slug>/portfolio-improvements.md` | Y cycle (Y3, Y4) | Replaced each Y run; history in git |
| `portfolio/<slug>/portfolio-log.md` | Z cycle (Z3) | **Append-only** — never edit previous entries |
| `sites/index.html`, `sites/**/*` | `product-page` skill / `product-page-designer` | Living public product page; updated with product positioning and user-visible changes |
| `.github/workflows/pages.yml` | `product-page` skill / `product-page-designer` | GitHub Pages deployment workflow when Pages is the selected host |
| `.github/workflows/verify.yml` | Repo maintainers | Composite verify gate — see [`verify-gate.md`](verify-gate.md) |
| `.github/workflows/actionlint.yml` | Repo maintainers | Workflow YAML lint — see [`security-ci.md`](security-ci.md) |
| `.github/workflows/zizmor.yml` | Repo maintainers | Workflow security scan — see [`security-ci.md`](security-ci.md) |
| `.github/workflows/gitleaks.yml` | Repo maintainers | Secret scan — see [`security-ci.md`](security-ci.md) |
| `.github/workflows/pr-title.yml` | Repo maintainers | Conventional Commits PR title check — see [`ci-automation.md`](ci-automation.md) |
| `.github/workflows/typos.yml` | Repo maintainers | Spell check — see [`ci-automation.md`](ci-automation.md) |
| `.github/dependabot.yml` | Repo maintainers | Auto-bump pinned action SHAs and npm devDeps — see [`ci-automation.md`](ci-automation.md) |
| `_typos.toml` | Repo maintainers | Spell-check allowlist + ignore-regex patterns |
| `specs/<slug>/arc42-questionnaire.md` | `arc42-baseline` skill | Created lazily on opt-in; canonical input to `design.md` Part C |
| `specs/<slug>/design-alt-*.md`, `design-comparison.md` | `design-twice` skill | Created lazily on opt-in |
| `.claude/skills/<name>/SKILL.md` | Skill author | Versioned in repo |
| `.claude/agents/<name>.md` | Agent author | Versioned in repo |
| `.claude/commands/<area>/<name>.md` | Command author | Versioned in repo |

## Lifecycle

### Eager — created by a workflow command

Created by the `/spec:*` command for the stage that owns the artifact. The command also updates `workflow-state.md` to reflect status.

### Lazy — created on first need

Files marked `LAZY` above are not pre-scaffolded. They appear when a skill or agent first needs to write to them. Don't `mkdir -p docs/contexts/` proactively; wait until the multi-context decision is actually made.

### Append-only

`docs/CONTEXT.md`, `docs/glossary/*.md` (and the legacy `docs/UBIQUITOUS_LANGUAGE.md` for forks on earlier template versions), `specs/<slug>/implementation-log.md`, and the `## Hand-off notes` free-form section of `workflow-state.md` are append-only in spirit. Agents may reorder or refine, but the historical narrative survives. (The workflow-state YAML frontmatter has no `notes:` field — append-only content lives in markdown sections.)

### Immutable

Accepted ADRs are immutable. To change a decision, file a new ADR superseding the old one. The reviewer agent enforces this.

## Naming rules

- **Folders and files:** lowercase, kebab-case. No spaces, no underscores in paths the kit creates (legacy uppercase filenames like `CONTEXT.md`, `AGENTS.md`, `CLAUDE.md`, `UBIQUITOUS_LANGUAGE.md`, `LICENSE` and template files like `*-template.md` are intentional exceptions for visibility/convention).
- **Feature slugs:** kebab-case, ≤6 words. Stable for the lifetime of the feature.
- **ADRs:** four-digit zero-padded sequence (`0001`, `0002`, …) in `docs/adr/`, global across the template repo. Find the next number with `ls docs/adr/0*.md | tail -1`. **Exception — examples:** each `examples/<slug>/adr/` uses its own local sequence (e.g. `ADR-CLI-0001`) that is independent of and does not conflict with the template's global numbering. The prefix (`CLI`, `AUTH`, …) mirrors the feature's `<AREA>` code.
- **IDs:** see `docs/traceability.md` (`REQ-<AREA>-NNN`, `SPEC-<AREA>-NNN`, `T-<AREA>-NNN`, `TEST-<AREA>-NNN`).

## Read order for any subagent starting a stage

1. `memory/constitution.md`.
2. The relevant `docs/steering/*.md` (matched by glob to the stage role).
3. `docs/specorator.md` §3.<stage> — the gate criteria for this stage.
4. `specs/<slug>/workflow-state.md` — confirm upstream stages are complete.
5. All numerically-earlier `specs/<slug>/<artifact>.md` files in stage order.
6. `docs/CONTEXT.md` and `docs/glossary/*.md` (per [ADR-0010](adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` if present on older forks).
7. Any topically relevant ADRs (skim titles).

## Project Scaffolding Track sub-tree

When a team is adopting the template with **existing source material** but no canonical artifacts yet, the Project Scaffolding Track produces a starter pack first. It lives at `scaffolding/<project-slug>/` parallel to `discovery/`, `stock-taking/`, `projects/`, and `specs/`. See [`docs/project-scaffolding-track.md`](project-scaffolding-track.md) for the methodology and [ADR-0011](adr/0011-add-project-scaffolding-track.md) for the rationale.

The engagement slug names the adopting project or initiative, not a single feature. The Handoff is the only link between scaffolding and downstream trees: after handoff, `starter-pack.md` and `handoff.md` are referenced from the downstream artifact's `inputs:` frontmatter. Scaffolding drafts must not be treated as accepted requirements or steering until a human reviews and promotes them.

## Stock-taking Track sub-tree

When a team is **building on or replacing an existing system**, the Stock-taking Track produces `stock-taking-inventory.md` first; that inventory is then the input either the Discovery Track's Frame phase or Stage 1's analyst reads. The track lives at `stock-taking/<project-slug>/` parallel to `discovery/` and `specs/`. See [`docs/stock-taking-track.md`](stock-taking-track.md) for the methodology and [ADR-0007](adr/0007-add-stock-taking-track-for-legacy-projects.md) for the rationale.

The engagement slug names the *system or system cluster* being inventoried (not the feature being built): `crm-legacy-audit`, `billing-platform-baseline`. One engagement may produce inventory that feeds multiple Discovery Sprints or multiple feature folders. The Handoff is the *only* link between the stock-taking tree and the downstream trees — before handoff no `discovery/<sprint>/` or `specs/<slug>/` exists for this work; after handoff the inventory is referenced from `chosen-brief.md` or `idea.md` `inputs:` frontmatter.

## Sales Cycle sub-tree

When a **service provider** needs to win a project before building it, the Sales Cycle Track runs first — a 5-phase commercial workflow (Qualify → Scope → Estimate → Propose → Order) that produces `order.md`. The `order.md` contains a Project Kickoff Brief that is the canonical handoff to the delivery workflow. The delivery workflow is entered via `/discovery:start` (exploratory mandates) or `/spec:start` (defined mandates), with `order.md` as the mandatory context input.

The deal folder lives at `sales/<deal-slug>/` parallel to `discovery/` and `specs/`. Deals that close as `no-go` are preserved as historical context. A deal may spawn one or more feature or discovery workflows after the order is placed.

**Note on confidentiality:** The `sales/` directory may contain commercially sensitive data (client names, pricing, contract terms). Teams must apply appropriate access controls. The kit does not manage access control — that is an infrastructure concern.

## Project Manager Track sub-tree

When a team is delivering software for a client, the Project Manager Track wraps feature deliveries with P3.Express-based governance. The track lives at `projects/<project-slug>/` parallel to `specs/`. State is owned by `/project:*` commands.

Key characteristics:
- **Four P3.Express documents** are the foundation: `project-description.md` (scope + stakeholders), `deliverables-map.md` (WBS + schedule), `followup-register.md` (risks + issues + changes + lessons — all in one), `health-register.md` (satisfaction + governance).
- `weekly-log.md` is append-only (internal PM log). `status-report.md` is replaced each `/project:report` run (client-facing).
- The track is **opt-in**: teams with no client engagement skip it entirely and use `specs/` + `discovery/` directly.
- The project-manager **links to** but **never writes to** `specs/` or `discovery/` artifacts.

See [`docs/project-track.md`](project-track.md) for the full methodology and [ADR-0008](adr/0008-add-project-manager-track.md) for the rationale.

## Roadmap Management Track sub-tree

When a team needs a maintained product/project roadmap, the Roadmap Management Track creates one `roadmaps/<roadmap-slug>/` folder. It connects outcome-based product direction with project-management delivery confidence, dependencies, risks, stakeholder alignment, and team communication.

The track is opt-in and read-only toward `specs/`, `projects/`, `portfolio/`, and `discovery/`. Roadmap items do not become accepted requirements, project changes, or external commitments until the appropriate human gate and downstream workflow accepts them.

See [`docs/roadmap-management-track.md`](roadmap-management-track.md) for the methodology and [ADR-0012](adr/0012-add-roadmap-management-track.md) for the rationale.

## Obsidian UI layer sub-tree

When a team wants a visual layer over the Markdown repository, `docs/obsidian/` provides optional Obsidian Bases and Canvas assets. The vault root is the repository root; committed assets live under `docs/obsidian/`, while `.obsidian/` workspace state and `.trash/` stay local and ignored by git.

The layer is read/write from Obsidian's point of view but not authoritative for workflow transitions. Slash commands, agents, scripts, and canonical Markdown artifacts remain the control plane. `check:obsidian` validates Markdown frontmatter compatibility across the repository, while `check:obsidian-assets` validates the committed `.base` and `.canvas` assets and rejects tracked vault-local state.

See [`docs/obsidian/README.md`](obsidian/README.md) for setup and [ADR-0013](adr/0013-add-obsidian-as-ui-layer.md) for the rationale.

## Discovery Track sub-tree

When a team enters the kit with a **blank page** (no brief), the Discovery Track produces `chosen-brief.md` first; that brief is then the input the analyst reads in Stage 1. The track lives at `discovery/<sprint-slug>/` parallel to `specs/`. See [`docs/discovery-track.md`](discovery-track.md) for the methodology and [ADR-0005](adr/0005-add-discovery-track-before-stage-1.md) for the rationale.

A sprint may emit **0, 1, or N** chosen briefs. Zero is a valid outcome (no-go); the sprint folder is preserved as historical context regardless. The handoff is the *only* link between the discovery and specs trees — before handoff no `specs/<slug>/` exists; after handoff the brief is referenced from `idea.md`'s frontmatter `inputs:`.

## Quality Assurance Track sub-tree

When a team needs an ISO 9001-aligned readiness check, the Quality Assurance Track creates one `quality/<quality-review-slug>/` folder. It can review a project, portfolio, release, supplier, or active feature. It produces a QA plan, evidence-backed checklist, readiness report, and improvement plan.

The track supports internal readiness and audit preparation, but it does not grant certification or replace an accredited auditor. See [`docs/quality-assurance-track.md`](quality-assurance-track.md) for the methodology.

## Release readiness companion artifact

When a completed increment needs an explicit production go/no-go decision, Stage 10 may create `specs/<feature>/release-readiness-guide.md` from `templates/release-readiness-guide-template.md`. The guide collects product value, user experience, stakeholder, engineering, security/privacy/compliance, operations, support, data, commercial, and communication readiness evidence.

This is a lazy companion artifact, not a new lifecycle stage. `release-notes.md` remains the canonical Stage 10 output, while the readiness guide records conditions, blockers, approvers, and the go/no-go rationale that feed the notes, authorization request, optional Quality Assurance Track review, and retrospective.

## Portfolio Track sub-tree

When a team needs to manage **multiple parallel features** or operates as a **service provider**, the Portfolio Track adds a management layer above the Specorator. It lives at `portfolio/<portfolio-slug>/` parallel to `specs/` and `discovery/`. See [`docs/portfolio-track.md`](portfolio-track.md) for the methodology and [ADR-0009](adr/0009-add-portfolio-manager-role.md) for the rationale.

A portfolio is bootstrapped with `/portfolio:start <slug>`. The three cycle commands populate the five management documents. The portfolio track is **read-only on the `specs/` side** — it never modifies spec artifacts.

## Released package shape

The 10 intake folders enumerated in this sink (`inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`) each ship **empty** in the released Specorator template package — only their top-level `README.md` ships, no per-feature / per-deal / per-engagement state. ADRs (`docs/adr/0\d{3}-*.md`) do not ship. `docs/` pages ship as stubs. Source of truth: [ADR-0021](adr/0021-release-package-fresh-surface.md). Methodology: [`docs/release-package-contents.md`](release-package-contents.md).

**Maintenance rule.** Any new intake folder added to the layout above must also be added to the enumeration in `docs/release-package-contents.md` and `ADR-0021`'s "Decision §3" in the same PR. The release readiness check uses the documented enumeration as its checklist; an un-enumerated folder will leak into the released archive.

## Inputs sub-tree

`inputs/` is the **canonical ingestion folder** for new work packages — files, folders, or archives that drive a piece of work but are not themselves canonical artifacts. Adopted by [ADR-0017](adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md). Full contract: [`docs/inputs-ingestion.md`](inputs-ingestion.md).

- **Tracked, not gitignored.** Items committed alongside the work that consumes them. Sensitive material excluded by per-file `.gitignore` rules, never stored in `inputs/`.
- **No automatic extraction.** Conductors list `inputs/` and ask which items are relevant; archives are extracted only after explicit human approval.
- **Source, not truth.** Once consumed, content lives in the canonical artifact (`idea.md`, `chosen-brief.md`, `scope.md`, `stock-taking-inventory.md`, `intake.md`, …). Items in `inputs/` are cited by relative path so source lineage stays auditable.
- **Retention is per-track.** Default retention rules in [`docs/inputs-ingestion.md`](inputs-ingestion.md). The user always decides keep/delete/move.

| Path | Owned by | Mutability |
|---|---|---|
| `inputs/README.md` | Human (template maintainer) | Updated when convention or retention rules change |
| `inputs/<file>` or `inputs/<folder>/` | Human (work-package contributor) | Append-on-drop, delete-on-consumption |

## Examples sub-tree

`examples/` is a **demonstration zone** — it shows what a real project that adopted this template would produce. It is structurally outside the template's own workflow:

- **Not active workflow state.** Agents, skills, and the orchestrate skill must not treat `examples/<slug>/workflow-state.md` as a resumable feature. The orchestrate skill scans `specs/`; examples live outside that tree deliberately.
- **Simulates an adopting project.** Each `examples/<slug>/` mirrors the shape of `specs/<slug>/` exactly, so a reader can see every artifact a real feature produces without running the workflow themselves.
- **Project-local ADRs.** Each example has its own `examples/<slug>/adr/` directory. The numbering (`ADR-CLI-0001`, `ADR-AUTH-0001`, …) is independent of `docs/adr/` and uses the example's `<AREA>` prefix. This deliberately models what ADR naming looks like inside an adopting project, where the template's global `ADR-0001…0005` would not be inherited.
- **Read-only for agents.** Agents may read example artifacts for reference (e.g. "what does a complete design.md look like?") but must never write to `examples/` as part of a workflow run.
- **Trimmed top-level + full mirror.** Within an `examples/<slug>/` folder, the top-level artifact files are trimmed one-page excerpts so agents that scan the directory load tens of KB, not hundreds. The unabridged versions live in `examples/<slug>/full/` as human-only reference. The parent folder's `workflow-state.md` remains the single canonical workflow record for the example — `full/` deliberately has no `workflow-state.md`. Each example keeps its own project-local ADR sequence under `examples/<slug>/full/adr/`. Agents should prefer the trimmed top-level files and never write to `full/`.

| Path | Owned by | Mutability |
|---|---|---|
| `examples/README.md` | Human | Updated as examples are added |
| `examples/<slug>/` | Human (example maintainer) | Trimmed one-page top-level mirror of `specs/<slug>/` shape |
| `examples/<slug>/full/` | Human (example maintainer) | Unabridged historical mirror (human reference only) |
| `examples/<slug>/full/adr/` | Human (example maintainer) | Same immutability rules as `docs/adr/`; project-local sequence |

## Don't put in the sink

- **Source code.** Lives in the actual codebase, not in `specs/` or `docs/`.
- **Long log dumps, raw command output, secrets.** Summaries only.
- **Files specific to a single subagent's scratch work.** Return a summary instead.
- **Speculative future work.** That's a follow-up workflow, not a sink artifact.
- **Implementation file paths or line numbers** in spec/PRD/plan markdown. Per the specorator discipline, those describe behaviors and contracts, not locations.

## Cross-cutting writes from skills

These skills append to cross-workflow files:

- `record-decision` → `docs/adr/NNNN-<slug>.md` (via `/adr:new`).
- `product-page` → `sites/index.html`, supporting `sites/` assets, and optionally `.github/workflows/pages.yml`.
- `domain-context` → `docs/CONTEXT.md` (or `CONTEXT-MAP.md` + `contexts/<name>.md`).
- `new-glossary-entry` → `docs/glossary/<slug>.md` (via `/glossary:new`). Per [ADR-0010](adr/0010-shard-glossary-into-one-file-per-term.md), supersedes the deprecated `ubiquitous-language` → `docs/UBIQUITOUS_LANGUAGE.md` flow.
- `quality-assurance` → `quality/<review>/quality-state.md`, `quality-plan.md`, `checklists/*.md`, `quality-review.md`, and `improvement-plan.md`.
- `quality-metrics` → `quality/metrics/<scope>/<timestamp>.json` when invoked with `--save`.
- `roadmap-management` → `roadmaps/<slug>/roadmap-state.md`, `roadmap-strategy.md`, `roadmap-board.md`, `delivery-plan.md`, `stakeholder-map.md`, `communication-log.md`, and `decision-log.md`.
- `specorator-improvement` → the affected template surfaces: `scripts/`, `tests/scripts/`, `package.json`, `.github/workflows/`, `.claude/commands/`, `.claude/skills/`, `.claude/agents/`, `templates/`, `docs/`, and the owning `specs/<slug>/` artifacts.

When any of these write, the active feature's `workflow-state.md` gets a dated one-line entry appended to the `## Hand-off notes` free-form section so the workflow has a paper trail. The frontmatter schema (per `templates/workflow-state-template.md`) is fixed — agents do not add new frontmatter keys.
