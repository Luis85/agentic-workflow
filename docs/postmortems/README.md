# Postmortems

Blameless incident write-ups. The `sre` agent files one within 5 working days of every Sev-1/Sev-2 incident.

## Filename convention

`YYYY-MM-DD-<short-slug>.md` — date the incident *started*, not the date the postmortem was written.

## Recommended sections

- **Summary** — one paragraph: what happened, who was affected, total user impact, duration.
- **Timeline** — UTC timestamps; what was observed and what was done at each step.
- **Root cause** — the underlying technical and process causes (often plural).
- **Contributing factors** — design choices, monitoring gaps, on-call practices that made this more likely or harder to detect.
- **Detection** — how was it noticed? Could it have been earlier? Which alerts fired (or didn't)?
- **Mitigation** — what stopped the bleeding.
- **Resolution** — what fully resolved it.
- **Lessons learned** — be specific; "communicate better" is not a lesson.
- **Action items** — each with an owner and a due date. Tracked through to completion.

## Blameless

Postmortems describe systems, processes, and decisions — not people. Replace any sentence containing a name + "should have" with one describing the system that made the failure possible.

## Linking to retrospectives

If the incident touches an active feature, the action items pull through into that feature's `specs/<slug>/retrospective.md`.

> This file is the directory's `.gitkeep` substitute — leave it in place even when no postmortems are filed yet.
