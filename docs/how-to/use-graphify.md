---
title: "Use graphify"
folder: "docs/how-to"
description: "Install graphify, regenerate the committed repository knowledge graph, and browse the generated artifacts."
entry_point: false
---

# Use graphify

**Goal:** Regenerate the committed knowledge graph in `graph/` and open it locally.

**When to use:** Use this after structural code or documentation changes when `graph/graph.html`, `graph/graph.json`, and `graph/GRAPH_REPORT.md` should reflect the current repository.

**Prerequisites:**

- Python 3.10 or newer.
- Node.js 20 or newer.
- Repository dependencies installed with `npm ci`.

## Why graphify?

Issue [#263](https://github.com/Luis85/agentic-workflow/issues/263) adds a committed, read-only graph so contributors can browse repository structure without installing graphify first. The generated entry point is [`graph/graph.html`](../../graph/graph.html).

## Install

Install graphify from PyPI. The package name is `graphifyy`; the terminal command is `graphify`.

```bash
python -m pip install --user --upgrade graphifyy
```

This integration was verified with `graphifyy` 0.7.0. Use 0.7.0 or newer so `GRAPHIFY_OUT=graph graphify update .` writes to the committed `graph/` directory.

## Verify Install

```bash
graphify --help
```

The command should print the graphify command list. If it does not, add the Python user scripts directory to `PATH` and open a new terminal.

## Run

Run the full local rebuild:

```bash
npm run graph
```

Run the incremental update:

```bash
npm run graph:update
```

The wrapper sets `GRAPHIFY_OUT=graph` and then calls `graphify update .`. The full rebuild adds `--force`; the incremental command leaves graphify's normal update behavior intact.

## Browse The Graph

Open [`graph/graph.html`](../../graph/graph.html) in a browser. The committed artifacts are:

- [`graph/graph.html`](../../graph/graph.html) — interactive visualization.
- [`graph/graph.json`](../../graph/graph.json) — queryable graph data.
- [`graph/GRAPH_REPORT.md`](../../graph/GRAPH_REPORT.md) — audit report and navigation summary.

## Troubleshooting

If the wrapper prints the missing-binary message, `graphify` is either not installed or not visible in `PATH`.

```text
graphify is not installed or not in PATH.
Install it from: https://github.com/safishamsi/graphify
Then re-run: npm run graph
See also: docs/how-to/use-graphify.md
```

On macOS or Linux, ensure `python -m site --user-base` plus `/bin` is in `PATH`. On Windows, ensure the Python `Scripts` directory under the user site is in `Path`, then restart PowerShell.

If graphify prints `warning: skill is from graphify ... Run 'graphify install' to update.`, the graph rebuild still succeeded. That warning refers to the assistant skill installed in your home directory, not this repository. Run `graphify install` only if you want graphify to update that global assistant integration.

Do not run two graphify rebuilds in the same checkout at the same time; graphify owns the cache under `graph/cache/` while it is running. If the repository came from `git archive` rather than `git clone`, `.gitignore` is not active until the folder becomes a git worktree, so avoid committing `graph/cache/` from that extracted copy.

## Contributing Back

After significant structural changes, run `npm run graph`, check that `git status` does not show `graph/cache/`, and commit the updated `graph/graph.html`, `graph/graph.json`, and `graph/GRAPH_REPORT.md` with the same PR.

## Related

- Specification — [Graphify integration spec](../../specs/graphify-integration/spec.md).
- Tasks — [Graphify integration tasks](../../specs/graphify-integration/tasks.md).
