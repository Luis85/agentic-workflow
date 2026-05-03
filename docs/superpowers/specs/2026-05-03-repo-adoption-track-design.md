---
title: "Repo Adoption Track — Design"
folder: "docs/superpowers/specs"
description: "Design spec for the new opt-in track that clones a foreign git repo, mechanically installs the agentic-workflow scaffold, and pushes a PR back to origin via a gated review→parity→enrich→push pipeline."
entry_point: false
status: draft
date: 2026-05-03
authors: [Luis85]
---

# Repo Adoption Track — Design

> Brainstormed and approved 2026-05-03. Implementation plan to follow via the writing-plans skill. Implementation gated by ADR-0027 (to be filed) which amends the v1.0 track taxonomy frozen in [ADR-0026](../../adr/0026-freeze-v1-workflow-track-taxonomy.md).

## 1. Problem and intent

The Specorator template currently supports four adoption scenarios:

- Discovery Track — blank-page ideation produces a `chosen-brief.md`.
- Stock-taking Track — human-led inventory of a legacy *system* produces `stock-taking-inventory.md`.
- Project Scaffolding Track — distils loose source material into a starter pack.
- Direct entry — a clear brief feeds `/spec:start` + `/spec:idea`.

A fifth scenario is unaddressed: an existing **git repository** that the team wants to bring under the agentic-workflow template. Today the adopter manually copies `AGENTS.md`, `CLAUDE.md`, `memory/`, `.claude/`, `templates/`, and `scripts/` into their repo, hand-writes steering, and hopes the verify gate passes. This is mechanical, error-prone, and unreviewable.

The Repo Adoption Track automates this: clone the foreign repo, scan it, diff against the expected scaffold, fill the gaps, and PR the result back. The track is a peer of Stock-taking and Project Scaffolding — not a replacement. They solve different problems:

| Track | Subject | Output | Human-led? |
|---|---|---|---|
| Stock-taking | A *system* (which may include code) | Inventory + gap analysis | Yes — auditor + interviews |
| Project Scaffolding | Loose docs/notes | Starter pack of canonical artifacts | Yes — extraction with citations |
| **Repo Adoption (this spec)** | A *foreign git repo* | A PR upstream that installs the template | **No** — mechanical install |

## 2. Design decisions (locked in brainstorming)

| # | Decision | Rationale |
|---|---|---|
| Q1 | Net-new parallel track, distinct from existing | Different intent — automated template install vs human-led discovery |
| Q2 | Adoption folder lives at `adoptions/<repo-slug>/` | Parallel to other opt-in track folders; `projects/` already owned by Project Manager Track |
| Q3 | One-shot lifecycle + retained state for manual refresh | Bi-directional sync is a maintenance trap; retention is cheap |
| Q4 | Configurable preset (`template-only`, `steering-default`, `steering+baseline`) with `steering-default` as default | Mechanizing baseline (B) is low-quality without a human; pure template (A) too sparse |
| Q5 | Direct push primary, `git format-patch` fallback if no write access | Common case is adopter pushing to their own repo; patch covers edge cases |
| Q6 | Gate at every phase boundary | Constitution Articles VII + IX; consistent with every other conductor |
| Q7 | Skip + report on conflicts (existing `AGENTS.md`, etc.) | Hard abort hostile; three-way merge heavy and rare |
| Q8 | Three scripts: parity validator, verify-gate transplant, idempotency check | Parity is the gate; verify transplant is the *point*; idempotency prevents accidental re-adoption |
| Q9 | Source = git URL or local path | URL ergonomic; path covers offline/private/already-cloned |
| Q10 | New `repo-adopter` agent for review+parity+enrich; conductor handles git push | Keeps irreversible ops out of agent surface (Article VI + IX) |

## 3. Architecture

```
inputs/                       (existing — intake)
adoptions/<repo-slug>/        (NEW — one folder per adoption)
├── adoption-state.md         state machine
├── review.md                 phase 1 output (signals only, no judgment)
├── parity.md                 phase 2 output (gap table)
├── enrich-preview.md         phase 3 output (file index + content under repo/)
├── push-record.md            phase 4 output (PR url, sha, branch, fallback path)
└── repo/                     foreign repo working tree (gitignored .git, gitignored entirely)
```

```
user: /adopt:start <url> [--preset steering-default|template-only|steering+baseline]
  └─ skill adopt-cycle (conductor)
      ├─ intake gate: list inputs/, ask which relevant
      ├─ git clone <url> adoptions/<slug>/repo/
      ├─ write adoption-state.md (phase=review, in_progress)
      ├─ /adopt:review → repo-adopter agent
      │    └─ writes review.md → AskUserQuestion(approve/revise/abort)
      ├─ /adopt:parity → repo-adopter agent + check-adoption-idempotency.ts
      │    └─ writes parity.md → AskUserQuestion
      ├─ /adopt:enrich → repo-adopter agent + check-adoption-parity.ts
      │    └─ writes files into repo/ + enrich-preview.md → AskUserQuestion
      └─ /adopt:push → conductor (Bash: git/gh)
           └─ branch + commit + push or patch fallback → push-record.md
```

### 3.1 Components

- **Skill** `adopt-cycle` — conductor; sequences phases; runs intake gate against `inputs/`; `AskUserQuestion` between phases.
- **Agent** `repo-adopter` — narrow tools (Read, Write, Edit, Glob, Grep, Bash for read-only git: `git status`, `git log`, `git ls-files`, `git diff`). Owns Review + Parity + Enrich. **Cannot push.**
- **Slash commands** `/adopt:start`, `/adopt:review`, `/adopt:parity`, `/adopt:enrich`, `/adopt:push`.
- **Scripts**
  - `scripts/check-adoption-parity.ts`
  - `scripts/check-adoption-idempotency.ts`
  - `scripts/lib/adoption-templates.ts` (preset → manifest, renderers)
- **Conductor (not agent)** handles `git push` and `gh pr create` — irreversible ops gated and outside agent surface (Constitution Article IX).

### 3.2 Boundaries

The track does not modify `specs/`, `discovery/`, `stock-taking/`, `scaffolding/`, or other adoption folders. It writes only into `adoptions/<slug>/repo/` (which is gitignored in this repo) and the adoption folder itself. Once a PR merges, the adoption folder may be deleted by the user.

### 3.3 Track taxonomy amendment

ADR-0026 froze the v1.0 track taxonomy. This track requires an amending ADR (proposed name `0027-add-repo-adoption-track.md`) that:
- Lists Repo Adoption as a v1.1 opt-in companion track.
- Documents intent and contrast with Stock-taking and Project Scaffolding.
- Records the locked decisions above.

Without that ADR landed first, this design cannot be implemented.

## 4. State machine and artifacts

### 4.1 `adoption-state.md` schema

```yaml
---
adoption_slug: <repo-slug>
upstream_url: <git-url>
upstream_default_branch: main
upstream_sha_at_clone: <sha>
adoption_branch: adopt/agentic-workflow
preset: steering-default | template-only | steering+baseline
phase: review | parity | enrich | push | done
phase_status: pending | in_progress | gate_blocked | completed
created_at: <iso>
last_updated: <iso>
push_mode: direct | patch-fallback
pr_url: <url-or-null>
---
```

### 4.2 Phase progression

```
clone → review (in_progress → completed → gate_blocked → completed)
       → parity (in_progress → completed → gate_blocked → completed)
       → enrich (in_progress → completed → gate_blocked → completed)
       → push   (in_progress → completed → done)
```

`phase_status` vocabulary (single source of truth, used in §4.1 schema, §3 flow, and §7 error handling):

| Value | Meaning |
|---|---|
| `pending` | Phase folder created, work not yet started. |
| `in_progress` | Agent or conductor actively producing the phase artifact. |
| `completed` | Artifact written, awaiting gate. |
| `gate_blocked` | Awaiting user response on `AskUserQuestion`. User can approve, request revision, or abort. |
| `done` | Terminal state for the `push` phase only. |

Replay (re-run a completed phase) is supported and idempotent. Skip-ahead is refused by the skill.

### 4.3 Per-phase artifacts

| File | Owner | Contents |
|---|---|---|
| `review.md` | repo-adopter | Repo signals: lang census, build tool, CI present, existing docs, license, README excerpts, package metadata, agentic-workflow markers detected. **No judgment.** |
| `parity.md` | repo-adopter | Gap table: required path → `present`/`missing`/`conflict`. Conflicts list paths skipped per Q7. |
| `enrich-preview.md` | repo-adopter | Index of files to be created with one-line purpose. Full content lives under `adoptions/<slug>/repo/` (working tree). |
| `push-record.md` | conductor | Branch sha, push timestamp, PR URL, fallback patch path if applicable. |

### 4.4 Slug derivation and uniqueness

`<owner>-<repo>` (lowercase, kebab) from a git URL. Local-path source: directory name, kebab-cased. Slug collision with an existing adoption folder triggers a conductor prompt: append `-2`, `-3`, … or abort.

### 4.5 Cleanup and gitignore

`adoptions/*/repo/` is gitignored — foreign code never lands in this repo's history. Phase artifacts (`*.md`) **are** committed; they are the auditable record of an adoption run.

## 5. Phase contracts

### 5.1 Review *(scan, no judgment)*

**Input:** `adoptions/<slug>/repo/` (already cloned).
**Agent:** `repo-adopter`.
**Output:** `review.md`.
**Detects:**
- Language(s) by file extension census.
- Build tool: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `Gemfile`, etc.
- CI: `.github/workflows/`, `.gitlab-ci.yml`, `.circleci/`.
- Docs: `README.md`, `docs/`, `CONTRIBUTING.md`, `LICENSE`.
- Existing agentic-workflow markers: `AGENTS.md`, `CLAUDE.md`, `.claude/`, `memory/constitution.md`, `.adopted`.
- Repo size + file count (sanity bound).

**Gate:** user approves, requests revision, or aborts. No mutation yet.

### 5.2 Parity *(diff against expected scaffold)*

**Input:** `review.md` + selected preset.
**Agent:** `repo-adopter`.
**Output:** `parity.md`.
**Computes:** for each required path in the preset's manifest, mark `present | missing | conflict`. A conflict = file exists with different content from the rendered version → skip and report (Q7).
**Pre-gate script:** `scripts/check-adoption-idempotency.ts` runs against `adoptions/<slug>/repo/.adopted`. If marker exists and `--refresh` was not passed, the parity phase fails fast with an actionable error.

**Gate:** user reviews gap list. Override knob: force-overwrite specific paths. Overrides are logged in `parity.md` itself for audit.

### 5.3 Enrich *(generate files into working tree)*

**Input:** `parity.md`.
**Agent:** `repo-adopter`.
**Output:** `enrich-preview.md` + actual files written under `adoptions/<slug>/repo/`.

**Generates per preset.** All presets: `AGENTS.md`, `CLAUDE.md`, `memory/constitution.md`, `.claude/agents/`, `.claude/skills/`, `.claude/commands/`, `.claude/settings.json` skeleton, `templates/`, `scripts/verify.ts` + minimum `scripts/lib/`, `docs/specorator.md`, `docs/branching.md`, empty `specs/`, `docs/adr/`, `docs/glossary/`, `inputs/`.

| Preset | Adds on top of base |
|---|---|
| `template-only` | (nothing extra) |
| `steering-default` (default) | `docs/steering/{product,tech,quality,operations,ux}.md` populated from review signals |
| `steering+baseline` | The above + `stock-taking/<repo-slug>/stock-taking-inventory.md` mechanically generated + first `specs/<repo-slug>-baseline/idea.md` |

**Validation:** `scripts/check-adoption-parity.ts` runs after generation — verifies all required files exist, frontmatter parses, internal links resolve. Failure rolls back the generated files in the working tree (no commit yet).

**Gate:** user reviews `enrich-preview.md` (file index) and may spot-check the working tree. Approves or sends back for revision.

### 5.4 Push

**Input:** approved enrichment in working tree.
**Owner:** conductor (not agent).

```
1. cd adoptions/<slug>/repo/
2. git checkout -b adopt/agentic-workflow
3. Write marker .adopted (template version + sha + preset) into the working tree.
4. git add <enriched paths from parity.md> AND .adopted
   (.adopted MUST be in the same commit so idempotency check works on re-runs)
5. git commit -m "feat: adopt agentic-workflow"  (body: template version + ADR refs)
6. git push -u origin adopt/agentic-workflow
   ├─ success → gh pr create --title "Adopt agentic-workflow" --body <generated>
   └─ permission denied → git format-patch HEAD~1 --output adoptions/<slug>/agentic-workflow.patch; instruct user
7. Write push-record.md (mode, sha, URL or patch path)
```

**Gate before push:** user approves PR body and branch name. Final human bar before any irreversible action.

## 6. Data flow and scripts

### 6.1 `scripts/lib/adoption-templates.ts`

Single source of truth for preset → required-files manifest:

```ts
type Preset = "template-only" | "steering-default" | "steering+baseline";

type ManifestEntry = {
  path: string;                          // path relative to foreign repo root
  source: "literal" | "render";
  literalFrom?: string;                  // path inside this repo (for literal copies)
  renderer?: string;                     // exported function name (for rendered files)
};

export const MANIFESTS: Record<Preset, ManifestEntry[]> = { /* ... */ };
```

Renderers are pure functions taking `review.md` signals → file content (e.g., `renderTechSteering(review)`). They live alongside the manifest in the same file or a sibling under `scripts/lib/adoption-renderers/`.

### 6.2 `scripts/check-adoption-parity.ts`

Given `adoptions/<slug>/`:

1. Load manifest for the preset.
2. Verify every manifest path exists under `repo/`.
3. Frontmatter parse on every generated `.md`.
4. Markdown link check (reuses `scripts/lib/markdown-links.ts`).
5. Exit non-zero with diagnostics on any failure.

### 6.3 `scripts/check-adoption-idempotency.ts`

Given an adoption folder:

1. Read `repo/.adopted` if present.
2. If absent → exit 0 (fresh adoption).
3. If present and `--refresh` flag set → exit 0; log existing version for the conductor to record.
4. If present and no `--refresh` → exit non-zero with message `Already adopted at <version> on <date>; rerun /adopt:start with --refresh to overwrite.`

### 6.4 Hook into `npm run verify`?

**No.** These scripts run only inside `/adopt:*` commands. Adding them to the verify gate would force every PR in this repo to scan adoption folders, wasting time. Adoption phase artifacts have their own gate.

### 6.5 `.adopted` marker schema

Generated under `repo/.adopted` (root of foreign repo, committed as part of the adopt commit):

```yaml
template: agentic-workflow
template_version: 0.6.0           # from this repo's package.json at generation time
template_sha: <git-sha-of-this-repo-at-generation>
preset: steering-default
adopted_at: 2026-05-03T12:34:56Z
adopted_from: <repo-slug>
```

Read by `check-adoption-idempotency.ts`. Future `/adopt:refresh` uses both `template_version` and `template_sha` to compute the upgrade diff.

## 7. Error handling

| Phase | Failure | Behavior |
|---|---|---|
| Clone | URL invalid / auth failure / private repo no key | Skill exits, no `adoptions/<slug>/` created. Suggest `gh auth login` or local-path mode. |
| Clone | Slug collision | Skill prompts: append suffix or abort. |
| Clone | Repo huge (>500 MB or >10k files; thresholds configurable) | Skill warns, asks confirm. Prevents accidental clone of monorepos. |
| Review | Cannot detect language | Continue; `review.md` records `lang: unknown`. User judgment in gate. |
| Parity | `.adopted` marker present, no `--refresh` | Idempotency script exits non-zero. Skill aborts with clear message. |
| Parity | Conflict count > N (default 5) | Skill warns "high conflict surface — consider per-file review". User confirms. |
| Enrich | `check-adoption-parity.ts` fails after generation | Skill rolls back generated files in working tree, reports diagnostics, returns to gate. No commit yet. |
| Enrich | Renderer crashes (e.g., malformed `package.json`) | Skill catches; logs which renderer failed; `enrich-preview.md` marks file as `render-failed`; user can retry or skip. |
| Push | `git push` rejected (no write access) | Conductor falls back to `git format-patch`. Records mode in `push-record.md`. |
| Push | `gh pr create` fails (no upstream PR API access) | Branch already pushed; conductor records branch URL + manual PR instructions. Does not retry. |
| Push | Network mid-push | Conductor reports partial state; retry on operator command, no auto-retry. |
| Any | User aborts mid-phase | State stays at last completed phase. `phase_status: gate_blocked` retained. Folder kept for resume. |

### 7.1 Constitution compliance

- **Article IX (Reversibility).** Push is the only irreversible step; gated explicitly. Patch fallback is reversible (file artifact). Clone is reversible (folder delete). Enrichment writes inside `adoptions/<slug>/repo/` which is gitignored in this repo — no contamination.
- **Article VI (Agent Specialisation).** `repo-adopter` agent has no Bash for write-side git ops. Push lives in conductor. Agent cannot accidentally publish.
- **Article VII (Human Oversight).** Every phase gate uses `AskUserQuestion`; preset selection is explicit at `/adopt:start`; PR body is shown before push.

### 7.2 Resumption

Re-running `/adopt:<phase>` re-enters that phase with prior artifacts. State machine refuses skip-ahead but allows replay (gate the user re-approves). Each conductor action is appended to `adoption-state.md` body section `## Log` with timestamp + phase + action.

## 8. Testing

### 8.1 Unit tests

| Test | Target |
|---|---|
| Manifest loader returns correct files per preset | `adoption-templates.ts` |
| Renderer outputs valid frontmatter for all steering files | each `render*` fn |
| Renderer handles missing fields gracefully (no README, no license) | renderers |
| `check-adoption-parity.ts` fails when required path missing | parity script |
| `check-adoption-parity.ts` fails on broken markdown links | parity script |
| `check-adoption-idempotency.ts` exits non-zero on existing `.adopted` | idempotency script |
| `check-adoption-idempotency.ts` exits zero with `--refresh` | idempotency script |
| Slug derivation: `https://github.com/foo/bar.git` → `foo-bar` | conductor lib |

Test runner = existing `scripts/test-scripts.ts`.

### 8.2 Integration (fixture-based)

Fixture repos under `scripts/fixtures/adoption/`:

- `empty/` — bare repo, README only.
- `node-app/` — `package.json` + Next.js layout.
- `python-lib/` — `pyproject.toml`.
- `partial-adoption/` — already has `AGENTS.md` (conflict path).
- `already-adopted/` — has `.adopted` marker (idempotency path).

Tests:

- Run `review → parity → enrich` against each fixture into a temp dir; assert generated tree matches a snapshot.
- `partial-adoption` fixture: assert `parity.md` lists `AGENTS.md` as `conflict`, `enrich-preview.md` skips it.
- `already-adopted` fixture: assert idempotency script blocks at parity gate.

### 8.3 Push not integration-tested in CI

No foreign-repo write happens in CI. Mocked: conductor has a dry-run flag emitting commands to stdout instead of executing; tested by string match.

### 8.4 Constitution gates in tests

- Article V (Traceability): every adoption folder must have valid frontmatter on every artifact + `adoption-state.md` parseable. Tested by fixture run.
- Article VIII (Plain Language): rendered steering files are markdown only, no JSON dumps. Linted.

### 8.5 Documentation tests

- `scripts/check-script-docs.ts` enforces docs for new scripts.
- `scripts/check-command-docs.ts` enforces docs for `/adopt:*` commands.
- `scripts/check-agents.ts` enforces `repo-adopter` agent has README + frontmatter.
- ADR check: `0027-add-repo-adoption-track.md` must exist and be linked from the index before merge.

### 8.6 Manual end-to-end test plan (for v1 release)

1. Adopt a small public repo the user owns (write access available).
2. Verify the PR opens with the expected file set.
3. Merge the PR.
4. In the adopted repo, run `npm install && npm run verify` → should pass.
5. Run `/spec:start example-feature` in the adopted repo → workflow should function end-to-end.
6. Re-run `/adopt:start <same-url>` → idempotency blocks.
7. Re-run with `--refresh` → succeeds, generates a new PR.

## 9. Out of scope (v1)

The following are deferred and may become later ADRs:

- **Drift detection** (Q8 D). No "this adoption is N versions behind template" check.
- **Bi-directional sync.** Adoption is one-way push; we never pull foreign-repo changes back.
- **Fork-PR mode** (Q5 B). Cross-fork PRs for repos the user lacks write on. Patch fallback covers most cases.
- **Multi-PR phase split** (A2 from brainstorming). Single PR per adoption.
- **Auto-extract `inputs/` archives.** Pipeline reads source material per the existing `inputs/` contract; never extracts zips.
- **Custom presets beyond the three.** No user-defined manifest in v1. Editing `adoption-templates.ts` is the escape hatch.
- **Adoption of monorepos with sub-projects.** Pipeline treats foreign repo as one root. Adopting `packages/foo/` only is not supported.
- **Non-git VCS.** SVN, Mercurial, etc. not supported.
- **Non-GitHub remotes for `gh pr create`.** GitLab/Bitbucket get patch fallback in v1.
- **Adoption refresh mid-merge.** Re-running before previous PR merges is undefined; documented as "wait for merge first".

## 10. Open questions for spec phase

These are intentionally not decided now; they are the spec author's job:

1. **Template version pinning.** The `.adopted` marker records both `template_version` and `template_sha`; spec must define which drives the refresh diff strategy when they conflict.
2. **Steering renderers for unfamiliar stacks.** How many language-specific renderers ship in v1 (Node, Python, generic) vs one generic with placeholders?
3. **License of generated content.** Files installed into the foreign repo carry this template's license. MIT-permissive likely fine; spec phase confirms and documents.
4. **Constitution copy.** Foreign repo gets `memory/constitution.md` verbatim or a "starter constitution" the adopter customises? Existing template ships customisable; carry that.
5. **`repo-adopter` agent tool list — enforcement, not redebate.** §3.1 already enumerates the proposed surface (Read, Write, Edit, Glob, Grep, Bash with allowlist `git status`, `git log`, `git ls-files`, `git diff` only). Spec phase ratifies that list and decides the *enforcement mechanism* — `.claude/agents/repo-adopter.md` frontmatter, `settings.json` deny rules, or both — not whether to allow more verbs.
6. **PR body template.** Where stored, what fields. Likely `templates/adoption-pr-body.md`.
7. **CI in adopted repo.** Does enrichment install `.github/workflows/verify.yml` ported from this repo? Lean toward yes (verify-only workflow) but confirm.
8. **Telemetry.** None for v1. Track in retrospective whether adoption metrics are worth collecting.
9. **ADR-0027 sequencing relative to implementation PR.** The amending ADR must land before code, but the spec phase must decide: separate predecessor PR (ADR merges first, implementation follows) or bundled PR (ADR + scaffolding + agent + scripts in one)? Predecessor PR is the conservative reading of ADR governance; bundling is faster but couples policy approval to implementation review.

## 11. Explicit non-goals

- Replacing Discovery, Stock-taking, or Project Scaffolding tracks.
- Becoming a CLI installer like `npx create-agentic-workflow` (different distribution channel; could exist alongside).
- Migrating spec content from a foreign repo's existing artifacts. Adopter-led work.

## 12. References

- [`memory/constitution.md`](../../../memory/constitution.md) — governing principles.
- [`docs/specorator.md`](../../specorator.md) — full workflow definition.
- [ADR-0026](../../adr/0026-freeze-v1-workflow-track-taxonomy.md) — frozen v1.0 track taxonomy (to be amended).
- [`docs/stock-taking-track.md`](../../stock-taking-track.md) — sister track.
- [`docs/project-scaffolding-track.md`](../../project-scaffolding-track.md) — sister track.
- [`docs/inputs-ingestion.md`](../../inputs-ingestion.md) — intake contract every conductor honours.
- [`.claude/skills/_shared/conductor-pattern.md`](../../../.claude/skills/_shared/conductor-pattern.md) — shared scaffolding for conductor skills.
