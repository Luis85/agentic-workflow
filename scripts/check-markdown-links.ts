import fs from "node:fs";
import path from "node:path";
import { failIfErrors, markdownFiles, readText, relativeToRoot, repoRoot } from "./lib/repo.js";
import { collectAnchors, isCodeFenceDelimiter, linkDiagnostic, safeDecode, shouldIgnoreTarget, stripInlineCode } from "./lib/markdown-links.js";

const errors = [];
const linkPattern = /!?\[[^\]]*?\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g;

for (const filePath of markdownFiles()) {
  const text = readText(filePath);
  const lines = text.split(/\r?\n/);
  let inFence = false;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (isCodeFenceDelimiter(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const scanLine = stripInlineCode(line);
    for (const match of scanLine.matchAll(linkPattern)) {
      const rawTarget = match[1].replace(/\s+"[^"]*"$/, "").trim();
      const target = rawTarget.replace(/^<|>$/g, "");
      if (shouldIgnoreTarget(target)) continue;

      const [targetPath, rawAnchor] = target.split("#");
      const decodedPath = safeDecode(targetPath);
      const decodedAnchor = safeDecode(rawAnchor);

      if (!decodedPath.ok || !decodedAnchor.ok) {
        errors.push(linkDiagnostic("LINK_URI", relativeToRoot(filePath), lineIndex + 1, target));
        continue;
      }

      const resolvedPath = targetPath
        ? path.resolve(path.dirname(filePath), decodedPath.value)
        : filePath;

      if (targetPath && !fs.existsSync(resolvedPath)) {
        errors.push(linkDiagnostic("LINK_FILE", relativeToRoot(filePath), lineIndex + 1, target));
        continue;
      }

      if (rawAnchor && fs.existsSync(resolvedPath)) {
        const anchors = collectAnchors(readText(resolvedPath));
        const anchor = decodedAnchor.value.toLowerCase();
        if (!anchors.has(anchor)) {
          errors.push(linkDiagnostic("LINK_ANCHOR", relativeToRoot(filePath), lineIndex + 1, target));
        }
      }
    }
  }
}

failIfErrors(errors, "check:links");
