---
name: domain-context
description: Maintain a living domain context map at docs/CONTEXT.md (or scoped contexts under docs/contexts/) — the project's shared mental model of what the system is, who its users are, what bounded contexts exist, and how they relate. Lazily creates the file on first need. Use when a stage agent discovers a new domain concept, when a context boundary shifts, or whenever the user mentions "domain model", "context map", or "bounded context".
argument-hint: [optional context name for multi-context repos]
---

# Domain context

After Pocock's `domain-model` skill and Evans's bounded-context concept. `docs/CONTEXT.md` is a single page that tells any new agent (or human) what the system is *about*. It evolves additively across workflows.

## File layout

### Single-context project

```
docs/CONTEXT.md
```

### Multi-context project (microservices, multi-product, etc.)

```
docs/CONTEXT-MAP.md          # the relationships between contexts
docs/contexts/<name>.md      # one file per bounded context
```

The orchestrator decides single vs multi by counting distinct domains in `docs/steering/product.md`. Default is single until evidence suggests otherwise.

## CONTEXT.md format

```markdown
# Domain context

_Last updated: <YYYY-MM-DD> by <agent>_

## What the system is

One paragraph. Plain language. The shape of the thing, not its features.

## Users and their goals

Bulleted list. Who uses it, what they're trying to do, what success looks like.

## Bounded contexts

| Context | Owns | Talks to | Doesn't talk to |
|---|---|---|---|
| <name> | <data + behavior> | <other contexts> | <forbidden> |

(Single-context projects can omit this section.)

## Core concepts

Short glossary of the load-bearing nouns. **Bold** the term, then a one-line definition. Cross-link to `UBIQUITOUS_LANGUAGE.md` for fuller definitions.

## Invariants

Numbered list of things that must always be true. These are non-negotiable; violations are bugs.

## Open questions

Bulleted list. Things the team hasn't resolved yet. Each links to a workflow or ADR if applicable.
```

## Procedure

### When invoked from a stage agent (typical)

Stage agents run inside subagent contexts and **cannot call `AskUserQuestion`** (per the orchestrator contract in `.claude/skills/orchestrate/SKILL.md`). High-confidence, low-risk updates can be written inline; anything that needs human confirmation must be deferred to the main thread.

1. **Detect mode and target file.** Single-context vs. multi-context is determined by what already exists on disk:
   - If `docs/CONTEXT-MAP.md` exists, this repo is in **multi-context mode**. Determine which bounded context the agent's update belongs to (cite it explicitly — if the agent didn't, ask via the `[CONTEXT-CONFIRM]` flag pattern below). The target file is `docs/contexts/<name>.md` for context-scoped updates, or `docs/CONTEXT-MAP.md` for cross-context relationships. Never write to `docs/CONTEXT.md` in multi-context mode — it should not exist.
   - Else if `docs/CONTEXT.md` exists, this repo is in **single-context mode**; that file is the target.
   - Else (no context file exists yet), default to **single-context mode** and scaffold `docs/CONTEXT.md` from the template above. To switch later to multi-context, the architect files an ADR migrating the file (lazy migration: `docs/CONTEXT.md` → `docs/CONTEXT-MAP.md` plus a per-context split).
2. Diff what the agent reports against the current map:
   - **New term coined?** Write inline to `Core concepts`.
   - **Open question resolved?** Move from `Open questions` to wherever the answer landed (typically `Core concepts` or `Invariants`).
   - **New invariant discovered?** Write a draft entry to `Invariants` and **flag for the orchestrator** — return a one-line `[CONTEXT-CONFIRM] new invariant: <text>` line in the agent's summary. The orchestrator will run a single `AskUserQuestion` in the main thread and finalize.
   - **Context boundary changed?** Same flag pattern — write the proposed change inline (or stage it as a code-fenced block in the agent's summary) and return `[CONTEXT-CONFIRM] boundary change: <text>` for the orchestrator to confirm. Do not call `AskUserQuestion` from the subagent.
3. Update `Last updated` and `by` in the file you actually wrote to (not the wrong layout's file).
4. Append a dated one-line entry to the active feature's `workflow-state.md` `## Hand-off notes` free-form section noting which context file was updated (no frontmatter additions — the schema is fixed).

### When invoked directly by the user

Run a `grill` session focused on the current state of `CONTEXT.md`:

- Walk each section asking "is this still true? is this still complete?"
- Update inline as decisions resolve.

## Rules

- **Lazy creation.** Don't pre-scaffold `docs/CONTEXT.md`. Wait until something needs to land in it.
- **Additive updates.** Don't rewrite history; document changes in workflows or ADRs.
- **Plain language.** Avoid framework names, design patterns, or implementation details. The map is about the *domain*, not the system that serves it.
- **One source of truth.** If a concept appears here and in `UBIQUITOUS_LANGUAGE.md`, the glossary is authoritative for definitions; CONTEXT.md cross-links and uses the term.
- **Don't dump.** A 5-page CONTEXT.md is a sign the domain isn't actually understood. Keep it ≤2 pages.

## Relationship to steering files

`docs/steering/product.md` is **prescriptive** ("we are building X for Y"). `docs/CONTEXT.md` is **descriptive** ("here is what the system actually is and the terms we use about it"). They co-exist; updates to one don't auto-propagate to the other.
