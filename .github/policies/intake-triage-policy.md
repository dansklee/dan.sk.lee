# Intake Triage Policy

How incoming requests get scored and routed. The triage workflow follows this
file literally — change the file, change the behavior on the next run.

The goal is not to score things precisely. It is to make the reasoning visible
so a bad score is easy to argue with, and to stop unformed requests from
consuming attention before they're worth it.

## Step 0 — Completeness gate

Run this before scoring. An incomplete request cannot be scored honestly, and
scoring it anyway produces false confidence.

A request is **complete** when all four are present:

1. **A named user and their problem** — not a feature name. "Enterprise admins
   can't tell which seats are unused" is a problem. "Add a seat report" is a
   solution wearing a problem's clothes.
2. **Evidence** — how many, how often, how they cope today. One anecdote is
   evidence of one; say so.
3. **What happens if we do nothing** — the cost of inaction, stated.
4. **A requester who will answer follow-ups** — a name, not a channel.

If any are missing: verdict is **Needs Info**. Say exactly which of the four is
missing and what would satisfy it. Do not score. Do not guess.

Exception: if the request is clearly outside strategy regardless of the missing
detail, go straight to **Decline** — sending someone off to gather evidence for
something you will decline anyway is a waste of their week.

## Step 1 — RICE

Score each factor. Show the number *and* the sentence justifying it. An
unjustified number is noise.

| Factor | Scale | How to judge |
|---|---|---|
| **Reach** | users affected per quarter | Count from evidence given. If the request has no volume estimate, use the lowest defensible number and say so. |
| **Impact** | 3 massive · 2 high · 1 medium · 0.5 low · 0.25 minimal | Impact **on a current bet in `context/operating-context.md`**. Impact on something we aren't betting on is not impact — it's 0.25 at best. |
| **Confidence** | 100% · 80% · 50% · 20% | 100% only with quantitative evidence. One customer asking is 20%. Sales certainty is not evidence. |
| **Effort** | person-months, best guess | If engineering hasn't sized it, estimate a range and mark it unsized. Never let a missing estimate silently become a small one. |

**RICE = (Reach × Impact × Confidence) / Effort**

Report the score to one decimal and state which input is doing the most work.
Most RICE scores are dominated by a single guess; naming it is more useful than
the score.

## Step 2 — Kano

Classify what this request *is*, because it changes what "good" means:

- **Basic** — its absence causes anger; its presence earns nothing. Ship it
  quietly and move on. Under-investing here is expensive, over-investing is
  invisible.
- **Performance** — more is linearly better. Legitimate place for incremental
  investment.
- **Delight** — absence costs nothing, presence differentiates. Only worth it
  when basics are solid.
- **Indifferent** — someone wants it; no user behavior would change. The most
  common honest answer for inbound feature requests.
- **Reverse** — some users actively don't want this. Flag loudly.

## Step 3 — Strategy alignment

Check the request against every "even over" statement in `context/strategy.md`.

| Verdict | Meaning |
|---|---|
| **Aligned** | Advances the chosen side of at least one tradeoff. Name it. |
| **Neutral** | Touches nothing in the strategy. Common, not damning. |
| **Misaligned** | Requires the side we said we'd give up. Quote the statement. |

A high RICE score on a misaligned request is not a reason to do it. It is a
reason to ask whether the strategy is wrong — which is a separate, deliberate
conversation, not something to resolve inside a triage comment.

## Step 4 — Duplicate check

Search open issues for the same underlying problem, not the same words. Two
requests asking for different features to solve one problem are duplicates of
that problem. Link what you find; don't close anything automatically.

## Step 5 — Routing verdict

Use the "What reaches you" table in `context/operating-context.md`. Exactly one:

| Verdict | When | What happens |
|---|---|---|
| **Take** | Aligned, RICE competitive with current bets, complete | Goes on the roadmap conversation |
| **Team** | Reversible and inside one owned surface | Route to the owning PM; don't escalate |
| **Defer** | Real but not now | Name the condition that would revive it — a date or a signal, never "later" |
| **Decline** | Misaligned, or Indifferent with low reach | Say why in one sentence the requester can repeat to their stakeholder |
| **Needs Info** | Failed the completeness gate | Name the missing element |

## Output format

Post one comment. Lead with the verdict — the requester should get the answer
without scrolling.

```
**Verdict: <Take | Team | Defer | Decline | Needs Info>** — <one sentence why>

**RICE: <score>** · Reach <n> · Impact <n> · Confidence <n>% · Effort <n> pm
<the sentence justifying whichever input dominates the score>

**Kano:** <class> — <one line>

**Strategy:** <Aligned | Neutral | Misaligned> — <which "even over", quoted>

**Related:** #<n> <title> — <why it's related>, or "none found"

**If we do nothing:** <restate the stated cost, or note it wasn't given>
```

## Tone

Write to the requester, not about them. They took the time to file this.
A decline should tell them something true they didn't know, and should be
quotable to whoever asked them to file it.

Never soften a verdict into ambiguity. "Interesting, let's discuss" is how
requests become zombies.
