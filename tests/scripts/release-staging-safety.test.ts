import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  STAGING_MARKER_FILE,
  assertSafeOutDir,
  hasStagingMarker,
  writeStagingMarker,
} from "../../scripts/lib/release-staging-safety.js";

function mkRepo(): { repoRoot: string; cleanup: () => void } {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "stg-safety-repo-"));
  return {
    repoRoot,
    cleanup: () => fs.rmSync(repoRoot, { recursive: true, force: true }),
  };
}

function mkDir(): { dir: string; cleanup: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stg-safety-dir-"));
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

test("STAGING_MARKER_FILE is the expected stable name", () => {
  assert.equal(STAGING_MARKER_FILE, ".release-staging-marker");
});

test("writeStagingMarker + hasStagingMarker round-trip", () => {
  const { dir, cleanup } = mkDir();
  try {
    assert.equal(hasStagingMarker(dir), false);
    writeStagingMarker(dir);
    assert.equal(hasStagingMarker(dir), true);
    const body = fs.readFileSync(path.join(dir, STAGING_MARKER_FILE), "utf8");
    assert.match(body, /build:release-archive marker/);
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects the repo root itself", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    assert.throws(
      () => assertSafeOutDir(repoRoot, repoRoot),
      /repo root|filesystem root|user home/i,
    );
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects the repo parent", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    const parent = path.dirname(path.resolve(repoRoot));
    assert.throws(
      () => assertSafeOutDir(parent, repoRoot),
      /repo parent|filesystem root|ancestor/i,
    );
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects the filesystem root", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    const fsRoot = path.parse(path.resolve(repoRoot)).root;
    assert.throws(
      () => assertSafeOutDir(fsRoot, repoRoot),
      /filesystem root|ancestor/i,
    );
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects the user home", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    assert.throws(
      () => assertSafeOutDir(os.homedir(), repoRoot),
      /user home|ancestor/i,
    );
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects an ancestor of the repo root", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    // mkdtemp puts repoRoot under os.tmpdir(); tmpdir is an ancestor.
    const ancestor = path.dirname(path.dirname(path.resolve(repoRoot)));
    // Skip the test if ancestor coincides with the filesystem root,
    // which is already covered by another case.
    const fsRoot = path.parse(path.resolve(repoRoot)).root;
    if (ancestor === fsRoot) return;
    assert.throws(
      () => assertSafeOutDir(ancestor, repoRoot),
      /ancestor|filesystem root|user home/i,
    );
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects an existing path that is not a directory", () => {
  const { repoRoot, cleanup } = mkRepo();
  const filePath = path.join(repoRoot, "not-a-dir.txt");
  try {
    fs.writeFileSync(filePath, "x", "utf8");
    assert.throws(
      () => assertSafeOutDir(filePath, repoRoot),
      /not a directory/i,
    );
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: rejects a directory containing `.git`", () => {
  const { repoRoot, cleanup } = mkRepo();
  const sibling = fs.mkdtempSync(path.join(os.tmpdir(), "stg-safety-sib-"));
  try {
    fs.mkdirSync(path.join(sibling, ".git"));
    assert.throws(
      () => assertSafeOutDir(sibling, repoRoot),
      /\.git entry|disposable/i,
    );
  } finally {
    fs.rmSync(sibling, { recursive: true, force: true });
    cleanup();
  }
});

test("assertSafeOutDir: rejects a non-empty dir without the staging marker", () => {
  const { repoRoot, cleanup } = mkRepo();
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "stg-safety-tgt-"));
  try {
    fs.writeFileSync(path.join(target, "user-data.txt"), "important", "utf8");
    assert.throws(
      () => assertSafeOutDir(target, repoRoot),
      /staging marker|missing/i,
    );
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
    cleanup();
  }
});

test("assertSafeOutDir: accepts an empty existing directory", () => {
  const { repoRoot, cleanup } = mkRepo();
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "stg-safety-empty-"));
  try {
    assert.doesNotThrow(() => assertSafeOutDir(target, repoRoot));
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
    cleanup();
  }
});

test("assertSafeOutDir: accepts a non-existent path", () => {
  const { repoRoot, cleanup } = mkRepo();
  const ghostDir = path.join(os.tmpdir(), `stg-safety-ghost-${Date.now()}`);
  try {
    assert.doesNotThrow(() => assertSafeOutDir(ghostDir, repoRoot));
  } finally {
    cleanup();
  }
});

test("assertSafeOutDir: accepts a previously-staged dir (marker present)", () => {
  const { repoRoot, cleanup } = mkRepo();
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "stg-safety-marked-"));
  try {
    fs.writeFileSync(path.join(target, "stale-content.txt"), "x", "utf8");
    writeStagingMarker(target);
    assert.doesNotThrow(() => assertSafeOutDir(target, repoRoot));
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
    cleanup();
  }
});
