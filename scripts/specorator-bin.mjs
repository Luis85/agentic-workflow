#!/usr/bin/env node
// npm bin wrapper — uses node (always on PATH) and resolves tsx from this
// package's own dependency tree rather than relying on the caller's PATH.
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliTs = path.join(__dirname, 'cli.ts');
const req = createRequire(import.meta.url);

function resolveTsxArgs() {
  try {
    const pkgJsonPath = req.resolve('tsx/package.json');
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const binEntry = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.tsx;
    if (binEntry) {
      const tsxCli = path.join(path.dirname(pkgJsonPath), binEntry);
      if (existsSync(tsxCli)) return { cmd: process.execPath, leading: [tsxCli] };
    }
  } catch {
    // tsx not resolvable via require — fall back to PATH (npm run / npx / global install)
  }
  return { cmd: 'tsx', leading: [] };
}

const { cmd, leading } = resolveTsxArgs();
const result = spawnSync(cmd, [...leading, cliTs, ...process.argv.slice(2)], {
  stdio: 'inherit',
  windowsHide: true,
});
process.exit(result.status ?? 1);
