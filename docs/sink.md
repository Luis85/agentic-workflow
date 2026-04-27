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
│   ├── spec-kit.md                          # workflow definition (read first)
│   ├── workflow-overview.md                 # one-page cheat sheet
│   ├── quality-framework.md                 # quality dimensions, gates, DoD
│   ├── traceability.md                      # ID scheme REQ → SPEC → T → code → TEST
│   ├── ears-notation.md                     # EARS reference
│   ├── sink.md                              # this file
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
│   └── UBIQUITOUS_LANGUAGE.md               # living glossary (LAZY)
├── templates/                               # blank artifacts; stages copy + fill
│   └── *-template.md
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
│       ├── release-notes.md                 # stage 10 (release-manager)
│       └── retrospective.md                 # stage 11 (retrospective)
├── examples/                                # demonstration artifacts — NOT the template's own workflow (see §Examples sub-tree)
│   └── <feature-slug>/
│       ├── workflow-state.md                # mirrors specs/<slug>/workflow-state.md shape
│       ├── idea.md, research.md, …          # same artifact set as specs/<slug>/
│       └── adr/                             # project-local ADRs for the example (NOT docs/adr/)
│           └── NNNN-<slug>.md               # project-local sequence, e.g. ADR-CLI-0001
└── .claude/
    ├── agents/                              # subagent definitions (specialists)
    ├── commands/                            # slash commands (entry points per stage)
    └── skills/                              # auto-discoverable skill bundles
```

## Ownership

| Path | Owner | Mutability |
|---|---|---|
| `memory/constitution.md` | Human (amended by ADR) | Append-only after amendments |
| `docs/spec-kit.md`, `docs/quality-framework.md`, `docs/traceability.md`, `docs/ears-notation.md` | Human | Versioned (v0.1, v0.2…) |
| `docs/sink.md` | Human | Versioned alongside spec-kit |
| `docs/steering/*` | Human | Updated as project evolves |
| `docs/adr/NNNN-*.md` | Architect / any agent that flags | **Immutable from creation** per ADR-0001: only YAML `status` (proposed → accepted → deprecated → superseded) and `supersedes` / `superseded-by` pointers may change. Body (Context, Decision, Alternatives, Consequences) is frozen on creation. To revise rationale, supersede via new ADR. |
| `docs/CONTEXT.md`, `docs/CONTEXT-MAP.md`, `docs/contexts/*.md` | `domain-context` skill | Additive, agent-updated |
| `docs/UBIQUITOUS_LANGUAGE.md` | `ubiquitous-language` skill | Additive, agent-updated |
| `templates/*-template.md` | Human | Versioned; updates propagate to new features only |
| `discovery/<sprint>/discovery-state.md` | `/discovery:start`, then `/discovery:*` commands on transition | Sprint state machine; facilitator-owned |
| `discovery/<sprint>/<phase>.md` | The phase's owning facilitator + consulted specialists (per `docs/discovery-track.md` §3) | Each phase writes once; later phases never rewrite upstream phase artifacts |
| `discovery/<sprint>/chosen-brief.md` | `facilitator` (Handoff) | One per surviving concept; mandatory input to `/spec:idea` |
| `specs/<slug>/workflow-state.md` | `/spec:start`, then `/spec:*` commands on transition | State machine; orchestrator amends final fields |
| `specs/<slug>/<artifact>.md` | The stage's owning agent (per `docs/spec-kit.md` §3) | Each stage writes once; later stages **never rewrite** upstream artifacts |
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

`docs/CONTEXT.md`, `docs/UBIQUITOUS_LANGUAGE.md`, `specs/<slug>/implementation-log.md`, and the `## Hand-off notes` free-form section of `workflow-state.md` are append-only in spirit. Agents may reorder or refine, but the historical narrative survives. (The workflow-state YAML frontmatter has no `notes:` field — append-only content lives in markdown sections.)

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
3. `docs/spec-kit.md` §3.<stage> — the gate criteria for this stage.
4. `specs/<slug>/workflow-state.md` — confirm upstream stages are complete.
5. All numerically-earlier `specs/<slug>/<artifact>.md` files in stage order.
6. `docs/CONTEXT.md` and `docs/UBIQUITOUS_LANGUAGE.md` if present.
7. Any topically relevant ADRs (skim titles).

## Discovery Track sub-tree

When a team enters the kit with a **blank page** (no brief), the Discovery Track produces `chosen-brief.md` first; that brief is then the input the analyst reads in Stage 1. The track lives at `discovery/<sprint-slug>/` parallel to `specs/`. See [`docs/discovery-track.md`](discovery-track.md) for the methodology and [ADR-0005](adr/0005-add-discovery-track-before-stage-1.md) for the rationale.

A sprint may emit **0, 1, or N** chosen briefs. Zero is a valid outcome (no-go); the sprint folder is preserved as historical context regardless. The handoff is the *only* link between the discovery and specs trees — before handoff no `specs/<slug>/` exists; after handoff the brief is referenced from `idea.md`'s frontmatter `inputs:`.

## Examples sub-tree

`examples/` is a **demonstration zone** — it shows what a real project that adopted this template would produce. It is structurally outside the template's own workflow:

- **Not active workflow state.** Agents, skills, and the orchestrate skill must not treat `examples/<slug>/workflow-state.md` as a resumable feature. The orchestrate skill scans `specs/`; examples live outside that tree deliberately.
- **Simulates an adopting project.** Each `examples/<slug>/` mirrors the shape of `specs/<slug>/` exactly, so a reader can see every artifact a real feature produces without running the workflow themselves.
- **Project-local ADRs.** Each example has its own `examples/<slug>/adr/` directory. The numbering (`ADR-CLI-0001`, `ADR-AUTH-0001`, …) is independent of `docs/adr/` and uses the example's `<AREA>` prefix. This deliberately models what ADR naming looks like inside an adopting project, where the template's global `ADR-0001…0005` would not be inherited.
- **Read-only for agents.** Agents may read example artifacts for reference (e.g. "what does a complete design.md look like?") but must never write to `examples/` as part of a workflow run.

| Path | Owned by | Mutability |
|---|---|---|
| `examples/README.md` | Human | Updated as examples are added |
| `examples/<slug>/` | Human (example maintainer) | Mirrors `specs/<slug>/` shape; updated as the example progresses |
| `examples/<slug>/adr/` | Human (example maintainer) | Same immutability rules as `docs/adr/`; project-local sequence |

## Don't put in the sink

- **Source code.** Lives in the actual codebase, not in `specs/` or `docs/`.
- **Long log dumps, raw command output, secrets.** Summaries only.
- **Files specific to a single subagent's scratch work.** Return a summary instead.
- **Speculative future work.** That's a follow-up workflow, not a sink artifact.
- **Implementation file paths or line numbers** in spec/PRD/plan markdown. Per the spec-kit discipline, those describe behaviors and contracts, not locations.

## Cross-cutting writes from skills

These skills append to cross-workflow files:

- `record-decision` → `docs/adr/NNNN-<slug>.md` (via `/adr:new`).
- `domain-context` → `docs/CONTEXT.md` (or `CONTEXT-MAP.md` + `contexts/<name>.md`).
- `ubiquitous-language` → `docs/UBIQUITOUS_LANGUAGE.md`.

When any of these write, the active feature's `workflow-state.md` gets a dated one-line entry appended to the `## Hand-off notes` free-form section so the workflow has a paper trail. The frontmatter schema (per `templates/workflow-state-template.md`) is fixed — agents do not add new frontmatter keys.
