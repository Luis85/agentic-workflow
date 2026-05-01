[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/automation-registry](../README.md) / discoverAutomationRegistryEntries

# Function: discoverAutomationRegistryEntries()

> **discoverAutomationRegistryEntries**(`registry`, `root?`): [`AutomationRegistryDiscovery`](../type-aliases/AutomationRegistryDiscovery.md)

Discover registry entries for automation surfaces that are not yet registered.

The returned entries are intentionally incomplete: their `purpose` values
contain TODO markers that `validateAutomationRegistry` rejects. This makes
the output useful as a scaffold without allowing generated placeholders to
become accepted registry annotations.

## Parameters

### registry

[`AutomationRegistry`](../type-aliases/AutomationRegistry.md)

Parsed automation registry.

### root?

`string` = `repoRoot`

Repository root.

## Returns

[`AutomationRegistryDiscovery`](../type-aliases/AutomationRegistryDiscovery.md)

Missing registry entry candidates.
