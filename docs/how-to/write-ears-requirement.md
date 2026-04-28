# How to write a requirement in EARS notation

**Goal:** produce one functional requirement in EARS form, assigned a stable ID, ready to map 1:1 to a test.

**When to use:** you are in Stage 3 (Requirements) and need to write or revise a single functional requirement in `specs/<slug>/requirements.md`.

**Prerequisites:**

- The feature's `idea.md` and `research.md` are signed off.
- You know which **area** the requirement covers (the `<AREA>` token in the ID — e.g. `AUTH`, `BILLING`, `UI`).
- One observable behaviour to describe.

## Steps

1. Pick the EARS pattern that matches the behaviour — **ubiquitous** (always true), **event** (`When <trigger>`), **state** (`While <state>`), **unwanted** (`If <condition>, then`), or **optional** (`Where <feature>`). See [`docs/ears-notation.md`](../ears-notation.md) for examples of each.
2. Write the sentence using the chosen pattern. Use *shall*, name the system as the subject, and describe one observable response. Example — *"When the user submits the login form with valid credentials, the system shall redirect to the dashboard within 500 ms."*
3. Allocate the next ID in the area — `REQ-<AREA>-NNN`. Look at the existing IDs in `requirements.md` and increment.
4. Add the requirement to `requirements.md` under the right heading, with the ID prefixed — `**REQ-AUTH-014.** When the user submits…`.
5. Add a placeholder test ID in your notes — `TEST-AUTH-014` — so the QA agent can pick it up in Stage 8.
6. Re-read the sentence as if you were writing the test for it. If you cannot picture exactly one assertion, the sentence is still ambiguous — rewrite it.

## Verify

`grep -E "REQ-[A-Z]+-[0-9]{3}" specs/<slug>/requirements.md` lists your new ID exactly once, and the sentence on that line uses one of the five EARS keywords.

## Related

- Reference — [`docs/ears-notation.md`](../ears-notation.md) — full pattern catalogue and worked examples.
- Reference — [`docs/traceability.md`](../traceability.md) — the requirement → spec → task → code → test chain.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article VIII on why EARS is mandatory.
- How-to — [`resume-paused-feature.md`](./resume-paused-feature.md) — where to pick up if your feature is mid-flight.
