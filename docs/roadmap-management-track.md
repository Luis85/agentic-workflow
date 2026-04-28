# Roadmap Management Track

**Version:** 0.1 - **Status:** Draft - **Stability:** Opt-in - **ADR:** [ADR-0012](adr/0012-add-roadmap-management-track.md)

An opt-in track for managing product and project roadmaps. It helps teams decide what to communicate, what to prioritize, what is credibly deliverable, and what stakeholders need to understand next.

The track sits between product intent and delivery execution. It does not replace the Specorator lifecycle, the Project Manager Track, or the Portfolio Track.

## 1. Why a Roadmap Management Track

Roadmaps are where product management and project management often collide:

- Product management needs outcomes, strategy, customer value, learning, and priority.
- Project management needs scope boundaries, sequencing, dependencies, resources, milestones, risks, and communication.
- Stakeholders and teams need a shared artifact that explains what is happening, why it matters, what changed, and what is still uncertain.

Without a dedicated track, a roadmap easily becomes either a feature wish list or a delivery schedule with false certainty. This track keeps those concerns connected but distinct.

## 2. Research Basis

The track is shaped by current roadmapping guidance:

- Atlassian emphasizes roadmaps as high-level planning and communication artifacts that should connect goals, scope, resources, dependencies, and stakeholder alignment.
- ProductPlan and ProdPad promote theme-based and Now / Next / Later roadmaps to focus teams on outcomes rather than feature lists.
- Aha! and Roman Pichler emphasize goals, initiatives, releases or timeframes, and measurable success metrics.
- Gartner's product-planning guidance connects roadmaps to customer insight, market understanding, competitive context, product strategy, and portfolio direction.
- PMI-oriented project roadmap guidance highlights strategic alignment, milestones, dependencies, risks, and stakeholder communication.

The resulting pattern is outcome-led, evidence-backed, cadence-reviewed, and careful about commitments.

## 3. Where it Lives

Each roadmap lives under `roadmaps/<roadmap-slug>/`.

```text
roadmaps/
|-- <roadmap-slug>/
    |-- roadmap-state.md       # state machine and review cadence
    |-- roadmap-strategy.md    # scope, audiences, outcomes, constraints, linked artifacts
    |-- roadmap-board.md       # Now / Next / Later outcome roadmap
    |-- delivery-plan.md       # milestones, dependencies, risks, capacity assumptions
    |-- stakeholder-map.md     # stakeholders, decision owners, alignment risks
    |-- communication-log.md   # planned and sent roadmap updates
    |-- decision-log.md        # roadmap priority, commitment, and communication decisions
```

## 4. Phases and Commands

| Phase | Command | Purpose | Main outputs |
|---|---|---|---|
| Start | `/roadmap:start <slug>` | Bootstrap scope, owner, sponsor, audiences, and linked artifacts | `roadmap-state.md`, `roadmap-strategy.md` |
| Shape | `/roadmap:shape <slug>` | Convert inputs into an outcome roadmap and credible delivery signals | `roadmap-board.md`, `delivery-plan.md` |
| Align | `/roadmap:align <slug>` | Map stakeholders, decision owners, alignment risks, and team communication | `stakeholder-map.md`, `communication-log.md` |
| Communicate | `/roadmap:communicate <slug> [audience]` | Produce and log an audience-specific update | `communication-log.md`, `decision-log.md` |
| Review | `/roadmap:review <slug>` | Refresh status, confidence, dependencies, risks, and next communications | all roadmap artifacts as needed |

## 5. Artifact Rules

- `roadmap-state.md` is owned by `/roadmap:*` commands.
- `last_review` and `next_review` in `roadmap-state.md` are ISO dates (`YYYY-MM-DD`) or null before the first scheduled review. Cadence belongs in `roadmap-strategy.md`, not in state frontmatter.
- `roadmap-strategy.md` is living but changes should be logged in `roadmap-state.md`.
- `roadmap-board.md` is updated in place; change rationale is recorded in its Change Summary.
- `delivery-plan.md` only covers committed or date-sensitive roadmap items. It does not replace project plans, task lists, or `specs/`.
- `communication-log.md` is append-oriented. Planned updates can change; sent updates are historical.
- `decision-log.md` records roadmap priority, sequencing, and communication approvals. Architecture decisions still use ADRs.

## 6. Roles

### Roadmap Sponsor (human)

- Owns priority decisions, funding, scope trade-offs, and external commitments.
- Approves audience-sensitive communication.
- Decides when a roadmap item becomes formal delivery work.

### Roadmap Owner (human or designated role)

- Owns the roadmap's purpose, cadence, and stakeholder usefulness.
- Ensures the roadmap stays current and trusted.

### Roadmap Manager (agent)

- Maintains roadmap artifacts under `roadmaps/<slug>/`.
- Reads linked feature, project, and portfolio evidence.
- Surfaces outcomes, risks, dependencies, stakeholder needs, and decisions.
- Never edits delivery artifacts and never makes commitments.

## 7. Product Management Guidance

Roadmap items should answer:

- What customer or user outcome is expected?
- What business objective does it support?
- How will success be measured?
- Why is the item Now, Next, or Later?
- What evidence supports it?
- What learning or discovery is still required?

Prefer outcome hypotheses over feature names. A feature may appear in the item, but only as the proposed means to an outcome.

## 8. Project Management Guidance

Date-bearing or committed roadmap items need:

- target window or milestone
- owner
- dependencies
- resource assumptions
- risks and mitigations
- confidence level
- scope boundaries
- escalation path

If those signals are missing, the item should not be communicated as committed.

## 9. Stakeholder and Team Communication

The track separates messages by audience:

| Audience | Emphasis |
|---|---|
| Leadership | outcomes, trade-offs, risk, investment, decisions needed |
| Delivery team | priority, sequence, scope boundaries, dependencies, open questions |
| Customers / clients | approved direction, value, caveats, and externally safe commitments |
| Sales / support | what can be said, what must not be promised, escalation path |

Every communication should state what changed, why, confidence level, decisions needed, and where the source of truth lives.

## 10. Quality Gates

### Shape gate

- [ ] Every `Now` item has an outcome hypothesis and success signal.
- [ ] Every date-bearing item has dependencies, risks, owner, and confidence level.
- [ ] Every item cites a source or is marked as an unvalidated idea.
- [ ] `Now` work is small enough for the team to understand and discuss.

### Align gate

- [ ] Stakeholder groups and decision owners are explicit.
- [ ] Alignment risks are documented with owner and response.
- [ ] Delivery-team communication distinguishes priority from commitment.
- [ ] External-audience communication has approval notes.

### Communicate gate

- [ ] Audience and purpose are explicit.
- [ ] Message states what changed, why, confidence, and decisions needed.
- [ ] Tentative items are not presented as committed.
- [ ] The communication is logged as planned or sent.

### Review gate

- [ ] Linked feature/project/portfolio evidence has been re-read.
- [ ] Horizon, confidence, dependencies, and risks are updated.
- [ ] Stale or overcommitted items are flagged.
- [ ] Next review date and next communication are recorded.

## 11. Relationship to Other Tracks

| Track | Relationship |
|---|---|
| Specorator lifecycle | Roadmaps read feature state and may recommend `/spec:start`, but they do not create requirements. |
| Project Manager Track | Roadmaps read delivery and risk signals; project governance remains in `projects/`. |
| Portfolio Track | Roadmaps can consume strategic priorities; portfolio stop/start decisions remain portfolio sponsor decisions. |
| Discovery Track | Low-confidence roadmap items can route to discovery before entering delivery. |
| Quality Assurance Track | QA can review roadmap evidence and communication readiness when needed. |

## 12. Automation Opportunities

The track starts as Markdown-first workflow infrastructure. The highest-value follow-up scripts and tools are:

| Tool | Purpose | Suggested command |
|---|---|---|
| Roadmap state check | Validate required roadmap artifacts, frontmatter, review dates, and append-only log structure | `npm run check:roadmaps` (implemented) |
| Evidence collector | Summarize linked `specs/`, `projects/`, and `portfolio/` signals for `/roadmap:shape` and `/roadmap:review` | `npm run roadmap:evidence -- <slug>` (implemented) |
| Communication digest | Generate audience-specific draft updates from `roadmap-board.md`, `delivery-plan.md`, and `stakeholder-map.md` | `npm run roadmap:digest -- <slug> <audience>` |
| Staleness report | Flag old reviews, low-confidence `Now` items, missing success metrics, unresolved decisions, and stale stakeholder updates | `npm run roadmap:review-check` |
| External export | Render a read-only roadmap summary for GitHub Pages or stakeholder packets | `npm run roadmap:export -- <slug>` |

Add these incrementally. Start with a read-only `check:roadmaps` gate before adding fixers or publication tooling.

## 13. Sources and Further Reading

- Atlassian, Product Roadmaps: <https://www.atlassian.com/en/agile/product-management/product-roadmaps>
- Atlassian, Project Roadmaps: <https://www.atlassian.com/agile/project-management/project-roadmap>
- ProductPlan, Theme-Based Product Roadmap: <https://www.productplan.com/templates/theme-based-product-roadmap-template>
- ProdPad, Product Roadmaps Guide: <https://www.prodpad.com/guides/product-roadmaps/>
- Aha!, Product Roadmap Guide: <https://www.aha.io/roadmapping/guide/roadmap/ultimate-guide>
- Roman Pichler, Product Roadmap FAQs: <https://www.romanpichler.com/blog/product-roadmap-faqs/>
- Gartner, Product Planning: <https://www.gartner.com/en/product-management/topics/product-planning>
- PMI, Roadmap to PMO Excellence: <https://www.pmi.org/learning/library/roadmap-pmo-excellence-13084>
