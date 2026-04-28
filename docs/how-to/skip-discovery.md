# How to skip the Discovery Track on a simple feature

**Goal:** start a feature directly with `/spec:idea` and capture the skip-decision so reviewers can audit it later.

**When to use:** the brief is single-option and well-scoped, the problem is a known recurring pattern, and the team agrees discovery would not change the outcome.

**Prerequisites:**

- A written brief or one-liner ready.
- No competing concept candidates worth exploring.
- A reviewer or Decider available to challenge the skip if needed.

## Steps

1. Write a one-paragraph rationale: brief, why discovery is unnecessary, who agreed. Paste it into the conversation when you run `/spec:idea`.
2. Run `/spec:start <slug>` to scaffold the feature directory.
3. Run `/spec:idea`. The analyst will offer to invoke discovery if the brief looks blank — answer *"no, skipping discovery"* and paste your rationale.
4. The analyst captures the rationale in `idea.md` under a `## Discovery skipped because…` section.
5. Continue to `/spec:research` and onward as normal.

## Verify

`grep -i "discovery skipped" specs/<slug>/idea.md` returns a match containing your rationale.

## Related

- Reference — [`docs/discovery-track.md`](../discovery-track.md) — when discovery DOES help.
- Reference — [`docs/specorator.md`](../specorator.md) — Stage 1 (Idea) definition.
- Explanation — [ADR-0005](../adr/0005-add-discovery-track-before-stage-1.md) — why Discovery exists in the first place.
- How-to — [`add-adr.md`](./add-adr.md) — file an ADR if the skip is policy-level.
