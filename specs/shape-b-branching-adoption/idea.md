---
id: IDEA-BRANCH-001
title: Adopt Shape B branching model in agentic-workflow template
stage: idea
feature: shape-b-branching-adoption
status: accepted
owner: analyst
created: 2026-05-03
updated: 2026-05-03
---

# Idea — Adopt Shape B branching model in agentic-workflow template

## Problem statement

The agentic-workflow template repo currently runs Shape A (single `main` integration + release branch) under ADR-0020. The v0.5 release cycle exposed a concrete friction: release-prep commits land on `main` before a tag is cut, creating a window where CI is green against partially-released content and operational bots key off commits that do not yet represent a stable release. The GitHub Pages preview deploys from `main`, meaning it reflects in-progress work rather than a validated demo state. Template adopters who ship versioned software need a clear separation between "code being integrated" and "code that has been released," but the template they clone defaults to the simpler Shape A without a migration path that is modelled end-to-end. Transitioning the template itself to Shape B — `develop` as the integration branch, `main` as release-only, and `demo` as the Pages preview branch — resolves this for the template's own operations and provides adopters with a live reference implementation.

## Target users

- Primary: maintainers and contributors to the agentic-workflow template repo who currently merge topic branches to `main` and cut releases from it.
- Secondary: downstream adopters of the template who evaluate whether to use Shape A or Shape B by inspecting how the template itself is operated.
- Secondary: operational bots (`review-bot`, `plan-recon-bot`, `dep-triage-bot`, `docs-review-bot`, `actions-bump-bot`) whose branch regexes and integration-branch assumptions must remain correct after the flip.

## Desired outcome

After this work is merged and adopted:

1. All topic-branch PRs target `develop` by default; `main` receives only promotion PRs cut from `develop`.
2. GitHub Pages deploys from the `demo` branch, not `main`, so the public preview reflects a validated state rather than in-progress integration work.
3. `release/vX.Y.Z` branches are no longer used; the develop-to-main PR is the promotion path, and tags are cut from `main` HEAD after that merge.
4. `docs/branching.md`, `.claude/settings.json`, operational bot configs, and `pages.yml` are internally consistent with Shape B.
5. ADR-0020 is superseded by a new ADR that records the Shape B decision with its rationale, consequences, and compliance rules.
6. A contributor arriving at the repo can follow the documented branching model without encountering contradictions between the docs and the live branch structure.

## Constraints

- Time: lifecycle stops at Stage 4 (Design) + ADR + GitHub issue this round; Stages 5-11 are deferred pending parent issue triage and v0.5 immutable-release recovery (#233).
- Budget: single-maintainer repo; no tooling cost budget.
- Technical: `develop` push-deny is already in `.claude/settings.json`; enabling it as an active integration branch requires adding the `develop` merge allow and confirming the push-deny stays on both `main` and `develop` direct-push surface. The `demo` branch does not yet exist; its protection rules are unspecified (CLAR-001).
- Technical: `.claude/settings.json` permission rules use prefix matching on literal command strings — any new branch names or promotion patterns must be reflected in the allowlist. The deny rules for `main` and `develop` direct push must remain intact.
- Technical: operational bots in `agents/operational/` carry branch-regex assumptions keyed to the current Shape A integration branch; each bot must be audited before implementation.
- Technical: the `pages.yml` workflow currently triggers on push to `main`; flipping it to `demo` requires the `demo` branch to exist and have a defined promotion source before the workflow change lands.
- Policy: the merge-not-rebase rule (`feedback_parallel_pr_conflicts.md`) is kept; squash-merge default is not adopted.
- Policy: topic prefix rename (`feat/` to `feature/`) and tag-scheme change (`vX.Y.Z` to `X.Y.Z`) are out of scope this round.
- Policy: ADR bodies are immutable; ADR-0020 must be superseded by a new ADR, not amended.
- Policy: the `develop` branch does not yet exist on the remote; creating it is an implementation step, not a design step.

## Open questions

> These become the research agenda in stage 2.

- Q1 — What exact changes are needed in each operational bot's `PROMPT.md` to support `develop` as the integration branch? Which bots hard-code `main` in branch-name checks, PR-target assertions, or idempotency guards?
- Q2 — What are the concrete protection-rule options for the `demo` branch? Should it be push-deny (promote-only from `main` or `develop`) or allow direct push for hotfix previews? What does the reference Specorator repo do? (CLAR-001)
- Q3 — What is the recommended strategy for ADR-0020 supersession: a new ADR that supersedes and leaves ADR-0020's `superseded-by` field pointing at the new number, or a combined ADR that also captures the `release/vX.Y.Z` drop? Does the immutable-body rule require any errata on ADR-0020 before supersession?
- Q4 — What historical state needs to be addressed before `develop` is created? Specifically, does the existing `release/v0.5.0` branch (if present on the remote) need to be deleted or retained as evidence, and does any history-split step need to happen to seed `develop` from the current `main` HEAD?
- Q5 — What is the Pages deployment source for the initial `demo` cut — `main` HEAD or a separately assembled `demo` state — and does the `demo` branch need its own branch-protection rule in GitHub settings (outside `.claude/settings.json`) to prevent accidental direct push?

## Out of scope (preliminary)

- Topic prefix rename `feat/` to `feature/` — cosmetic, high blast radius, explicitly deferred.
- Squash-merge as the default merge strategy — excluded per the merge-not-rebase rule.
- Tag-scheme change `vX.Y.Z` to `X.Y.Z` — deferred until #233 v0.5 immutable-release recovery closes.
- Stages 5-11 of the lifecycle (implementation, testing, review, release, retro) — gated on parent issue triage.
- Changes to downstream adopter repos — this feature only modifies the template repo itself.
- GitHub branch-protection UI settings (rulesets, required reviews count) — noted as a feasibility consideration for the architect; not a design or requirements deliverable from this track.

## References

- `docs/branching.md` — current branching doc; defines Shape A and Shape B side by side; records ADR-0020 as the lock.
- `docs/adr/0020-v05-release-branch-strategy.md` — ADR being superseded; Shape A + `release/vX.Y.Z` decision and rationale.
- `.claude/settings.json` — push-deny and allowlist rules; `develop` direct-push already denied.
- `.github/workflows/pages.yml` — Pages source currently triggered on push to `main`; needs flip to `demo`.
- `.claude/memory/feedback_parallel_pr_conflicts.md` — merge-not-rebase rule being kept.
- `agents/operational/` — operational bots whose branch regexes need auditing.
- Specorator contributing model: `develop`/`demo`/`main` with squash-merge (squash NOT adopted here).

---

## Quality gate

- [x] Problem statement is one paragraph and understandable to a non-expert.
- [x] Target users named.
- [x] Desired outcome stated.
- [x] Constraints listed.
- [x] Open questions captured.
- [x] Scope is bounded — no "boil the ocean" framing.
