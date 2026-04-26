# Docs + plan updates ride with their PR

## Rule

Every PR that changes user‑visible behaviour, project structure, or workflow conventions also updates the relevant document(s) **in the same PR**:

- A change to a public API → its reference doc / changelog / migration note.
- A roadmap row that ships → tick it `[x]` on the active plan in `docs/plans/`.
- A new convention agents must follow → an update to `.claude/memory/` or the appropriate steering file (`docs/steering/`).
- A new dependency or tool → a one‑line entry in `docs/steering/tech.md`.
- A constitutional change → an ADR in `docs/adr/` and a constitution version bump.

## Why

Documentation drift is the single largest source of agent confusion in a long‑lived repo. When the doc lags the code by one PR, the next agent reads stale truth and re‑implements something that already exists, or builds on a constraint that no longer applies.

Splitting "the change" and "the doc update" into two PRs sounds tidy but in practice the second PR never gets opened — there's always something more urgent.

## How to apply

- Before opening a PR, ask: "what reads false now that this lands?" Update those files in the same PR.
- The plan row, the changelog entry, the migration note are part of the change — not optional decoration.
- For invisible refactors that genuinely don't change behaviour or interfaces: no doc update is needed. Most changes are not in this category.

## Hard stops

- Do **not** open a follow‑up PR titled "docs: …" for something the original PR introduced. That's a sign the original PR was incomplete.
- Do **not** mark a plan row shipped before the PR that ships it has merged. The plan reflects reality, not intent.
