# How to authorize a destructive release action

**Goal:** scope, approve, log, and execute an irreversible release action — deploy, force-push to a release branch, prod data migration — so the agent runs it once with explicit human authorization and a paper trail.

**When to use:** Stage 10 (`/spec:release`) has produced a release plan that includes a step the agent cannot run autonomously per Article IX (Reversibility) of [`memory/constitution.md`](../../memory/constitution.md).

**Prerequisites:**

- `specs/<slug>/release-notes.md` and the release plan exist.
- A named human Decider available to authorize the action.
- Both the destructive command AND its rollback procedure written down before you ask.

> The release-notes template ([`templates/release-notes-template.md`](../../templates/release-notes-template.md)) does not ship a built-in Authorization section, because most releases don't need one. When yours does, add a top-level `## Authorization` section just above `## Verification steps` and follow the steps below to fill it.

## Steps

1. Walk the release plan. Mark every step that is irreversible *or* affects shared state (deploy, prod data migration, force-push to a release branch, public announcement). Each one needs its own authorization entry.
2. In `specs/<slug>/release-notes.md`, add `## Authorization` if it isn't there yet. Under it, scaffold one sub-section per destructive step using this shape:

   ```markdown
   ### Step <N> — <one-line title>

   - **Scope:** <exact command, env, artifact — no vague verbs>
   - **Rollback:** <what the human runs if it goes wrong, within how many minutes; "no rollback" if true>
   - **Decider:** <named human>
   - **Approval:** <link to Slack / email / PR comment> · <UTC timestamp>
   - **Execution:** <exit code, key output line> · <UTC timestamp>
   - **Outcome:** ✅ success | ❌ rolled back — <one-line reason>
   ```
3. Send the **Scope** and **Rollback** lines to the named Decider. Wait for an explicit *"approved"* response. Paste the link or quote into **Approval** with a UTC timestamp.
4. Run the command exactly as scoped. Do not generalise the scope; do not retry without re-asking the Decider.
5. Fill **Execution** with the actual exit code and the key line of output. Time-stamp it.
6. If the action failed, run the rollback. Authorization to rollback is implied by the prior approval; authorization to **retry** is not — re-ask the Decider, then add a new `### Step <N> — <title> (retry)` sub-section rather than overwriting the failed one.
7. Update **Outcome**, then commit the updated `release-notes.md` with message `docs(release): authorize <slug> step <N>`.

## Verify

`grep -nE "^## Authorization|^### Step|Approval:|Execution:" specs/<slug>/release-notes.md` shows the Authorization heading, one sub-section per destructive step, and an `Approval` and `Execution` line per step — each with a UTC timestamp and the Decider's identity.

## Related

- Reference — [`templates/release-notes-template.md`](../../templates/release-notes-template.md) — base template; the Authorization section is added on demand.
- Reference — [`docs/specorator.md`](../specorator.md) — Stage 10 definition.
- Reference — [`.claude/agents/release-manager.md`](../../.claude/agents/release-manager.md) — agent scope.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article IX (Reversibility) on why irreversible actions need scoped human approval.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
