# new-adr — scaffold a new ADR

## Purpose

Create a new Architecture Decision Record under `docs/adr/` from `templates/adr-template.md`, with the next free four‑digit number, the right filename, and the frontmatter pre‑filled.

Use this skill when invoked via `/adr:new "<title>"` or whenever a non‑trivial, irreversible architectural decision needs to be recorded.

For background on what counts as ADR‑worthy and how ADRs are governed, see [`docs/adr/README.md`](../../../docs/adr/README.md), [`templates/adr-template.md`](../../../templates/adr-template.md), and **Article VIII — Plain Language** of the constitution.

## How to use

1. **Check the next free number.** ADRs are numbered `NNNN` from `0001`. Find the highest existing number under `docs/adr/` and add 1.

   ```bash
   ls docs/adr/[0-9]*.md 2>/dev/null \
     | sed -E 's@.*/([0-9]{4}).*@\1@' \
     | sort -n \
     | tail -1
   ```

2. **Slugify the title** to kebab‑case: lowercase, alphanumerics and hyphens only, no leading/trailing hyphens.

3. **Compose the filename:** `docs/adr/<NNNN>-<slug>.md`.

4. **Copy `templates/adr-template.md`** to that path and fill in:
   - `id: ADR-<NNNN>`
   - `title: "<title>"`
   - `status: proposed`
   - `date: <today's UTC date, YYYY-MM-DD>`
   - `supersedes: []` (unless this ADR replaces a prior one)
   - `superseded-by: null`
   - Body sections (Context / Decision / Consequences) — leave the headings; fill the prose.

5. **Do NOT touch existing ADR bodies.** ADR bodies are immutable per the constitution's Article VIII. The only fields ever updated on an existing ADR are `status` and `superseded-by`.

6. **If this ADR supersedes a prior one,** update the prior ADR's frontmatter — only those two fields — in the same PR.

7. **Update `docs/adr/README.md`** if it maintains an index of ADRs.

## Reporting

On success, report:

```
Created ADR-<NNNN>: <title>
  path: docs/adr/<NNNN>-<slug>.md
  status: proposed
  supersedes: <list or none>
```

If a prior ADR was superseded, name it explicitly.

## Do not

- Do **not** number an ADR by guessing — always derive from the directory listing. Two ADRs with the same number is a worse failure than a slow scan.
- Do **not** edit the body of any existing ADR. To change a decision, supersede it.
- Do **not** mark a new ADR `accepted` without explicit human approval. New ADRs start `proposed`.
- Do **not** delete superseded ADRs. They remain as historical record.
