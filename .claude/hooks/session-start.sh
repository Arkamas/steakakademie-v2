#!/bin/bash
# SessionStart-Hook: installiert Dependencies, damit Lint, Typecheck und Tests
# in Claude Code on the web sofort lauffaehig sind.
set -euo pipefail

# Nur in der Remote-/Web-Umgebung ausfuehren (lokal nichts tun).
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# npm install (nicht ci) — nutzt den gecachten Container-State optimal; idempotent.
npm install --no-audit --no-fund
