#!/usr/bin/env bash
# Compile the agentic workflow sources (.github/workflows/*.md) into the
# .lock.yml files GitHub Actions actually runs.
#
# Run this after editing any workflow .md file, and commit the .lock.yml
# output alongside it. The .md file is the source; the .lock.yml is the build.
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "error: the GitHub CLI (gh) is not installed." >&2
  echo "  https://cli.github.com/" >&2
  exit 1
fi

if ! gh aw --version >/dev/null 2>&1; then
  echo "Installing the gh-aw extension..."
  gh extension install github/gh-aw
fi

echo "Compiling workflows..."
gh aw compile "$@"

echo
echo "Done. Review the generated .lock.yml files and commit them with the .md changes."
