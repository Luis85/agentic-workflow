---
id: ADR-0004
title: Adopt operational agents alongside lifecycle agents
status: accepted
date: 2026-04-26
deciders: [repo-owner]
consulted: []
informed: []
supersedes: []
superseded-by: []
tags: [process, agents, automation]
---

# ADR-0004 — Adopt operational agents alongside lifecycle agents

## Status

Accepted

## Context

The constitution's **Article VI — Agent Specialisation** requires that "each agent operates only within its defined scope" and that scope changes happen through ADRs, not through silent expansion. **Article VII — Human Oversight** reserves intent, priorities, and acceptance for humans. **Article IX — Reversibility** requires explicit human authorisation for irreversible or shared‑state actions.

The thirteen lifecycle agents already shipped under `.claude/agents/` (analyst, pm, ux‑designer, ui‑designer, architect, planner, dev, qa, reviewer, release‑manager, sre, retrospective, orchestrator) cover the work of *building one feature* end‑to‑end. They are invoked synchronously, run inside one feature's `specs/<slug>/` directory, and produce artifacts that downstream lifecycle agents consume.

A second class of work is not covered by these agents: **scheduled, repository‑wide routines that run against the live repo on a cadence**. Examples observed in long‑lived agentic codebases:

- A daily code review of recent integration‑branch commits.
- A weekly audit of in‑repo Markdown for drift versus the current code state.
- A weekly archival pass over completed plan documents.
- An ongoing triage of dependency‑update PRs.
- A weekly bump of pinned `uses:` SHAs in CI workflows.

These routines are **not** feature work; they have no spec, no requirements, no quality gate of their own. Skipping them entirely (the v0.1 default) leaves stale plans, drifting docs, and an unmerged dependency backlog. Wedging them into the lifecycle role table (e.g. extending `reviewer` to do daily commit reviews) collapses two different problem shapes — building one feature vs. running steady‑state hygiene — into a single role, contrary to **Article II — Separation of Concerns**.

This ADR records the introduction of a second class of agent — **operational agents** — and the constitutional authorisation they require under Articles VI, VII, and IX.

## Decision

We adopt **operational agents** as a sibling category to lifecycle agents:

- Operational agents live under `agents/operational/<name>/`.
- Each operational agent is two files: `PROMPT.md` (loaded by the scheduled run) and `README.md` (operator notes — schedule, label setup, tuning).
- Every operational agent's `PROMPT.md` follows the same eight‑section shape: **Role / Scope this run / Process / Hard rules / Output / Idempotency / Failure handling / Dry‑run mode**. This is the operational analogue of the lifecycle agent's "narrow tool list" — a contract of constraint, not capability.
- Operational agents are **opt‑in per project**. Their `README.md` explicitly notes the schedule, the label they require, and the cost / noise tradeoff. Adopt one at a time after the lifecycle workflow is in routine use.
- Five seeded operational agents ship in v0.1: `review-bot`, `docs-review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`.

To preserve **Article VII — Human Oversight** and **Article IX — Reversibility**, every operational agent's prompt must:

1. Be **conservative by default** — produce no PR, no issue, no comment on a "quiet day".
2. Be **idempotent** — a re‑run on the same repo state produces no additional artifacts.
3. **Never** perform an irreversible action (merge, force‑push, file deletion) without invoking the four gates of [`feedback_autonomous_merge.md`](../../.claude/memory/feedback_autonomous_merge.md): positive automated‑review approval, CI green, `mergeStateStatus == CLEAN`, no human review currently requested. The gates are how human authorisation is encoded into a routine that runs without a human in the loop.
4. **Never** weaken or skip a quality gate to pass (no `--no-verify`, no test deletion, no lint disable).
5. Provide a **`DRY_RUN`** mode whose contract is "no commits, no remote‑side writes, no cache files".

## Considered options

### Option A — extend lifecycle agents (rejected)

Extend the existing `reviewer` to do daily reviews; extend `release-manager` to do dependency triage; etc.

- Pros: no new directory; reuses existing role boundaries.
- Cons: collapses two distinct concerns (build one feature vs. run steady‑state hygiene) into one role; lifecycle agents are invoked synchronously with feature‑specific input, scheduled agents are not; the `reviewer` agent's tool list (read‑only on source) is wrong for `dep-triage-bot` (needs `gh pr merge`); breaks Article II.

### Option B — bundle operational routines as opaque CI YAML (rejected)

Write each routine directly as a GitHub Action with the policy hard‑coded into the YAML.

- Pros: no new repo concept; uses an existing scheduler.
- Cons: routine policy is buried in YAML where it can't be reviewed as a prompt; the same logic can't be reused on a different scheduler (external cron, manual trigger); no path for an agent to *adopt* the routine in a project that isn't on GitHub Actions; loses the read‑first‑then‑think shape that lifecycle prompts use.

### Option C — operational agents as a sibling category (chosen)

Add `agents/operational/` with one directory per routine; each contains a `PROMPT.md` (the policy) and a `README.md` (operator notes). The scheduler is a project‑level choice; the prompt is the source of truth and is reviewable in isolation.

- Pros: separation of concerns preserved; prompts are reviewable and forkable; same prompt is portable across schedulers; the eight‑section shape makes the contract explicit; `README.md` makes the cost / noise tradeoff visible before adoption.
- Cons: a new directory to learn; risk that operators conflate operational with lifecycle agents (mitigated by file‑map updates in `README.md`, `AGENTS.md`, `CLAUDE.md`).

## Consequences

### Positive

- The constitutional gates from Articles VII and IX are explicitly invoked by every operational agent's prompt, rather than implied.
- The five seeded operational agents are reviewable as prose, not as opaque automation. A reader can audit `dep-triage-bot/PROMPT.md` to see exactly when it would auto‑merge.
- The lifecycle agents' tool restrictions remain intact. `dep-triage-bot`'s authority to merge does not leak into `dev` or `reviewer`.
- New operational agents can be added in future projects by following the eight‑section template, without re‑opening Article VI.

### Negative

- Two classes of agent is a learnability cost — the file map needs to make the distinction obvious every place an agent is referenced.
- Operational agents key off labels, branches, and tooling that don't exist in the v0.1 template — adoption requires per‑project setup before the first run.
- The seeded `dep-triage-bot` and `actions-bump-bot` reference scanner scripts and helper functions that are not shipped here. The contract is documented; the implementation is left to the adopting project.

### Neutral

- The `agents/operational/` directory sits at the repo root, parallel to `.claude/agents/`. The asymmetry (`.claude/agents/` is Claude‑Code‑scoped, `agents/operational/` is tool‑agnostic) is deliberate — operational prompts run on a scheduler, not inside Claude Code.
- The eight‑section shape is enforced by convention, not by tooling. A future operational agent that omits a section is a finding for the `docs-review-bot` to surface.

## Links

- Constitution: `memory/constitution.md` — Articles II, VI, VII, IX.
- `agents/operational/README.md` — the eight‑section common shape and the seeded bots.
- `.claude/memory/feedback_autonomous_merge.md` — the four gates that any agent‑driven merge must satisfy.
- `.claude/memory/feedback_docs_with_pr.md` — why each operational agent's docs ride with its prompt.
- ADR‑0001 — the meta‑decision that ADRs are how irreversible architectural decisions are recorded.
