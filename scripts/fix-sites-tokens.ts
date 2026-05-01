import fs from "node:fs";
import path from "node:path";
import { readText, repoRoot, writeText } from "./lib/repo.js";

const canonicalPath = path.join(repoRoot, ".claude/skills/specorator-design/colors_and_type.css");
const mirrorPath = path.join(repoRoot, "sites/colors_and_type.css");

const canonical = readText(canonicalPath);
const current = fs.existsSync(mirrorPath) ? readText(mirrorPath) : null;

if (current === canonical) {
  console.log("fix:sites-tokens: no changes");
} else {
  writeText(mirrorPath, canonical);
  console.log(
    current === null
      ? "fix:sites-tokens: created sites/colors_and_type.css"
      : "fix:sites-tokens: updated sites/colors_and_type.css",
  );
}
