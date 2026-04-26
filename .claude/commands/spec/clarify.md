---
description: Optional gate. Interrogates the active artifact for under-specification and produces a list of clarifications to resolve before exiting the stage.
argument-hint: [feature-slug] [stage]
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /spec:clarify

Optional quality gate — runs **between** stages (or before declaring a stage `complete`).

1. Resolve slug; resolve the active stage from `workflow-state.md` or `$2`.
2. Identify the active artifact (e.g. `requirements.md` for stage 3).
3. Spawn the **stage's owner agent** (e.g. `pm` for requirements) in *clarify mode*:
   - read the artifact,
   - look for vagueness, ambiguity, missing acceptance criteria, undefined edge cases, untestable verbs, embedded design,
   - produce a list of clarifications under `Open clarifications` in `workflow-state.md`.
4. The user (or the upstream agent) resolves each clarification before the stage can be marked `complete`.

## Heuristics for what counts as a clarification

- Quantifier missing? ("fast", "many", "appropriate")
- Trigger vague? ("when needed", "if applicable")
- Subject vague? ("the system", "the service" — which one?)
- Multiple requirements smuggled into one (`and` lists)?
- Untestable verbs ("handle", "support", "understand")?
- Design language in a requirement?
- NFR with no target?

## Don't

- Don't try to *resolve* clarifications yourself — surface them. The owning role decides.
