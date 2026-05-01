---
name: tdd-cycle
description: Implement one slice via strict red -> green -> refactor. Failing test first, smallest passing code, refactor only on green. Use in stage 7 (Implementation). Triggers "TDD", "red-green-refactor", "test-first".
argument-hint: [task-id, e.g. "T-PAY-014"]
---

# TDD cycle

After Beck's TDD and Pocock's `tdd`. The cycle is the contract; if you skip a step, you've drifted from TDD into "tests after."

## The cycle

This skill executes **the currently dispatched task**, not the whole backlog. `/spec:implement` is scoped to a single task per invocation (`.claude/commands/spec/implement.md` step 1); when this task is complete, return control to the orchestrator, which will dispatch the next ready task in a fresh `/spec:implement` call.

For the dispatched task `<T-AREA-NNN>`:

### 🔴 RED

1. Read the task's acceptance criteria.
2. Pick **one** observable behavior from the criteria — the smallest meaningful one.
3. Write a single failing test that asserts that behavior **through the public interface** the spec defines. No private-method tests, no implementation peeking.
4. Run the test. **It must fail with a meaningful message** — "expected X, got Y", not "ReferenceError: foo is not defined". If the failure is about missing scaffolding, write the minimum stubs to get a real assertion failure, then re-run.
5. Commit (or mark as ready to commit if the user hasn't authorized commits) using the canonical task-ID format from `.claude/commands/spec/implement.md`: `feat(<area>): <T-AREA-NNN> red — <behavior in plain English>`. Always include the task ID so the commit traces back to its task per `docs/traceability.md`.

### 🟢 GREEN

1. Write the **smallest** code change that makes the failing test pass. Resist generality. "The simplest thing that could possibly work."
2. Run the **whole test suite** — not just this test. A green local with a red suite is a regression.
3. If something else turned red, you broke an invariant. Revert and find a smaller change.
4. Commit with the task-ID format: `feat(<area>): <T-AREA-NNN> green — <same behavior phrasing>`.

### 🔵 REFACTOR

1. Look at the code you just wrote and the surrounding code. Ask:
   - Is there duplication? (extract)
   - Is a method too long? (split)
   - Is a module too shallow? (deepen — push more behavior behind a smaller interface)
   - Is naming honest? (rename to match the canonical term in `docs/glossary/<slug>.md`)
   - Is there feature envy / primitive obsession?
2. Make at most **one** refactor per cycle. Run the suite after each change.
3. If no refactor needed, say so explicitly and move on. Don't manufacture refactors.
4. Commit with the task-ID format: `refactor(<area>): <T-AREA-NNN> <what you changed>` (use `refactor` type rather than `feat` since no new behavior is added).

### Loop within the dispatched task only

Pick the next observable behavior **from the same task's** acceptance criteria. RED again. Continue until *this task's* acceptance criteria all pass.

When the dispatched task is fully green and refactored, append an entry to `specs/<slug>/implementation-log.md`: task ID, behaviors covered, tests added (count + names), files touched, commit SHAs (or "uncommitted").

Then **return control to the orchestrator** with a one-line summary. Do not pick up the next task — that's the orchestrator's job (it will dispatch a new `/spec:implement` for the next ready task per `.claude/skills/orchestrate/PHASES.md` Stage 7 loop).

## Anti-patterns to refuse

- **Test after.** If the test was written after the production code, it's not TDD; rewrite the test first or delete the production code.
- **Horizontal slicing.** Don't write all the tests then all the code. Strict one-cycle-at-a-time.
- **Mock the unit under test.** Mocks belong at system boundaries (network, filesystem, time, randomness). Mocking the thing you're testing means the test is meaningless.
- **Refactor on red.** Never. Refactoring without a green safety net is just changing code.
- **Refactor without a refactor.** Don't ship code that you yourself would have flagged in review.

## When you can't make the test pass within two attempts

Stop. Write a note in `implementation-log.md` describing what you tried, what you observed, and what you suspect is the root cause. Return control to the orchestrator with a `blocked` summary. Don't keep grinding — the spec or design probably has a gap.

## Mocking guidance

- Mock at **system boundaries**: HTTP clients, database drivers, filesystem, clock, random.
- Prefer **SDK-style fakes** over generic mocks (a fake `UserStore` over a generic mock of a method).
- Never mock the system under test. Never mock value objects.
- Inject dependencies; don't reach for globals to swap out.

## Definition of done for a task

- All acceptance criteria have at least one passing test asserting the observable behavior.
- The whole test suite is green.
- Lint and type-check pass.
- An `implementation-log.md` entry was appended.
- No `TODO` left in the code that wasn't already there.

## Outputs

- Source code changes.
- Test additions.
- One `implementation-log.md` append per task.
- No artifacts in `specs/<slug>/` other than the log append — the design and spec are upstream-owned.
