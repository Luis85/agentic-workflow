# `docs/archive/`

Archive of historical artifacts that are no longer the **current** truth but are kept for institutional memory.

## What goes here

- **`docs/archive/plans/`** — completed plans moved from `docs/plans/`. See [`docs/plans/README.md`](../plans/README.md).
- **`docs/archive/specs/`** — superseded feature specs. (Most specs live under `specs/<slug>/`; archive only when a spec has been fully superseded by a successor.)
- **`docs/archive/<other>/`** — by category, as the project accumulates them. Keep the categorisation flat — one level deep is enough.

## What does NOT go here

- **Plans / specs that are still live but unfashionable.** Mark them `superseded` in place; archive only when the successor has fully landed.
- **Old code.** That's what `git log` is for.
- **Debug notes.** Keep those in the PR description.
- **ADRs.** ADRs are immutable. To change a decision, *supersede* it via a new ADR — never archive.

## Immutability convention

Files in `docs/archive/` are **read‑only by convention**. The only edit ever made to an archived file is the prepended archival banner:

```markdown
> **Archived YYYY-MM-DD.** This <plan|spec> was completed and moved by <author or bot>. Original location: `<original/path>`. Successor: <link or "none">.

```

If you need to change the substance of an archived document — to correct an error, add a clarification — open a *new* document in the live directory that supersedes the archived one. Don't edit history.

## Why archive instead of delete

Three reasons:

1. **Retrospectives.** Six months in, "why did we do it that way?" is answered by reading the original plan, not by guessing.
2. **External links don't break.** PRs and issues link to plan rows; deleting the file produces 404s.
3. **The retrospective stage of the workflow** ([`templates/retrospective-template.md`](../../templates/retrospective-template.md)) explicitly cross‑references the original plan.

## How files arrive here

- **Manually** via a small `docs(archive): …` PR — typical for specs.
- **Automated** via [`plan-recon-bot`](../../agents/operational/plan-recon-bot/PROMPT.md) — typical for plans.

In both cases, the move is performed via `git mv` so file history is preserved.

## Cleaning up

Don't. Once a file is archived, it stays. The directory grows monotonically. If it gets unwieldy, add subdirectories by year (`docs/archive/plans/2026/`); do not delete.

## See also

- [`docs/plans/README.md`](../plans/README.md) — what plans look like before they end up here.
- [`agents/operational/plan-recon-bot/PROMPT.md`](../../agents/operational/plan-recon-bot/PROMPT.md) — the routine that performs the moves.
