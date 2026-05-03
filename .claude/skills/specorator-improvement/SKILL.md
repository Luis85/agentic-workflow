---
name: specorator-improvement
description: "Improve the Specorator template itself — scripts, tooling, workflow, agents, skills, templates, docs, and operational automation — through the spec-driven contributor loop. TRIGGER when: new track, new agent, new skill, new workflow, template self-change, modifying docs/ .claude/ scripts/ templates/ AGENTS.md CLAUDE.md, or any change to Specorator itself. SKIP when: building a downstream product with the template (use orchestrate instead)."
argument-hint: "<mode> <improvement idea>"
---

# Specorator Improvement

Use this skill when a user is actively working with Specorator and wants to improve the template itself, such as adding a quality drift review script, a CI tool, a new workflow, or updates to the Specorator method.

This skill is for **the template repository**. If the request is about a product being built with the template, route to `orchestrate`, `discovery-sprint`, `project-scaffolding`, or the active feature workflow instead.

## When to invoke (trigger keywords)

Invoke this skill — ahead of any generic brainstorming or planning skill — when the work involves:

- Adding or changing a **track**, **stage**, **agent**, **skill**, **slash command**, or **workflow rule**
- Modifying `docs/`, `.claude/`, `scripts/`, `templates/`, `memory/`, `AGENTS.md`, or `CLAUDE.md`
- Any phrase like "new track", "new agent", "new skill", "new workflow", "update template", "change workflow", "add script", "add CI", "fix specorator", "improve the template"

**Skip** this skill when building a downstream product *with* the template. Use `orchestrate`, `discovery-sprint`, `project-scaffolding`, or the active feature workflow instead.

## Modes

- `script` — repository scripts, checks, fixers, generated references, diagnostics.
- `tooling` — CI, dependencies, operational agents, scheduled automation, developer tooling.
- `workflow` — lifecycle changes, tracks, slash commands, agents, skills, templates, state files, handoffs.
- `update` — classify the idea first, then apply the relevant mode rules.

## Read first

- `AGENTS.md`
- `memory/constitution.md`
- `.claude/memory/MEMORY.md`
- `.codex/instructions.md` and `.codex/workflows/pr-delivery.md` when Codex is making the change.
- `docs/specorator.md`
- `docs/quality-framework.md`
- Relevant docs under `docs/steering/`, `docs/scripts/`, `docs/workflow-overview.md`, and `docs/sink.md`.

## Improvement loop

0. **Intake gate.** List `inputs/` non-recursively before framing. Surface every item via a single `AskUserQuestion`: "I see N items in `inputs/`. Which are relevant for this improvement?" Improvement work often arrives as a pre-staged zip (design system, plugin pack, vendor handoff) — those are exactly the work packages this gate is for. Never auto-extract archives — extraction is a separate, explicitly approved step. Cite paths into `inputs/` from the lifecycle artifact at step 2. Full contract: [`docs/inputs-ingestion.md`](../../../docs/inputs-ingestion.md). Decision: [ADR-0017](../../../docs/adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md).
1. **Frame the improvement.** State the problem, user scenario, non-goals, and the expected artifact or automation. Example: "When an active contributor changes workflow docs, the template should detect quality drift before PR."
2. **Trace it.** Find or create the lifecycle artifact under `specs/<feature>/` that owns the change. Requirements and tasks must use stable IDs when the change is non-trivial.
3. **Classify scope.** Decide whether the change touches scripts, tooling, workflow, docs, agents, skills, templates, state/schema, product page, operational agents, or ADRs.
4. **Design before implementation.** For workflow or tooling changes, write down affected surfaces and quality gates before editing implementation files.
5. **Patch all owned surfaces.** Keep docs, commands, skills, scripts, generated references, examples, state files, and PR text consistent in the same branch.
6. **Repair generated content.** Run the narrow fix command for changed generated surfaces:
   - `npm run fix:commands` after slash-command changes.
   - `npm run fix:script-docs` after script API doc changes.
   - `npm run fix:adr-index` after ADR changes.
   - `npm run fix` when multiple generated surfaces changed.
7. **Verify.** Run targeted checks while iterating, then `npm run verify` before push.
8. **Deliver.** Commit with an imperative message that references the owning requirement, task, issue, or artifact. Push the branch and open a PR when GitHub access is available.

## Script checklist

- [ ] CLI entry lives in `scripts/<name>.ts`.
- [ ] Reusable logic lives in `scripts/lib/` when it will be shared or tested directly.
- [ ] Tests live under `tests/scripts/**/*.test.ts`.
- [ ] User-facing command is added to `package.json`.
- [ ] Read-only checks use `check:*`; deterministic mutators use `fix:*`.
- [ ] Diagnostics support human-readable output and `--json` when useful.
- [ ] `scripts/README.md` and generated `docs/scripts/` stay current.
- [ ] `npm run verify` includes the check when drift should fail the gate.

## Tooling checklist

- [ ] Trigger and authority are explicit: local, PR CI, scheduled, manual, or operational agent.
- [ ] Permissions are least-privilege and documented.
- [ ] New dependencies have a PR justification and lockfile update.
- [ ] Architecturally significant tooling has an ADR.
- [ ] Failure behavior is explicit: warn, fail verify, open issue, comment on PR, or block release.
- [ ] Rollback or disable path is documented for CI and scheduled automation.

## Workflow checklist

- [ ] Workflow class is named: lifecycle stage, optional gate, pre-stage track, operational routine, project track, portfolio track, or contributor workflow.
- [ ] Owner role and handoff points are explicit.
- [ ] Persistent artifacts have templates and sink documentation.
- [ ] State transitions and skip rules are documented.
- [ ] Slash commands, skills, agents, and command inventories are consistent.
- [ ] `docs/specorator.md` and `docs/workflow-overview.md` describe the new user path.
- [ ] Any irreversible governance change has an ADR.

## Quality drift review pattern

For ideas like "automate quality drift review," prefer this sequence:

1. Add a read-only check that detects drift and emits stable diagnostics.
2. Add a deterministic fixer only for generated or mechanical drift.
3. Document how humans interpret and resolve non-mechanical findings.
4. Wire the read-only check into `npm run verify` once false positives are controlled.
5. Add an operational routine only after local and PR behavior is stable.

## Stop conditions

Pause and ask the human before:

- Changing the constitution.
- Adding write, merge, deployment, or destructive automation.
- Creating a new mandatory stage or changing existing stage ownership.
- Force-pushing, deleting remote branches, or merging the PR.
