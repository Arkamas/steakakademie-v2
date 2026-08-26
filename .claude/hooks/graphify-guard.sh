#!/bin/bash
# PreToolUse-Hook: reicht Such- und Lesezugriffe an `graphify hook-guard` weiter,
# damit Claude Code vor Grep/Read zuerst den Wissensgraphen befragt.
#
# WARUM ES DAS GIBT:
# `graphify claude install` schreibt einen absoluten Pfad in settings.json
# (z. B. C:/Users/<user>/.local/bin/graphify.EXE). Der existiert auf keinem
# anderen Rechner — und da settings.json versioniert ist, bekaeme jeder Klon
# einen Hook, der ins Leere zeigt. Dieses Skript sucht graphify stattdessen
# zur Laufzeit.
#
# WICHTIG: Ein fehlendes graphify darf NIEMALS Bash, Grep, Read oder Glob
# blockieren. Ist es nicht installiert, endet der Hook still mit 0.
#
# Aufruf: graphify-guard.sh <mode>   (mode: search | read)

# Kein `set -e`: ein fehlschlagender Hook soll das Werkzeug nicht abbrechen.
set -uo pipefail

MODE="${1:-search}"

find_graphify() {
  # 1. Regulaer auf dem PATH (uv tool / pipx legen ~/.local/bin dort ab).
  if command -v graphify >/dev/null 2>&1; then
    command -v graphify
    return 0
  fi

  # 2. Fallback: uebliche Installationsorte direkt pruefen, falls der Hook
  #    in einer Umgebung mit reduziertem PATH laeuft.
  local cand
  for cand in \
    "$HOME/.local/bin/graphify" \
    "$HOME/.local/bin/graphify.exe" \
    "$HOME/.local/bin/graphify.EXE"
  do
    if [ -x "$cand" ]; then
      printf '%s\n' "$cand"
      return 0
    fi
  done

  return 1
}

BIN="$(find_graphify)" || exit 0   # nicht installiert -> still ueberspringen

# exec reicht stdin (das Hook-JSON) und den Exit-Code unveraendert durch.
exec "$BIN" hook-guard "$MODE"
