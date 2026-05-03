# Graph Report - graphify-integration  (2026-05-03)

## Corpus Check
- 92 files · ~462,647 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 491 nodes · 1176 edges · 19 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 96 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c8879e4b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `readText()` - 43 edges
2. `relativeToRoot()` - 27 edges
3. `extractFrontmatter()` - 25 edges
4. `parseSimpleYaml()` - 24 edges
5. `walkFiles()` - 23 edges
6. `failIfErrors()` - 21 edges
7. `readWorkflowMetric()` - 17 edges
8. `tasksForChangedFiles()` - 16 edges
9. `stubifyDoc()` - 14 edges
10. `checkReleaseReadiness()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `taskNames()` --calls--> `tasksForChangedFiles()`  [INFERRED]
  tests/scripts/changed-checks.test.ts → scripts/lib/changed-checks.ts
- `run()` --calls--> `checkReleaseReadiness()`  [INFERRED]
  tests/scripts/release-readiness.test.ts → scripts/lib/release-readiness.ts
- `diagnose()` --calls--> `specStateDiagnosticsForText()`  [INFERRED]
  tests/scripts/spec-state.test.ts → scripts/lib/spec-state.ts
- `diagnose()` --calls--> `traceabilityDiagnosticsForFeature()`  [INFERRED]
  tests/scripts/traceability.test.ts → scripts/lib/traceability.ts
- `workflowStateFiles()` --calls--> `walkFiles()`  [INFERRED]
  scripts/check-traceability.ts → scripts/lib/repo.ts

## Communities (21 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (50): addLinks(), assessMaturity(), average(), collectEarsCoverage(), collectQualityMetrics(), collectRequirementIds(), collectRtmLinks(), collectTestIds() (+42 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (27): buildReleaseArchive(), classifyFileForArchive(), checkDocsAreStubs(), checkIntakeFoldersEmpty(), checkNoNumberedAdrs(), checkReleasePackageContents(), parseReleasePackageArgs(), walkDirectory() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (26): add(), changedCheckPlan(), changedFiles(), isAdrSurface(), isAgentSurface(), isAutomationRegistrySurface(), isContentSurface(), isGeneratedOrCommandSurface() (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (20): getAdrs(), normalizeStatus(), renderAdrIndex(), getCommands(), renderCommandInventory(), wrapCommands(), markdownBasenames(), publicSurfaceDiagnostics() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (30): collectRoadmapDigest(), collectRoadmapEvidence(), compactSections(), diagnostic(), digestSectionsForDocument(), escapeRegExp(), evidenceKind(), firstHeading() (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (24): checkResult(), escapeAnnotationData(), escapeAnnotationProperty(), formatDiagnostic(), formatGitHubAnnotation(), normalizeDiagnostic(), wantsJson(), collectAnchors() (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (7): branchReadinessCheck(), dependencyReadinessCheck(), workflowReadinessChecks(), worktreeHygieneCheck(), commandInvocation(), mergedLocalBranches(), run()

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (21): extractFrontmatter(), addDefinition(), collectDocumentDefinition(), collectHeadingDefinitions(), collectTableDefinitions(), definitionTableKinds(), escapeRegExp(), idsIn() (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (22): hasPlaceholderSegment(), isConcretePathReference(), isDocumentedExampleReference(), isOptionalLegacyReference(), lineContextAt(), lineNumberAt(), listFiles(), normalizeInlinePathCandidate() (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (13): checkChangelog(), checkPackageMetadata(), checkQualitySignals(), checkReleaseNotesConfig(), checkReleaseReadiness(), checkRepoImmutableSetting(), checkTagOnMainHistory(), checkVersionAlignment() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.2
Nodes (18): applyGitHubProjectSetupPlan(), buildGitHubProjectSetupPlan(), dedupeLabels(), issue(), issueKeyFor(), listExistingIssueKeys(), listExistingMilestoneTitles(), p3() (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (13): discoverAutomationRegistryEntries(), discoveredOperationalAgentEntry(), discoveredPackageScriptEntry(), discoveredPackageScriptId(), discoveredSkillEntry(), discoveredWorkflowEntry(), listedFiles(), loadAutomationRegistry() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (16): escapeRegExp(), examplesCoverageDiagnostics(), extractSectionBody(), isDoneArtifactStatus(), parseStageProgressTable(), specStateDiagnosticsForText(), validateArtifactMap(), validateCurrentStageArtifact() (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (14): fixListItemWikilinkLine(), fixObsidianFrontmatter(), fixObsidianFrontmatterBlock(), fixScalarWikilinkLine(), hasBareWikilink(), isWordChar(), isYamlQuoteBoundary(), obsidianDiagnostic() (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.3
Nodes (10): frontmatterDiagnostic(), futureDateDiagnostics(), requiredKeyDiagnostics(), utcDateKey(), requireFrontmatter(), validateAdr(), validateDailyReview(), validateReadme() (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.42
Nodes (7): gitTrackedFiles(), obsidianAssetDiagnostic(), obsidianAssetDiagnostics(), obsidianBaseDiagnosticsForFile(), obsidianCanvasDiagnosticsForFile(), obsidianTrackedStateDiagnostics(), repositoryRelativePath()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (4): graphifyArgs(), runGraphifyWrapper(), failed(), withError()

### Community 17 - "Community 17"
Cohesion: 0.32
Nodes (3): checkLocalReferences(), getAttributeValues(), requireIndexMarkup()

### Community 18 - "Community 18"
Cohesion: 0.43
Nodes (6): addReadmeFrontmatter(), descriptionForGeneratedReadme(), stripFrontmatter(), titleFromMarkdown(), toPosix(), walkMarkdownFiles()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `readText()` connect `Community 3` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 17`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `extractFrontmatter()` connect `Community 7` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 8`, `Community 12`, `Community 13`, `Community 14`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `parseSimpleYaml()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 7`, `Community 8`, `Community 12`, `Community 14`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `readText()` (e.g. with `compareGeneratedDocs()` and `addReadmeFrontmatter()`) actually correct?**
  _`readText()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `relativeToRoot()` (e.g. with `exampleSubdirsMissingWorkflowState()` and `listFiles()`) actually correct?**
  _`relativeToRoot()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `extractFrontmatter()` (e.g. with `validateLifecycleAgents()` and `validateSkills()`) actually correct?**
  _`extractFrontmatter()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `parseSimpleYaml()` (e.g. with `validateLifecycleAgents()` and `validateSkills()`) actually correct?**
  _`parseSimpleYaml()` has 11 INFERRED edges - model-reasoned connections that need verification._