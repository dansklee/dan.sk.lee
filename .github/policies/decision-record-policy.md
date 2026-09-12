# Decision Record Policy

What counts as a decision, and what a record of one looks like. The decision-log
workflow follows this file when reading transcripts and issue threads.

The value of a decision log is not the record. It's that six weeks later, when
someone asks "why are we doing it this way?", the answer exists and includes
what you *didn't* know at the time.

## What counts as a decision

Record it when **all three** hold:

1. **A choice was made between real alternatives.** If there was only one
   option, that's a fact, not a decision.
2. **It closes something.** The group stops debating and starts acting.
3. **Reversing it would cost something.** Time, credibility, rework, or a
   commitment made to someone outside the room.

## What does not count

- Status updates, however definitive ("the API is done")
- Restating an existing decision
- One person's opinion that nobody responded to
- Scheduling and logistics
- Agreement to think about something — that's a deferral; record it only if a
  date was attached
- Decisions about individual people — never, regardless of the above

When a transcript is ambiguous about whether a group actually agreed, prefer to
record nothing over recording a decision that wasn't made. A false record is
worse than a missing one: people cite it.

## Confidence

Every proposed record carries one, and it determines the tone of the record:

- **Explicit** — someone said the decision out loud and nobody objected. Quote it.
- **Implied** — the group acted as if decided without stating it. Record it, say
  it was implied, and flag it for confirmation. These are the valuable ones: an
  unstated decision is one nobody can revisit.
- **Uncertain** — plausibly a decision. Don't write a record; note it in the PR
  description and let a human call it.

## Door type

Every record states which kind of door it went through:

- **Two-way** — reversible at low cost. Should have been made fast. If the
  record shows weeks of deliberation on a two-way door, say so; that's a
  process finding worth surfacing.
- **One-way** — expensive or impossible to reverse: public commitments, data
  models, pricing, anything with a migration. These deserve scrutiny, and they
  are what the red-team workflow prioritizes.

## Record format

One file per decision: `decisions/YYYY-MM-DD-short-slug.md`

```markdown
# <Decision stated as the choice made, not the topic discussed>

- **Date:** YYYY-MM-DD
- **Source:** <transcript filename, or issue #N, with a quote or link>
- **Confidence:** Explicit | Implied
- **Door:** Two-way | One-way
- **Deciders:** <names present for the call, or "not identifiable from source">

## Decision

One paragraph. What was chosen, stated so someone outside the room understands
it without context.

## Alternatives considered

What else was on the table and why it lost. If the source doesn't say, write
"not captured in source" — that gap is itself worth seeing.

## What we believed at the time

The assumptions this rests on. This is the section that earns the log its keep:
it is what you check when the decision starts looking wrong. Be specific about
what was assumed rather than known.

## What would make us revisit

The observable signal that should reopen this. A metric moving, a date
arriving, a customer behaving differently. "If it doesn't work out" is not a
signal.
```

## Titles

Title the choice, not the subject. "Use Postgres for the events pipeline" — not
"Events pipeline discussion". A log of topics is an index; a log of choices is
a memory.

## Delivery

Proposed records arrive as a pull request, never committed directly. The PR
description lists each proposed record with its source and confidence, plus
anything the run judged **Uncertain**. Review is the point: a decision log
nobody edits is a decision log nobody trusts.
