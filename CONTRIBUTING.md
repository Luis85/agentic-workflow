# Contributing

This is a **template repo** for spec‑driven, agentic software development. Most projects that adopt it will replace this file with their own contributing guide. The version below is the contributing guide for *this* template — the work of evolving the workflow itself.

## Before you start

Read these in order:

1. [`README.md`](./README.md) — what this repo is and where everything lives.
2. [`AGENTS.md`](./AGENTS.md) — operating rules every agent (and human) follows.
3. [`memory/constitution.md`](./memory/constitution.md) — governing principles. Override only with an ADR.
4. [`docs/spec-kit.md`](./docs/spec-kit.md) — the full workflow definition.
5. [`.claude/memory/MEMORY.md`](./.claude/memory/MEMORY.md) — operational memory (workflow rules + project state).

## How the contribution workflow works

The contribution workflow for this template **uses the workflow it ships**. Even meta‑changes — a new template, a renamed agent, a tightened quality gate — go through `/spec:idea` → `/spec:research` → `/spec:requirements` → … → `/spec:retro`. The repo is its own dogfood.

Concretely:

1. **Branch.** Cut a fresh topic branch off the integration branch. Use one of the standard prefixes — see [`docs/branching.md`](./docs/branching.md).
2. **Worktree.** Put the branch in `.worktrees/<slug>/`. See [`docs/worktrees.md`](./docs/worktrees.md).
3. **Stage.** Walk the appropriate workflow stages for the change you're making. A typo fix doesn't need `/spec:research`; a new agent role does.
4. **Verify.** Run the project's verify gate green before pushing. See [`docs/verify-gate.md`](./docs/verify-gate.md).
5. **PR.** One concern per PR; never stack. See [`feedback_pr_hygiene.md`](./.claude/memory/feedback_pr_hygiene.md).
6. **Review.** Address feedback with follow‑up commits, not rebases. See [`feedback_pr_workflow.md`](./.claude/memory/feedback_pr_workflow.md).
7. **Merge.** Maintainer merges (or autonomous‑merge per [`feedback_autonomous_merge.md`](./.claude/memory/feedback_autonomous_merge.md)).

## What kinds of changes are welcome

| Kind | How |
| --- | --- |
| **Fix a typo / broken link in a doc.** | Direct PR. No spec needed. |
| **Add a `feedback_*.md`** distilling a recurring lesson. | PR under `chore(memory): …`. Keep it short, link to the example that motivated it. |
| **Tighten an existing template.** | PR under `docs(templates): …`. Describe what was missing and why the template now catches it. |
| **Add a new template / slash command / agent role.** | Open an ADR first. The constitution makes new roles ADR‑gated. |
| **Add a new operational bot.** | Add `agents/operational/<name>/PROMPT.md` and `README.md`. Must follow the eight‑section common shape (see `agents/operational/README.md`). |
| **Replace a stage in the workflow.** | ADR. Stages map 1:1 to quality gates and IDs; replacing one is a constitutional‑level change. |
| **Tweak `.claude/settings.json` defaults.** | PR. Loosening a deny rule needs an ADR; tightening one does not. |

## What is **not** welcome

- **Adding a tool to an agent's tool list to "fix" the agent.** Tool restrictions on agents are deliberate. If an agent needs a tool it doesn't have, the work it's being asked to do is the wrong shape. Open an issue.
- **Bypassing verify with `--no-verify` / commit hooks off.** See [`feedback_pr_hygiene.md`](./.claude/memory/feedback_pr_hygiene.md).
- **Stacked PRs.** One concern per branch. If you discover a second concern mid‑PR, open a second branch.
- **Editing an ADR's body.** ADR bodies are immutable. To change a decision, supersede the ADR.
- **Editing files under `docs/archive/`.** Archive is read‑only by convention.

## Agents and humans

Both humans and agents contribute via the same workflow. Agents have *narrower* tool lists than humans — they cannot edit outside their scope, cannot push to protected branches, cannot bypass verify. Those constraints are part of the workflow's safety story; preserve them.

If you're driving an agent‑heavy session:

- Start with `/spec:start` to set up the feature directory.
- Use the orchestrator agent to route between stages — don't pick stages by hand.
- Mark stages complete only when their quality gate is green. The orchestrator won't let you advance past a red gate without an explicit override.
- Run `/spec:retro` at the end. The retrospective is mandatory, not optional ([Article X — Iteration](./memory/constitution.md)).

## Style

- Markdown for all artifacts. Concise + precise beats long + complete in early iterations.
- Filenames are kebab‑case.
- IDs are stable: `REQ-<AREA>-NNN`, `T-<AREA>-NNN`, `TEST-<AREA>-NNN`, `ADR-NNNN`.
- Commit messages: imperative mood, reference IDs (`feat(spec): add T-AUTH-014 password reset`).
- ADR bodies are immutable. The only fields ever updated on an existing ADR are `status` and `superseded-by`.

## Questions, ambiguity

The constitution's [Article VII — Human Oversight](./memory/constitution.md) reserves intent, priorities, and acceptance for humans. If you're an agent and a question of intent comes up, **escalate** — don't invent. If you're a human and an agent escalates, give a clear answer; "use your judgement" is rarely the right one.

## License

[MIT](./LICENSE) — same as the repo.
