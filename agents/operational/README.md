# Operational agents

The thirteen subagents in [`.claude/agents/`](../../.claude/agents/) cover the **lifecycle** of building one feature: idea → research → requirements → … → retrospective.

This directory covers the other axis: **always‑on, recurring agents** that run against the live repo on a schedule (or on a trigger) and produce small, surgical interventions — not feature work.

Each operational agent is one directory containing:

- **`PROMPT.md`** — the source‑of‑truth system prompt the scheduled run loads. Edit here, commit on a topic branch, open a PR — the next run picks up the new version after merge.
- **`README.md`** — operator‑facing notes: how the routine is scheduled, where its outputs go, what label it uses, what setup is needed.

## Why a second class of agent

Lifecycle agents answer *"what stage of building feature X are we in?"*. Operational agents answer *"what's drifting in the repo right now, and how do we surface it without humans having to look?"* They are bounded, idempotent, and conservative by design — the bar is "does no harm on a quiet day".

The pattern is well‑established (Dependabot, Renovate, scheduled‑review bots) but typically lives as opaque YAML. Capturing the prompt + the operator notes in‑repo makes the routine reviewable, forkable, and version‑controlled like any other artifact.

## Common shape

Every operational agent's `PROMPT.md` covers the same eight sections so reviewers and operators can scan them quickly. The section headings must match exactly (no renames like "Process per PR" — write a sub‑heading underneath instead):

1. **Role** — one sentence: what this agent does, what it does **not** do.
2. **Scope this run** — what triggers it, what artifacts it inspects, what would make this run a no‑op.
3. **Process** — ordered steps, with the exact decision criteria. Sub‑headings ("Process — per PR", "Process — per file") are fine; the parent heading is `## Process`.
4. **Hard rules** — non‑negotiables. Always one of: "never edit X", "never push to Y", "never auto‑merge Z".
5. **Output** — primary sink (PR or issue), secondary sink, and the conditions under which the run is silent (no PR, no issue).
6. **Idempotency** — how a re‑run on the same repo state is a no‑op (HTML markers, branch‑name dedup, label scan).
7. **Failure handling** — exact behaviour when the verify gate fails, when GitHub API fails, when the gate detects an upstream break.
8. **Dry‑run mode** — the contract that `DRY_RUN=1` produces zero side effects, useful for testing the prompt itself.

## Severity scale (canonical, all bots)

Every bot that emits findings (`review-bot`, `docs-review-bot`) uses the same four‑tier scale, so a reader can compare severities across bots without re‑reading each prompt. Each bot's prompt is allowed to *narrow* the scope ("docs‑only drift" vs. "logic bugs") but not to *redefine* the tiers themselves.

- **`[BLOCKER]`** — known wrong, costs the project something concrete (a broken build, a security gap, an onboarding failure, a false claim that a contributor will hit). Must fix before the next release or merge.
- **`[MAJOR]`** — wrong on some inputs / in some workflows; an attentive reader would notice within one work session. Fix soon.
- **`[MINOR]`** — questionable shape, possible future bug, owner judgement call. Park or fix per backlog.
- **`[NIT]`** — style / preference; do not file unless explicitly asked.

A finding tagged `[BLOCKER]` by `review-bot` and a finding tagged `[BLOCKER]` by `docs-review-bot` are equally severe — both must‑fix‑before‑release. Don't escalate or de‑escalate the meaning per bot.

## Authentication contract

Every bot that talks to GitHub depends on:

- **`GH_TOKEN`** (or `GITHUB_TOKEN`) — token with the scopes the bot's prompt declares it needs. A run with the token unset must exit non‑zero with a setup‑error message; never silently skip writes.
- **`ROUTINE_GH_LOGIN`** — the GitHub login the bot posts as. This is the trust boundary for "an existing PR / comment is mine vs. someone else's". A run with `ROUTINE_GH_LOGIN` unset must exit non‑zero — never fall back to "any author" (the routine would then claim other people's comments).

Scope these in your scheduler (GitHub Actions secret, external cron env, etc.). Do not bake them into prompts.

## Seeded operational agents

| Agent | Trigger | Primary output |
| --- | --- | --- |
| [`review-bot/`](./review-bot/) | Daily on the integration branch | Adversarial code‑review issue + a daily markdown digest. |
| [`docs-review-bot/`](./docs-review-bot/) | Weekly | Issue listing doc/code drift findings. Read‑only. |
| [`plan-recon-bot/`](./plan-recon-bot/) | Weekly | PR moving completed plans from `docs/plans/` to `docs/archive/plans/`. |
| [`dep-triage-bot/`](./dep-triage-bot/) | On Dependabot/Renovate PR open + daily sweep | Auto‑merges safe bumps; flags risky ones for the owner. |
| [`actions-bump-bot/`](./actions-bump-bot/) | Weekly | PR bumping pinned `uses:` SHAs in `.github/workflows/`. |

## Running these in your project

These prompts are **templates**, not turnkey services. Each one references a verify gate, an integration branch, and a labels convention that your project must define. The minimum to adopt:

1. Define the project's `verify` command (see [`docs/verify-gate.md`](../../docs/verify-gate.md)).
2. Pick the integration branch (`develop` or `main`) and reflect it in `.claude/settings.json` deny rules.
3. Create the labels each bot expects (`review-bot`, `docs-review`, `dep-triage-bot`, `actions-bump-bot`, `plan-recon-bot`).
4. Schedule the runs (GitHub Actions cron, an external scheduler, or manual trigger).
5. Tune the `Hard rules` section of each prompt to match your project's risk tolerance.

The cost of running operational agents is non‑zero — each one produces noise during onboarding. Adopt them one at a time, watch a few runs, then move on.
