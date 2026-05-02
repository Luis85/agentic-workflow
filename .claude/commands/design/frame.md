---
description: Design Track — Phase 1 (Frame). Invokes design-lead to sequence product-strategist and ux-designer. Produces design-brief.md.
argument-hint: [design-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /design:frame

Run **Phase 1 — Frame** of the Design Track. Read [`docs/design-track.md`](../../../docs/design-track.md) §3.1.

1. Resolve the design slug from `$1` or by inspecting `designs/` for a `design-state.md` whose `status` is `frame-in-progress` or `frame-in-progress-blocked`. State machine, blocked-state convention, and field names live in [`templates/design-state-template.md`](../../../templates/design-state-template.md).
2. Confirm `designs/<slug>/design-state.md` exists; if not, propose `/design:start <slug>` first.
3. **Spawn the `design-lead` subagent** with the user's brief and the slug. The design-lead will:
   - Read `.claude/skills/specorator-design/SKILL.md` and `colors_and_type.css` before any visual output.
   - Sequence the consulted specialists: `product-strategist` (if available), then `ux-designer`.
   - Produce `designs/<slug>/design-brief.md` from [`templates/design-brief-template.md`](../../../templates/design-brief-template.md).
   - Run the quality gate at the bottom of the template.
4. Update `design-state.md`:
   - Set `design-brief.md` row in the Artifacts table to `complete` (or leave `pending` if blocked).
   - Append a hand-off note under `### After Frame`.
   - Once the human approves the brief, advance `status` from `frame-in-progress` to `frame-complete`, then on Sketch kickoff to `sketch-in-progress`. Until approval, leave at `frame-in-progress`.
5. **Block on human approval** of the brief before recommending `/design:sketch`.

## Don't

- Don't sketch screens or pick components — that is Phase 2 / Phase 3.
- Don't advance `status` past `frame-complete` without human approval.
- Don't start a track for feature-level UI — recommend `/spec:design` instead.
