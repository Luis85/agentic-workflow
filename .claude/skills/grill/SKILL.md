---
name: grill
description: Interview user one question at a time until decision tree resolved. Triggers "grill me", "interrogate this", "tighten this up".
argument-hint: [path or topic to grill, e.g. "specs/payments/spec.md"]
---

# Grill

Interview the user one question at a time. Do not stop until every branch of the decision tree is resolved.

After Pocock's `grill-me`. This is the interview primitive every clarification gate (`/spec:clarify`, the analyst's open-question pass, design alternative selection, requirement disambiguation) reaches for.

## Procedure

1. **Restate the artifact under examination** in one sentence. Confirm with the user this is what they want grilled.
2. **Identify the first ambiguity** — the highest-leverage decision that is currently under-specified.
3. **Ask one question** to resolve it. Always:
   - Phrase it as a binary or small enum (≤4 options) where you can.
   - Provide your **recommended answer** with one-sentence reasoning.
   - If the answer is in the codebase or upstream artifacts, **answer it yourself** and confirm with the user instead of asking blind.
4. **Wait for the answer.** On answer, write the resolution into the artifact (or hold a running list to write at the end).
5. **Walk down the resulting branch** — each answer creates new sub-questions. Recurse until that branch is fully resolved before moving to the next ambiguity.
6. **When all branches are resolved**, summarize the resolved decisions in a bulleted list and confirm with the user before persisting.

## Rules

- One question per turn. Never batch.
- Always state your recommended answer. The user should be able to say "yes do that" and move on.
- Read upstream artifacts (`docs/CONTEXT.md`, `docs/glossary/*.md` — per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` if present, the relevant `specs/<slug>/*.md`) before each question — many ambiguities are already settled there.
- Use `AskUserQuestion` only when free-text or multi-option is needed. Otherwise plain conversational questions are fine.
- Don't ask "what do you want?" — propose a default and ask the user to confirm or redirect.
- Don't grill past the artifact's purpose. A PRD is grilled on requirements, not on implementation.

## When to invoke this skill

- During `/spec:clarify` (it is the body of that command).
- Inside the analyst when `idea.md` has open questions.
- Inside the pm when a requirement candidate is under-specified.
- Inside the architect when a design decision could go multiple ways.
- Anywhere the user says "grill me" or "tighten this up".

## When not to invoke

- The artifact is already specified. Don't manufacture ambiguity.
- The decision is the user's intent (e.g. priorities). Don't grill on values; ask once.
- You're already inside another skill's flow that owns the conversation (don't double-grill).
