import test from "node:test";
import assert from "node:assert/strict";
import { futureDateDiagnostics, frontmatterDiagnostic, requiredKeyDiagnostics } from "../../scripts/lib/frontmatter.js";

test("frontmatterDiagnostic returns structured failure details", () => {
  assert.deepEqual(frontmatterDiagnostic("FM_ADR_ID", "docs/adr/0001-example.md", "frontmatter id must be ADR-0001"), {
    code: "FM_ADR_ID",
    path: "docs/adr/0001-example.md",
    message: "frontmatter id must be ADR-0001",
  });
});

test("requiredKeyDiagnostics reports only missing or empty keys", () => {
  assert.deepEqual(
    requiredKeyDiagnostics(
      "README.md",
      {
        title: "Example",
        folder: "",
        description: "Present",
      },
      ["title", "folder", "description", "entry_point"],
    ),
    [
      {
        code: "FM_KEY",
        path: "README.md",
        message: "missing frontmatter key: folder",
      },
      {
        code: "FM_KEY",
        path: "README.md",
        message: "missing frontmatter key: entry_point",
      },
    ],
  );
});

test("futureDateDiagnostics reports updated and last_updated values after today", () => {
  assert.deepEqual(
    futureDateDiagnostics(
      "specs/example/workflow-state.md",
      "title: Example\nlast_updated: 2026-05-04\nupdated: 2026-05-02\n",
      new Date("2026-05-02T12:00:00Z"),
    ),
    [
      {
        code: "FRONTMATTER_FUTURE_DATE",
        path: "specs/example/workflow-state.md",
        line: 3,
        message: "last_updated must not be later than today's UTC date (2026-05-02): 2026-05-04",
      },
    ],
  );
});
