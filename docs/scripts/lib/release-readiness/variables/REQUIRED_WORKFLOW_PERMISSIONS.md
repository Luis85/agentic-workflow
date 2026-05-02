[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / REQUIRED\_WORKFLOW\_PERMISSIONS

# Variable: REQUIRED\_WORKFLOW\_PERMISSIONS

> `const` **REQUIRED\_WORKFLOW\_PERMISSIONS**: `Readonly`\<`Record`\<`string`, `string`\>\>

Least-privilege workflow permissions allowed on the manual release workflow
per ADR-0020 / SPEC-V05-002 / NFR-V05-001.

The set is exhaustive — any other key (for example `actions: write`,
`id-token: write`, `pull-requests: write`) is a violation, and any value
other than the one below for a permitted key is a violation. The check
applies to both the workflow-level `permissions:` block and any
`jobs.<job>.permissions` block so a compliant top-level cannot be widened
by a job override (Codex round-3 P1 on PR #158).
