/**
 * Drift check for the issues/ folder.
 *
 * Warns when a specs/<slug>/ directory has no linked issues/<n>-<slug>.md file.
 * Hard-fails (exit 1) on issue files with malformed or missing required frontmatter.
 *
 * This check is intentionally NOT included in `npm run verify` (see ADR-0030 §6).
 * Run it explicitly: `npm run check:issues`
 *
 * Flags:
 *   --json   Emit structured JSON instead of console output.
 */

import fs from "node:fs";
import path from "node:path";
import {
  extractFrontmatter,
  parseSimpleYaml,
  readText,
  relativeToRoot,
  repoRoot,
  walkFiles,
} from "./lib/repo.js";

const VALID_ROADMAP_STATUSES = new Set([
  "planned",
  "in-progress",
  "in-review",
  "shipped",
  "cancelled",
]);
const VALID_TYPES = new Set(["feature", "bug", "chore", "docs"]);
const VALID_STAGES = new Set([
  "idea",
  "research",
  "requirements",
  "design",
  "specification",
  "tasks",
  "implementation",
  "testing",
  "review",
  "release",
  "learning",
  "done",
]);

const REQUIRED_FRONTMATTER_KEYS = [
  "title",
  "feature_slug",
  "type",
  "roadmap_status",
  "stage",
  "created_at",
  "updated_at",
];

// Keys that must be present in the file but are allowed to be null (e.g. before GitHub push).
const NULLABLE_FRONTMATTER_KEYS = [
  "issue_number",
  "github_url",
  "labels",
  "milestone",
  "assignees",
];

const wantsJson = process.argv.includes("--json");

const warnings: string[] = [];
const errors: string[] = [];

// 1. Collect spec slugs (exclude examples/)
const specsRoot = path.join(repoRoot, "specs");
const specSlugs: string[] = [];
if (fs.existsSync(specsRoot)) {
  for (const entry of fs.readdirSync(specsRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) specSlugs.push(entry.name);
  }
}

// 2. Collect issue files and validate frontmatter
const issuesBySrcSlug = new Map<string, string>(); // featureSlug → relPath
const issuesRoot = path.join(repoRoot, "issues");

if (fs.existsSync(issuesRoot)) {
  const issueFiles = walkFiles("issues", (f) => {
    const base = path.basename(f);
    return base.endsWith(".md") && base !== "README.md";
  });

  for (const filePath of issueFiles) {
    const rel = relativeToRoot(filePath);
    const text = readText(filePath);
    const fm = extractFrontmatter(text);

    if (!fm) {
      errors.push(`${rel}: missing YAML frontmatter`);
      continue;
    }

    const data = parseSimpleYaml(fm.raw);

    // Required key checks (must exist and have a non-null, non-empty value)
    for (const key of REQUIRED_FRONTMATTER_KEYS) {
      if (isMissingRequiredValue(data[key])) {
        errors.push(`${rel}: missing required frontmatter key "${key}"`);
      }
    }

    // Nullable key checks (must be present in the file, but null is allowed)
    for (const key of NULLABLE_FRONTMATTER_KEYS) {
      if (!(key in data)) {
        errors.push(`${rel}: missing frontmatter key "${key}" (may be null)`);
      }
    }

    // Type validation for nullable keys
    const issueNum = data["issue_number"];
    if (issueNum !== null && issueNum !== undefined && typeof issueNum !== "number") {
      errors.push(`${rel}: issue_number must be an integer or null, got ${JSON.stringify(issueNum)}`);
    }
    const labels = data["labels"];
    if (labels !== null && labels !== undefined && !Array.isArray(labels)) {
      errors.push(`${rel}: labels must be an array or null, got ${JSON.stringify(labels)}`);
    }
    const assignees = data["assignees"];
    if (assignees !== null && assignees !== undefined && !Array.isArray(assignees)) {
      errors.push(`${rel}: assignees must be an array or null, got ${JSON.stringify(assignees)}`);
    }
    const milestone = data["milestone"];
    if (milestone !== null && milestone !== undefined && typeof milestone !== "string") {
      errors.push(`${rel}: milestone must be a string or null, got ${JSON.stringify(milestone)}`);
    }
    const githubUrl = data["github_url"];
    if (githubUrl !== null && githubUrl !== undefined && typeof githubUrl !== "string") {
      errors.push(`${rel}: github_url must be a string or null, got ${JSON.stringify(githubUrl)}`);
    }

    // Enum validation
    const rs = data["roadmap_status"];
    if (rs !== undefined && rs !== null && !VALID_ROADMAP_STATUSES.has(rs as string)) {
      errors.push(
        `${rel}: invalid roadmap_status "${rs}" — must be one of: ${[...VALID_ROADMAP_STATUSES].join(", ")}`,
      );
    }

    const t = data["type"];
    if (t !== undefined && t !== null && !VALID_TYPES.has(t as string)) {
      errors.push(
        `${rel}: invalid type "${t}" — must be one of: ${[...VALID_TYPES].join(", ")}`,
      );
    }

    const st = data["stage"];
    if (st !== undefined && st !== null && !VALID_STAGES.has(st as string)) {
      errors.push(
        `${rel}: invalid stage "${st}" — must be one of: ${[...VALID_STAGES].join(", ")}`,
      );
    }

    const slug = data["feature_slug"];
    if (slug && typeof slug === "string") {
      issuesBySrcSlug.set(slug, rel);
    }
  }
}

// 3. Warn for specs without a linked issue
for (const slug of specSlugs) {
  if (!issuesBySrcSlug.has(slug)) {
    warnings.push(
      `specs/${slug}/ has no linked issue — create issues/0-${slug}.md from templates/issue-template.md`,
    );
  }
}

// Output
if (wantsJson) {
  console.log(JSON.stringify({ errors, warnings }, null, 2));
} else {
  for (const w of warnings) console.warn(`[warn] check:issues: ${w}`);
  for (const e of errors) console.error(`[error] check:issues: ${e}`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log("check:issues: ok");
  } else if (errors.length === 0) {
    console.log(`check:issues: ${warnings.length} warning(s) — no hard errors`);
  }
}

// Malformed frontmatter = hard fail; missing issues = warn only (exit 0)
if (errors.length > 0) {
  process.exit(1);
}

function isMissingRequiredValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (isPlainObject(value) && Object.keys(value).length === 0)
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
