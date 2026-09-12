# Transcripts

Drop meeting transcripts here as `.txt` or `.vtt`. Pushing one triggers the
[decision log](../.github/workflows/decision-log.md), which reads it, extracts
decisions that meet [the policy bar](../.github/policies/decision-record-policy.md),
and opens a pull request proposing records for `decisions/`.

Naming: `YYYY-MM-DD-meeting-name.vtt`

## Before you push anything here

Git history is permanent, and a transcript is a verbatim record of people
talking without editing themselves.

- **Never** push transcripts containing compensation, performance reviews,
  hiring or exit discussions, legal advice, or anything about a specific
  person's standing.
- If this repo is public, don't push transcripts at all. The decision log still
  works from issue discussion alone.
- Deleting a file later does not remove it from history.

The decision-log workflow is instructed to skip decisions about people, but
that only governs what it *writes* — it doesn't unpublish what you committed.
