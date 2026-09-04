#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Video-Toolkit-Installer für die Steakakademie (Linux/macOS)
#
#   bash scripts/video-toolkit-setup.sh      |   npm run vt:setup
#
# Installiert https://github.com/digitalsamba/claude-code-video-toolkit (MIT)
# nach tools/video-toolkit (gitignored) und spielt das Steakakademie-Marken-
# Profil aus docs/video-toolkit/brand ein. Idempotent. Windows-Pendant:
# scripts/video-toolkit-setup.ps1. Abteilung 2 (Studio).
# ---------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${VIDEO_TOOLKIT_DIR:-$REPO_ROOT/tools/video-toolkit}"
REF="${VIDEO_TOOLKIT_REF:-main}"
UPSTREAM="https://github.com/digitalsamba/claude-code-video-toolkit.git"
BRAND_SRC="$REPO_ROOT/docs/video-toolkit/brand"

info() { printf '\033[33m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[31m[!] %s\033[0m\n' "$*"; }
ok()   { printf '\033[32m    %s\033[0m\n' "$*"; }

# --- 1. Voraussetzungen -----------------------------------------------------
info 'Prüfe Voraussetzungen'
for cmd in git node npm; do
  command -v "$cmd" >/dev/null || { warn "$cmd fehlt"; exit 1; }
done
if ! command -v uv >/dev/null; then
  info 'uv fehlt — installiere (astral.sh)'
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
  command -v uv >/dev/null || { warn 'uv nicht gefunden — Shell neu laden'; exit 1; }
fi
ok "uv $(uv --version)"
command -v ffmpeg >/dev/null || warn 'FFmpeg fehlt (optional; ohne FFmpeg kein Audio-Muxing)'

# --- 2. Quellcode -----------------------------------------------------------
if [ -d "$TARGET/.git" ]; then
  info "Aktualisiere vorhandene Installation ($TARGET)"
  git -C "$TARGET" fetch --depth 1 origin "$REF"
  git -C "$TARGET" checkout -q FETCH_HEAD
else
  info "Klone Video-Toolkit nach $TARGET"
  mkdir -p "$(dirname "$TARGET")"
  git clone --depth 1 --branch "$REF" "$UPSTREAM" "$TARGET" 2>/dev/null \
    || git clone --depth 1 "$UPSTREAM" "$TARGET"
fi

# --- 3. Python-Umgebung -----------------------------------------------------
# System-Python bevorzugen (>= 3.10), sonst lädt uv selbst eines nach.
if command -v python3 >/dev/null && python3 -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3,10) else 1)'; then
  export UV_PYTHON="$(command -v python3)"   # gilt für uv sync UND uv run
  ok "System-Python $(python3 -c 'import sys;print(".".join(map(str,sys.version_info[:3])))')"
fi
info 'uv sync --extra modal'
( cd "$TARGET" && uv sync --extra modal )

# --- 4. .env ----------------------------------------------------------------
if [ ! -f "$TARGET/.env" ]; then
  info 'Lege .env aus .env.example an (alle Schlüssel optional)'
  cp "$TARGET/.env.example" "$TARGET/.env"
else
  ok '.env vorhanden — nicht angefasst'
fi

# --- 5. Marken-Profil -------------------------------------------------------
info 'Spiele Steakakademie-Marken-Profil ein'
mkdir -p "$TARGET/brands/steakakademie"
cp -r "$BRAND_SRC"/. "$TARGET/brands/steakakademie/"
ok 'brand.json, voice.json, assets/, hoertest/'

# --- 6. Preflight -----------------------------------------------------------
info 'Preflight'
modal_set=$(grep -cE '^MODAL_[A-Z0-9_]+=.+' "$TARGET/.env" || true)
ok "Modal-Endpunkte in .env: $modal_set von 8"
grep -qE '^MODAL_QWEN3_TTS_ENDPOINT_URL=.+' "$TARGET/.env" \
  || warn 'MODAL_QWEN3_TTS_ENDPOINT_URL fehlt — ohne Stimme kein Lernvideo (docs/video-toolkit-setup.md §3)'
[ -f "$TARGET/tools/verify_setup.py" ] && ( cd "$TARGET" && uv run tools/verify_setup.py ) || true

# --- 7. Abschluss -----------------------------------------------------------
sha=$(git -C "$TARGET" rev-parse --short HEAD)
cat <<EOF

==============================================================
 Video-Toolkit installiert — Upstream $sha (MIT)
==============================================================
 Verzeichnis : $TARGET  (gitignored)
 Marke       : brands/steakakademie  (Quelle: docs/video-toolkit/brand)
 Umgebung    : .venv via uv  (uv run tools/<tool>.py)

 Regel 4 bleibt: /publish erst nach Freigabe durch Uwe.
==============================================================
EOF
