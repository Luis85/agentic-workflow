---
description: Design Track — Phase 3 (Mock). Invokes design-lead to sequence ui-designer for component and token assignment. Optionally produces mock.html.
argument-hint: [design-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /design:mock

Run **Phase 3 — Mock** of the Design Track. Read [`docs/design-track.md`](../../../docs/design-track.md) §3.3.

1. Resolve the slug from `$1` or by inspecting `designs/` for the active design at `current_phase: mock`.
2. Confirm `designs/<slug>/sketch.md` exists; if not, route to `/design:sketch` first.
3. **Spawn the `design-lead` subagent** with the slug. The design-lead will:
   - Re-read `.claude/skills/specorator-design/SKILL.md` and `colors_and_type.css` in full.
   - Sequence `ui-designer` to assign a design-system component to each screen element and name every token used.
   - Optionally produce `designs/<slug>/mock.html` (static, self-contained, imports `colors_and_type.css`).
   - Optionally invoke `brand-reviewer` for an inline check against the 14-check brand checklist.
   - Record token decisions and any proposed new tokens in `design-state.md`.
   - Run the brand non-negotiables gate (page background `var(--paper)`, `--highlighter` scope, sentence-case headlines, no emoji, no icon library imports, no token literals).
4. Update `design-state.md`: mark mock complete, set `current_phase: handoff`.
5. Recommend `/design:handoff`.

## Don't

- Don't introduce hex literals — every value resolves to a named token. Missing tokens are proposed via PR.
- Don't import an icon library or use emoji.
- Don't put `--highlighter` on body fills or section backgrounds.
- Don't ship a mock that fails the brand non-negotiables.
