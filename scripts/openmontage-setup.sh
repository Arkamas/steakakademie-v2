#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# OpenMontage-Installer für die Steakakademie (Linux/macOS)
#
#   npm run video:setup
#
# Idempotent: erneutes Ausführen aktualisiert die Installation, statt sie zu
# duplizieren. Installiert nach tools/openmontage/ — das Verzeichnis ist
# gitignored, weil OpenMontage unter AGPLv3 steht und nicht in dieses Repo
# vendored werden soll (siehe docs/openmontage-integration.md).
#
# Env-Variablen:
#   OPENMONTAGE_REF   Branch/Tag/Commit (Default: main)
#   OPENMONTAGE_DIR   Zielverzeichnis   (Default: <repo>/tools/openmontage)
# ---------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${OPENMONTAGE_DIR:-$REPO_ROOT/tools/openmontage}"
REF="${OPENMONTAGE_REF:-main}"
UPSTREAM="https://github.com/calesthio/OpenMontage.git"

info() { printf '\033[1;33m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;31m[!]\033[0m %s\n' "$1"; }

# --- 1. Voraussetzungen -----------------------------------------------------
info "Prüfe Voraussetzungen"
missing=0
for cmd in git python3 node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    warn "$cmd fehlt — bitte installieren."
    missing=1
  fi
done
[ "$missing" -eq 1 ] && exit 1

python3 -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3,10) else 1)' || {
  warn "OpenMontage braucht Python >= 3.10 (gefunden: $(python3 -V 2>&1))."
  exit 1
}

if ! command -v ffmpeg >/dev/null 2>&1; then
  warn "FFmpeg fehlt — ohne FFmpeg kann nichts gerendert werden."
  warn "  Linux: sudo apt install ffmpeg   |   macOS: brew install ffmpeg"
  exit 1
fi

printf '    Python %s | Node %s | FFmpeg %s\n' \
  "$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))')" \
  "$(node -v)" \
  "$(ffmpeg -version 2>/dev/null | head -1 | awk '{print $3}')"

# --- 2. Quellcode holen/aktualisieren ---------------------------------------
if [ -d "$TARGET/.git" ]; then
  info "Aktualisiere vorhandene Installation ($TARGET)"
  git -C "$TARGET" fetch --depth 1 origin "$REF"
  git -C "$TARGET" checkout -q FETCH_HEAD
else
  info "Klone OpenMontage nach $TARGET (~160 MB)"
  mkdir -p "$(dirname "$TARGET")"
  git clone --depth 1 --branch "$REF" "$UPSTREAM" "$TARGET" 2>/dev/null \
    || git clone --depth 1 "$UPSTREAM" "$TARGET"
fi

# --- 3. OpenMontage-Setup (venv, pip, Remotion, Piper, .env) ----------------
info "Führe OpenMontage-Setup aus (venv + pip + Remotion npm — dauert einige Minuten)"
if command -v make >/dev/null 2>&1; then
  ( cd "$TARGET" && make setup )
else
  warn "make nicht gefunden — Fallback auf manuelles Setup"
  ( cd "$TARGET" \
    && python3 -m venv .venv \
    && .venv/bin/python -m pip install --upgrade pip \
    && .venv/bin/python -m pip install -r requirements.txt \
    && .venv/bin/python -m pip install piper-tts \
    && ( cd remotion-composer && npm install ) \
    && { [ -f .env ] || cp .env.example .env; } )
fi

# --- 4. Steakakademie-Layer einspielen --------------------------------------
info "Spiele Steakakademie-Marken-Layer ein"
mkdir -p "$TARGET/styles"
cp "$REPO_ROOT/docs/openmontage/steakakademie.style.yaml" "$TARGET/styles/steakakademie.yaml"
cp "$REPO_ROOT/docs/openmontage/steakakademie-brief.md"    "$TARGET/STEAKAKADEMIE-BRIEF.md"
printf '    styles/steakakademie.yaml + STEAKAKADEMIE-BRIEF.md geschrieben\n'

# Playbook gegen das OpenMontage-Schema validieren — ein kaputtes Playbook
# soll hier auffallen, nicht erst mitten in einer Produktion.
info "Validiere Style-Playbook gegen das OpenMontage-Schema"
( cd "$TARGET" && .venv/bin/python -c "
import json, sys, yaml, jsonschema
schema = json.load(open('schemas/styles/playbook.schema.json', encoding='utf-8'))
data = yaml.safe_load(open('styles/steakakademie.yaml', encoding='utf-8'))
try:
    jsonschema.validate(data, schema)
except jsonschema.ValidationError as e:
    print('    UNGUELTIG: %s -> %s' % ('/'.join(map(str, e.absolute_path)), e.message))
    sys.exit(1)
print('    Playbook \'%s\' gueltig' % data['identity']['name'])
" )

# --- 5. Free-TTS-Kontrolle --------------------------------------------------
# Piper liefert die kostenlose Offline-Stimme, landet aber als Binary in
# .venv/bin. Ohne aktives venv findet OpenMontage es nicht und meldet
# "tts 0/7". Deshalb hier explizit prüfen und den Hinweis ausgeben.
if [ -x "$TARGET/.venv/bin/piper" ]; then
  info "Piper (Free-TTS) vorhanden — venv muss beim Arbeiten aktiv sein"
else
  warn "Piper (Free-TTS) fehlt — Narration braucht dann einen kostenpflichtigen Provider."
fi

# --- 6. Abschluss -----------------------------------------------------------
SHA="$(git -C "$TARGET" rev-parse --short HEAD)"
cat <<EOF

==============================================================
 OpenMontage installiert — Commit $SHA
==============================================================
 Verzeichnis : $TARGET  (gitignored, AGPLv3)
 Playbook    : styles/steakakademie.yaml
 Briefing    : STEAKAKADEMIE-BRIEF.md   <- Pflichtlektüre für Agenten

 Nächste Schritte:
   npm run video:check     Tool-Verfügbarkeit prüfen (Preflight)
   npm run video:board     Backlot-Produktionsboard starten

 WICHTIG beim Arbeiten in $TARGET:
   source .venv/bin/activate
   Ohne aktives venv fehlt Piper auf dem PATH und die kostenlose
   Narration wird als "nicht verfügbar" gemeldet.

 Kostenlose Keys (empfohlen, kosten nichts) in tools/openmontage/.env:
   PEXELS_API_KEY   https://www.pexels.com/api/
   PIXABAY_API_KEY  https://pixabay.com/api/docs/
   Ohne sie steht kein Stock-Bild-/Footage-Material zur Verfügung.

 Regel 4 bleibt: Agenten liefern Entwürfe, Uwe gibt frei.
==============================================================
EOF
