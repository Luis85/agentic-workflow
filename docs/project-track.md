# Project Manager Track — P3.Express-Based Methodology

**Version:** 0.1 · **Status:** Draft · **Opt-in:** Yes — skip if delivering internal product work without contract boundaries

A lightweight project governance layer that wraps Spec Kit feature deliveries when the team works in a **service-provider context** (delivering for clients). Based on [P3.Express](https://p3.express/) by Nader K. Rad and Frank Turley (Creative Commons licence, freely available at https://p3.express/manual/v2/).

For teams of 1–7 people, the **micro.P3.Express** variant applies automatically — it uses a weekly rather than monthly cadence and collapses the monthly B/E groups into the weekly rhythm. See §5 for details.

---

## Table of contents

1. [When to use this track](#1-when-to-use-this-track)
2. [Relationship to the Spec Kit and Discovery Track](#2-relationship-to-the-spec-kit-and-discovery-track)
3. [Directory layout](#3-directory-layout)
4. [Project lifecycle and state machine](#4-project-lifecycle-and-state-machine)
5. [P3.Express process map](#5-p3express-process-map)
6. [Processes and commands](#6-processes-and-commands)
7. [The four management documents](#7-the-four-management-documents)
8. [The project-manager agent](#8-the-project-manager-agent)
9. [Method library](#9-method-library)
10. [Quality gates](#10-quality-gates)
11. [Usage guidelines](#11-usage-guidelines)

---

## 1. When to use this track

Run the Project Manager Track when **any** of these conditions apply:

- You are delivering software **to a client** under a contract or statement of work.
- You need to track **scope, schedule, and budget** across multiple features or sprints.
- You have **external stakeholders** who need regular status reports.
- You need **formal change control** — client requests become logged change items before work begins.
- You need a **project closure document** for sign-off, invoicing, or handover.

**Skip it when:**
- You are building an internal product where a product owner manages priorities informally.
- Stakeholders have direct access to the backlog and do not need synthesised reports.
- There is no contract boundary — the discovery + spec tracks cover the work.

---

## 2. Relationship to the Spec Kit and Discovery Track

```
              ┌─────────────────────────────────────────────────────┐
              │              PROJECT MANAGER TRACK                   │
              │  projects/<slug>/                                    │
              │  Project Description · Deliverables Map ·           │
              │  Follow-Up Register · Health Register · weekly-log  │
              │                              (project-manager agent) │
              └──────────────────┬──────────────────────────────────┘
                                 │ links to (never rewrites)
          ┌──────────────────────┴──────────────────────────┐
          │                                                 │
  ┌───────▼──────────────┐                  ┌──────────────▼──────────────┐
  │   DISCOVERY TRACK    │                  │   SPEC KIT (Stages 1–11)    │
  │   discovery/<slug>/  │──chosen brief──▶ │   specs/<slug>/             │
  │   Frame→...→Handoff  │                  │   Idea→Research→...→Retro   │
  └──────────────────────┘                  └─────────────────────────────┘
```

- The **project-manager** operates at the project envelope: scope, stakeholders, budget, risk/issue/change, periodic reporting.
- Feature work is still built via the Spec Kit. The PM links to feature folders but never edits their artifacts.
- Discovery sprints are still run via the Discovery Track. The PM logs them in the deliverables map as project phases.
- The PM does **not replace** the `pm` agent (Stage 3) — that agent produces feature requirements. The project manager produces project governance documents.

---

## 3. Directory layout

```
projects/
└── <project-slug>/
    ├── project-state.md          # state machine (owned by /project:* commands)
    ├── project-description.md    # P3 Doc 1: scope, objectives, stakeholders, budget
    ├── deliverables-map.md       # P3 Doc 2: WBS, milestones, schedule, feature links
    ├── followup-register.md      # P3 Doc 3: risks + issues + changes + lessons (one register)
    ├── health-register.md        # P3 Doc 4: satisfaction scores, peer reviews, governance
    ├── weekly-log.md             # periodic C-group entries (append-only)
    ├── status-report.md          # client-facing RAG snapshot (replaced each /project:report run)
    └── project-closure.md        # Group F: handover, satisfaction, lessons, archive
```

Feature folders (`specs/`) and discovery folders (`discovery/`) remain at the repo root. The PM references them by relative path in `deliverables-map.md`; it never writes to them.

---

## 4. Project lifecycle and state machine

```
              ┌─────────────┐
/project:start│  scaffolded │
              └──────┬──────┘
                     │ /project:initiate
              ┌──────▼──────┐
              │  initiating │  project-description + deliverables-map + followup-register
              └──────┬──────┘
                     │ go/no-go: human sponsor approves (A08)
              ┌──────▼──────┐
              │  executing  │◀─────────────────────────────────────┐
              └──────┬──────┘                                      │
  /project:weekly    │  (recurring — every week)                   │
  /project:report    │  (on demand)                                │
  changes/issues ────┤  (on demand → followup-register)            │
                     │                                             │
              ┌──────▼──────┐                                      │
              │  closing    │  project-closure.md drafted          │
              └──────┬──────┘                                      │
                     │ client sign-off (human)                     │
              ┌──────▼──────┐
              │   closed    │
              └─────────────┘
                     │ (post-project, months later)
              ┌──────▼──────┐
              │ post-project│  /project:post — benefit evaluation
              └─────────────┘
```

`project-state.md` records: current phase, linked feature folders, sponsor name, go/no-go history, and open blocking items.

---

## 5. P3.Express process map

P3.Express organises all management work into 33 activities across 7 groups (A–G). This track implements the **micro.P3.Express** variant, which suits teams of 1–7 people by using a weekly rather than monthly cadence.

| Group | When | Key activities | Track command |
|---|---|---|---|
| **A — Initiation** | Once, at project start | Appoint roles (A01–03); describe project (A04); plan deliverables (A05); identify risks (A06); peer review (A07); go/no-go (A08); kickoff (A09); focused comms (A10) | `/project:initiate` |
| **C — Weekly management** | Every week during executing | Measure & report (C01); plan responses for deviations (C02); weekly kickoff (C03); focused comms (C04) | `/project:weekly` |
| **D — Daily management** | Any working day | Manage follow-up items (D01); accept completed deliverables (D02) | inline in `/project:weekly`; `/project:report` auto-picks up D02 via spec workflow-state |
| **E — Periodic closure** | End of each period (monthly in full P3; end-of-sprint in micro) | Stakeholder satisfaction (E01); lessons + improvement planning (E02); focused comms (E03) | `/project:weekly` with end-of-period flag |
| **F — Project closure** | Once, at engagement end | Hand over product (F01); final satisfaction (F02); peer review (F03); archive (F04); celebrate (F05); focused comms (F06) | `/project:close` |
| **G — Post-project** | Every 3–6 months, up to 5 years after closure | Evaluate benefits realised (G01); capture new ideas (G02); focused comms (G03) | `/project:post` |

The monthly B-group activities (plan revision, monthly go/no-go) are rolled into the weekly cadence in micro.P3.Express — see `/project:weekly` below.

**Focused communication** (A10, C04, E03, F06, G03) is not a soft skill appendage in P3.Express — it is a named, recurring activity. The PM agent produces a focused comms note at every major transition. The audience and channel are defined in `project-description.md` (stakeholder section).

---

## 6. Processes and commands

### `/project:start <slug>` — Bootstrap

Scaffolds `projects/<slug>/` and initialises `project-state.md`. The slug names the **client or engagement**, not the solution.

Good slugs: `acme-portal-2026`, `coastal-insurance-migration`, `blue-labs-q3`.
Bad slugs: `new-website`, `redesign`, `the-big-project`.

**Outputs:** `projects/<slug>/project-state.md`

---

### `/project:initiate` — Group A: Project Initiation

Produces the three founding documents and gates on human approval (A08).

**Procedure:**
1. Facilitate role-appointment check: confirm sponsor name and PM are recorded.
2. Draft `project-description.md` from the client brief / statement of work (A04). Sections: purpose + expected benefits, expected cost and duration, in-scope and out-of-scope, requirements and quality expectations, stakeholder list with interest–influence mapping.
3. Draft `deliverables-map.md` — hierarchy of deliverables (nouns, not tasks), with dependency sketch, acceptance criteria, and links to planned `specs/` folders (A05).
4. Seed `followup-register.md` with initial risks from the project constraints (A06).
5. Self-check using the peer review lens (A07): are scope boundaries clear? Is every major risk captured? Does the deliverables map cover the full contracted scope?
6. Present summary to the human for go/no-go (A08). Record decision in `project-state.md`.
7. If approved: update `project-state.md` to `executing`. Draft a focused-comms note for the project kickoff (A09, A10) — append to `weekly-log.md`.

**Outputs:** `project-description.md`, `deliverables-map.md`, `followup-register.md` (initial), `health-register.md` (seeded)
**Gate:** human sets `initiation_status: approved` in `project-state.md`.

---

### `/project:weekly` — Groups C + D: Weekly Review

Appends a dated entry to `weekly-log.md`. Run once per week during `executing`.

**Procedure:**
1. Read all linked `specs/<slug>/workflow-state.md` files. Summarise feature progress (D02 — accept or flag incomplete deliverables).
2. Check `followup-register.md` for open risks, issues, and changes. Update statuses. Flag any item that has escalated or passed its response deadline (D01).
3. Check schedule against `deliverables-map.md`. Calculate whether milestones are on track (C01). Compute a RAG status for schedule, scope, and budget.
4. For any Amber or Red item, draft a response plan entry in `followup-register.md` (C02).
5. Write the weekly entry in `weekly-log.md` (C03, C04): date, RAG summary, feature status table, open follow-up items, next-week focus, focused-comms note for stakeholders.
6. At end-of-period (sprint boundary or monthly): append E01 satisfaction prompt note and E02 lessons note to `weekly-log.md`.

**Outputs:** one appended entry in `weekly-log.md`; updates to `followup-register.md` and `health-register.md` (E01 satisfaction notes).

---

### `/project:report` — Status Report (on demand)

Produces a client-facing `status-report.md`. Unlike `weekly-log.md` (internal), the status report is synthesised for the client. **Replaces** the prior version on each run.

**Format:** project header, RAG traffic lights (schedule / scope / budget), milestone table (planned vs. actual), summary of open risks and issues, change requests in flight, next-milestone ETA, PM commentary.

**Outputs:** `status-report.md` (overwritten)

---

### `/project:close` — Group F: Project Closure

Produces the project closure document when the engagement is complete (or formally cancelled).

**Procedure:**
1. Confirm all deliverables have been accepted (D02 history in `weekly-log.md`).
2. Hand-over section: what was delivered, what was out-of-scope, any known defects or follow-on work (F01).
3. Final satisfaction scores: surface E01 history; add a final satisfaction note for the human to send to the client (F02).
4. Peer-review self-check: are all follow-up items closed or formally carried forward? (F03)
5. Archive pointer: note where final documents, code repos, and client communications are stored (F04).
6. Lessons summary: aggregate lessons from all `/project:weekly` E02 entries (F04 addendum).
7. Focused-comms note: closure announcement template (F06).

**Outputs:** `project-closure.md`
**Gate:** human sets `closure_status: accepted` in `project-state.md`.

---

### `/project:post` — Group G: Post-Project Evaluation (lazy)

Run 3–6 months after closure, and optionally repeated annually for up to 5 years. Evaluates whether the expected benefits described in `project-description.md` were actually realised.

**Outputs:** one appended entry in `project-closure.md` (benefits evaluation section).

---

## 7. The four management documents

P3.Express is deliberately minimal: **four documents** cover everything a project manager needs. The repo maps each to a markdown file.

### 7.1 Project Description (`project-description.md`)

The living charter. Created in `/project:initiate` (A04) and updated throughout the project when scope or budget changes are approved.

Sections:
- **Purpose and expected benefits** — why this project exists and what value it will deliver.
- **Expected cost and duration** — indicative budget and timeline. Not a contract; a baseline.
- **Scope** — in-scope (explicit list of deliverables) and out-of-scope (explicit exclusions). Vague scope is a defect.
- **Requirements and quality expectations** — key quality bars the deliverables must meet (links to `specs/<slug>/requirements.md` where applicable).
- **Stakeholders** — list with role, interest, influence rating, and communication preference. The interest–influence matrix is the analytical tool (see §9.1).

The document is **never frozen**. Changes go through the follow-up register; approved changes are incorporated here with a dated change note.

---

### 7.2 Deliverables Map (`deliverables-map.md`)

The combined WBS and schedule. Created in `/project:initiate` (A05), refined weekly or monthly.

Structure:
- Hierarchical list of deliverables expressed as **nouns** (products), not verbs (tasks).
- Each deliverable: description, acceptance criteria, dependencies, feature folder link (`specs/<slug>/`), and target milestone.
- Schedule view: milestones with target dates, baseline vs. actual.
- Rolling-wave refinement: only the current sprint's items need full breakdown; future items can remain high-level.

---

### 7.3 Follow-Up Register (`followup-register.md`)

**One register for all uncertain items.** Risks, issues, change requests, and lessons all live here. This is the key P3.Express design choice: no routing friction between "is this a risk or an issue?"

Each entry:
- `type`: `risk | issue | change-request | lesson`
- `description`: what it is
- `cause`: root cause or trigger
- `consequence`: what happens if unmanaged
- `impact`: H/M/L
- `response`: planned action
- `custodian`: owner (name or role)
- `status`: `open | in-progress | closed`
- `dates`: raised, target resolution, resolved

The register is updated in every `/project:weekly` run (D01). Lessons from period closures are also added here (E02).

---

### 7.4 Health Register (`health-register.md`)

Governance and satisfaction tracking. Updated at each period closure and at project start/end.

Sections:
- **Peer reviews** — self-check notes from A07, B02 equivalent, F03: what was reviewed, findings, actions taken.
- **Satisfaction scores** — end-of-period satisfaction ratings (from E01), kept anonymous and aggregated.
- **Improvement actions** — actions generated from E02 lessons sessions, with owner and status.

---

## 8. The project-manager agent

`.claude/agents/project-manager.md`

**Tools:** Read, Edit, Write, WebSearch, WebFetch
**Model:** sonnet

The `project-manager` agent shadows a human project manager in a service-provider context.

**It operates at the project level** — cross-feature, cross-sprint, cross-team.

**It owns** all artifacts under `projects/<slug>/`.

**It links to but never edits** `specs/`, `discovery/`, or `.claude/`.

**It uses WebSearch/WebFetch** for client-side research: public company information, market data, technology comparisons, and publicly available client references.

**It does not:**
- Write requirements (that is the `pm` agent at Stage 3).
- Design architecture (that is the `architect` agent at Stage 4–5).
- Make scope or budget decisions — it surfaces issues and defers to the human sponsor.
- Approve change requests — it documents, assesses impact, and escalates.

---

## 9. Method library

### 9.1 Stakeholder mapping: Interest–Influence matrix

Stakeholders in `project-description.md` are rated on a 2×2 grid:

|  | Low interest | High interest |
|---|---|---|
| **High influence** | Keep satisfied | Manage closely |
| **Low influence** | Monitor | Keep informed |

Communication frequency and format derive from the quadrant:
- **Manage closely**: include in major decisions; weekly touchpoint.
- **Keep satisfied**: brief regularly; escalate before decisions affect them.
- **Keep informed**: good feedback source; include in reviews and demos.
- **Monitor**: newsletter-level comms; no input required on decisions.

### 9.2 Follow-up item assessment: four fields

Every new item in the follow-up register is assessed on four fields before it is actionable:
1. **Impact** (H/M/L) — consequence if unmanaged.
2. **Response** — avoid / mitigate / transfer / accept (risks) or escalate / fix / defer / accept (issues) or approve / reject / defer (changes).
3. **Custodian** — the named person responsible for driving to resolution.
4. **Target date** — when the response must be actioned or re-evaluated.

### 9.3 Status report: RAG traffic lights

Three dimensions rated Red / Amber / Green:

| Dimension | Green | Amber | Red |
|---|---|---|---|
| **Schedule** | On track | ≤2 weeks slippage | >2 weeks slippage or milestone at risk |
| **Scope** | Within agreed scope | Minor additions under review | Unapproved scope change in flight |
| **Budget** | Within 5% variance | 5–15% variance | >15% variance or forecast overrun |

### 9.4 Go/no-go gate: decision brief

At A08 and at each period renewal (B03 equivalent), the PM prepares a one-page decision brief for the human sponsor:
- Current RAG status (schedule / scope / budget).
- Top 3 risks and their mitigation status.
- Upcoming milestone and whether the team has capacity to hit it.
- Recommendation: continue / pause / close.

The agent surfaces the brief; the human makes the call.

---

## 10. Quality gates

| Gate | Condition | Who checks |
|---|---|---|
| Initiation go/no-go | Human sets `initiation_status: approved` in `project-state.md` | Human sponsor |
| Weekly log quality | Entry has: date, RAG, feature status, follow-up review, next-week focus | `project-manager` self-check |
| Follow-up item completeness | All four fields populated before item is tracked | `project-manager` self-check |
| Status report accuracy | RAG status derived from actual `workflow-state.md` reads, not invented | `project-manager` self-check |
| Closure acceptance | Human sets `closure_status: accepted`; all open follow-up items closed or formally carried forward | Human sponsor |

---

## 11. Usage guidelines

### Starting a new engagement

```
1. /project:start <engagement-slug>
2. /project:initiate          # produces project-description + deliverables-map + followup-register
                               # → awaits human go/no-go
3. (kick off feature work via /spec:start and /discovery:start as normal)
4. /project:weekly             # every week during executing
5. /project:report             # when a client status update is due (on demand)
6. /project:close              # at engagement end → awaits human sign-off
7. /project:post               # 3–6 months later to evaluate benefits
```

### Linking features to the project

In `deliverables-map.md`, reference feature folders:

```markdown
| Deliverable | Spec folder | Milestone | Status |
|---|---|---|---|
| Authentication module | [specs/auth-redesign](../../specs/auth-redesign/workflow-state.md) | M1 — 2026-05-15 | In progress |
```

The `project-manager` reads `workflow-state.md` from each linked spec to report feature status in `/project:weekly`. It never writes to those files.

### When the client brief is the project input

Go directly to `/project:start` → `/project:initiate`. You do not need to run the Discovery Track unless the engagement explicitly includes an ideation or discovery phase. If it does, run `/discovery:start` and link the sprint from `deliverables-map.md`.

### P3.Express references

- Manual v2: https://p3.express/manual/v2/
- micro.P3.Express: https://micro.p3.express/
- NUPP (underlying principles): https://nupp.guide/
- ADR-0006: [`docs/adr/0006-add-project-manager-track.md`](adr/0006-add-project-manager-track.md)
