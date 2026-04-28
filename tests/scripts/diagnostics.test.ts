import test from "node:test";
import assert from "node:assert/strict";
import {
  checkResult,
  formatDiagnostic,
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
});

test("wantsJson detects explicit JSON output request", () => {
  assert.equal(wantsJson(["node", "script.ts", "--json"]), true);
  assert.equal(wantsJson(["node", "script.ts"]), false);
});
