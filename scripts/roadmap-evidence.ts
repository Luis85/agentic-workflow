import { collectRoadmapEvidence, renderRoadmapEvidence } from "./lib/roadmaps.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const slug = args.find((arg) => !arg.startsWith("--"));

if (!slug) {
  console.error("usage: npm run roadmap:evidence -- <roadmap-slug> [--json]");
  process.exit(1);
}

const report = collectRoadmapEvidence(slug);

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(renderRoadmapEvidence(report));
}

if (report.warnings.includes(`${report.strategyPath} is missing`)) {
  process.exit(1);
}
