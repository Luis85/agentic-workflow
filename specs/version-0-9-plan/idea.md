---
id: IDEA-V09-001
title: Version 0.9 stakeholder sparring partner plan
stage: idea
feature: version-0-9-plan
status: accepted
owner: analyst
created: 2026-05-01
updated: 2026-05-01
---

# Idea - Version 0.9 stakeholder sparring partner plan

## Problem

The Roadmap Management Track already captures stakeholders, decision owners, alignment risks, planned communications, and roadmap decisions. That creates a useful baseline, but it still leaves a gap before a human presents project state: maintainers must manually infer how each stakeholder might react, which questions they may ask, which open concerns matter to them, and how to frame the current state for their role.

Before v1.0, Specorator should make stakeholder alignment more actionable without replacing real stakeholder conversations. A roadmap agent should be able to act as a constrained sparring partner for a named stakeholder role, grounded in the stakeholder map, past communication evidence, unresolved questions, requirements, decisions, and current project or roadmap state.

## Target users

- Roadmap owners preparing stakeholder updates.
- Project managers rehearsing decision meetings.
- Product leads checking whether a status narrative fits an audience.
- Delivery teams anticipating objections, role-specific questions, and requirement trade-offs.
- Reviewers checking that generated stakeholder advice stays evidence-backed and does not impersonate a real person without limits.

## Desired outcome

v0.9 should add a stakeholder sparring workflow that:

- reads `roadmaps/<slug>/stakeholder-map.md` as the baseline source for roles, needs, stance, cadence, and alignment risks;
- uses communication logs, decision logs, open questions, linked requirements, and current roadmap/project/spec state as evidence;
- drafts likely questions, concerns, objections, and role-specific framing advice;
- can run a bounded sparring session where the agent answers as a stakeholder role while labeling assumptions and evidence;
- logs generated preparation outputs without rewriting historical stakeholder records;
- keeps humans responsible for final messaging and real stakeholder commitments.

## Constraints

- The feature must not claim to know a stakeholder's private intent beyond recorded evidence.
- It must distinguish role-based simulation from real stakeholder feedback.
- It must preserve append-only communication and decision logs.
- It must avoid committing sensitive raw conversations unless the project has explicitly approved that source material.
- It should extend the Roadmap Management Track rather than create a separate stakeholder management system.
- It must land before v1.0 as a bounded workflow addition, not a conversational memory platform.

## Open questions

- Should generated sparring outputs live in a new artifact such as `stakeholder-briefs.md`, a new `sparring-log.md`, or planned entries in `communication-log.md`?
- Which past-conversation sources are acceptable by default: committed logs only, imported transcript summaries, issue comments, PR comments, meeting notes, or all approved evidence?
- Should the first implementation be a slash command, a reusable skill, a script that assembles evidence, or a combination?
- How should the workflow handle a named person versus a generic stakeholder role?
- What labels are required when the agent is role-playing versus summarizing evidence?
