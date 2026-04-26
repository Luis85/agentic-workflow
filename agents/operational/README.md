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

Every operational agent's `PROMPT.md` covers the same eight sections so reviewers and operators can scan them quickly:

1. **Role** — one sentence: what this agent does, what it does **not** do.
2. **Scope this run** — what triggers it, what artifacts it inspects.
3. **Process** — ordered steps, with the exact decision criteria.
4. **Hard rules** — non‑negotiables. Always one of: "never edit X", "never push to Y", "never auto‑merge Z".
5. **Output** — primary sink (PR or issue), secondary sink, and the conditions under which the run is silent (no PR, no issue).
6. **Idempotency** — how a re‑run on the same repo state is a no‑op (HTML markers, branch‑name dedup, label scan).
7. **Failure handling** — exact behaviour when the verify gate fails, when GitHub API fails, when the gate detects an upstream break.
8. **Dry‑run mode** — the contract that `DRY_RUN=1` produces zero side effects, useful for testing the prompt itself.

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
