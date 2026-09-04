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
| Cloudflare R2 | Dateitransfer | ❌ **PFLICHT vor Produktion** — Konto existiert (Nameserver), Bucket fehlt |

Es fehlt nichts Generatives mehr — aber **R2 muss vor der nächsten Generierung stehen.**

> **Befund 04.09.2026 (Hörtest):** Ohne R2 lädt das Toolkit Referenz-Assets als Fallback
> zu **litterbox** hoch — einem öffentlichen Filehoster. Im Log: „Uploading
> voice-design-ref.wav (1068KB)… Upload complete (litterbox)". Das ist ein Marken-Asset
> bei einem Dritten ohne Vertrag. Kein Personenbezug (synthetische Stimme), aber
> Kontrollverlust. Deshalb ist R2 seitdem **keine Option mehr**; beide Setup-Skripte
> warnen rot, solange die vier `R2_*`-Schlüssel fehlen.
>
> **Einrichten (0 €, Free Tier 10 GB):** Cloudflare Dashboard → R2 Object Storage →
> Bucket `video-toolkit` anlegen → „Manage R2 API Tokens" → Token mit *Object Read &
> Write* → `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
> in `tools\video-toolkit\.env`. Nie ins Repo.

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

## 6. Marcos Stimme — abgenommen 04.09.2026, eingefroren

**Gewinner: B3 „warm-erfahren"** aus sieben Hörtest-Takes (3 eingebaute Sprecher,
4 Voice-Design). Verfahren: **Voice-Design** (`--design-instruct`), kein Klon einer
realen Person — keine Einwilligung, kein Sprecher-Buyout, keine Nutzungsrechte-Frage.

Kanonisch festgeschrieben in **`docs/video-toolkit/brand/voice.json`** (im Repo, nicht im
gitignorierten Toolkit-Ordner — sonst beim nächsten Setup weg). `instruct` und `seedText`
stehen dort **wortwörtlich** so, wie sie im Hörtest liefen.

### ⚠️ Die Stimme hängt an einer einzigen Datei

`docs/video-toolkit/brand/assets/voice-design-ref.wav` (1,1 MB) ist die **einzige**
Fassung der abgenommenen Stimme. Der Grund, warum sie versioniert im Repo liegt statt
nur im Toolkit-Cache:

> **Qwen3-TTS kennt keinen Seed-Parameter.** `instruct` + `seedText` erzeugen die Stimme
> **nicht** zuverlässig noch einmal — Voice-Design sampelt. Wer die WAV löscht und neu
> generiert, bekommt eine *andere* Stimme, obwohl der Prompt identisch ist. Marco ist
> seit Monaten öffentlich sichtbar; eine Stimme, die sich mitten in der Lektionsreihe
> ändert, ist teurer als jede Nachproduktion.

Daraus folgt, verbindlich: **nie löschen, nie neu generieren, nie überschreiben.**
Das Setup-Skript spielt sie bei jeder Installation aus dem Repo in den Toolkit-Ordner —
die Kopie dort ist Arbeitsstand, das Repo ist die Wahrheit (Regel 9).

### Falls doch einmal neu generiert werden muss

Nur mit ausdrücklicher Freigabe von Uwe, und dann als **bewusste Neu-Abnahme** mit
neuem Hörtest und neuem Datum in `_abnahme` — nicht als stiller Cache-Rebuild.
