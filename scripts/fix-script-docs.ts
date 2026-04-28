import { spawnSync } from "node:child_process";
import type { SpawnSyncOptions } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const result = spawnNpm(["run", "docs:scripts"], {
  stdio: "inherit",
  windowsHide: true,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.signal) {
  console.error(`docs:scripts terminated by signal ${result.signal}`);
  process.exit(1);
}

if (result.status === 0) {
  addReadmeFrontmatter(path.resolve("docs/scripts"));
}

process.exit(result.status ?? 1);

function spawnNpm(args: string[], options: SpawnSyncOptions) {
  if (process.env.npm_execpath) {
    return spawnSync(process.execPath, [process.env.npm_execpath, ...args], options);
  }
  return spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

function addReadmeFrontmatter(root: string): void {
  for (const filePath of walkMarkdownFiles(root).filter((file) => path.basename(file) === "README.md")) {
    const text = fs.readFileSync(filePath, "utf8");
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

function walkMarkdownFiles(root: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(root)) return results;

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

function toPosix(filePath: string): string {
  return filePath.replace(/[\\/]+/g, "/");
}
