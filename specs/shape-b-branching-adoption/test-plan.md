---
id: TEST-PLAN-BRANCH-001
title: Shape B branching adoption — Test plan
feature: shape-b-branching-adoption
stage: 8
status: complete
owner: qa
inputs:
  - PRD-BRANCH-001
  - SPEC-BRANCH-001
created: 2026-05-03
updated: 2026-05-03
---

# Test plan — Shape B branching adoption

## Entry criteria

- `spec.md` status: `complete` (architect hand-off confirmed).
- `tasks.md` status: `complete` (planner hand-off confirmed).
- Implementation files exist in the worktree at `.worktrees/shape-b-stage5`:
  - `.claude/settings.json`
  - `.github/workflows/pages.yml`
  - `docs/branching.md`
  - `docs/worktrees.md`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `agents/operational/docs-review-bot/PROMPT.md`
  - `docs/adr/0027-adopt-shape-b-branching-model.md`
  - `docs/adr/0020-v05-release-branch-strategy.md`
  - `docs/adr/README.md`

## Exit criteria

- Every `must` requirement (REQ-BRANCH-001 through REQ-BRANCH-010, REQ-BRANCH-014) has at least one test with a PASS verdict or is explicitly marked N/A or MANUAL with justification.
- Every `should` requirement (REQ-BRANCH-011, REQ-BRANCH-012, REQ-BRANCH-013, REQ-BRANCH-015) has a test verdict or justified disposition.
- No test marked FAIL without a corresponding `dev`-owned remediation task.
- All 6 NFRs have verification evidence recorded.

## Test taxonomy

This feature is a config/docs change. There is no compiled source code, runtime service, or unit-testable function. All tests are one of:

- **FILE** — deterministic content check against the worktree using `node` or `grep`.
- **MANUAL** — requires live GitHub remote access (`gh api`, `gh repo view`); cannot run offline.
- **N/A** — requirement applies to a precondition that was verifiably absent (e.g., a branch that was confirmed not to exist).

FILE tests are the only category executed and recorded in Stage 8. MANUAL tests are documented here with the exact command; execution is deferred to the deployment-phase verification window (spec Step 12).

---

## Test cases

### TEST-BRANCH-001 — Topic PRs target `develop` (REQ-BRANCH-001)

**Type:** FILE

**Requirement:** `docs/branching.md` shall state that topic-branch PRs target `develop` and shall not name `main` as a valid PR target for topic branches.

**Commands:**

```bash
# Assert: develop named as PR target in Shape B section
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); const ok=c.includes('Topic PRs target \`develop\`'); process.exit(ok ? 0 : 1);"

# Assert: main not named as topic PR target (outside Shape A subsection)
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); const bad=c.match(/topic.*PRs.*target.*\`main\`|target.*\`main\`.*topic.*PR/i); process.exit(bad ? 1 : 0);"
```

**Pass criterion:** both commands exit 0.

**Linked interface:** IF-05 (spec.md §IF-05).

---

### TEST-BRANCH-002 — `develop` push-deny in `.claude/settings.json` (REQ-BRANCH-002)

**Type:** FILE

**Requirement:** `.claude/settings.json` deny list shall block `git push origin develop` and `git push -u origin develop`.

**Commands:**

```bash
node -e "
const s=require('./.claude/settings.json');
const push=s.permissions.deny.some(d => d.includes('git push origin develop:'));
const pushU=s.permissions.deny.some(d => d.includes('git push -u origin develop:'));
if (!push || !pushU) { console.error('FAIL'); process.exit(1); }
console.log('PASS');
"
```

**Pass criterion:** exit 0.

**Linked interface:** IF-01 (spec.md §IF-01).

---

### TEST-BRANCH-003 — `demo` push-deny in `.claude/settings.json` (REQ-BRANCH-003)

**Type:** FILE

**Requirement:** `.claude/settings.json` deny list shall block `git push origin demo` and `git push -u origin demo`.

**Commands:**

```bash
node -e "
const s=require('./.claude/settings.json');
const push=s.permissions.deny.some(d => d.includes('git push origin demo:'));
const pushU=s.permissions.deny.some(d => d.includes('git push -u origin demo:'));
if (!push || !pushU) { console.error('FAIL'); process.exit(1); }
console.log('PASS');
"
```

**Pass criterion:** exit 0.

**Linked interface:** IF-01 (spec.md §IF-01).

---

### TEST-BRANCH-004 — `pages.yml` triggers on `demo`, not `main` (REQ-BRANCH-004)

**Type:** FILE

**Requirement:** `.github/workflows/pages.yml` shall list `demo` and shall not list `main` under `on.push.branches`.

**Commands:**

```bash
# demo present in trigger list
node -e "const fs=require('fs'); const c=fs.readFileSync('.github/workflows/pages.yml','utf8'); if(!c.includes('- demo')) process.exit(1); console.log('demo present: PASS');"

# main absent from trigger list (match branches block specifically)
node -e "const fs=require('fs'); const c=fs.readFileSync('.github/workflows/pages.yml','utf8'); if(c.match(/branches:\s*\n\s*- main/)) process.exit(1); console.log('main absent: PASS');"
```

**Pass criterion:** both commands exit 0.

**Linked interface:** IF-02 (spec.md §IF-02).

---

### TEST-BRANCH-005 — `release/vX.Y.Z` removed from `docs/branching.md` as required step (REQ-BRANCH-005)

**Type:** FILE

**Requirement:** `docs/branching.md` shall describe the `develop → main` promotion PR as the release path and shall not prescribe `release/vX.Y.Z` as a required step.

**Commands:**

```bash
# develop-to-main promotion path described
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); if(!c.includes('develop → main')) process.exit(1); console.log('develop-to-main path: PASS');"

# release/vX.Y.Z not required (Shape A historical callout is acceptable but must not be active prescription)
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); if(c.match(/required.*release\/v|release\/v.*required/i)) process.exit(1); console.log('release/vX.Y.Z not required: PASS');"
```

**Pass criterion:** both commands exit 0.

**Linked interface:** IF-05 (spec.md §IF-05).

---

### TEST-BRANCH-006 — `develop` seeded non-destructively from `main` HEAD (REQ-BRANCH-006)

**Type:** MANUAL

**Requirement:** the `develop` branch exists on the remote and its HEAD SHA equals the captured `main` HEAD SHA at seeding time (no history rewrite).

**Command (run during deployment verification, Step 5/12 of the rollout):**

```bash
MAIN_SHA=$(git rev-parse origin/main)
DEV_SHA=$(git rev-parse origin/develop)
test "$MAIN_SHA" = "$DEV_SHA" && echo "PASS: develop seeded at main HEAD" || echo "FAIL: SHA mismatch"

# Additional: no new commits on develop vs main
git log --oneline origin/main..origin/develop   # must return empty
```

**Pass criterion:** both SHAs are identical; `git log` returns empty.

**Note:** This test requires live remote access. The `develop` branch must first be created per spec Step 5. Cannot be run as a FILE check at Stage 8.

---

### TEST-BRANCH-007 — `docs/branching.md` designates Shape B as active model (REQ-BRANCH-007)

**Type:** FILE

**Requirement:** `docs/branching.md` shall designate Shape B as active for this template repo and shall retain Shape A only as an adopter option.

**Commands:**

```bash
# Shape B named >= 3 times (active designation + table header + settings/rules section)
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); const n=(c.match(/Shape B/g)||[]).length; if(n<3) process.exit(1); console.log('PASS count='+n);"

# Shape B explicitly marked as active for this template
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); if(!c.match(/Shape B.*active|active.*Shape B/i)) process.exit(1); console.log('PASS');"

# Shape A described as adopter option, not the current template model
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/branching.md','utf8'); if(!c.includes('Shape A')) process.exit(1); if(!c.match(/adopter|downstream/i)) process.exit(1); console.log('PASS: Shape A retained as adopter option');"
```

**Pass criterion:** all three commands exit 0.

**Linked interface:** IF-05 (spec.md §IF-05).

---

### TEST-BRANCH-008 — `docs-review-bot/PROMPT.md` references `develop`, not `main` (REQ-BRANCH-008)

**Type:** FILE

**Requirement:** `agents/operational/docs-review-bot/PROMPT.md` shall not contain the literal string ``clean clone of `main` `` and shall contain ``clean clone of `develop` ``.

**Commands:**

```bash
# Old phrase absent
node -e "const fs=require('fs'); const c=fs.readFileSync('agents/operational/docs-review-bot/PROMPT.md','utf8'); if(c.includes('clean clone of \`main\`')) process.exit(1); console.log('old phrase absent: PASS');"

# New phrase present
node -e "const fs=require('fs'); const c=fs.readFileSync('agents/operational/docs-review-bot/PROMPT.md','utf8'); if(!c.includes('clean clone of \`develop\`')) process.exit(1); console.log('new phrase present: PASS');"
```

**Pass criterion:** both commands exit 0.

**Linked interface:** IF-04 (spec.md §IF-04).

---

### TEST-BRANCH-009 — Bot scheduler configurations reference `develop` (REQ-BRANCH-009)

**Type:** MANUAL / verified-by-default-branch-flip

**Requirement:** `review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot` schedulers shall pass `develop` as the integration-branch argument.

**Context from spec investigation:** spec IF-09 (Step 9) documents that none of the four bots have in-repo scheduler YMLs that name an explicit integration branch. No `.github/workflows/<bot>.yml` files exist for these bots. Per spec IF-09 step 4, when no such field exists and the GitHub default branch is flipped to `develop` (spec Step 5b), that flip alone satisfies REQ-BRANCH-009 for each bot. The Dependabot config (IF-03) provides the explicit `target-branch: develop` declaration.

**Verification command (MANUAL — requires remote access):**

```bash
# Confirm no in-repo scheduler YMLs name main as integration branch
ls .github/workflows/     # review-bot, plan-recon-bot, dep-triage-bot, actions-bump-bot not present

# Confirm default branch is develop (satisfies REQ-BRANCH-009 by default-branch flip)
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'   # must print "develop"
```

**Disposition:** VERIFIED-BY-DEFAULT-BRANCH-FLIP. No in-repo scheduler configs exist (confirmed in the worktree). Satisfied when spec Step 5b (default-branch flip) completes and `.github/dependabot.yml` carries `target-branch: develop` per TEST-BRANCH-009b.

---

### TEST-BRANCH-009b — `.github/dependabot.yml` sets `target-branch: develop` (REQ-BRANCH-009 / IF-03)

**Type:** FILE

**Requirement:** Both `updates:` blocks in `.github/dependabot.yml` shall carry `target-branch: develop`.

**Commands:**

```bash
node -e "
const fs=require('fs');
const content=fs.readFileSync('.github/dependabot.yml','utf8');
const matches=(content.match(/target-branch: develop/g)||[]).length;
if(matches < 2) { console.error('FAIL: found '+matches+' occurrences, expected >= 2'); process.exit(1); }
console.log('PASS: target-branch: develop found '+matches+' times');
"
```

**Pass criterion:** exit 0 with count >= 2.

**Linked interface:** IF-03 (spec.md §IF-03).

---

### TEST-BRANCH-010 — ADR-0027 accepted and supersedes ADR-0020 (REQ-BRANCH-010)

**Type:** FILE

**Requirement:** ADR-0027 shall exist with `status: Accepted` and `supersedes: [ADR-0020]`; ADR-0020 shall carry `status: Superseded` and `superseded-by: [ADR-0027]`.

**Commands:**

```bash
# ADR-0027: status Accepted
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/adr/0027-adopt-shape-b-branching-model.md','utf8'); if(!c.match(/^status: Accepted$/m)) process.exit(1); console.log('ADR-0027 status Accepted: PASS');"

# ADR-0027: supersedes ADR-0020
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/adr/0027-adopt-shape-b-branching-model.md','utf8'); if(!c.match(/^supersedes: \[ADR-0020\]$/m)) process.exit(1); console.log('ADR-0027 supersedes ADR-0020: PASS');"

# ADR-0020: status Superseded
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/adr/0020-v05-release-branch-strategy.md','utf8'); if(!c.match(/^status: Superseded$/m)) process.exit(1); console.log('ADR-0020 status Superseded: PASS');"

# ADR-0020: superseded-by ADR-0027
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/adr/0020-v05-release-branch-strategy.md','utf8'); if(!c.match(/^superseded-by: \[ADR-0027\]$/m)) process.exit(1); console.log('ADR-0020 superseded-by ADR-0027: PASS');"

# ADR README index lists ADR-0027
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/adr/README.md','utf8'); if(!c.includes('0027-adopt-shape-b-branching-model')) process.exit(1); console.log('ADR-0027 in README index: PASS');"
```

**Pass criterion:** all five commands exit 0.

**Linked interface:** IF-08 (spec.md §IF-08), NFR-BRANCH-004.

---

### TEST-BRANCH-011 — `release/*` allow entries removed from `.claude/settings.json` (REQ-BRANCH-011)

**Type:** FILE

**Requirement:** `.claude/settings.json` allow list shall not contain `"Bash(git push -u origin release/*)"` or `"Bash(git push origin release/*)"`.

**Commands:**

```bash
node -e "
const s=require('./.claude/settings.json');
const bad=s.permissions.allow.some(a => a.includes('release/*'));
if(bad) { console.error('FAIL: release/* allow entry found'); process.exit(1); }
console.log('PASS: no release/* in allow list');
"
```

**Pass criterion:** exit 0.

**Linked interface:** IF-01 (spec.md §IF-01).

---

### TEST-BRANCH-012 — `docs/worktrees.md` names `develop` as cut-from branch (REQ-BRANCH-012)

**Type:** FILE

**Requirement:** `docs/worktrees.md` shall name `develop` as the base branch for cutting new topic branches; no `git worktree add` example command shall use `origin/main` as the base.

**Commands:**

```bash
# develop is named as the cut-from branch
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/worktrees.md','utf8'); if(!c.includes('origin/develop')) process.exit(1); console.log('develop as cut-from: PASS');"

# No git worktree add example uses origin/main as the base
node -e "const fs=require('fs'); const c=fs.readFileSync('docs/worktrees.md','utf8'); const bad=c.match(/git worktree add[^\n]*origin\/main/g); if(bad) { console.error('FAIL: '+bad); process.exit(1); } console.log('no worktree add from main: PASS');"
```

**Pass criterion:** both commands exit 0.

**Note:** references to `main` in explanatory prose (e.g., "main checkout", "Shape A adopters substitute `main`") are expected and do not constitute a violation of this requirement.

**Linked interface:** IF-06 (spec.md §IF-06).

---

### TEST-BRANCH-013 — `release/v0.5.0` does not exist on remote (REQ-BRANCH-013)

**Type:** N/A (precondition confirmed absent)

**Requirement:** IF `release/v0.5.0` exists on the remote, the implementation plan shall include a step to delete it.

**Disposition:** The worktree-based implementation is running against a repo state where this branch was confirmed absent in the spec Step 1 pre-check (recorded in `workflow-state.md` and spec.md Step 1 notes). The conditional trigger (`IF branch exists THEN delete`) did not fire. REQ-BRANCH-013 is satisfied by verification that the precondition was false.

**Verification command (MANUAL — run once during deployment):**

```bash
git ls-remote --heads origin release/v0.5.0   # must return empty
```

**Pass criterion (disposition):** N/A — branch was confirmed absent; the conditional requirement has no false arm to verify.

---

### TEST-BRANCH-014 — `demo` seeded from `main` HEAD at adoption time (REQ-BRANCH-014)

**Type:** MANUAL

**Requirement:** `demo` branch shall exist on the remote and its HEAD SHA shall equal the `main` HEAD SHA at seeding time.

**Command (run during deployment verification, spec Step 5/12):**

```bash
MAIN_SHA=$(git rev-parse origin/main)
DEMO_SHA=$(git rev-parse origin/demo)
test "$MAIN_SHA" = "$DEMO_SHA" && echo "PASS: demo seeded at main HEAD" || echo "FAIL: SHA mismatch"

# No new commits on demo vs main
git log --oneline origin/main..origin/demo   # must return empty
```

**Pass criterion:** SHAs are identical; `git log` returns empty.

**Note:** This test requires the remote `demo` branch to exist, which is created in spec Step 5. Cannot run as a FILE check at Stage 8.

---

### TEST-BRANCH-015 — `AGENTS.md` and `CLAUDE.md` name `develop` as integration branch (REQ-BRANCH-015)

**Type:** FILE

**Requirement:** `AGENTS.md` and `CLAUDE.md` shall name `develop` as the PR target for topic-branch work.

**Commands:**

```bash
# AGENTS.md: Topic PRs target develop
node -e "const fs=require('fs'); const c=fs.readFileSync('AGENTS.md','utf8'); if(!c.includes('Topic PRs target \`develop\`')) process.exit(1); console.log('AGENTS.md: PASS');"

# CLAUDE.md: Topic PRs target develop, demo as Pages source
node -e "const fs=require('fs'); const c=fs.readFileSync('CLAUDE.md','utf8'); const target=c.includes('Topic PRs target \`develop\`') || c.includes('topic PRs target \`develop\`'); if(!target) process.exit(1); console.log('CLAUDE.md develop target: PASS');"

node -e "const fs=require('fs'); const c=fs.readFileSync('CLAUDE.md','utf8'); if(!(c.includes('demo') && c.includes('Pages'))) process.exit(1); console.log('CLAUDE.md demo/Pages: PASS');"
```

**Pass criterion:** all three commands exit 0.

**Linked interface:** IF-07 (spec.md §IF-07).

---

## NFR verification

### NFR-BRANCH-001 — `develop` creation is non-destructive (MANUAL)

```bash
# Same as TEST-BRANCH-006: SHA equality
test "$(git rev-parse origin/develop)" = "${MAIN_HEAD_SHA}"
git log --oneline origin/main..origin/develop   # empty
```

### NFR-BRANCH-002 — `demo` creation is non-destructive (MANUAL)

```bash
# Same as TEST-BRANCH-014: SHA equality
test "$(git rev-parse origin/demo)" = "${MAIN_HEAD_SHA}"
git log --oneline origin/main..origin/demo   # empty
```

### NFR-BRANCH-003 — All affected files consistent with Shape B (FILE)

```bash
# No file describes main as integration branch or PR target for topic work
# (outside Shape A subsections)
node -e "
const fs=require('fs');
const files=['docs/branching.md','docs/worktrees.md','AGENTS.md','CLAUDE.md','agents/operational/docs-review-bot/PROMPT.md'];
let fail=false;
files.forEach(f => {
  const c=fs.readFileSync(f,'utf8');
  const lines=c.split('\n').filter(l=>!l.match(/Shape A|adopter|substitute/i));
  const bad=lines.filter(l=>l.match(/integration branch.*main|main.*integration branch|topic.*PR.*target.*main/i));
  if(bad.length){console.error('FAIL in '+f+':', bad); fail=true;}
});
if(!fail) console.log('PASS');
"
```

### NFR-BRANCH-004 — ADR supersession recorded in both directions (FILE)

Covered by TEST-BRANCH-010 (five sub-checks).

### NFR-BRANCH-005 — Deny list does not shrink (FILE)

```bash
node -e "
const s=require('./.claude/settings.json');
const branches=['main','develop','demo'];
const count=s.permissions.deny.filter(d => branches.some(b => d.includes(b))).length;
if(count < 19) { console.error('FAIL count='+count); process.exit(1); }
console.log('PASS count='+count);
"
```

### NFR-BRANCH-006 — Pages availability not interrupted (MANUAL)

```bash
# Before Step 7 merge: both main and demo in github-pages allow-list
gh api /repos/$OWNER/$REPO/environments/github-pages/deployment-branch-policies \
  --jq '[.branch_policies[].name]'   # must include "demo"

# After flip: Pages site returns HTTP 200
curl -s -o /dev/null -w '%{http_code}' "https://<owner>.github.io/<repo>/"   # must print 200
```

---

## Traceability matrix

| REQ ID | Priority | TEST ID(s) | Type | Scope |
|---|---|---|---|---|
| REQ-BRANCH-001 | must | TEST-BRANCH-001 | FILE | `docs/branching.md` |
| REQ-BRANCH-002 | must | TEST-BRANCH-002 | FILE | `.claude/settings.json` |
| REQ-BRANCH-003 | must | TEST-BRANCH-003 | FILE | `.claude/settings.json` |
| REQ-BRANCH-004 | must | TEST-BRANCH-004 | FILE | `.github/workflows/pages.yml` |
| REQ-BRANCH-005 | must | TEST-BRANCH-005 | FILE | `docs/branching.md` |
| REQ-BRANCH-006 | must | TEST-BRANCH-006 | MANUAL | remote `origin/develop` |
| REQ-BRANCH-007 | must | TEST-BRANCH-007 | FILE | `docs/branching.md` |
| REQ-BRANCH-008 | must | TEST-BRANCH-008 | FILE | `agents/operational/docs-review-bot/PROMPT.md` |
| REQ-BRANCH-009 | must | TEST-BRANCH-009, TEST-BRANCH-009b | MANUAL + FILE | default-branch flip + `dependabot.yml` |
| REQ-BRANCH-010 | must | TEST-BRANCH-010 | FILE | `docs/adr/0027-*`, `docs/adr/0020-*`, `docs/adr/README.md` |
| REQ-BRANCH-011 | should | TEST-BRANCH-011 | FILE | `.claude/settings.json` |
| REQ-BRANCH-012 | should | TEST-BRANCH-012 | FILE | `docs/worktrees.md` |
| REQ-BRANCH-013 | should | TEST-BRANCH-013 | N/A | remote (branch absent) |
| REQ-BRANCH-014 | must | TEST-BRANCH-014 | MANUAL | remote `origin/demo` |
| REQ-BRANCH-015 | should | TEST-BRANCH-015 | FILE | `AGENTS.md`, `CLAUDE.md` |
| NFR-BRANCH-001 | — | TEST-BRANCH-006 (alias) | MANUAL | remote `origin/develop` |
| NFR-BRANCH-002 | — | TEST-BRANCH-014 (alias) | MANUAL | remote `origin/demo` |
| NFR-BRANCH-003 | — | NFR-003 check | FILE | all 5 affected docs |
| NFR-BRANCH-004 | — | TEST-BRANCH-010 | FILE | both ADRs |
| NFR-BRANCH-005 | — | NFR-005 check | FILE | `.claude/settings.json` |
| NFR-BRANCH-006 | — | MANUAL | MANUAL | GitHub Pages env + curl |

## Risks

- **RISK-TP-001:** MANUAL tests (REQ-BRANCH-006, REQ-BRANCH-009, REQ-BRANCH-014, NFR-BRANCH-001, NFR-BRANCH-002, NFR-BRANCH-006) cannot be run until spec Steps 5, 5b, and 7 complete on the live remote. These are deployment-phase gate items, not Stage 8 blockers.
- **RISK-TP-002:** TEST-BRANCH-009b (dependabot.yml `target-branch`) assumes the `.github/dependabot.yml` file has been updated. If `dev` has not yet completed T-BRANCH-028 (spec Step 10), this test will FAIL. Recorded as a pending dev task.
- **RISK-TP-003:** NFR-BRANCH-003 check uses a grep heuristic; manual reviewer pass is required to confirm the heuristic catches all phrasing variants. Reviewer-owned risk, not a QA blocker.
