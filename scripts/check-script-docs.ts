import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SpawnSyncOptions, spawnSync } from "node:child_process";
import { failIfErrors, readText, repoRoot, toPosix } from "./lib/repo.js";

type MarkdownRecord = {
  filePath: string;
  rel: string;
};

const outputDir = path.join(repoRoot, "docs/scripts");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-script-docs-"));
const generatedDir = path.join(tempDir, "scripts");
const errors: string[] = [];

try {
  requireLocalDependency("typedoc");
  requireLocalDependency("typedoc-plugin-markdown");

  const result = spawnNpm(["run", "docs:scripts", "--", "--out", generatedDir], {
    cwd: repoRoot,
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  compareGeneratedDocs();
  failIfErrors(errors, "check:script-docs");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function requireLocalDependency(packageName: string): void {
  const packagePath = path.join(repoRoot, "node_modules", packageName, "package.json");
  if (fs.existsSync(packagePath)) return;

  console.error(`check:script-docs: missing ${packageName}; run npm ci before verifying generated script docs`);
  process.exit(1);
}

function compareGeneratedDocs() {
  const expected = new Map(markdownRecords(outputDir).map((record) => [record.rel, record]));
  const actual = new Map(markdownRecords(generatedDir).map((record) => [record.rel, record]));
  const paths = [...new Set([...expected.keys(), ...actual.keys()])].sort();

  for (const rel of paths) {
    const expectedRecord = expected.get(rel);
    const actualRecord = actual.get(rel);
    if (!expectedRecord) {
      errors.push(`docs/scripts missing generated file: ${rel}`);
      continue;
    }
    if (!actualRecord) {
      errors.push(`docs/scripts contains stale file: ${rel}`);
      continue;
    }
    if (readText(expectedRecord.filePath) !== readText(actualRecord.filePath)) {
      errors.push(`docs/scripts/${rel} is out of date; run npm run fix:script-docs`);
    }
  }
}

function markdownRecords(root: string): MarkdownRecord[] {
  if (!fs.existsSync(root)) return [];
  return walkMarkdownFiles(root).map((filePath) => ({
    filePath,
    rel: toPosix(path.relative(root, filePath)),
  }));
}

function walkMarkdownFiles(root: string): string[] {
  const results: string[] = [];

  function walk(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const filePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".md")) results.push(filePath);
    }
  }

  walk(root);
  return results.sort((a, b) => toPosix(path.relative(root, a)).localeCompare(toPosix(path.relative(root, b))));
}

function spawnNpm(args: string[], options: SpawnSyncOptions) {
  if (process.env.npm_execpath) {
    return spawnSync(process.execPath, [process.env.npm_execpath, ...args], options);
  }
  return spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}
