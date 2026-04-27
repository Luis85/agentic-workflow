# project-run — Project Manager Track conductor

**Triggers:** "let's start a client project", "set up a service engagement", "I need project management for this work", "start a project for [client]", "manage this as a client engagement", "I have a client brief"

---

## What this skill does

`project-run` is the conversational entry point for the **Project Manager Track** — the opt-in layer for service-provider teams delivering software to clients. It guides the user through the full project lifecycle: initiation → execution (weekly rhythm) → closure → post-project evaluation.

It sequences specialist commands (`/project:*`) and gates with `AskUserQuestion` at every human-decision point (go/no-go, change approval, sign-off).

This skill does **not** drive Spec Kit feature work (`/spec:*`) or Discovery Track sprints (`/discovery:*`) — it coordinates them from the project management layer.

---

## When to run

Run when:
- A client engagement is starting and governance is needed.
- The user says they have a statement of work, contract, or client brief.
- Multiple features need to be coordinated under a single delivery commitment.
- Scope, schedule, budget, or stakeholder reporting are concerns.

**Do not run when:**
- The user is building an internal product with no client.
- There is no contract boundary.
- The user just wants to run a feature — recommend `/spec:start` instead.
- The user has a blank page and needs ideation first — recommend `/discovery:start` instead.

---

## Procedure

### Phase 0 — Orientation

1. Ask the user to describe the engagement in one paragraph: who is the client, what are they getting, when, and at what cost (if known).
2. Confirm the user wants the full project management layer (not just a Spec Kit feature). If they're uncertain, explain the difference (see `docs/project-track.md` §1).
3. Ask for a project slug (engagement-level name, not solution name). Suggest corrections if needed.

### Phase 1 — Bootstrap and Initiation

4. Run `/project:start <slug>`.
5. Ask the user to share the client brief, statement of work, or scope description. Accept any format (prose, email, bullet list, doc path).
6. Run `/project:initiate` — the `project-manager` agent will draft the four management documents and produce a go/no-go decision brief.
7. Present the go/no-go brief. Ask the user (acting as sponsor): "Do you approve initiating this project?" Gate on approval before advancing.

### Phase 2 — Execution rhythm

8. Recommend: "Run `/project:weekly` each week. I'll read all linked feature `workflow-state.md` files and produce a weekly log entry with RAG status."
9. Ask: "Are there existing features (`specs/`) to link, or do we need to start new ones?"
   - If yes: record the `specs/<slug>/` paths in `project-description.md`'s deliverables section.
   - If no: recommend `/spec:start <feature-slug>` for each deliverable, then `/project:initiate` after to link them.
10. Ask: "Do you have a known client communication cadence (weekly, bi-weekly)? I'll include focused-comms notes in the weekly log."

### Phase 3 — Closure (when user signals project end)

11. Confirm all deliverables have been accepted or explicitly deferred.
12. Run `/project:close` — the agent will draft the closure document and ask for sponsor sign-off.
13. Recommend: "Set a reminder to run `/project:post` in 3–6 months to evaluate whether the expected benefits were realised."

### At any point — change control

If the user mentions a new client request, out-of-scope work, or an unexpected scope change:
- Prompt: "This sounds like a change request. Want me to run `/project:change` to log and assess it?"

---

## State reading

Before each phase, read `projects/<slug>/project-state.md`:
- If `phase: scaffolded` → Phase 1 (initiation pending)
- If `phase: executing` → Phase 2 (check if weekly log is current)
- If `phase: closing` → Phase 3 (closure in progress)
- If `phase: closed` → remind user about `/project:post`

If no `project-state.md` exists: run Phase 0 + Phase 1.

---

## References

- Methodology: [`docs/project-track.md`](../../docs/project-track.md)
- ADR: [`docs/adr/0006-add-project-manager-track.md`](../../docs/adr/0006-add-project-manager-track.md)
- Agent: [`.claude/agents/project-manager.md`](../../.claude/agents/project-manager.md)
- Commands: `.claude/commands/project/` (start, initiate, weekly, change, report, close, post)
- Templates: `templates/project-state-template.md` + `templates/project-description-template.md` + `templates/deliverables-map-template.md` + `templates/followup-register-template.md` + `templates/health-register-template.md`
