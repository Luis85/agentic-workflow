---
title: ".claude/skills/"
folder: ".claude/skills"
description: "Entry point for reusable workflow skills and their invocation boundaries."
entry_point: true
---
# `.claude/skills/`

**Skills** = reusable how‑tos any agent invoke. Live next to agents and commands but answer different question:

| Layer | Question it answers |
| --- | --- |
| **Agents** (`.claude/agents/`) | *Who* does work, with what scope and tools. |
| **Commands** (`.claude/commands/`) | *What workflow stage*, what happen next. |
| **Skills** (`.claude/skills/`) | *How* do this recurring thing same way every time. |

Skills = smallest unit of "we always do it this way". Anything you explain to agent more than twice belong here.

Catalog spans three families: **workflow conductor** (conversational entry to specorator), **practice skills** (recurring techniques agents pull mid-stage, mattpocock-style), **operational skills** (deterministic procedures gate pre-PR and ADR work).

## Layout

One directory per skill. Each contain `SKILL.md`. Mattpocock-style skills body use YAML frontmatter (`name`, `description`, optional `argument-hint`); operational skills follow this minimum shape:

```markdown
# <skill-name> — <one-line purpose>

## Purpose
<one paragraph: what this skill does, when to invoke it>

## How to use
<steps, commands, or decision tree>

## Reporting
<what the agent should say when it succeeds / fails>

## Do not
<the load‑bearing constraints that make this skill safe>
```

Skills MAY include supporting files (templates, scripts, fixtures) next to `SKILL.md`. Keep small — large helpers belong in `scripts/` at repo root.

## Catalog

### Workflow conductors

| Skill | Triggers when… | What it does |
|---|---|---|
| [`orchestrate/`](orchestrate/SKILL.md) | "start a feature", "kick off", "from scratch", "what's next?", "orchestrate" | Drive full 11-stage Specorator workflow conversationally. Read `workflow-state.md`, gate with `AskUserQuestion`, dispatch `/spec:*` commands in sequence. |
| [`quality-assurance/`](quality-assurance/SKILL.md) | "quality assurance", "ISO 9001", "quality drift", "delivery readiness", "project execution health" | Run ISO 9001-aligned Quality Assurance Track: plan, checklist execution, readiness review, corrective action planning. |
| [`specorator-improvement/`](specorator-improvement/SKILL.md) | "improve Specorator", "add script", "add tooling", "add workflow", "quality drift review" | Guide improvements to template itself across scripts, tooling, workflows, docs, agents, skills, generated references, verification, PR delivery. |
| [`project-scaffolding/`](project-scaffolding/SKILL.md) | "scaffold this project", "seed from docs", "fresh install with existing documentation", "guided setup" | Drive source-led Project Scaffolding Track. Inventory provided folders or Markdown files, extract evidence-backed context, assemble starter pack, route to right downstream track. |
| [`discovery-sprint/`](discovery-sprint/SKILL.md) | "design sprint", "ideation", "brainstorm new product ideas", "blank page", "discovery sprint" | Drive 5-phase Discovery Track (Frame → Diverge → Converge → Prototype → Validate → Handoff) conversationally. Dispatch `facilitator` and 6 specialist consults. Output: `chosen-brief.md` feed `/spec:idea`. **Skip when brief already exists — go to `orchestrate`.** |
| [`roadmap-management/`](roadmap-management/SKILL.md) | "roadmap", "product roadmap", "project roadmap", "stakeholder update", "communicate roadmap", "align the team" | Drive Roadmap Management Track. Maintain outcome roadmaps, delivery-plan signals, stakeholder maps, communication logs, roadmap decisions. |

### Practice skills (used by stage agents)

| Skill | Triggers when… | Used by |
|---|---|---|
| [`grill/`](grill/SKILL.md) | "grill me", "interrogate this", any clarification gate | `analyst`, `pm`, `architect`, `/spec:clarify` |
| [`design-twice/`](design-twice/SKILL.md) | "design it twice", non-trivial design choice | User or orchestrator, *before* `/spec:design` (stage 4); design agents read its synthesis as input |
| [`arc42-baseline/`](arc42-baseline/SKILL.md) | "Arc42", "12-factor check", "fill the questionnaire", any architecture-significant feature | User or orchestrator, *before* `/spec:design` (stage 4); `architect` read answered questionnaire as canonical input for Part C; sections not applicable to project type marked N/A |
| [`tracer-bullet/`](tracer-bullet/SKILL.md) | "vertical slice", "tracer bullet", "smallest possible commits" | `planner` (stage 6) |
| [`tdd-cycle/`](tdd-cycle/SKILL.md) | "TDD", "red-green-refactor", "test first" | `dev` (stage 7) |
| [`record-decision/`](record-decision/SKILL.md) | "file an ADR", "record a decision", any irreversible choice | `architect`, all stage agents on flag |

### Cross-cutting sink skills

| Skill | Triggers when… | Output |
|---|---|---|
| [`product-page/`](product-page/SKILL.md) | "product page", "landing page", "homepage", "website", "GitHub Pages", or new project/product start | `sites/index.html` + `sites/` assets; optional `.github/workflows/pages.yml` |
| [`domain-context/`](domain-context/SKILL.md) | new domain concept; context boundary shifts; "context map" | `docs/CONTEXT.md` (lazy) |
| [`new-glossary-entry/`](new-glossary-entry/SKILL.md) | new term coined; terminology disagreement; "glossary"; `/glossary:new "<term>"` | `docs/glossary/<slug>.md` (one file per term, per [ADR-0010](../../docs/adr/0010-shard-glossary-into-one-file-per-term.md)) |
| [`ubiquitous-language/`](ubiquitous-language/SKILL.md) | **deprecated by [ADR-0010](../../docs/adr/0010-shard-glossary-into-one-file-per-term.md)** — kept for forks on earlier template versions | `docs/UBIQUITOUS_LANGUAGE.md` (frozen for new content) |

### Operational skills (deterministic procedures)

| Skill | Purpose | Used by |
|---|---|---|
| [`verify/`](verify/SKILL.md) | Run project's full pre‑PR gate (format / lint / types / test / build) and report failures actionably. | `dev`, `qa`, `release-manager`, `sre`, `reviewer` (read‑only Bash usage) |
| [`new-adr/`](new-adr/SKILL.md) | Scaffold new ADR from `templates/adr-template.md` with next free number. | `architect` (no `Bash` — list next number from directory listing user supplies; or hand off to agent with `Bash`) |
| [`review-fix/`](review-fix/SKILL.md) | Turn automated‑review finding into isolated worktree + plan, ready for TDD. | `dev`, `reviewer` (with caveats — `reviewer` typically lack worktree authority; hand off to `dev`) |
| [`quality-metrics/`](quality-metrics/SKILL.md) | Present deterministic project quality KPIs from workflow deliverables, traceability, docs, QA checklists, maturity, trend snapshots. | `/quality:status`; `qa`, `reviewer`, `release-manager`, `retrospective`, `orchestrator`; project/portfolio/roadmap agents via JSON handoff |
| [`token-budget-review/`](token-budget-review/SKILL.md) | Audit prompt-budget consumption by area (always-loaded, skills, examples, docs, worktrees, templates, ops bots) and emit a per-area cleanup plan. | `/token-review`; quarterly housekeeping; pre-release. |

## How to use

### Natural-language entry (typical)

Just talk. Orchestrate skill trigger on phrases like "let's start a feature", "drive this end-to-end", "what's the next step?". Practice skills auto-pull when description match session context.

### Explicit invocation

Skills with `user-invocable: true` (default for mattpocock-style skills) trigger explicitly via `/<skill-name>`:

- `/orchestrate add user profile editing`
- `/grill the spec at specs/payments/spec.md`
- `/design-twice user profile API`
- `/record-decision adopt event sourcing for billing`

### Inside a slash command or stage agent

Stage agents pull practice skill into context by referencing in instructions. Agent read skill's `SKILL.md` and follow procedure. Examples: `planner` agent use `tracer-bullet` during `/spec:tasks`; `dev` agent use `tdd-cycle` during `/spec:implement`; `dev` call `verify` before opening PR.

## Markdown sink integration

All skills write to same sink documented in [`docs/sink.md`](../../docs/sink.md):

- **Workflow-scoped artifacts** — `specs/<slug>/*.md` (managed by `/spec:*` commands).
- **Product page** — `sites/index.html` and supporting `sites/` assets (managed by `product-page`).
- **Roadmaps** — `roadmaps/<slug>/roadmap-state.md`, `roadmap-strategy.md`, `roadmap-board.md`, `delivery-plan.md`, `stakeholder-map.md`, `communication-log.md`, `decision-log.md` (managed by `roadmap-management`).
- **Cross-cutting artifacts** — `docs/adr/`, `docs/CONTEXT.md`, `docs/glossary/<slug>.md` (one file per term, per [ADR-0010](../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` deprecated).
- **Steering** — `docs/steering/*.md` (human-curated).

Orchestrate skill never invent new sink locations. Practice and operational skills only write to locations their `SKILL.md` declare.

## When to add a new skill

Add one when:

- Explained same procedure to agent (or written same prompt) more than twice.
- Sequence of steps has clear failure mode if done out of order or with wrong defaults.
- Recurring action has constraints not obvious from surrounding code.

Don't add one when:

- One‑off. Skills amortised over many invocations.
- Something human read once and never again — that doc, not skill.
- Contradict agent's scoped tool list. Skills don't unlock tools; agents do.

## Relationship to agents and commands

Skill never override agent's tool restrictions. If `qa.md` can't `Edit` source files, skill invoked from `qa` still can't `Edit` source files. Skills = *behavioural* shortcuts, not *permission* shortcuts.

### Tool requirements

Some skills assume tools not every lifecycle agent has. Operational skills generally require `Bash`; mattpocock-style skills work within whatever tools invoking agent has. Lifecycle agents `analyst`, `pm`, `ux-designer`, `ui-designer`, `planner`, `orchestrator`, `retrospective` have **no `Bash`** by default — can't invoke `verify` or `review-fix` directly and must hand off to agent with it (typically `dev`).

If add new skill assuming `Bash`, document requirement in its `SKILL.md` and update operational-skills table above.

## Authoring a new skill

For mattpocock-style skills, follow progressive-disclosure pattern (also see Anthropic's `skill-creator`):

1. Create `.claude/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`, optional `argument-hint`).
2. Keep body ≤200 lines. Split deeper material into `REFERENCE.md`, `EXAMPLES.md`, `<TOPIC>.md` siblings.
3. Description format: sentence 1 = capability; sentence 2 = "Use when …" with concrete trigger phrases.
4. Add row to this README's catalog.
5. If skill write to disk, document path in `docs/sink.md`.

For operational skills, keep `SKILL.md` short and procedural — Purpose / How to use / Reporting / Do not — and update catalog + tool-requirements row above.