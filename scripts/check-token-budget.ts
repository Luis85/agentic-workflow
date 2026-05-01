import fs from "node:fs";
import path from "node:path";
import { extractFrontmatter, failIfErrors, parseSimpleYaml, repoRoot, walkFiles } from "./lib/repo.js";

const ALWAYS_LOADED_FILES = [
  "CLAUDE.md",
  "AGENTS.md",
  "memory/constitution.md",
  ".claude/memory/MEMORY.md",
];

const ALWAYS_LOADED_CAP = 20480;
const SKILL_BODY_CAP = 14336;
const SKILL_DESCRIPTION_CAP = 700;

const errors: string[] = [];

let combined = 0;
for (const rel of ALWAYS_LOADED_FILES) {
  const absolute = path.join(repoRoot, rel);
  if (!fs.existsSync(absolute)) {
    errors.push(`${rel} missing — required by always-loaded chain`);
    continue;
  }
  combined += fs.statSync(absolute).size;
}
if (combined > ALWAYS_LOADED_CAP) {
  errors.push(
    `always-loaded chain (${ALWAYS_LOADED_FILES.join(" + ")}) = ${combined} bytes; cap ${ALWAYS_LOADED_CAP}`,
  );
}

for (const skillFile of walkFiles(".claude/skills", (file) => path.basename(file) === "SKILL.md")) {
  const rel = path.relative(repoRoot, skillFile).split(path.sep).join("/");
  const size = fs.statSync(skillFile).size;
  if (size > SKILL_BODY_CAP) {
    errors.push(`${rel} = ${size} bytes; per-skill cap ${SKILL_BODY_CAP}`);
  }

  const text = fs.readFileSync(skillFile, "utf8");
  const frontmatter = extractFrontmatter(text);
  if (!frontmatter) continue;
  const data = parseSimpleYaml(frontmatter.raw);
  const description = typeof data.description === "string" ? data.description.trim() : "";
  if (description.length === 0) continue;
  if (description.length > SKILL_DESCRIPTION_CAP) {
    errors.push(`${rel} description = ${description.length} chars; cap ${SKILL_DESCRIPTION_CAP}`);
  }
}

failIfErrors(errors, "check:token-budget");
