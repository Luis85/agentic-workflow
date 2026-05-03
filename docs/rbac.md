---
title: RBAC reference
folder: docs
description: Rights the Specorator workflow needs across local, GitHub, and Claude Code surfaces — adopter provisioning guide and internal subagent matrix.
---

# RBAC reference

Specorator is an agentic workflow. To run autonomously and seamlessly it touches several systems: the local git tree, GitHub (repo, Actions, Pages, Packages, Issues, PRs), an npm registry (GitHub Packages), and the Claude Code harness (`.claude/settings.json`, subagents, hooks). This document collects the **rights the workflow needs** so an adopter can provision them once, and a maintainer can audit subagent scopes against intent.

The doc is **declarative**, not enforcing. Enforcement lives in:

- [`.claude/settings.json`](../.claude/settings.json) — Bash command allow / deny rules for the harness.
- [`.claude/agents/<name>.md`](../.claude/agents/) — `tools:` frontmatter per subagent.
- [`.github/workflows/*.yml`](../.github/workflows/) — `permissions:` blocks per workflow.
- GitHub repo settings — branch protection, environments, repository variables, secrets.

If those disagree with this doc, the enforcement files are the truth and this doc is stale — see [Part 4 — Maintenance](#part-4--maintenance).

## How to use this doc

| Reader | Read |
|---|---|
| **Adopter** provisioning a fresh repo | [Part 1 — External rights](#part-1--external-rights). |
| **Operator / SRE** wiring scheduled bots | [§ Operational bots](#operational-bots), [§ GitHub Actions](#github-actions), [§ Repository secrets and variables](#repository-secrets-and-variables). |
| **Maintainer** auditing subagent scope | [Part 2 — Internal RBAC matrix](#part-2--internal-rbac-matrix). |
| **Reviewer** triaging a permission diff | [Part 3 — Threat model](#part-3--threat-model), [Part 4 — Maintenance](#part-4--maintenance). |

## Principles

1. **Least privilege.** Every actor (subagent, workflow, bot, CLI) gets the smallest set of rights that lets it succeed. Broadening a scope is an explicit, reviewable decision.
2. **Deny over allow on irreversible actions.** Pushes to `main` / `develop`, `--force`, `--no-verify`, hook bypass — denied at the harness layer ([`.claude/settings.json`](../.claude/settings.json)). Branch protection is the second layer.
3. **One source of truth per surface.** Subagent capability lives in the agent's `tools:` frontmatter; workflow capability lives in `permissions:`. This document cross-references; it does not duplicate.
4. **Adopters override on consent.** A team may broaden a deny rule, but only with a recorded ADR ([`docs/adr/`](adr/)) so the change is reviewable. The ADR is the receipt; the file change is the implementation.

---

## Part 1 — External rights

What an adopter needs to grant to make Specorator run autonomously. Each subsection lists the **minimum scope**, **where it is consumed**, and **what fails if unset**.

### Local git

The workflow runs in a normal git working tree, with these expectations:

| Capability | Where consumed | What fails if missing |
|---|---|---|
| Read working tree | Every read-capable subagent | Almost everything. |
| Commit (HEAD on a topic branch) | `dev`, `qa`, `release-manager`, conductor skills, ops bots | Stage commits cannot land. |
| Create / list / remove worktrees under `.worktrees/` | `using-git-worktrees` skill, `review-fix` skill, `project-review` skill | Parallel work / proposal worktrees blocked. |
| Push to `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `claude/*`, `portfolio/*`, `release/*` | All topic-branch flows | PRs cannot be opened from local. |
| **Denied** push to `main` / `develop` | Backstop in [`.claude/settings.json`](../.claude/settings.json); branch protection in GitHub | Direct integration-branch commits — see [`docs/branching.md`](branching.md). |
| **Denied** `--force`, `--force-with-lease`, `--no-verify`, hook bypass via `core.hooksPath=` / `commit.verbose=` / `HUSKY=` env | [`.claude/settings.json`](../.claude/settings.json) | History rewrites, gate evasion. |
| **Denied** `git reset --hard origin/main|develop`, `git checkout main|develop`, `git branch -d|-D main|develop` | [`.claude/settings.json`](../.claude/settings.json) | Integration-branch corruption. |

The hook contract assumed by the workflow is documented in [`docs/verify-gate.md`](verify-gate.md). The workflow never installs or modifies global git config (`git config --global`); local config edits are out of scope.

### GitHub repository

Adopters host the work on GitHub. The minimum repository permissions for the autonomous flow:

| Permission | Why | Consumer |
|---|---|---|
| `contents: write` | Push topic branches, tag releases, generate Pages artifact | `dev`, `release-manager`, `pages.yml`, `release.yml`, `issue-breakdown-bot` decompose job |
| `pull-requests: write` | Open / edit / comment on PRs from CLI and bots | `gh pr create` (any agent with `Bash`), `issue-breakdown-bot`, `project-reviewer` |
| `issues: write` | Open / edit / comment / label issues | `issue-breakdown-bot`, `project-reviewer`, `review-bot`, `docs-review-bot` |
| `packages: write` | Publish the released npm package to GitHub Packages (`@luis85/agentic-workflow`) | `release.yml` (publish step). See [§ GitHub Packages](#github-packages-npm-registry). |
| `pages: write`, `id-token: write` | Build + deploy the public product page via GitHub Pages OIDC | `pages.yml` deploy job. See [§ GitHub Pages](#github-pages). |
| `security-events: write` | Upload zizmor SARIF results to code scanning | `zizmor.yml` |
| `metadata: read` | Inherent for any token | All workflows |

Stage 9 review and Stage 11 retrospective do **not** need write to remote — they read the diff and write spec artifacts in-repo. Their PRs go through the same `feat/*` / `chore/*` push allowlist as code changes.

### Branch protection

| Branch | Rule | Reason |
|---|---|---|
| `main`, `develop` | No direct push (server-side denial) | Backstop for [`.claude/settings.json`](../.claude/settings.json); enforces topic-branch + PR flow per [`docs/branching.md`](branching.md). |
| `main`, `develop` | Required status check: `verify`, `gitleaks`, `typos`, `pr-title` | Unconditional checks — run on every PR, safe to mark required. See [`docs/verify-gate.md`](verify-gate.md), [`docs/security-ci.md`](security-ci.md), [`docs/ci-automation.md`](ci-automation.md). |
| `main`, `develop` | Optional / conditional checks: `actionlint`, `zizmor`, `dependency-review` | Path-filtered (only run on PRs touching `.github/workflows/**`, `.github/actions/**`, or `package*.json` / `npm-shrinkwrap.json`). **Do not mark required** — a doc-only PR will wait forever on a check that was never scheduled. Rely on the workflow's own pass/fail surface when it does run. |
| `main` | Required PR review (≥ 1 human or trusted reviewer) | Human gate on releases / template changes. |
| `main`, `develop` | Disallow force-pushes, disallow deletions | Matches [`.claude/settings.json`](../.claude/settings.json) deny rules. |

Branch protection is enforced on the GitHub side and is **independent** of the harness deny rules. Both layers are required for autonomous operation; one without the other lets the bot bypass via the other path.

### GitHub Actions

Workflows declare least-privilege `permissions:` blocks. Current state (cross-reference for adopters tightening their own copies):

| Workflow | Trigger | Top-level permissions | Notes |
|---|---|---|---|
| [`verify.yml`](../.github/workflows/verify.yml) | PR + push | `contents: read` | Composite gate. |
| [`actionlint.yml`](../.github/workflows/actionlint.yml) | PR + push | `contents: read` | Workflow YAML lint. |
| [`zizmor.yml`](../.github/workflows/zizmor.yml) | PR + push | top-level `{}`; job `contents: read` + `security-events: write` | Uploads SARIF to code scanning. |
| [`gitleaks.yml`](../.github/workflows/gitleaks.yml) | PR + push | `contents: read` | Secret scan. |
| [`dependency-review.yml`](../.github/workflows/dependency-review.yml) | PR | `contents: read` | Dependency diff. |
| [`typos.yml`](../.github/workflows/typos.yml) | PR + push | `contents: read` | Spell check. |
| [`pr-title.yml`](../.github/workflows/pr-title.yml) | PR | `pull-requests: read` | Conventional Commits title. |
| [`pages.yml`](../.github/workflows/pages.yml) | push to `main`, manual | top-level `{}`; deploy job `contents: read` + `pages: write` + `id-token: write` | OIDC for Pages deployment. |
| [`release.yml`](../.github/workflows/release.yml) | manual `workflow_dispatch` | `contents: write` + `packages: write` | GitHub Release + npm publish; pinned by `RELEASE_READINESS_WORKFLOW_PERMISSIONS` in `scripts/lib/release-readiness.ts` (T-V05-007). |
| [`issue-breakdown-bot.yml`](../.github/workflows/issue-breakdown-bot.yml) | issue label `breakdown-me` | top-level `contents: read`; placeholder job `issues: write`; decompose job `contents: write` + `issues: write` + `pull-requests: write` | Decompose job gated by `vars.ISSUE_BREAKDOWN_BOT_ENABLED == 'true'`. |

The release workflow's permission shape is **self-validated** at runtime by `npm run check:release-readiness` against the constant in `scripts/lib/release-readiness.ts`. Adopters changing the release flow must update both.

### GitHub Pages

| Setting | Required value | Why |
|---|---|---|
| Source | `GitHub Actions` (deploy via `pages.yml`) | Avoids `gh-pages` branch and the historical force-push risk. |
| Build | OIDC-authenticated upload + deploy | `id-token: write` on the deploy job; no PAT. |
| Custom domain | Optional | Set the `CNAME` file under `sites/` if used. |

The product page lives at [`sites/index.html`](../sites/index.html); see [`docs/sink.md`](sink.md) ownership row.

### GitHub Packages (npm registry)

The repo publishes the `@luis85/agentic-workflow` package to GitHub Packages.

| Capability | Scope | Where consumed | What fails if missing |
|---|---|---|---|
| Publish to `@luis85` scope on `npm.pkg.github.com` | `packages: write` (provided by `GITHUB_TOKEN` in `release.yml`) | `release.yml` step "Publish to GitHub Packages" | Release succeeds without npm artifact — adopters cannot `npm install @luis85/agentic-workflow`. |
| Read (`npm install`, `npm view`) | `packages: read` (public packages on a public repo: anonymous works) | Idempotency check in `release.yml`, downstream consumers | Idempotent rerun cannot detect already-published version → `EPUBLISHCONFLICT`. |
| `actions/setup-node` writes `~/.npmrc` with `registry-url: https://npm.pkg.github.com` and `scope: '@luis85'` | n/a | `release.yml` Setup Node step | `npm publish` cannot authenticate. |

GitHub Packages does not currently support OIDC trusted publishing for npm — the documented credential is `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. The `zizmor` `use-trusted-publishing` audit is suppressed at the step boundary in `release.yml`. Revisit when GitHub Packages adds OIDC.

Adopters under a different scope must update `package.json#publishConfig`, the `EXPECTED_PACKAGE_NAME` constant in `scripts/lib/release-readiness.ts`, and the registry configuration in `release.yml`. The naming contract is locked by [ADR-0024](adr/0024-lock-specorator-agentic-workflow-naming-contract.md).

### Repository secrets and variables

Default Specorator surfaces require **no custom secrets**. Tokens used are `secrets.GITHUB_TOKEN`, which GitHub mints per run. Adopters wiring optional bots add:

| Name | Type | Used by | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | secret | `issue-breakdown-bot.yml` decompose job, any locally wired Claude Code action | Only required when `ISSUE_BREAKDOWN_BOT_ENABLED=true`. |
| `ISSUE_BREAKDOWN_BOT_ENABLED` | repository variable | `issue-breakdown-bot.yml` job-level `if:` | Boolean gate; default off ships the placeholder job only. |
| `RELEASE_CI_STATUS`, `RELEASE_VALIDATION_STATUS`, `RELEASE_QUALITY_WAIVER` | repository variables | `release.yml` Layer 1 readiness | Adopter-controlled release-readiness signals; see [`docs/release-readiness-guide.md`](release-readiness-guide.md). |
| `GH_TOKEN` (per-bot env) | secret or repo-level | Operational bots when run outside Actions | See [§ Operational bots](#operational-bots) for the auth contract. |
| `ROUTINE_GH_LOGIN` | repo variable or per-bot env | Every operational bot | Trust boundary for "is this comment / PR mine"; fail-closed when unset. |
| `TRUSTED_DEP_BOT_LOGINS` | secret or repo variable | `dep-triage-bot` | Comma-separated allowlist; fail-closed when unset. |

The kit does not manage access control on `sales/` artifacts. Teams handling commercially sensitive deal data apply their own access controls — see [`docs/sink.md`](sink.md) Sales Cycle sub-tree note.

### Claude Code harness

The harness reads [`.claude/settings.json`](../.claude/settings.json) for Bash command permissions and `SessionStart` hooks. The shipped baseline:

- **Allow**: read-only git (`status`, `diff`, `log`, `show`, `branch`, `switch`, `fetch`, `pull --ff-only`); mutating git on the working tree (`add`, `restore`, `commit`, `merge origin/develop|main`); worktree management; `push -u origin <topic-branch>` for the documented prefix list.
- **Deny**: push to `main` / `develop`, `--force`, `--force-with-lease`, `--no-verify`, hook bypass, `reset --hard origin/main|develop`, `checkout main|develop`, `branch -d|-D main|develop`, broad `rm -rf` on protected paths (`.git`, `docs`, `.claude`, `memory`, `templates`, `specs`, `agents`, `src`, `~`, `$HOME`, `/`).

Adopters tighten or extend by adding entries to the same file. **Loosening any deny rule requires a recorded ADR** — these denies are the irreversibility boundary per [Article IX of the constitution](../memory/constitution.md#article-ix--reversibility).

The session-start hook runs `test -f .claude/memory/MEMORY.md && echo "..."` — read-only and benign. Hooks that mutate state must be opt-in per project.

### `gh` CLI auth

Adopters wiring the autonomous flow locally authenticate `gh` CLI with the same minimum scopes as the GitHub Actions token:

| Scope | Why |
|---|---|
| `repo` (or fine-grained: `Contents: write`, `Pull requests: write`, `Issues: write`) | `gh pr create`, `gh issue create / edit / comment`, `gh release create`, `gh release upload`. |
| `read:packages` (or `write:packages` for local publishing tests) | Optional; only needed if running `release.yml` steps locally for dry-run validation. |
| `workflow` | Optional; only needed if a flow updates `.github/workflows/*` from CLI. |

The `release.yml` workflow uses the runner-minted `GITHUB_TOKEN`, not a personal access token. Local releases run by an operator on a developer machine are out of band and require the operator's own `gh auth login` with the relevant scopes.

### Operational bots

Each bot in [`agents/operational/`](../agents/operational/) declares its needs in its `PROMPT.md`. Common contract — fail-closed on missing creds:

| Variable | Used by | Behaviour when unset |
|---|---|---|
| `GH_TOKEN` (or `GITHUB_TOKEN`) | Every bot that posts to GitHub | Exit non-zero with setup-error message; never silently skip writes. |
| `ROUTINE_GH_LOGIN` | Every bot | Exit non-zero — trust boundary for "is this PR / comment mine" must never default to "any author". |
| `TRUSTED_DEP_BOT_LOGINS` | `dep-triage-bot` only | Exit non-zero with "process zero PRs" — body-shape match alone is spoofable. |
| `DRY_RUN=1` | All bots | Zero side effects (contract for testing the prompt). |

The token's GitHub scopes per bot:

| Bot | Token scopes | What it writes |
|---|---|---|
| `review-bot` | `issues: write`, `contents: read` | Adversarial review issue (read-only on code). |
| `docs-review-bot` | `issues: write`, `contents: read` | Drift-finding issue. |
| `plan-recon-bot` | `contents: write` (push branch), `pull-requests: write` | PR moving completed plans to archive. |
| `dep-triage-bot` | `contents: write`, `pull-requests: write`, `issues: write` | Auto-merge safe bumps; comment on risky ones. |
| `actions-bump-bot` | `contents: write`, `pull-requests: write` | PR bumping pinned `uses:` SHAs. |
| `issue-breakdown-bot` | `contents: write`, `pull-requests: write`, `issues: write` | Draft slice PRs + housekeeping PR + issue body edit. |

Bots never push to `main` / `develop` — branch protection is the backstop.

---

## Part 2 — Internal RBAC matrix

For maintainers auditing whether subagent scope matches intent. Two levels: the class table at the top is for quick scan; the per-agent table below is the audit detail. Both are **derived from** [`.claude/agents/<name>.md`](../.claude/agents/) `tools:` frontmatter and [`docs/sink.md`](sink.md) ownership rows. **Those files are the ground truth**; this matrix declares intent and provides cross-reference.

### Class overview

Track / class taxonomy frozen by [ADR-0026](adr/0026-freeze-v1-workflow-track-taxonomy.md).

| Class | Reads (under repo root) | Writes | External calls | Agents |
|---|---|---|---|---|
| **Lifecycle** (Stage 1–11) | `specs/<slug>/`, `docs/`, `memory/`, `templates/` | `specs/<slug>/` per stage | `dev`, `qa`, `reviewer`, `sre`, `retrospective`, `release-manager` may run Bash; `release-manager` may invoke `gh`. `analyst` may use `WebSearch` / `WebFetch`. | `analyst`, `pm`, `ux-designer`, `ui-designer`, `architect`, `planner`, `dev`, `qa`, `reviewer`, `release-manager`, `sre`, `retrospective`, `orchestrator` |
| **Discovery** *(opt-in)* | `discovery/<sprint>/`, `docs/`, `inputs/`, `stock-taking/` | `discovery/<sprint>/` per phase | `WebSearch`, `WebFetch` for product-strategist, user-researcher | `facilitator`, `product-strategist`, `user-researcher`, `game-designer`, `divergent-thinker`, `critic`, `prototyper` |
| **Stock-taking** *(opt-in)* | `stock-taking/<slug>/`, existing-system docs in `inputs/` | `stock-taking/<slug>/` per phase | `WebSearch`, `WebFetch` | `legacy-auditor` |
| **Sales** *(opt-in)* | `sales/<deal>/`, `inputs/`, `templates/` | `sales/<deal>/` per phase | `WebSearch` for `sales-qualifier` | `sales-qualifier`, `scoping-facilitator`, `estimator`, `proposal-writer` |
| **Project Manager** *(opt-in)* | `projects/<slug>/`, `specs/*/workflow-state.md` (read-only), `inputs/` | `projects/<slug>/` only — never `specs/`, never `discovery/` | `WebSearch`, `WebFetch` | `project-manager` |
| **Roadmap** *(opt-in)* | `roadmaps/<slug>/`, `specs/`, `projects/`, `portfolio/`, `discovery/` (all read-only) | `roadmaps/<slug>/` only | `WebSearch`, `WebFetch` | `roadmap-manager` |
| **Portfolio** *(opt-in)* | `portfolio/<slug>/`, `specs/*/workflow-state.md` (read-only) | `portfolio/<slug>/` only — never `specs/` | none | `portfolio-manager` |
| **Project scaffolder** *(opt-in)* | `scaffolding/<slug>/`, `inputs/` | `scaffolding/<slug>/` | none | `project-scaffolder` |
| **Quality assurance** *(opt-in)* | `quality/<review>/`, broad repo for evidence | `quality/<review>/` | none | (skill-driven; no agent file) |
| **Project review** *(opt-in)* | `quality/<review>/`, git history, GH Issues / PRs / CI | `quality/<review>/`, GH Issue + draft PR via `gh` | `Bash` for git + `gh`, `Grep` | `project-reviewer` |
| **Issue-breakdown** *(opt-in)* | `specs/<slug>/`, GH issue body | `specs/<slug>/issue-breakdown-log.md`, slice PRs, parent issue body | `Bash` for `gh pr create`, `gh issue edit`, `Grep`, `Glob` | `issue-breakdown` |
| **Design** *(opt-in)* | `designs/<slug>/`, `.claude/skills/specorator-design/`, `sites/` | `designs/<slug>/`, `sites/` (via `product-page` skill) | `Agent` (delegates to `ux-designer`, `ui-designer`); `Bash` for `product-page-designer` | `design-lead`, `ux-designer`, `ui-designer`, `product-page-designer`, `brand-reviewer` |
| **Operational bots** | per-bot prompt | per-bot output sink | `gh` CLI via `GH_TOKEN` | (in `agents/operational/`, not `.claude/agents/`) |

### Per-agent matrix

Sourced from `.claude/agents/<name>.md` `tools:` frontmatter and `docs/sink.md` ownership rows. **If this table contradicts the agent file, the agent file wins.**

| Agent | Class | `tools:` | Writes (sink) | Read scope | Escalates rather than |
|---|---|---|---|---|---|
| [`analyst`](../.claude/agents/analyst.md) | Lifecycle | Read, Edit, Write, WebSearch, WebFetch | `specs/<slug>/idea.md`, `research.md` | `specs/`, `inputs/`, `discovery/`, `docs/` | Writing requirements |
| [`pm`](../.claude/agents/pm.md) | Lifecycle | Read, Edit, Write | `specs/<slug>/requirements.md` | upstream stage artifacts, `docs/ears-notation.md` | Designing solutions |
| [`ux-designer`](../.claude/agents/ux-designer.md) | Lifecycle / Design | Read, Edit, Write | `specs/<slug>/design.md` Part A; `designs/<slug>/sketch.md` | `specs/`, `designs/` | Picking visual treatments |
| [`ui-designer`](../.claude/agents/ui-designer.md) | Lifecycle / Design | Read, Edit, Write | `specs/<slug>/design.md` Part B; `designs/<slug>/handoff.md` | UX flows from `ux-designer` | Redesigning flows |
| [`architect`](../.claude/agents/architect.md) | Lifecycle | Read, Edit, Write | `specs/<slug>/design.md` Part C, `spec.md` | `docs/adr/`, upstream stages | Implementing |
| [`planner`](../.claude/agents/planner.md) | Lifecycle | Read, Edit, Write | `specs/<slug>/tasks.md` | `spec.md`, `requirements.md` | Implementing |
| [`dev`](../.claude/agents/dev.md) | Lifecycle | Read, Edit, Write, Bash, Grep | source code per task, `specs/<slug>/implementation-log.md` | `specs/`, repo source | Modifying tests / spec / pushing / destructive shell |
| [`qa`](../.claude/agents/qa.md) | Lifecycle | Read, Edit, Write, Bash, Grep | `specs/<slug>/test-plan.md`, `test-report.md`, test files | repo source, `specs/` | Modifying production source |
| [`reviewer`](../.claude/agents/reviewer.md) | Lifecycle | Read, Edit, Write, Grep, Bash | `specs/<slug>/review.md`, `traceability.md` | full diff, all spec artifacts | Editing code or other agents' artifacts |
| [`release-manager`](../.claude/agents/release-manager.md) | Lifecycle | Read, Edit, Write, Bash | `specs/<slug>/release-notes.md`, `release-readiness-guide.md` | release machinery | Performing deploys without explicit human authorisation |
| [`sre`](../.claude/agents/sre.md) | Lifecycle | Read, Edit, Write, Bash, Grep | `specs/<slug>/design.md` operability sections, runbooks | infra config | Modifying product code without an originating task |
| [`retrospective`](../.claude/agents/retrospective.md) | Lifecycle | Read, Edit, Write, Grep, Bash | `specs/<slug>/retrospective.md`; proposes amendments to templates / agents / constitution | full feature artifacts, git history | Implementing the proposed amendments |
| [`orchestrator`](../.claude/agents/orchestrator.md) | Lifecycle | Read, Grep | none (routing only) | `workflow-state.md`, all stage artifacts | Producing stage artifacts |
| [`facilitator`](../.claude/agents/facilitator.md) | Discovery | Read, Edit, Write | `discovery/<sprint>/<phase>.md`, `chosen-brief.md` | `discovery/`, `inputs/` | Doing specialist work |
| [`product-strategist`](../.claude/agents/product-strategist.md) | Discovery | Read, Edit, Write, WebSearch, WebFetch | sections of `frame.md`, `convergence.md` | strategic context | Validating with users |
| [`user-researcher`](../.claude/agents/user-researcher.md) | Discovery | Read, Edit, Write, WebSearch, WebFetch | sections of `frame.md`, `validation.md` | research artifacts | Designing solutions |
| [`game-designer`](../.claude/agents/game-designer.md) | Discovery | Read, Edit, Write | annotations on `divergence.md`, `prototype.md` | concepts | Generating new concepts |
| [`divergent-thinker`](../.claude/agents/divergent-thinker.md) | Discovery | Read, Edit, Write | `discovery/<sprint>/divergence.md` | frame, lightning demos | Filtering quality (critic's job) |
| [`critic`](../.claude/agents/critic.md) | Discovery | Read, Edit, Write | sections of `convergence.md`, `validation.md` | concepts, prototypes | Generating concepts |
| [`prototyper`](../.claude/agents/prototyper.md) | Discovery | Read, Edit, Write | `discovery/<sprint>/prototype.md`, `assets/` (LAZY) | shortlisted concepts | High-fidelity polish |
| [`legacy-auditor`](../.claude/agents/legacy-auditor.md) | Stock-taking | Read, Edit, Write, WebSearch, WebFetch | `stock-taking/<slug>/<phase>.md`, `stock-taking-inventory.md` | `inputs/`, existing-system docs | Writing requirements / design proposals |
| [`sales-qualifier`](../.claude/agents/sales-qualifier.md) | Sales | Read, Edit, Write, WebSearch | `sales/<deal>/qualification.md` | `inputs/`, lead context | Scoping or estimating |
| [`scoping-facilitator`](../.claude/agents/scoping-facilitator.md) | Sales | Read, Edit, Write | `sales/<deal>/scope.md` | qualification, `inputs/` | Estimating or pricing |
| [`estimator`](../.claude/agents/estimator.md) | Sales | Read, Edit, Write | `sales/<deal>/estimation.md` | scope, qualification | Writing the proposal |
| [`proposal-writer`](../.claude/agents/proposal-writer.md) | Sales | Read, Edit, Write | `sales/<deal>/proposal.md`, `revisions/`, `order.md` | qualification, scope, estimation | Revising scope or estimates |
| [`project-manager`](../.claude/agents/project-manager.md) | PM | Read, Edit, Write, WebSearch, WebFetch | `projects/<slug>/*.md` | `specs/*/workflow-state.md`, `inputs/` | Editing `specs/` or `discovery/` |
| [`roadmap-manager`](../.claude/agents/roadmap-manager.md) | Roadmap | Read, Edit, Write, Grep, WebSearch, WebFetch | `roadmaps/<slug>/*.md` | `specs/`, `projects/`, `portfolio/`, `discovery/` (read-only) | Editing those source trees |
| [`portfolio-manager`](../.claude/agents/portfolio-manager.md) | Portfolio | Read, Edit, Write, Grep | `portfolio/<slug>/*.md` | `specs/*/workflow-state.md` (read-only) | Modifying `specs/` |
| [`project-scaffolder`](../.claude/agents/project-scaffolder.md) | Scaffolder | Read, Edit, Write | `scaffolding/<slug>/*.md` | `inputs/`, source material | Promoting drafts to canonical artifacts |
| [`design-lead`](../.claude/agents/design-lead.md) | Design | Agent, Read, Edit, Write | orchestrates ux-designer / ui-designer; writes `designs/<slug>/design-state.md` | `designs/`, brand kit | Doing specialist UX/UI work itself |
| [`product-page-designer`](../.claude/agents/product-page-designer.md) | Design | Read, Edit, Write, Bash, Grep | `sites/index.html`, `sites/**/*`, `.github/workflows/pages.yml` | `sites/`, brand kit | Modifying `specs/` |
| [`brand-reviewer`](../.claude/agents/brand-reviewer.md) | Design | Read, Grep, Bash | PR review comments only (via `gh`) | diff, `sites/`, `.claude/skills/specorator-design/` | Editing files |
| [`issue-breakdown`](../.claude/agents/issue-breakdown.md) | Issue-breakdown | Read, Edit, Write, Bash, Grep, Glob | `specs/<slug>/issue-breakdown-log.md`, parent issue body, draft slice PRs | `specs/<slug>/`, GH issue | Modifying code, requirements, design artifacts |
| [`project-reviewer`](../.claude/agents/project-reviewer.md) | Project review | Read, Edit, Write, Bash, Grep | `quality/<review>/*.md`, GH issue + first draft PR | git history, GH Issues / PRs / CI / retrospectives | Editing code outside the proposal worktree |

A few cross-cutting rules worth re-stating:

- **Read scope is the union of paths the agent's stage description references.** Agents do not read across track boundaries (e.g. `portfolio-manager` reads `specs/*/workflow-state.md` only, never `specs/<slug>/spec.md`).
- **Write scope is the agent's owned artifacts in [`docs/sink.md`](sink.md).** A second-stage agent must not rewrite a first-stage artifact — that is the constitution's separation of concerns ([Article II](../memory/constitution.md#article-ii--separation-of-concerns)).
- **The `Agent` tool** (used by `design-lead`) is the only delegation path; `tools: [Agent]` in any new agent file is a deliberate decision and warrants reviewer attention.

### Skills as cross-cutting actors

Several skills under [`.claude/skills/`](../.claude/skills/) write to cross-workflow files outside any single subagent's scope. These run in the context of whichever agent invoked them, so the **invoking agent's tool set** plus the **skill's specific writes** form the effective scope:

| Skill | Effective writes |
|---|---|
| [`record-decision`](../.claude/skills/record-decision/SKILL.md) | `docs/adr/NNNN-<slug>.md` |
| [`new-glossary-entry`](../.claude/skills/new-glossary-entry/SKILL.md) | `docs/glossary/<slug>.md` |
| [`product-page`](../.claude/skills/product-page/SKILL.md) | `sites/index.html`, `sites/**/*`, optionally `.github/workflows/pages.yml` |
| [`domain-context`](../.claude/skills/domain-context/SKILL.md) | `docs/CONTEXT.md` (or `docs/contexts/<name>.md`) |
| [`quality-assurance`](../.claude/skills/quality-assurance/SKILL.md) | `quality/<review>/*.md` |
| [`project-review`](../.claude/skills/project-review/SKILL.md) | `quality/<review>/*.md`, GH issue + draft PR text |
| [`quality-metrics`](../.claude/skills/quality-metrics/SKILL.md) | `quality/metrics/<scope>/<timestamp>.json` (when `--save`) |
| [`roadmap-management`](../.claude/skills/roadmap-management/SKILL.md) | `roadmaps/<slug>/*.md` |
| [`specorator-improvement`](../.claude/skills/specorator-improvement/SKILL.md) | `scripts/`, `tests/scripts/`, `package.json`, `.github/workflows/`, `.claude/`, `templates/`, `docs/`, owning `specs/<slug>/` |

When any of these skills writes during an active feature, the active `specs/<slug>/workflow-state.md` gets a one-line dated entry under `## Hand-off notes` for paper trail (per [`docs/sink.md`](sink.md) cross-cutting writes).

---

## Part 3 — Threat model

Three failure modes the doc and the enforcement layers exist to prevent.

| Failure | What it looks like | Mitigation |
|---|---|---|
| **Scope too broad** | Subagent gets `Bash` it does not need; ops bot pushes to `main`; release token has `repo` admin | (1) Per-agent `tools:` frontmatter is the smallest viable set; reviewer flags broadening. (2) Branch protection + [`.claude/settings.json`](../.claude/settings.json) deny rules are the backstop on push. (3) Per-workflow `permissions:` blocks are least-privilege; `actionlint` + `zizmor` flag drift; `RELEASE_READINESS_WORKFLOW_PERMISSIONS` self-validates the release workflow. |
| **Scope too narrow** | Agent silently fails to escalate; bot exits non-zero on missing creds and no one sees | (1) Subagents escalate per [Constitution Article VI](../memory/constitution.md#article-vi--agent-specialisation) — never invent missing inputs. (2) Bots are fail-closed on missing `GH_TOKEN` / `ROUTINE_GH_LOGIN` / `TRUSTED_DEP_BOT_LOGINS` (see [§ Operational bots](#operational-bots)). (3) Workflow run logs surface the failure. |
| **Drift between doc and enforcement** | This file says X; agent file / workflow YAML says Y | Maintenance contract below. Reviewer checks doc updates ride trigger-file PRs. Future automated check listed in [§ Future work](#future-work). |

---

## Part 4 — Maintenance

This doc is **not** automatically generated. It is updated alongside changes to its trigger files. PR reviewers enforce the contract.

### Triggers

A PR that touches any of the following **must** include a `docs/rbac.md` update in the same PR:

- [`.claude/settings.json`](../.claude/settings.json) — any change to `permissions.allow` or `permissions.deny`.
- [`.claude/agents/<name>.md`](../.claude/agents/) — any change to the `tools:` frontmatter; addition or removal of an agent file.
- [`.github/workflows/*.yml`](../.github/workflows/) — any change to a top-level or job-level `permissions:` block; new workflow added; trigger event change.
- [`package.json`](../package.json) — `publishConfig`, `name`, `files`, or any change to the `release-readiness` invocation.
- [`agents/operational/<bot>/`](../agents/operational/) — new bot added; auth contract change; trigger surface change.
- Branch protection settings on `main` / `develop` — capture the new rule set in [§ Branch protection](#branch-protection).
- New repository secret or variable required by the workflow.

### Loosening a deny rule

Loosening any `permissions.deny` entry in [`.claude/settings.json`](../.claude/settings.json), or removing a branch-protection rule on `main` / `develop`, is an irreversible decision. It requires:

1. A recorded ADR under [`docs/adr/`](adr/) explaining why and what.
2. The `docs/rbac.md` row updated in the same PR.
3. Reviewer sign-off.

This matches the constitution amendment process ([§ Amendment](../memory/constitution.md#amendment-process)).

### Future work

A `scripts/check-rbac.ts` that diffs declared agents and workflow permissions against the tables in this file, run by `npm run verify`, is **deferred** as of v1. The current contract relies on reviewer + retrospective. If drift becomes a recurring finding, file a Specorator improvement issue (`/specorator:update`) to add the check.

---

## Cross-references

- [`docs/branching.md`](branching.md) — branching model the deny rules assume.
- [`docs/verify-gate.md`](verify-gate.md) — local + CI gate before push.
- [`docs/security-ci.md`](security-ci.md) — workflow security scans (actionlint, zizmor, gitleaks).
- [`docs/ci-automation.md`](ci-automation.md) — Dependabot, PR title check, spell check.
- [`docs/release-readiness-guide.md`](release-readiness-guide.md) — release authorisation surface.
- [`docs/sink.md`](sink.md) — per-artifact ownership and write contracts.
- [`memory/constitution.md`](../memory/constitution.md) — Articles VI (Agent Specialisation) and IX (Reversibility) are the primary sources for the rules above.
