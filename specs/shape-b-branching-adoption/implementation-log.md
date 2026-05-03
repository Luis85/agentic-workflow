---
feature: shape-b-branching-adoption
stage: 7
status: in-progress
owner: dev
inputs:
  - SPEC-BRANCH-001
  - TASKS-BRANCH-001
  - ADR-0027
created: 2026-05-04
updated: 2026-05-04
---

# Implementation Log — shape-b-branching-adoption

This log records the file-change tasks executed by the dev agent for Stage 7
(Implementation). Remote / GitHub-API operations (branch seeding, default-branch
flip, ruleset PATCH, Pages env allow-list, `release/v0.5.0` cleanup) are owned
by the human / orchestrator and are tracked separately.

Worktree: `D:\Projects\agentic-workflow\.worktrees\shape-b-stage5`
Branch: `feat/shape-b-branching-stage5`

---

## Baseline (T-BRANCH-003) — 2026-05-04

Captured before any edit so the post-edit invariants (NFR-BRANCH-005) can be
verified.

### `.claude/settings.json` deny-list — pre-edit

Count of entries in `permissions.deny` whose string contains `main` or
`develop`, captured via:

```bash
node -e "const s = require('./.claude/settings.json'); const branches = ['main', 'develop']; const matched = s.permissions.deny.filter(d => branches.some(b => d.includes(b))); console.log(matched.length);"
```

Result: **14** entries.

Breakdown:

| Pattern type | `main` | `develop` |
|---|---|---|
| `git push origin <b>:*` | 1 | 1 |
| `git push -u origin <b>:*` | 1 | 1 |
| `git reset --hard origin/<b>:*` | 1 | 1 |
| `git reset --hard <b>:*` | 1 | 1 |
| `git checkout <b>:*` | 1 | 1 |
| `git branch -D <b>:*` | 1 | 1 |
| `git branch -d <b>:*` | 1 | 1 |
| **Subtotal** | **7** | **7** |

> **Note on spec baseline.** Spec IF-01 records the pre-change count as 12 and
> derives the post-change `>= 19` invariant from that. The actual count is 14
> (two extra `branch -d` entries — the spec's arithmetic missed one branch-delete
> pattern per branch). Post-edit target therefore tightens to **>= 21** (14
> retained + 7 added for `demo`). NFR-BRANCH-005 ("deny-list surface not shorter
> post-change") still holds; the stricter post-change floor is recorded here so
> downstream verification does not re-introduce the original spec arithmetic.

### `.claude/settings.json` allow-list — pre-edit `release/*` entries

Result: **2** entries — `Bash(git push -u origin release/*)` and
`Bash(git push origin release/*)` on lines 36–37.

### `.github/workflows/pages.yml` `on.push.branches` — pre-edit

Single entry: `- main` (line 6). `workflow_dispatch` also present.

### `.github/dependabot.yml` `target-branch` — pre-edit

Neither the `github-actions` nor the `npm` `updates:` block declares
`target-branch`. Both implicitly target the repository default branch.

### `agents/operational/docs-review-bot/PROMPT.md` — pre-edit

Line 46 contains the literal string ``clean clone of `main` `` inside the
"Tutorial drift `[BLOCKER]`" rule.

### `docs/branching.md` — pre-edit

Lines 9–24 list Shape A and Shape B side-by-side without naming either as the
active model. §"Required main ruleset" (lines 51–70) targets `main` only.
§"Release branches (`release/vX.Y.Z`)" (lines 96–135) prescribes Shape A's
release path. §"Why not `develop` in v0.5" (lines 133–135) records the v0.5
deferral.

### `docs/worktrees.md` — pre-edit

The lifecycle example (lines 21–24) reads
`git worktree add .worktrees/<slug> -b <prefix>/<slug> origin/<integration-branch>`
and references `origin/main` in pitfalls (line 59). No literal hard-coded
`main` cut-from instruction.

### `AGENTS.md` and `CLAUDE.md` — pre-edit

Neither file currently states "Topic PRs target `develop`". Both already say
"Pushes to `main` / `develop` are denied" (CLAUDE.md) and "No direct commits on
`main` / `develop`" (AGENTS.md), which remain correct under Shape B.

### `docs/adr/0027-adopt-shape-b-branching-model.md` — pre-edit

Frontmatter line 4: `status: proposed`. Body §Status: `Proposed`.

### `docs/adr/0020-v05-release-branch-strategy.md` — pre-edit

Frontmatter already shows `status: Superseded` and `superseded-by: [ADR-0027]`
(updated by the architect during Stage 4). Body §Status retains `Accepted` per
the immutable-body rule (line 24); this MUST NOT change.

### `docs/adr/README.md` — pre-edit

ADR-0027 row already present (line 42) but with status `Proposed`. ADR-0020 row
(line 35) already shows status `Superseded`.

---

## Step 3 (T-BRANCH-004) — `.claude/settings.json` edits — 2026-05-04

**Files changed:** `.claude/settings.json` (lines 4–80, three edits)

**Edits applied:**

1. Removed two `release/*` allow entries (`Bash(git push -u origin release/*)`, `Bash(git push origin release/*)`) — REQ-BRANCH-011.
2. Added three `demo` push-deny entries (`git push origin demo:*`, `git push -u origin demo:*`) interleaved with the existing `main`/`develop` push-deny block — REQ-BRANCH-003.
3. Added four `demo` reset/checkout/branch-delete deny entries (`git reset --hard origin/demo:*`, `git reset --hard demo:*`, `git checkout demo:*`, `git branch -D demo:*`, `git branch -d demo:*`) interleaved with the corresponding `main`/`develop` blocks — REQ-BRANCH-003. (Five entries total in that group; the spec DS-01 listed seven `demo` entries, all added.)

**Verification (post-edit):**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json'))"
# JSON valid

node -e "const s=require('./.claude/settings.json'); ['main','develop','demo'].forEach(b => { const has=s.permissions.deny.some(d => d.includes('git push origin '+b+':') || d.includes('git push -u origin '+b+':')); if(!has){process.exit(1)} }); console.log('OK')"
# OK — all three branches push-denied

node -e "const s=require('./.claude/settings.json'); const has=s.permissions.allow.some(a => a.includes('release/*')); if(has){process.exit(1)} console.log('OK')"
# OK — release/* not in allow list
```

**Deny-list count check (NFR-BRANCH-005):**

```bash
node -e "const s=require('./.claude/settings.json'); const branches=['main','develop','demo']; const count=s.permissions.deny.filter(d => branches.some(b => d.includes(b))).length; console.log(count);"
# 21
```

Pre-edit: 14 entries naming `main` or `develop`. Post-edit: 21 entries naming `main`, `develop`, or `demo`. Delta: +7 (`demo` entries added). Allow-list `release/*` entries: 2 → 0. NFR-BRANCH-005 satisfied (`21 >= 14`).

**Outcome:** done.

---

## Step 7 (T-BRANCH-014, T-BRANCH-015) — `.github/workflows/pages.yml` retarget — 2026-05-04

**Files changed:** `.github/workflows/pages.yml` (line 6)

**Edit applied:** replaced `- main` with `- demo` in `on.push.branches`. `workflow_dispatch` retained for manual reruns.

> **Sequencing caveat.** Per spec Step 7 preconditions and EC-006, the
> `github-pages` environment "Deployment branches" allow-list must include
> `demo` BEFORE this change is merged to the active `pages.yml` deployed branch.
> The orchestrator/human must complete IF-10 (T-BRANCH-006) before this file
> change reaches a state that triggers a deploy. The `demo` branch itself does
> not yet exist on the remote — that is T-BRANCH-008 (human-owned). Until both
> the branch is seeded and the env allow-list is updated, this workflow's `push`
> trigger is staged-but-inert.

**Verification (post-edit):**

```bash
node -e "const y=require('yaml').parse(require('fs').readFileSync('.github/workflows/pages.yml','utf8')); const b=y.on.push.branches; if(!b.includes('demo')||b.includes('main')){process.exit(1)} console.log('OK')"
# OK
```

**Outcome:** done (file change staged; remote sequencing owned by human).

---

## Step 8 (T-BRANCH-016, T-BRANCH-017) — `agents/operational/docs-review-bot/PROMPT.md` — 2026-05-04

**Files changed:** `agents/operational/docs-review-bot/PROMPT.md` (line 46)

**Edit applied:** replaced ``clean clone of `main` `` with ``clean clone of `develop` `` in the "Tutorial drift `[BLOCKER]`" rule.

**Verification (post-edit):**

```bash
grep -c "clean clone of \`main\`" agents/operational/docs-review-bot/PROMPT.md      # 0
grep -c "clean clone of \`develop\`" agents/operational/docs-review-bot/PROMPT.md   # 1
```

Both checks pass.

**Outcome:** done.

---

## Step 8 (T-BRANCH-017 cont.) — `docs/branching.md` rewrite for Shape B — 2026-05-04

**Files changed:** `docs/branching.md` (six distinct edits)

**Edits applied per spec IF-05:**

1. **Lead paragraph above the two-shape framing** declares Shape B as the active model for this template repository as of ADR-0027 and explicitly retains Shape A as a documented adopter option (REQ-BRANCH-007).
2. **Shape B table** is now listed first under §"The branches" and includes a Shape A subsection second; the Shape B table's wording covers `develop` as the topic-PR target, `main` as release-only with promoted commits, and `demo` as the Pages source promoted from `main` via `chore/promote-demo` (REQ-BRANCH-001, REQ-BRANCH-007).
3. **Topic-branch prefixes table** annotates `release/` as `(Shape A only)` (REQ-BRANCH-005). The line is retained because the `release/*` deny removal in `.claude/settings.json` does not also retire the prefix table for adopters operating Shape A.
4. **§"Required ruleset for `develop`, `main`, `demo`"** replaces §"Required main ruleset"; the must-haves are unchanged but now explicitly cover all three branches, with a bypass-list note recording the maintainer as the sole bypass actor on `demo` and no bypass actors on `main` or `develop` (REQ-BRANCH-007 §Compliance, ADR-0027).
5. **§"Settings"** updated to read "Push to `main`, `develop`, and `demo` is denied. Force-push to any of the three is denied." (REQ-BRANCH-007).
6. **§"Why `develop` and `demo` exist now"** replaces §"Why `develop` exists in Shape B" and §"Why not `develop` in v0.5"; the new section references ADR-0027 and explains the three reasons (durable releases, bot integration-branch keying, Pages serves a validated state) (REQ-BRANCH-005, REQ-BRANCH-007).
7. **§"Release path under Shape B"** replaces §"Release branches (`release/vX.Y.Z`)" and §"Promotion (Shape B only)" with the active release path: release-prep on `develop`, `develop → main` promotion PR, tag from `main`, `chore/promote-demo` PR. The Shape A `release/vX.Y.Z` flow is preserved as a single "Shape A only — historical convention" callout block (REQ-BRANCH-005).

**Verification (post-edit):**

```bash
grep -c "Shape B" docs/branching.md                                              # 7  (>= 3)
grep -c "release/vX.Y.Z" docs/branching.md                                       # 2  (both inside the "Shape B does not use this" prose or the "Shape A only — historical" callout — acceptable per spec)
grep -nE "topic.*PR.*main|target.*main.*topic" docs/branching.md                 # 2 hits, both in retained "no direct commits" rule and the Shape A historical callout (acceptable per spec — manual review)
```

**Outcome:** done.

---

## Step 8 (T-BRANCH-018) — `docs/worktrees.md` Shape B integration branch — 2026-05-04

**Files changed:** `docs/worktrees.md` (two edits)

**Edits applied per spec IF-06:**

1. **§Lifecycle** lead paragraph + example `git worktree add` command explicitly cut the worktree from `origin/develop` (Shape B), with a one-line note explaining adopters on Shape A substitute `main` (REQ-BRANCH-012).
2. **§Common pitfalls** "merged local branches piling up" bullet now names the integration branch by parameter — `origin/develop` under Shape B, `origin/main` under Shape A — instead of hard-coding `origin/main` (REQ-BRANCH-012).

**Verification (post-edit):**

```bash
grep -nE "(cut|branch).*from.*main|origin/main.*-b feat" docs/worktrees.md
# Two hits remain: line 20 (the new lead paragraph documenting both shapes — explicitly says
# "develop for this template, main for Shape A adopters") and line 62 ("main checkout" in
# the index-bleed pitfall, referring to the primary git checkout rather than the main branch).
# Neither tells contributors to cut new topic work from main; both are documentation of the
# Shape A option or unrelated terminology. Manual review confirms.

grep -c "develop" docs/worktrees.md          # 6  (>= 1, with several in cut-from context)
```

**Outcome:** done.

---

## Step 8 (T-BRANCH-019) — `AGENTS.md` and `CLAUDE.md` — 2026-05-04

**Files changed:** `AGENTS.md` (one edit), `CLAUDE.md` (one edit)

**Edits applied per spec IF-07:**

1. **`AGENTS.md`** — appended to the "Branch per concern; verify before push" bullet: *"Topic PRs target `develop` (Shape B per ADR-0027); `main` carries only promoted, tagged commits."* (REQ-BRANCH-015).
2. **`CLAUDE.md`** — updated the `.claude/settings.json` permission-rules bullet: extended the existing push-deny list to include `demo`, and appended *"Topic PRs target `develop`; `demo` is the Pages source."* (REQ-BRANCH-015).

The pre-existing operating-rule bullets ("No direct commits on `main` / `develop`" in AGENTS.md; "Pushes to `main` / `develop` are denied" in CLAUDE.md) remain correct under Shape B and were not modified beyond CLAUDE.md adding `demo` to the deny statement.

**Verification (post-edit):**

```bash
grep -c "Topic PRs target \`develop\`" AGENTS.md   # 1
grep -c "Topic PRs target \`develop\`" CLAUDE.md   # 1
```

**Outcome:** done.

---

## Step 8 (T-BRANCH-020) — ADR-0027 acceptance + ADR-0020 frontmatter + ADR README — 2026-05-04

**Files changed:** `docs/adr/0027-adopt-shape-b-branching-model.md` (frontmatter + body §Status), `docs/adr/README.md` (one row)

**Edits applied per spec IF-08:**

1. **`docs/adr/0027-adopt-shape-b-branching-model.md` line 4 (frontmatter):** `status: proposed` → `status: Accepted` (REQ-BRANCH-010).
2. **`docs/adr/0027-adopt-shape-b-branching-model.md` body §Status:** `Proposed` → `Accepted` (REQ-BRANCH-010). This is permitted because ADR-0027 has not yet been accepted; the immutable-body rule applies to ADRs that are already Accepted, not to a Proposed ADR being moved to Accepted.
3. **`docs/adr/README.md` index row for ADR-0027:** Status column `Proposed` → `Accepted`.
4. **`docs/adr/0020-v05-release-branch-strategy.md`:** No edit. Frontmatter already carries `status: Superseded` and `superseded-by: [ADR-0027]` (set by the architect during Stage 4). Body §Status retains `Accepted` per the immutable-body rule restated at the bottom of the file (line 141) and at NFR-BRANCH-004; the spec explicitly forbids modifying ADR-0020's body.

**Verification (post-edit):**

```bash
grep -E "^status: Accepted$" docs/adr/0027-adopt-shape-b-branching-model.md      # match
grep -E "^status: Superseded$" docs/adr/0020-v05-release-branch-strategy.md       # match
grep -E "^superseded-by: \[ADR-0027\]$" docs/adr/0020-v05-release-branch-strategy.md  # match
grep -c "0027-adopt-shape-b-branching-model" docs/adr/README.md                  # 1
```

ADR-0020 body diff (excluding frontmatter): no changes in this Stage 7 file-change pass.

**Outcome:** done.

---

## Step 10 (T-BRANCH-027) — `.github/dependabot.yml` `target-branch: develop` — 2026-05-04

**Files changed:** `.github/dependabot.yml` (two edits)

**Edits applied per spec IF-03:**

1. **`github-actions` block** (after `directory: /`): added `target-branch: develop`.
2. **`npm` block** (after `directory: /`): added `target-branch: develop`.

This is forward-compatibility insurance: after the GitHub default-branch flip to `develop` (T-BRANCH-010, owned by human), Dependabot would inherit `develop` even without `target-branch`, but explicitly setting it removes ambiguity for reviewers and protects against any future default-branch change.

**Verification (post-edit):**

```bash
node -e "const y=require('yaml').parse(require('fs').readFileSync('.github/dependabot.yml','utf8')); if(!y.updates.every(u => u['target-branch'] === 'develop')){process.exit(1)} console.log('OK')"
# OK — both updates blocks declare target-branch: develop
```

**Outcome:** done.

---

## Verify gate — 2026-05-04

Ran `npm run verify` from the worktree root after all file edits. Results:

- `test:scripts` — **291 pass, 0 fail** (`pass`).
- `check:automation-registry` — **`ok`**.
- `check:agents` — **`ok`**.
- `check:links` — **1 error** (`fail`):
  - `specs/shape-b-branching-adoption/spec.md:285 [LINK_FILE] links to missing file docs/branching.md`
  - **Pre-existing.** Confirmed by stashing my changes and re-running `check:links`: the same single error reproduces against unchanged `HEAD`. The defect is in `specs/shape-b-branching-adoption/spec.md` line 285, where the spec quotes a literal example of CLAUDE.md text containing the relative link `docs/branching.md`. The link checker resolves it relative to the spec file's location rather than the link's eventual location in `CLAUDE.md`. This file is owned by the architect agent (not dev); resolving it is outside Stage 7 scope and should be raised separately (likely a `qa` or `architect` follow-up to either escape the example or re-anchor the link in the spec).

In addition, the user-noted `check:script-docs` failure (missing typedoc in worktree) is a pre-existing worktree-environment artifact and is also expected.

**My edits did surface four anchor breakages during the first verify run; all four were fixed in this session before recording the final verify result above:**

1. `docs/branching.md:40` — the `release/` topic-prefix table linked to `#release-branches-releasevxyz`, an anchor for the section I renamed. Repointed to `#release-path-under-shape-b`.
2. `docs/ci-automation.md:111` — pointed to `branching.md#required-main-ruleset`. Repointed to `branching.md#required-ruleset-for-develop-main-demo`.
3. `docs/security-ci.md:93` — same anchor in the repository settings checklist row "Integration-branch ruleset". Repointed and the row prose updated to also list `demo` for Shape B.
4. `docs/security-ci.md:101` — same anchor in the CODEOWNERS row. Repointed.

These four fixes are an unavoidable side-effect of the spec-mandated section rename in IF-05 edit (4) (`Required main ruleset` → `Required ruleset for develop, main, demo`). Without them the whole template would carry broken intra-doc links after Shape B adoption. The spec did not list these external-anchor follow-ups; they are recorded here per the dev procedure rule "if implementation reveals a missing requirement, escalate" — not as a defect, but as scope-creep candidates the architect/PM may want to capture in `tasks.md` or a follow-up issue if they recur for downstream adopters running their own renames.

---

## Tasks NOT executed in this Stage 7 file-change pass

The following spec interfaces and tasks are owned by the human / orchestrator
and are intentionally out of scope for the dev agent:

- **IF-10 / T-BRANCH-006** — GitHub Pages environment allow-list update (manual UI).
- **IF-11 / T-BRANCH-012** — Ruleset PATCH (`gh api`).
- **IF-12 / T-BRANCH-010** — Default-branch flip (manual UI).
- **T-BRANCH-002** — `release/v0.5.0` cleanup (remote `git push --delete`).
- **T-BRANCH-008** — `develop` and `demo` branch seeding from `${MAIN_HEAD_SHA}` (remote `git push`).
- **T-BRANCH-024 / T-BRANCH-025** — Bot scheduler config edits. The spec's IF-09 says: locate `.github/workflows/<bot>.yml` for each of `review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`. A worktree scan shows none of these four bot names have a `.github/workflows/<bot>.yml` scheduler file in this repo (only `pages.yml`, `dependabot.yml`, and feature workflows). The bots are invoked as on-demand Claude Code sessions per `agents/operational/<bot>/PROMPT.md`. Per spec IF-09 procedure: "If no such field exists today (the bot defaults to the repo default branch) and the GitHub default branch is being flipped to `develop` in Step 5, document that fact in the implementation log; no edit is required for that bot, and Step 5 alone satisfies REQ-BRANCH-009 for it." Recording that finding here. T-BRANCH-024 (the discovery spike) is satisfied; T-BRANCH-025 is **N/A** (no in-repo scheduler edits required); REQ-BRANCH-009 will be satisfied by T-BRANCH-010 (default-branch flip to `develop`) when the human completes that step.


