---
description: Stage 10 — Release. Invokes release-manager to produce release-notes.md, verify rollback and observability, and prepare the release. Does not deploy without explicit user authorisation.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Bash]
model: sonnet
---

# /spec:release

Run **stage 10 — Release**. Irreversible actions (tagging, publishing, deploying) come **after** explicit human authorisation, never before.

1. Resolve slug; verify the review is `Approved` (and any conditions are met).
2. **Spawn the `release-manager` subagent** for the **prepare** phase. It:
   - writes `specs/<slug>/release-notes.md` (audience: users / stakeholders),
   - updates the project CHANGELOG,
   - verifies the rollback plan is documented and rehearsable,
   - verifies observability hooks (metrics, dashboards, alerts) are in place,
   - drafts the communication plan.
   The agent **does not** tag, push, publish, or deploy in this phase.
3. **Stop and ask the human** for explicit authorisation to proceed with the irreversible actions. Authorisation in the past does not authorise the present; ask for the current release.
4. Only after explicit authorisation, the release-manager performs the **publish** phase: tag the release / cut the artifact per `docs/steering/operations.md`. Each irreversible side effect (tag push, registry publish, deploy trigger) is announced before it runs.
5. Update `workflow-state.md`. Recommend `/spec:retro` next.
