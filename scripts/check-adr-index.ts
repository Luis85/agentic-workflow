import path from "node:path";
import { getAdrs, renderAdrIndex } from "./lib/adr.js";
import { failIfErrors, readText, repoRoot } from "./lib/repo.js";

const readmePath = path.join(repoRoot, "docs/adr/README.md");
const readme = readText(readmePath);
const expected = renderAdrIndex();
const errors = [];

for (const adr of getAdrs()) {
  const row = `| [${adr.number}](${adr.fileName}) | ${adr.title} | ${adr.status} |`;
  if (!readme.includes(row)) {
    errors.push(`docs/adr/README.md missing or stale ADR index row: ${row}`);
  }
}

const indexedNumbers = [...readme.matchAll(/\|\s*\[(\d{4})\]\((0\d{3}-.+?\.md)\)/g)].map(
  (match) => match[1],
);
const adrNumbers = new Set(getAdrs().map((adr) => adr.number));
for (const number of indexedNumbers) {
  if (!adrNumbers.has(number)) {
    errors.push(`docs/adr/README.md indexes ADR ${number}, but no matching ADR file exists`);
  }
}

if (!readme.includes("<!-- BEGIN GENERATED: adr-index -->")) {
  errors.push("docs/adr/README.md missing generated block marker: adr-index");
}

if (errors.length === 0) {
  const blockMatch = readme.match(
    /<!-- BEGIN GENERATED: adr-index -->\n([\s\S]*?)\n<!-- END GENERATED: adr-index -->/,
  );
  if (blockMatch && blockMatch[1].trimEnd() !== expected.trimEnd()) {
    errors.push("docs/adr/README.md generated ADR index differs from repository ADR files");
  }
}

failIfErrors(errors, "check:adr-index");
