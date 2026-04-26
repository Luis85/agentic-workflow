# Operations Steering

> **Replace this whole file** with your operational reality.

## Environments

| Env | Purpose | URL | Data | Access |
|---|---|---|---|---|
| dev | local development | — | synthetic | engineers |
| staging | pre-prod validation | … | scrubbed prod | engineers + QA |
| prod | live | … | live | release managers |

## Release cadence

- Cadence: continuous / weekly / scheduled.
- Release window: …
- Freeze windows: …
- Approver: …

## Deployment

- Pipeline: …
- Artifact: …
- Strategy: rolling / blue-green / canary.
- Migration policy: backward-compatible always; multi-step for breaking schema.
- Feature flags: tool, naming convention, default state.

## Rollback

- Default rollback path: redeploy previous artifact tag.
- Database rollback: forward-only migrations; never `DROP` without an approved ADR + recovery plan.
- Communication during rollback: who, where, in what tone.

## Observability

- Logs: …
- Metrics: …
- Traces: …
- Dashboards: …
- Alerts: SLOs and paging rules per service.

## SLOs (defaults)

- Availability: …
- Latency p95: …
- Error budget burn policy: …

## Incident response

- On-call rota: …
- Severity definitions: see `docs/playbooks/incident.md` (when present).
- Postmortem: blameless, due within 5 working days, lives in `docs/postmortems/`.

## Compliance & data handling

- PII classification & handling: …
- Backup and retention: …
- Audit logging: what's logged, where, retention period.

## Cost guardrails

- Monthly budget per environment: …
- Anomaly alerting threshold: …

## Things agents commonly get wrong here

- (List as you discover them.)
