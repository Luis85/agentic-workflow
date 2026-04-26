# Memory edits — when standalone, when bundled

## Rule

Two cases, both intentional:

### Case A — standalone memory edit (default)

Editing an existing `feedback_*.md` or `project_*.md` in isolation:

- **No changeset / version bump** *if your project uses one*. Memory is project state, not shipped library surface. (Projects that don't use a changeset system can ignore this clause.)
- **Don't bundle with unrelated code changes.** A standalone memory edit is easy to review; mixing it with unrelated code obscures both.
- **Delete superseded entries.** Don't archive a stale `feedback_*.md` next to its replacement; remove it. (See `docs/archive/` for the *plan / spec* archive convention — that's a different category.)
- **Update [`MEMORY.md`](./MEMORY.md)** in the same PR when you add or remove a file. The index is the contract.

### Case B — memory edit that codifies a convention introduced *by* a code PR

When a PR introduces a new convention agents must follow (e.g. a new branching rule, a new permission, a new artifact), the memory update **rides with the same PR** — see [`feedback_docs_with_pr.md`](./feedback_docs_with_pr.md). The two rules are not in conflict:

- Case A covers *editing existing memory* — the change is to memory only. Standalone PR.
- Case B covers *introducing a new convention* — the code change *and* the memory update are the same change, conceptually. Same PR, same review.

The test for which case applies: **does the memory edit make sense without the code change?** If yes, Case A. If no, Case B.

## Why

A memory file is read by every agent at session start. Two contradictory files is the worst possible state — agents will pick one at random and act on it. Hard‑deleting a stale entry forces the contradiction to surface as a missing reference (which is debuggable) rather than as silently wrong behaviour (which is not).

Splitting Case B into two PRs (the code change first, the memory update second) sounds tidy but in practice the second PR never gets opened — there's always something more urgent. That's exactly the failure mode [`feedback_docs_with_pr.md`](./feedback_docs_with_pr.md) is written to prevent.

## How to apply

- **Case A title prefix:** `docs(memory): …` or `chore(memory): …`.
- **Case A body:** one bullet per file added/removed/changed, plus the index update.
- **Case B:** the memory update is part of the wider PR's diff and the wider PR's body lists it; no separate prefix.
- If you find yourself wanting to add a *third* `feedback_*.md` on the same topic, you actually want to *replace* the existing one. Edit, don't accrete.

## Hard stops

- Do **not** add a `feedback_*.md` that contradicts `memory/constitution.md`. The constitution wins; if you genuinely think it shouldn't, open an ADR.
- Do **not** put per‑machine paths, individual contributor preferences, or secrets here. See [`README.md`](./README.md).
