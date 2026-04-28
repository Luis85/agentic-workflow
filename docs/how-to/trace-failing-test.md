# How to trace a failing test back to a requirement

**Goal:** start from a failing `TEST-<AREA>-NNN`, walk the chain back through code, task, spec, and requirement, and identify which layer the defect lives in before fixing it.

**When to use:** a test in `specs/<slug>/test-report.md` is red and you do not yet know whether the bug is in the test, the code, or the requirement upstream.

**Prerequisites:**

- A reproducible failing test with a `TEST-<AREA>-NNN` ID.
- The feature's `specs/<slug>/` directory accessible.
- The traceability matrix at `specs/<slug>/traceability.md` is up to date.

## Steps

1. Open `specs/<slug>/test-report.md`. Copy the failing `TEST-<AREA>-NNN` ID and its assertion text.
2. Open `specs/<slug>/traceability.md`. Find the row whose Test column contains your ID. Note the linked `T-<AREA>-NNN` (task) and `REQ-<AREA>-NNN` (requirement).
3. Open the test source. Re-read the assertion. Ask: does it actually verify the requirement, or does it test something close-but-different? If close-but-different, the defect is in the **test** — fix the test.
4. Open the code under test. Step through the assertion mentally. Does the code do what the test expects? If no, the defect is in the **code** — fix the code, leave the test.
5. Open the originating `REQ-<AREA>-NNN` in `requirements.md`. Does the requirement actually say what the test is checking? If no, the defect is in the **requirement** — escalate per [Article IV](../../memory/constitution.md): update `requirements.md` first, then re-spec, re-task, re-implement, re-test.
6. Document your finding in the test report's `Notes:` field for the failure, with a one-liner naming the layer.

## Verify

`grep "<TEST-ID>" specs/<slug>/test-report.md` shows your finding line, and `git diff` shows the fix at exactly one layer (test, code, or requirement chain) — not all three.

## Related

- Reference — [`docs/traceability.md`](../traceability.md) — the chain of IDs.
- Reference — [`docs/quality-framework.md`](../quality-framework.md) — gates per stage.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article IV on resolving defects at the earliest stage.
