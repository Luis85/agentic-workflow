# actions-bump-bot — operator notes

Companion to [`PROMPT.md`](./PROMPT.md).

## What it does

Keeps SHA‑pinned `uses:` references in `.github/workflows/*.{yml,yaml}` current with the latest release tag of each action. Opens one bump PR per run; escalates majors and unresolved tags as separate issues.

## Why SHA pinning, not version pinning

Tag references are mutable. SHA pins are immutable. A maliciously repointed `actions/checkout@v4` tag could exfiltrate secrets from any repo that pins by tag; a SHA pin makes that attack require a force‑push to a public repo, which would be very visible.

The trade‑off is that SHAs need bumping explicitly. This routine automates the bumping.

## What you need to provide

This routine assumes the project provides:

1. A scanner script (e.g. `scripts/bump-actions.mjs`) that walks workflow files and prints a status table. The exact implementation is project‑specific; the *contract* (status names, table shape, exit codes) is documented in the prompt.
2. A peel‑aware `resolve_action_sha` helper that handles annotated tags. Without this, naive SHA resolution silently produces unresolvable pins.
3. The `actions-bump-bot` GitHub label.
4. The verify gate.

A starter scanner is **not** included in this template — implementation details vary by language and CI host. See the prompt's "Process" section for the contract any scanner must meet.

## Outputs

- **PR:** title `chore: bump pinned action SHAs (YYYY-MM-DD)`, body = bump table + verify footer.
- **Issues** under `actions-bump-bot` label: script errors, divergent pins, unresolved pins, post‑apply verify failures.

## Setup checklist

1. Audit your workflow files: convert tag references to SHA pins with a trailing `# vX.Y.Z` comment.
2. Add the scanner script that meets the contract.
3. Create the `actions-bump-bot` label.
4. Define `ROUTINE_GH_LOGIN`.
5. Run `DRY_RUN=1` and read the stdout dump.
6. Schedule weekly (typical: Wednesday 12:00 UTC).

## Tuning

- **Cadence.** Weekly is the default. Daily is too noisy unless your repo uses many actions.
- **Major bump policy.** Default = always owner‑review. Do not loosen.
- **`no-releases` / `unresolved` policy.** Default = file a triage issue. Some teams treat `no-releases` (action publishes only tags, never releases) as expected and silence it; do that only after manual triage of a few cases.

## Cost / noise tradeoff

The lowest‑value bot until you've already done the up‑front work of converting tag pins to SHA pins. Once you have, it's trivially cheap and prevents a real supply‑chain attack class. Skip if your project uses `@v4`‑style tag references and you've made peace with that.

## See also

- [`docs/verify-gate.md`](../../../docs/verify-gate.md) — verify is the only signal that gates a bump PR.
- [GitHub's hardening guide for third‑party actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions) — background on why SHA pins.
