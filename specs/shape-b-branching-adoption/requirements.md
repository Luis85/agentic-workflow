---
id: PRD-BRANCH-001
title: Adopt Shape B branching model in agentic-workflow template
stage: requirements
feature: shape-b-branching-adoption
status: accepted
owner: pm
inputs:
  - IDEA-BRANCH-001
  - RESEARCH-BRANCH-001
created: 2026-05-03
updated: 2026-05-03
---

# PRD — Adopt Shape B branching model in agentic-workflow template

## Summary

The agentic-workflow template currently operates under Shape A (single `main` integration and release branch, ADR-0020). The v0.5 release cycle exposed a concrete integration-window problem: release-prep commits land on `main` before a tag is cut, causing CI to be green against partially-released content and the GitHub Pages site to reflect in-progress work rather than a validated state. This PRD specifies the changes needed to transition the template's own operations to Shape B — `develop` as the integration branch, `main` as the release-only branch, `demo` as the GitHub Pages source — eliminating the integration window, giving downstream adopters a live reference implementation, and keeping all tooling layers (settings, bots, Pages workflow, ADR registry, documentation) internally consistent.

## Goals

- G1. Establish `develop` as the integration branch so that topic PRs never land directly on `main` outside of a promotion.
- G2. Restrict `main` to promoted, tagged commits only, eliminating the release-prep integration window.
- G3. Serve GitHub Pages from the `demo` branch so the public preview always reflects a validated state.
- G4. Prevent direct push to `demo` at the Claude Code agent layer, consistent with how `main` and `develop` are protected.
- G5. Keep all affected tooling layers (`docs/branching.md`, `.claude/settings.json`, operational bot PROMPT.md files, bot scheduler configurations, `pages.yml`) consistent with Shape B after the change.
- G6. Supersede ADR-0020 with a new ADR that records the Shape B decision, rationale, and compliance rules.
- G7. Drop the `release/vX.Y.Z` branch convention; the develop-to-main promotion PR becomes the release path.

## Non-goals

- NG1. Topic prefix rename (`feat/` to `feature/`) — explicitly deferred, high blast radius.
- NG2. Squash-merge as the default merge strategy — excluded per the merge-not-rebase rule.
- NG3. Tag-scheme change (`vX.Y.Z` to `X.Y.Z`) — deferred until issue #233 (v0.5 immutable-release recovery) closes.
- NG4. Stages 5–11 of the lifecycle (implementation, testing, review, release, retro) — gated on parent issue triage.
- NG5. Changes to downstream adopter repositories — this feature modifies only the template repo itself.
- NG6. GitHub branch-protection UI configuration details (rulesets vs. legacy rules, required-review counts) — feasibility determination belongs to the design stage.
- NG7. Creation of the `develop` branch on the remote — an implementation-stage action, not a design or requirements deliverable.

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| Template maintainer (Luis) | Merge topic PRs to an integration branch without polluting `main` with in-progress commits | Eliminates the release-prep window that caused v0.5.1 readiness check failures |
| Template contributor | Know which branch to target when opening a PR | Prevents PRs from landing on the wrong base branch by accident |
| Downstream adopter (evaluator) | See a live Shape B reference implementation in the template repo | Currently no live Shape B repo in the Specorator ecosystem to inspect |
| Operational bots (`review-bot`, `docs-review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`) | Execute against the correct integration branch with accurate PROMPT.md text | Incorrect branch targets or stale references produce false findings or missed coverage |
| GitHub Pages visitor | See a stable, validated public preview rather than in-progress work | The current Pages source (`main`) reflects integration-phase content |

## Jobs to be done

- When I open a topic PR, I want it to target `develop` by default, so I can merge work into the integration branch without touching `main`.
- When I cut a release, I want to promote `develop` to `main` and tag from `main` HEAD, so I can ensure `main` carries only validated, tagged commits.
- When I visit the public GitHub Pages site, I want it to reflect the latest promoted state, so I can evaluate the template from a stable reference rather than in-progress content.
- When I clone the template to evaluate Shape B, I want to see the template itself operating Shape B end-to-end, so I can understand the model by inspecting a live example rather than documentation alone.
- When an operational bot runs, I want its PROMPT.md and scheduler config to reference `develop` as the integration branch, so I do not receive false drift findings or missed coverage caused by a stale `main` reference.

## Functional requirements (EARS)

### REQ-BRANCH-001 — Topic PRs target `develop`

- **Pattern:** Ubiquitous
- **Statement:** The `docs/branching.md` documentation shall state that all topic-branch PRs target `develop` under Shape B, and shall not reference `main` as a valid PR target for topic branches.
- **Acceptance:**
  - Given `docs/branching.md` has been updated for Shape B
  - When a contributor reads the Shape B section
  - Then the document names `develop` as the PR target for topic branches
  - And the document does not name `main` as a PR target for topic branches
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 1), RESEARCH-BRANCH-001 (Alternative A)

---

### REQ-BRANCH-002 — `develop` push-deny remains in `.claude/settings.json`

- **Pattern:** Ubiquitous
- **Statement:** The `.claude/settings.json` deny list shall include entries that block Claude Code agents from pushing directly to `develop` (both `git push origin develop:*` and `git push -u origin develop:*`).
- **Acceptance:**
  - Given the updated `.claude/settings.json`
  - When Claude Code attempts `git push origin develop` or `git push -u origin develop`
  - Then the push is denied by the permission layer
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (constraint: push-deny stays on both main and develop), RESEARCH-BRANCH-001 (Q2 conclusion)

---

### REQ-BRANCH-003 — `demo` push-deny added to `.claude/settings.json`

- **Pattern:** Ubiquitous
- **Statement:** The `.claude/settings.json` deny list shall include entries that block Claude Code agents from pushing directly to `demo` (both `git push origin demo:*` and `git push -u origin demo:*`).
- **Acceptance:**
  - Given the updated `.claude/settings.json`
  - When Claude Code attempts `git push origin demo` or `git push -u origin demo`
  - Then the push is denied by the permission layer
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 2), RESEARCH-BRANCH-001 (Q2 conclusion, CLAR-001 resolved)

---

### REQ-BRANCH-004 — `pages.yml` triggers on `demo` not `main`

- **Pattern:** Ubiquitous
- **Statement:** The `.github/workflows/pages.yml` workflow shall declare `demo` as its trigger branch and shall not declare `main` as a trigger branch for the GitHub Pages deployment job.
- **Acceptance:**
  - Given the updated `pages.yml`
  - When a reviewer inspects the `on: push: branches:` block
  - Then `demo` appears in the list
  - And `main` does not appear in the list as a Pages deployment trigger
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 2), RESEARCH-BRANCH-001 (Q5 conclusion)

---

### REQ-BRANCH-005 — `release/vX.Y.Z` pattern dropped from `docs/branching.md`

- **Pattern:** Ubiquitous
- **Statement:** The `docs/branching.md` document shall not describe `release/vX.Y.Z` branches as a required step in the release workflow, and shall describe the develop-to-main promotion PR as the release path.
- **Acceptance:**
  - Given `docs/branching.md` has been updated for Shape B
  - When a contributor reads the release-path section
  - Then the document describes the develop-to-main promotion PR as the release path
  - And the document does not prescribe cutting a `release/vX.Y.Z` branch as a required release step under Shape B
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 3), RESEARCH-BRANCH-001 (Q3 recommendation)

---

### REQ-BRANCH-006 — `develop` seeded from `main` HEAD non-destructively

- **Pattern:** Ubiquitous
- **Statement:** The implementation plan shall specify seeding `develop` from `main` HEAD without history rewrite, squash, or rebase, so that the seed operation is reversible.
- **Acceptance:**
  - Given the implementation tasks artifact
  - When a reviewer inspects the `develop` creation step
  - Then the step is described as `git branch develop main` (or equivalent) creating a branch pointer at `main` HEAD
  - And no history-rewrite, squash, or rebase operation is specified as part of the seed
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (constraint: non-destructive), RESEARCH-BRANCH-001 (Q4 conclusion)

---

### REQ-BRANCH-007 — `docs/branching.md` designates Shape B as the active model

- **Pattern:** Ubiquitous
- **Statement:** The `docs/branching.md` document shall designate Shape B as the active branching model for this repository and shall update or remove any text that describes Shape A as the current default for template-own operations.
- **Acceptance:**
  - Given `docs/branching.md` has been updated
  - When a contributor reads the document
  - Then Shape B (`develop`, `main`, `demo`) is described as the current model for this template repo
  - And the document does not describe Shape A as the current default for template-own operations
  - And the Shape A description is retained as a documented option for adopters, clearly marked as not the active template model
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 6), RESEARCH-BRANCH-001 (Alternative A)

---

### REQ-BRANCH-008 — `docs-review-bot` PROMPT.md updated to reference `develop`

- **Pattern:** Ubiquitous
- **Statement:** The `agents/operational/docs-review-bot/PROMPT.md` file shall reference `develop` (or "the integration branch") in the tutorial-drift rule that currently reads "a clean clone of `main`", and shall not contain the literal string "clean clone of `main`".
- **Acceptance:**
  - Given the updated `docs-review-bot/PROMPT.md`
  - When a reviewer searches for the string "clean clone of `main`"
  - Then zero occurrences are found
  - And the tutorial-drift rule references `develop` or "the integration branch" in its place
- **Priority:** must
- **Satisfies:** RESEARCH-BRANCH-001 (Q1 bot audit — docs-review-bot, 1 line change required)

---

### REQ-BRANCH-009 — Operational bot scheduler configurations updated to pass `develop`

- **Pattern:** Ubiquitous
- **Statement:** The implementation tasks for `review-bot`, `plan-recon-bot`, `dep-triage-bot`, and `actions-bump-bot` shall each specify updating the bot's scheduler or runner configuration to pass `develop` as the integration-branch argument, so that those bots do not operate against `main` as the integration branch.
- **Acceptance:**
  - Given the implementation tasks artifact for each of the four named bots
  - When a reviewer inspects the tasks
  - Then each task names the specific scheduler or runner configuration file to update
  - And each task specifies `develop` as the value to set for the integration-branch argument
- **Priority:** must
- **Satisfies:** RESEARCH-BRANCH-001 (Q1 bot audit summary — scheduler changes for 4 of 5 bots)

---

### REQ-BRANCH-010 — New ADR supersedes ADR-0020

- **Pattern:** Ubiquitous
- **Statement:** The repository shall contain a new ADR that records the Shape B adoption decision, the rationale for dropping `release/vX.Y.Z`, and the compliance rules, and that ADR shall supersede ADR-0020.
- **Acceptance:**
  - Given the new ADR has been written and merged
  - When a reviewer reads the new ADR's frontmatter
  - Then it lists ADR-0020 in its `supersedes` field
  - And when a reviewer reads ADR-0020's frontmatter
  - Then its `status` field reads `Superseded` and its `superseded-by` field names the new ADR number
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 5, constraint: ADR bodies immutable), RESEARCH-BRANCH-001 (Q3 recommendation)

---

### REQ-BRANCH-011 — `release/*` push-allow removed from `.claude/settings.json`

- **Pattern:** Ubiquitous
- **Statement:** The `.claude/settings.json` allow list shall not include push-allow entries for the `release/*` branch prefix, because `release/vX.Y.Z` branches are no longer used under Shape B.
- **Acceptance:**
  - Given the updated `.claude/settings.json`
  - When a reviewer inspects the `allow` array
  - Then no entry of the form `"Bash(git push origin release/*)"` or `"Bash(git push -u origin release/*)"` is present
- **Priority:** should
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 3), RESEARCH-BRANCH-001 (technical consideration 4)

---

### REQ-BRANCH-012 — `docs/worktrees.md` names `develop` as the branch to cut from

- **Pattern:** Ubiquitous
- **Statement:** The `docs/worktrees.md` document shall name `develop` as the branch from which topic branches are cut, and shall not name `main` as the cut-from branch for new topic work.
- **Acceptance:**
  - Given `docs/worktrees.md` has been updated
  - When a contributor reads the worktree setup instructions
  - Then `develop` is named as the base branch for cutting new topic branches
  - And `main` is not named as the base branch for new topic work
- **Priority:** should
- **Satisfies:** RESEARCH-BRANCH-001 (technical consideration 5), IDEA-BRANCH-001 (desired outcome 6)

---

### REQ-BRANCH-013 — `release/v0.5.0` branch removed from the remote if it exists

- **Pattern:** IF `release/v0.5.0` exists on the remote repository, THEN the implementation plan shall include a step to delete it.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the branch `release/v0.5.0` is found on the remote repository at implementation time, THEN the implementation tasks shall include a step to delete that branch from the remote.
- **Acceptance:**
  - Given the implementation tasks artifact
  - When a reviewer inspects the pre-condition check step
  - Then it specifies verifying `release/v0.5.0` existence with `git ls-remote --heads origin release/v0.5.0`
  - And if found, a deletion step is listed before `develop` and `demo` are created
- **Priority:** should
- **Satisfies:** RESEARCH-BRANCH-001 (Q4 — release/v0.5.0 most likely absent; check required), RESEARCH-BRANCH-001 (RISK-008)

---

### REQ-BRANCH-014 — `demo` seeded from `main` HEAD at Shape B adoption time

- **Pattern:** Ubiquitous
- **Statement:** The implementation plan shall specify seeding `demo` from `main` HEAD at the time of Shape B adoption, so that the GitHub Pages site is not disrupted during the transition.
- **Acceptance:**
  - Given the implementation tasks artifact
  - When a reviewer inspects the `demo` branch creation step
  - Then it specifies creating `demo` from `main` HEAD (same commit, no content change)
  - And the step is sequenced after `develop` is created and before `pages.yml` is updated
- **Priority:** must
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 2), RESEARCH-BRANCH-001 (Q5 conclusion)

---

### REQ-BRANCH-015 — `AGENTS.md` and `CLAUDE.md` updated to name `develop` as the integration branch

- **Pattern:** Ubiquitous
- **Statement:** The `AGENTS.md` and `CLAUDE.md` root files shall name `develop` as the integration branch wherever they describe the PR workflow or branching model, and shall not name `main` as the target for topic-branch PRs.
- **Acceptance:**
  - Given both files have been updated
  - When a reviewer searches for "topic" or "PR target" references in both files
  - Then `develop` is named as the target
  - And `main` is not described as the PR target for new topic work
- **Priority:** should
- **Satisfies:** IDEA-BRANCH-001 (desired outcome 6), RESEARCH-BRANCH-001 (RISK-001)

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-BRANCH-001 | reversibility | The `develop` branch creation step shall be non-destructive to existing history | Zero commits rewritten; `develop` is a new pointer at existing `main` HEAD |
| NFR-BRANCH-002 | reversibility | The `demo` branch creation step shall be non-destructive to existing history | Zero commits rewritten; `demo` is a new pointer at existing `main` HEAD |
| NFR-BRANCH-003 | consistency | All affected files modified in this feature (`docs/branching.md`, `.claude/settings.json`, `AGENTS.md`, `CLAUDE.md`, `docs/worktrees.md`, `docs-review-bot/PROMPT.md`, `pages.yml`, ADR) shall be internally consistent with Shape B on merge | No file describes `main` as the integration branch or PR target for topic work after the change lands |
| NFR-BRANCH-004 | traceability | The new ADR shall carry a `supersedes: [ADR-0020]` field and ADR-0020 shall carry `status: Superseded` and `superseded-by: [ADR-NNNN]` in its frontmatter | Verified by reading both ADR frontmatter blocks post-merge |
| NFR-BRANCH-005 | safety | The `.claude/settings.json` deny list shall not become shorter (in terms of protected branch surface) as a result of this change | Post-change deny count for `main`, `develop`, and `demo` push patterns is equal to or greater than the pre-change count for `main` and `develop` |
| NFR-BRANCH-006 | continuity | GitHub Pages availability shall not be interrupted during the transition from `main`-triggered to `demo`-triggered deployments | The `demo` branch exists and the GitHub Pages environment is updated to allow `demo` before `pages.yml` triggers on `demo` |

## Success metrics

- **North star:** Zero PRs targeting `main` as a topic-branch base in the 30 days following Shape B adoption.
- **Supporting — bot accuracy:** Zero false drift findings from `docs-review-bot` attributable to the stale "clean clone of `main`" reference in the 30 days following the PROMPT.md fix.
- **Supporting — Pages stability:** GitHub Pages site remains continuously available (no 404 period) through the `main` → `demo` trigger swap.
- **Supporting — ADR coverage:** ADR-0020 `status` field reads `Superseded` within the same PR that merges the new ADR; no gap period where the old ADR appears active.
- **Counter-metric:** Number of `develop → main` promotions that are skipped (i.e., direct commits land on `main` bypassing the promotion path). Target: zero. A non-zero count indicates the Shape B discipline is not holding.

## Release criteria

What must be true to ship Stages 3–4 artifacts (requirements + design + ADR + GitHub issue):

- [ ] All `must` requirements (`REQ-BRANCH-001` through `REQ-BRANCH-010`, `REQ-BRANCH-014`) pass acceptance review.
- [ ] All `should` requirements (`REQ-BRANCH-011`, `REQ-BRANCH-012`, `REQ-BRANCH-013`, `REQ-BRANCH-015`) are either accepted or explicitly deferred with a rationale recorded in the ADR or design document.
- [ ] All NFRs are met or explicitly waived with rationale recorded.
- [ ] New ADR written, reviewed, and assigned the next available ADR number.
- [ ] ADR-0020 frontmatter update (`status: Superseded`, `superseded-by`) is included in the same PR as the new ADR.
- [ ] `docs/branching.md` update is included in the same PR as or a coordinated PR with the ADR, so no window exists where the ADR is accepted but the docs still describe Shape A as active.
- [ ] GitHub issue created that captures the implementation tasks for Stages 5–11 (gated on issue triage and #233).
- [ ] No open clarifications remain unresolved at the requirements level (see below).

## Open questions / clarifications

- CLAR-001 — RESOLVED 2026-05-03. `demo` branch: push-deny in `.claude/settings.json` + GitHub branch-protection rule; promote-only from `main`; no direct push for hotfixes. Promotion automation is TBD for architect.
- CLAR-002 — RESOLVED 2026-05-03. `release/v0.5.0` historical branch: verify with `git ls-remote` at implementation time; delete if found. ADR-0020 supersession: single new ADR; update ADR-0020 frontmatter only (status + superseded-by); no errata required pre-supersession (immutable-body rule).
- CLAR-003 — TBD (owner: architect). Whether `demo` promotion (after `main` tag cut) is a manual release-checklist step or an automated GitHub Actions trigger on `main` tag creation. Does not block requirements; gates design.
- CLAR-004 — TBD (owner: architect). Confirm whether a legacy branch-protection rule or a GitHub ruleset is used for `demo` and `develop` given this repo's GitHub plan tier. Does not block requirements; gates design.

## Out of scope

What we explicitly will not do this cycle:

- Topic prefix rename `feat/` → `feature/` — cosmetic, high blast radius, deferred.
- Squash-merge as default merge strategy — excluded per `feedback_parallel_pr_conflicts.md` merge-not-rebase rule.
- Tag-scheme change `vX.Y.Z` → `X.Y.Z` — deferred until #233 closes.
- Implementation, testing, review, release, and retro (Stages 5–11) — gated on parent issue triage.
- Changes to downstream adopter repositories.
- GitHub branch-protection UI settings (rulesets, required-review counts, bypass lists) — architect deliverable, not PM.

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has a stable ID.
- [x] Acceptance criteria testable (concrete, no "handles errors" or "appropriate").
- [x] NFRs listed with targets.
- [x] Success metrics defined (including a counter-metric).
- [x] Release criteria stated.
- [x] Open clarifications resolved at the requirements level (CLAR-001, CLAR-002 resolved; CLAR-003, CLAR-004 deferred to design — no blocker).
