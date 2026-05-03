---
title: Issue-breakdown track
folder: docs
description: Post-/spec:tasks opt-in track that decomposes a GitHub issue into independent draft PRs.
entry_point: false
---

# Issue-breakdown track

Opt-in track that runs *after* `/spec:tasks`. Decomposes a GitHub issue describing a product increment into N independent draft PRs (one per parallelisable batch from `tasks.md`), keeps the parent issue as the canonical progress dashboard, and is idempotent across re-runs.

Filed by ADR-0022 (`docs/adr/0022-add-issue-breakdown-track.md`).

## When to use

- A feature has reached `/spec:tasks` (`tasks.md` is `complete`).
- A GitHub issue exists for the feature, and you want multiple people to pick up parallel work.
- You want each PR scoped to a vertical slice with full spec lineage in the body.

Not for:

- Features without a completed `tasks.md` — run `/spec:tasks` first.
- One-person work where a single PR is enough.
- Brownfield issues with no spec lineage at all — open `/spec:start` first or document the issue as `wontfix`/`needs-spec`.

## Inputs

- A GitHub issue number.
- A `specs/<slug>/` folder with `workflow-state.md`, `requirements.md`, `design.md`, `spec.md`, `tasks.md` all `complete`.
- Optional: an `inputs/` work package surfaced via the canonical intake gate (per `docs/inputs-ingestion.md`). The conductor consults `inputs/` only if the user explicitly references something there — there is no mandatory intake step in this track.

## Outputs

- N draft PRs (one per parallelisable batch in `tasks.md`), each with a generated body that cites spec lineage, task IDs, dependency chain, and DoD.
- A `## Work packages` section appended to the parent issue body inside a sentinel-bracketed re-edit zone.
- A new append-only `specs/<slug>/issue-breakdown-log.md` with one timestamped entry per run.
- One dated line appended to the `## Hand-off notes` free-form section of `specs/<slug>/workflow-state.md`.
- One non-draft `chore(issue-breakdown)` PR (cut from the integration branch on a `chore/issue-breakdown-audit-issue-<n>-<runid>` branch) carrying those two append commits, so the working tree is left clean for the next `/issue:breakdown` run.

## Legacy `tasks.md` support

`/issue:breakdown` runs against any feature with a `tasks.md` (legacy or canonical). Only two anchors are hard-required: at least one `### T-<AREA>-NNN …` heading and a `**Description:**` bullet under it. `## Task list`, `## Parallelisable batches`, `## Quality gate`, the per-task `**Definition of done:**`, and `**Depends on:**` are optional — the parser synthesises sensible defaults when they are absent. When `## Parallelisable batches` is missing, the conductor synthesises a single batch containing every task in document order (one PR) and surfaces the synthesis at the confirm step. Heading separator may be either em-dash (`—`) or ASCII hyphen-with-spaces (`-`); emoji-block is optional.

## Flow

```
/issue:breakdown <n>
   │
   ├─ Pre-flight ────────── gh auth ok? issue open? read issue.
   ├─ Resolve spec ──────── issue body specs/ link → label spec:<slug>
   │                        → AskUserQuestion (list candidates).
   ├─ Verify gate ───────── workflow-state.md tasks.md == complete?
   ├─ Idempotency ───────── gh pr list --search slice-tag → resume / re-plan / abort.
   ├─ Parse tasks.md ────── ## Parallelisable batches → slice list
   │                        (or single synthesised batch if absent).
   ├─ Confirm ──────────── AskUserQuestion (open / edit / abort).
   ├─ Per-slice loop ────── branch → empty commit → push → draft PR.
   ├─ Update issue body ─── sentinel-bracketed ## Work packages section.
   ├─ Audit log ────────── append specs/<slug>/issue-breakdown-log.md.
   ├─ Hand-off note ────── append one line to workflow-state.md.
   └─ Persist audit ────── housekeeping branch + non-draft chore PR for
                            the audit + hand-off appends so working tree is
                            clean for the next /issue:breakdown run.
```

## Constraints

- **No `--no-verify`.** Empty scaffold commits must pass the verify gate cleanly. If they don't, fix the gate, not the commit.
- **No direct writes to the integration branch.** The conductor detects the integration branch (`main` in Shape A, `develop` in Shape B — see [`docs/branching.md`](./branching.md)) and bases every slice off it. Slice branches use the `feat/<slug>-slice-<NN>-<short>` pattern.
- **One PR per parallelisable batch.** `🪓 may-slice` annotations override.
- **Sentinel-block discipline.** The `<!-- BEGIN issue-breakdown:<slug> --> … <!-- END issue-breakdown:<slug> -->` block in the parent issue body is conductor-owned; humans annotate outside it.
- **Phase 2 file boundary.** The operational bot (`agents/operational/issue-breakdown-bot/`) is a separate PR; it must not import or transclude any file under `.claude/skills/issue-breakdown/`.

## References

- Design spec: `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`.
- ADR: `docs/adr/0022-add-issue-breakdown-track.md`.
- Slicing primitive: `.claude/skills/tracer-bullet/SKILL.md`.
- Sink: `docs/sink.md`.
- Verify gate: `docs/verify-gate.md`.
- Branching: `docs/branching.md`.
