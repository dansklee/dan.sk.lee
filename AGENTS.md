# Repository Guidance for Agents

This repo is a product operating system built on
[GitHub Agentic Workflows](https://github.github.io/gh-aw/). It contains almost
no code — the artifacts are markdown that both humans and agents read.

## Layout and intent

- `.github/workflows/*.md` — workflow **sources**. YAML frontmatter defines
  triggers, permissions, and safe outputs; the body is the prompt.
- `.github/workflows/*.lock.yml` — **generated**. Never edit by hand. Produced
  by `./scripts/compile.sh` (`gh aw compile`) and committed alongside the
  source.
- `.github/policies/*.md` — rubrics read at runtime by the workflows. Editing a
  policy changes behavior on the next run, with no recompile.
- `context/*.md` — the user's operating context. Read at runtime.
- `decisions/` — **append-only.** Never edit or delete an existing record. A
  reversed decision gets a new record that names the one it supersedes.
- `transcripts/` — meeting transcripts. May contain sensitive material; never
  quote from them into a public surface beyond what a policy explicitly allows.

## Working here

- After editing any workflow `.md`, run `./scripts/compile.sh` and commit the
  regenerated `.lock.yml`.
- Compilation enforces a schema. Expression interpolation in workflow bodies is
  restricted to an allowlist — `${{ github.sha }}`, for instance, is rejected;
  use `${{ github.event.after }}`.
- Workflows write only through **safe outputs** declared in frontmatter. Don't
  add direct `gh` write calls to a workflow body; declare the output instead.
- Keep workflows read-only in `permissions:`. Writes happen in the safe-output
  job, not the agent job.

## Editing policies

Policies are prose, not config. When changing one, preserve its shape: a
policy that stops being specific stops being followable, and the failure is
silent — the next run just produces vaguer output.

## What agents must not do here

- Record, quote, or summarize decisions about individual people —
  compensation, performance, hiring, org changes — anywhere in this repo.
- Fill in `TODO` placeholders in `context/` with invented content. Every
  workflow treats unfilled context as missing input and says so.
- Rewrite history in `decisions/`.
