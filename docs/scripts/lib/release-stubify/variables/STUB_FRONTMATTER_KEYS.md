[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-stubify](../README.md) / STUB\_FRONTMATTER\_KEYS

# Variable: STUB\_FRONTMATTER\_KEYS

> `const` **STUB\_FRONTMATTER\_KEYS**: readonly \[`"title"`, `"folder"`, `"description"`, `"entry_point"`\]

Required frontmatter keys on a stubified shipping doc.

Mirrors `DOC_STUB_REQUIRED_FRONTMATTER_KEYS` in `release-package-contract.ts`
— the Layer 2 fresh-surface check enforces the same set, so any drift would
silently break the release pipeline (T-V05-013 invariant).
