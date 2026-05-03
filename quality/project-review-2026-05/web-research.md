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
| GitHub artifact attestations | https://docs.github.com/en/actions/concepts/security/artifact-attestations | Benchmarked release provenance options for generated tarball assets. |
| OpenSSF Scorecard | https://github.com/ossf/scorecard | Benchmarked security-health checks, weighted scoring, and maintainer account hygiene expectations. |
| SLSA v1.0 security levels | https://slsa.dev/spec/v1.0/levels | Benchmarked release provenance and hosted build expectations. |
| npm trusted publishing | https://docs.npmjs.com/trusted-publishers | Benchmarked OIDC-based package publishing and automatic provenance for eligible public packages. |
| npm package provenance | https://docs.npmjs.com/generating-provenance-statements | Benchmarked npm provenance generation and verification expectations. |
| NIST SSDF | https://csrc.nist.gov/Projects/ssdf | Benchmarked secure-development practice groups and risk-based continuous improvement. |
| OWASP SAMM | https://owasp.org/www-project-samm/ | Benchmarked measurable software assurance maturity across governance, design, implementation, verification, and operations. |
| Diataxis | https://diataxis.fr/ | Benchmarked documentation architecture around tutorials, how-to guides, reference, and explanation. |
| ADR resources | https://adr.github.io/ | Benchmarked architecture decision record practice and decision-rationale discipline. |
| Backstage ADR guidance | https://backstage.io/docs/architecture-decisions/ | Benchmarked ADR supersession practice: records stay preserved and old records link to the superseding ADR. |
| Google Cloud ADR guidance | https://docs.cloud.google.com/architecture/architecture-decision-records | Benchmarked ADRs as a decision history that helps future troubleshooting and system evolution. |
| Google engineering practices | https://google.github.io/eng-practices/ | Benchmarked small, self-contained changes and review conventions. |

## Benchmark notes

- GitHub's secure-use guidance supports this repo's current direction: restrict `GITHUB_TOKEN`, avoid unsafe interpolation of untrusted values, and pin third-party actions to full commit SHAs.
- GitHub artifact attestations are a concrete release follow-up because this repository already produces a release tarball. Attesting that tarball can add provenance without immediately changing package registry strategy.
- OpenSSF Scorecard is already adopted. Its checks are useful as a recurring posture signal, but some recommendations, especially maintainer account controls such as 2FA, need manual evidence.
- SLSA suggests a useful next maturity step: publish or record provenance for the release package so consumers can see source version, build process, and top-level inputs.
- npm trusted publishing strengthens the case for a provenance decision, but the current package target is GitHub Packages. The review should avoid assuming npmjs.com trusted publishing applies until the registry strategy changes.
- NIST SSDF supports the repo's quality-gate and traceability model, but also highlights response practices. Dependabot alerts and dependency-review are present; a clearer vulnerability-response playbook would close the loop.
- OWASP SAMM supports the review's recommendation to manage security/process maturity as iterative, measurable improvement rather than a one-time compliance checklist.
- Diataxis validates the repo's split between tutorials, how-to, reference, and explanation. The main documentation risk is not category absence; it is making sure internal planning artifacts do not leak into first-time adopter paths.
- ADR guidance aligns with the repository's numbered ADR practice. Review should continue checking that supersession and status changes are explicit, and that proposed ADRs do not become ambiguous long-term policy.
- Google's public engineering-practices material reinforces this repo's "one concern per PR" rule. Recent same-day PR volume suggests preserving that rule while adding WIP discipline.
