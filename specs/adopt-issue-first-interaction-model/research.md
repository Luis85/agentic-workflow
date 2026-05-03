---
id: RESEARCH-IFI-001
title: Adopt issue-first interaction model
stage: research
feature: adopt-issue-first-interaction-model
status: complete
owner: analyst
inputs:
  - IDEA-IFI-001
created: 2026-05-03
updated: 2026-05-03
---

# Research — Adopt issue-first interaction model

## Research questions

| ID | Question | Status |
|---|---|---|
| Q1 | Prior art: how do GitHub-native workflow tools handle issue-body state mirrors without drift? | answered |
| Q2 | `gh` auth fallback: safest strategy when `gh` is unavailable or unauthenticated in shell scripts | answered |
| Q3 | Slug-collision at scale: sufficiency of "silent resume on `issue:` match, prompt on mismatch" | answered |
| Q4 | GitHub YAML form schema stability across the rendering engine and GitHub Enterprise Server | answered |

---

## Market / ecosystem

What follows is a survey of tools that address the same problem space — surfacing workflow state inside GitHub issues — and prior art for the sub-problems identified in Q1–Q4.

| Solution | Approach | Strengths | Weaknesses | Source |
|---|---|---|---|---|
| **Zenhub** | External service; bidirectional webhook sync between Zenhub pipeline state and GitHub issue labels/columns | Rich pipeline UI; no issue-body edits needed | Race condition documented: concurrent webhook events from multiple repos can cause silent skips, leaving issue state stale. External server dependency. | [Zenhub sync](https://support.zenhub.com/article/git-hub-issue-sync), [Zenhub Enterprise releases](https://github.com/zenhubHQ/zenhub-enterprise/releases) |
| **Linear** | External service; bidirectional issue sync via webhook + REST; does not write to GitHub issue body | Fast UI; keyboard-driven; stable sync model | Requires continuous back-and-forth between two platforms; does not produce a GitHub-native audit trail in the issue body | [Linear GitHub integration](https://linear.app/integrations/github), [Linear GitHub Issues Sync changelog](https://linear.app/changelog/2023-12-14-github-issues-sync) |
| **Release Please** | Maintains a single "Release PR" whose body is rewritten on every push; PR body = mirror of accumulated changelog | No external server; deterministic; PR body is the mirror | Race condition: if a release PR merges before the release tag is created, a duplicate release PR can be opened. Stale PR body is a known failure mode when two concurrent workflows both attempt to update the PR | [release-please](https://github.com/googleapis/release-please), [Issue #1208](https://github.com/googleapis/release-please/issues/1208) |
| **GitHub spec-kit** | Issue-centric spec workflow where the issue title and ticket ID are used to derive branch slug; collision handled by ticket-prefix disambiguation and user prompt | Issue number as disambiguation key eliminates most collisions; prompt on ambiguity | Requires maintaining a configured branching strategy per team | [spec-kit AGENTS.md](https://github.com/github/spec-kit/blob/main/AGENTS.md), [spec-kit Issue #2047](https://github.com/github/spec-kit/issues/2047) |
| **peter-murray/issue-forms-body-parser** | GitHub Action that reads the issue body rendered by GitHub's form engine (`### ` h3 headers as delimiters) and outputs JSON | De facto standard approach; multiple independent implementations with same h3-delimiter convention | Format is not versioned; the h3-header convention is implicit. No formal stability guarantee from GitHub; user edits to the issue body after submission can break parsing | [peter-murray/issue-forms-body-parser](https://github.com/peter-murray/issue-forms-body-parser), [zentered/issue-forms-body-parser](https://github.com/zentered/issue-forms-body-parser), [issue-ops/parser](https://github.com/issue-ops/parser) |
| **Codeless Contributions / issue-ops pattern** | Use issue forms + GitHub Actions triggered on `issues: [opened, edited]`; parse h3-delimited body; automate downstream steps | Purely GitHub-native; no external service needed | Same parsing fragility; relies on user not editing the form-generated body | [Stefan Buck - Codeless Contributions](https://stefanbuck.com/blog/codeless-contributions-with-github-issue-forms) |

### Key ecosystem finding

No tool surveyed writes a live "state mirror" block directly into the GitHub issue body as a canonical summary; instead, they use either (a) separate comments, (b) labels, or (c) an external dashboard. The Specorator design's choice to write a sentinel block directly into the issue body is novel and creates its own risks — see Risks section.

---

## User needs

No primary user research was conducted for this feature. The following assumptions and proxy signals are explicit:

- **Proxy signal 1 — GitHub issue as intent record.** The idea.md problem statement documents that workflow intent today lives only in chat transcripts. GitHub issues are where users already capture feature ideas before they open a Specorator workflow (source: idea.md, issue #274 brief).
- **Proxy signal 2 — Single-command handoff.** Developers using Linear, Zenhub, and similar tools expect to transition from an issue directly into a development workflow without re-entering context. The existence of multiple tool categories trying to solve this confirms the need (source: ecosystem survey above).
- **Proxy signal 3 — Small-team scale.** The identified target population is solo builders and teams of fewer than 10 engineers (source: idea.md Target Users; `docs/specorator-product/product.md`). Tooling for this cohort favours low ceremony, local-first, no external services.

**Assumptions that must hold and will need validation:**

- A.1: Users who open GitHub issues before starting a Specorator workflow already open the issue before running `/spec:start`. If a significant portion of users run `/spec:start` first and then open an issue retroactively, the issue-first framing degrades to an optional enrichment step rather than a gate.
- A.2: Users are willing to use a YAML issue form template rather than free-form `.md` templates. If most users prefer plain `.md` templates, the structured parsing approach fails.
- A.3: The sentiment block in the issue body is primarily read by contributors, not automated tools. If downstream tooling tries to parse the mirror block it may break on format changes.

---

## Q1 — Prior art: issue-body state mirror and drift

### How existing tools approach the mirror problem

Release Please is the most direct analogue. It maintains a single PR whose body is kept up-to-date by rewriting it on every qualifying push. The key insight from Release Please's architecture is: **the mirror's update must be idempotent and atomic**. The documented failure mode (issue #1208) is a race condition between two concurrent workflow runs both attempting to update the PR body at the same moment. Release Please addresses this with a lock mechanism on the release PR; without a lock, two concurrent stage completions could produce overlapping `gh issue edit` calls that each fetch-then-overwrite the body, with the last writer winning.

Zenhub's equivalent failure mode (silently skipped sync on concurrent webhook events from multiple repos) shows that even enterprise-grade tools encounter this. Zenhub Enterprise patched it but the fix required server-side deduplication logic.

### The sentinel-block approach

The proposed design uses HTML comment delimiters (`<!-- specorator-state:begin -->` / `<!-- specorator-state:end -->`) to mark the mirror block so it can be located and replaced idempotently. This is a common pattern in CI tools that write back to issue/PR bodies (e.g., coverage reporters, plan outputs in Terraform CI). The approach is sound provided the script:

1. Fetches the current body before editing (read-then-write, not blind overwrite).
2. Replaces only the delimited block, leaving user-authored content above/below it untouched.
3. Fails loudly if the delimiters are absent or duplicated.

**Documented failure modes of the sentinel-block approach:**

- **Drift by user edit.** If the user edits the issue body and accidentally removes or duplicates the sentinel delimiters, subsequent `sync-issue-mirror.sh` runs will fail or corrupt the body. Mitigation: fail loudly with an actionable error rather than silently corrupting.
- **Drift by GitHub rendering.** GitHub's Markdown renderer occasionally normalises whitespace or HTML comment structure on save. Mitigation: treat sentinel delimiters as block-level markers (not inline), separated by blank lines.
- **Concurrent stage completions.** If two `/spec:*` commands are dispatched in rapid succession (unusual but possible in agent-driven runs), two `sync-issue-mirror.sh` processes can race on the GitHub API. At 1,000 GITHUB_TOKEN requests per hour per repository, the likelihood of hitting a rate limit is low for small teams, but the race window is real. Mitigation: no distributed lock is required for v1 given the small-team scope; the last writer wins, which is acceptable because the state is append-monotonic (stages only advance). Document the limitation.

---

## Q2 — `gh` auth fallback strategy

### Current `gh` authentication model

The `gh` CLI accepts authentication via:
1. `GH_TOKEN` environment variable (highest precedence; recommended for CI/headless use).
2. `GITHUB_TOKEN` environment variable (second precedence; automatically set in GitHub Actions runs).
3. Stored credentials from `gh auth login` (lowest precedence; interactive only).

Setting `GH_TOKEN` or `GITHUB_TOKEN` suppresses the interactive auth prompt and is the canonical approach for automation (source: [gh help environment](https://cli.github.com/manual/gh_help_environment)).

### Known bug with `gh auth status`

`gh auth status` returned exit code 0 even when not authenticated (documented in [cli/cli#8845](https://github.com/cli/cli/issues/8845), version 2.42.1). This was fixed via PR #9240, but the bug illustrates that shell scripts should not rely solely on `gh auth status` as an authentication guard. **The correct pattern is to attempt the operation and capture the non-zero exit from the failing `gh issue edit` call itself.**

### Recommended strategy for `sync-issue-mirror.sh`

Based on the above, the safest strategy for a shell script calling `gh issue edit` is:

1. **Prerequisite check (fast path):** Verify `gh` is installed (`command -v gh`). If absent, emit a warning to stderr and exit 0 (non-fatal, feature degrades gracefully to local-only state in `workflow-state.md`). Do not abort the calling `/spec:*` stage.
2. **Token detection:** Check whether `GH_TOKEN` or `GITHUB_TOKEN` is set in the environment. If neither is set and the caller is not in a GitHub Actions context (`GITHUB_ACTIONS` env var not set), emit a warning and skip the network call. If in a GitHub Actions context without a token, this is a configuration error — fail loudly.
3. **Attempt and capture exit code:** Run `gh issue edit ...`. On a non-zero exit, emit a structured warning to stderr including the issue number and the error message from `gh`. Do not propagate the failure to the calling stage's exit code. This makes the mirror sync a best-effort enhancement, not a blocking dependency.
4. **Never silently succeed when the body was not updated.** Log whether the update succeeded or was skipped so the operator can diagnose.

### Internal prior art in Specorator

No existing script in the Specorator codebase currently calls `gh` directly (scripts use TypeScript via `tsx` for automation). The new `sync-issue-mirror.sh` and `bootstrap-labels.sh` would be the first `gh`-dependent scripts. This means there is no internal prior art to align with; the project can set the convention from scratch. The codebase's stance (from `docs/specorator-product/tech.md`) is that scripts should be "deterministic and read-only unless explicitly named `fix:*`" — `sync-issue-mirror.sh` is a write operation but is idempotent, which satisfies the spirit of the convention.

---

## Q3 — Slug collision at scale

### How other tools handle it

The GitHub spec-kit configurable branching strategy (documented in [spec-kit issue #2047](https://github.com/github/spec-kit/issues/2047)) resolves the identical-slug scenario by using the **issue number as a disambiguation key**:

- If two issues produce the same slug (e.g., both titled "Fix login bug"), the resulting branches are `fix-login-bug-42` and `fix-login-bug-99` (issue number appended).
- If the spec directory already exists and its `workflow-state.md` `issue:` field matches the invoking issue number, the workflow silently resumes.
- If the `issue:` field does not match, the user is prompted to confirm a rename or create a new slug.

The general best-practice for branch naming (established across GitHub, Atlassian, and similar platforms) is the pattern `<type>/<issue-id>-<description>`, e.g., `feature/274-adopt-issue-first-interaction-model`. The issue number is the primary disambiguation key; the slug is human-readability sugar.

### Is the proposed "silent resume / prompt on mismatch" rule sufficient?

For a team of fewer than 10 engineers with a single repository, the proposed rule is sufficient with one clarification: **the default slug derivation should incorporate the issue number as a suffix when a collision is detected at derivation time**, not only at resume time. This avoids the mismatch scenario entirely:

- Input: issue #274 titled "Fix login bug" → derived slug: `fix-login-bug-274`
- Input: issue #301 titled "Fix login bug" → derived slug: `fix-login-bug-301`

Both slugs are unique without requiring collision detection at runtime. The "silent resume on `issue:` match" rule then becomes a correctness check rather than a disambiguation mechanism.

**Residual risk:** A user who renames the issue title after running `/spec:start` will find that the slug in `workflow-state.md` no longer matches the issue title. This is expected and acceptable — the slug is set at workflow start and does not need to track title changes. Document this explicitly.

---

## Q4 — GitHub YAML form schema stability

### Schema status

GitHub's form schema is documented as "currently in public preview and subject to change" on [github.com](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema). On GitHub Enterprise Server 3.11, the schema retains the "beta" label.

### Supported field types (github.com and GHES 3.13+)

| Type | github.com | GHES 3.11 | GHES 3.9–3.10 (EOL) |
|---|---|---|---|
| `markdown` | yes | yes | yes |
| `textarea` | yes | yes | yes |
| `input` | yes | yes | yes |
| `dropdown` | yes | yes | yes |
| `checkboxes` | yes | yes | yes |
| `upload` | yes | not documented in 3.11 | not available |

The `upload` field type is present on github.com but absent from GHES 3.11 documentation, indicating a lag in feature parity. For Specorator's templates (`spec-feature.yml`, `spec-bug.yml`, `spec-spike.yml`), `upload` is not required; the templates use only `textarea`, `input`, `dropdown`, and `checkboxes`, which are universally supported from GHES 3.9 onward.

### Rendered body format

When a user submits an issue form, each field's label becomes an h3 heading (`### `) and the user's response appears below it as plain text. This is the de facto standard relied upon by all major parsers (peter-murray, zentered, issue-ops). The format has been stable since issue forms were introduced (2021) and there are no documented breaking changes to the rendered body format. However, it is not covered by a formal versioning contract from GitHub.

**Parsing approach for `/spec:start`:** The implementation should parse the rendered body using the h3-delimiter convention (identical to the ecosystem parsers) rather than attempting to re-parse raw YAML. This is more resilient to form schema changes that might alter field ordering or property names.

### Known validation edge cases

- `required` validation is only enforced on **public repositories** for both github.com and GHES (documented in GHES 3.11 docs). Teams using private repos must not rely on `required: true` for enforcement — the script must validate after the fact.
- Dropdown `options` must be non-empty and distinct. Violations produce a validation error at template load time, not at submission time.
- Custom regex validation is not natively supported in GitHub's form schema.

---

## Alternatives considered

### Alternative A — Issue body as canonical input, replacing `specs/` (rejected)

**Description:** The issue body becomes the single source of truth. No `specs/<slug>/` directory is created. All workflow state lives in the issue body fields and comments.

**Pros:** Maximum GitHub nativeness; no file system artefacts to manage; state is always visible in GitHub UI.

**Cons:** The issue body is editable by anyone with access; there is no file-level traceability, no ability to use `git log` on spec evolution, no support for the EARS-notation requirements file format, and no integration with the existing quality gates. The 11-stage workflow's artifact schema (requirements.md, spec.md, etc.) cannot be collapsed into GitHub issue fields without a complete redesign of every specialist agent. The idea.md explicitly lists this as out of scope and architecturally breaking.

**Verdict — correctly rejected.** The issue body cannot replace `specs/` without dismantling Specorator's constitution (Article I, II, V). Even if technically feasible, it would decouple the workflow from its quality gates.

---

### Alternative B — Webhook / GitHub App on label changes to trigger stage transitions (rejected for v1)

**Description:** A server-side GitHub App (or webhook endpoint) listens for label change events. When a `status:` label transitions, the App calls the appropriate `/spec:*` command, updating `workflow-state.md` automatically.

**Pros:** Fully event-driven; no manual command invocation required; enables true CI/CD integration for the workflow itself.

**Cons:** Requires server infrastructure or a hosted GitHub App, contradicting Specorator's non-goal of remaining purely file-based and local. Zenhub's documented race condition (concurrent webhook events from multiple repos silently skipped) shows webhook reliability is non-trivial. Security: a webhook listener requires a secret, a public endpoint, and an IAM model — all absent from the current architecture. ADR-0026 freezes the track taxonomy; a daemon-based track would require a new ADR.

**Verdict — correctly rejected for v1.** The scope note in idea.md ("No webhook or daemon on label changes in v1") is justified. This is a natural v2 extension after the additive layer is proven stable.

**Counter-evidence considered:** GitHub Actions `on: issues` triggers (no external server needed) could simulate a lightweight webhook. However, Actions triggers on issue label events require `issues: write` permissions and introduce CI minutes usage for every label change — even routine triage labels. The noise-to-signal ratio is high for a small team. Deferred.

---

### Alternative C — Single mega-template (all types in one `.yml`) (rejected)

**Description:** One `spec.yml` issue template handles spec features, bug reports, and spikes with a `type:` dropdown at the top to switch context.

**Pros:** Single file to maintain; users do not need to choose the right template.

**Cons:** A single form with a `type:` field at the top cannot conditionally show/hide field sets — GitHub's form schema has no conditional rendering. The result is a long form with many fields that do not apply to the selected type. Users must scroll past irrelevant fields. Parsing logic must branch on the `type:` value to interpret remaining fields differently, coupling the parser to the form's field layout. Three separate templates (`spec-feature.yml`, `spec-bug.yml`, `spec-spike.yml`) are cleaner, more legible, and independently evolvable.

**Verdict — correctly rejected.** GitHub issue forms do not support conditional field rendering. A mega-template cannot produce the same user experience as type-specific templates without frontend JavaScript support, which is not available in the GitHub issues UI.

---

### Alternative D — Issue number as primary slug (new alternative surfaced)

**Description:** Instead of deriving a human-readable slug from the issue title, use the issue number directly as the primary identifier: `specs/274/` rather than `specs/fix-login-bug-274/`.

**Pros:** Zero collision risk; slug derivation is trivial; no regex needed for sanitisation.

**Cons:** `specs/274/` is opaque — contributors cannot identify the feature at a glance from the directory name. All existing Specorator conventions use human-readable kebab-case slugs (e.g., `specs/adopt-issue-first-interaction-model/`). Switching to numeric-only slugs would break all cross-references in docs, AGENTS.md examples, and the quality framework.

**Verdict — not recommended.** Human readability is a first-class concern in Specorator (constitution, Article VIII). The issue number should serve as a tiebreaker suffix, not replace the human-readable slug. The hybrid approach (slug derived from title + issue number appended on collision) is superior.

---

## Technical considerations

- **GitHub Actions `GITHUB_TOKEN` rate limit:** 1,000 requests per hour per repository (compared to 5,000 for PATs). For a `sync-issue-mirror.sh` that makes one `gh issue edit` call per `/spec:*` command, and given 11 stages, the maximum burst is 11 calls per workflow run. This is negligible even on GITHUB_TOKEN. Rate limits are not a material risk for the intended usage pattern.

- **CI secrets for `sync-labels.yml`:** Label sync via a GitHub Actions workflow requires `issues: write` permission on the `GITHUB_TOKEN`. The default Actions token grants this when `permissions: issues: write` is explicitly declared in the workflow. No PAT or additional secret is required, which avoids secret management overhead.

- **`bootstrap-labels.sh` vs. pure Actions approach:** The bootstrap script runs locally and requires `gh` installed and authenticated with at least `repo` scope. This is appropriate for a one-time setup step. The ongoing `sync-labels.yml` Actions workflow handles idempotent label reconciliation without any local prerequisite.

- **GHES compatibility:** The three issue form field types used by the proposed templates (textarea, input, dropdown, checkboxes) are present in all supported GHES versions (3.9–3.17). The schema's "beta" label on GHES 3.11 means breaking changes are theoretically possible, but the core four types have been stable since 2021.

- **Rendered body parsing fragility:** Because the h3-delimiter format is implicit (not formally versioned by GitHub), the parsing logic in `/spec:start` should be isolated in a single parsing function/module. If GitHub changes the rendered format, only one place needs updating.

- **Draft PR as placeholder:** Creating a draft PR from `/spec:start` requires `pull-requests: write` permission on the GitHub Actions token (or `gh auth` with `repo` scope locally). This is separate from the `issues: write` scope and must be declared explicitly in any CI workflow that calls the start command.

- **Worktree creation:** The `specs/<slug>/` scaffold and Git worktree creation are local operations that do not touch GitHub. They succeed regardless of `gh` availability, making the local workflow robust to network failure.

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-IFI-001 | Mirror drift from user editing the issue body and removing/duplicating sentinel delimiters | med | med | `sync-issue-mirror.sh` validates sentinel presence before writing. On missing or duplicate delimiters, the script emits a named error with instructions to restore the delimiters, then exits 0 (non-fatal to the stage). Document the sentinel in `docs/issue-first-interaction.md`. |
| RISK-IFI-002 | GitHub form schema rendered body format changes (h3-delimiter convention) breaking the `/spec:start` parser | med | low | Isolate parsing logic in a single function. Pin the parsing convention in an ADR so any future change is deliberate. Ecosystem adoption of the h3 convention (4+ independent parsers) makes a breaking change by GitHub unlikely but not impossible. |
| RISK-IFI-003 | `gh` not installed or not authenticated; `sync-issue-mirror.sh` silently corrupts state | high | low | Fail loud with a named error on auth failure (non-fatal to the stage). Emit a structured warning to stderr. Never write a partial update. See Q2 recommendation. |
| RISK-IFI-004 | `required: true` on form fields not enforced on private repos; malformed issue body reaches `/spec:start` | high | med | `/spec:start` validates parsed fields before scaffolding. On validation failure, print actionable errors and abort with a non-zero exit code. Do not silently scaffold a half-populated feature. |
| RISK-IFI-005 | Race condition: two concurrent `/spec:*` completions both call `sync-issue-mirror.sh`, last writer wins with stale intermediate state | low | low | Acceptable for v1 (small-team scope; stages are append-monotonic). Document as known limitation. If contention becomes a problem in v2, introduce a lightweight lock file under `specs/<slug>/`. |
| RISK-IFI-006 | Label sync CI workflow requires `issues: write` — overly broad if org policy restricts default token permissions | med | med | Declare `permissions: issues: write` explicitly in `sync-labels.yml`. In org contexts where GITHUB_TOKEN lacks this permission by default, document that a PAT or GitHub App token must be substituted in `.github/workflows/sync-labels.yml`. |
| RISK-IFI-007 | GHES adopters on older versions encounter missing `upload` field type if templates use it | low | low | Do not use `upload` in any of the three issue form templates. Restrict to textarea/input/dropdown/checkboxes, which are universally available from GHES 3.9+. |
| RISK-IFI-008 | Issue title changes after `/spec:start` create a disconnect between the human-readable slug and the issue title | low | high | Expected and acceptable. Document in `docs/issue-first-interaction.md` that the slug is set at workflow start and does not track title renames. The `issue: <n>` frontmatter field in `workflow-state.md` remains the authoritative link. |
| RISK-IFI-009 | GitHub form schema's "public preview / beta" status means GitHub can change field rendering without notice | med | low | Monitor GitHub changelog. The core four field types (textarea, input, dropdown, checkboxes) have been stable since 2021 with no documented rendering breaks. Accept residual risk for v1. |
| RISK-IFI-010 | `bootstrap-labels.sh` run multiple times creates duplicate labels rather than idempotently reconciling | med | med | `bootstrap-labels.sh` must check for label existence before creation (`gh label list --json name`). Prefer `gh label edit` to update colour/description on existing labels rather than deleting and recreating. Provide a `--dry-run` flag. |

---

## Recommendation

**Proceed with the issue-first interaction model as designed.** No evidence found contradicts the core design; the rejected alternatives (A, B, C) remain correctly rejected. The research surfaces one design refinement and no blocking blockers.

### Design refinement to carry into Requirements

**Slug derivation should incorporate the issue number as a collision-avoidance suffix by default**, not only as a fallback. The recommended slug scheme is:

```
<title-slug>-<issue-number>
```

e.g., issue #274 titled "Adopt issue-first interaction model" → `adopt-issue-first-interaction-model-274`.

This eliminates the slug-collision detection path entirely (Q3). The "silent resume on `issue:` match" rule is still needed as a correctness guard for re-invoking `/spec:start` on an already-started feature.

If the team prefers shorter slugs and collision avoidance via the match-then-prompt rule, both approaches are valid — the PM should decide in Requirements. This research recommends the number-suffix approach as lower complexity.

### Key findings for the PM and architect

1. **Mirror sync must be non-fatal.** The sentinel-block update is best-effort; it must never block a stage from completing. Fail loud but exit 0 on `gh` auth failures or missing delimiters.
2. **No lock needed for v1.** The race condition risk (RISK-IFI-005) is acceptable for small teams with the understanding that stages only advance monotonically.
3. **Private repo `required` validation is client-side only.** The `/spec:start` implementation must validate the parsed issue body fields before scaffolding — it cannot rely on GitHub's form validation.
4. **GHES compatibility is achieved by avoiding `upload` field type.** The three templates should use only the four universally-available field types.
5. **`GITHUB_TOKEN` rate limits are not a concern** for the intended usage pattern (at most 11 `gh issue edit` calls per full workflow run, vs. 1,000/hour limit).
6. **An ADR is required before Design stage** (already captured in idea.md as a constraint). The architectural decision covers: sentinel-block as mirror mechanism, non-fatal sync, and the `issue:` frontmatter field.

---

## Sources

- GitHub form schema (github.com) — https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema
- GitHub form schema (GHES 3.11) — https://docs.github.com/en/enterprise-server@3.11/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema
- Syntax for issue forms (github.com) — https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms
- gh CLI environment variables — https://cli.github.com/manual/gh_help_environment
- `gh auth status` exit code bug — https://github.com/cli/cli/issues/8845
- GITHUB_TOKEN rate limits — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Controlling GITHUB_TOKEN permissions — https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token
- peter-murray/issue-forms-body-parser — https://github.com/peter-murray/issue-forms-body-parser
- zentered/issue-forms-body-parser — https://github.com/zentered/issue-forms-body-parser
- issue-ops/parser — https://github.com/issue-ops/parser
- Stefan Buck — Codeless Contributions with GitHub Issue Forms — https://stefanbuck.com/blog/codeless-contributions-with-github-issue-forms
- Linear GitHub integration — https://linear.app/integrations/github
- Linear GitHub Issues Sync changelog — https://linear.app/changelog/2023-12-14-github-issues-sync
- Linear sync improvements Nov 2024 — https://linear.app/changelog/2024-11-13-improvements-for-slas-templates-and-jira-and-github-issues-sync
- Zenhub GitHub Issue Sync — https://support.zenhub.com/article/git-hub-issue-sync
- Zenhub Enterprise releases — https://github.com/zenhubHQ/zenhub-enterprise/releases
- googleapis/release-please — https://github.com/googleapis/release-please
- release-please race condition issue #1208 — https://github.com/googleapis/release-please/issues/1208
- GitHub spec-kit AGENTS.md — https://github.com/github/spec-kit/blob/main/AGENTS.md
- GitHub spec-kit configurable branching strategy issue #2047 — https://github.com/github/spec-kit/issues/2047
- GitHub Actions label sync — https://github.com/marketplace/actions/label-sync
- Evolving GitHub Issues public preview Jan 2025 — https://github.blog/changelog/2025-01-13-evolving-github-issues-public-preview/
- New GitHub preview terminology Oct 2024 — https://github.blog/changelog/2024-10-18-new-terminology-for-github-previews/

---

## Quality gate

- [x] Each research question is answered or marked open.
- [x] Sources cited.
- [x] >= 2 alternatives explored (four alternatives considered, three from idea.md verified, one new surfaced).
- [x] User needs supported by evidence (proxy signals and explicit assumptions stated).
- [x] Technical considerations noted.
- [x] Risks listed with severity, likelihood, and mitigation.
- [x] Recommendation made.
