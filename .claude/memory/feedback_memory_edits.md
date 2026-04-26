# Memory edits are docs‑only

## Rule

Changes to `.claude/memory/` are docs‑only:

- **No changeset / version bump.** Memory is project state, not shipped library surface.
- **Don't bundle with code changes.** Memory PRs are easy to review on their own; mixing them with code obscures both.
- **Delete superseded entries.** Don't archive a stale `feedback_*.md` next to its replacement; remove it. (See `docs/archive/` for the *plan / spec* archive convention — that's a different category.)
- **Update [`MEMORY.md`](./MEMORY.md)** in the same PR when you add or remove a file. The index is the contract.

## Why

A memory file is read by every agent at session start. Two contradictory files is the worst possible state — agents will pick one at random and act on it. Hard‑deleting a stale entry forces the contradiction to surface as a missing reference (which is debuggable) rather than as silently wrong behaviour (which is not).

The "no changeset" clause matters because some downstream automation (release bots, dependency triage) keys off changeset presence to decide whether to publish — memory edits would otherwise pollute the release feed.

## How to apply

- Memory PR title prefix: `docs(memory): …` or `chore(memory): …`.
- Memory PR body: one bullet per file added/removed/changed, plus the index update.
- If you find yourself wanting to add a *third* `feedback_*.md` on the same topic, you actually want to *replace* the existing one. Edit, don't accrete.

## Hard stops

- Do **not** add a `feedback_*.md` that contradicts `memory/constitution.md`. The constitution wins; if you genuinely think it shouldn't, open an ADR.
- Do **not** put per‑machine paths, individual contributor preferences, or secrets here. See [`README.md`](./README.md).
