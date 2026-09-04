# Video-Toolkit (claude-code-video-toolkit) — Einrichtung, Kosten, Betrieb

**Abteilung 2 (Studio).** Stand 10.08.2026 — ersetzt den Stand vom 26.08.2026.

Upstream: https://github.com/digitalsamba/claude-code-video-toolkit · **MIT** ·
Version 0.20.0 (uv-basiert). Ersetzt perspektivisch OpenMontage (`tools/openmontage/`,
AGPLv3) für die Lernvideo-Produktion — siehe Einwand in §5.

---

## 1. Wo es liegt — und warum das geändert wurde

| | bis 09.08.2026 | ab 10.08.2026 |
|---|---|---|
| Installationsort | `C:\Dev\claude-code-video-toolkit` (eigenes Repo, außerhalb) | **`tools/video-toolkit/`** (im Repo, gitignored) |
| Upstream-Stand | 26.08.2026, noch `requirements.txt` | aktuell, `uv sync` |
| Marken-Profil | nur im alten Klon (ungesichert) | **kanonisch in `docs/video-toolkit/brand/`**, wird beim Setup eingespielt |
| Setup | manuell | `npm run vt:setup:win` (idempotent) |

Entscheidung Uwe 10.08.2026: *„wie OpenMontage behandeln: nach `tools/` installieren,
gitignored, Doku im Repo."* Grund: Ein Klon außerhalb des Repos hatte das Marken-Profil
und die Hörtest-Konfiguration ohne Versionierung liegen — genau der Zustand, den Regel 9
verbietet. Jetzt ist alles Eigene versioniert, nur der Fremdcode nicht.

**Der alte Klon bleibt zunächst stehen.** Das Setup-Skript migriert die `.env` (mit den
vier bereits deployten Modal-Endpunkten) von dort. Erst wenn `tools/video-toolkit/` einen
Hörtest sauber durchlaufen hat, wird `C:\Dev\claude-code-video-toolkit` gelöscht.

---

## 2. Einrichten

```powershell
cd C:\Dev\steakakademie-v2
npm run vt:setup:win
```

Das Skript (`scripts/video-toolkit-setup.ps1`):

1. prüft Node ≥ 18, git, installiert **uv** falls nötig (offizieller Installer)
2. klont/aktualisiert Upstream nach `tools/video-toolkit/`
3. `uv sync --extra modal` — Kern-Abhängigkeiten + Modal-CLI, **ohne** Whisper (zieht
   torch, ~2 GB) und ohne YouTube-Upload (braucht OAuth-Projekt, Regel 4)
4. übernimmt die `.env` aus `C:\Dev\claude-code-video-toolkit`, falls vorhanden
5. spielt `docs/video-toolkit/brand/` → `brands/steakakademie/` ein
6. Preflight: zählt gesetzte Modal-Endpunkte, warnt, wenn die Stimme fehlt

Danach jederzeit: `npm run vt:check`.

Verifiziert 10.08.2026 in der Linux-Sandbox (`scripts/video-toolkit-setup.sh`):
uv sync durch, Modal-CLI 1.5.0, Brand-Profil schema-kompatibel mit Upstream
(`brands/default` als Referenz — kein fehlender Schlüssel).

---

## 3. Ist-Zustand der Endpunkte (Preflight nach Setup, 10.08.2026)

| Endpunkt | Zweck | Status |
|---|---|---|
| `MODAL_QWEN3_TTS` | **Marcos Stimme** | ✅ deployed — Hörtest steht aus |
| `MODAL_FLUX2` | Bildgenerierung | ✅ deployed — für Cut-/Rezeptbilder bleibt trotzdem fal.ai (§4), kein zweiter Bild-Stack |
| `MODAL_IMAGE_EDIT` | Bildbearbeitung | ✅ |
| `MODAL_UPSCALE` | Hochskalieren | ✅ |
| `MODAL_MUSIC_GEN` | Musik | ✅ |
| `MODAL_SADTALKER` | Sprechender Kopf | ✅ — **nicht nutzen** (Regel 3: Marco nie als sprechender Kopf) |
| `MODAL_SOULX` / `LTX2` / `DEWATERMARK` | Video-Generierung u. a. | ❌ — bewusst nicht (LTX-2 braucht A100-80GB) |
| Cloudflare R2 | Dateitransfer | ❌ — Konto existiert (Nameserver), Bucket fehlt |

Es fehlt nichts Generatives mehr. Nächster Schritt ist direkt der **Hörtest** (§6).

> **Korrektur 10.08.2026:** Die erste Fassung dieser Doku zählte „4 von 8" und nannte die
> fehlende Stimme als Blocker. Ursache war eine Regex ohne Ziffernklasse (`[A-Z_]`), die
> `QWEN3` und `FLUX2` übersah — im Setup-Skript **und** in meiner vorherigen Analyse der
> alten `.env`. Gefunden vom Claude-Code-Fenster beim ersten Windows-Lauf, Fix in
> eigenem Branch/PR. Lehre: Schlüsselnamen mit Ziffern sind normal; `[A-Z0-9_]` ist der
> Standard, nicht die Ausnahme.

---

## 4. Kosten — und die Frage nach günstigeren Alternativen (Uwe, 10.08.2026)

**Kurzantwort: Es gibt keine günstigere Cloud-Option als das, was schon steht.** Modal ist
mit 30 $/Monat **Gratis**-Kontingent (Starter-Plan, Zahlungsmittel muss hinterlegt sein)
bei typischer Nutzung von 1–2 $/Monat effektiv 0 €. Was laut Upstream ein Lernvideo kostet:
Stimme ~0,01 $, Bild ~0,02 $, Musik 0 $ (ACE-Step). Ein 5-Minuten-Video liegt unter 0,50 $.

| Option | Kosten | Bewertung |
|---|---|---|
| **Modal** (bereits konfiguriert) | 30 $/Monat gratis, danach nach Verbrauch | ✅ **bleibt** — günstigste Cloud-Variante |
| RunPod | ~0,44 $/h GPU, kein Gratis-Kontingent | ❌ teurer bei unserer geringen Nutzung |
| ElevenLabs | pro Zeichen | ❌ zusätzlicher Auftragsverarbeiter (AVV), Qwen3-TTS reicht |
| fal.ai (bereits im Projekt für Cut-/Rezeptbilder) | pay-per-use ~0,03 $/Bild | ✅ **für Bilder behalten** — kein zweiter Bild-Stack auf Modal |
| **Lokale Workstation** (§16c-Antrag, 1.800–3.000 €) | 0 € laufend | ✅ **langfristig günstigste Option** — Qwen3-TTS, Whisper, Upscaling laufen lokal; nur schwere Video-Generierung bleibt Cloud |

Die Workstation ist im Jobcenter-Sachgüterantrag (Kanzlei, 4.100 €) bereits enthalten.
Sobald sie steht, wandern TTS und Upscaling von Modal auf die eigene GPU — dann sinkt
der Cloud-Verbrauch auf nahe null. Bis dahin ist Modal die richtige Brücke.

**Kosten-Gates (Regel: Kostenpflichtiges ist human-gated):**
- ⛔ LTX-2 / SoulX (A100-80GB, Zahlungsmittel wird belastet) — nur nach Freigabe
- ⛔ `uv sync --extra whisper` — kein Geld, aber 2 GB torch; erst wenn Untertitel gebraucht werden
- ⛔ `uv sync --extra youtube` + `/publish` — Regel 4, erst nach Freigabe je Video

---

## 5. Einwände (Regel 0: Einwände aktiv einbringen)

**Zwei Video-Stacks sind einer zu viel.** OpenMontage (`tools/openmontage/`, AGPLv3,
Piper-TTS) und dieses Toolkit lösen dieselbe Aufgabe. Sobald der Hörtest steht und ein
Lernvideo-Pilot sauber gerendert ist, wird OpenMontage stillgelegt: `video:*`-Skripte
aus `package.json`, `docs/openmontage/`, `tools/openmontage/`. Die AGPL-Frage für GF2
(verkaufbares KI-System) löst sich damit mit — MIT ist unproblematisch.

**SadTalker ist deployed, darf aber nicht genutzt werden.** Regel 3: Marco nie als
sprechender Kopf. Der Endpunkt kostet nichts im Leerlauf, sollte aber beim nächsten
Aufräumen entfernt werden, damit kein Agent ihn „findet".

---

## 6. Hörtest Marco — der nächste echte Schritt

Sobald `MODAL_QWEN3_TTS_ENDPOINT_URL` steht:

```powershell
cd C:\Dev\steakakademie-v2\tools\video-toolkit
uv run brands\steakakademie\hoertest\hoertest-marco.ps1
```

Sieben Takes (3 Standard-Sprecher, 4 Voice-Design), Anleitung in
`docs/video-toolkit/brand/hoertest/README.md`. Gewinner in `voice.json` festschreiben —
**im Repo** (`docs/video-toolkit/brand/voice.json`), nicht im Toolkit-Ordner, sonst ist
er beim nächsten Setup weg. Danach nie wieder ändern: Marco ist öffentlich.

Voice-Design statt Klonen ist bewusst: keine reale Person, keine Einwilligung, kein
Sprecher-Buyout.
