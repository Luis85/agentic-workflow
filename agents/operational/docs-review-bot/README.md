# docs-review-bot — operator notes

Companion to [`PROMPT.md`](./PROMPT.md). The prompt is loaded by the routine; this file explains scheduling and observation.

## What it does

Audits in‑repo Markdown for drift against the current code state. Files one issue per run with the findings as a Markdown checklist; opens **no PRs**.

## Why a separate bot from `review-bot`

`review-bot` reviews **code commits**. `docs-review-bot` reviews **prose**. They share the same finding‑ID convention (`<sha7>.<idx>`) and severity scheme, but their failure modes and cadence differ enough to keep them separate.

## Outputs

GitHub issue, label `docs-review`, title `Docs review YYYY-MM-DD — <head-sha7>`.

## Setup checklist

1. Create the `docs-review` label.
2. (Optional) Add `docs-review` to your scheduled‑bot dashboard or to the project's daily‑digest aggregation.
3. Run `DRY_RUN=1` once before scheduling and read the stdout dump.
4. Schedule weekly (typical: Monday 06:00 UTC).

## Tuning

- **Severity floor.** The prompt suppresses `[NIT]`s. Loosen to `[MINOR]` only if your team uses the bot's findings as a doc backlog.
- **Scope.** The default scope excludes `docs/archive/`. Add per‑project exclusions (e.g. `examples/legacy/`) by editing the prompt.
- **Cadence.** Weekly is the sweet spot. Daily is too noisy; monthly accumulates too much drift.

## Cost / noise tradeoff

On a young repo (< 6 months) the bot mostly finds dead links from rapid renames. On a mature repo it surfaces real drift between specs and code — exactly what you want before a release. Defer enabling it until the repo has enough docs to drift; an empty `docs/` directory just produces empty issues.

## See also

- [`docs/spec-kit.md`](../../../docs/spec-kit.md) — the source of truth for what each doc *should* say.
- [`feedback_docs_with_pr.md`](../../../.claude/memory/feedback_docs_with_pr.md) — the rule that prevents most drift in the first place.
