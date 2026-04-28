---
title: "Obsidian metadata compatibility"
folder: "docs"
description: "Reference for writing Markdown frontmatter that is compatible with Obsidian and the Specorator workflow."
entry_point: false
---
# Obsidian metadata compatibility

This repository is Markdown-first. Obsidian can read the repository as a vault, but the workflow still owns the canonical artifact schemas and verification scripts.

Use this reference when writing or reviewing YAML frontmatter by hand, in templates, or through an Obsidian property editor.

## Compatibility tiers

| Tier | Meaning | Use when |
|---|---|---|
| Source-compatible | Valid top-of-file YAML that Obsidian can preserve in source mode and repository scripts can parse or ignore safely. | Workflow state maps, artifact status maps, and other structured metadata that agents consume. |
| Properties-UI-safe | Simple Obsidian Properties values: scalar text, numbers, checkboxes, dates, date-times, tags, and flat lists. | Metadata users should edit directly in Obsidian's Properties UI. |

Nested maps are source-compatible for this repo, but they are not Properties-UI-safe. Obsidian documents nested properties as unsupported in the Properties UI and recommends source mode for them.

## Repository rules

- Put YAML frontmatter at the top of the file between `---` delimiter lines.
- Use unique property names in each file.
- Use `name: value` syntax with a colon followed by a space.
- Use spaces, not tabs.
- Use readable YAML, not JSON-style frontmatter.
- Quote internal links in property values: `link: "[[Note]]"`.
- Prefer block lists for Obsidian-facing lists:

```yaml
---
related:
  - "[[One Note]]"
  - "[[Another Note]]"
---
```

Inline lists are accepted only when internal links are quoted:

```yaml
---
related: ["[[One Note]]", "[[Another Note]]"]
---
```

## Source-compatible maps

Workflow state files intentionally use nested maps:

```yaml
---
artifacts:
  idea.md: complete
  requirements.md: in-progress
---
```

Keep these maps in source mode. Do not flatten them only to satisfy Obsidian's Properties UI; that would break the workflow schema.

## Local checks

Run the read-only compatibility check:

```bash
npm run check:obsidian
```

Run the conservative repair command:

```bash
npm run fix:obsidian
```

The fixer quotes repairable internal links in scalar values, inline lists, and block-list items. It does not fix duplicate property names, malformed keys, tabs, JSON-style metadata, or schema decisions that need human judgment.

## Source

This policy follows Obsidian's Properties documentation, especially the YAML top-of-file format, unique property names, quoted internal links, flat list examples, and the warning that nested properties are not supported in the Properties UI: <https://help.obsidian.md/properties>.
