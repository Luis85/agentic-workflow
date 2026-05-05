import fs from "node:fs";
import path from "node:path";

/**
 * Walk up from `startDir` until a directory containing `package.json` or `.git`
 * is found. Returns the absolute path to that directory.
 *
 * @param {string} [startDir] - Starting directory (defaults to `process.cwd()`).
 * @returns {string} Absolute path to the project root.
 * @throws {Error} When no sentinel is found before the filesystem root.
 */
export function findRepoRoot(startDir?: string): string {
  let dir = path.resolve(startDir ?? process.cwd());
  while (true) {
    if (fs.existsSync(path.join(dir, "package.json")) || fs.existsSync(path.join(dir, ".git"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        `specorator: could not locate a project root (no package.json or .git found above ${startDir ?? process.cwd()}). Run from your project root or use --cwd.`,
      );
    }
    dir = parent;
  }
}
