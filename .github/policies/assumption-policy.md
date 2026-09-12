# Assumption Policy

What counts as an assumption worth naming, and how to name it. The assumption
surfacer follows this file.

An assumption is a claim the plan depends on that nobody has checked. Naming it
costs a sentence; discovering it was wrong costs a quarter. But surfacing
everything trains people to skim past the comment, so the bar matters more than
the coverage.

## Categories

### Timeline and effort
"Straightforward", "should be quick", "we just need to". Dates stated without
capacity behind them. Implied sequencing — "after X ships, we'll do Y" —
where nothing guarantees X ships.

### User and customer
"Users will…", "customers expect…", "nobody uses…". Assumed adoption. Needs
inferred from one loud account. The tell is a plural noun with no number
attached.

### Evidence provenance
A claim whose source is a sales conversation, an executive opinion, or a
competitor's behavior, presented with the confidence of measurement. Not
whether the claim is true — whether anyone checked.

### Dependency and coordination
"Team X will have this by…", "once the platform supports…". Handoffs nobody
confirmed. Alignment asserted rather than agreed.

### Scope and blast radius
"This won't affect…", "out of scope" without rationale. Implied completeness —
"we just need the API" — where the work only pays off with the rest of it.

### Strategy fit
The plan assumes a tradeoff in `context/strategy.md` still holds, or quietly
assumes the opposite. Both are worth saying out loud.

## Not assumptions

Do not surface:

- Facts with a source attached, even a thin one — the source is checkable, so
  the work is done
- Explicitly labeled hypotheses ("we believe X, we'll test it by Y") — already
  doing the thing this workflow exists to prompt
- Conventions documented in `context/how-we-work.md`
- Anything whose being wrong wouldn't change the plan
- Style, naming, and tooling preferences
- Things nobody could check anyway

If an issue contains no assumption that clears the bar, say nothing. Most
issues won't, and that's the normal case.

## How to phrase one

Each surfaced assumption is a question addressed to whoever can answer it, not
an accusation. Three parts:

1. **Quote the text** that carries the assumption.
2. **Name what it assumes** in one sentence.
3. **Ask what would settle it** — something checkable this week, not a
   research project.

Bad: "Have we validated user demand?"
Good: "'Admins will configure this themselves' — that assumes they'll find the
settings page without prompting. Do we know how many admins opened it last
quarter?"

The second one can be answered with a query. That's the difference.

## Load limit

At most **four** assumptions per issue. If there are more, pick the four whose
being wrong would cost the most, and say that you're only listing the top ones.
A list of twelve reads as noise and gets skipped entirely, which costs you the
one that mattered.

## Output format

```
**Assumptions worth checking**

1. **<what it assumes>**
   > <quoted text>
   <Why it matters in one line.> **Settles it:** <the checkable thing>

2. ...

<If any assumption touches a tradeoff in context/strategy.md, add one line
naming it.>
```

Then apply the `assumptions-surfaced` label so the workflow doesn't re-post on
the next edit.

## Tone

Curious, not prosecutorial. The author usually knows the answer and forgot to
write it down — a good comment gets it into the issue where the next person
can see it.
