---
description: Stage 10 — Release. Invokes release-manager to prepare release readiness, produce release-notes.md, verify rollback and observability, and prepare the release. Does not deploy without explicit user authorisation.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Bash]
model: sonnet
---

# /spec:release

Run **stage 10 — Release**. Irreversible actions (tagging, publishing, deploying) come **after** explicit human authorisation, never before.

1. Resolve slug; verify `review.md` verdict is `Approved` or `Approved with conditions` (per `templates/review-template.md` verdict checkboxes); if `Approved with conditions`, confirm every listed condition has been resolved before continuing. A `Blocked` verdict escalates back to the owning stage.
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `release-manager` subagent** for the **prepare** phase. It:
   - creates `specs/<slug>/release-readiness-guide.md` when the release has multiple product perspectives, stakeholder approvals, operational risk, compliance/privacy/security implications, commercial impact, or explicit conditions,
   - writes `specs/<slug>/release-notes.md` (audience: users / stakeholders),
   - updates the project CHANGELOG,
   - verifies the rollback plan is documented and rehearsable,
   - verifies observability hooks (metrics, dashboards, alerts) are in place,
   - drafts the communication plan.
   The agent **does not** tag, push, publish, or deploy in this phase.
4. **Stop and ask the human** for explicit authorisation to proceed with the irreversible actions. Authorisation in the past does not authorise the present; ask for the current release.
5. Only after explicit authorisation, **re-spawn the `release-manager` subagent in publish mode** (the prepare-phase agent has already returned; subagents are stateless across the human-authorisation pause). The publish-phase agent performs each irreversible side effect (tag push, registry publish, deploy trigger) one at a time, announcing each before it runs. The step-4 authorisation covers the announced sequence; any deviation requires a fresh ask.
6. Update `workflow-state.md`.
7. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage: release`, `roadmap_status: shipped`, `updated_at`), push the branch. PR is already marked ready (or merged) at this stage.
8. Recommend `/spec:retro` next.
