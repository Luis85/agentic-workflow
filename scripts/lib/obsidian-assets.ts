import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";
import type { Diagnostic } from "./diagnostics.js";
import { readText, relativeToRoot, repoRoot, toPosix, walkFiles } from "./repo.js";

export type ObsidianAssetDiagnosticCode =
  | "OBS_ASSET_TRACKED_STATE"
  | "OBS_ASSET_BASE_YAML"
  | "OBS_ASSET_CANVAS_JSON"
  | "OBS_ASSET_CANVAS_SHAPE";

export type ObsidianAssetDiagnosticOptions = {
  trackedPaths?: string[];
  baseFiles?: string[];
  canvasFiles?: string[];
};

/**
 * Validate committed Obsidian vault assets.
 *
 * This check is separate from `check:obsidian`: that check validates Markdown
 * frontmatter compatibility, while this one validates committed `.base` and
 * `.canvas` assets and rejects tracked vault-local state.
 *
 * @param options - Optional file lists for tests.
 * @returns Obsidian asset diagnostics.
 */
export function obsidianAssetDiagnostics(options: ObsidianAssetDiagnosticOptions = {}): Diagnostic[] {
  const trackedPaths = options.trackedPaths ?? gitTrackedFiles();
  const baseFiles =
    options.baseFiles ?? walkFiles("docs/obsidian/bases", (filePath) => path.extname(filePath) === ".base");
  const canvasFiles =
    options.canvasFiles ?? walkFiles("docs/obsidian/canvas", (filePath) => path.extname(filePath) === ".canvas");

  return [
    ...obsidianTrackedStateDiagnostics(trackedPaths),
    ...baseFiles.flatMap(obsidianBaseDiagnosticsForFile),
    ...canvasFiles.flatMap(obsidianCanvasDiagnosticsForFile),
  ];
}

/**
 * Reject tracked Obsidian workspace and trash state.
 *
 * @param trackedPaths - Git-tracked repository paths.
 * @returns Diagnostics for tracked `.obsidian/` or `.trash/` paths.
 */
export function obsidianTrackedStateDiagnostics(trackedPaths: string[]): Diagnostic[] {
  return trackedPaths
    .map(toPosix)
    .filter((trackedPath) => trackedPath.startsWith(".obsidian/") || trackedPath.startsWith(".trash/"))
    .map((trackedPath) =>
      obsidianAssetDiagnostic(
        "OBS_ASSET_TRACKED_STATE",
        trackedPath,
        "Obsidian vault-local state must not be tracked; remove it from git.",
      ),
    );
}

/**
 * Validate one Obsidian `.base` file as YAML.
 *
 * @param filePath - Absolute or repository-relative `.base` file path.
 * @returns YAML diagnostics.
 */
export function obsidianBaseDiagnosticsForFile(filePath: string): Diagnostic[] {
  const rel = repositoryRelativePath(filePath);
  const document = parseDocument(readText(filePath), { prettyErrors: false });
  return document.errors.map((error) =>
    obsidianAssetDiagnostic("OBS_ASSET_BASE_YAML", rel, error.linePos?.[0]?.line, error.message),
  );
}

/**
 * Validate one Obsidian `.canvas` file as JSON Canvas-shaped JSON.
 *
 * @param filePath - Absolute or repository-relative `.canvas` file path.
 * @returns JSON diagnostics.
 */
export function obsidianCanvasDiagnosticsForFile(filePath: string): Diagnostic[] {
  const rel = repositoryRelativePath(filePath);
  let data: unknown;

  try {
    data = JSON.parse(readText(filePath));
  } catch (error) {
    return [
      obsidianAssetDiagnostic(
        "OBS_ASSET_CANVAS_JSON",
        rel,
        error instanceof SyntaxError ? error.message : "Canvas file must be valid JSON.",
      ),
    ];
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return [obsidianAssetDiagnostic("OBS_ASSET_CANVAS_SHAPE", rel, "Canvas file must contain a JSON object.")];
  }

  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    return [
      obsidianAssetDiagnostic(
        "OBS_ASSET_CANVAS_SHAPE",
        rel,
        "Canvas file must contain `nodes` and `edges` arrays.",
      ),
    ];
  }

  return [];
}

function gitTrackedFiles(): string[] {
  const result = spawnSync("git", ["ls-files"], {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || "git ls-files failed");
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function repositoryRelativePath(filePath: string): string {
  return path.isAbsolute(filePath) ? relativeToRoot(filePath) : toPosix(filePath);
}

function obsidianAssetDiagnostic(
  code: ObsidianAssetDiagnosticCode,
  pathName: string,
  lineOrMessage: number | string | undefined,
  maybeMessage?: string,
): Diagnostic {
  const line = typeof lineOrMessage === "number" ? lineOrMessage : undefined;
  const message = maybeMessage ?? String(lineOrMessage || "Invalid Obsidian asset.");
  return { code, path: pathName, line, message };
}
