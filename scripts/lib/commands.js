import path from "node:path";
import { repoRoot, walkFiles } from "./repo.js";

const labels = new Map([
  ["adr", "Decisions"],
  ["discovery", "Discovery Track"],
  ["portfolio", "Portfolio Track"],
  ["product", "Product"],
  ["project", "Project Manager Track"],
  ["sales", "Sales Cycle Track"],
  ["spec", "Lifecycle"],
  ["stock-taking", "Stock-taking Track"],
]);

/**
 * Slash-command metadata discovered from `.claude/commands`.
 *
 * @typedef {object} CommandRecord
 * @property {string} namespace - Command namespace, such as `spec` or `adr`.
 * @property {string} name - Command name without the `.md` extension.
 * @property {string} command - Slash-command invocation, such as `/spec:idea`.
 */

/**
 * Discover slash-command Markdown files under `.claude/commands`.
 *
 * @returns {CommandRecord[]} Command records sorted by slash-command name.
 */
export function getCommands() {
  return walkFiles(".claude/commands", (file) => file.endsWith(".md"))
    .filter((file) => path.basename(file) !== "README.md")
    .map((file) => {
      const rel = path.relative(path.join(repoRoot, ".claude/commands"), file);
      const parts = rel.split(path.sep);
      const namespace = parts[0];
      const name = path.basename(parts[1] || parts[0], ".md");
      return {
        namespace,
        name,
        command: `/${namespace}:${name}`,
      };
    })
    .sort((a, b) => a.command.localeCompare(b.command));
}

/**
 * Render the slash-command inventory block used in generated documentation.
 *
 * @param {{ fenced?: boolean }} [options] - Rendering options.
 * @param {boolean} [options.fenced=false] - Wrap the inventory in a Markdown code fence.
 * @returns {string} Markdown inventory grouped by command namespace.
 */
export function renderCommandInventory({ fenced = false } = {}) {
  const groups = new Map();
  for (const command of getCommands()) {
    if (!groups.has(command.namespace)) groups.set(command.namespace, []);
    groups.get(command.namespace).push(command);
  }
  const sections = [];

  for (const [namespace, commands] of [...groups.entries()].sort()) {
    const label = labels.get(namespace) || namespace;
    sections.push(`# ${label}:`);
    sections.push(wrapCommands(commands.map((item) => item.command)));
    sections.push("");
  }

  const content = sections.join("\n").trimEnd();
  return fenced ? `\`\`\`\n${content}\n\`\`\`` : content;
}

function wrapCommands(commands) {
  const width = Math.max(...commands.map((command) => command.length), 1) + 2;
  const lines = [];
  for (let index = 0; index < commands.length; index += 3) {
    lines.push(
      commands
        .slice(index, index + 3)
        .map((command) => command.padEnd(width, " "))
        .join("")
        .trimEnd(),
    );
  }
  return lines.join("\n");
}
