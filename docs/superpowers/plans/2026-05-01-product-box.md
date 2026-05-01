# Product Box Implementation Plan

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` (if subagents available) or `superpowers:executing-plans` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `product-box` feature to the Specorator template — a stage-aware, public visualization of the envisioned product that pairs with the existing product page through a marker-slot contract.

**Architecture:** A skill orchestrates content (source resolution, user prompts, `box.yml` cache); a dedicated agent renders content (HTML, CSS, SVG, slot injection). The seam between them is a single typed YAML file. Verify-gate enforces schema, brand tokens, slot-marker integrity, and asset references.

**Tech Stack:** TypeScript via `tsx`, `node:test` for unit tests, the existing `yaml` package for parsing, plain HTML/CSS for the output, the existing GitHub Pages workflow for deploy.

**Note on test execution:** The repo's `npm run test:scripts` discovers all `tests/scripts/**/*.test.ts` and runs them; trailing path arguments are ignored. To run a single test file during TDD, call the runner directly:

```bash
node --test --import tsx tests/scripts/product-box/<file>.test.ts
```

Use `npm run test:scripts` for the full suite (verify-gate equivalent).

**Spec source of truth:** [`docs/superpowers/specs/2026-05-01-product-box-design.md`](../specs/2026-05-01-product-box-design.md).

---

## File Structure

### New files

```
.claude/skills/product-box/SKILL.md                orchestrator skill
.claude/skills/product-box/README.md               folder entry doc
.claude/agents/product-box-designer.md             renderer agent
.claude/commands/product/box.md                    slash /product:box
sites/box/box.yml                                  canonical content cache (sample)
sites/box/index.html                               standalone box page
sites/box/styles.css                               box-page styles (lifts brand tokens)
sites/box/og-card.svg                              static social-share image
sites/box/README.md                                folder entry doc
docs/product-box.md                                methodology doc
docs/adr/0017-add-product-box-feature.md           ADR

scripts/lib/product-box/types.ts                   TypeScript types for box.yml
scripts/lib/product-box/validate.ts                schema validator
scripts/lib/product-box/skill-hash.ts              canonical sha256 over content fields
scripts/lib/product-box/derive-status.ts           status derivation rule
scripts/lib/product-box/derive-stage.ts            stage derivation rule
scripts/lib/product-box/resolve-sources.ts         priority-chain source resolver
scripts/lib/product-box/render.ts                  pure renderer (yaml -> html/css/svg)
scripts/lib/product-box/inject-slot.ts             product-page slot injector
scripts/check-product-box.ts                       verify-gate check (schema, slots, tokens, refs)

tests/scripts/product-box/validate.test.ts
tests/scripts/product-box/skill-hash.test.ts
tests/scripts/product-box/derive-status.test.ts
tests/scripts/product-box/derive-stage.test.ts
tests/scripts/product-box/resolve-sources.test.ts
tests/scripts/product-box/render.test.ts
tests/scripts/product-box/inject-slot.test.ts
tests/scripts/product-box/check-product-box.test.ts
tests/scripts/product-box/fixtures/*.yml
tests/scripts/product-box/snapshots/*.html
tests/scripts/product-box/README.md
```

### Modified files

```
sites/index.html                                    + slot markers, + card stylesheet link
sites/styles.css                                    + .product-box-card and .status-pill variants
.claude/agents/product-page-designer.md             + slot-ownership note
.claude/skills/product-page/SKILL.md                + slot-preservation rule
.claude/skills/orchestrate/SKILL.md                 + auto-hook calls
README.md                                           + skill row
.claude/memory/MEMORY.md                            + index entry
CLAUDE.md                                           + table row if surfaced
docs/sink.md                                        + sites/box/ + box.yml destinations
scripts/lib/tasks.ts                                + check:product-box entry
package.json                                        + check:product-box npm script
```

---

## Chunk 1: Foundation — branch, ADR, methodology doc

### Task 1.1: Create topic branch via worktree

**Files:**
- New: `.worktrees/product-box/` (worktree path)

- [ ] **Step 1: Create the worktree and branch**

From the repository root:

```bash
git worktree add -b feat/product-box .worktrees/product-box main
cd .worktrees/product-box
```

Expected: `Preparing worktree (new branch 'feat/product-box')` followed by checkout output.

- [ ] **Step 2: Confirm branch and clean state**

```bash
git status
git rev-parse --abbrev-ref HEAD
```

Expected: `On branch feat/product-box`, clean tree.

- [ ] **Step 3: Confirm spec and plan are present on the branch**

The design PR (#144) shipped both files to `main`, so the worktree (forked from `main`) already has them at:

- `docs/superpowers/specs/2026-05-01-product-box-design.md`
- `docs/superpowers/plans/2026-05-01-product-box.md`

```bash
ls docs/superpowers/specs/2026-05-01-product-box-design.md \
   docs/superpowers/plans/2026-05-01-product-box.md
```

Expected: both paths exist. No copy or restore needed — these are tracked on `main` and inherited by `feat/product-box`.

If either file is missing, the design PR has not yet merged; abort and wait for it to land before continuing.

### Task 1.2: File ADR-0017

**Files:**
- Create: `docs/adr/0017-add-product-box-feature.md`

- [ ] **Step 1: Run the new-adr skill or copy the template**

```bash
cp templates/adr-template.md docs/adr/0017-add-product-box-feature.md
```

- [ ] **Step 2: Fill ADR content**

Replace the template body with:

```markdown
---
id: ADR-0017
title: Add product-box feature for early-stage envisioned-product visualization
status: accepted
date: 2026-05-01
deciders:
  - Specorator maintainer
consulted:
  - product-page-designer agent (slot contract)
informed:
  - orchestrate skill (auto-hooks)
supersedes: []
superseded-by: []
tags: [product-page, visualization, agent, skill]
---

# ADR-0017 — Add product-box feature for early-stage envisioned-product visualization

## Status

Accepted

## Context

The Specorator template ships a `product-page` skill and `product-page-designer` agent that maintain `sites/index.html` for shipped or shipping products. The page must be grounded in repository artifacts; aspirational copy is forbidden.

This leaves a gap. Between "raw idea" and "shipped product" — Stages 1 through 7 — there is no public visualization of what the team is building. Stakeholders, contributors, and the team itself benefit from seeing an envisioned product as soon as a brief, steering doc, or even just a conversation exists.

A second artifact is needed: one that is intentionally aspirational ("envisioned"), kept clearly distinct from the grounded product page, evolves through the lifecycle stages, and coexists cleanly with the product page when both are present.

## Decision

We add a `product-box` feature: a stage-aware, public, deployable visualization of the envisioned product, paired with the existing product page through a marker-slot contract.

Components:

- New skill `.claude/skills/product-box/` (content orchestration: source priority, user prompts, `box.yml` cache).
- New agent `.claude/agents/product-box-designer.md` (rendering: HTML, CSS, SVG, slot injection).
- New slash command `.claude/commands/product/box.md`.
- Project-level scope (one box per repo). Feature-level boxes are explicitly deferred.
- Standalone page at `sites/box/index.html` (CSS-only 3D box with three faces).
- Embeddable card injected into `sites/index.html` between paired markers `<!-- product-box-embed:start -->` / `<!-- product-box-embed:end -->`.
- Skill-orchestrates / agent-renders split with `sites/box/box.yml` as the typed seam.
- Source priority chain: `chosen-brief.md` → `docs/steering/product.md` → `README.md` → conversation. Fresh repo with nothing → skill prompts user inline.
- Status derivation: `release-notes.md` → `shipping`; `requirements.md` → `spec'd`; `chosen-brief.md` → `envisioned`; only `idea.md` or nothing → `concept`.
- Auto-hook policy: orchestrate skill calls `/product:box` after `/spec:idea`, `/discovery:handoff`, `/spec:requirements`. Fire-and-forget; failure logs warning, never blocks the originating stage.

## Considered options

### Option A — Reuse `product-page-designer` agent

Pros: fewer files, one agent to teach.
Cons: conflates two content rules (grounded vs envisioned). The grounded contract on the product page is load-bearing; relaxing it for the box risks erosion.

### Option B — Skill-orchestrates / agent-renders, dedicated agent (chosen)

Pros: clean content / render seam at `box.yml`; user can edit yaml directly without reinvoking the agent; renderer is a pure function and snapshot-testable; symmetric with existing product-page pattern.
Cons: one extra file (`box.yml`), slightly more conceptual surface.

### Option C — Auto-evolving artifact, no dedicated agent

Pros: lightest. Box always current.
Cons: no agent judgment for tone or brand voice; hard to extend; contradicts existing convention of one narrow agent per concern.

## Consequences

### Positive

- Adopters get a public, deployable visualization of their envisioned product as soon as a brief exists.
- Box and product page coexist through a stable contract; neither blocks the other.
- `box.yml` is human-editable; the workflow does not require running an agent for small copy tweaks.
- The content / render split keeps the renderer unit-testable.

### Negative

- One additional skill, agent, slash command, ADR, and methodology doc to learn.
- A second artifact under `sites/` doubles the surface for brand-token drift; mitigated by the verify-gate token check.

### Neutral

- Project-level scope only. If feature-level boxes are needed later, that warrants a follow-up ADR.

## Compliance

- New verify-gate check `scripts/check-product-box.ts` enforces `box.yml` schema, slot-marker integrity, brand-token usage, and asset reference resolution.
- New unit tests under `tests/scripts/product-box/` cover the renderer (snapshot tests), source resolution, status derivation, and slot injection.
- Manual one-shot before merge: open `sites/box/index.html`, eyeball at three viewport widths, toggle `prefers-reduced-motion`, confirm `og-card.svg` renders standalone.

## References

- Spec: `docs/superpowers/specs/2026-05-01-product-box-design.md`.
- Plan: `docs/superpowers/plans/2026-05-01-product-box.md`.
- Related: ADR-0016 (design system as skill), `.claude/skills/product-page/SKILL.md`, `.claude/agents/product-page-designer.md`.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
```

- [ ] **Step 3: Update ADR index**

```bash
npm run fix:adr-index
```

Expected: `docs/adr/README.md` regenerated with ADR-0017 entry.

- [ ] **Step 4: Verify ADR check passes**

```bash
npm run check:adr-index
```

Expected: exit 0, no output errors.

- [ ] **Step 5: Commit**

```bash
git add docs/adr/0017-add-product-box-feature.md docs/adr/README.md
git commit -m "docs(adr): file ADR-0017 for product-box feature"
```

### Task 1.3: Write methodology doc

**Files:**
- Create: `docs/product-box.md`

- [ ] **Step 1: Write `docs/product-box.md`**

Use this body verbatim (matches existing track-doc shape under `docs/`):

```markdown
---
title: Product box
folder: docs
description: Stage-aware visualization of the envisioned product, paired with the public product page.
entry_point: false
---

# Product box

The **product box** is the early-stage visual companion to the public product page (`sites/index.html`). It exists to answer one question: *"What is this team building?"* — even before the product itself is shippable.

## Where it sits

| Stage | Box state | Page state |
|---|---|---|
| Pre-discovery | `Concept` (or absent) | absent |
| Post-`/discovery:handoff` | `Envisioned` | absent or stub |
| Post-`/spec:requirements` | `Spec'd` | grounded |
| Post-`/spec:release` | `Shipping` | grounded, hero-feature |

The box is regenerable across stages. The page is grounded; the box is intentionally aspirational.

## How to use it

1. Run `/product:box` (or invoke the `product-box` skill conversationally).
2. The skill resolves content from this priority chain:
   1. `discovery/<slug>/chosen-brief.md`
   2. `docs/steering/product.md`
   3. `README.md`
   4. The current conversation.
   If none of these are present, the skill prompts you inline for four fields: name, tagline, three features, and target user.
3. The skill writes `sites/box/box.yml`. You can edit this file by hand; the skill preserves your edits on next regen and only refreshes metadata.
4. The skill dispatches the `product-box-designer` agent to render `sites/box/index.html`, `sites/box/styles.css`, and `sites/box/og-card.svg`, and to inject a card into the product page at the marker slot.

## Coexistence with the product page

When both artifacts exist, the product page hosts an embedded card between paired marker comments:

```html
<!-- product-box-embed:start -->
…card markup…
<!-- product-box-embed:end -->
```

The box agent owns this slot. The product-page agent must not strip or rewrite content between the markers; if the markers are absent, the box agent appends them once.

## What the box deliberately leaves out

- Pricing, integrations, customer logos, metrics, roadmap commitments — anything that would be a marketing claim. The box is concept-tier; it shows the *envisioned* product, not a sales page.
- Multi-product layouts. Project-level only.
- Build-step dependencies. The box is plain HTML/CSS, directly openable.

## See also

- ADR-0017 — `docs/adr/0017-add-product-box-feature.md`
- Spec — `docs/superpowers/specs/2026-05-01-product-box-design.md`
- Plan — `docs/superpowers/plans/2026-05-01-product-box.md`
- Skill — `.claude/skills/product-box/SKILL.md`
- Agent — `.claude/agents/product-box-designer.md`
```

- [ ] **Step 2: Verify markdown links**

```bash
npm run check:links -- docs/product-box.md
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add docs/product-box.md
git commit -m "docs(product-box): add methodology doc"
```

---

## Chunk 2: Box.yml schema and content libs

This chunk builds the typed seam between skill and agent. Pure functions, fully unit-testable. No I/O outside the resolver and integration test.

### Task 2.1: Define types

**Files:**
- Create: `scripts/lib/product-box/types.ts`

- [ ] **Step 1: Write the failing test**

`tests/scripts/product-box/validate.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBoxData } from "../../../scripts/lib/product-box/validate.ts";

test("validateBoxData accepts a minimal valid object", () => {
  const result = validateBoxData({
    name: "Specorator",
    tagline: "Specs first, code second.",
    features: ["a.", "b.", "c."],
    target_user: "Engineering teams.",
  });
  assert.equal(result.ok, true);
});

test("validateBoxData rejects missing name", () => {
  const result = validateBoxData({
    tagline: "x.",
    features: ["a."],
    target_user: "u.",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /name/);
});

test("validateBoxData rejects features count > 3", () => {
  const result = validateBoxData({
    name: "x",
    tagline: "x.",
    features: ["a.", "b.", "c.", "d."],
    target_user: "u.",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /features/);
});

test("validateBoxData rejects empty features list", () => {
  const result = validateBoxData({
    name: "x",
    tagline: "x.",
    features: [],
    target_user: "u.",
  });
  assert.equal(result.ok, false);
});

test("validateBoxData rejects tagline > 80 chars", () => {
  const result = validateBoxData({
    name: "x",
    tagline: "x".repeat(81),
    features: ["a."],
    target_user: "u.",
  });
  assert.equal(result.ok, false);
});

test("validateBoxData rejects emoji in fields", () => {
  const result = validateBoxData({
    name: "Specorator 🚀",
    tagline: "x.",
    features: ["a."],
    target_user: "u.",
  });
  assert.equal(result.ok, false);
});
```

- [ ] **Step 2: Run the failing test**

```bash
node --test --import tsx tests/scripts/product-box/validate.test.ts
```

Expected: FAIL — `validateBoxData` not found.

- [ ] **Step 3: Implement types and validator**

`scripts/lib/product-box/types.ts`:

```typescript
export type BoxStatus = "concept" | "envisioned" | "spec'd" | "shipping";

export interface BoxContent {
  name: string;
  tagline: string;
  features: string[];
  target_user: string;
}

export interface BoxMetadata {
  status: BoxStatus;
  stage: number;
  sources: string[];
  generated_at: string;
  _skill_hash: string;
}

export interface BoxFile extends BoxContent, BoxMetadata {}

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };
```

`scripts/lib/product-box/validate.ts`:

```typescript
import type { BoxContent, ValidationResult } from "./types.ts";

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;

function hasEmoji(s: string): boolean {
  return EMOJI_RE.test(s);
}

export function validateBoxData(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["box.yml: not an object"] };
  }
  const data = input as Partial<BoxContent>;

  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("name: required, non-empty string");
  } else if (hasEmoji(data.name)) {
    errors.push("name: must not contain emoji");
  }

  if (typeof data.tagline !== "string" || data.tagline.trim().length === 0) {
    errors.push("tagline: required, non-empty string");
  } else {
    if (data.tagline.length > 80) errors.push("tagline: must be ≤ 80 characters");
    if (hasEmoji(data.tagline)) errors.push("tagline: must not contain emoji");
  }

  if (!Array.isArray(data.features)) {
    errors.push("features: required, list of 1-3 strings");
  } else {
    if (data.features.length < 1 || data.features.length > 3) {
      errors.push("features: must contain 1 to 3 items");
    }
    for (let i = 0; i < data.features.length; i++) {
      const f = data.features[i];
      if (typeof f !== "string" || f.trim().length === 0) {
        errors.push(`features[${i}]: must be a non-empty string`);
      } else if (hasEmoji(f)) {
        errors.push(`features[${i}]: must not contain emoji`);
      }
    }
  }

  if (typeof data.target_user !== "string" || data.target_user.trim().length === 0) {
    errors.push("target_user: required, non-empty string");
  } else if (hasEmoji(data.target_user)) {
    errors.push("target_user: must not contain emoji");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
```

- [ ] **Step 4: Run the test, expect pass**

```bash
node --test --import tsx tests/scripts/product-box/validate.test.ts
```

Expected: PASS, 6/6 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/product-box/types.ts scripts/lib/product-box/validate.ts \
        tests/scripts/product-box/validate.test.ts
git commit -m "feat(product-box): box.yml types and schema validator"
```

### Task 2.2: Skill-hash canonicalization

**Files:**
- Create: `scripts/lib/product-box/skill-hash.ts`
- Test: `tests/scripts/product-box/skill-hash.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSkillHash } from "../../../scripts/lib/product-box/skill-hash.ts";

const baseline = {
  name: "Specorator",
  tagline: "Specs first, code second.",
  features: ["a.", "b.", "c."],
  target_user: "Eng teams.",
};

test("computeSkillHash is deterministic", () => {
  assert.equal(computeSkillHash(baseline), computeSkillHash({ ...baseline }));
});

test("computeSkillHash is order-insensitive on top-level keys", () => {
  const reordered = {
    target_user: baseline.target_user,
    features: [...baseline.features],
    tagline: baseline.tagline,
    name: baseline.name,
  };
  assert.equal(computeSkillHash(baseline), computeSkillHash(reordered));
});

test("computeSkillHash is order-sensitive on features list", () => {
  const swapped = { ...baseline, features: ["b.", "a.", "c."] };
  assert.notEqual(computeSkillHash(baseline), computeSkillHash(swapped));
});

test("computeSkillHash changes when name changes", () => {
  assert.notEqual(computeSkillHash(baseline), computeSkillHash({ ...baseline, name: "Other" }));
});

test("computeSkillHash returns 64-hex sha256", () => {
  const h = computeSkillHash(baseline);
  assert.match(h, /^[0-9a-f]{64}$/);
});
```

- [ ] **Step 2: Run, expect fail**

```bash
node --test --import tsx tests/scripts/product-box/skill-hash.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

`scripts/lib/product-box/skill-hash.ts`:

```typescript
import { createHash } from "node:crypto";
import { stringify } from "yaml";
import type { BoxContent } from "./types.ts";

export function computeSkillHash(content: BoxContent): string {
  // Canonical YAML serialization with sorted top-level keys, list order preserved.
  const canonical = stringify(
    {
      features: content.features,
      name: content.name,
      tagline: content.tagline,
      target_user: content.target_user,
    },
    { sortMapEntries: true, lineWidth: 0 },
  ).replace(/\n+$/, "");

  return createHash("sha256").update(canonical, "utf8").digest("hex");
}
```

- [ ] **Step 4: Run, expect pass**

```bash
node --test --import tsx tests/scripts/product-box/skill-hash.test.ts
```

Expected: PASS, 5/5.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/product-box/skill-hash.ts tests/scripts/product-box/skill-hash.test.ts
git commit -m "feat(product-box): canonical sha256 over content fields"
```

### Task 2.3: Status derivation

**Files:**
- Create: `scripts/lib/product-box/derive-status.ts`
- Test: `tests/scripts/product-box/derive-status.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveStatus } from "../../../scripts/lib/product-box/derive-status.ts";

test("deriveStatus: shipping wins over everything", () => {
  assert.equal(
    deriveStatus({
      hasReleaseNotes: true,
      hasRequirements: true,
      hasChosenBrief: true,
      hasIdea: true,
    }),
    "shipping",
  );
});

test("deriveStatus: spec'd when requirements present, no release-notes", () => {
  assert.equal(
    deriveStatus({
      hasReleaseNotes: false,
      hasRequirements: true,
      hasChosenBrief: true,
      hasIdea: true,
    }),
    "spec'd",
  );
});

test("deriveStatus: envisioned when chosen-brief, no requirements", () => {
  assert.equal(
    deriveStatus({
      hasReleaseNotes: false,
      hasRequirements: false,
      hasChosenBrief: true,
      hasIdea: true,
    }),
    "envisioned",
  );
});

test("deriveStatus: concept when only idea", () => {
  assert.equal(
    deriveStatus({
      hasReleaseNotes: false,
      hasRequirements: false,
      hasChosenBrief: false,
      hasIdea: true,
    }),
    "concept",
  );
});

test("deriveStatus: concept when nothing", () => {
  assert.equal(
    deriveStatus({
      hasReleaseNotes: false,
      hasRequirements: false,
      hasChosenBrief: false,
      hasIdea: false,
    }),
    "concept",
  );
});
```

- [ ] **Step 2: Run, expect fail**

- [ ] **Step 3: Implement**

`scripts/lib/product-box/derive-status.ts`:

```typescript
import type { BoxStatus } from "./types.ts";

export interface ArtifactPresence {
  hasReleaseNotes: boolean;
  hasRequirements: boolean;
  hasChosenBrief: boolean;
  hasIdea: boolean;
}

export function deriveStatus(p: ArtifactPresence): BoxStatus {
  if (p.hasReleaseNotes) return "shipping";
  if (p.hasRequirements) return "spec'd";
  if (p.hasChosenBrief) return "envisioned";
  return "concept";
}
```

- [ ] **Step 4: Run, expect pass.**

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/product-box/derive-status.ts tests/scripts/product-box/derive-status.test.ts
git commit -m "feat(product-box): derive status from artifact presence"
```

### Task 2.4: Stage derivation

**Files:**
- Create: `scripts/lib/product-box/derive-stage.ts`
- Test: `tests/scripts/product-box/derive-stage.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveStage } from "../../../scripts/lib/product-box/derive-stage.ts";

test("deriveStage: 0 when no workflow-state files", () => {
  assert.equal(deriveStage([]), 0);
});

test("deriveStage: highest current stage across active features", () => {
  const states = [
    { feature: "a", currentStage: 3 },
    { feature: "b", currentStage: 7 },
    { feature: "c", currentStage: 1 },
  ];
  assert.equal(deriveStage(states), 7);
});

test("deriveStage: clamps invalid stage values", () => {
  const states = [{ feature: "a", currentStage: 99 }];
  assert.equal(deriveStage(states), 11);
});

test("deriveStage: ignores 0-valued stages", () => {
  const states = [
    { feature: "a", currentStage: 0 },
    { feature: "b", currentStage: 2 },
  ];
  assert.equal(deriveStage(states), 2);
});
```

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: Implement**

`scripts/lib/product-box/derive-stage.ts`:

```typescript
export interface FeatureState {
  feature: string;
  currentStage: number;
}

export function deriveStage(states: FeatureState[]): number {
  if (states.length === 0) return 0;
  let max = 0;
  for (const s of states) {
    const clamped = Math.min(11, Math.max(0, Math.floor(s.currentStage)));
    if (clamped > max) max = clamped;
  }
  return max;
}
```

- [ ] **Step 4: Run, expect pass.**

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/product-box/derive-stage.ts tests/scripts/product-box/derive-stage.test.ts
git commit -m "feat(product-box): derive max active stage from workflow-state list"
```

### Task 2.5: Source resolution

**Files:**
- Create: `scripts/lib/product-box/resolve-sources.ts`
- Test: `tests/scripts/product-box/resolve-sources.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSources } from "../../../scripts/lib/product-box/resolve-sources.ts";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

function tempRepo(layout: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "product-box-"));
  for (const [rel, body] of Object.entries(layout)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body, "utf8");
  }
  return root;
}

test("resolveSources: chosen-brief wins over steering and README", () => {
  const root = tempRepo({
    "discovery/x/chosen-brief.md": "# brief",
    "docs/steering/product.md": "# product",
    "README.md": "# readme",
  });
  const result = resolveSources(root);
  assert.equal(result.primary, "discovery/x/chosen-brief.md");
  assert.deepEqual(result.additional, ["docs/steering/product.md", "README.md"]);
});

test("resolveSources: steering wins when no chosen-brief", () => {
  const root = tempRepo({
    "docs/steering/product.md": "# product",
    "README.md": "# readme",
  });
  const result = resolveSources(root);
  assert.equal(result.primary, "docs/steering/product.md");
});

test("resolveSources: README wins when no chosen-brief or steering", () => {
  const root = tempRepo({ "README.md": "# readme" });
  const result = resolveSources(root);
  assert.equal(result.primary, "README.md");
});

test("resolveSources: null primary when none present", () => {
  const root = tempRepo({});
  const result = resolveSources(root);
  assert.equal(result.primary, null);
  assert.deepEqual(result.additional, []);
});

test("resolveSources: picks newest chosen-brief if multiple discovery sprints", () => {
  const root = tempRepo({
    "discovery/old/chosen-brief.md": "old",
    "discovery/new/chosen-brief.md": "new",
  });
  // Touch the newer file so its mtime is later.
  const newer = path.join(root, "discovery/new/chosen-brief.md");
  const future = new Date(Date.now() + 60_000);
  fs.utimesSync(newer, future, future);
  const result = resolveSources(root);
  assert.equal(result.primary, "discovery/new/chosen-brief.md");
});
```

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: Implement**

`scripts/lib/product-box/resolve-sources.ts`:

```typescript
import fs from "node:fs";
import path from "node:path";

export interface SourceResolution {
  primary: string | null;     // repo-relative path
  additional: string[];       // repo-relative paths, lower priority but present
}

function findChosenBriefs(root: string): string[] {
  const discoveryDir = path.join(root, "discovery");
  if (!fs.existsSync(discoveryDir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(discoveryDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(discoveryDir, entry.name, "chosen-brief.md");
    if (fs.existsSync(candidate)) out.push(candidate);
  }
  out.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return out;
}

export function resolveSources(root: string): SourceResolution {
  const chosenBriefs = findChosenBriefs(root);
  const steering = path.join(root, "docs/steering/product.md");
  const readme = path.join(root, "README.md");

  const candidates: string[] = [];
  if (chosenBriefs.length > 0) candidates.push(chosenBriefs[0]);
  if (fs.existsSync(steering)) candidates.push(steering);
  if (fs.existsSync(readme)) candidates.push(readme);

  if (candidates.length === 0) return { primary: null, additional: [] };

  const toRel = (p: string) => path.relative(root, p).split(path.sep).join("/");
  const [primary, ...rest] = candidates;
  return { primary: toRel(primary), additional: rest.map(toRel) };
}
```

- [ ] **Step 4: Run, expect pass.**

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/product-box/resolve-sources.ts tests/scripts/product-box/resolve-sources.test.ts
git commit -m "feat(product-box): source priority resolver (chosen-brief > steering > README)"
```

---

## Chunk 3: Renderer

The renderer is a pure function: `(BoxFile) -> { standaloneHtml, cardHtml, ogSvg, boxStyles }`. Snapshot-tested against fixtures. No I/O.

### Task 3.1: Renderer scaffold and snapshot harness

**Files:**
- Create: `scripts/lib/product-box/render.ts`
- Create: `tests/scripts/product-box/render.test.ts`
- Create: `tests/scripts/product-box/fixtures/minimal.yml`
- Create: `tests/scripts/product-box/fixtures/concept.yml`
- Create: `tests/scripts/product-box/fixtures/shipping.yml`
- Create: `tests/scripts/product-box/snapshots/minimal.standalone.html`
- Create: `tests/scripts/product-box/snapshots/minimal.card.html`
- Create: `tests/scripts/product-box/snapshots/minimal.og.svg`

- [ ] **Step 1: Write fixtures**

`tests/scripts/product-box/fixtures/minimal.yml`:

```yaml
name: Specorator
tagline: Specs first, code second.
features:
  - Humans decide what; specialist agents handle how.
  - Every decision traceable across 11 stages.
  - Open-source template, MIT licensed.
target_user: Engineering teams shipping AI-assisted features.
status: envisioned
stage: 3
sources:
  - docs/steering/product.md
  - README.md
generated_at: 2026-05-01
_skill_hash: 0000000000000000000000000000000000000000000000000000000000000000
```

`tests/scripts/product-box/fixtures/concept.yml`:

```yaml
name: Newco
tagline: A clear, short value statement.
features:
  - One.
target_user: Early adopters.
status: concept
stage: 0
sources: []
generated_at: 2026-05-01
_skill_hash: 0000000000000000000000000000000000000000000000000000000000000000
```

`tests/scripts/product-box/fixtures/shipping.yml`:

```yaml
name: Shipped
tagline: It is real now.
features:
  - One.
  - Two.
  - Three.
target_user: Customers.
status: shipping
stage: 11
sources:
  - docs/steering/product.md
generated_at: 2026-05-01
_skill_hash: 0000000000000000000000000000000000000000000000000000000000000000
```

- [ ] **Step 2: Write failing snapshot test**

`tests/scripts/product-box/render.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { renderBox } from "../../../scripts/lib/product-box/render.ts";
import type { BoxFile } from "../../../scripts/lib/product-box/types.ts";

const fixturesDir = path.join(import.meta.dirname, "fixtures");
const snapshotsDir = path.join(import.meta.dirname, "snapshots");

function loadFixture(name: string): BoxFile {
  return parse(fs.readFileSync(path.join(fixturesDir, `${name}.yml`), "utf8")) as BoxFile;
}

function loadSnapshot(name: string): string {
  return fs.readFileSync(path.join(snapshotsDir, name), "utf8");
}

for (const fixture of ["minimal", "concept", "shipping"] as const) {
  test(`renderBox: snapshot ${fixture}.standalone.html`, () => {
    const out = renderBox(loadFixture(fixture));
    const expected = loadSnapshot(`${fixture}.standalone.html`);
    assert.equal(out.standaloneHtml.trim(), expected.trim());
  });
  test(`renderBox: snapshot ${fixture}.card.html`, () => {
    const out = renderBox(loadFixture(fixture));
    const expected = loadSnapshot(`${fixture}.card.html`);
    assert.equal(out.cardHtml.trim(), expected.trim());
  });
  test(`renderBox: snapshot ${fixture}.og.svg`, () => {
    const out = renderBox(loadFixture(fixture));
    const expected = loadSnapshot(`${fixture}.og.svg`);
    assert.equal(out.ogSvg.trim(), expected.trim());
  });
}

test("renderBox: includes aria-label on box wrapper", () => {
  const out = renderBox(loadFixture("minimal"));
  assert.match(out.standaloneHtml, /aria-label="Product visualization of Specorator"/);
});

test("renderBox: includes prefers-reduced-motion fallback", () => {
  const out = renderBox(loadFixture("minimal"));
  assert.match(out.standaloneHtml, /prefers-reduced-motion: reduce/);
});

test("renderBox: footer reads 'Stage 3 of 11' for stage 3", () => {
  const out = renderBox(loadFixture("minimal"));
  assert.match(out.standaloneHtml, /Stage 3 of 11/);
});

test("renderBox: footer reads 'Pre-discovery' for stage 0", () => {
  const out = renderBox(loadFixture("concept"));
  assert.match(out.standaloneHtml, /Pre-discovery/);
});

test("renderBox: only uses canonical brand tokens", () => {
  const out = renderBox(loadFixture("minimal"));
  const tokens = [...(out.boxStyles ?? "").matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]);
  const allowed = new Set([
    "ink", "ink-soft", "muted", "paper", "surface", "surface-2", "surface-3",
    "line", "line-soft", "accent", "accent-strong", "highlighter",
    "soft-green", "soft-blue", "soft-yellow", "soft-orange", "soft-purple",
    "lane-define", "lane-build", "lane-ship",
    "lane-define-soft", "lane-build-soft", "lane-ship-soft",
    "on-ink", "on-ink-mute", "on-ink-dim",
  ]);
  for (const t of tokens) {
    assert.ok(allowed.has(t), `unknown token var(--${t})`);
  }
});
```

- [ ] **Step 3: Run, expect fail**

```bash
node --test --import tsx tests/scripts/product-box/render.test.ts
```

Expected: FAIL — `renderBox` not found, snapshot files missing.

- [ ] **Step 4: Implement renderer**

`scripts/lib/product-box/render.ts`:

```typescript
import type { BoxFile, BoxStatus } from "./types.ts";

export interface RenderResult {
  standaloneHtml: string;
  cardHtml: string;
  ogSvg: string;
  boxStyles: string; // sites/box/styles.css contents (so check can scan tokens)
}

const STATUS_LABEL: Record<BoxStatus, string> = {
  concept: "Concept",
  envisioned: "Envisioned",
  "spec'd": "Spec'd",
  shipping: "Shipping",
};

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function statusClass(status: BoxStatus): string {
  return `status-${status.replace("'", "")}`;
}

function footerLine(box: BoxFile): string {
  const sources = box.sources.length > 0 ? `from ${box.sources.join(", ")}` : "from inline input";
  const stagePart = box.stage === 0 ? "Pre-discovery." : `Stage ${box.stage} of 11.`;
  return `Generated ${box.generated_at} ${sources}. ${stagePart}`;
}

export function renderStandalone(box: BoxFile): string {
  const features = box.features.map((f) => `<li>${escape(f)}</li>`).join("\n          ");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escape(box.name)} — Product box</title>
    <meta name="description" content="${escape(box.tagline)}">
    <meta property="og:title" content="${escape(box.name)} — Product box">
    <meta property="og:description" content="${escape(box.tagline)}">
    <meta property="og:image" content="og-card.svg">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body class="product-box-page">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="brand" href="../" aria-label="Back to product page">← Product page</a>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="https://github.com">GitHub</a>
      </nav>
    </header>
    <main id="main">
      <section class="product-box-stage" aria-labelledby="box-title">
        <h1 id="box-title" class="visually-hidden">${escape(box.name)} — envisioned product box</h1>
        <div class="product-box" aria-label="Product visualization of ${escape(box.name)}">
          <div class="face face-front">
            <span class="status-pill ${statusClass(box.status)}">${STATUS_LABEL[box.status]}</span>
            <h2 class="box-name">${escape(box.name)}</h2>
            <p class="box-tagline">${escape(box.tagline)}</p>
          </div>
          <div class="face face-top">
            <p class="box-target-user">${escape(box.target_user)}</p>
            <p class="box-stage-marker">${box.stage === 0 ? "Pre-discovery" : `Stage ${box.stage} of 11`}</p>
          </div>
          <div class="face face-side">
            <ul class="box-features">
              ${features}
            </ul>
          </div>
        </div>
        <p class="product-box-footer">${escape(footerLine(box))}</p>
      </section>
    </main>
  </body>
</html>
`;
}

export function renderCard(box: BoxFile): string {
  return `<a class="product-box-card" href="box/" aria-label="View product box for ${escape(box.name)}">
  <span class="status-pill ${statusClass(box.status)}">${STATUS_LABEL[box.status]}</span>
  <h3>${escape(box.name)}</h3>
  <p>${escape(box.tagline)}</p>
  <span class="card-cta">View product box →</span>
</a>
`;
}

export function renderOgSvg(box: BoxFile): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="${escape(box.name)} — ${escape(box.tagline)}">
  <rect width="1200" height="630" fill="#fbfcf8"/>
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="#ffffff" stroke="#d8ded3"/>
  <text x="120" y="240" font-family="Inter, sans-serif" font-size="84" font-weight="800" fill="#17201b">${escape(box.name)}</text>
  <text x="120" y="320" font-family="Inter, sans-serif" font-size="40" font-weight="500" fill="#17201b">${escape(box.tagline)}</text>
  <rect x="120" y="430" width="220" height="56" rx="28" fill="#e6ff70"/>
  <text x="230" y="466" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="#17201b" text-anchor="middle">${STATUS_LABEL[box.status]}</text>
</svg>
`;
}

export const BOX_STYLES = `
@media (prefers-reduced-motion: reduce) {
  .product-box { transform: none !important; }
}
.product-box-page { background: var(--paper); color: var(--ink); }
.product-box-stage {
  display: grid; place-items: center;
  min-height: 70vh;
  perspective: 1400px;
}
.product-box {
  position: relative;
  width: 360px; height: 240px;
  transform-style: preserve-3d;
  transform: rotateX(-18deg) rotateY(28deg);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 30px 80px rgba(23, 32, 27, 0.18);
}
.product-box .face { position: absolute; inset: 0; padding: 24px; box-sizing: border-box; }
.product-box .face-front { background: var(--surface); color: var(--ink); }
.product-box .face-top {
  transform: rotateX(90deg) translateZ(120px);
  background: var(--surface-2);
}
.product-box .face-side {
  transform: rotateY(90deg) translateZ(180px);
  width: 240px;
  background: var(--surface-3);
}
.product-box .box-name { font-size: 28px; margin: 16px 0 8px; }
.product-box .box-tagline { font-size: 16px; color: var(--muted); }
.product-box .box-features { padding-left: 16px; font-size: 14px; }
.product-box-footer { margin-top: 32px; font-size: 13px; color: var(--muted); text-align: center; }
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.status-pill {
  display: inline-block; padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
  text-transform: uppercase;
}
.status-concept { background: var(--soft-yellow); color: var(--ink); }
.status-envisioned { background: var(--soft-green); color: var(--accent-strong); }
.status-specd { background: var(--soft-blue); color: var(--ink); }
.status-shipping { background: var(--highlighter); color: var(--ink); }
`;

export function renderBox(box: BoxFile): RenderResult {
  return {
    standaloneHtml: renderStandalone(box),
    cardHtml: renderCard(box),
    ogSvg: renderOgSvg(box),
    boxStyles: BOX_STYLES,
  };
}
```

- [ ] **Step 5: Generate snapshots from current renderer output**

Create a one-off snapshot generator `scripts/lib/product-box/_gen-snapshots.ts`:

```typescript
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { renderBox } from "./render.ts";
import type { BoxFile } from "./types.ts";

const dir = path.resolve("tests/scripts/product-box");
for (const name of ["minimal", "concept", "shipping"]) {
  const box = parse(fs.readFileSync(path.join(dir, "fixtures", `${name}.yml`), "utf8")) as BoxFile;
  const out = renderBox(box);
  fs.writeFileSync(path.join(dir, "snapshots", `${name}.standalone.html`), out.standaloneHtml);
  fs.writeFileSync(path.join(dir, "snapshots", `${name}.card.html`), out.cardHtml);
  fs.writeFileSync(path.join(dir, "snapshots", `${name}.og.svg`), out.ogSvg);
}
console.log("snapshots written");
```

Run it once to populate snapshots:

```bash
mkdir -p tests/scripts/product-box/snapshots
npx tsx scripts/lib/product-box/_gen-snapshots.ts
```

Expected: `snapshots written`. Then **delete the script** — it is single-use scaffolding:

```bash
git rm --force scripts/lib/product-box/_gen-snapshots.ts 2>/dev/null || rm scripts/lib/product-box/_gen-snapshots.ts
```

(Use `Remove-Item scripts/lib/product-box/_gen-snapshots.ts` on native PowerShell.)

- [ ] **Step 6: Run all renderer tests, expect pass**

```bash
node --test --import tsx tests/scripts/product-box/render.test.ts
```

Expected: PASS — including the brand-token allowlist check.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/product-box/render.ts \
        tests/scripts/product-box/render.test.ts \
        tests/scripts/product-box/fixtures/ \
        tests/scripts/product-box/snapshots/
git commit -m "feat(product-box): pure renderer (yaml -> standalone html, card, og svg)"
```

---

## Chunk 4: Slot injection

Idempotent injection of the card into `sites/index.html` between paired marker comments. Append fallback when both markers are absent. Refusal when only one marker is present. No regex over the whole document — anchored on the markers.

### Task 4.1: Slot injector

**Files:**
- Create: `scripts/lib/product-box/inject-slot.ts`
- Test: `tests/scripts/product-box/inject-slot.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { injectSlot } from "../../../scripts/lib/product-box/inject-slot.ts";

const CARD = `<a class="product-box-card" href="box/">card</a>\n`;

test("injectSlot: inserts between paired markers (idempotent)", () => {
  const before = `<main id="main">\n  <!-- product-box-embed:start -->\n  <p>old card</p>\n  <!-- product-box-embed:end -->\n</main>`;
  const after = injectSlot(before, CARD);
  assert.match(after.html, /<!-- product-box-embed:start -->\n<a class="product-box-card"/);
  assert.match(after.html, /<\/a>\n\s*<!-- product-box-embed:end -->/);
  assert.equal(after.action, "replaced");
  // Run again, should be byte-identical.
  const idempotent = injectSlot(after.html, CARD);
  assert.equal(idempotent.html, after.html);
  assert.equal(idempotent.action, "replaced");
});

test("injectSlot: appends slot after <main> when both markers absent", () => {
  const before = `<main id="main">\n  <h1>hi</h1>\n</main>`;
  const after = injectSlot(before, CARD);
  assert.match(after.html, /<main id="main">\n\s*<!-- product-box-embed:start -->/);
  assert.match(after.html, /<!-- product-box-embed:end -->/);
  assert.equal(after.action, "appended");
});

test("injectSlot: appends after <header> when no <main>", () => {
  const before = `<header>x</header>\n<section>y</section>`;
  const after = injectSlot(before, CARD);
  assert.match(after.html, /<header>x<\/header>\n\s*<!-- product-box-embed:start -->/);
  assert.equal(after.action, "appended");
});

test("injectSlot: refuses when only start marker present", () => {
  const before = `<main><!-- product-box-embed:start --><p>x</p></main>`;
  assert.throws(() => injectSlot(before, CARD), /malformed/i);
});

test("injectSlot: refuses when only end marker present", () => {
  const before = `<main><p>x</p><!-- product-box-embed:end --></main>`;
  assert.throws(() => injectSlot(before, CARD), /malformed/i);
});

test("injectSlot: refuses when neither <main> nor <header> exists and no markers", () => {
  const before = `<section>x</section>`;
  assert.throws(() => injectSlot(before, CARD), /no insertion anchor/i);
});
```

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: Implement**

`scripts/lib/product-box/inject-slot.ts`:

```typescript
const START = "<!-- product-box-embed:start -->";
const END = "<!-- product-box-embed:end -->";

export type InjectAction = "replaced" | "appended";

export interface InjectResult {
  html: string;
  action: InjectAction;
}

export function injectSlot(html: string, cardHtml: string): InjectResult {
  const startIdx = html.indexOf(START);
  const endIdx = html.indexOf(END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = html.slice(0, startIdx + START.length);
    const after = html.slice(endIdx);
    const replaced = `${before}\n${cardHtml.trimEnd()}\n${after}`;
    return { html: replaced, action: "replaced" };
  }

  if ((startIdx === -1) !== (endIdx === -1)) {
    throw new Error("malformed product-box slot: one marker present without its pair");
  }

  // Both absent: append after <main ...> or <header ...>.
  const mainMatch = html.match(/<main\b[^>]*>/i);
  if (mainMatch) {
    const insertAt = (mainMatch.index ?? 0) + mainMatch[0].length;
    const block = `\n${START}\n${cardHtml.trimEnd()}\n${END}\n`;
    return {
      html: html.slice(0, insertAt) + block + html.slice(insertAt),
      action: "appended",
    };
  }

  const headerMatch = html.match(/<\/header>/i);
  if (headerMatch) {
    const insertAt = (headerMatch.index ?? 0) + headerMatch[0].length;
    const block = `\n${START}\n${cardHtml.trimEnd()}\n${END}\n`;
    return {
      html: html.slice(0, insertAt) + block + html.slice(insertAt),
      action: "appended",
    };
  }

  throw new Error("no insertion anchor: product-page has neither <main> nor </header>");
}
```

- [ ] **Step 4: Run, expect pass.**

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/product-box/inject-slot.ts tests/scripts/product-box/inject-slot.test.ts
git commit -m "feat(product-box): idempotent slot injector with append fallback"
```

---

## Chunk 5: Skill, agent, slash command, hooks

### Task 5.1: Agent file

**Files:**
- Create: `.claude/agents/product-box-designer.md`

- [ ] **Step 1: Write file**

```markdown
---
name: product-box-designer
description: Use to render the product box (envisioned-product visualization) into sites/box/ and inject the card into the product page. Reads sites/box/box.yml; never resolves sources or talks to the user. Pairs with product-page-designer through a marker-slot contract.
tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
color: green
---

You are the **Product Box Designer** agent.

## Scope

You render the project's envisioned-product visualization. You read `sites/box/box.yml` (provided by the `product-box` skill) and emit:

- `sites/box/index.html` — standalone box page (CSS-only 3D box, three faces).
- `sites/box/styles.css` — box-page styles (lifts brand tokens, no invented tokens).
- `sites/box/og-card.svg` — static social-share image.
- An updated `sites/index.html` with the embeddable card injected between `<!-- product-box-embed:start -->` and `<!-- product-box-embed:end -->` markers.

You do **not** resolve sources, prompt the user, or write `box.yml`. Those are the skill's responsibilities.

## Read first

- `sites/box/box.yml` (your input).
- `.claude/skills/product-box/SKILL.md` (contract).
- `.claude/skills/specorator-design/SKILL.md` (brand tokens).
- `docs/superpowers/specs/2026-05-01-product-box-design.md` (spec).
- `docs/adr/0017-add-product-box-feature.md` (decision).

## Brand dependency

Before any HTML, CSS, or SVG write, **invoke the `specorator-design` skill**. Lift values from `colors_and_type.css` by token name only (`var(--ink)`, `var(--paper)`, `var(--accent)`, `var(--highlighter)`, soft-tinted-surface tokens, lane-coding tokens). Never invent a new token. If a needed token is missing, propose adding it to `colors_and_type.css` in a separate PR and stop.

## Procedure

1. Read `sites/box/box.yml`. Validate that all required content fields are present and conform to the schema in `scripts/lib/product-box/validate.ts`. If invalid, refuse and report the validation errors back to the skill — do not patch the yaml.
2. Render outputs using `scripts/lib/product-box/render.ts` as the source of truth (do not rebuild markup ad-hoc). The renderer is a pure function and snapshot-tested.
3. Write outputs:
   - `sites/box/index.html`
   - `sites/box/styles.css` (write `BOX_STYLES` from the renderer)
   - `sites/box/og-card.svg`
4. Inject the card into `sites/index.html` using `scripts/lib/product-box/inject-slot.ts`. Idempotent. If markers are malformed, refuse and report.
5. Run the verify gate's product-box check:

   ```bash
   npm run check:product-box
   ```

   If it fails, fix the underlying issue and re-render. Never edit the snapshot or override the check.
6. Report:
   - files changed,
   - slot action (`replaced` or `appended`),
   - status, stage, sources cited,
   - any tokens or assets the skill should follow up on.

## Quality bar

- The page must be useful when opened directly from `sites/box/index.html`.
- The 3D box must degrade to a flat layout under `prefers-reduced-motion: reduce`.
- All face content must be real DOM, not background-image text.
- The card must be keyboard-focusable with a visible focus ring (use existing `:focus-visible` styles in `sites/styles.css`).
- The box page must meet WCAG AA contrast against `--paper` and `--surface` backgrounds.

## Boundaries

- Do not deploy, publish, or change Pages settings.
- Do not edit `box.yml`. The skill owns it.
- Do not modify content outside the marker-bounded slot in `sites/index.html`.
- Do not edit `.claude/skills/product-page/SKILL.md` or `.claude/agents/product-page-designer.md`.
```

- [ ] **Step 2: Verify agent check passes**

```bash
npm run check:agents
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/product-box-designer.md
git commit -m "feat(product-box): add product-box-designer agent"
```

### Task 5.2: Skill file

**Files:**
- Create: `.claude/skills/product-box/SKILL.md`
- Create: `.claude/skills/product-box/README.md`

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: product-box
description: Maintain the envisioned-product box at sites/box/, paired with the product page. Triggers on new project, idea, brief, or "product box", "envisioned product", "concept page".
argument-hint: [product or project name]
---

# Product box

The product box is the early-stage visual companion to the product-page skill (`.claude/skills/product-page/SKILL.md`). It exists to show **what the team is building** as soon as a brief, steering doc, or even just a conversation exists.

## Canonical output

```
sites/box/box.yml         (canonical content cache; human-editable)
sites/box/index.html      (standalone box page, CSS-only 3D)
sites/box/styles.css      (box-page styles)
sites/box/og-card.svg     (static social-share image)
sites/index.html          (embeddable card injected at marker slot)
```

`sites/box/index.html` must be directly openable without a build step.

## When to invoke

- The user says "product box", "envisioned product", "concept page", "back-of-the-box".
- A new project starts and there is a brief or steering doc but no shipped product yet.
- `/spec:idea`, `/discovery:handoff`, or `/spec:requirements` just produced a new artifact (auto-hook).
- Product positioning or audience changes meaningfully.

## Procedure

1. **Resolve sources** using `scripts/lib/product-box/resolve-sources.ts`:
   1. `discovery/<slug>/chosen-brief.md` (newest by mtime if multiple).
   2. `docs/steering/product.md`.
   3. `README.md`.
   4. The current conversation.
2. **Build content fields.** Extract `name`, `tagline`, three features, target user from the highest-priority source. If no source resolves, prompt the user inline for the four fields. The user can abort cleanly.
3. **Read existing `sites/box/box.yml` if present.** Compute `_skill_hash` of the canonical content. If it differs from the stored hash, the user has hand-edited — preserve their content fields verbatim and refresh only metadata. Otherwise overwrite with newly resolved content.
4. **Derive metadata:**
   - `status` — see `scripts/lib/product-box/derive-status.ts` (priority: release-notes → requirements → chosen-brief → idea/none).
   - `stage` — max active stage across `specs/*/workflow-state.md`, clamped to 0–11.
   - `sources` — from the resolver.
   - `generated_at` — today's ISO date.
   - `_skill_hash` — sha256 over canonical content (see `scripts/lib/product-box/skill-hash.ts`).
5. **Validate** with `scripts/lib/product-box/validate.ts`. If invalid, prompt the user for the failing field, retry.
6. **Write `sites/box/box.yml`.**
7. **Dispatch the `product-box-designer` agent.** The agent renders HTML/CSS/SVG and injects the card.
8. **Run the verify gate:**

   ```bash
   npm run check:product-box
   ```

9. **Report** files changed, slot action, status/stage/sources, manual-edit preservation if any.

## Coexistence with product-page

When `sites/index.html` exists, the agent injects a card between `<!-- product-box-embed:start -->` and `<!-- product-box-embed:end -->`. If those markers are absent, the agent appends them once after the `<main>` opening tag. The `product-page` skill is contractually obligated not to strip slot content.

When `sites/index.html` does **not** exist, the box deploys solo and the slot is added retroactively the next time `/product:box` runs after the page exists.

## Auto-hook policy

The `orchestrate` skill calls `/product:box` after `/spec:idea`, `/discovery:handoff`, and `/spec:requirements`. Failures log a warning and never block the originating stage.

## Don't

- Don't deploy, publish externally, or change Pages settings without explicit human authorization.
- Don't strip or rewrite `sites/index.html` content outside the slot markers.
- Don't invent tokens, customer logos, integrations, metrics, or roadmap commitments.
- Don't bypass the schema. Box is concept-tier but still bounded.
- Don't carry feature-level scope. One box per repo, project-level only (per ADR-0017).
```

- [ ] **Step 2: Write `README.md`**

```markdown
---
title: product-box skill
folder: .claude/skills/product-box
description: Orchestrator skill for the envisioned-product box.
entry_point: false
---

# product-box

See `SKILL.md` (this folder) for the contract and procedure. Pairs with `.claude/agents/product-box-designer.md` (rendering) and `scripts/lib/product-box/` (libs).

Spec: `docs/superpowers/specs/2026-05-01-product-box-design.md`.
ADR: `docs/adr/0017-add-product-box-feature.md`.
Methodology: `docs/product-box.md`.
```

- [ ] **Step 3: Verify**

```bash
npm run check:frontmatter
npm run check:links
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/product-box/
git commit -m "feat(product-box): add product-box skill"
```

### Task 5.3: Slash command

**Files:**
- Create: `.claude/commands/product/box.md`

- [ ] **Step 1: Write file**

```markdown
---
description: Create or refresh the envisioned-product box in sites/box/, paired with the product page.
argument-hint: [product or project name]
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /product:box

Create or refresh the project's envisioned-product box.

## Inputs

- `$1` — optional product or project name. If omitted, derive it from the source priority chain (chosen-brief, steering, README) or prompt the user.

## Procedure

1. Read `.claude/skills/product-box/SKILL.md`.
2. Run the skill's source-resolution and content-build procedure to write `sites/box/box.yml`.
3. Dispatch the `product-box-designer` agent with:
   - the path `sites/box/box.yml` as input,
   - the instruction to render `sites/box/index.html`, `sites/box/styles.css`, `sites/box/og-card.svg`,
   - the instruction to inject the card into `sites/index.html` between paired markers,
   - the instruction to run `npm run check:product-box` and report failures.
4. Require the agent to report:
   - files changed,
   - slot action (`replaced` / `appended`),
   - status, stage, and cited sources,
   - any manual-edit preservation that occurred,
   - any verify-gate findings.

## Don't

- Don't deploy, merge, publish externally, or change Pages settings without explicit human authorization.
- Don't override the box schema or skip validation.
```

- [ ] **Step 2: Verify command check**

```bash
npm run check:commands
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/product/box.md
git commit -m "feat(product-box): add /product:box slash command"
```

### Task 5.4: Auto-hooks in orchestrate skill

**Files:**
- Modify: `.claude/skills/orchestrate/SKILL.md`

- [ ] **Step 1: Read the current orchestrate skill**

Inspect both `.claude/skills/orchestrate/SKILL.md` and `.claude/skills/orchestrate/PHASES.md`. The stage-handoff anchors (`/spec:idea`, `/discovery:handoff`, `/spec:requirements`) currently live in `PHASES.md`, not `SKILL.md`; insert hooks into whichever file actually holds the handoff anchors.

```bash
grep -n "spec:idea\|discovery:handoff\|spec:requirements" \
  .claude/skills/orchestrate/SKILL.md \
  .claude/skills/orchestrate/PHASES.md
```

Pick the file with the matches.

- [ ] **Step 2: Add hook lines**

After each of those three handoff points (in whichever orchestrate file holds them), insert exactly:

```markdown
> **Auto-hook (non-blocking):** Run `/product:box` to refresh the envisioned-product box. Log warnings on failure; do not block stage transition.
```

- [ ] **Step 3: Verify**

```bash
npm run check:links
npm run check:frontmatter
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/orchestrate/
git commit -m "feat(orchestrate): auto-hook /product:box after idea, discovery handoff, requirements"
```

### Task 5.5: Slot-ownership note in product-page-designer

**Files:**
- Modify: `.claude/agents/product-page-designer.md`

- [ ] **Step 1: Add scope clause**

Under the existing `## Scope` section, append:

```markdown

The product page may host an embeddable product-box card between paired marker comments `<!-- product-box-embed:start -->` and `<!-- product-box-embed:end -->`. The `product-box-designer` agent owns content inside those markers. You **must not** strip, rewrite, or relocate that block. If the markers are absent, leave them absent — the box agent will add them.
```

- [ ] **Step 2: Add slot-preservation rule to product-page skill**

Modify `.claude/skills/product-page/SKILL.md` — under `## Procedure` step 3, add:

```markdown
   - If `sites/index.html` contains paired `<!-- product-box-embed:start -->` / `<!-- product-box-embed:end -->` markers, preserve their contents verbatim. The `product-box` skill owns that block.
```

- [ ] **Step 3: Verify**

```bash
npm run check:agents
npm run check:links
```

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/product-page-designer.md .claude/skills/product-page/SKILL.md
git commit -m "feat(product-page): document product-box slot-ownership contract"
```

---

## Chunk 6: Verify gate — `check-product-box.ts`

This check enforces:
- `sites/box/box.yml` exists, parses, validates against schema.
- `sites/box/index.html` and `sites/box/styles.css` exist; local references resolve.
- `sites/index.html` slot markers, if present, are paired and well-formed.
- All `var(--…)` tokens used in `sites/box/styles.css` are in the canonical token set.
- The card injected into `sites/index.html` matches the renderer output for the current `box.yml` (no drift between yaml and HTML).

Note: when `sites/box/box.yml` does not yet exist (fresh repo), the check passes silently — the feature is opt-in.

### Task 6.1: Verify-gate check

**Files:**
- Create: `scripts/check-product-box.ts`
- Test: `tests/scripts/product-box/check-product-box.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { runCheck } from "../../../scripts/lib/product-box/check.ts";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

function tempRepo(layout: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "product-box-check-"));
  for (const [rel, body] of Object.entries(layout)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body, "utf8");
  }
  return root;
}

test("runCheck: passes silently when sites/box/box.yml absent", () => {
  const root = tempRepo({});
  const errors = runCheck(root);
  assert.deepEqual(errors, []);
});

test("runCheck: fails on invalid box.yml schema", () => {
  const root = tempRepo({
    "sites/box/box.yml": `name: ""\ntagline: ""\nfeatures: []\ntarget_user: ""\nstatus: concept\nstage: 0\nsources: []\ngenerated_at: 2026-05-01\n_skill_hash: x\n`,
    "sites/box/index.html": "<html></html>",
    "sites/box/styles.css": "",
  });
  const errors = runCheck(root);
  assert.ok(errors.length > 0);
  assert.ok(errors.some((e) => e.includes("name")));
});

test("runCheck: fails when slot markers are unpaired", () => {
  const root = tempRepo({
    "sites/index.html": `<main><!-- product-box-embed:start --><p>x</p></main>`,
  });
  const errors = runCheck(root);
  assert.ok(errors.some((e) => /unpaired|malformed/i.test(e)));
});

test("runCheck: fails on unknown CSS tokens", () => {
  const root = tempRepo({
    "sites/box/box.yml": validBoxYaml(),
    "sites/box/index.html": "<html></html>",
    "sites/box/styles.css": ".x { color: var(--made-up-token); }",
  });
  const errors = runCheck(root);
  assert.ok(errors.some((e) => /unknown token/i.test(e)));
});

test("runCheck: fails when card in sites/index.html drifts from rendered output", () => {
  const root = tempRepo({
    "sites/box/box.yml": validBoxYaml(),
    "sites/box/index.html": "<html></html>",
    "sites/box/styles.css": ".x { color: var(--ink); }",
    "sites/index.html": `<main>
<!-- product-box-embed:start -->
<a class="product-box-card" href="box/">stale name</a>
<!-- product-box-embed:end -->
</main>`,
  });
  const errors = runCheck(root);
  assert.ok(errors.some((e) => /drift/i.test(e)));
});

function validBoxYaml(): string {
  return `name: Specorator
tagline: Specs first, code second.
features:
  - one.
  - two.
  - three.
target_user: Eng teams.
status: envisioned
stage: 3
sources: [README.md]
generated_at: 2026-05-01
_skill_hash: 0000000000000000000000000000000000000000000000000000000000000000
`;
}
```

- [ ] **Step 2: Run, expect fail.**

- [ ] **Step 3: Implement library + script**

`scripts/lib/product-box/check.ts`:

```typescript
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { validateBoxData } from "./validate.ts";
import { renderCard } from "./render.ts";
import type { BoxFile } from "./types.ts";

const ALLOWED_TOKENS = new Set([
  "ink", "ink-soft", "muted", "paper", "surface", "surface-2", "surface-3",
  "line", "line-soft", "accent", "accent-strong", "highlighter",
  "soft-green", "soft-blue", "soft-yellow", "soft-orange", "soft-purple",
  "lane-define", "lane-build", "lane-ship",
  "lane-define-soft", "lane-build-soft", "lane-ship-soft",
  "on-ink", "on-ink-mute", "on-ink-dim",
]);

export function runCheck(root: string): string[] {
  const errors: string[] = [];
  const boxYmlPath = path.join(root, "sites/box/box.yml");

  if (!fs.existsSync(boxYmlPath)) {
    // Feature is opt-in: absence is fine.
    return errors;
  }

  let boxData: BoxFile;
  try {
    boxData = parse(fs.readFileSync(boxYmlPath, "utf8")) as BoxFile;
  } catch (err) {
    errors.push(`sites/box/box.yml: parse error: ${(err as Error).message}`);
    return errors;
  }

  const validation = validateBoxData(boxData);
  if (!validation.ok) {
    for (const e of validation.errors) errors.push(`sites/box/box.yml: ${e}`);
  }

  const stylesPath = path.join(root, "sites/box/styles.css");
  if (!fs.existsSync(stylesPath)) {
    errors.push("sites/box/styles.css: missing");
  } else {
    const css = fs.readFileSync(stylesPath, "utf8");
    for (const match of css.matchAll(/var\(--([a-z0-9-]+)\)/g)) {
      const token = match[1];
      if (!ALLOWED_TOKENS.has(token)) {
        errors.push(`sites/box/styles.css: unknown token var(--${token})`);
      }
    }
  }

  const indexPath = path.join(root, "sites/box/index.html");
  if (!fs.existsSync(indexPath)) {
    errors.push("sites/box/index.html: missing");
  }

  const productPagePath = path.join(root, "sites/index.html");
  if (fs.existsSync(productPagePath)) {
    const page = fs.readFileSync(productPagePath, "utf8");
    const startCount = (page.match(/<!-- product-box-embed:start -->/g) ?? []).length;
    const endCount = (page.match(/<!-- product-box-embed:end -->/g) ?? []).length;
    if (startCount !== endCount) {
      errors.push("sites/index.html: unpaired/malformed product-box-embed markers");
    } else if (startCount === 1 && validation.ok) {
      // Drift check: slot content must equal renderer card output for current box.yml.
      const expected = renderCard(boxData).trim();
      const startIdx = page.indexOf("<!-- product-box-embed:start -->") + "<!-- product-box-embed:start -->".length;
      const endIdx = page.indexOf("<!-- product-box-embed:end -->");
      const actual = page.slice(startIdx, endIdx).trim();
      if (actual !== expected) {
        errors.push("sites/index.html: product-box card drift — content does not match renderer output for sites/box/box.yml. Re-run /product:box.");
      }
    }
  }

  return errors;
}
```

`scripts/check-product-box.ts`:

```typescript
import { failIfErrors, repoRoot } from "./lib/repo.js";
import { runCheck } from "./lib/product-box/check.ts";

const errors = runCheck(repoRoot);
failIfErrors(errors, "check:product-box");
```

- [ ] **Step 4: Run tests, expect pass.**

```bash
node --test --import tsx tests/scripts/product-box/check-product-box.test.ts
```

- [ ] **Step 5: Register the script**

Add to `package.json` `"scripts"`:

```json
"check:product-box": "tsx scripts/check-product-box.ts",
```

Add to `scripts/lib/tasks.ts` `checkTasks` array (after `check:product-page`):

```typescript
  {
    name: "check:product-box",
    label: "Product box artifacts",
    script: "scripts/check-product-box.ts",
  },
```

- [ ] **Step 6: Run the registered check**

```bash
npm run check:product-box
```

Expected: exit 0 (since `sites/box/box.yml` does not yet exist on this branch).

- [ ] **Step 7: Commit**

```bash
git add scripts/check-product-box.ts scripts/lib/product-box/check.ts \
        tests/scripts/product-box/check-product-box.test.ts \
        package.json scripts/lib/tasks.ts
git commit -m "feat(verify): add check:product-box (schema, slot, tokens, drift)"
```

---

## Chunk 7: Initial generation, indexes, end-to-end

### Task 7.1: Initial sample box.yml

**Files:**
- Create: `sites/box/box.yml`
- Create: `sites/box/README.md`

- [ ] **Step 1: Write a starter `sites/box/box.yml` for the Specorator template repo itself**

```yaml
name: Specorator
tagline: Specs first, code second.
features:
  - Humans decide what; specialist agents handle how.
  - Every decision traceable across 11 stages.
  - Open-source template, MIT licensed.
target_user: Engineering teams shipping AI-assisted features.
status: shipping
stage: 11
sources:
  - docs/steering/product.md
  - README.md
generated_at: 2026-05-01
_skill_hash: TO_BE_COMPUTED
```

The `_skill_hash` placeholder is a **transient** value. Step 3 below must run successfully before Step 8 (commit) — the placeholder string must never land in a commit, otherwise downstream regens will treat the hash mismatch as a manual edit on every run.

- [ ] **Step 2: Write `sites/box/README.md`**

```markdown
---
title: Product box artifacts
folder: sites/box
description: Standalone product-box page deployed alongside the product page.
entry_point: true
---

# sites/box/

Standalone, deployable visualization of the envisioned product. Owned by the `product-box` skill and the `product-box-designer` agent.

- `box.yml` — canonical content cache. Human-editable; the skill preserves manual edits.
- `index.html` — standalone box page (CSS-only 3D, three faces).
- `styles.css` — box-page styles.
- `og-card.svg` — static social-share image.

Do not edit the HTML, CSS, or SVG by hand — they are regenerated from `box.yml` by the agent. Edit `box.yml`, then run `/product:box`.

See `docs/product-box.md` for the methodology, `docs/adr/0017-add-product-box-feature.md` for the decision, and `docs/superpowers/specs/2026-05-01-product-box-design.md` for the spec.
```

- [ ] **Step 3: Compute skill hash and patch box.yml**

`npx tsx -e "..."` with `import` statements is unreliable on Windows PowerShell. Write a temporary one-shot file instead, run it, and delete it.

Create `scripts/lib/product-box/_one-shot.ts`:

```typescript
import fs from "node:fs";
import { parse, stringify } from "yaml";
import { computeSkillHash } from "./skill-hash.ts";
import { renderBox } from "./render.ts";
import { injectSlot } from "./inject-slot.ts";

const p = "sites/box/box.yml";
const data = parse(fs.readFileSync(p, "utf8"));

data._skill_hash = computeSkillHash({
  name: data.name,
  tagline: data.tagline,
  features: data.features,
  target_user: data.target_user,
});
fs.writeFileSync(p, stringify(data), "utf8");
console.log("hash:", data._skill_hash);

const box = parse(fs.readFileSync(p, "utf8"));
const out = renderBox(box);
fs.writeFileSync("sites/box/index.html", out.standaloneHtml);
fs.writeFileSync("sites/box/styles.css", out.boxStyles);
fs.writeFileSync("sites/box/og-card.svg", out.ogSvg);

const page = fs.readFileSync("sites/index.html", "utf8");
const injected = injectSlot(page, out.cardHtml);
fs.writeFileSync("sites/index.html", injected.html);
console.log("slot action:", injected.action);
```

Run:

```bash
npx tsx scripts/lib/product-box/_one-shot.ts
```

Expected: `hash: <64-hex>` then `slot action: appended`.

This step **must succeed** before Step 8 (commit). The placeholder `_skill_hash: TO_BE_COMPUTED` from Step 1 must not land in a commit — downstream regen would treat the hash mismatch as a manual edit on every run.

- [ ] **Step 4: Delete the one-shot file**

```bash
git rm --force scripts/lib/product-box/_one-shot.ts 2>/dev/null || rm scripts/lib/product-box/_one-shot.ts
```

(Use `Remove-Item` if running native PowerShell without Git Bash.)

- [ ] **Step 5: Add card styles to `sites/styles.css`**

Append:

```css
/* Product-box embedded card */
.product-box-card {
  display: grid;
  gap: 8px;
  padding: 16px 20px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--ink);
  text-decoration: none;
  max-width: 360px;
}
.product-box-card:hover { background: var(--surface-2); }
.product-box-card h3 { margin: 0; font-size: 20px; }
.product-box-card p { margin: 0; color: var(--muted); font-size: 14px; }
.product-box-card .card-cta { font-weight: 700; color: var(--accent-strong); }
.product-box-card .status-pill {
  justify-self: start;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.status-concept { background: var(--soft-yellow); color: var(--ink); }
.status-envisioned { background: var(--soft-green); color: var(--accent-strong); }
.status-specd { background: var(--soft-blue); color: var(--ink); }
.status-shipping { background: var(--highlighter); color: var(--ink); }
```

- [ ] **Step 6: Run the verify gate**

```bash
npm run verify
```

Expected: exit 0. If `check:product-box` fails on drift, re-run the renderer; if it fails on tokens, fix the offender.

- [ ] **Step 7: Manual one-shot**

Open `sites/box/index.html` in a browser. Confirm:
- 3D box renders, three faces visible.
- Status pill shows `Shipping`.
- Footer reads `Stage 11 of 11.`
- Toggle `prefers-reduced-motion` in devtools — box flattens to inline layout, content still readable.
- Tab from anywhere on the page back to `sites/index.html`; card link receives visible focus.
- Open `sites/box/og-card.svg` standalone — text renders, no broken xml.

- [ ] **Step 8: Commit**

```bash
git add sites/box/ sites/index.html sites/styles.css
git commit -m "feat(product-box): generate initial box artifacts and inject card"
```

### Task 7.2: Index updates

**Files:**
- Modify: `README.md`
- Modify: `.claude/memory/MEMORY.md`
- Modify: `CLAUDE.md`
- Modify: `docs/sink.md`

- [ ] **Step 1: README.md — add skill row**

In the skills table (or wherever existing skills are listed), add:

```markdown
- **product-box** — envisioned-product visualization at `sites/box/`. Pairs with `product-page`. See `docs/product-box.md`.
```

- [ ] **Step 2: MEMORY.md — add index entry**

Under `## Workflow rules` (or a new `## Public surface` section if it makes more sense locally), add:

```markdown
- **Product box** — early-stage envisioned-product visualization at `sites/box/`, paired with product page via marker slot. See `docs/product-box.md`.
```

- [ ] **Step 3: CLAUDE.md — add table row if surfaced as a track**

In the existing skills/track table, add:

```markdown
| **Product box** | new project, brief written, envisioned product visualization | `.claude/skills/product-box/SKILL.md` | `/product:box` | `docs/product-box.md` (ADR-0017) |
```

- [ ] **Step 4: docs/sink.md — register destinations**

Add entries describing where `sites/box/` and `sites/box/box.yml` live and who owns them.

- [ ] **Step 5: Verify**

```bash
npm run check:links
npm run check:frontmatter
npm run check:adr-index
npm run verify
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add README.md .claude/memory/MEMORY.md CLAUDE.md docs/sink.md
git commit -m "docs(product-box): add index entries (README, MEMORY, CLAUDE, sink)"
```

### Task 7.3: Final verification

- [ ] **Step 1: Full verify gate**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 2: All product-box tests**

```bash
node --test --import tsx tests/scripts/product-box/*.test.ts
```

Expected: all pass.

- [ ] **Step 3: Inspect git log on branch**

```bash
git log --oneline main..HEAD
```

Expected: a tidy series of commits, one concern each, all referencing product-box.

### Task 7.4: Open the PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/product-box
```

- [ ] **Step 2: Open the PR**

Use `gh pr create` with body referencing the spec, plan, and ADR. Title: `feat(product-box): add envisioned-product visualization`. Per repo convention, include the product-page upkeep checkbox state (`product page updated: marker slot added`).

- [ ] **Step 3: Watch CI green, address Codex review**

Per `.claude/memory/feedback_pr_review_loop.md`, drain Codex feedback before merge. Re-request review after every push.

- [ ] **Step 4: Merge after green review + green CI**

Per `.claude/memory/feedback_autonomous_merge.md`. Squash-merge title should follow Conventional Commits. Delete the worktree afterwards:

```bash
cd ../../
git worktree remove .worktrees/product-box
```

---

## Open considerations for the executor

- The `npx tsx -e "..."` one-liners in Tasks 7.1 and 7.4 are convenient but verbose on Windows PowerShell — feel free to put them in a temporary `scripts/lib/product-box/_one-shot.ts` and delete after use.
- If the orchestrate skill structure has changed by execution time, the auto-hook insertion point may shift; re-read the skill before patching.
- Snapshot tests in `tests/scripts/product-box/snapshots/` are intentionally exact-match. When the renderer is intentionally changed, regenerate snapshots and review the diff carefully — drift is the test working as designed.
- The card drift check in `check-product-box.ts` whitespace-trims both sides; do not introduce non-trivial whitespace in the rendered card, as it will trigger false drifts.

---

## Plan review loop

After each chunk above is implemented and committed, dispatch the plan-document-reviewer subagent for that chunk before proceeding to the next. If a chunk's review surfaces issues, fix in place and re-dispatch.

## Execution handoff

Once all chunks are complete, all tests pass, the verify gate is green, and the PR is open with green CI, hand off to the user for merge approval. Do not merge without explicit human authorization.
