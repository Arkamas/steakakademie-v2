# ---------------------------------------------------------------------------
# OpenMontage-Installer für die Steakakademie (Windows PowerShell)
#
#   powershell -ExecutionPolicy Bypass -File scripts\openmontage-setup.ps1
#
# Idempotent. Installiert nach tools\openmontage (gitignored, AGPLv3).
# Siehe docs/openmontage-integration.md.
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Target   = if ($env:OPENMONTAGE_DIR) { $env:OPENMONTAGE_DIR } else { Join-Path $RepoRoot 'tools\openmontage' }
$Ref      = if ($env:OPENMONTAGE_REF) { $env:OPENMONTAGE_REF } else { 'main' }
$Upstream = 'https://github.com/calesthio/OpenMontage.git'

function Info($m) { Write-Host "==> $m" -ForegroundColor Yellow }
function Warn($m) { Write-Host "[!] $m" -ForegroundColor Red }

# --- 1. Voraussetzungen -----------------------------------------------------
Info 'Prüfe Voraussetzungen'
foreach ($cmd in @('git', 'node', 'npm')) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Warn "$cmd fehlt — bitte installieren."; exit 1
  }
}

$py = if (Get-Command py -ErrorAction SilentlyContinue) { 'py -3' }
      elseif (Get-Command python -ErrorAction SilentlyContinue) { 'python' }
      else { Warn 'Python fehlt — https://www.python.org/downloads/'; exit 1 }

& ([scriptblock]::Create("$py -c `"import sys; sys.exit(0 if sys.version_info[:2] >= (3,10) else 1)`""))
if ($LASTEXITCODE -ne 0) { Warn 'OpenMontage braucht Python >= 3.10.'; exit 1 }

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Warn 'FFmpeg fehlt — ohne FFmpeg kann nichts gerendert werden.'
  Warn '  Installieren mit:  winget install Gyan.FFmpeg'
  exit 1
}

# --- 2. Quellcode holen/aktualisieren ---------------------------------------
if (Test-Path (Join-Path $Target '.git')) {
  Info "Aktualisiere vorhandene Installation ($Target)"
  git -C $Target fetch --depth 1 origin $Ref
  git -C $Target checkout -q FETCH_HEAD
} else {
  Info "Klone OpenMontage nach $Target (~160 MB)"
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Target) | Out-Null
  git clone --depth 1 --branch $Ref $Upstream $Target
  if ($LASTEXITCODE -ne 0) { git clone --depth 1 $Upstream $Target }
}

# --- 3. OpenMontage-Setup ---------------------------------------------------
Info 'Führe OpenMontage-Setup aus (venv + pip + Remotion npm — dauert einige Minuten)'
Push-Location $Target
try {
  & ([scriptblock]::Create("$py -m venv .venv"))
  $venvPy = Join-Path $Target '.venv\Scripts\python.exe'
  & $venvPy -m pip install --upgrade pip
  & $venvPy -m pip install -r requirements.txt
  & $venvPy -m pip install piper-tts
  Push-Location 'remotion-composer'; npm install; Pop-Location
  if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
} finally { Pop-Location }

# --- 4. Steakakademie-Layer einspielen --------------------------------------
Info 'Spiele Steakakademie-Marken-Layer ein'
New-Item -ItemType Directory -Force -Path (Join-Path $Target 'styles') | Out-Null
Copy-Item (Join-Path $RepoRoot 'docs\openmontage\steakakademie.style.yaml') (Join-Path $Target 'styles\steakakademie.yaml') -Force
Copy-Item (Join-Path $RepoRoot 'docs\openmontage\steakakademie-brief.md')    (Join-Path $Target 'STEAKAKADEMIE-BRIEF.md') -Force

Info 'Validiere Style-Playbook gegen das OpenMontage-Schema'
Push-Location $Target
try {
  & $venvPy -c @"
import json, sys, yaml, jsonschema
schema = json.load(open('schemas/styles/playbook.schema.json', encoding='utf-8'))
data = yaml.safe_load(open('styles/steakakademie.yaml', encoding='utf-8'))
try:
    jsonschema.validate(data, schema)
except jsonschema.ValidationError as e:
    print('    UNGUELTIG: %s -> %s' % ('/'.join(map(str, e.absolute_path)), e.message))
    sys.exit(1)
print(\"    Playbook '%s' gueltig\" % data['identity']['name'])
"@
  if ($LASTEXITCODE -ne 0) { exit 1 }
} finally { Pop-Location }

# --- 5. Abschluss -----------------------------------------------------------
$sha = git -C $Target rev-parse --short HEAD
Write-Host ""
Write-Host "=============================================================="
Write-Host " OpenMontage installiert — Commit $sha"
Write-Host "=============================================================="
Write-Host " Verzeichnis : $Target  (gitignored, AGPLv3)"
Write-Host " Playbook    : styles\steakakademie.yaml"
Write-Host " Briefing    : STEAKAKADEMIE-BRIEF.md   <- Pflichtlektüre für Agenten"
Write-Host ""
Write-Host " Nächste Schritte:"
Write-Host "   npm run video:check     Tool-Verfügbarkeit prüfen (Preflight)"
Write-Host "   npm run video:board     Backlot-Produktionsboard starten"
Write-Host ""
Write-Host " Regel 4 bleibt: Agenten liefern Entwürfe, Uwe gibt frei."
Write-Host "=============================================================="
