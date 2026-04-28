import { fixObsidianFrontmatter } from "./lib/obsidian.js";
import { markdownFiles, readText, relativeToRoot, writeText } from "./lib/repo.js";

let changedCount = 0;

for (const filePath of markdownFiles()) {
  const text = readText(filePath);
  const fixed = fixObsidianFrontmatter(text);
  if (!fixed.changed) continue;

  writeText(filePath, fixed.text);
  changedCount += 1;
  console.log(`fix:obsidian updated ${relativeToRoot(filePath)}`);
}

console.log(`fix:obsidian: ${changedCount} file(s) updated`);
