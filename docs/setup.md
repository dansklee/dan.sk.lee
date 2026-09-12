# Setup

Roughly 30 minutes, most of it spent filling in the context files — which is
the part that determines whether the output is worth reading.

## 0. Prerequisites

- A GitHub repo (this one) with **Actions enabled**
- The [GitHub CLI](https://cli.github.com/) authenticated: `gh auth login`
- An [Anthropic API key](https://console.anthropic.com/) — workflows run on
  `engine: claude`

## 1. Add the API key as a repo secret

```bash
gh secret set ANTHROPIC_API_KEY
```

Without this, every run fails immediately at the engine step. Note that
subscription OAuth tokens (`CLAUDE_CODE_OAUTH_TOKEN`) are **not** supported by
gh-aw — it needs an API key.

## 2. Create the labels

```bash
./scripts/setup-labels.sh
```

Labels aren't cosmetic here: applying `intake` is what triggers triage, and
applying `red-team` is what triggers a challenge. `assumptions-surfaced` is how
the assumption surfacer remembers not to comment twice on the same issue. The
workflows won't fire — or will repeat themselves — without them.

## 3. Fill in the context files

This is the step that matters. Everything else is plumbing.

| File | What it drives | Bare minimum to be useful |
|---|---|---|
| [`context/operating-context.md`](../context/operating-context.md) | Every workflow | Current bets, the "What reaches you" table, decision style |
| [`context/strategy.md`](../context/strategy.md) | Triage and red team | Three or four "even over" statements |
| [`context/how-we-work.md`](../context/how-we-work.md) | Decision log | Which meetings produce decisions |

The workflows detect unfilled `TODO` markers and refuse to invent answers —
triage will return **Needs Info** against the repo rather than guess at your
strategy. That's deliberate: a confident verdict derived from a placeholder is
worse than no verdict.

Start with `operating-context.md`. If you only fill in one thing, make it the
**Current bets** and **What reaches you** sections.

## 4. Compile the workflows

The `.md` files in `.github/workflows/` are the source. GitHub Actions runs the
`.lock.yml` files compiled from them.

```bash
./scripts/compile.sh
```

This installs the `gh-aw` extension if needed and generates one `.lock.yml` per
workflow. **Commit the generated files** — they're the build output Actions
executes.

Re-run it after every edit to a workflow `.md`. Editing policies or context
files needs no recompile; those are read at runtime, which is the whole point
of keeping process in markdown.

## 5. First run

Try the cheapest one first:

```bash
gh workflow run "Intake Triage" -f issue_number=<an existing issue>
```

Or file a real request through the **Product Intake** template and watch triage
comment on it.

Check what it cost:

```bash
gh aw logs
```

## Costs

Each run is one agent session. Rough expectations at current pricing:

| Workflow | Frequency | Per run |
|---|---|---|
| Intake Triage | per request | cents |
| Assumption Surfacer | per issue opened or edited | cents — the most frequent, the cheapest |
| Decision Log | per transcript push + Friday | cents to low dollars, scales with transcript length |
| Red Team | Wednesdays | cents to low dollars |
| Strategy Alignment | Mondays | low dollars — reads a week of activity |

The dominant cost is transcript length. If you push hour-long meetings daily,
watch `gh aw logs` for the first couple of weeks before assuming it's cheap.

Each workflow sets `timeout-minutes` as a backstop. To cap spend explicitly,
add `max-ai-credits:` to a workflow's frontmatter and recompile.

## Optional: capture from Slack

The intake template has a **Source context** field for pasting a thread and its
permalink. That covers the common case with zero setup.

If you want a real Slack shortcut — react with an emoji, get an intake issue —
that needs a Slack app with Events API access and a dispatcher workflow. The
[reference repo](https://github.com/chrizbo/agentics-beyond-code) implements
this in `slack-reaction-intake.md`; it's a genuine integration project, not a
config change. Worth doing once the core three workflows have earned their keep.

## Troubleshooting

**A workflow didn't fire.** Check the label exists and was applied *after* the
`.lock.yml` was committed. Label-triggered workflows only exist once compiled.

**Triage says my strategy is unknown.** `context/strategy.md` still has `TODO`
markers. Working as designed.

**Runs fail at the engine step.** `ANTHROPIC_API_KEY` is missing, expired, or
out of credit.

**The decision log opens an empty PR.** It shouldn't — it no-ops when nothing
clears the bar. If it does, the transcript scope detection failed; run it with
`workflow_dispatch` to use the 7-day window instead of the push diff.

**Everything compiles but nothing runs on schedule.** GitHub disables scheduled
workflows in repos with no activity for 60 days. Push something.
