import test from "node:test";
import assert from "node:assert/strict";
import {
  type ArtifactRecord,
  idsIn,
  splitItemSections,
  traceabilityDiagnosticsForFeature,
} from "../../scripts/lib/traceability.js";

const STATE_REL = "specs/feat/workflow-state.md";

const cleanState = `---
feature: feat
area: FEAT
current_stage: requirements
status: active
last_updated: 2026-04-29
last_agent: pm
artifacts: {}
---

# Workflow state
`;

function record(artifact: string, text: string, slug = "feat"): ArtifactRecord {
  return { rel: `specs/${slug}/${artifact}`, artifact, text };
}

function diagnose(stateText: string, records: ArtifactRecord[]): string[] {
  return traceabilityDiagnosticsForFeature(STATE_REL, stateText, records);
}

const cleanRequirements = record(
  "requirements.md",
  `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
);

test("clean fixture passes with no diagnostics", () => {
  assert.deepEqual(diagnose(cleanState, [cleanRequirements]), []);
});

test("workflow-state without frontmatter is reported", () => {
  assert.deepEqual(diagnose("no frontmatter\n", []), [`${STATE_REL} is missing YAML frontmatter`]);
});

test("workflow-state without area is reported", () => {
  const text = cleanState.replace("area: FEAT\n", "");
  assert.deepEqual(diagnose(text, []), [`${STATE_REL} missing frontmatter key: area`]);
});

test("artifact frontmatter feature mismatch is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: other-feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(
    diagnostics.includes(`specs/feat/requirements.md frontmatter feature must match workflow feature: feat`),
  );
});

test("artifact frontmatter id area mismatch is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: feat
id: PRD-OTHER-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/requirements.md frontmatter id area OTHER must match workflow area FEAT`,
    ),
  );
});

test("heading defining wrong-area ID is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-OTHER-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(
    diagnostics.includes(`specs/feat/requirements.md defines REQ-OTHER-001, but workflow area is FEAT`),
  );
});

test("body referencing wrong-area ID is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
- **Links:** see REQ-OTHER-002
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(
    diagnostics.includes(`specs/feat/requirements.md references REQ-OTHER-002, but workflow area is FEAT`),
  );
});

test("duplicate definition across files is reported", () => {
  const second = record(
    "spec.md",
    `---
feature: feat
id: SPECDOC-FEAT-001
---

## REQ-FEAT-001 — Duplicate

- **Satisfies:** PRD-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [cleanRequirements, second]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/spec.md duplicates REQ-FEAT-001; first defined in specs/feat/requirements.md`,
    ),
  );
});

test("duplicate frontmatter id across files is reported", () => {
  const second = record(
    "spec.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## SPEC-FEAT-001 — Title

- **Satisfies:** REQ-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [cleanRequirements, second]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/spec.md duplicates PRD-FEAT-001; first defined in specs/feat/requirements.md`,
    ),
  );
});

test("REQ section without Satisfies field is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

This requirement has no Satisfies bullet.
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(diagnostics.includes(`specs/feat/requirements.md REQ-FEAT-001 missing Satisfies field`));
});

test("non-Links field with no IDs is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** none yet
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/requirements.md REQ-FEAT-001 Satisfies field has no traceability IDs`,
    ),
  );
});

test("unknown reference is reported", () => {
  const wrong = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-002
`,
  );
  const diagnostics = diagnose(cleanState, [wrong]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/requirements.md REQ-FEAT-001 Satisfies references unknown PRD-FEAT-002`,
    ),
  );
});

test("SPEC Satisfies non-REQ/NFR is reported", () => {
  const requirements = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const spec = record(
    "spec.md",
    `---
feature: feat
id: SPECDOC-FEAT-001
---

## SPEC-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [requirements, spec]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/spec.md SPEC-FEAT-001 Satisfies should reference REQ/NFR IDs, got PRD-FEAT-001`,
    ),
  );
});

test("T Satisfies non-REQ/NFR/SPEC is reported", () => {
  const requirements = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const tasks = record(
    "tasks.md",
    `---
feature: feat
id: TASKS-FEAT-001
---

## T-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [requirements, tasks]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/tasks.md T-FEAT-001 Satisfies should reference REQ/NFR/SPEC IDs, got PRD-FEAT-001`,
    ),
  );
});

test("T Depends on non-T is reported", () => {
  const requirements = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const tasks = record(
    "tasks.md",
    `---
feature: feat
id: TASKS-FEAT-001
---

## T-FEAT-001 — Title

- **Satisfies:** REQ-FEAT-001
- **Depends on:** REQ-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [requirements, tasks]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/tasks.md T-FEAT-001 Depends on should reference T IDs, got REQ-FEAT-001`,
    ),
  );
});

test("TEST Requirement non-REQ/NFR is reported", () => {
  const requirements = record(
    "requirements.md",
    `---
feature: feat
id: PRD-FEAT-001
---

## REQ-FEAT-001 — Title

- **Satisfies:** PRD-FEAT-001
`,
  );
  const spec = record(
    "spec.md",
    `---
feature: feat
id: SPECDOC-FEAT-001
---

## SPEC-FEAT-001 — Title

- **Satisfies:** REQ-FEAT-001
`,
  );
  const testPlan = record(
    "test-plan.md",
    `---
feature: feat
id: TESTPLAN-FEAT-001
---

## TEST-FEAT-001 — Title

- **Requirement:** SPEC-FEAT-001
`,
  );
  const diagnostics = diagnose(cleanState, [requirements, spec, testPlan]);
  assert.ok(
    diagnostics.includes(
      `specs/feat/test-plan.md TEST-FEAT-001 Requirement should reference REQ/NFR IDs, got SPEC-FEAT-001`,
    ),
  );
});

test("splitItemSections splits markdown body by traceability headings", () => {
  const sections = splitItemSections(
    record(
      "requirements.md",
      `## REQ-FEAT-001 — One

body of one

## REQ-FEAT-002 — Two

body of two
`,
    ),
  );
  assert.equal(sections.length, 2);
  assert.equal(sections[0].id, "REQ-FEAT-001");
  assert.equal(sections[1].id, "REQ-FEAT-002");
  assert.match(sections[0].body, /body of one/);
  assert.match(sections[1].body, /body of two/);
});

test("idsIn extracts traceability IDs from a free-form value", () => {
  assert.deepEqual(idsIn("see REQ-FEAT-001 and SPEC-FEAT-002"), ["REQ-FEAT-001", "SPEC-FEAT-002"]);
  assert.deepEqual(idsIn("none"), []);
});
