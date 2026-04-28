import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  obsidianAssetDiagnostics,
  obsidianBaseDiagnosticsForFile,
  obsidianCanvasDiagnosticsForFile,
  obsidianTrackedStateDiagnostics,
} from "../../scripts/lib/obsidian-assets.js";

test("obsidian asset diagnostics accept clean tracked paths and valid assets", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "obsidian-assets-"));
  try {
    const basePath = path.join(tempDir, "valid.base");
    const canvasPath = path.join(tempDir, "valid.canvas");
    fs.writeFileSync(
      basePath,
      [
        "filters:",
        "  and:",
        "    - 'file.path.startsWith(\"specs/\")'",
        "views:",
        "  - type: table",
        "    name: Specs",
        "    order:",
        "      - file.name",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(canvasPath, JSON.stringify({ nodes: [], edges: [] }), "utf8");

    assert.deepEqual(
      obsidianAssetDiagnostics({
        trackedPaths: ["docs/obsidian/bases/specs.base"],
        baseFiles: [basePath],
        canvasFiles: [canvasPath],
      }),
      [],
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("obsidian asset diagnostics reject tracked vault state", () => {
  const diagnostics = obsidianTrackedStateDiagnostics([
    ".obsidian/workspace.json",
    ".trash/deleted.md",
    "docs/obsidian/bases/specs.base",
  ]);

  assert.equal(diagnostics.length, 2);
  assert.equal(diagnostics.every((diagnostic) => diagnostic.code === "OBS_ASSET_TRACKED_STATE"), true);
});

test("obsidian base diagnostics reject malformed YAML", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "obsidian-base-"));
  try {
    const basePath = path.join(tempDir, "broken.base");
    fs.writeFileSync(basePath, "filters:\n  - [unterminated\n", "utf8");

    const diagnostics = obsidianBaseDiagnosticsForFile(basePath);

    assert.equal(diagnostics.length > 0, true);
    assert.equal(diagnostics[0].code, "OBS_ASSET_BASE_YAML");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("obsidian canvas diagnostics reject malformed JSON and missing shape", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "obsidian-canvas-"));
  try {
    const malformedPath = path.join(tempDir, "malformed.canvas");
    const shapePath = path.join(tempDir, "shape.canvas");
    fs.writeFileSync(malformedPath, "{", "utf8");
    fs.writeFileSync(shapePath, JSON.stringify({ nodes: [] }), "utf8");

    assert.equal(obsidianCanvasDiagnosticsForFile(malformedPath)[0].code, "OBS_ASSET_CANVAS_JSON");
    assert.equal(obsidianCanvasDiagnosticsForFile(shapePath)[0].code, "OBS_ASSET_CANVAS_SHAPE");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
