import path from "node:path";
import { getCommands, renderCommandInventory } from "./lib/commands.js";
import { failIfErrors, readText, repoRoot } from "./lib/repo.js";

const docs = [
  [".claude/commands/README.md", "command-inventory", renderCommandInventory()],
  ["README.md", "slash-commands", renderCommandInventory({ fenced: true })],
  ["docs/workflow-overview.md", "slash-commands", renderCommandInventory({ fenced: true })],
];

const errors = [];
const commands = getCommands();

for (const [relativePath, marker, expected] of docs) {
  const text = readText(path.join(repoRoot, relativePath));
  if (!text.includes(`<!-- BEGIN GENERATED: ${marker} -->`)) {
    errors.push(`${relativePath} missing generated block marker: ${marker}`);
    continue;
  }

  const blockMatch = text.match(
    new RegExp(`<!-- BEGIN GENERATED: ${marker} -->\\n([\\s\\S]*?)\\n<!-- END GENERATED: ${marker} -->`),
  );
  if (!blockMatch) {
    errors.push(`${relativePath} has malformed generated block: ${marker}`);
    continue;
  }
  if (blockMatch[1].trimEnd() !== expected.trimEnd()) {
    errors.push(`${relativePath} generated command inventory is stale`);
  }

  for (const item of commands) {
    if (!blockMatch[1].includes(item.command)) {
      errors.push(`${relativePath} generated command inventory missing ${item.command}`);
    }
  }
}

failIfErrors(errors, "check:commands");
