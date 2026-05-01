import YAML from "yaml";
import {
  discoverAutomationRegistryEntries,
  loadAutomationRegistry,
} from "./lib/automation-registry.js";

const discovery = discoverAutomationRegistryEntries(loadAutomationRegistry());
const wantsJson = process.argv.includes("--json");

if (wantsJson) {
  console.log(JSON.stringify(discovery, null, 2));
} else if (discovery.missing.length === 0) {
  console.log("automation-registry: no missing entries");
} else {
  console.log("# Candidate entries for tools/automation-registry.yml");
  console.log("# Replace TODO purpose text before committing; check:automation-registry rejects placeholders.");
  console.log(YAML.stringify(discovery.missing));
}
