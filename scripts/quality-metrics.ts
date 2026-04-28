import {
  collectQualityMetrics,
  compareQualityMetrics,
  latestQualityMetricsSnapshot,
  renderQualityMetrics,
  renderQualityTrend,
  renderQualityTrendError,
  saveQualityMetricsSnapshot,
} from "./lib/quality-metrics.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const compare = args.includes("--compare");
const save = args.includes("--save");
const feature = valueAfter("--feature");

const metrics = collectQualityMetrics({ feature });
const baseline = compare ? latestQualityMetricsSnapshot(metrics) : null;
const baselineError = baseline?.error;
const trend = baseline?.metrics ? compareQualityMetrics(metrics, baseline.metrics, baseline.path) : null;
const savedPath = save ? saveQualityMetricsSnapshot(metrics) : undefined;

if (json) {
  if (compare || save) {
    console.log(JSON.stringify({ metrics, trend, baselineError, savedPath }, null, 2));
  } else {
    console.log(JSON.stringify(metrics, null, 2));
  }
} else {
  const output = [renderQualityMetrics(metrics).trimEnd()];
  if (compare) output.push((baseline?.error ? renderQualityTrendError(baseline) : renderQualityTrend(trend)).trimEnd());
  if (savedPath) output.push(`Saved snapshot: ${savedPath}`);
  console.log(`${output.join("\n\n")}\n`);
}

function valueAfter(flag: string): string | undefined {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}
