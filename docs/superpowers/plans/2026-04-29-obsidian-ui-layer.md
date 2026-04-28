# Obsidian UI Layer — Verification & Gap Report

> **Status:** post-shipment. Work landed on `main` via PR #74 (`feat/obsidian-ui-layer`) before this plan was written. This file is therefore not a forward implementation plan but a verification artifact: each spec acceptance criterion is mapped to the shipped tree, and any drift from the spec is noted.

**Source spec:** `docs/superpowers/specs/2026-04-29-obsidian-ui-layer-design.md` (merged via PR #73).
**Source PR:** [#74 — feat(obsidian): add optional vault UI layer](https://github.com/Luis85/agentic-workflow/pull/74).
**Verifier:** plan-document-reviewer subagent (advisory) + this verification pass (this file).

---

## Acceptance criteria — verified against shipped tree

| # | Spec acceptance criterion | Shipped at | Status |
|---|---|---|---|
| 1 | ADR-0013 filed (status `proposed`, alternatives, references ADR-0010 + ADR-0014) | `docs/adr/0013-add-obsidian-as-ui-layer.md` | ✅ Met |
| 2 | ADR-0014 filed (status `proposed`, body outline, references ADR-0010 + ADR-0013) | `docs/adr/0014-shard-log-shaped-artifacts-for-bases.md` | ✅ Met |
| 3 | `docs/obsidian/README.md` with folder entry-point frontmatter + manual acceptance checklist | `docs/obsidian/README.md` | ✅ Met (one drift, see below) |
| 4 | Three `.base` files (`specs.base`, `adrs.base`, `glossary.base`) and two `.canvas` files (`home.canvas`, `lifecycle.canvas`); no README in subdirectories | `docs/obsidian/bases/{specs,adrs,glossary}.base`, `docs/obsidian/canvas/{home,lifecycle}.canvas` | ✅ Met |
| 5 | `.gitignore` ignores `.obsidian/` and `.trash/` | `.gitignore` lines 12–13 | ✅ Met |
| 6 | `docs/sink.md` includes Layout entries, Ownership rows, and narrative sub-section | `docs/sink.md` (line 37 layout, lines 185–187 ownership, line 329+ narrative) | ✅ Met |
| 7 | `scripts/check-obsidian-assets.ts` and `tests/scripts/obsidian-assets.test.ts` present | both paths exist | ✅ Met |
| 8 | `package.json` has `check:obsidian-assets` script | `package.json` | ✅ Met |
| 9 | `scripts/lib/tasks.ts` `checkTasks` array includes the new check | `scripts/lib/tasks.ts` (with `jsonDiagnostics: true`) | ✅ Met |
| 10 | `npm run check:frontmatter`, `npm run check:obsidian`, `npm run check:obsidian-assets` all pass | run locally / CI | ⏳ Verify |
| 11 | `npm run verify` passes locally | run locally | ⏳ Verify |
| 12 | Manual acceptance checklist walked + time-to-first-render recorded in PR description | PR #74 description | ⏳ Confirm against PR #74 |

## Drift from spec — noted, non-blocking

- **Setup guide explicitly excludes screenshots from the repo** (`docs/obsidian/README.md` line 35: "Do not commit `.obsidian/`, `.trash/`, screenshots, or local workspace layouts."). The spec's component table mentioned a screenshot; the implementation chose to keep all binary artifacts out of git. **Verdict:** the implementation choice is the better one (screenshots rot fast and bloat history). Spec is hereby clarified by this drift note — no further action.
- **`yaml` package, not `js-yaml`.** `scripts/lib/obsidian-assets.ts` imports `parseDocument` from `yaml` (already a dev-dep at `^2.8.3`). Spec did not pin a YAML library; implementation reused the existing one. **Verdict:** correct call.
- **Module + thin script split.** Implementation factored the diagnostics into `scripts/lib/obsidian-assets.ts` so the test (`tests/scripts/obsidian-assets.test.ts`) can inject `trackedPaths` / `baseFiles` / `canvasFiles` arguments and unit-test pure functions. The spec acceptance criterion only required the script + test to exist; implementation chose the idiomatic library + thin-script pattern used elsewhere in the repo (mirrors `scripts/check-obsidian.ts` + `scripts/lib/obsidian.ts`). **Verdict:** stronger architecture; no spec change needed.
- **`check:obsidian-assets` runs with `jsonDiagnostics: true`.** Spec did not specify; implementation enabled JSON diagnostics so CI annotations work. **Verdict:** matches existing `check:obsidian` and `check:frontmatter`; correct.

## Verification steps to run before closing this PR

- [ ] **Step 1: Confirm checks pass on shipped main**
  - Run: `npm run check:frontmatter`
  - Run: `npm run check:obsidian`
  - Run: `npm run check:obsidian-assets`
  - Run: `npm run verify`
  - Expected: all green.

- [ ] **Step 2: Confirm three Bases and two Canvas files actually parse**
  - Each `.base` file under `docs/obsidian/bases/` should parse as YAML.
  - Each `.canvas` file under `docs/obsidian/canvas/` should parse as JSON.
  - The `check:obsidian-assets` script enforces both — passing it is sufficient.

- [ ] **Step 3: Walk the manual acceptance checklist**
  - Open the repo as an Obsidian vault (Obsidian 1.7.x).
  - Enable core plugins Bases and Canvas.
  - Open `docs/obsidian/canvas/home.canvas`.
  - Click into each of the three Bases.
  - Note time-to-first-render. Target ≤ 10 minutes.

- [ ] **Step 4: Cross-check against ADR-0014's "proposed" status**
  - Confirm the ADR's body outline lists the six log-shaped registers (followup-register, health-register, weekly-log, decision-log, communication-log, improvement-plan).
  - Confirm the ADR ships at status `proposed` and explicitly defers per-track shard implementation.

## Lessons for the next plan-after-implementation case

1. **Check `git log` and the integration branch state before writing a plan.** If the work is already shipped, the plan must be reframed as a verification artifact up front — not discovered by the reviewer.
2. **Plans for shipped work are still useful as verification + drift-analysis artifacts** but should not be authored as if greenfield.
3. **If the design spec drifts from the shipped implementation, capture the drift in the spec or in a follow-up ADR.** Here, the screenshot exclusion and YAML-library choice are minor and are captured inline. Anything more substantive would need an ADR amendment.

## Recommended next steps

- **Run the verification steps above.** If anything fails, that becomes the actual implementation plan: a small follow-up PR fixing the gap.
- **Close this PR** if all verification steps pass (the plan-as-verification artifact has served its purpose; it is preserved in git history without merging).
- **Run `/spec:retro` for the Obsidian UI layer feature** to capture the "we wrote a plan after implementation" lesson and propose a process amendment (e.g., the writing-plans skill should check `git log` for in-flight implementation before producing a forward plan).
- **Schedule a one-time agent in ~3 months** to revisit ADR-0014's `proposed` status — does any track still want sharded follow-ups, or should the ADR be superseded?

## Related artifacts

- `docs/superpowers/specs/2026-04-29-obsidian-ui-layer-design.md` (design)
- `docs/adr/0013-add-obsidian-as-ui-layer.md`
- `docs/adr/0014-shard-log-shaped-artifacts-for-bases.md`
- `docs/obsidian/README.md`
- `docs/obsidian/bases/`, `docs/obsidian/canvas/`
- `scripts/check-obsidian-assets.ts`, `scripts/lib/obsidian-assets.ts`
- `tests/scripts/obsidian-assets.test.ts`
