---
title: "How-to recipes"
folder: "docs/how-to"
description: "Entry point for task-oriented recipes and planned how-to coverage."
entry_point: true
---
# How-to recipes

Task-oriented recipes — *"how do I do X?"* Each recipe takes you from a known starting point to a concrete end state, in steps you can copy-paste.

> If you are learning Specorator for the first time, start with the [tutorial](../tutorials/first-feature.md). Recipes assume you already know the basics.

For the full doc map by Diátaxis quadrant — Tutorials / How-to / Reference / Explanation — see [`docs/README.md`](../README.md).

## Available recipes

All recipes below are runnable and link out for the *why*. The first five are the original MVP set; the next nine were promoted from stubs as the workflow surface stabilised.

**Onboarding and configuration**

- [How to fork and personalize the template](./fork-and-personalize.md) — turn a fresh clone into your own project.
- [How to adapt steering for your own stack](./adapt-steering.md) — rewrite `docs/steering/*.md` so agents read your real context.
- [How to customize agent permissions](./customize-agent-permissions.md) — change a tool list at the per-agent or project level.
- [How to migrate an existing project to Specorator](./migrate-to-specorator.md) — overlay the workflow on a brownfield codebase.

**Day-to-day workflow tasks**

- [How to resume a paused feature](./resume-paused-feature.md) — pick up an in-progress feature at the right stage.
- [How to skip the Discovery Track on a simple feature](./skip-discovery.md) — go straight to `/spec:idea` and document the skip.
- [How to write a requirement in EARS notation](./write-ears-requirement.md) — produce one functional requirement, ready for testing.
- [How to file a new Architecture Decision Record](./add-adr.md) — capture an irreversible decision in `docs/adr/`.
- [How to run the verify gate](./run-verify-gate.md) — `npm run verify` green before pushing.

**Quality and release**

- [How to trace a failing test back to a requirement](./trace-failing-test.md) — walk the chain to find which layer the defect lives in.
- [How to run a retrospective](./run-retrospective.md) — Stage 11, mandatory before marking a feature complete.
- [How to authorize a destructive release action](./authorize-destructive-release.md) — scope, approve, log, execute.

**Tooling and extensibility**

- [How to switch from Claude Code to Codex / Cursor / Aider](./switch-ai-tool.md) — continue a feature in a different AI tool.
- [How to bootstrap a new operational bot](./bootstrap-operational-bot.md) — scheduled bot under `agents/operational/`.

## Operational runbooks

For 2 a.m. / SRE / on-call procedures, see the operational playbooks at [`docs/playbooks/`](../playbooks/). The two collections are intentionally separate — recipes here are *workflow tasks for builders*; playbooks are *operational responses to incidents*.

## Contributing a recipe

1. Copy [`_template.md`](./_template.md) to `docs/how-to/<your-slug>.md`.
2. Fill every required section. Keep every section other than `## Steps` to two sentences.
3. Replace any stub-marker line if you are converting a 🚧 planned entry.
4. Update this index — promote your recipe from the planned list to the available list.
5. Update [`docs/README.md`](../README.md) if your recipe needs visibility from the hub.
6. Open a PR.

## Recipe shape

Every recipe — MVP or contributed — contains these sections, in order:

- `# How to <do thing>` — title in imperative form.
- `**Goal:**` — one sentence, the end state.
- `**When to use:**` — one sentence, the trigger.
- `**Prerequisites:**` — bulleted list.
- `## Steps` — numbered, runnable; each step is one command or one decision.
- `## Verify` — one observable check that the goal is reached.
- `## Related` — links to Reference, Explanation, and adjacent How-to.

No section other than `## Steps` may exceed two sentences. Recipes contain no theory; *why*-content lives under [Explanation](../README.md#explanation).
