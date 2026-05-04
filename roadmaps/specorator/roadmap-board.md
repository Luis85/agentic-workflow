---
roadmap: specorator
artifact: roadmap-board
date: 2026-05-04
owner: roadmap-manager
inputs:
  - docs/specorator-product/product.md
  - issue backlog context (issues #91, #98, #106, #125, #145, #183, #209, #292, #293, #295, #298, #299, #300, #302, #96, #92)
---

# Roadmap Board

Roadmap items describe outcome bets, not accepted requirements. Delivery work starts only after the relevant Specorator, Project Manager, or Portfolio action accepts it.

## Now

Active development or immediate next actions. Items listed here are either in an active worktree or are the unblocking prerequisite for everything else.

| Item ID | Outcome hypothesis | Why now | Success signal | Owner | Source | Confidence | Dependencies | Decision needed |
|---|---|---|---|---|---|---|---|---|
| RM-SPE-001 | If we close the quality-tooling debt (#292), then contributors can trust `npm run verify` as a single confidence gate, because broken verify blocks every PR review and undermines all claims of quality | Quality blocker that gates all feature work — nothing new ships credibly while verify is broken | `npm run verify` exits 0 with zero TypeScript, lint, format, and test failures; no known suppressed errors remain | Luis Mendez | #292 | High | None — this is the prerequisite | Human to set scope boundary: which errors are in-scope for this sweep vs. deferred to #295 (Vitest migration) |
| RM-SPE-002 | If we complete the v0.5.2 issue-breakdown close-out (#183), then the issue-breakdown track is fully dogfooded and the v0.5.2 release tag exists, because the implementation shipped but release hygiene remains open | v0.5.2 is a prerequisite for the entire v0.x version chain; blocking now means blocking v0.6 release | `/issue:breakdown` and `/spec:retro` produce valid artifacts; README updated; v0.5.2 tag pushed; release notes published | Luis Mendez | #183 | High | #292 (quality sweep should be green before tagging) | None — scope is clear |
| RM-SPE-003 | If we ship the dev-agent stage-completion close-out step (#300), then developers using the lifecycle will always get an explicit workflow-state update at stage end, reducing hand-off ambiguity | Quick doc fix in active worktree; no blockers | `workflow-state.md` close-out step is documented in the dev agent prompt; PR merged and verify green | Luis Mendez | #300 | High | #292 (verify green preferred before merge) | None |
| RM-SPE-004 | If we ship the issue-draft track (#302), then teams get a living PRD and a draft PR from `/spec:idea`, increasing early alignment before requirements are formal | New opt-in track in active worktree; materially improves early-stage experience | `/spec:idea` produces a draft PR and a living PRD artifact; track documented; verify green | Luis Mendez | #302 | High | #292 (verify green), #300 (dev agent close-out) | None — spec is in progress |
| RM-SPE-005 | If we complete v0.6 productization, cross-tool adapters, live proof, hooks, and agentic security (#91), then Specorator is credibly adoptable by non-Claude-Code users and the golden-path experience is verified end-to-end | 5 active worktrees; Wave 2 (public positioning + release readiness) waits on Wave 1 merges; v0.7 depends on v0.6 | All v0.6 worktrees merged; verify green; release notes published; v0.6 tag pushed | Luis Mendez | #91 | High | #292 (quality sweep), #183 (v0.5.2 close-out), #300, #302 | Human to approve Wave 2 scope after Wave 1 merges |

## Next

Planned but not yet started. Starts after Now items land; sequenced by version dependency chain.

| Item ID | Outcome hypothesis | Why next | Success signal | Owner | Source | Confidence | Dependencies | Decision needed |
|---|---|---|---|---|---|---|---|---|
| RM-SPE-006 | If we migrate to Vitest (#295), then the test suite is faster, more maintainable, and better integrated with modern TypeScript tooling, removing a key quality-tooling gap identified in the project review | Contributes to and depends on the quality sweep (#292); natural successor once verify is green | All tests pass under Vitest; `npm run verify` green; coverage baseline established | Luis Mendez | #295 | Med | RM-SPE-001 (#292 quality sweep) | Decision: confirm migration scope — all tests or incremental? |
| RM-SPE-007 | If we ship Zod runtime validation for script-layer parsers (#209), then 4 parser scripts have schema-enforced contracts, reducing silent failures from malformed spec artifacts | v0.7.1 patch on v0.7; implementation at Stage 7 on `feat/zod-script-validation`; unlocks v0.7 close-out | All 4 parsers migrated to Zod; verify green; release notes published; v0.7.1 tag pushed | Luis Mendez | #209 | Med | RM-SPE-005 (v0.6 closed) | None — scope is defined |
| RM-SPE-008 | If we close the remaining v0.7 automation quality hardening items (#98), then the script layer has simulation fixtures, JSON diagnostic standardisation, and auto-fix expansion, completing the v0.7 milestone | v0.7 must close before v0.8 can start; some items already shipped pre-spec | v0.7 remaining items merged; verify green; v0.7 release tag pushed | Luis Mendez | #98 | Med | RM-SPE-005 (v0.6), RM-SPE-006 (Vitest) | Human to confirm which pre-spec-shipped items count toward v0.7 closure |
| RM-SPE-009 | If we act on the 2026-05 project review improvement proposals (#293), then verify reliability, quality tooling gaps, SBOM posture, adopter docs, and the control-plane threat model are each addressed with a concrete follow-up, increasing template maturity | Review artifact shipped; improvement proposals are outstanding; acting on them reduces compounding technical debt | Each improvement proposal has a designated owner, issue or ADR, and target horizon; at least the high-priority items have PRs open | Luis Mendez | #293 | Med | RM-SPE-001 (#292 quality sweep aligns naturally) | Human to triage improvement proposals and assign priority and ownership |
| RM-SPE-010 | If we fix the check:links false-positive on fenced code blocks (#298), then link-checking noise is eliminated, making verify output trustworthy for contributors | Small scoped fix; resolves a recurring false-positive that undermines confidence in verify | `npm run check:links` passes with no false positives on fenced-code-block content; regression test added | Luis Mendez | #298 | Med | RM-SPE-001 (#292 preferred first) | None |
| RM-SPE-011 | If we add the nested-worktree pitfall advisory (#299), then contributors avoid a known footgun when creating worktrees inside `.worktrees/`, reducing lost work | Small doc fix; unblocked | Advisory section in `docs/worktrees.md`; verify green | Luis Mendez | #299 | Med | None | None |

## Later

Medium-to-long horizon. Starts after Next items land; ordering follows version dependency chain.

| Item ID | Outcome hypothesis | Why later | Success signal | Owner | Source | Confidence | Dependencies | Decision needed |
|---|---|---|---|---|---|---|---|---|
| RM-SPE-012 | If we ship v0.8 content-driven product page generator (#106), then Specorator has a Markdown-driven GitHub Pages product page that non-developers can update without touching HTML, increasing public legibility of the product | Depends on v0.7 closure; has open clarifications (CLAR-V08-001/002/003) that must be resolved before shaping | Product page renders from Markdown; CI deploys on merge; no manual HTML edits required for content changes | Luis Mendez | #106 | Low | RM-SPE-008 (v0.7 closed); clarifications CLAR-V08-001/002/003 resolved | Human must resolve CLAR-V08-001/002/003 before this item enters development |
| RM-SPE-013 | If we ship v0.8.1 product box feature (#145), then the product page gains a 3D product-box visualization that increases memorability and communicates positioning visually | Patch on v0.8; design PR #144 merged; ADR re-allocation #206 pending | Product box renders on live GitHub Pages product page; passes design review; verify green | Luis Mendez | #145 | Low | RM-SPE-012 (v0.8 shipped); ADR re-allocation #206 resolved | Human must resolve ADR re-allocation #206 |
| RM-SPE-014 | If we ship v0.9 stakeholder sparring partner (#125), then roadmap authors can rehearse communication with an AI sparring partner before presenting to real stakeholders, improving communication quality | Depends on v0.8 closure; new `/roadmap:spar` skill; prep-only; no external commitment risk | `/roadmap:spar` produces a `sparring-artifact.md` under `roadmaps/<slug>/`; docs updated; verify green | Luis Mendez | #125 | Low | RM-SPE-012 (v0.8 closed) | Human to confirm whether `/roadmap:spar` needs an ADR given track taxonomy freeze in ADR-0026 |
| RM-SPE-015 | If we complete v1.0 release readiness (#92), then Specorator reaches its first stable release, credibly signalling that the workflow is production-ready for adopters across all target personas | First stable release; requires v0.5.2 + v0.6 + v0.7 + v0.8 + v0.8.1 + v0.9 all closed | Release readiness checklist in #92 fully checked; v1.0 tag published; release notes and product page updated; GitHub release draft approved | Luis Mendez | #92 | Low | RM-SPE-002 through RM-SPE-014 (full version chain) | Human must approve v1.0 release readiness checklist before tagging |
| RM-SPE-016 | If we start v2.0 Obsidian plugin planning (#96), then Specorator's workflow becomes accessible inside Obsidian as a UI layer, expanding the addressable audience to knowledge workers who do not use CLI tools | Long-horizon; currently a planning container only; v1.0 must ship first | Planning container issue has a scoped brief; no implementation commitment yet | Luis Mendez | #96 | Low | RM-SPE-015 (v1.0 shipped) | Human must open a discovery brief before any implementation scope is set |

## Parking Lot

| Idea | Reason parked | Revisit trigger |
|---|---|---|
| Hosted SaaS product | Explicitly out of scope per `docs/specorator-product/product.md` non-goals | ADR superseding the non-goal |
| Making all optional tracks mandatory | Out of scope per non-goals; increases ceremony for small projects | Adopter feedback data showing broad demand |

## Change Summary

| Date | Change | Reason | Source |
|---|---|---|---|
| 2026-05-04 | Initial board — 16 items across Now / Next / Later | Bootstrap from active worktrees, open issues, and product steering | roadmap-manager bootstrap |
