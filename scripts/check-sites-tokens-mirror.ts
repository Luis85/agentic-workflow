import fs from "node:fs";
import path from "node:path";
import { failIfErrors, readText, repoRoot } from "./lib/repo.js";

const canonicalPath = path.join(repoRoot, ".claude/skills/specorator-design/colors_and_type.css");
const mirrorPath = path.join(repoRoot, "sites/colors_and_type.css");

const errors: string[] = [];

if (!fs.existsSync(mirrorPath)) {
  errors.push(
    "sites/colors_and_type.css missing; run `npm run fix:sites-tokens` to recreate from .claude/skills/specorator-design/colors_and_type.css",
  );
} else {
  const canonical = readText(canonicalPath);
  const mirror = readText(mirrorPath);
  if (canonical !== mirror) {
    errors.push(
      "sites/colors_and_type.css drifted from .claude/skills/specorator-design/colors_and_type.css; run `npm run fix:sites-tokens`",
    );
  }
}

failIfErrors(errors, "check:sites-tokens-mirror");
