# ---------------------------------------------------------------------------
# Video-Toolkit-Installer für die Steakakademie (Windows PowerShell)
#
#   powershell -ExecutionPolicy Bypass -File scripts\video-toolkit-setup.ps1
#   npm run vt:setup:win
#
# Installiert https://github.com/digitalsamba/claude-code-video-toolkit (MIT)
# nach tools\video-toolkit (gitignored) und spielt das Steakakademie-Marken-
# Profil aus docs\video-toolkit\brand ein. Idempotent: mehrfach ausführbar,
# aktualisiert Upstream und Marken-Profil, lässt .env unangetastet.
#
# Abteilung 2 (Studio). Doku: docs/video-toolkit-setup.md
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Target   = if ($env:VIDEO_TOOLKIT_DIR) { $env:VIDEO_TOOLKIT_DIR } else { Join-Path $RepoRoot 'tools\video-toolkit' }
$Ref      = if ($env:VIDEO_TOOLKIT_REF) { $env:VIDEO_TOOLKIT_REF } else { 'main' }
$Upstream = 'https://github.com/digitalsamba/claude-code-video-toolkit.git'
$BrandSrc = Join-Path $RepoRoot 'docs\video-toolkit\brand'
# Alter Standort (26.08.2026, außerhalb des Repos) - .env wird von dort migriert.
$LegacyDir = 'C:\Dev\claude-code-video-toolkit'

function Info($m) { Write-Host "==> $m" -ForegroundColor Yellow }
function Warn($m) { Write-Host "[!] $m" -ForegroundColor Red }
function Ok($m)   { Write-Host "    $m" -ForegroundColor Green }

# --- 1. Voraussetzungen -----------------------------------------------------
Info 'Prüfe Voraussetzungen'
foreach ($cmd in @('git', 'node', 'npm')) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Warn "$cmd fehlt - bitte installieren."; exit 1
  }
}
$nodeMajor = [int]((node -v) -replace '^v(\d+).*', '$1')
if ($nodeMajor -lt 18) { Warn "Node.js >= 18 nötig (gefunden: $(node -v))."; exit 1 }

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Info 'uv fehlt - installiere (offizieller Installer von astral.sh)'
  powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
  $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
  if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Warn 'uv konnte nicht gefunden werden. Terminal neu öffnen und Skript erneut starten.'; exit 1
  }
}
Ok "uv $(uv --version)"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Warn 'FFmpeg fehlt (optional, aber ohne FFmpeg kein Audio-Muxing).'
  Warn '  Installieren mit:  winget install Gyan.FFmpeg'
}

# --- 2. Quellcode holen/aktualisieren ---------------------------------------
if (Test-Path (Join-Path $Target '.git')) {
  Info "Aktualisiere vorhandene Installation ($Target)"
  git -C $Target fetch --depth 1 origin $Ref
  git -C $Target checkout -q FETCH_HEAD
} else {
  Info "Klone Video-Toolkit nach $Target"
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Target) | Out-Null
  git clone --depth 1 --branch $Ref $Upstream $Target
  if ($LASTEXITCODE -ne 0) { git clone --depth 1 $Upstream $Target }
}

# --- 3. Python-Umgebung (uv) ------------------------------------------------
Info 'Richte Python-Umgebung ein (uv sync - Kern-Abhängigkeiten, ohne Whisper/YouTube)'
# System-Python bevorzugen (>= 3.10), sonst lädt uv selbst eines nach.
$sysPy = (Get-Command python -ErrorAction SilentlyContinue).Source
if ($sysPy) {
  & $sysPy -c "import sys; sys.exit(0 if sys.version_info[:2] >= (3,10) else 1)"
  if ($LASTEXITCODE -eq 0) { $env:UV_PYTHON = $sysPy; Ok "System-Python $sysPy" }  # gilt für uv sync UND uv run
}
Push-Location $Target
try {
  uv sync --extra modal
  if ($LASTEXITCODE -ne 0) { Warn 'uv sync fehlgeschlagen.'; exit 1 }
} finally { Pop-Location }

# --- 4. .env: migrieren oder anlegen ----------------------------------------
$envFile = Join-Path $Target '.env'
if (-not (Test-Path $envFile)) {
  $legacyEnv = Join-Path $LegacyDir '.env'
  if (Test-Path $legacyEnv) {
    Info "Übernehme .env aus altem Standort ($LegacyDir) - Modal-Endpunkte bleiben erhalten"
    Copy-Item $legacyEnv $envFile
  } else {
    Info 'Lege .env aus .env.example an (alle Schlüssel optional)'
    Copy-Item (Join-Path $Target '.env.example') $envFile
  }
} else {
  Ok '.env vorhanden - nicht angefasst'
}

# --- 5. Steakakademie-Marken-Profil einspielen -------------------------------
Info 'Spiele Steakakademie-Marken-Profil ein (docs\video-toolkit\brand -> brands\steakakademie)'
$brandDst = Join-Path $Target 'brands\steakakademie'
New-Item -ItemType Directory -Force -Path $brandDst | Out-Null
Copy-Item (Join-Path $BrandSrc '*') $brandDst -Recurse -Force
Ok 'brand.json, voice.json, assets\, hoertest\'

# --- 6. Preflight -----------------------------------------------------------
Info 'Preflight'
Push-Location $Target
try {
  $setKeys = @()
  if (Test-Path .env) {
    $setKeys = Get-Content .env | Where-Object { $_ -match '^[A-Z0-9_]+=.+' } | ForEach-Object { ($_ -split '=')[0] }
  }
  $modalSet = @($setKeys | Where-Object { $_ -like 'MODAL_*' }).Count
  Ok "Modal-Endpunkte in .env: $modalSet von 8"
  if ($setKeys -notcontains 'MODAL_QWEN3_TTS_ENDPOINT_URL') {
    Warn 'MODAL_QWEN3_TTS_ENDPOINT_URL fehlt - ohne Stimme kein Lernvideo. Siehe docs/video-toolkit-setup.md §3.'
  }
  # R2 ist KEINE Option (Befund 04.09.2026): Ohne R2 laedt das Toolkit Referenz-Assets
  # (z. B. die Marco-Referenzstimme) als Fallback zu einem oeffentlichen Filehoster
  # (litterbox) hoch - Marken-Asset an einen Dritten ohne Vertrag.
  $r2 = @('R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET_NAME') | Where-Object { $setKeys -contains $_ }
  if (@($r2).Count -lt 4) {
    Warn 'Cloudflare R2 fehlt - ohne R2 gehen Referenz-Assets an einen oeffentlichen Filehoster (litterbox).'
    Warn '  PFLICHT vor jeder Produktion. Einrichten: docs/video-toolkit-setup.md §3 (Free Tier, 0 EUR).'
  } else { Ok 'Cloudflare R2 konfiguriert - Dateitransfer bleibt im eigenen Konto' }
  if (Test-Path 'tools\verify_setup.py') { uv run tools/verify_setup.py }
} finally { Pop-Location }

# --- 7. Abschluss -----------------------------------------------------------
$sha = git -C $Target rev-parse --short HEAD
Write-Host ""
Write-Host "=============================================================="
Write-Host " Video-Toolkit installiert - Upstream $sha (MIT)"
Write-Host "=============================================================="
Write-Host " Verzeichnis : $Target  (gitignored)"
Write-Host " Marke       : brands\steakakademie  (Quelle: docs\video-toolkit\brand)"
Write-Host " Umgebung    : .venv via uv  (uv run tools\<tool>.py)"
Write-Host ""
Write-Host " Nächste Schritte:"
Write-Host "   cd $Target"
Write-Host "   claude                  Claude Code im Toolkit starten"
Write-Host "   /setup                  nur falls neue Endpunkte noetig (R2 ist PFLICHT, siehe Warnung oben)"
Write-Host "   npm run vt:check        Preflight jederzeit wiederholen"
Write-Host ""
Write-Host " Regel 4 bleibt: /publish erst nach Freigabe durch Uwe."
Write-Host "=============================================================="
