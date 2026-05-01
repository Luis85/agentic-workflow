# Workflow Overview — One-Page Cheat Sheet

```mermaid
flowchart TD
    scaffold["Project Scaffolding Track<br/>Intake -> Extract -> Assemble -> Handoff<br/>Owner: project-scaffolder<br/>Output: starter-pack.md + handoff.md"]
    stock["Stock-taking Track<br/>Scope -> Audit -> Synthesize -> Handoff<br/>Owner: legacy-auditor<br/>Output: stock-taking-inventory.md"]
    discovery["Discovery Track<br/>Frame -> Diverge -> Converge -> Prototype -> Validate -> Handoff<br/>Owners: facilitator + discovery specialists<br/>Output: chosen-brief.md"]
    quality["Quality Assurance Track<br/>Start -> Plan -> Check -> Review -> Improve<br/>Owner: quality-assurance skill<br/>Output: quality review + improvement plan"]
    roadmap["Roadmap Management Track<br/>Start -> Shape -> Align -> Communicate -> Review<br/>Owner: roadmap-manager<br/>Output: roadmap + delivery + comms artifacts"]

    idea["1. Idea<br/>analyst"]
    research["2. Research<br/>analyst"]
    requirements["3. Requirements<br/>pm"]
    design["4. Design<br/>ux / ui / architect"]
    specification["5. Specification<br/>architect"]
    tasks["6. Tasks<br/>planner"]
    implementation["7. Implementation<br/>dev"]
    testing["8. Testing<br/>qa"]
    review["9. Review<br/>reviewer"]
    release["10. Release<br/>release-manager"]
    retro["11. Retrospective<br/>retrospective"]

    scaffold -->|source-led starter pack routes next track| discovery
    scaffold -->|may route to stock-taking| stock
    stock -->|inventory feeds /discovery:start or /spec:idea| discovery
    discovery -->|chosen-brief.md feeds /spec:idea| idea
    idea --> research
    research --> requirements
    requirements --> design
    design --> specification
    specification --> tasks
    tasks --> implementation
    implementation --> testing
    testing --> review
    review --> release
    release --> retro
    quality -.->|checks execution health and readiness| review
    quality -.->|corrective actions feed learning| retro
    roadmap -.->|outcomes and stakeholder alignment inform priorities| requirements
    roadmap -.->|delivery confidence and dependencies inform planning| tasks
```

## At each stage

| Question | Answer lives in |
|---|---|
| What's this stage for? | [`docs/specorator.md` §3](specorator.md#3-stages-artifacts-and-quality-gates) |
| Who owns it? | [`.claude/agents/<role>.md`](../.claude/agents/) |
| What's the input? | The previous stage's artifact in `specs/<feature>/` |
| What's the output? | The matching `templates/<stage>-template.md` |
| When am I done? | The quality gate in [`docs/quality-framework.md`](quality-framework.md) |
| How do I trigger it? | The slash command for the stage — see the **Slash commands** block below for the full list (`/spec:idea`, `/spec:research`, `/spec:requirements`, `/spec:design`, `/spec:specify`, `/spec:tasks`, `/spec:implement`, `/spec:test`, `/spec:review`, `/spec:release`, `/spec:retro`). |

## Quality gates between stages

```mermaid
flowchart LR
    idea["Idea"]
    research["Research"]
    requirements["Requirements"]
    design["Design"]
    specification["Specification"]
    tasks["Tasks"]
    implementation["Implementation"]
    testing["Testing"]
    review["Review"]
    release["Release"]
    retro["Retro"]

    idea -->|scope bounded| research
    research -->|sources + alternatives + risks| requirements
    requirements -->|EARS + IDs + testable| design
    design -->|boundaries + ADRs| specification
    specification -->|unambiguous + edge cases| tasks
    tasks -->|half-day + TDD ordered| implementation
    implementation -->|matches spec + lint| testing
    testing -->|every REQ tested| review
    review -->|RTM complete + no criticals| release
    release -->|changelog + rollback| retro
```

Optional gates `/spec:clarify` and `/spec:analyze` may be inserted between any two stages.

Use `/scaffold:start <slug> <source>` before the other tracks when a fresh template install should be seeded from existing folders or Markdown files.

Use `/quality:start <slug> [scope]` when a project, portfolio, feature, release, supplier, or internal process needs an ISO 9001-aligned quality assurance review.

Use `/roadmap:start <slug>` when product direction, project delivery confidence, stakeholder expectations, and team communication need a shared roadmap artifact.

## State file (`specs/<feature>/workflow-state.md`)

```yaml
feature: <slug>
area: <AREA>                                                       # uppercase short code; used in IDs
current_stage: <stage>
status: active | blocked | paused | done
last_updated: YYYY-MM-DD
last_agent: <role>
artifacts:
  idea.md: pending | in-progress | complete | skipped | blocked    # full enum
  research.md: ...
```

Plus body sections (Skips, Blocks, Hand-off notes, Open clarifications). Canonical shape lives at [`templates/workflow-state-template.md`](../templates/workflow-state-template.md).

## Slash commands

<!-- BEGIN GENERATED: slash-commands -->
```
# Decisions:
/adr:new

# Discovery Track:
/discovery:converge   /discovery:diverge    /discovery:frame
/discovery:handoff    /discovery:prototype  /discovery:start
/discovery:validate

# glossary:
/glossary:new

# Portfolio Track:
/portfolio:start  /portfolio:x      /portfolio:y
/portfolio:z

# Product:
/product:page

# Project Manager Track:
/project:change    /project:close     /project:initiate
/project:post      /project:report    /project:start
/project:weekly

# Quality Assurance Track:
/quality:check    /quality:improve  /quality:plan
/quality:review   /quality:start    /quality:status

# roadmap:
/roadmap:align        /roadmap:communicate  /roadmap:review
/roadmap:shape        /roadmap:start

# Sales Cycle Track:
/sales:estimate  /sales:order     /sales:propose
/sales:qualify   /sales:scope     /sales:start

# Project Scaffolding Track:
/scaffold:assemble  /scaffold:extract   /scaffold:handoff
/scaffold:intake    /scaffold:start

# Lifecycle:
/spec:analyze       /spec:clarify       /spec:design
/spec:idea          /spec:implement     /spec:release
/spec:requirements  /spec:research      /spec:retro
/spec:review        /spec:specify       /spec:start
/spec:tasks         /spec:test

# Specorator Improvements:
/specorator:add-script    /specorator:add-tooling   /specorator:add-workflow
/specorator:update

# Stock-taking Track:
/stock-taking:audit       /stock-taking:handoff     /stock-taking:scope
/stock-taking:start       /stock-taking:synthesize

# token-review.md:
/token-review.md:token-review
```
<!-- END GENERATED: slash-commands -->

## Per-stage Definition of Done (one-liner each)

| Stage | Done when… |
|---|---|
| Idea | Problem stated, scope bounded, unknowns listed |
| Research | ≥ 2 alternatives explored, sources cited, risks named |
| Requirements | All EARS-formatted, IDs assigned, non-goals explicit |
| Design | Boundaries clear, decisions justified, ADRs filed for irreversibles |
| Specification | Behaviour unambiguous, edge cases enumerated, tests derivable |
| Tasks | ≤ ½ day each, REQ-linked, TDD-ordered |
| Implementation | Spec-matched, lint+types+units green, log updated |
| Testing | Every EARS clause tested, failures reproducible |
| Review | RTM complete, no critical findings, requirements satisfied |
| Release | Changelog + rollback + observability in place |
| Retro | Three buckets (worked / didn't / actions) with owners |
