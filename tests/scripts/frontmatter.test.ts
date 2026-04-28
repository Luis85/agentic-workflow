import test from "node:test";
import assert from "node:assert/strict";
import { frontmatterDiagnostic, requiredKeyDiagnostics } from "../../scripts/lib/frontmatter.js";

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
