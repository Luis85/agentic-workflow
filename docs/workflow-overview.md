# Workflow Overview — One-Page Cheat Sheet

```mermaid
flowchart TD
    stock["Stock-taking Track<br/>Scope -> Audit -> Synthesize -> Handoff<br/>Owner: legacy-auditor<br/>Output: stock-taking-inventory.md"]
    discovery["Discovery Track<br/>Frame -> Diverge -> Converge -> Prototype -> Validate -> Handoff<br/>Owners: facilitator + discovery specialists<br/>Output: chosen-brief.md"]

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

```
# Pre-everything Stock-taking Track (opt-in, for legacy/brownfield projects):
/stock:start <project>      /stock:audit               /stock:handoff
/stock:scope                /stock:synthesize

# Pre-stage Discovery Track (opt-in, when no brief exists yet):
/discovery:start <sprint>   /discovery:converge        /discovery:validate
/discovery:frame            /discovery:prototype       /discovery:handoff
/discovery:diverge

# Lifecycle:
/spec:start <slug>          /spec:tasks                /spec:retro
/spec:idea                  /spec:implement [task-id]  /spec:clarify
/spec:research              /spec:test                 /spec:analyze
/spec:requirements          /spec:review               /adr:new "<title>"
/spec:design                /spec:release
/spec:specify
```

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
