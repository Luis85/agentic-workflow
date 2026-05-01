import test from "node:test";
import assert from "node:assert/strict";
import { parseStageProgressTable, specStateDiagnosticsForText } from "../../scripts/lib/spec-state.js";

const REL = "specs/feat/workflow-state.md";
const FEATURE_DIR = "feat";

const cleanFrontmatter = `---
feature: feat
area: FEAT
current_stage: idea
status: active
last_updated: 2026-04-29
last_agent: analyst
artifacts:
  idea.md: in-progress
  research.md: pending
  requirements.md: pending
  design.md: pending
  spec.md: pending
  tasks.md: pending
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---
`;

const cleanBody = `
# Workflow state — feat

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | \`idea.md\` | in-progress |
| 2. Research | \`research.md\` | pending |
| 3. Requirements | \`requirements.md\` | pending |
| 4. Design | \`design.md\` | pending |
| 5. Specification | \`spec.md\` | pending |
| 6. Tasks | \`tasks.md\` | pending |
| 7. Implementation | \`implementation-log.md\` | pending |
| 8. Testing | \`test-plan.md\`, \`test-report.md\` | pending |
| 9. Review | \`review.md\`, \`traceability.md\` | pending |
| 10. Release | \`release-notes.md\` | pending |
| 11. Learning | \`retrospective.md\` | pending |

## Skips

> None.

## Blocks

> None.

## Hand-off notes

Free-form.

## Open clarifications

> None.
`;

const cleanText = `${cleanFrontmatter}${cleanBody}`;

function diagnose(text: string, options?: { artifactExists?: (name: string) => boolean }): string[] {
  return specStateDiagnosticsForText(REL, FEATURE_DIR, text, options);
}

test("clean fixture passes with no diagnostics", () => {
  assert.deepEqual(diagnose(cleanText), []);
});

test("missing YAML frontmatter is reported", () => {
  const text = "no frontmatter here\n";
  assert.deepEqual(diagnose(text), [`${REL} is missing YAML frontmatter`]);
});

test("missing required frontmatter key is reported", () => {
  const text = cleanText.replace("area: FEAT\n", "");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} missing frontmatter key: area`));
});

test("non-uppercase area code is rejected", () => {
  const text = cleanText.replace("area: FEAT", "area: feat");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} area must be an uppercase alphanumeric code`));
});

test("unsupported current_stage is rejected", () => {
  const text = cleanText.replace("current_stage: idea", "current_stage: ideation");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} has unsupported current_stage: ideation`));
});

test("non-ISO last_updated is rejected", () => {
  const text = cleanText.replace("last_updated: 2026-04-29", "last_updated: 04/29/2026");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} last_updated must use YYYY-MM-DD`));
});

test("feature must match folder name", () => {
  const text = cleanText.replace("feature: feat", "feature: other-feat");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} feature must match its folder name: ${FEATURE_DIR}`));
});

test("artifact map missing a canonical artifact is reported", () => {
  const text = cleanText.replace("  research.md: pending\n", "");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} artifacts missing research.md`));
});

test("unknown artifact name is rejected", () => {
  const text = cleanText.replace(
    "  retrospective.md: pending\n---",
    "  retrospective.md: pending\n  ghost.md: pending\n---",
  );
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} artifacts includes unknown artifact ghost.md`));
});

test("unsupported artifact status is rejected", () => {
  const text = cleanText.replace("idea.md: in-progress", "idea.md: ongoing");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} artifact idea.md has unsupported status: ongoing`));
});

test("complete artifact whose file is missing is reported", () => {
  const text = cleanText.replace("idea.md: in-progress", "idea.md: complete");
  const diagnostics = diagnose(text, { artifactExists: () => false });
  assert.ok(
    diagnostics.includes(`${REL} marks idea.md as complete, but idea.md does not exist`),
  );
});

test("retrospective skipped is rejected", () => {
  const text = cleanText.replace("retrospective.md: pending", "retrospective.md: skipped");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} must not skip retrospective.md`));
});

test("active status without an open current-stage artifact is reported", () => {
  const text = cleanText.replace("idea.md: in-progress", "idea.md: complete");
  const diagnostics = diagnose(text);
  assert.ok(
    diagnostics.includes(`${REL} status is active, but no idea artifact is pending or in-progress`),
  );
});

test("blocked status without a blocked current-stage artifact is reported", () => {
  const text = cleanText
    .replace("status: active", "status: blocked")
    .replace("idea.md: in-progress", "idea.md: pending");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} status is blocked, but no idea artifact is blocked`));
});

test("done status with non-complete artifact is reported", () => {
  const text = cleanText
    .replace("current_stage: idea", "current_stage: learning")
    .replace("status: active", "status: done")
    .replaceAll(": pending", ": complete")
    .replace("idea.md: in-progress", "idea.md: complete")
    .replace("retrospective.md: complete", "retrospective.md: pending");
  const diagnostics = diagnose(text);
  assert.ok(
    diagnostics.some((message) =>
      message.startsWith(`${REL} status is done, but retrospective.md is pending`),
    ),
  );
});

test("done status with unresolved clarifications is reported", () => {
  const text = completeWorkflowText().replace(
    "## Open clarifications\n\n> None.",
    "## Open clarifications\n\n- [ ] CLAR-FEAT-001 — Resolve before completion.",
  );
  const diagnostics = diagnose(text);
  assert.ok(
    diagnostics.includes(`${REL} status is done, but Open clarifications has 1 unresolved item(s)`),
  );
});

test("done status with only resolved clarifications passes the clarification gate", () => {
  const text = completeWorkflowText().replace(
    "## Open clarifications\n\n> None.",
    "## Open clarifications\n\n- [x] CLAR-FEAT-001 — resolved 2026-05-01.",
  );
  const diagnostics = diagnose(text);
  assert.equal(
    diagnostics.some((message) => message.includes("Open clarifications has")),
    false,
  );
});

test("missing Stage progress artifact table is reported", () => {
  const text = cleanText.replace(/\| Stage \| Artifact \| Status \|[\s\S]*?Learning \| `retrospective.md` \| pending \|\n/m, "");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} missing Stage progress artifact table`));
});

test("Stage progress table missing an artifact row is reported", () => {
  const text = cleanText.replace(
    "| 2. Research | `research.md` | pending |\n",
    "",
  );
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} Stage progress table missing research.md`));
});

test("Stage progress table drift between table and frontmatter is reported", () => {
  const text = cleanText.replace(
    "| 2. Research | `research.md` | pending |",
    "| 2. Research | `research.md` | complete |",
  );
  const diagnostics = diagnose(text);
  assert.ok(
    diagnostics.includes(
      `${REL} Stage progress table has research.md as complete, but frontmatter says pending`,
    ),
  );
});

test("missing required section is reported", () => {
  const text = cleanText.replace("## Skips\n\n> None.\n\n", "");
  const diagnostics = diagnose(text);
  assert.ok(diagnostics.includes(`${REL} missing section: Skips`));
});

test("skipped artifact without mention in Skips section is reported", () => {
  const text = cleanText
    .replace("research.md: pending", "research.md: skipped")
    .replace(
      "| 2. Research | `research.md` | pending |",
      "| 2. Research | `research.md` | skipped |",
    );
  const diagnostics = diagnose(text);
  assert.ok(
    diagnostics.includes(
      `${REL} marks research.md as skipped, but Skips section does not document it`,
    ),
  );
});

test("skipped artifact mentioned in Skips section passes the skip-doc check", () => {
  const text = cleanText
    .replace("research.md: pending", "research.md: skipped")
    .replace(
      "| 2. Research | `research.md` | pending |",
      "| 2. Research | `research.md` | skipped |",
    )
    .replace("## Skips\n\n> None.", "## Skips\n\n- `research.md` skipped because no upstream sources required.");
  const diagnostics = diagnose(text);
  assert.equal(
    diagnostics.some((message) =>
      message.includes("Skips section does not document"),
    ),
    false,
  );
});

test("parseStageProgressTable extracts artifact-status pairs", () => {
  const table = parseStageProgressTable(`
| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | \`idea.md\` | complete |
| 8. Testing | \`test-plan.md\`, \`test-report.md\` | pending |
`);
  assert.equal(table.get("idea.md"), "complete");
  assert.equal(table.get("test-plan.md"), "pending");
  assert.equal(table.get("test-report.md"), "pending");
});

function completeWorkflowText(): string {
  return cleanText
    .replace("current_stage: idea", "current_stage: learning")
    .replace("status: active", "status: done")
    .replace("idea.md: in-progress", "idea.md: complete")
    .replaceAll(": pending", ": complete")
    .replace("| 1. Idea | `idea.md` | in-progress |", "| 1. Idea | `idea.md` | complete |")
    .replaceAll("| pending |", "| complete |");
}
