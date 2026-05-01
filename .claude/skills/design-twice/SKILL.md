---
name: design-twice
description: Generate 2-3 radically different design alternatives in parallel via Task tool, then synthesize a pick. Use in stage 4 (Design). Triggers "design it twice", "explore options", "compare module shapes".
argument-hint: <one-line scope, e.g. "user profile editing API">
---

# Design twice (or three times)

After Ousterhout's "Design It Twice" and Pocock's `design-an-interface`. The most expensive bug is a wrong design baked in early; the cheapest fix is a second alternative drafted before the first ships.

## Procedure

### Step 1 — Frame the design problem

Read upstream:

- `specs/<slug>/research.md`
- `specs/<slug>/requirements.md`
- `docs/CONTEXT.md`, `docs/glossary/*.md` (per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` if present)

Restate the design problem in one sentence. Confirm with the user.

### Step 2 — Pick three divergent constraints

Pick three constraints that will pull the design in genuinely different directions. Defaults that work for most module-shaping problems:

- **A — Minimize surface.** Smallest possible public interface. Bias toward fewer methods, fewer parameters, more depth.
- **B — Maximize flexibility.** Design for extension. Bias toward composition, plug points, orthogonal primitives.
- **C — Optimize the common case.** The most frequent caller writes the least code. Bias toward affordances over generality.

For UI/UX problems, swap to: **A — minimize click depth**, **B — maximize discoverability**, **C — minimize cognitive load**. For architecture, swap to: **A — minimize moving parts**, **B — maximize testability**, **C — minimize blast radius on failure**.

If the user has stated a constraint that suggests a fourth axis, add it as D.

### Step 3 — Dispatch three parallel subagents

Issue the `Task` calls in the **same turn** so they run concurrently. Each subagent gets:

- The same upstream context references.
- Its single divergent constraint.
- Output destination: `specs/<slug>/design-alt-<A|B|C>.md`.
- Return contract: 5–10 line summary, not full content.

Each subagent should produce: **Module shape**, **Public interface (signatures only)**, **Data flow**, **Trade-offs explicitly accepted**.

### Step 4 — Synthesize

When all three return, **you** (in the main thread) write `specs/<slug>/design-comparison.md` with sections:

- **Compared alternatives** — one paragraph per option summarizing shape and trade-offs.
- **Recommendation** — which one and why (cite specific upstream constraints).
- **Hybrid moves** — borrow X from B, drop Y from A.
- **Rejected alternatives** — what we lost by not picking each.

Then ask the user via `AskUserQuestion`: `Adopt recommendation` (Recommended) / `Adopt alternative <X>` / `Synthesize a hybrid (you describe)` / `Run another design pass with a new constraint`.

### Step 5 — Hand off to /spec:design

The chosen alternative becomes input to `/spec:design`. The architect inside `/spec:design` reads `design-comparison.md` and writes the canonical `design.md`. Do not let `design-twice` pretend to be the design artifact itself — it is exploration, not commitment.

## Rules

- Constraints must be **genuinely divergent**, not three flavors of the same idea.
- Subagents must not see each other's drafts during their pass.
- Synthesis is your job in the main thread. Don't dispatch a fourth subagent to "pick the winner" — that defers your judgment.
- Keep alternatives at interface/shape level. No implementation, no tests.
- File ADRs for any irreversible decisions the synthesis bakes in (use the `record-decision` skill).
