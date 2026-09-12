#!/usr/bin/env bash
# Create the labels the workflows rely on. Safe to re-run — existing labels
# are updated rather than duplicated.
#
# Usage: ./scripts/setup-labels.sh [owner/repo]
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

create() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$REPO" --search "$name" --json name -q '.[].name' | grep -qx "$name"; then
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "  updated  $name"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "  created  $name"
  fi
}

echo "Labels for $REPO:"

# Triggers — applying these starts a workflow
create "intake"            "0e8a16" "New product request; starts intake triage"
create "red-team"          "b60205" "Ask the red team to challenge this decision"

# Triage results
create "triaged"           "c5def5" "Intake triage has run"
create "needs-info"        "fbca04" "Incomplete request; missing problem, evidence, or cost of inaction"
create "duplicate"         "cfd3d7" "Same underlying problem as an existing issue"

# Routing verdicts
create "verdict:take"      "0e8a16" "On the roadmap conversation"
create "verdict:team"      "1d76db" "Routed to the owning PM; no escalation needed"
create "verdict:defer"     "fbca04" "Real, not now; revival condition named in the triage comment"
create "verdict:decline"   "b60205" "Not doing this; reason in the triage comment"

# Strategy alignment
create "strategy:aligned"     "0e8a16" "Advances a stated 'even over' tradeoff"
create "strategy:neutral"     "c5def5" "Touches nothing in the strategy"
create "strategy:misaligned"  "d93f0b" "Requires the side of a tradeoff we said we'd give up"

# Workflow outputs
create "assumptions-surfaced" "c5def5" "Assumption surfacer has commented; won't re-post"
create "red-team-report"   "5319e7" "Red team challenge output"

echo "Done."
