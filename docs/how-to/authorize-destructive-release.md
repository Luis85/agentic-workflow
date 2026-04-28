# How to authorize a destructive release action

**Goal:** scope, approve, log, and execute an irreversible release action — deploy, force-push to a release branch, prod data migration — so the agent runs it once with explicit human authorization and a paper trail.

**When to use:** Stage 10 (`/spec:release`) has produced a release plan that includes a step the agent cannot run autonomously per [Article IX](../../memory/constitution.md).

**Prerequisites:**

- `specs/<slug>/release-notes.md` and the release plan exist.
- A named human Decider available to authorize the action.
- Both the destructive command AND its rollback procedure written down before you ask.

## Steps

1. Open `specs/<slug>/release-notes.md` and find the section labelled `Authorization required:`. Each item there is a destructive action.
2. For each item, write a one-line **scope statement** — exactly which command, against which environment, on which artifact. No vague verbs (no "deploy"; instead, "run `kubectl apply -f manifests/prod/api.yaml` against cluster `prod-eu`").
3. Write a one-line **rollback statement** — what the human will run if the action goes wrong, within how many minutes. If there is no rollback, say so explicitly.
4. Send the scope + rollback to the named Decider. Wait for an explicit *"approved"* response. Capture the approval (Slack permalink, email, signed PR comment) in `release-notes.md` under `Authorization log:` with a UTC timestamp.
5. Run the command exactly as scoped. Do not generalise the scope; do not retry without re-asking the Decider.
6. Capture the actual outcome — exit code, full output — in `release-notes.md` under `Execution log:`. Time-stamp it.
7. If the action failed, run the rollback. Authorization to rollback is implied by the prior approval; authorization to **retry** is not — re-ask the Decider.
8. Commit the updated `release-notes.md` with message `docs(release): authorize <slug> step <N>`.

## Verify

`release-notes.md` has both `Authorization log:` and `Execution log:` filled with UTC timestamps and the Decider's identity, and the production environment is in the expected post-release state.

## Related

- Reference — [`docs/specorator.md`](../specorator.md) — Stage 10 definition.
- Reference — [`.claude/agents/release-manager.md`](../../.claude/agents/release-manager.md) — agent scope.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article IX on reversibility.
