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

  addReadmeFrontmatter(generatedDir);
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

function addReadmeFrontmatter(root: string): void {
  for (const filePath of walkMarkdownFiles(root).filter((file) => path.basename(file) === "README.md")) {
    const text = readText(filePath);
    const body = stripFrontmatter(text).trimStart();
    const rel = toPosix(path.relative(root, filePath));
    const folder = path.dirname(path.join("docs/scripts", rel)) === "." ? "." : toPosix(path.dirname(path.join("docs/scripts", rel)));
    const title = titleFromMarkdown(body, path.basename(path.dirname(filePath)) || "Repository Scripts");
    const description = descriptionForGeneratedReadme(folder, title);
    const frontmatter = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `folder: ${JSON.stringify(folder)}`,
      `description: ${JSON.stringify(description)}`,
      "entry_point: true",
      "---",
      "",
    ].join("\n");

    fs.writeFileSync(filePath, `${frontmatter}${body.replace(/\r\n/g, "\n")}`, "utf8");
  }
}

function stripFrontmatter(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return text;
  const end = normalized.indexOf("\n---\n", 4);
  return end === -1 ? text : normalized.slice(end + 5);
}

function titleFromMarkdown(text: string, fallback: string): string {
  const heading = text.split("\n").find((line) => line.startsWith("# "));
  return heading ? heading.replace(/^#\s+/, "").replace(/`/g, "").trim() : fallback;
}

function descriptionForGeneratedReadme(folder: string, title: string): string {
  if (folder === "docs/scripts") return "Entry point for generated TypeDoc reference for repository scripts.";
  if (folder.startsWith("docs/scripts/lib/")) {
    return `Entry point for generated API reference for the ${title} script helper module.`;
  }
  return `Entry point for generated API reference for the ${title} script.`;
}
