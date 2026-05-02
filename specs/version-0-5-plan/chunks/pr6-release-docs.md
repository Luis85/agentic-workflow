# PR 6 — Release operator guide + public distribution docs

Tasks: T-V05-008, T-V05-009
Issue: #90

## T-V05-008 — Add release operator guide

Owner: release-manager | Estimate: M | Depends on: T-V05-006 ✅ (PR #159), T-V05-007 ✅ (PR #160)

The runnable, version-by-version operator path consumed before every publish from v0.5 onward. Documents for a maintainer who has not authored the release: dry run, authorization, publish, rollback, failed publish recovery, post-release cleanup. Page lives at `docs/release-operator-guide.md`; the lifecycle Stage 10 `release-readiness-guide.md` (whether to ship) and this guide (how to ship) become complementary.

### Surface

- `docs/release-operator-guide.md` — new page. Eleven sections: audience + authorization boundary; pre-conditions; the five `workflow_dispatch` inputs (`version`, `dry_run`, `prerelease`, `draft`, `confirm`, `publish_package`) explained against the env-mapping discipline (no `${{ inputs.* }}` in `run:`); pre-flight Layer 1 readiness, locally; dry-run path; stable publish path; rollback rules; failed-publish recovery (six numbered scenarios); post-release cleanup; quick-reference command bundle; diagnostic-code reference covering both `RELEASE_READINESS_*` (Layer 1) and `RELEASE_PKG_*` (Layer 2); references back to ADR-0020, ADR-0021, branching, package-contract, and the lifecycle readiness guide.
- `docs/release-readiness-guide.md` — cross-link added pointing at the operator guide so the two release-stage docs reference each other.

### Content rules

- Every named input, env var, and diagnostic code is sourced verbatim from `release.yml`, `scripts/lib/release-readiness.ts`, or `scripts/lib/release-package-contract.ts` so the page does not drift from the wired surface.
- Rollback table is forward-only — supersession via `npm deprecate` and `vX.Y.(Z+1)`. Force-push to `main` and tag deletion stay denied per `.claude/settings.json`. The catastrophic-only `npm unpublish` row names that path explicitly so it is not used for ordinary mistakes.
- Failed-publish recovery numbered §7.1 through §7.6 mirrors the workflow's actual gates: §7.1 `npm publish` after partial run (idempotent rerun via `npm view`), §7.2 missing tag (`--verify-tag`), §7.3 Layer 1 diagnostic, §7.4 Layer 2 fresh-surface diagnostic, §7.5 confirm-gate refusal, §7.6 last-resort `RELEASE_QUALITY_WAIVER` with the "explicit waiver recorded" rule from REQ-V05-010 acceptance.
- Post-release cleanup steps are concrete (`git push origin --delete release/vX.Y.Z`, log entry shape, `/spec:retro` trigger) so the guide is runnable.

### Satisfies

REQ-V05-008, REQ-V05-010, REQ-V05-011, NFR-V05-004, NFR-V05-005, SPEC-V05-006, SPEC-V05-008, SPEC-V05-009.

## T-V05-009 — Update public distribution docs

Owner: release-manager | Estimate: M | Depends on: T-V05-006 ✅ (PR #159), T-V05-007 ✅ (PR #160), T-V05-008 (above)

Update README, `docs/specorator.md`, the docs entry-point pointers, the artifact catalogue, and the product page so public surfaces accurately describe v0.5's GitHub Releases + GitHub Packages distribution. REQ-V05-009 is event-driven: the surfaces are updated *because* v0.5 introduces the distribution. Additive only — no rewriting of upstream voice.

### Surface

- `README.md` — new "I want to publish a tagged release of this template" recipe pointing at the operator guide; "Where to learn more → Release" pointer extended to the three release docs (operator guide, lifecycle readiness guide, fresh-surface contents).
- `docs/specorator.md` — §3.10 Release stage gains "Distribution channels (template-level releases)" and "Operator path" bullets naming the GitHub Release + GitHub Package channels and routing maintainers to the operator guide. Existing fresh-surface bullet kept unchanged.
- `docs/release-package-contents.md` — References list cross-links to the operator guide.
- `docs/README.md` — entry-point list gains operator guide and release-package-contents.
- `docs/repo-map.md` — table rows for both pages.
- `docs/sink.md` — `docs/` tree gains the two new release pages.
- `docs/workflow-overview.md` — paragraph after the readiness-guide pointer routes template-level releases through the operator guide.
- `sites/index.html` — new FAQ item answering "How do I get a tagged release?" pointing at the operator guide and `@luis85/agentic-workflow`; "Get started" step 1 mentions the GitHub Release + GitHub Package channels alongside clone/fork.

### Content rules

- Additive only — every page keeps its existing voice.
- Product page stays inside the existing brand surface: only existing components (`faq-item`, `step`) are reused, no new visual treatment, no new tokens, no emoji, no inline styles, so `brand-reviewer` blocking checks do not fire.
- README "Status" pill and roadmap row are **not** flipped here — v0.5 status moves to Done only when T-V05-011 (PR #162) verifies the release end-to-end. T-V05-009 documents the v0.5 surface as it lands; it does not declare v0.5 shipped.
- Install path on the public page does not over-promise: the `npm install --save-dev @luis85/agentic-workflow` line is presented inline; the prerequisites (PAT with `read:packages`, `~/.npmrc`, scope-to-registry mapping) stay in `package-contract.md` §7 and are linked from the FAQ entry, not duplicated.

### Satisfies

REQ-V05-009, SPEC-V05-007.

## Edge cases (PR-wide)

- A reader hits the operator guide before T-V05-006 / T-V05-007 land — the workflow file references would be dangling. PR #161 depends on PR #159 and PR #160 (both merged) so this never occurs on `main`.
- A future ADR supersedes ADR-0021's fresh-surface contract — the operator guide cites the ADR by number, not by quoting its content; the supersession ADR's body becomes the live source of truth and the operator guide continues to link by number.
- A diagnostic code is renamed in `scripts/lib/release-readiness.ts` — the operator guide table goes stale. Mitigation: codes are quoted exactly so a `git grep` from the lib catches the page when the constant changes; future renames must update both surfaces in the same PR.

## Tests

- `npm run verify` green — exercises every doc check (frontmatter, obsidian, sites tokens mirror, traceability, token-budget, link checks).
- `actionlint` / `zizmor` not affected (no workflow file changes).
- Brand-reviewer scan against `sites/index.html` — must report PASS (no new tokens, no new components, no emoji, no inline styles).
- Smoke test the operator guide by following its dry-run path against `v0.5.0` once it exists. Captured under T-V05-010 (PR #162).

## Acceptance criteria

- `docs/release-operator-guide.md` is committed and covers all six operator scenarios named in REQ-V05-008.
- README, `docs/specorator.md`, the entry-point lists (`docs/README.md`, `docs/repo-map.md`, `docs/sink.md`, `docs/workflow-overview.md`), `docs/release-package-contents.md`, and `sites/index.html` reference the GitHub Release + GitHub Package distribution accurately and link to the operator guide.
- `specs/version-0-5-plan/implementation-log.md` has appended entries for T-V05-008 and T-V05-009.
- `specs/version-0-5-plan/workflow-state.md` `last_agent: release-manager` and the new hand-off note are present.
- `npm run verify` green.

## Dependencies

- ✅ T-V05-006 (PR #159) — manual GitHub Release workflow; the operator guide names its inputs and confirm gate.
- ✅ T-V05-007 (PR #160) — package publish path; the operator guide names the publish step, the asset upload, and the recovery paths; distribution docs reference the published package.

## Unblocks

- PR #162 (T-V05-010 / T-V05-011) — the dry-run smoke test consumes the operator guide as its runnable script; T-V05-011 final readiness verification consumes the distribution docs for REQ-V05-009 acceptance.
