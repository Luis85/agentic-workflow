import test from "node:test";
import assert from "node:assert/strict";
import {
  checkResult,
  formatDiagnostic,
  formatGitHubAnnotation,
  normalizeDiagnostic,
  wantsJson,
} from "../../scripts/lib/diagnostics.js";

test("normalizeDiagnostic extracts file and line from legacy strings", () => {
  assert.deepEqual(normalizeDiagnostic("docs/example.md:42 missing heading"), {
    path: "docs/example.md",
    line: 42,
    message: "missing heading",
  });
});

test("checkResult produces serializable pass and fail results", () => {
  assert.deepEqual(checkResult("check:example", []), {
    check: "check:example",
    status: "pass",
    errors: [],
  });

  assert.deepEqual(checkResult("check:example", [{ message: "broken", code: "E001" }]), {
    check: "check:example",
    status: "fail",
    errors: [{ message: "broken", code: "E001" }],
  });
});

test("formatDiagnostic preserves location and code when available", () => {
  assert.equal(
    formatDiagnostic({
      path: "docs/example.md",
      line: 7,
      code: "LINK",
      message: "missing anchor",
    }),
    "docs/example.md:7 [LINK] missing anchor",
  );

  assert.equal(
    formatDiagnostic({
      path: "docs/example.md",
      code: "FM_MISSING",
      message: "is missing YAML frontmatter",
    }),
    "docs/example.md [FM_MISSING] is missing YAML frontmatter",
  );
});

test("wantsJson detects explicit JSON output request", () => {
  assert.equal(wantsJson(["node", "script.ts", "--json"]), true);
  assert.equal(wantsJson(["node", "script.ts"]), false);
});

test("formatGitHubAnnotation escapes Actions command syntax", () => {
  assert.equal(
    formatGitHubAnnotation({
      path: "docs/example:one,two.md",
      line: 7,
      code: "LINK_ANCHOR",
      message: "bad 100% link\nmissing anchor",
    }),
    "::error file=docs/example%3Aone%2Ctwo.md,line=7,title=LINK_ANCHOR::bad 100%25 link%0Amissing anchor",
  );
});
