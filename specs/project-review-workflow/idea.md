---
id: IDEA-PRV-001
title: Project-review workflow idea
stage: idea
feature: project-review-workflow
status: complete
owner: codex
created: 2026-05-03
inputs:
  - user request, 2026-05-03
---

# Idea — Project-review workflow

## Problem

Project learning can remain scattered across git history, PR comments, CI failures, issues, retrospectives, and handoff notes. A maintainer needs one workflow that reviews that evidence, captures learnings, proposes improvements, and starts the first improvement PR.

## Desired outcome

Add a Project-review workflow that:

- reviews the project and git history,
- captures and summarizes learnings,
- makes improvement proposals,
- documents findings,
- opens a corresponding issue, and
- creates a first draft PR from its own worktree.

## Scope

This first increment documents the workflow and adds the invocation surfaces, templates, and references needed to run it.

## Unknowns

- Which project should be the first real review target after this workflow lands.
- Whether future automation should collect GitHub issue/PR/CI summaries deterministically.
