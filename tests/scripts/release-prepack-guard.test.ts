import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GUARD_SCRIPT = path.resolve(__dirname, "../../scripts/release-prepack-guard.mjs");
const STAGING_MARKER_FILE = ".release-staging-marker";
const PACKAGE_NAME = "@luis85/agentic-workflow";

function mkCwd(pkg: Record<string, unknown> | null): { cwd: string; cleanup: () => void } {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "prepack-guard-"));
  if (pkg !== null) {
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(pkg, null, 2), "utf8");
  }
  return { cwd, cleanup: () => fs.rmSync(cwd, { recursive: true, force: true }) };
}

function runGuard(cwd: string): { status: number | null; stderr: string } {
  const result = spawnSync(process.execPath, [GUARD_SCRIPT], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  return { status: result.status, stderr: result.stderr };
}

test("guard: passes when cwd has no package.json", () => {
  const { cwd, cleanup } = mkCwd(null);
  try {
    const { status, stderr } = runGuard(cwd);
    assert.equal(status, 0, `expected exit 0; stderr=${stderr}`);
  } finally {
    cleanup();
  }
});

test("guard: passes when package.json#name is not the upstream package", () => {
  const { cwd, cleanup } = mkCwd({ name: "downstream-fork", version: "1.0.0" });
  try {
    const { status, stderr } = runGuard(cwd);
    assert.equal(status, 0, `expected exit 0; stderr=${stderr}`);
  } finally {
    cleanup();
  }
});

test("guard: fails when upstream package and no staging marker", () => {
  const { cwd, cleanup } = mkCwd({ name: PACKAGE_NAME, version: "0.5.0" });
  try {
    const { status, stderr } = runGuard(cwd);
    assert.equal(status, 1, `expected exit 1; stderr=${stderr}`);
    assert.match(stderr, /refusing to pack/i);
    assert.match(stderr, /build:release-archive/);
    assert.match(stderr, /\.release-staging/);
  } finally {
    cleanup();
  }
});

test("guard: passes when upstream package and marker present", () => {
  const { cwd, cleanup } = mkCwd({ name: PACKAGE_NAME, version: "0.5.0" });
  try {
    fs.writeFileSync(path.join(cwd, STAGING_MARKER_FILE), "marker", "utf8");
    const { status, stderr } = runGuard(cwd);
    assert.equal(status, 0, `expected exit 0; stderr=${stderr}`);
  } finally {
    cleanup();
  }
});

test("guard: passes when upstream package but malformed package.json", () => {
  const { cwd, cleanup } = mkCwd(null);
  try {
    fs.writeFileSync(path.join(cwd, "package.json"), "{not valid json", "utf8");
    const { status } = runGuard(cwd);
    assert.equal(status, 0);
  } finally {
    cleanup();
  }
});
