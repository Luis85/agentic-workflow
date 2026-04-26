# EARS Notation — Easy Approach to Requirements Syntax

Functional requirements in this kit use **EARS** (Mavin et al., Rolls-Royce, 2009). EARS gives requirements five fixed sentence templates so they're unambiguous and map 1:1 to acceptance tests.

## The five patterns

### 1. Ubiquitous

Always-on requirement. No trigger.

> **The `<system>` shall `<response>`.**

- *The mobile app shall persist user preferences across sessions.*
- *The API shall return responses in JSON.*

### 2. Event-driven

Something happens; the system responds.

> **WHEN `<trigger>`, the `<system>` shall `<response>`.**

- *WHEN a user clicks "reset password", the auth service shall send a reset email within 30 seconds.*

### 3. State-driven

The system is in a particular state; behaviour applies for the duration.

> **WHILE `<state>`, the `<system>` shall `<response>`.**

- *WHILE the device is offline, the app shall queue outgoing requests in local storage.*

### 4. Optional feature

The behaviour applies only when the feature is included.

> **WHERE `<feature>` is included, the `<system>` shall `<response>`.**

- *WHERE biometric authentication is supported, the login screen shall offer a "Use Face ID" button.*

### 5. Unwanted behaviour

Something bad happens; the system handles it.

> **IF `<trigger>`, THEN the `<system>` shall `<response>`.**

- *IF the password is entered incorrectly five times in a row, THEN the auth service shall lock the account for 15 minutes.*

### Combinations

Patterns may be combined for nuanced requirements:

> *WHILE the user is signed in, WHEN they tap "logout", the app shall invalidate the session and return to the welcome screen within 2 seconds.*

## Style rules

- **Use `shall`**, not `should`, `will`, `may`, or `must`. `shall` signals a requirement.
- **One requirement per sentence.** No `and` lists that hide multiple requirements.
- **Quantify where you can.** "Within 2 seconds", "at most 100ms", "≥ 99.9% of the time".
- **Name the system explicitly** — "the auth service", "the checkout API". Avoid "the system" without context.
- **No design language.** Requirements describe *what*, not *how*. "Use Redis" is design, not a requirement.

## Each requirement gets

- **A stable ID** — `REQ-<AREA>-NNN` (see [`docs/traceability.md`](traceability.md)).
- **A title** — short, human-readable.
- **An EARS sentence** — the requirement itself.
- **An acceptance criterion** — derivable from the EARS sentence; expressed as a Given/When/Then or test scenario.
- **A priority** — `must` / `should` / `could` (MoSCoW).
- **Links** — to the upstream idea / research, and downstream spec items.

## Example block (from `requirements.md`)

```markdown
### REQ-AUTH-001 — Password reset via email

- **Pattern:** Event-driven
- **Statement:** WHEN a signed-out user submits the "Forgot password" form with a registered email, the auth service shall send a single-use reset link to that email within 30 seconds.
- **Acceptance:**
  - Given the user is signed out and on the login page
  - When they enter a registered email and submit the "Forgot password" form
  - Then the auth service issues a reset link valid for 1 hour
  - And an email arrives at the registered address within 30 seconds
  - And no link is sent if the email is not registered (silent — no enumeration)
- **Priority:** must
- **Links:** IDEA-AUTH-001, RESEARCH-AUTH-002 → SPEC-AUTH-001
```

## Common pitfalls

- **Hidden conjunctions:** "WHEN the user logs in, the system shall load the dashboard *and* refresh notifications." → Two requirements. Split.
- **Untestable verbs:** *handle*, *support*, *understand*. Use *return*, *display*, *persist*, *reject*, *log*.
- **Vague triggers:** "WHEN appropriate". Always concrete.
- **Embedded design:** "WHEN the user clicks login, the system shall query Postgres and …". Postgres belongs in the spec, not the requirement.

## Further reading

- Alistair Mavin, *EARS: Easy Approach to Requirements Syntax* — https://alistairmavin.com/ears/
- IEEE paper: Mavin, Wilkinson, Harwood, Novak, *Easy Approach to Requirements Syntax (EARS)* (2009).
