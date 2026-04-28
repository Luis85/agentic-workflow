import path from "node:path";
import { renderCommandInventory } from "./lib/commands.js";
import { readText, replaceGeneratedBlock, repoRoot, writeText } from "./lib/repo.js";

const docs = [
  [".claude/commands/README.md", "command-inventory", renderCommandInventory()],
  ["README.md", "slash-commands", renderCommandInventory({ fenced: true })],
  ["docs/workflow-overview.md", "slash-commands", renderCommandInventory({ fenced: true })],
];

let changed = false;
for (const [relativePath, marker, content] of docs) {
  const filePath = path.join(repoRoot, relativePath);
  const current = readText(filePath);
  const next = replaceGeneratedBlock(current, marker, content);
  if (next !== current) {
    writeText(filePath, next);
    changed = true;
    console.log(`fix:commands: updated ${relativePath}`);
  }
}

if (!changed) console.log("fix:commands: no changes");
