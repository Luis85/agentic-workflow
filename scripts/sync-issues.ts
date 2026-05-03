/**
 * Pull-only GitHub Issues sync.
 *
 * Reads all issues/<n>-<slug>.md files, fetches their current state from the
 * GitHub API via `gh issue list`, and updates the local frontmatter with:
 *   - roadmap_status (derived from GitHub state + labels)
 *   - labels, milestone, assignees
 *   - github_url
 *   - updated_at
 *
 * Does NOT create new local files for GitHub issues that have no local mirror.
 * Does NOT push changes to GitHub (pull-only per ADR-0030 §4).
 *
 * Requirements:
 *   - `gh` CLI installed and authenticated with read access to the repository.
 *   - Repository must be a GitHub-hosted remote.
 *
 * Usage:
 *   npm run sync:issues
 *   npm run sync:issues -- --dry-run   # print what would change, write nothing
 *   npm run sync:issues -- --json      # emit JSON summary
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  extractFrontmatter,
  parseSimpleYaml,
  readText,
  relativeToRoot,
  repoRoot,
  walkFiles,
  writeText,
} from "./lib/repo.js";

const isDryRun = process.argv.includes("--dry-run");
const wantsJson = process.argv.includes("--json");

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: { name: string }[];
  milestone: { title: string } | null;
  assignees: { login: string }[];
  url: string;
}

function ghAvailable(): { ok: true } | { ok: false; reason: string } {
  try {
    execSync("gh --version", { stdio: "ignore" });
  } catch {
    return { ok: false, reason: "`gh` CLI not found" };
  }
  try {
    execSync("gh auth status", { stdio: "ignore" });
  } catch {
    return { ok: false, reason: "`gh` is not authenticated — run `gh auth login`" };
  }
  return { ok: true };
}

function fetchGitHubIssue(number: number): GitHubIssue | null {
  let stderr = "";
  try {
    const raw = execSync(
      `gh issue view ${number} --json number,title,state,labels,milestone,assignees,url`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
    return JSON.parse(raw) as GitHubIssue;
  } catch (err) {
    const buf = (err as { stderr?: Buffer | string }).stderr;
    stderr = typeof buf === "string" ? buf : (buf?.toString() ?? "");
  }
  // gh exits non-zero for both "issue not found" and API/network failures.
  // Only treat genuine 404s as null; re-throw everything else so the caller
  // can abort rather than silently leaving metadata stale.
  if (/could not resolve|no issues match|not found/i.test(stderr)) {
    return null;
  }
  throw new Error(`gh issue view ${number} failed: ${stderr.trim() || "unknown error"}`);
}

function fetchGitHubIssues(numbers: number[]): Map<number, GitHubIssue> {
  const map = new Map<number, GitHubIssue>();
  for (const n of numbers) {
    const issue = fetchGitHubIssue(n);
    if (issue) map.set(n, issue);
  }
  return map;
}

function deriveRoadmapStatus(ghState: string, labels: string[]): string {
  if (labels.includes("shipped") || labels.includes("released")) return "shipped";
  if (labels.includes("in-review") || labels.includes("review")) return "in-review";
  if (labels.includes("in-progress") || labels.includes("wip")) return "in-progress";
  if (ghState === "CLOSED") return "shipped";
  return "planned";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function patchFrontmatter(raw: string, patches: Record<string, unknown>): string {
  let result = raw;
  for (const [key, value] of Object.entries(patches)) {
    const serialized =
      value === null
        ? "null"
        : Array.isArray(value)
          ? value.length === 0
            ? "[]"
            : `[${(value as string[]).map((v) => `"${v}"`).join(", ")}]`
          : typeof value === "string"
            ? needsYamlQuoting(value)
              ? `"${value.replace(/"/g, '\\"')}"`
              : value
            : String(value);

    const linePattern = new RegExp(`^(${escapeRe(key)}:\\s*).*$`, "m");
    if (linePattern.test(result)) {
      result = result.replace(linePattern, `$1${serialized}`);
    }
  }
  return result;
}

function needsYamlQuoting(s: string): boolean {
  return /[\s:#[\]{}"]/.test(s);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rebuildDocument(fm: string, body: string): string {
  return `---\n${fm}\n---\n${body}`;
}

const results: { file: string; changes: string[]; skipped?: string }[] = [];

const ghCheck = ghAvailable();
if (!ghCheck.ok) {
  console.error(`sync:issues: ${ghCheck.reason}. Aborting.`);
  process.exit(1);
}

const issueFiles = walkFiles("issues", (f) => {
  const base = path.basename(f);
  return base.endsWith(".md") && base !== "README.md";
});

// First pass: collect issue numbers referenced by local files.
type FileMeta = { filePath: string; rel: string; parsed: NonNullable<ReturnType<typeof extractFrontmatter>>; data: ReturnType<typeof parseSimpleYaml>; issueNumber: number | null };
const fileMetas: FileMeta[] = [];
const issueNumbers: number[] = [];

for (const filePath of issueFiles) {
  const rel = relativeToRoot(filePath);
  const text = readText(filePath);
  const parsed = extractFrontmatter(text);
  if (!parsed) {
    results.push({ file: rel, changes: [], skipped: "no frontmatter" });
    continue;
  }
  const data = parseSimpleYaml(parsed.raw);
  const issueNumber = typeof data["issue_number"] === "number" ? data["issue_number"] : null;
  fileMetas.push({ filePath, rel, parsed, data, issueNumber });
  if (issueNumber) issueNumbers.push(issueNumber);
}

// Second pass: fetch exactly the issues referenced locally (no pagination limit).
let ghIssues: Map<number, GitHubIssue>;
try {
  ghIssues = fetchGitHubIssues(issueNumbers);
} catch (err) {
  console.error(`sync:issues: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

for (const { filePath, rel, parsed, data, issueNumber } of fileMetas) {
  if (!issueNumber) {
    results.push({ file: rel, changes: [], skipped: "issue_number is null (not yet pushed to GitHub)" });
    continue;
  }

  const gh = ghIssues.get(issueNumber);
  if (!gh) {
    results.push({ file: rel, changes: [], skipped: `GitHub issue #${issueNumber} not found in repository` });
    continue;
  }

  const labelNames = gh.labels.map((l) => l.name);
  const newRoadmapStatus = deriveRoadmapStatus(gh.state, labelNames);
  const newMilestone = gh.milestone?.title ?? null;
  const newAssignees = gh.assignees.map((a) => a.login);

  const patches: Record<string, unknown> = {};
  const changes: string[] = [];

  const currentStatus = data["roadmap_status"] as string | undefined;
  if (currentStatus === "cancelled") {
    // preserve manual cancellation; sync cannot un-cancel a locally closed issue
  } else if (currentStatus !== newRoadmapStatus) {
    patches["roadmap_status"] = newRoadmapStatus;
    changes.push(`roadmap_status: ${currentStatus} → ${newRoadmapStatus}`);
  }

  const currentLabels = Array.isArray(data["labels"]) ? (data["labels"] as string[]) : [];
  if (JSON.stringify(currentLabels.sort()) !== JSON.stringify(labelNames.sort())) {
    patches["labels"] = labelNames;
    changes.push(`labels updated`);
  }

  const currentMilestone = data["milestone"] === "null" || data["milestone"] === null
    ? null
    : (data["milestone"] as string | undefined) ?? null;
  if (currentMilestone !== newMilestone) {
    patches["milestone"] = newMilestone;
    changes.push(`milestone: ${currentMilestone} → ${newMilestone}`);
  }

  const currentAssignees = Array.isArray(data["assignees"]) ? (data["assignees"] as string[]) : [];
  if (JSON.stringify(currentAssignees.sort()) !== JSON.stringify(newAssignees.sort())) {
    patches["assignees"] = newAssignees;
    changes.push(`assignees updated`);
  }

  if (!data["github_url"] || data["github_url"] === "null") {
    patches["github_url"] = gh.url;
    changes.push(`github_url set`);
  }

  if (changes.length > 0) {
    patches["updated_at"] = today();
    const newFm = patchFrontmatter(parsed.raw, patches);
    const newText = rebuildDocument(newFm, parsed.body);
    if (!isDryRun) {
      writeText(filePath, newText);
    }
  }

  results.push({ file: rel, changes });
}

if (wantsJson) {
  console.log(JSON.stringify({ dryRun: isDryRun, results }, null, 2));
} else {
  for (const r of results) {
    if (r.skipped) {
      console.log(`skip  ${r.file} — ${r.skipped}`);
    } else if (r.changes.length > 0) {
      console.log(`update ${r.file}:`);
      for (const c of r.changes) console.log(`  ${c}`);
    } else {
      console.log(`ok    ${r.file}`);
    }
  }
  const updated = results.filter((r) => r.changes.length > 0).length;
  console.log(`\nsync:issues: ${updated} file(s) updated${isDryRun ? " (dry run)" : ""}`);
}
