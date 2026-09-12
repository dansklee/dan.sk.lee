# Product Operating Repo

Five agentic workflows for a head of product, plus the written context that
makes their output specific rather than generic.

Built on [GitHub Agentic Workflows](https://github.github.io/gh-aw/), adapted
from [agentics-beyond-code](https://github.com/chrizbo/agentics-beyond-code) —
which demonstrates 24 workflows for a fictional team with compliance, GTM, and
launch tracking. This keeps the parts that survive contact with one person's
actual week.

## The five

| Workflow | Fires when | Produces |
|---|---|---|
| [**Intake Triage**](.github/workflows/intake-triage.md) | the `intake` label lands on an issue | One comment: verdict, RICE with its reasoning, Kano class, strategy alignment, duplicates |
| [**Assumption Surfacer**](.github/workflows/assumption-surfacer.md) | an issue is opened or edited | Up to four unchecked claims the plan rests on, each with a way to settle it |
| [**Decision Log**](.github/workflows/decision-log.md) | a transcript is pushed, and Fridays | A PR adding dated decision records to [`decisions/`](decisions/) |
| [**Red Team**](.github/workflows/red-team.md) | Wednesdays, or the `red-team` label | Two or three specific challenges to your recent decisions |
| [**Strategy Alignment**](.github/workflows/strategy-alignment.md) | Mondays | Comments on clear misalignment, plus a PR appending evidence to `context/strategy.md` |

## Why these five

They form one loop rather than five features. A request arrives and gets scored
against strategy (**Intake**). Whatever gets planned has its unchecked claims
named (**Assumptions**). What gets decided is recorded with the beliefs it
rested on (**Decision Log**). Those beliefs get attacked while changing course
is still cheap (**Red Team**). And the strategy those judgments lean on
accumulates evidence for or against itself (**Strategy Alignment**).

The last one is what keeps `context/strategy.md` from becoming a file you wrote
once: when a tradeoff has been cut against three weeks running, it says so.

Deliberately not included: weekly status rollups, compliance rubrics, GTM
content, launch readiness, calendar intelligence, process analyzers, chaos
injection, workflow health monitoring, commitment reconciliation, sample-data
generators. They're good ideas in the reference repo; most need a tracker, a
launch pipeline, or a compliance function to have anything to read. The nearest
additions if that changes are **Commitment Reconciler** (promised in a meeting
vs. actually tracked — works from transcripts alone) and **Calendar Strategy
Audit** (where your time goes vs. stated priorities — needs Google OAuth).

## How it works

Nothing here is code. Each workflow is a markdown file with YAML frontmatter —
triggers, permissions, and what it's allowed to write — plus a prompt. Two
other kinds of markdown do the real work:

**Policies** ([`.github/policies/`](.github/policies/)) are the rubrics: how a
request gets scored, what counts as a decision, how an argument should be made.

**Context** ([`context/`](context/)) is you: current bets, what reaches you,
the tradeoffs you've committed to, how you want to be argued with.

Both are read at runtime. Change the RICE thresholds in the triage policy and
the next run scores differently — no recompile, no code change. The document
*is* the configuration, which is the only version of "process as code" that
doesn't rot: a policy nobody follows is obvious the moment its output looks
wrong.

Agents only ever draft. Every workflow's output is a comment, a PR, or an
issue — something you can read and reject. None of them close, assign, merge,
or decide.

## Getting started

See [`docs/setup.md`](docs/setup.md). The short version:

```bash
gh secret set ANTHROPIC_API_KEY   # workflows run on engine: claude
./scripts/setup-labels.sh         # labels are the triggers
$EDITOR context/operating-context.md   # <- the step that matters
./scripts/compile.sh              # .md sources -> .lock.yml that Actions runs
```

The workflow `.md` files in this repo have been validated against the gh-aw
compiler, but the generated `.lock.yml` files are **not** committed — they must
be built by your own installed CLI so the pinned action versions match it.
`./scripts/compile.sh` does that in one step. Until you run it, the workflows
exist as source but won't fire.

## The context files are the product

A workflow reading an empty `context/strategy.md` produces the same bland
output you'd get from pasting your issue into any chat window. The same
workflow reading four real "even over" statements tells a requester which
tradeoff their request loses to, by name.

So the files ship as templates full of `TODO`, and the workflows refuse to fill
them in for you — triage returns **Needs Info** against the repo rather than
inventing a strategy. Thirty minutes writing these is the whole investment.

| File | What it is |
|---|---|
| [`context/operating-context.md`](context/operating-context.md) | Your bets, what reaches you, how you want to be argued with |
| [`context/strategy.md`](context/strategy.md) | "Even over" tradeoffs — strategy written so it can settle an argument |
| [`context/how-we-work.md`](context/how-we-work.md) | Cadence, where work lives, what gets written down |

## Repo layout

```
.github/
  workflows/       Five workflow sources (.md) — compile to .lock.yml
  policies/        Scoring rubrics and argument lenses, read at runtime
  ISSUE_TEMPLATE/  The intake form
context/           Your operating context — fill these in first
decisions/         Decision records, one file per decision, append-only
transcripts/       Drop meeting transcripts here to trigger the decision log
scripts/           compile.sh, setup-labels.sh
docs/setup.md      Setup, costs, troubleshooting
```

## A caution about transcripts

`transcripts/` holds verbatim records of people talking, and git history is
permanent. Don't push anything with compensation, performance, legal, or
personnel content. If this repo is public, don't push transcripts at all — the
decision log also runs on issue discussion alone.

## Also here

`nyc_doe_data_specialists.py` predates this setup — a standalone script that
queries NYC Open Data for DOE data-specialist headcount. Unrelated to the
workflows.
