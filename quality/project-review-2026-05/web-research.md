---
id: PRV-PRJ-WEB-001
title: Agentic workflow — web research baseline
status: complete
created: 2026-05-04
inputs:
  - quality/project-review-2026-05/review-plan.md
---

# Web research baseline — agentic-workflow

This review used external sources as benchmarks, not as automatic requirements.

## Sources consulted

| Source | URL | Review use |
|---|---|---|
| GitHub Actions secure use reference | https://docs.github.com/en/actions/reference/security/secure-use | Benchmarked workflow permissions, secret handling, script-injection mitigation, and full-length SHA action pinning. |
| OpenSSF Scorecard | https://github.com/ossf/scorecard | Benchmarked security-health checks, weighted scoring, and maintainer account hygiene expectations. |
| SLSA v1.0 security levels | https://slsa.dev/spec/v1.0/levels | Benchmarked release provenance and hosted build expectations. |
| NIST SSDF | https://csrc.nist.gov/Projects/ssdf | Benchmarked secure-development practice groups and risk-based continuous improvement. |
| Diataxis | https://diataxis.fr/ | Benchmarked documentation architecture around tutorials, how-to guides, reference, and explanation. |
| ADR resources | https://adr.github.io/ | Benchmarked architecture decision record practice and decision-rationale discipline. |
| Google engineering practices | https://google.github.io/eng-practices/ | Benchmarked small, self-contained changes and review conventions. |

## Benchmark notes

- GitHub's secure-use guidance supports this repo's current direction: restrict `GITHUB_TOKEN`, avoid unsafe interpolation of untrusted values, and pin third-party actions to full commit SHAs.
- OpenSSF Scorecard is already adopted. Its checks are useful as a recurring posture signal, but some recommendations, especially maintainer account controls such as 2FA, need manual evidence.
- SLSA suggests a useful next maturity step: publish or record provenance for the release package so consumers can see source version, build process, and top-level inputs.
- NIST SSDF supports the repo's quality-gate and traceability model, but also highlights response practices. Dependabot alerts and dependency-review are present; a clearer vulnerability-response playbook would close the loop.
- Diataxis validates the repo's split between tutorials, how-to, reference, and explanation. The main documentation risk is not category absence; it is making sure internal planning artifacts do not leak into first-time adopter paths.
- ADR guidance aligns with the repository's numbered ADR practice. Review should continue checking that supersession and status changes are explicit.
- Google's public engineering-practices material reinforces this repo's "one concern per PR" rule. Recent same-day PR volume suggests preserving that rule while adding WIP discipline.
