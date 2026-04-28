import fs from "node:fs";
import path from "node:path";
import { failIfErrors, markdownFiles, readText, relativeToRoot, repoRoot } from "./lib/repo.js";
import { collectAnchors, safeDecode, shouldIgnoreTarget } from "./lib/markdown-links.js";

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
      const decodedPath = safeDecode(targetPath);
      const decodedAnchor = safeDecode(rawAnchor);

      if (!decodedPath.ok || !decodedAnchor.ok) {
        errors.push(`${relativeToRoot(filePath)}:${lineIndex + 1} has invalid URI escape in link ${target}`);
        continue;
      }

      const resolvedPath = targetPath
        ? path.resolve(path.dirname(filePath), decodedPath.value)
        : filePath;

      if (targetPath && !fs.existsSync(resolvedPath)) {
        errors.push(`${relativeToRoot(filePath)}:${lineIndex + 1} links to missing file ${target}`);
        continue;
      }

      if (rawAnchor && fs.existsSync(resolvedPath)) {
        const anchors = collectAnchors(readText(resolvedPath));
        const anchor = decodedAnchor.value.toLowerCase();
        if (!anchors.has(anchor)) {
          errors.push(`${relativeToRoot(filePath)}:${lineIndex + 1} links to missing anchor ${target}`);
        }
      }
    }
  }
}

failIfErrors(errors, "check:links");
