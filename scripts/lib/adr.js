import fs from "node:fs";
import path from "node:path";
import { extractFrontmatter, parseSimpleYaml, readText, repoRoot } from "./repo.js";

export function getAdrs() {
  const dir = path.join(repoRoot, "docs/adr");
  return fs
    .readdirSync(dir)
    .filter((name) => /^0\d{3}-.+\.md$/.test(name))
    .sort()
    .map((fileName) => {
      const filePath = path.join(dir, fileName);
      const text = readText(filePath);
      const frontmatter = extractFrontmatter(text);
      const yaml = frontmatter ? parseSimpleYaml(frontmatter.raw) : {};
      const number = fileName.slice(0, 4);
      const title = yaml.title || titleFromHeading(text) || fileName;
      const status = normalizeStatus(yaml.status || statusFromBody(text) || "unknown");
      return { number, fileName, title, status };
    });
}

export function renderAdrIndex() {
  const rows = [
    "| # | Title | Status |",
    "|---|---|---|",
    ...getAdrs().map(
      (adr) => `| [${adr.number}](${adr.fileName}) | ${adr.title} | ${adr.status} |`,
    ),
  ];
  return rows.join("\n");
}

function titleFromHeading(text) {
  const match = text.match(/^#\s+ADR-\d{4}\s+—\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function statusFromBody(text) {
  const match = text.match(/^## Status\s+([\s\S]*?)(?:\n## |\n---|$)/m);
  if (!match) return null;
  const firstLine = match[1].trim().split(/\r?\n/)[0];
  return firstLine || null;
}

export function normalizeStatus(value) {
  if (!value) return value;
  return String(value)
    .split(/\s+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(" ");
}
