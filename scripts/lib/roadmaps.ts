import fs from "node:fs";
import path from "node:path";
import type { Diagnostic } from "./diagnostics.js";
import {
  extractFrontmatter,
  parseSimpleYaml,
  readText,
  relativeToRoot,
  walkFiles,
} from "./repo.js";

export const roadmapStatuses = new Set(["active", "paused", "done"]);
export const roadmapScopeTypes = new Set(["product", "project", "program", "mixed"]);
export const roadmapDocumentStatuses = new Set(["pending", "in-progress", "complete"]);
export const roadmapDocuments = [
  ["strategy", "roadmap-strategy.md"],
  ["board", "roadmap-board.md"],
  ["delivery_plan", "delivery-plan.md"],
  ["stakeholders", "stakeholder-map.md"],
  ["communication_log", "communication-log.md"],
  ["decision_log", "decision-log.md"],
] as const;
export const requiredRoadmapStateSections = ["Roadmap", "Documents", "Review history", "Hand-off notes"];

/**
 * Find roadmap state files under `roadmaps/<slug>/`.
 *
 * @returns {string[]} Repository-absolute roadmap state file paths.
 */
export function roadmapStateFiles(): string[] {
  return walkFiles("roadmaps", (filePath) => path.basename(filePath) === "roadmap-state.md");
}

/**
 * Validate every roadmap state file in the repository.
 *
 * The check is intentionally read-only. It only validates roadmap state
 * contracts once a roadmap exists; repositories with no `roadmaps/` directory
 * pass so the track stays opt-in.
 *
 * @returns {Diagnostic[]} Structured validation diagnostics.
 */
export function roadmapStateDiagnostics(): Diagnostic[] {
  return roadmapStateFiles().flatMap((filePath) => validateRoadmapStateFile(filePath));
}

/**
 * Validate one roadmap state file.
 *
 * @param {string} filePath - Absolute path to `roadmap-state.md`.
 * @returns {Diagnostic[]} Structured validation diagnostics.
 */
export function validateRoadmapStateFile(filePath: string): Diagnostic[] {
  const rel = relativeToRoot(filePath);
  const roadmapDir = path.basename(path.dirname(filePath));
  const frontmatter = extractFrontmatter(readText(filePath));

  if (!frontmatter) {
    return [diagnostic(rel, "ROADMAP_STATE_FRONTMATTER", "is missing YAML frontmatter")];
  }

  const data = parseSimpleYaml(frontmatter.raw);
  return [
    ...validateRoadmapStateData(rel, roadmapDir, data, path.dirname(filePath)),
    ...validateRoadmapStateSections(rel, frontmatter.body),
  ];
}

/**
 * Validate parsed roadmap state frontmatter.
 *
 * @param {string} rel - Repository-relative state file path.
 * @param {string} roadmapDir - Roadmap folder slug.
 * @param {Record<string, unknown>} data - Parsed frontmatter.
 * @param {string} dirPath - Absolute roadmap directory path.
 * @returns {Diagnostic[]} Structured validation diagnostics.
 */
export function validateRoadmapStateData(
  rel: string,
  roadmapDir: string,
  data: Record<string, unknown>,
  dirPath: string,
): Diagnostic[] {
  const errors: Diagnostic[] = [];

  for (const key of [
    "roadmap",
    "status",
    "scope_type",
    "last_review",
    "next_review",
    "last_updated",
    "last_agent",
    "documents",
  ]) {
    if (isMissingScalar(data[key])) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_KEY", `missing frontmatter key: ${key}`));
    }
  }

  if (data.roadmap !== undefined && data.roadmap !== roadmapDir) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_ID", `roadmap must match its folder name: ${roadmapDir}`));
  }
  if (data.status !== undefined && !roadmapStatuses.has(String(data.status))) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_STATUS", `has unsupported status: ${data.status}`));
  }
  if (data.scope_type !== undefined && !roadmapScopeTypes.has(String(data.scope_type))) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_SCOPE", `has unsupported scope_type: ${data.scope_type}`));
  }
  validateIsoDate(rel, data.last_review, "last_review", errors, { nullable: true });
  validateIsoDate(rel, data.next_review, "next_review", errors, { nullable: true });
  validateIsoDate(rel, data.last_updated, "last_updated", errors, { nullable: false });
  validateDocumentMap(rel, data.documents, dirPath, errors);

  return errors;
}

function validateIsoDate(
  rel: string,
  value: unknown,
  key: string,
  errors: Diagnostic[],
  options: { nullable: boolean },
): void {
  if (value === null && options.nullable) return;
  if (value === undefined || value === "") return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_DATE", `${key} must use YYYY-MM-DD`));
  }
}

function isMissingScalar(value: unknown): boolean {
  return (
    value === undefined ||
    value === "" ||
    (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0)
  );
}

function validateDocumentMap(rel: string, value: unknown, dirPath: string, errors: Diagnostic[]): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENTS", "documents must be a YAML map"));
    return;
  }

  const documents = value as Record<string, unknown>;
  const knownDocuments = new Set<string>(roadmapDocuments.map(([key]) => key));

  for (const [key, fileName] of roadmapDocuments) {
    if (documents[key] === undefined) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENTS", `documents missing ${key}`));
      continue;
    }

    const status = String(documents[key]);
    if (!roadmapDocumentStatuses.has(status)) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENT_STATUS", `document ${key} has unsupported status: ${status}`));
      continue;
    }

    const documentPath = path.join(dirPath, fileName);
    if ((status === "complete" || status === "in-progress") && !fs.existsSync(documentPath)) {
      errors.push(
        diagnostic(rel, "ROADMAP_STATE_DOCUMENT_EXISTS", `marks ${fileName} as ${status}, but it does not exist`),
      );
    }
  }

  for (const key of Object.keys(documents)) {
    if (!knownDocuments.has(key)) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENTS", `documents includes unknown document ${key}`));
    }
  }
}

function validateRoadmapStateSections(rel: string, body: string): Diagnostic[] {
  const errors: Diagnostic[] = [];
  for (const heading of requiredRoadmapStateSections) {
    if (!new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m").test(body)) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_SECTION", `missing section: ${heading}`));
    }
  }
  return errors;
}

function diagnostic(pathName: string, code: string, message: string): Diagnostic {
  return { path: pathName, code, message };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
