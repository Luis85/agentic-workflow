# `.claude/skills/`

**Skills** are reusable how‑tos that any agent can invoke. They live next to agents and commands but answer a different question:

| Layer | Question it answers |
| --- | --- |
| **Agents** (`.claude/agents/`) | *Who* does the work, with what scope and what tools. |
| **Commands** (`.claude/commands/`) | *What workflow stage* are we in, what should happen next. |
| **Skills** (`.claude/skills/`) | *How* do we do this specific recurring thing the same way every time. |

Skills are the smallest unit of "we always do it this way". Anything you find yourself explaining to an agent more than twice belongs here.

## Layout

One directory per skill. Each contains a `SKILL.md` with this minimum shape:

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

## Seeded skills

- **[`verify/`](./verify/SKILL.md)** — run the project's full pre‑PR gate (format / lint / types / test / build) and report failures actionably.
- **[`new-adr/`](./new-adr/SKILL.md)** — scaffold a new ADR from `templates/adr-template.md` with the next free number.
- **[`review-fix/`](./review-fix/SKILL.md)** — turn an automated‑review finding into an isolated worktree + plan, ready for TDD.

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
