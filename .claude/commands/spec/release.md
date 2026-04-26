---
description: Stage 10 — Release. Invokes release-manager to produce release-notes.md, verify rollback and observability, and prepare the release. Does not deploy without explicit user authorisation.
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /spec:release

Run **stage 10 — Release**.

1. Resolve slug; verify the review is `Approved` (and any conditions are met).
2. **Spawn the `release-manager` subagent.** It:
   - writes `specs/<slug>/release-notes.md` (audience: users / stakeholders),
   - updates the project CHANGELOG,
   - verifies rollback plan documented and rehearsable,
   - verifies observability hooks (metrics, dashboards, alerts) in place,
   - drafts the communication plan,
   - tags the release / cuts the artifact per `docs/steering/operations.md`.
3. **Stop and ask the human** before any irreversible deployment action. Authorisation in the past does not authorise the present.
4. Update `workflow-state.md`. Recommend `/spec:retro` next.
