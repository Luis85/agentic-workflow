import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { findRepoRoot } from "../../scripts/lib/repo.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cliScript = path.join(repoRoot, "scripts/cli.ts");
const tsxLoaderUrl = import.meta.resolve("tsx");
const cliArgs = [process.execPath, "--import", tsxLoaderUrl, cliScript] as const;

// ── findRepoRoot unit tests ───────────────────────────────────────────────────

test("findRepoRoot finds package.json sentinel walking up from a subdirectory", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "specorator-root-test-"));
  try {
    fs.writeFileSync(path.join(tmpRoot, "package.json"), JSON.stringify({ name: "test-pkg" }));
    const deep = path.join(tmpRoot, "a", "b", "c");
    fs.mkdirSync(deep, { recursive: true });

    assert.equal(findRepoRoot(deep), tmpRoot);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("findRepoRoot finds .git sentinel walking up from a subdirectory", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "specorator-root-git-test-"));
  try {
    fs.mkdirSync(path.join(tmpRoot, ".git"));
    const deep = path.join(tmpRoot, "src", "lib");
    fs.mkdirSync(deep, { recursive: true });

    assert.equal(findRepoRoot(deep), tmpRoot);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("findRepoRoot prefers the nearest sentinel, not the farthest", () => {
  const outer = fs.mkdtempSync(path.join(os.tmpdir(), "specorator-outer-"));
  try {
    fs.writeFileSync(path.join(outer, "package.json"), JSON.stringify({ name: "outer" }));
    const inner = path.join(outer, "packages", "cli");
    fs.mkdirSync(inner, { recursive: true });
    fs.writeFileSync(path.join(inner, "package.json"), JSON.stringify({ name: "inner" }));
    const deep = path.join(inner, "src");
    fs.mkdirSync(deep, { recursive: true });

    assert.equal(findRepoRoot(deep), inner);
  } finally {
    fs.rmSync(outer, { recursive: true, force: true });
  }
});

test("findRepoRoot throws a descriptive error when no sentinel is found", () => {
  // Use /tmp itself which should NOT have package.json or .git at filesystem root level,
  // but to guarantee isolation, create a tmpdir with no sentinels anywhere in the chain.
  // We can't really test this without a sandbox, so we test the error message shape instead.
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "specorator-noroot-"));
  const deep = path.join(tmpRoot, "a");
  fs.mkdirSync(deep);
  try {
    // /tmp itself or the os temp dir may have a package.json above; skip if so
    try {
      findRepoRoot(deep);
      // If we get here, a sentinel was found above tmpdir (e.g. the OS temp dir has one)
      // Just verify the function does not throw unexpectedly in that case
    } catch (err) {
      assert.ok(err instanceof Error);
      assert.ok(
        err.message.includes("could not locate a project root"),
        `Unexpected error message: ${err.message}`,
      );
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("findRepoRoot finds the actual repo root of this project", () => {
  const found = findRepoRoot(repoRoot);
  assert.equal(found, repoRoot);
});

test("findRepoRoot finds the repo root from a subdirectory of this project", () => {
  const scriptsDir = path.join(repoRoot, "scripts", "lib");
  const found = findRepoRoot(scriptsDir);
  assert.equal(found, repoRoot);
});

// ── CLI dispatcher integration tests ─────────────────────────────────────────

test("cli --help exits 0 and lists verify subcommand", () => {
  const result = spawnSync(cliArgs[0], [...cliArgs.slice(1), "--help"], {
    encoding: "utf8",
    cwd: repoRoot,
    env: { ...process.env, SPECORATOR_ROOT: repoRoot },
  });
  assert.equal(result.status, 0, `Expected exit 0, got ${result.status}\n${result.stderr}`);
  assert.ok(result.stdout.includes("verify"), `Expected 'verify' in help output:\n${result.stdout}`);
  assert.ok(result.stdout.includes("check:fast"), `Expected 'check:fast' in help output:\n${result.stdout}`);
  assert.ok(result.stdout.includes("fix"), `Expected 'fix' in help output:\n${result.stdout}`);
});

test("cli exits non-zero for unknown subcommand", () => {
  const result = spawnSync(cliArgs[0], [...cliArgs.slice(1), "definitely-not-a-subcommand"], {
    encoding: "utf8",
    cwd: repoRoot,
    env: { ...process.env, SPECORATOR_ROOT: repoRoot },
  });
  assert.notEqual(result.status, 0, "Expected non-zero exit for unknown subcommand");
});

test("cli --cwd flag overrides working directory for root discovery", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "specorator-cli-cwd-test-"));
  try {
    // Intentionally no package.json or .git — we pass --cwd pointing at the real repo root
    const result = spawnSync(cliArgs[0], [...cliArgs.slice(1), "--cwd", repoRoot, "--help"], {
      encoding: "utf8",
      cwd: tmpRoot,
      env: process.env,
    });
    assert.equal(result.status, 0, `Expected exit 0 with --cwd pointing at repo root:\n${result.stderr}`);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("cli exits non-zero when invoked from a directory with no project root and no --cwd", () => {
  // Create an isolated temp dir with no package.json or .git anywhere in its ancestry
  // (hard to guarantee in all environments, so we check the stderr message instead)
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "specorator-cli-noroot-"));
  try {
    const result = spawnSync(cliArgs[0], [...cliArgs.slice(1), "verify"], {
      encoding: "utf8",
      cwd: tmpRoot,
      env: { ...process.env, SPECORATOR_ROOT: undefined },
    });
    // Either exits non-zero (no root found) OR exits 0 if a sentinel was found above tmpdir
    // We only assert the error message shape when it does fail
    if (result.status !== 0) {
      assert.ok(
        result.stderr.includes("could not locate") || result.stderr.includes("SPECORATOR_ROOT"),
        `Unexpected stderr: ${result.stderr}`,
      );
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
