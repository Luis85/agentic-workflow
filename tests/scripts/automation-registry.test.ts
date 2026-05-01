import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { loadAutomationRegistry, validateAutomationRegistry } from "../../scripts/lib/automation-registry.js";

test("repository automation registry validates current automation surfaces", () => {
  const errors = validateAutomationRegistry(loadAutomationRegistry());
  assert.deepEqual(errors, []);
});

test("automation registry reports missing package scripts and workflows", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-registry-test-"));
  try {
    fs.mkdirSync(path.join(root, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(root, ".github", "workflows", "verify.yml"), "name: Verify\n", "utf8");
    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ scripts: { verify: "tsx scripts/verify.ts" } }),
      "utf8",
    );

    const errors = validateAutomationRegistry({ version: 1, entries: [] }, root);
    assert.equal(errors.some((error) => typeof error !== "string" && error.code === "AUTO_PACKAGE_SCRIPT"), true);
    assert.equal(errors.some((error) => typeof error !== "string" && error.code === "AUTO_WORKFLOW"), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("automation registry reports invalid entry metadata", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-registry-schema-test-"));
  try {
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    const errors = validateAutomationRegistry(
      {
        version: 1,
        entries: [
          {
            id: "bad",
            kind: "script",
            command: "npm run bad",
            path: "missing.ts",
            purpose: "",
            read_only: true,
            safe_to_run_locally: true,
            emits_json: false,
            used_by: [],
            rerun_command: "",
          },
        ],
      },
      root,
    );
    const codes = errors.filter((error) => typeof error !== "string").map((error) => error.code);
    assert.equal(codes.includes("AUTO_FIELD"), true);
    assert.equal(codes.includes("AUTO_USED_BY"), true);
    assert.equal(codes.includes("AUTO_PATH"), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("automation registry reports non-string paths without throwing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-registry-path-test-"));
  try {
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: {} }), "utf8");
    const errors = validateAutomationRegistry(
      {
        version: 1,
        entries: [
          {
            id: "bad-path",
            kind: "script",
            path: true,
            purpose: "Bad path fixture.",
            read_only: true,
            safe_to_run_locally: true,
            emits_json: false,
            used_by: ["agent"],
            rerun_command: "npm run bad-path",
          } as unknown as Parameters<typeof validateAutomationRegistry>[0]["entries"][number],
        ],
      },
      root,
    );
    assert.equal(errors.some((error) => typeof error !== "string" && error.code === "AUTO_PATH"), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("automation registry reports non-object registry input without throwing", () => {
  const errors = validateAutomationRegistry(null as unknown as Parameters<typeof validateAutomationRegistry>[0]);
  assert.deepEqual(errors, [
    {
      path: "tools/automation-registry.yml",
      code: "AUTO_REGISTRY",
      message: "registry must be an object",
    },
  ]);
});
