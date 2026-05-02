[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / RELEASE\_READINESS\_DIAGNOSTIC\_CODES

# Variable: RELEASE\_READINESS\_DIAGNOSTIC\_CODES

> `const` **RELEASE\_READINESS\_DIAGNOSTIC\_CODES**: `object`

Diagnostic codes emitted by [checkReleaseReadiness](../functions/checkReleaseReadiness.md).

Layer 1 codes use the `RELEASE_READINESS_*` namespace, one code per assertion
field. Layer 2 codes (fresh-surface contract) are passed through unchanged
from `RELEASE_PACKAGE_DIAGNOSTIC_CODES` in `release-package-contract.ts` so
downstream T-V05-006 can rely on a single stable namespace per assertion.

## Type Declaration

### ChangelogMissing

> `readonly` **ChangelogMissing**: `"RELEASE_READINESS_CHANGELOG_MISSING"` = `"RELEASE_READINESS_CHANGELOG_MISSING"`

### PackageJsonMissing

> `readonly` **PackageJsonMissing**: `"RELEASE_READINESS_PACKAGE_JSON_MISSING"` = `"RELEASE_READINESS_PACKAGE_JSON_MISSING"`

### PkgFiles

> `readonly` **PkgFiles**: `"RELEASE_READINESS_PKG_FILES"` = `"RELEASE_READINESS_PKG_FILES"`

### PkgName

> `readonly` **PkgName**: `"RELEASE_READINESS_PKG_NAME"` = `"RELEASE_READINESS_PKG_NAME"`

### PkgRegistry

> `readonly` **PkgRegistry**: `"RELEASE_READINESS_PKG_REGISTRY"` = `"RELEASE_READINESS_PKG_REGISTRY"`

### PkgRepository

> `readonly` **PkgRepository**: `"RELEASE_READINESS_PKG_REPOSITORY"` = `"RELEASE_READINESS_PKG_REPOSITORY"`

### Quality

> `readonly` **Quality**: `"RELEASE_READINESS_QUALITY"` = `"RELEASE_READINESS_QUALITY"`

### ReleaseNotesMissing

> `readonly` **ReleaseNotesMissing**: `"RELEASE_READINESS_RELEASE_YML_MISSING"` = `"RELEASE_READINESS_RELEASE_YML_MISSING"`

### ReleaseNotesShape

> `readonly` **ReleaseNotesShape**: `"RELEASE_READINESS_RELEASE_YML_SHAPE"` = `"RELEASE_READINESS_RELEASE_YML_SHAPE"`

### TagMissing

> `readonly` **TagMissing**: `"RELEASE_READINESS_TAG_MISSING"` = `"RELEASE_READINESS_TAG_MISSING"`

### TagNotAtMain

> `readonly` **TagNotAtMain**: `"RELEASE_READINESS_TAG_NOT_AT_MAIN"` = `"RELEASE_READINESS_TAG_NOT_AT_MAIN"`

### Version

> `readonly` **Version**: `"RELEASE_READINESS_VERSION_MISMATCH"` = `"RELEASE_READINESS_VERSION_MISMATCH"`

### WorkflowMissing

> `readonly` **WorkflowMissing**: `"RELEASE_READINESS_WORKFLOW_MISSING"` = `"RELEASE_READINESS_WORKFLOW_MISSING"`

### WorkflowPermissions

> `readonly` **WorkflowPermissions**: `"RELEASE_READINESS_WORKFLOW_PERMISSIONS"` = `"RELEASE_READINESS_WORKFLOW_PERMISSIONS"`
