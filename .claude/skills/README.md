---
title: ".claude/skills/"
folder: ".claude/skills"
description: "Entry point for reusable workflow skills and their invocation boundaries."
entry_point: true
---
# `.claude/skills/`

**Skills** are reusable how‑tos that any agent can invoke. They live next to agents and commands but answer a different question:

| Layer | Question it answers |
| --- | --- |
| **Agents** (`.claude/agents/`) | *Who* does the work, with what scope and what tools. |
| **Commands** (`.claude/commands/`) | *What workflow stage* are we in, what should happen next. |
| **Skills** (`.claude/skills/`) | *How* do we do this specific recurring thing the same way every time. |

Skills are the smallest unit of "we always do it this way". Anything you find yourself explaining to an agent more than twice belongs here.

The catalog spans three families: a **workflow conductor** (the conversational entry to specorator), **practice skills** (the recurring techniques agents pull in mid-stage, mattpocock-style), and **operational skills** (the deterministic procedures that gate pre-PR and ADR work).

## Layout

One directory per skill. Each contains a `SKILL.md`. For mattpocock-style skills the body uses YAML frontmatter (`name`, `description`, optional `argument-hint`); for operational skills it follows this minimum shape:

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

Skills MAY include supporting files (templates, scripts, fixtures) alongside `SKILL.md`. Keep them small — large helpers belong in `scripts/` at the repo root.

## Catalog

### Workflow conductors

| Skill | Triggers when… | What it does |
|---|---|---|
| [`orchestrate/`](orchestrate/SKILL.md) | "start a feature", "kick off", "from scratch", "what's next?", "orchestrate" | Drives the full 11-stage Specorator workflow conversationally. Reads `workflow-state.md`, gates with `AskUserQuestion`, dispatches `/spec:*` commands in sequence. |
| [`specorator-improvement/`](specorator-improvement/SKILL.md) | "improve Specorator", "add script", "add tooling", "add workflow", "quality drift review" | Guides improvements to the template itself across scripts, tooling, workflows, docs, agents, skills, generated references, verification, and PR delivery. |
| [`project-scaffolding/`](project-scaffolding/SKILL.md) | "scaffold this project", "seed from docs", "fresh install with existing documentation", "guided setup" | Drives the source-led Project Scaffolding Track. Inventories provided folders or Markdown files, extracts evidence-backed context, assembles a starter pack, and routes to the right downstream track. |
| [`discovery-sprint/`](discovery-sprint/SKILL.md) | "design sprint", "ideation", "brainstorm new product ideas", "blank page", "discovery sprint" | Drives the 5-phase Discovery Track (Frame → Diverge → Converge → Prototype → Validate → Handoff) conversationally. Dispatches the `facilitator` and 6 specialist consults. Output: `chosen-brief.md` that feeds `/spec:idea`. **Skip when a brief already exists — go to `orchestrate`.** |

### Practice skills (used by stage agents)

| Skill | Triggers when… | Used by |
|---|---|---|
| [`grill/`](grill/SKILL.md) | "grill me", "interrogate this", any clarification gate | `analyst`, `pm`, `architect`, `/spec:clarify` |
| [`design-twice/`](design-twice/SKILL.md) | "design it twice", non-trivial design choice | User or orchestrator, *before* `/spec:design` (stage 4); design agents read its synthesis as input |
| [`arc42-baseline/`](arc42-baseline/SKILL.md) | "Arc42", "12-factor check", "fill the questionnaire", any architecture-significant feature | User or orchestrator, *before* `/spec:design` (stage 4); the `architect` reads the answered questionnaire as canonical input for Part C; sections not applicable to the project type are marked N/A |
| [`tracer-bullet/`](tracer-bullet/SKILL.md) | "vertical slice", "tracer bullet", "smallest possible commits" | `planner` (stage 6) |
| [`tdd-cycle/`](tdd-cycle/SKILL.md) | "TDD", "red-green-refactor", "test first" | `dev` (stage 7) |
| [`record-decision/`](record-decision/SKILL.md) | "file an ADR", "record a decision", any irreversible choice | `architect`, all stage agents on flag |

### Cross-cutting sink skills

| Skill | Triggers when… | Output |
|---|---|---|
| [`product-page/`](product-page/SKILL.md) | "product page", "landing page", "homepage", "website", "GitHub Pages", or a new project/product start | `sites/index.html` + `sites/` assets; optional `.github/workflows/pages.yml` |
| [`domain-context/`](domain-context/SKILL.md) | new domain concept; context boundary shifts; "context map" | `docs/CONTEXT.md` (lazy) |
| [`new-glossary-entry/`](new-glossary-entry/SKILL.md) | new term coined; terminology disagreement; "glossary"; `/glossary:new "<term>"` | `docs/glossary/<slug>.md` (one file per term, per [ADR-0010](../../docs/adr/0010-shard-glossary-into-one-file-per-term.md)) |
| [`ubiquitous-language/`](ubiquitous-language/SKILL.md) | **deprecated by [ADR-0010](../../docs/adr/0010-shard-glossary-into-one-file-per-term.md)** — kept for forks on earlier template versions | `docs/UBIQUITOUS_LANGUAGE.md` (frozen for new content) |

### Operational skills (deterministic procedures)

| Skill | Purpose | Used by |
|---|---|---|
| [`verify/`](verify/SKILL.md) | Run the project's full pre‑PR gate (format / lint / types / test / build) and report failures actionably. | `dev`, `qa`, `release-manager`, `sre`, `reviewer` (read‑only Bash usage) |
| [`new-adr/`](new-adr/SKILL.md) | Scaffold a new ADR from `templates/adr-template.md` with the next free number. | `architect` (no `Bash` — list the next number from a directory listing the user supplies; or hand off to an agent with `Bash`) |
| [`review-fix/`](review-fix/SKILL.md) | Turn an automated‑review finding into an isolated worktree + plan, ready for TDD. | `dev`, `reviewer` (with caveats — `reviewer` typically lacks worktree authority; hand off to `dev`) |

## How to use

### Natural-language entry (typical)

Just talk. The orchestrate skill triggers on phrases like "let's start a feature", "drive this end-to-end", or "what's the next step?". Practice skills auto-pull when their description matches the session context.

### Explicit invocation

Skills with `user-invocable: true` (default for mattpocock-style skills) can be triggered explicitly via `/<skill-name>`:

- `/orchestrate add user profile editing`
- `/grill the spec at specs/payments/spec.md`
- `/design-twice user profile API`
- `/record-decision adopt event sourcing for billing`

### Inside a slash command or stage agent

Stage agents pull a practice skill into their context by referencing it in their instructions. The agent reads the skill's `SKILL.md` and follows the procedure. Examples: the `planner` agent uses `tracer-bullet` during `/spec:tasks`; the `dev` agent uses `tdd-cycle` during `/spec:implement`; `dev` calls `verify` before opening a PR.

## Markdown sink integration

All skills write to the same sink documented in [`docs/sink.md`](../../docs/sink.md):

- **Workflow-scoped artifacts** — `specs/<slug>/*.md` (managed by `/spec:*` commands).
- **Product page** — `sites/index.html` and supporting `sites/` assets (managed by `product-page`).
- **Cross-cutting artifacts** — `docs/adr/`, `docs/CONTEXT.md`, `docs/glossary/<slug>.md` (one file per term, per [ADR-0010](../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` is deprecated).
- **Steering** — `docs/steering/*.md` (human-curated).

The orchestrate skill never invents new sink locations. Practice and operational skills only write to the locations their `SKILL.md` declares.

## When to add a new skill

Add one when:

- You've explained the same procedure to an agent (or written the same prompt) more than twice.
- A sequence of steps has a clear failure mode if done out of order or with the wrong defaults.
- A recurring action has constraints that aren't obvious from the surrounding code.

Don't add one when:

- It's a one‑off. Skills are amortised over many invocations.
- It's something a human reads once and never again — that's a doc, not a skill.
- It contradicts an agent's scoped tool list. Skills don't unlock tools; agents do.

## Relationship to agents and commands

A skill never overrides an agent's tool restrictions. If `qa.md` can't `Edit` source files, a skill invoked from `qa` still can't `Edit` source files. Skills are *behavioural* shortcuts, not *permission* shortcuts.

### Tool requirements

Some skills assume tools that not every lifecycle agent has. Operational skills generally require `Bash`; mattpocock-style skills work within whatever tools the invoking agent has. Lifecycle agents `analyst`, `pm`, `ux-designer`, `ui-designer`, `planner`, `orchestrator`, and `retrospective` have **no `Bash`** by default — they can't invoke `verify` or `review-fix` directly and must hand off to an agent that has it (typically `dev`).

If you add a new skill that assumes `Bash`, document the requirement in its `SKILL.md` and update the operational-skills table above.

## Authoring a new skill

For mattpocock-style skills, follow the progressive-disclosure pattern (also see Anthropic's `skill-creator`):

1. Create `.claude/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`, optional `argument-hint`).
2. Keep the body ≤200 lines. Split deeper material into `REFERENCE.md`, `EXAMPLES.md`, `<TOPIC>.md` siblings.
3. Description format: sentence 1 = capability; sentence 2 = "Use when …" with concrete trigger phrases.
4. Add a row to this README's catalog.
5. If the skill writes to disk, document the path in `docs/sink.md`.

For operational skills, keep `SKILL.md` short and procedural — Purpose / How to use / Reporting / Do not — and update the catalog + tool-requirements row above.
