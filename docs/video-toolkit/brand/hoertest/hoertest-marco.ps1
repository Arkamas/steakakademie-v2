# ---------------------------------------------------------------------------
# Hoertest Marco — Stimm-Abnahme fuer die Steakakademie (Uwe-Gate)
#
#   cd C:\Dev\claude-code-video-toolkit
#   .\.venv\Scripts\Activate.ps1
#   .\brands\steakakademie\hoertest\hoertest-marco.ps1
#
# Erzeugt 7 Takes desselben deutschen Absatzes in brands\steakakademie\hoertest\.
# Danach anhoeren, EINEN auswaehlen, in brands\steakakademie\voice.json
# festschreiben — und nie wieder aendern. Marco ist seit Monaten oeffentlich.
#
# Warum ein Hoertest noetig ist: Qwen3-TTS bringt nur zwei maennliche
# Standardstimmen mit (Ryan, Aiden — beide als Englisch hinterlegt, koennen
# aber Deutsch sprechen). Die gewuenschte tiefe, rauchige "Whiskey"-Stimme
# ist damit nicht garantiert. Deshalb laufen zusaetzlich vier Takes im
# Voice-Design-Modus (--design-instruct), der eine Stimme nach Charakter-
# beschreibung baut — rechtlich sauber, weil keine reale Person geklont wird.
# ---------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'
$env:PYTHONIOENCODING = 'utf-8'
$out = "brands\steakakademie\hoertest"

# Testabsatz: echte Fachsprache + Zahlen + Umlaute + der Marken-Ton.
# Bewusst mit "54 Grad" und "Maillard" — daran hoert man Aussprachefehler sofort.
$text = @"
Die Glut ist bereit, wenn ein grauer Aschefilm auf der Kohle liegt. Nicht vorher.
Leg das Ribeye auf die direkte Zone, zwei Minuten je Seite, dann zieh es rueber
ins Indirekte. Bei vierundfuenfzig Grad Kerntemperatur nimmst du es runter und
laesst es ruhen. Was du dabei riechst, ist die Maillard-Reaktion — und die
verzeiht keine Hektik.
"@ -replace "`r`n", " "

Write-Host "`n=== Hoertest Marco — 7 Takes ===" -ForegroundColor Yellow

# --- Spur A: eingebaute Sprecher, Deutsch -----------------------------------
$builtins = @(
  @{ n = "A1-ryan-storyteller";  s = "Ryan";  tone = "storyteller" },
  @{ n = "A2-ryan-calm";         s = "Ryan";  tone = "calm" },
  @{ n = "A3-aiden-storyteller"; s = "Aiden"; tone = "storyteller" }
)
foreach ($b in $builtins) {
  Write-Host "-> $($b.n)" -ForegroundColor Cyan
  python tools/qwen3_tts.py --text $text --language german `
    --speaker $b.s --tone $b.tone --max-wpm 135 `
    --output "$out\$($b.n).mp3" --cloud modal
}

# --- Spur B: Voice-Design — Marco nach Charakterbeschreibung ----------------
$designs = @(
  @{ n = "B1-whiskey-baritone"; d = "Deutscher Grillmeister, Anfang fuenfzig, tiefer rauchiger Bariton, ruhiges Erzaehltempo, warm und unaufgeregt. Klingt wie jemand, der seit dreissig Jahren am Feuer steht und nichts mehr beweisen muss." },
  @{ n = "B2-dunkel-ruhig";     d = "Maennliche deutsche Stimme, dunkel und sonor, sehr ruhig, minimale Betonung, fast fluesternd nah. Kein Werbeton, keine Begeisterung — nur Handwerk." },
  @{ n = "B3-warm-erfahren";    d = "Warme, tiefe deutsche Maennerstimme, Ende vierzig, leicht rau, freundlich-kumpelhaft, aber praezise. Erklaert einem Freund etwas am Grill." },
  @{ n = "B4-lagerfeuer";       d = "Tiefe deutsche Erzaehlerstimme am Lagerfeuer, rauchig, langsam, mit Pausen. Gravitas ohne Pathos." }
)
foreach ($d in $designs) {
  Write-Host "-> $($d.n)" -ForegroundColor Cyan
  python tools/qwen3_tts.py --text $text --language german `
    --design-instruct $d.d --max-wpm 135 `
    --output "$out\$($d.n).wav" --cloud modal
}

Write-Host "`nFertig. Dateien liegen in $out" -ForegroundColor Green
Write-Host "Anhoeren, EINEN Take waehlen, dann in brands\steakakademie\voice.json eintragen." -ForegroundColor Green
