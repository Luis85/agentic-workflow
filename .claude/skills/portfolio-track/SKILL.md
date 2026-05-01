---
name: portfolio-track
description: Detect + drive portfolio cycle (X 6-monthly, Y monthly, Z daily) per P5 Express. Triggers "portfolio review", "portfolio cycle". /portfolio:x|y|z.
argument-hint: [portfolio-slug or "list"]
---

# Portfolio Track

You are the conductor of the P5 Express portfolio management cadence defined in `docs/portfolio-track.md`. Your job is to **detect the right cycle, confirm with the user, and dispatch** — never to do the cycle work yourself. The `/portfolio:*` commands spawn the `portfolio-manager` subagent; you only read state, ask, and hand off.

`AskUserQuestion` only works in the main thread. Do all clarification here, before dispatching.

## Read first

- `docs/portfolio-track.md` — full methodology and cycle descriptions.
- `memory/constitution.md` — governing principles.

---

## Step 1 — Detect portfolio(s)

Scan for `portfolio/*/portfolio-state.md` files. For each found, read its YAML frontmatter and extract:
- `portfolio` (slug)
- `status` (`active | paused | done`)
- `last_x`, `last_y`, `last_z` (ISO dates or null)

If `$ARGUMENTS` is `"list"`, print the table below and exit (do not dispatch any cycle):

```
Portfolio           Status    last_x        last_y        last_z
<slug>              active    <date|never>  <date|never>  <date|never>
```

If **no** `portfolio/` directory exists, output:
> No portfolio found. Run `/portfolio:start <slug>` to bootstrap one, then come back here.

Exit without dispatching.

---

## Step 2 — Pick a portfolio (if multiple active)

If more than one portfolio has `status: active`, use `AskUserQuestion` to ask which one to manage.
If only one active portfolio exists, select it automatically and note it to the user.
If the slug was provided as `$ARGUMENTS` and it matches an existing portfolio, use it directly.

---

## Step 3 — Recommend the due cycle

Calculate days since each cycle was last run (use today's date from `# currentDate` in context, or ask if unavailable):

| Condition | Recommendation |
|---|---|
| `last_x` is null or ≥ 180 days ago | `/portfolio:x` — 6-monthly strategic review due |
| `last_y` is null or ≥ 30 days ago | `/portfolio:y` — monthly tactical review due |
| Neither of the above | `/portfolio:z` — daily operations check |

When multiple cycles are overdue, recommend the highest-cadence one first (X > Y > Z), but note the others.

Present the recommendation plus all three as selectable alternatives. Use a single `AskUserQuestion`:

> "Portfolio `<slug>` — recommended cycle: **<X/Y/Z>** (<reason>).
> Options: X (6-monthly strategy) · Y (monthly review) · Z (daily ops) · Cancel"

---

## Step 4 — Dispatch

Run the selected `/portfolio:<x|y|z>` command with the portfolio slug as argument. Hand off fully — do not duplicate the `portfolio-manager` agent's work.

---

## Step 5 — Gate and report

After the command completes, read `portfolio/<slug>/portfolio-state.md` and print a status block:

```
Portfolio: <slug>
Cycle just run: <X|Y|Z> — <date>
Next X due: <date or "within 6 months">
Next Y due: <date or "within 30 days">
Next Z due: tomorrow
Attention items: <from cycle output, or "none">
```

Then ask (single `AskUserQuestion`): "Run another cycle now, or done for today?"

---

## Constraints

- Never run a cycle without user confirmation — always gate through `AskUserQuestion`.
- Never edit portfolio artifacts directly — the `/portfolio:*` commands own those files.
- Never modify `specs/` artifacts — portfolio track is read-only on the Specorator side.
- Never recommend skipping the Portfolio Sponsor review for stop/start decisions — surface them as "Decisions required from Sponsor" and stop.
- If `portfolio-definition.md` is missing, stop and tell the user to run `/portfolio:start` first.

## References

- `docs/portfolio-track.md` — full methodology.
- `docs/sink.md` — artifact locations.
- `memory/constitution.md` — governing principles (especially Article VII — Human Oversight).
