# How to write a requirement in EARS notation

**Goal:** produce one functional requirement in EARS form, assigned a stable ID, ready to map 1:1 to a test.

**When to use:** you are in Stage 3 (Requirements) and need to write or revise a single functional requirement in `specs/<slug>/requirements.md`.

**Prerequisites:**

- The feature's `idea.md` and `research.md` are signed off.
- You know which **area** the requirement covers (the `<AREA>` token in the ID — e.g. `AUTH`, `BILLING`, `UI`).
- One observable behaviour to describe.

## EARS pattern table

| Pattern             | Keyword shape                          | Example sentence                                                                                       |
|---------------------|----------------------------------------|--------------------------------------------------------------------------------------------------------|
| Ubiquitous          | *The system shall …*                   | The system shall log every authentication attempt to the audit stream.                                 |
| Event-driven        | *When `<trigger>`, the system shall …* | When the user submits valid credentials, the system shall redirect to the dashboard within 500 ms.    |
| State-driven        | *While `<state>`, the system shall …*  | While the user session is active, the system shall refresh the access token every 14 minutes.         |
| Unwanted-behaviour  | *If `<condition>`, then the system shall …* | If the password is rejected three times within five minutes, then the system shall lock the account. |
| Optional-feature    | *Where `<feature>`, the system shall …* | Where SSO is enabled, the system shall skip the local password check.                                  |

See [`docs/ears-notation.md`](../ears-notation.md) for the full catalogue and edge cases.

## Steps

1. Pick the EARS pattern that matches the behaviour using the table above.
2. Write the sentence using the chosen pattern. Use *shall*, name the system as the subject, and describe one observable response.
3. Allocate the next ID in the area — `REQ-<AREA>-NNN`. Look at the existing IDs in `requirements.md` and increment.
4. Add the requirement to `requirements.md` under `## Functional requirements (EARS)`, as a new sub-section using the template shape — heading `### REQ-<AREA>-NNN — <short title>` followed by the bullet block (`Pattern`, `Statement`, `Acceptance` with Given/When/Then, `Priority`, `Satisfies`). See [`templates/prd-template.md`](../../templates/prd-template.md) for the exact field list.
5. Add a placeholder test ID in your notes — `TEST-<AREA>-NNN`, matching the requirement's number — so the QA agent can pick it up in Stage 8.
6. Re-read the sentence as if you were writing the test for it. If you cannot picture exactly one assertion, the sentence is still ambiguous — rewrite it.

## Verify

`grep -E "REQ-[A-Z]+-[0-9]{3}" specs/<slug>/requirements.md` lists your new ID at least once (the heading and any inline references), and the **Statement** bullet under that heading uses one of the five EARS keyword shapes from the table above.

## Related

- Reference — [`docs/ears-notation.md`](../ears-notation.md) — full pattern catalogue and worked examples.
- Reference — [`templates/prd-template.md`](../../templates/prd-template.md) — the section the requirement lives under.
- Reference — [`docs/traceability.md`](../traceability.md) — the requirement → spec → task → code → test chain.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article VIII (Plain Language) on why EARS is mandatory.
- How-to — [`resume-paused-feature.md`](./resume-paused-feature.md) — where to pick up if your feature is mid-flight.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
