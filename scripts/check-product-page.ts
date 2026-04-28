import fs from "node:fs";
import path from "node:path";
import { failIfErrors, readText, repoRoot } from "./lib/repo.js";

const errors: string[] = [];
const siteDir = path.join(repoRoot, "sites");
const indexPath = path.join(siteDir, "index.html");
const cssPath = path.join(siteDir, "styles.css");
const pagesWorkflowPath = path.join(repoRoot, ".github/workflows/pages.yml");
const prTemplatePath = path.join(repoRoot, ".github/PULL_REQUEST_TEMPLATE.md");

assertFile("sites/index.html", indexPath);
assertFile("sites/styles.css", cssPath);
assertFile("sites/README.md", path.join(siteDir, "README.md"));
assertFile(".github/workflows/pages.yml", pagesWorkflowPath);

const index = fs.existsSync(indexPath) ? readText(indexPath) : "";
const css = fs.existsSync(cssPath) ? readText(cssPath) : "";
const pagesWorkflow = fs.existsSync(pagesWorkflowPath) ? readText(pagesWorkflowPath) : "";
const prTemplate = fs.existsSync(prTemplatePath) ? readText(prTemplatePath) : "";

requireIndexMarkup(index);
checkLocalReferences(index);
checkCss(css);
checkPagesWorkflow(pagesWorkflow);
checkPrTemplate(prTemplate);

failIfErrors(errors, "check:product-page");

function assertFile(label: string, filePath: string) {
  if (!fs.existsSync(filePath)) errors.push(`${label} is missing`);
  else if (!fs.statSync(filePath).isFile()) errors.push(`${label} is not a file`);
}

function requireIndexMarkup(html: string) {
  const required: Array<[string, string]> = [
    ['<main id="main">', "sites/index.html must expose main content as #main"],
    ['class="skip-link"', "sites/index.html must include a skip link"],
    ['rel="icon"', "sites/index.html must include a favicon"],
    ['property="og:title"', "sites/index.html must include Open Graph metadata"],
    ['name="twitter:card"', "sites/index.html must include Twitter card metadata"],
    ["assets/artifact-chain.svg", "sites/index.html should include the artifact-chain visual"],
    ["Quickstart", "sites/index.html should include a quickstart section"],
  ];
  for (const [needle, message] of required) {
    if (!html.includes(needle)) errors.push(message);
  }
  const hrefs = getAttributeValues(html, "href");
  if (hrefs.some((href) => /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/generate\/?$/.test(href))) {
    errors.push("sites/index.html must not link to a GitHub template generator URL");
  }
  if (!hrefs.some((href) => /\/docs\/specorator\.md$/.test(href))) {
    errors.push("primary CTA should point to the workflow documentation");
  }
  if (!hrefs.some((href) => /(^|\/)examples\//.test(href))) {
    errors.push("sites/index.html should link to an example artifact tree");
  }
}

function checkLocalReferences(html: string) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const target of getAttributeValues(html, "href").concat(getAttributeValues(html, "src"))) {
    if (target.startsWith("#")) {
      const id = target.slice(1);
      if (!ids.has(id)) errors.push(`sites/index.html references missing anchor #${id}`);
      continue;
    }
    if (/^(https?:|mailto:|tel:)/.test(target)) continue;
    const targetPath = path.resolve(siteDir, target);
    if (!targetPath.startsWith(siteDir + path.sep)) {
      errors.push(`sites/index.html local reference escapes sites/: ${target}`);
      continue;
    }
    if (!fs.existsSync(targetPath)) errors.push(`sites/index.html references missing local asset: ${target}`);
  }
}

function getAttributeValues(html: string, attributeName: string) {
  const pattern = new RegExp(`\\s${attributeName}="([^"]+)"`, "g");
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

function checkCss(text: string) {
  const required: Array<[string, string]> = [
    [".skip-link", "sites/styles.css must style the skip link"],
    [":focus-visible", "sites/styles.css must define visible focus styles"],
    [".quickstart", "sites/styles.css must style the quickstart block"],
    [".example-grid", "sites/styles.css must style the example section"],
  ];
  for (const [needle, message] of required) {
    if (!text.includes(needle)) errors.push(message);
  }
}

function checkPagesWorkflow(text: string) {
  const required: Array<[string, string]> = [
    ["branches:", "Pages workflow must restrict push branches"],
    ["- main", "Pages workflow must deploy from main"],
    ["workflow_dispatch:", "Pages workflow must support manual dispatch"],
    ["actions/configure-pages", "Pages workflow must configure Pages"],
    ["actions/upload-pages-artifact", "Pages workflow must upload a Pages artifact"],
    ["path: sites", "Pages workflow must upload the sites/ directory"],
    ["actions/deploy-pages", "Pages workflow must deploy Pages"],
  ];
  for (const [needle, message] of required) {
    if (!text.includes(needle)) errors.push(message);
  }
}

function checkPrTemplate(text: string) {
  if (!text.includes("Product page updated or explicitly marked unaffected")) {
    errors.push(".github/PULL_REQUEST_TEMPLATE.md must include the product page upkeep checkbox");
  }
}
