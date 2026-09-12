# How We Work

Where things get decided, written down, and closed out. The decision-log
workflow uses this to know which meetings produce decisions worth recording,
and the intake workflow uses it to know what a well-formed request looks like.

> Replace the TODOs. Everything here should describe what actually happens,
> not what you wish happened — the agents take it literally.

## Cadence

| When | What | Produces |
|---|---|---|
| TODO | e.g. Monday leadership sync | Decisions on cross-team tradeoffs |
| TODO | e.g. Weekly product review | Go/no-go on in-flight work |
| TODO | e.g. Biweekly roadmap review | Sequencing changes |

## Where work actually lives

This repo is the durable memory layer, not the tracker. Day-to-day work lives
elsewhere; what lands here is what needs to outlive a thread.

- **Discussion happens in:** Slack — TODO: which channels
- **Documents live in:** TODO — Google Docs / Notion folder
- **Tracking happens in:** TODO — or "nowhere formal", which is a valid answer
- **Decisions land in:** `decisions/` in this repo, one file per decision
- **Requests land in:** GitHub Issues in this repo, via the intake template

## What gets written down

A decision gets a record in `decisions/` when it meets the bar in
[`.github/policies/decision-record-policy.md`](../.github/policies/decision-record-policy.md).
Everything else stays in the thread where it happened.

## Meeting transcripts

Drop `.txt` or `.vtt` transcripts into `transcripts/`. Pushing one triggers the
decision-log workflow, which proposes decision records as a pull request for
you to accept, edit, or reject.

Naming convention: `YYYY-MM-DD-meeting-name.vtt`

**Before you push:** transcripts are verbatim records of people talking. Don't
commit anything with compensation, performance, legal, or personnel content,
and remember that this repo's history is permanent. If the repo is public, do
not push transcripts at all.

## Intake

Anything asking for product work goes through the intake template. The triage
workflow scores it and routes it. The point is not bureaucracy — it's that
"can you just look at this?" in a Slack DM has no memory, and this does.

To capture a Slack request: open a new issue with the **Product Intake**
template and paste the thread (with a permalink) into the context field. See
[`docs/setup.md`](../docs/setup.md) for the optional Slack-reaction shortcut.

## Escalation

TODO — what makes something urgent, who to wake up, and what "urgent" costs.
