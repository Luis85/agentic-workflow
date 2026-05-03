import path from "node:path";
import type { Diagnostic } from "./lib/diagnostics.js";
import { frontmatterDiagnostic, futureDateDiagnostics, requiredKeyDiagnostics } from "./lib/frontmatter.js";
import {
  FrontmatterBlock,
  extractFrontmatter,
  failIfErrors,
  markdownFiles,
  parseSimpleYaml,
  readText,
  relativeToRoot,
} from "./lib/repo.js";
import { artifactStatuses, workflowStages, workflowStatuses } from "./lib/workflow-schema.js";

const errors: Diagnostic[] = [];
const readmeDirs = new Map<string, string[]>();

for (const filePath of markdownFiles()) {
  const rel = relativeToRoot(filePath);
  const text = readText(filePath);
  const frontmatter = extractFrontmatter(text);
  const basename = path.basename(rel);
  const dirname = path.dirname(rel) === "." ? "." : path.dirname(rel);

  if (frontmatter) errors.push(...futureDateDiagnostics(rel, frontmatter.raw));

  if (basename.toLowerCase() === "readme.md") {
    const siblings = readmeDirs.get(dirname) || [];
    siblings.push(rel);
    readmeDirs.set(dirname, siblings);

    if (basename !== "README.md") {
      errors.push(frontmatterDiagnostic("FM_README_NAME", rel, "must be named README.md"));
    } else if (rel !== "README.md") {
      requireFrontmatter(rel, frontmatter);
      if (frontmatter) validateReadme(rel, parseSimpleYaml(frontmatter.raw));
    }
  }

  if (isAdr(rel)) {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateAdr(rel, parseSimpleYaml(frontmatter.raw));
  }

  if (rel.endsWith("workflow-state.md")) {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateWorkflowState(rel, parseSimpleYaml(frontmatter.raw));
  }

  if (isTrackState(rel)) {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateTrackState(rel, parseSimpleYaml(frontmatter.raw));
  }

  if (rel.startsWith("docs/daily-reviews/") && path.basename(rel) !== "README.md") {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateDailyReview(rel, parseSimpleYaml(frontmatter.raw));
  }
}

for (const [dirname, readmes] of readmeDirs) {
  if (readmes.length > 1) {
    errors.push(
      frontmatterDiagnostic("FM_README_DUPLICATE", dirname, `has multiple README files: ${readmes.join(", ")}`),
    );
  }
}

failIfErrors(errors, "check:frontmatter");

function isAdr(rel: string): boolean {
  return /^docs\/adr\/0\d{3}-.+\.md$/.test(rel);
}

function requireFrontmatter(rel: string, frontmatter: FrontmatterBlock | null): void {
  if (!frontmatter) errors.push(frontmatterDiagnostic("FM_MISSING", rel, "is missing YAML frontmatter"));
}

function validateReadme(rel: string, data: Record<string, unknown>): void {
  errors.push(...requiredKeyDiagnostics(rel, data, ["title", "folder", "description", "entry_point"]));

  const expectedFolder = path.dirname(rel) === "." ? "." : path.dirname(rel);
  if (data.folder !== undefined && String(data.folder) !== expectedFolder) {
    errors.push(frontmatterDiagnostic("FM_README_FOLDER", rel, `frontmatter folder must be ${expectedFolder}`));
  }

  if (data.entry_point !== undefined && String(data.entry_point) !== "true") {
    errors.push(frontmatterDiagnostic("FM_README_ENTRY_POINT", rel, "frontmatter entry_point must be true"));
  }
}

function validateAdr(rel: string, data: Record<string, unknown>): void {
  errors.push(...requiredKeyDiagnostics(rel, data, ["id", "title", "status", "date"]));

  const fileNumber = path.basename(rel).slice(0, 4);
  if (data.id !== `ADR-${fileNumber}`) {
    errors.push(frontmatterDiagnostic("FM_ADR_ID", rel, `frontmatter id must be ADR-${fileNumber}`));
  }

  const status = String(data.status || "").toLowerCase();
  if (!["proposed", "accepted", "deprecated"].includes(status) && !status.startsWith("superseded")) {
    errors.push(frontmatterDiagnostic("FM_ADR_STATUS", rel, `has unsupported ADR status: ${data.status}`));
  }
}

function validateWorkflowState(rel: string, data: Record<string, unknown>): void {
  errors.push(
    ...requiredKeyDiagnostics(rel, data, ["current_stage", "status", "last_updated", "last_agent", "artifacts"]),
  );

  if (data.current_stage && !workflowStages.has(String(data.current_stage))) {
    errors.push(frontmatterDiagnostic("FM_WORKFLOW_STAGE", rel, `has unsupported current_stage: ${data.current_stage}`));
  }
  if (data.status && !workflowStatuses.has(String(data.status))) {
    errors.push(frontmatterDiagnostic("FM_WORKFLOW_STATUS", rel, `has unsupported status: ${data.status}`));
  }
  if (data.artifacts && typeof data.artifacts === "object") {
    for (const [artifact, status] of Object.entries(data.artifacts)) {
      if (!artifactStatuses.has(String(status))) {
        errors.push(
          frontmatterDiagnostic("FM_ARTIFACT_STATUS", rel, `artifact ${artifact} has unsupported status: ${status}`),
        );
      }
    }
  }
}

function validateDailyReview(rel: string, data: Record<string, unknown>): void {
  errors.push(...requiredKeyDiagnostics(rel, data, ["date", "head_sha", "issue", "finding_count"]));
  if (data.head_sha && !/^[0-9a-f]{40}$/i.test(String(data.head_sha))) {
    errors.push(frontmatterDiagnostic("FM_REVIEW_SHA", rel, "head_sha must be a 40-character SHA"));
  }
  if (data.issue !== null && !/^#\d+$/.test(String(data.issue))) {
    errors.push(frontmatterDiagnostic("FM_REVIEW_ISSUE", rel, "issue must be #NNN or null"));
  }
  if (data.finding_count !== undefined && !Number.isInteger(Number(data.finding_count))) {
    errors.push(frontmatterDiagnostic("FM_REVIEW_FINDING_COUNT", rel, "finding_count must be an integer"));
  }
}

function isTrackState(rel: string): boolean {
  return /(^|\/)(discovery-state|stock-taking-state|scaffolding-state|project-state|portfolio-state|deal-state)\.md$/.test(
    rel,
  );
}

function validateTrackState(rel: string, data: Record<string, unknown>): void {
  errors.push(...requiredKeyDiagnostics(rel, data, ["status", "last_updated", "last_agent", "artifacts"]));
  if (data.artifacts && typeof data.artifacts === "object") {
    for (const [artifact, status] of Object.entries(data.artifacts)) {
      if (!artifactStatuses.has(String(status))) {
        errors.push(
          frontmatterDiagnostic("FM_ARTIFACT_STATUS", rel, `artifact ${artifact} has unsupported status: ${status}`),
        );
      }
    }
  }
}
