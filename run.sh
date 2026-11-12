#!/usr/bin/env bash
# Single gate entry point. Every arm and every CI job runs through this file.
# Usage: ./run.sh [ARM ...]   ./run.sh --list   ./run.sh report
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -x node_modules/.bin/tsx ]; then
  echo "run.sh: dependencies are missing; run 'npm ci' first" >&2
  exit 1
fi

exec ./node_modules/.bin/tsx scripts/gate.ts "$@"
