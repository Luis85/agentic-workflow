---
id: IDEA-IFI-001
title: Adopt issue-first interaction model
stage: idea
feature: adopt-issue-first-interaction-model
status: accepted
owner: analyst
created: 2026-05-03
updated: 2026-05-03
---

# Idea — Adopt issue-first interaction model

## Problem statement

Specorator's current entry point is a slash command (`/spec:start <slug>` or `/orchestrate`). The user's intent, the scope debate, and any guard-rails supplied before kickoff exist only in the chat transcript — there is no durable, GitHub-native artifact that records why a feature was started or what constraints govern it. When a feature is revisited days later, when a second contributor joins, or when a PR reviewer asks "what was the original intent?", that information is either lost or scattered across chat history. GitHub issues are the natural place users already capture and iterate on this intent; Specorator currently ignores them.

## Target users

- **Primary:** Solo builders and small product/engineering teams using Specorator who already open GitHub issues to capture ideas before writing code.
- **Secondary:** Downstream adopters of the template who want a lightweight governance trail linking every spec run to a traceable, human-readable GitHub artifact.

## Desired outcome

After this feature ships, a user who opens a GitHub issue describing a problem can move from that issue directly into the Specorator workflow with a single command. The issue becomes the persistent record of intent and progress: it receives a lightweight mirror of workflow state after each stage, and it closes automatically when the feature PR merges. The 11-stage workflow itself, all agent scopes, and all quality gates remain unchanged — the issue layer is purely additive.

## Constraints

- **Technical:** Must not modify the 11 stages, their agents, or their artifact schemas. Changes are additive or update existing entry-point surfaces only.
- **Technical:** Slug derivation must handle collisions deterministically (silent resume if `issue:` matches; prompt on mismatch).
- **Technical:** Hard-fail on malformed issue body with a user-actionable error message.
- **Technical:** The sentinel mirror block in the issue body is read-only from the workflow's perspective; spec files remain the source of truth.
- **Policy:** Replacing legacy `.md` issue templates (`feature_request.md`, `bug_report.md`) must happen immediately — no deprecation period.
- **Policy:** An ADR is required before the Design stage; this change is architecturally load-bearing.
- **Scope:** `spec-discovery.yml` and `track:discovery` label integration are deferred to a follow-up.
- **Scope:** No webhook or daemon on label changes in v1.

## Open questions

> These become the research agenda in Stage 2.

- Q1: Are there prior art patterns in other GitHub-native workflow tools (e.g., Linear's GitHub sync, Zenhub, Release Please) that solve the issue-body state mirror without creating drift between the mirror and the source of truth? What failure modes have they encountered?
- Q2: What is the safest strategy for `scripts/sync-issue-mirror.sh` when the GitHub CLI (`gh`) is not authenticated or not installed — fail loud, skip silently, or degrade to a local-only log?
- Q3: How do other tools handle the slug-collision scenario at scale (many open issues, reuse of short slugs)? Is the proposed "silent resume on `issue:` match, prompt on mismatch" rule sufficient, or does it create confusion for teams with multiple concurrent features?
- Q4: Is the YAML issue form schema stable enough across GitHub's form rendering engine that structured field parsing is reliable without frequent breakage?

## Out of scope (preliminary)

- Changes to the 11 workflow stages or their specialist agents.
- `spec-discovery.yml` issue template and `track:discovery` label integration.
- Webhook- or daemon-based automation triggered by label changes.
- Hosted SaaS or server-side components.
- Enforcement of the issue-first model for emergency / hotfix flows — a direct slug-mode entry point remains available without a nudge.

## References

- GitHub issue #274 — canonical brief and grill output (R1–R20) for this feature.
- `docs/specorator.md` — full 11-stage workflow definition.
- `docs/adr/0026-freeze-v1-workflow-track-taxonomy.md` — frozen v1 track taxonomy; this feature must not add a new first-party track.
- `.claude/skills/orchestrate/SKILL.md` — entry point to be updated.
- `templates/workflow-state-template.md` — to receive optional `issue: <n>` frontmatter field.

---

## Quality gate

- [x] Problem statement is one paragraph and understandable to a non-expert.
- [x] Target users named.
- [x] Desired outcome stated.
- [x] Constraints listed.
- [x] Open questions captured.
- [x] Scope is bounded — no "boil the ocean" framing.
