import fs from "node:fs";
import path from "node:path";
import { failIfErrors, markdownFiles, readText, relativeToRoot, repoRoot } from "./lib/repo.js";

const errors = [];
const linkPattern = /!?\[[^\]]*?\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g;

for (const filePath of markdownFiles()) {
  const text = readText(filePath);
  const lines = text.split(/\r?\n/);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (const match of line.matchAll(linkPattern)) {
      const rawTarget = match[1].replace(/\s+"[^"]*"$/, "").trim();
      const target = rawTarget.replace(/^<|>$/g, "");
      if (shouldIgnoreTarget(target)) continue;

      const [targetPath, rawAnchor] = target.split("#");
      const resolvedPath = targetPath
        ? path.resolve(path.dirname(filePath), decodeURIComponent(targetPath))
        : filePath;

      if (targetPath && !fs.existsSync(resolvedPath)) {
        errors.push(`${relativeToRoot(filePath)}:${lineIndex + 1} links to missing file ${target}`);
        continue;
      }

      if (rawAnchor && fs.existsSync(resolvedPath)) {
        const anchors = collectAnchors(readText(resolvedPath));
        const anchor = decodeURIComponent(rawAnchor).toLowerCase();
        if (!anchors.has(anchor)) {
          errors.push(`${relativeToRoot(filePath)}:${lineIndex + 1} links to missing anchor ${target}`);
        }
      }
    }
  }
}

failIfErrors(errors, "check:links");

function shouldIgnoreTarget(target) {
  if (!target || target.startsWith("#")) return false;
  if (/^(https?:|mailto:|app:|plugin:)/.test(target)) return true;
  if (target.includes("<") || target.includes(">")) return true;
  if (target.includes("$")) return true;
  if (target.includes("feature-slug") || target.includes("sprint-slug")) return true;
  if (target.includes("slug/") || target.includes("slug.md")) return true;
  return false;
}

function collectAnchors(markdown) {
  const anchors = new Set();
  const used = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    for (const base of slugVariants(match[2])) {
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }
  }
  return anchors;
}

function slugVariants(heading) {
  const cleaned = heading
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .toLowerCase();

  return new Set([
    githubSlug(cleaned),
    githubSlug(cleaned.replace(/[‑‒–—―]/gu, "-")),
    githubSlug(cleaned.replace(/[‑‒–—―]/gu, "")),
  ]);
}

function githubSlug(value) {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s/gu, "-");
}
