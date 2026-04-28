# Specorator documentation

This is the user-facing index for `docs/`. It is organised by [Diátaxis](https://diataxis.fr/) — the four quadrants describe **what kind of doc** something is, not what subject it covers.

|  | If you want to… | Read… |
|---|---|---|
| 📚 | **Learn** Specorator end-to-end | a [Tutorial](#tutorials) |
| 🛠 | **Do** a specific task | a [How-to](#how-to-guides) |
| 📖 | **Look up** an authoritative fact | a [Reference](#reference) doc |
| 💡 | **Understand** why something is the way it is | an [Explanation](#explanation) doc |

If you are new to the project, start with the tutorial. If you already know the basics, jump straight to the recipe or reference you need.

---

## 📚 Tutorials

Learning-oriented. You follow them step by step; you reach a known end state.

- **[Drive your first feature end-to-end](./tutorials/first-feature.md)** — 60–90 minutes. Add a single term to the README glossary, walking every Specorator stage from Idea to Retrospective. The point is to internalise the lifecycle, not the change.

---

## 🛠 How-to guides

Task-oriented recipes — *how do I do X?* You arrive knowing the goal; you leave with the steps.

The MVP set:

- [How to fork and personalize the template](./how-to/fork-and-personalize.md)
- [How to resume a paused feature](./how-to/resume-paused-feature.md)
- [How to file a new Architecture Decision Record](./how-to/add-adr.md)
- [How to write a requirement in EARS notation](./how-to/write-ears-requirement.md)
- [How to run the verify gate](./how-to/run-verify-gate.md)

For the planned recipes (🚧) and the recipe template, see the [how-to index](./how-to/README.md).

### Operational runbooks

For 2 a.m. / SRE / on-call procedures, see [`docs/playbooks/`](./playbooks/). Playbooks are *operational responses to incidents*; recipes above are *workflow tasks for builders*.

---

## 📖 Reference

Look-it-up, normative. Authoritative; not narrative.

- [`specorator.md`](./specorator.md) — the full workflow definition.
- [`workflow-overview.md`](./workflow-overview.md) — one-page cheat sheet + slash-command list.
- [`ears-notation.md`](./ears-notation.md) — the requirement-syntax catalogue.
- [`traceability.md`](./traceability.md) — the ID scheme and the requirement → spec → task → code → test chain.
- [`sink.md`](./sink.md) — catalog of every artifact: where it lives, who owns it. *Regenerable index — don't edit by hand.*
- [`quality-framework.md`](./quality-framework.md) — quality dimensions, gates, and Definition of Done per stage.
- [`glossary/`](./glossary/) — plain-English glossary, one file per term (per [ADR-0010](./adr/0010-shard-glossary-into-one-file-per-term.md)). The directory listing is the index; add a term with `/glossary:new "<term>"`.
- [`scripts/`](./scripts/) — generated TypeDoc API reference for the Node integrity scripts under `scripts/`. *Regenerable — `npm run fix:script-docs` rebuilds it from JSDoc.*
- [`adr/`](./adr/) — index of every Architecture Decision Record. (Each ADR's *rationale* is an Explanation doc; this is the index.)

### Reference + How-to (dual-purpose)

These three are policy on one read, procedure on another:

- [`verify-gate.md`](./verify-gate.md) — *policy* lives here; *procedure* is in [`how-to/run-verify-gate.md`](./how-to/run-verify-gate.md).
- [`branching.md`](./branching.md) — *policy* lives here; *procedure* (when relevant) is in the resume / verify recipes.
- [`worktrees.md`](./worktrees.md) — *policy* lives here; *procedure* is in the resume recipe.

---

## 💡 Explanation

Understanding-oriented. Background, rationale, and the *why* behind decisions.

- [`discovery-track.md`](./discovery-track.md) — why Discovery exists, how it sits before Stage 1.
- [`sales-cycle.md`](./sales-cycle.md) — why service-provider work needs a pre-Discovery commercial track.
- [`project-track.md`](./project-track.md) — why client engagements need P3.Express-style governance.
- [`portfolio-track.md`](./portfolio-track.md) — why portfolios sit above the Specorator lifecycle.
- [`stock-taking-track.md`](./stock-taking-track.md) — why brownfield projects need a separate inventory step.
- [`adr/`](./adr/) — the rationale half of each ADR file. (The index lives under Reference above.)

---

## For agents and contributors

These directories are not user-facing reading material; they are listed here so the doc map is complete.

- [`steering/`](./steering/) — scoped context loaded by stage agents (product, tech, ux, quality, operations). If you are *configuring* the agents for your own project, start with [`steering/README.md`](./steering/README.md). It is not part of the Diátaxis surface for human readers.
- `archive/`, `daily-reviews/`, `postmortems/`, `issues/`, `plans/`, `superpowers/` — operational, historical, or contributor-internal collections. They will grow as the project adds methods, constraints, and frameworks; they are deliberately outside the Diátaxis quadrant map and the hub-drift check. The `docs-review-bot` keeps the rest of `docs/` in check.

---

## Maintaining this hub

Any PR that adds, renames, or removes a file under `docs/` **must update this hub in the same PR**. The rule lives in [`CONTRIBUTING.md`](../CONTRIBUTING.md). The `docs-review-bot` flags PRs that touch `docs/` without touching `docs/README.md`.
