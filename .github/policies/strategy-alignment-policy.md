# Strategy Alignment Policy

How the strategy alignment workflow decides what counts as evidence, and what
it's allowed to write back into `context/strategy.md`.

A strategy document written once and never revisited is a wish. This workflow's
job is to make the document accumulate evidence — so that when a tradeoff stops
matching how you actually behave, that's visible instead of quietly true.

## The bar

**Most activity is neutral. Skip it.** Routine work doesn't test a tradeoff.

Surface a signal only if someone reading it would say either "yes, that's
exactly what our strategy looks like" or "hm, that's worth a conversation." If
you have to stretch to connect the activity to a tradeoff, it's neutral.

Err heavily toward silence. A weekly report of manufactured connections trains
the reader to stop opening it.

## Classification

### Aligned
The activity is a textbook instance of a tradeoff in action. The connection is
obvious without explanation. Record it as evidence; do not comment on the issue.

### Misaligned
The activity requires the side of a tradeoff you said you'd give up. Not a
violation to be punished — a data point. Two readings are always possible:

1. The work shouldn't happen as scoped, or
2. The tradeoff no longer reflects what you actually believe.

Say which one you think it is and why, and leave room for the other.

### Tension
The activity pulls against a tradeoff without clearly contradicting it — a
recurring pattern of small exceptions. These matter more than single
misalignments: a tradeoff dies by a dozen reasonable exceptions, never by one
decision.

## Comments on issues

Comment only on **clear misalignment**, at most two issues per run. Quote the
"even over" statement verbatim, say which side the work takes, and ask the
question rather than announcing the verdict — you don't have the context the
author does.

Never comment to say something is aligned. Praise in a weekly report; don't
spend someone's notification budget on it.

## Writing back to the strategy doc

Append to the **Alignment evidence** section of `context/strategy.md` through a
pull request. Never edit the "even over" statements themselves — those are the
user's to write, and an agent rewording a strategy statement is how a strategy
quietly becomes something nobody chose.

Format each entry:

```
### Week of YYYY-MM-DD

**<Tradeoff, quoted short>**
- ✅ <aligned example> — #<issue>
- ⚠️ <misaligned example> — #<issue>, <one-line reading>

**Pattern:** <only when three or more weeks point the same way>
```

Keep the section trimmed to the last 8 weeks; move older entries under a
`<details>` block in the same PR rather than deleting them.

## Counter-evidence

When a tradeoff accumulates three or more misalignments across separate weeks,
say so directly in the PR description:

> `<tradeoff>` has been cut against N times since <date>. Either the work keeps
> being wrong or the statement is. Worth deciding which.

That sentence is the entire point of the workflow. Everything else is
bookkeeping.

## Unfilled strategy

If `context/strategy.md` still contains `TODO` placeholders, do not classify
anything and do not open a pull request. Post nothing, and note that the
strategy doc needs filling in first. Inferring a strategy from behavior and
writing it back would let the document describe what you drifted into rather
than what you chose — the exact failure this workflow exists to prevent.
