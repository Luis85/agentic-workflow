[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/github-project-setup](../README.md) / applyGitHubProjectSetupPlan

# Function: applyGitHubProjectSetupPlan()

> **applyGitHubProjectSetupPlan**(`repo`, `plan`): `void`

Apply a project setup plan to a GitHub repository with the GitHub CLI.

Existing labels are updated only when the local `gh label create` command
supports `--force`; otherwise existing labels are left in place.

## Parameters

### repo

`string`

Repository in `owner/name` form.

### plan

[`GitHubProjectSetupPlan`](../type-aliases/GitHubProjectSetupPlan.md)

Project setup plan to create.

## Returns

`void`
