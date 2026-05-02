---
id: ADR-0016
title: Adopt the specorator-design skill as the canonical brand source
status: accepted
date: 2026-05-01
deciders:
  - human
consulted:
  - product-page-designer
  - reviewer
informed:
  - all stage agents
  - operational bot owners
supersedes: []
superseded-by: []
tags: [design-system, brand, skill, sites, tokens]
---

# ADR-0016 — Adopt the specorator-design skill as the canonical brand source

## Status

Accepted

## Context

Specorator's only user-visible surface today is the public product page at `sites/index.html`. Brand decisions — colors, type, spacing, radii, shadows, motion, voice, iconography rules, lane coding — currently live as raw values inside `sites/styles.css` and as implicit conventions in `sites/index.html`. There is no token file, no design-system documentation, and no way for an agent generating a new mock, slide, or future surface to consume the brand without re-deriving it from the rendered page.

This produces three concrete failure modes:

1. **Drift.** Each new HTML artifact (a deck, a doc preview, a future dashboard) re-invents `#17201b`, `#fbfcf8`, `#1b6f55`, `#e6ff70` from screenshots or memory. Small variations creep in.
2. **Lost intent.** The non-negotiable rules — no emoji, no icons, cream paper not white, chartreuse as a pop not a wash, sentence-case headlines that end with a period, lane coding (Define = green, Build = blue, Ship = gold) — are not codified anywhere an agent can read. They live in the head of whoever last edited the product page.
3. **No leverage when a second surface lands.** The moment a docs site, dashboard, onboarding flow, or printable artifact appears, the brand has to be re-exhumed from `sites/styles.css` rather than imported.

A complete design system has been built externally: token CSS, brand README, asset pack, 22 preview specimen cards, a high-fidelity React UI kit, and a 6-slide reference deck. It is cross-compatible with the Claude Code skill format and is ready to drop into `.claude/skills/`.

## Decision

We adopt the **`specorator-design`** skill as the canonical source of truth for the Specorator brand and visual system.

1. The skill ships under `.claude/skills/specorator-design/` as a peer to `.claude/skills/product-page/` and the other lifecycle/operational skills already in the tree.
2. `colors_and_type.css` is the canonical token file. Every color, type, spacing, radius, shadow, and motion value used anywhere in the repo's UI surfaces derives from a `var(--token)` defined here.
3. The `product-page-designer` agent gains a hard dependency on the skill: before editing `sites/`, it invokes `specorator-design`, lifts values from `colors_and_type.css`, and never invents new colors or weights. If a token is missing, the agent proposes an addition via PR before using it.
4. The skill is `user-invocable: true` so humans (and other agents) can ask "design X with the Specorator brand" and get the right answer without having to spelunk `sites/styles.css`.
5. Future surfaces (docs site, dashboard, decks, onboarding) consume the same skill. The brand is owned in one place.

This ADR covers Phase 0 + Phase 1 of `docs/integration-plan-design-system.md`. Phase 2 (flipping `sites/styles.css` to consume the tokens) and Phase 3 (a brand-review gate at Stage 9) are explicitly out of scope for this ADR and will ship as separate, independently-reviewable PRs.

## Considered options

### Option A — Skill as the canonical brand source (chosen)

- Pros: Cheap, reversible, matches how every other cross-cutting concern in the repo is codified (skills + agents + ADRs). Zero new dependencies. The skill is a folder of plain text and CSS; `git diff` works; humans and agents read the same files. Future surfaces inherit the brand for free. The `user-invocable` flag makes it discoverable.
- Cons: Relies on agent discipline to actually invoke the skill before editing `sites/`. Token consolidation in `sites/styles.css` is deferred to Phase 2 — until then, the skill and `sites/styles.css` carry the same values in two places (intentional, but a small duplication tax during the transition).

### Option B — Vendor a CSS-only build inside `sites/`

- Pros: One file, no skill machinery; `sites/styles.css` imports it directly.
- Cons: Duplicates the source of truth (the README, asset pack, UI kit, preview cards have nowhere to live). Future non-`sites/` surfaces (decks, dashboard, docs) have no clean way to consume it. Misses the point — the value isn't the CSS file alone, it's the bundle of tokens + rules + reference implementations.

### Option C — Ship as an external npm package

- Pros: Versioned, semver, can be consumed outside the repo.
- Cons: Massive overhead at this scale (one product page, no current second surface). Adds a publish step, a release cadence, and a dependency on npm tooling that the rest of the repo doesn't need. Defer until there's a concrete external consumer.

We choose Option A now. Option B is rejected because it discards the README, UI kit, and preview cards. Option C is rejected because the overhead doesn't pay back at this scale.

## Consequences

### Positive

- One place to change a color. Every surface picks it up.
- The non-negotiable brand rules (no emoji, no icons, cream not white, chartreuse as a pop, sentence-case headlines) are codified where agents and humans can read them.
- Future surfaces get a working starting point: tokens, assets, components, a deck system.
- The `product-page-designer` agent is no longer the sole keeper of brand intent.
- The skill is `user-invocable`, so a human can ask "make me a slide with the Specorator brand" and get the right answer.

### Negative

- Until Phase 2 lands, `sites/styles.css` still carries literal color values alongside the token file — duplication during the transition.
- The `product-page-designer` agent's preamble grows by one paragraph (the dependency on the skill). Forgetting to invoke it stalls the brand-consistency benefit.
- One more skill to keep in sync with the live product page when the page evolves. Mitigated by Phase 2 (flip the dependency direction so `sites/styles.css` imports the tokens).

### Neutral

- The skill folder is read-only reference material from the perspective of most agents — only the `product-page-designer` and a future `brand-reviewer` (Phase 3) write to it.
- No CI surface ships with this ADR. Phase 3 introduces the gate.
- `sites/` is unchanged in this PR. Visual output is byte-identical.

## Compliance

- `.claude/skills/specorator-design/` carries the canonical brand assets, tokens, rules, and reference implementations.
- `.claude/agents/product-page-designer.md` is updated to invoke the skill before editing `sites/`.
- `docs/integration-plan-design-system.md` carries the staged rollout (Phases 0–4); this ADR covers Phases 0 + 1.
- No new CI surface ships with this ADR. A follow-up ADR will introduce the brand-review gate (Phase 3) once the skill has been in use long enough to know what the gate should check.

## References

- [`.claude/skills/specorator-design/README.md`](../../.claude/skills/specorator-design/README.md)
- [`.claude/skills/specorator-design/SKILL.md`](../../.claude/skills/specorator-design/SKILL.md)
- [`.claude/skills/specorator-design/colors_and_type.css`](../../.claude/skills/specorator-design/colors_and_type.css)
- [`.claude/agents/product-page-designer.md`](../../.claude/agents/product-page-designer.md)
- [`docs/integration-plan-design-system.md`](../integration-plan-design-system.md)
- Live site — <https://luis85.github.io/agentic-workflow/>
- Constitution Article IV (Quality Gates), Article IX (Reversibility).

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
