[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-stubify](../README.md) / stubifyDoc

# Function: stubifyDoc()

> **stubifyDoc**(`input`): [`StubifyOutput`](../type-aliases/StubifyOutput.md)

Convert a single Markdown document from codebase form to released stub form.

The transform is a pure function: codebase contents in, stub contents out.
No filesystem access. The caller (release-archive-builder) is responsible
for reading and writing files.

## Parameters

### input

[`StubifyInput`](../type-aliases/StubifyInput.md)

Source path (relative to repo root, POSIX) and Markdown text.

## Returns

[`StubifyOutput`](../type-aliases/StubifyOutput.md)

Stubified Markdown text that satisfies SPEC-V05-010 assertion 3.
