# Repository Scripts

The scripts in this directory provide the template repository's local and CI integrity checks.

## Verify

Run the full read-only gate:

```bash
npm run verify
```

`verify` runs each `check:*` task in order and stops at the first failure. The failing task prints the command to rerun while iterating.

## Checks

| Script | Purpose |
| --- | --- |
| `npm run check:links` | Validate local Markdown links and anchors. |
| `npm run check:adr-index` | Confirm `docs/adr/README.md` matches the ADR files. |
| `npm run check:commands` | Confirm generated slash-command inventories are current. |
| `npm run check:frontmatter` | Validate required frontmatter on state files, ADRs, and review artifacts. |
| `npm run check:specs` | Validate lifecycle `workflow-state.md` files and their artifact maps. |

## Generated Repairs

Run all deterministic generated-block repairs:

```bash
npm run fix
```

Use narrower repair commands when you only want one generated surface:

```bash
npm run fix:adr-index
npm run fix:commands
```

Review the diff after any fix command, then rerun `npm run verify`.
