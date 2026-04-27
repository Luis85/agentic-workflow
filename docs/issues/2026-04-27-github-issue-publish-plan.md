# GitHub issue publish plan — 2026-04-27 review findings

This repo snapshot has no configured git remote and no GitHub auth token/CLI available in the environment, so issues could not be opened automatically in this run.

## Required inputs before publishing
- `OWNER/REPO` target (for example `luis85/agentic-workflow`)
- GitHub token with `repo` scope exported as `GITHUB_TOKEN`
- Either GitHub CLI (`gh`) or API access via `curl`

## Issue set to publish

1. `docs/issues/2026-04-27-001-fix-broken-relative-links-in-templates-and-skills.md`
2. `docs/issues/2026-04-27-002-fix-adr-reference-number-mismatches.md`
3. `docs/issues/2026-04-27-003-replace-hardcoded-example-link-to-nonexistent-feature-path.md`
4. `docs/issues/2026-04-27-004-align-project-initiation-doc-count-language.md`
5. `docs/issues/2026-04-27-005-reconcile-repo-version-labels-between-readme-and-spec-kit.md`
6. `docs/issues/2026-04-27-006-align-daily-review-frontmatter-with-schema.md`

## CLI command template

```bash
OWNER_REPO="<owner>/<repo>"
for f in docs/issues/2026-04-27-00*.md; do
  title=$(sed -n '1s/^# Issue: //p' "$f")
  body=$(cat "$f")
  gh issue create --repo "$OWNER_REPO" --title "$title" --body "$body" --label "review-bot"
done
```

## API command template

```bash
OWNER="<owner>"
REPO="<repo>"
for f in docs/issues/2026-04-27-00*.md; do
  title=$(sed -n '1s/^# Issue: //p' "$f" | python -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')
  body=$(python - <<'PY' "$f"
import json,sys,pathlib
print(json.dumps(pathlib.Path(sys.argv[1]).read_text()))
PY
)
  curl -sS -X POST \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${OWNER}/${REPO}/issues" \
    -d "{\"title\": ${title}, \"body\": ${body}, \"labels\": [\"review-bot\"]}"
done
```
