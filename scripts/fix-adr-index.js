import path from "node:path";
import { renderAdrIndex } from "./lib/adr.js";
import { readText, replaceGeneratedBlock, repoRoot, writeText } from "./lib/repo.js";

const readmePath = path.join(repoRoot, "docs/adr/README.md");
const current = readText(readmePath);
const next = replaceGeneratedBlock(current, "adr-index", renderAdrIndex());

if (next === current) {
  console.log("fix:adr-index: no changes");
} else {
  writeText(readmePath, next);
  console.log("fix:adr-index: updated docs/adr/README.md");
}
