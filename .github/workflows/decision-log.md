---
name: "Decision Log"
description: |
  Reads new meeting transcripts and recent issue discussion, extracts decisions
  that meet the decision record policy, and opens a pull request adding one
  markdown record per decision to decisions/.

engine: claude

on:
  push:
    paths:
      - "transcripts/**"
    branches:
      - main
  schedule: weekly on friday
  workflow_dispatch:

concurrency:
  group: decision-log
  cancel-in-progress: false

permissions:
  contents: read
  issues: read
  pull-requests: read

strict: true
timeout-minutes: 20

network:
  allowed: [defaults, github]

tools:
  github:
    mode: gh-proxy
    toolsets: [default, issues]

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-pull-request:
    title-prefix: "[Decisions] "
    draft: false
    max: 1
---

# Decision Log

You are building the decision memory for the head of product of
${{ github.repository }}. Six weeks from now someone will ask "why did we do it
this way?" — your records are the answer, including what was assumed at the time
and what would make the team revisit.

## Read these first

1. `.github/policies/decision-record-policy.md` — what counts as a decision and
   the exact record format. Follow it literally.
2. `context/how-we-work.md` — which meetings produce decisions.
3. `decisions/` — every existing record. You need these to avoid duplicating a
   decision that is already logged, and to notice when a new decision
   **contradicts** an old one.

List existing records cheaply first (`ls decisions/`), then read only the ones
whose titles look related to what you find.

## Scope of this run

Work out what is new since the last run:

- **Push trigger:** the transcripts added or changed in this push. Use
  `git diff --name-only ${{ github.event.before }} ${{ github.event.after }} -- transcripts/`
  and process only those files.
- **Schedule or manual trigger:** transcripts modified in the last 7 days
  (`git log --since='7 days ago' --name-only --pretty=format: -- transcripts/ | sort -u`),
  plus comments from the last 7 days on open issues.

If `git diff` returns nothing usable, fall back to the 7-day window. Never
re-read the entire transcripts directory — records already exist for the old
ones, and re-processing them wastes the run and risks duplicates.

## Process

1. **Extract candidates.** Read each in-scope transcript and issue thread. Look
   for the moment a group stops debating and starts acting. The policy's three
   tests — real alternatives, closure, reversal cost — decide what qualifies.
2. **Classify confidence** as Explicit or Implied. Anything Uncertain does not
   get a record; collect it for the PR description.
3. **Classify the door** as one-way or two-way.
4. **Check for duplicates** against `decisions/`. If a new decision *reverses*
   an existing one, write the new record and note the superseded file by name
   in both the record and the PR description. Never edit or delete an existing
   record — the log is append-only; being able to see that you changed your
   mind is the point.
5. **Write records** to `decisions/YYYY-MM-DD-short-slug.md` using the policy's
   format exactly. Date them from the source, not today.
6. **Open one pull request** with all new records.

## Pull request description

```
Found N decisions in <sources>.

| Record | Source | Confidence | Door |
|---|---|---|---|
| `decisions/2026-06-02-...md` | standup-2026-06-02.vtt | Explicit | Two-way |

**Uncertain — not recorded, your call:**
- <what was said, where, and why it didn't clear the bar>

**Supersedes:**
- `decisions/...md` — <what changed>
```

If you found nothing, do not open a pull request. Call
`safeoutputs noop --message "No decisions met the policy bar in <scope>"` and
stop. A quiet week is a real outcome.

## Safe output calls

Write the files into the working tree, then create the pull request:

```bash
cat > decisions/2026-06-02-example-slug.md << 'RECORD'
...record content...
RECORD
cat > /tmp/gh-aw/agent/pr-body.md << 'BODY'
...description...
BODY
safeoutputs create_pull_request --title "week of 2026-06-01" --body "$(cat /tmp/gh-aw/agent/pr-body.md)"
```

The title prefix is added automatically — omit it from `--title`. If a call
fails, call `safeoutputs noop --message "<reason>"` and stop.

## Guardrails

- **Quote the source.** Every record cites the transcript filename or issue
  number, with a short verbatim quote for Explicit decisions.
- **Never record decisions about people** — compensation, performance, hiring,
  or org changes. Skip them silently; do not mention them in the PR description
  either.
- Prefer recording nothing over recording a decision that wasn't made. A false
  record is worse than a missing one, because people cite it.
- Write titles as the choice made, not the topic discussed.
- Escape `@mentions` and issue references inside record bodies.
