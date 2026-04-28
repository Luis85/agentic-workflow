import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const ignoredDirs = new Set([
  ".git",
  ".worktrees",
  "node_modules",
  "dist",
  "build",
  "target",
  "coverage",
]);

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export function relativeToRoot(filePath) {
  return toPosix(path.relative(repoRoot, filePath));
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function writeText(filePath, text) {
  fs.writeFileSync(filePath, text, "utf8");
}

export function walkFiles(startDir, predicate = () => true) {
  const results = [];
  const root = path.join(repoRoot, startDir);
  if (!fs.existsSync(root)) return results;

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) walk(full);
        continue;
      }
      if (entry.isFile() && predicate(full)) results.push(full);
    }
  }

  walk(root);
  return results.sort((a, b) => relativeToRoot(a).localeCompare(relativeToRoot(b)));
}

export function markdownFiles() {
  return walkFiles(".", (file) => file.endsWith(".md"));
}

export function failIfErrors(errors, heading) {
  if (errors.length === 0) {
    console.log(`${heading}: ok`);
    return;
  }

  console.error(`${heading}: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

export function extractFrontmatter(text) {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return null;
  const normalized = text.replace(/\r\n/g, "\n");
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return {
    raw: normalized.slice(4, end),
    body: normalized.slice(end + 5),
  };
}

export function parseSimpleYaml(raw) {
  const data = {};
  const lines = raw.split("\n");
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const nested = line.match(/^  ([^:]+):\s*(.*)$/);
    if (nested && currentKey) {
      if (typeof data[currentKey] !== "object" || Array.isArray(data[currentKey])) {
        data[currentKey] = {};
      }
      data[currentKey][nested[1].trim()] = parseYamlScalar(stripInlineComment(nested[2]).trim());
      continue;
    }

    const match = line.match(/^([^:\s][^:]*):\s*(.*)$/);
    if (!match) continue;

    currentKey = match[1].trim();
    const value = stripInlineComment(match[2]).trim();
    data[currentKey] = value === "" ? {} : parseYamlScalar(value);
  }

  return data;
}

function stripInlineComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const previous = value[index - 1];
    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote || char;
      continue;
    }
    if (char === "#" && !quote && (index === 0 || /\s/.test(previous))) {
      return value.slice(0, index);
    }
  }
  return value;
}

function parseYamlScalar(value) {
  if (value === "~" || value === "null") return null;
  if (value === "[]" || value === "{}") return value === "[]" ? [] : {};
  if (/^\d+$/.test(value)) return Number(value);
  if (/^\[.*\]$/.test(value)) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseYamlScalar(item.trim()));
  }
  return value.replace(/^["']|["']$/g, "");
}

export function replaceGeneratedBlock(text, name, content) {
  const begin = `<!-- BEGIN GENERATED: ${name} -->`;
  const end = `<!-- END GENERATED: ${name} -->`;
  const pattern = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`);
  if (!pattern.test(text)) {
    throw new Error(`Missing generated block markers for ${name}`);
  }
  return text.replace(pattern, `${begin}\n${content.trimEnd()}\n${end}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
