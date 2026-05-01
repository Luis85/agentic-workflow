---
description: Design Track — Phase 1 (Frame). Invokes design-lead to sequence product-strategist and ux-designer. Produces design-brief.md.
argument-hint: [design-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /design:frame

Run **Phase 1 — Frame** of the Design Track. Read [`docs/design-track.md`](../../../docs/design-track.md) §3.1.

1. Resolve the design slug from `$1` or by inspecting `designs/` for the active design (whose `design-state.md` has `status: active` and `current_phase: frame`).
2. Confirm `designs/<slug>/design-state.md` exists; if not, propose `/design:start <slug>` first.
3. **Spawn the `design-lead` subagent** with the user's brief and the slug. The design-lead will:
   - Read `.claude/skills/specorator-design/SKILL.md` and `colors_and_type.css` before any visual output.
   - Sequence the consulted specialists: `product-strategist` (if available), then `ux-designer`.
   - Produce `designs/<slug>/design-brief.md` from [`templates/design-brief-template.md`](../../../templates/design-brief-template.md).
   - Run the quality gate at the bottom of the template.
4. Update `design-state.md`: mark `design-brief.md: complete` (or `in-progress` if blocked), set `current_phase: sketch`, append a hand-off note.
5. **Block on human approval** of the brief before recommending `/design:sketch`.

## Don't

- Don't sketch screens or pick components — that is Phase 2 / Phase 3.
- Don't proceed without the human's approval of the brief.
- Don't start a track for feature-level UI — recommend `/spec:design` instead.
