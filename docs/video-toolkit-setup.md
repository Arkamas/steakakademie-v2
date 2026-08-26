# Video-Toolkit (claude-code-video-toolkit) — Einrichtung & Kosten-Gates

**Stand 26.08.2026.** Ersetzt für die Lernvideo-Produktion perspektivisch OpenMontage
(`tools/openmontage/`, AGPLv3, Windows-venv). Das neue Toolkit ist **MIT-lizenziert** —
Teile davon dürfen ins Repo vendort werden, anders als bei OpenMontage.

Installationsort: `C:\Dev\claude-code-video-toolkit` (eigenes Repo, nicht Teil von v2).

---

## 1. Ist-Zustand (geprüft 26.08.2026)

| Bereich | Status |
|---|---|
| Repo geklont | ✅ `C:\Dev\claude-code-video-toolkit` |
| Node / Python / FFmpeg / pip-Pakete | ✅ vorhanden (`tools/verify_setup.py` = „Prerequisites: ready") |
| `.env` | ⚠️ **unverändert aus `.env.example` kopiert — kein einziger Schlüssel gesetzt** |
| Cloud-GPU (Modal / RunPod) | ❌ nicht konfiguriert (0 von 8 Werkzeugen) |
| Dateitransfer (Cloudflare R2) | ❌ nicht konfiguriert |
| Stimme (Qwen3-TTS / ElevenLabs) | ❌ nicht konfiguriert |
| Marken-Profil Steakakademie | ✅ **neu angelegt** (siehe §2) |

Prüfbefehl (jederzeit wiederholbar, kostet nichts):

```powershell
cd C:\Dev\claude-code-video-toolkit
python tools\verify_setup.py
```

---

## 2. Was ohne Kosten bereits eingerichtet ist

`brands/steakakademie/` im Toolkit-Repo:

- `brand.json` — Farben und Schriften **1:1 aus `tailwind.config.js`** übernommen
  (Glut-Orange `#E85018` als primary, Whiskey-Gold `#C8882A`, Ruß-Braun `#17100B`;
  Playfair Display / Source Serif 4 / DM Sans). Zusätzlich ein `_doktrin`-Block,
  der die für Video relevanten Regeln aus CLAUDE.md mitführt (kein Uwe vor der Kamera,
  kein sprechender Kopf, Kerntemperaturen nur aus der Referenz-YAML,
  Werbekennzeichnung, kein Auto-Publishing).
- `voice.json` — Marco-Profil (tief, rauchig, Deutsch, ruhiges Erzähltempo).
  ElevenLabs bewusst **leer gelassen**.
- `assets/` — Fassbrand-Logo als SVG + JPG.

Damit greifen `/brand`, `/video` und die Remotion-Templates auf den Hausstil zu,
ohne dass irgendein Cloud-Dienst nötig ist.

---

## 3. Was noch fehlt — und was es kostet

Das Toolkit ist lokal für **Schnitt, Komposition und Untertitel** (Remotion, FFmpeg,
MoviePy) vollständig funktionsfähig. Alles **Generative** (Stimme, Bilder, KI-Clips)
läuft über fremde GPUs und braucht Konten:

| Baustein | Zweck | Kosten | Freigabe |
|---|---|---|---|
| **Modal** | Cloud-GPU-Host für Qwen3-TTS, FLUX.2, Upscaling, Musik | 30 $/Monat Gratis-Kontingent — **setzt ein hinterlegtes Zahlungsmittel voraus** | ⛔ Uwe |
| **Qwen3-TTS** (auf Modal) | Marcos Stimme, deutlich besser als Piper | 0 € innerhalb des Modal-Kontingents | ⛔ Uwe (mit Modal) |
| **Cloudflare R2** | Dateitransfer zur GPU, schneller/stabiler als die Gratis-Filehoster | Gratis-Tarif (10 GB) — Konto besteht bereits (Nameserver laufen dort) | ⛔ Uwe |
| **ElevenLabs** | Premium-TTS | pro Zeichen, kostenpflichtig | ❌ **Empfehlung: nicht** |
| **LTX-2** (KI-Video) | generierte Bewegtbild-Clips | braucht A100-80GB → Zahlungsmittel zwingend | ⛔ später |

### Einwand (Regel: Einwände aktiv einbringen)

**ElevenLabs sollten wir nicht nehmen.** Am 19.08. haben wir teuer gelernt: erst
Inventur, dann neuer Dienst — jeder zusätzliche Anbieter heißt ein weiterer
Auftragsverarbeiter, ein AVV, ein Datenschutz-Absatz, ein Login, ein Ausfallpunkt.
Qwen3-TTS läuft im selben Modal-Kontingent, das wir für Bilder ohnehin brauchen,
und kostet dort nichts extra. Wenn die Stimme im Hörtest trägt, ist ElevenLabs
schlicht überflüssig.

**Zwei Video-Stacks parallel sind einer zu viel.** OpenMontage (AGPLv3, Windows-venv,
Piper) und dieses Toolkit lösen dieselbe Aufgabe. Sobald das neue Toolkit einen
Lernvideo-Piloten sauber gerendert hat, sollte OpenMontage stillgelegt werden —
sonst pflegen wir zwei Marken-Playbooks, zwei Stimm-Konfigurationen und zwei
Approval-Ketten. Die AGPL-Frage aus dem 09.08.-Eintrag (kritisch für GF2, das
verkaufbare KI-System) löst sich damit gleich mit: MIT ist unproblematisch.

---

## 4. Nächster Schritt (Uwe)

1. Bei **Modal** ein Konto anlegen und ein Zahlungsmittel hinterlegen
   (30 $/Monat sind gratis, ohne Zahlungsmittel gibt es das Kontingent nicht).
2. Dann im Toolkit-Ordner `claude` starten und `/setup` laufen lassen —
   der Assistent trägt die Endpunkt-URLs selbst in die `.env` ein.
3. Danach **Hörtest**: mehrere Qwen3-Sprecher mit demselben deutschen Absatz,
   Marco festlegen, in `brands/steakakademie/voice.json` eintragen und einfrieren.
   Erst danach die erste Lektion vertonen — eine Stimme, die sich mitten in der
   Reihe ändert, ist teurer als jede Nachproduktion.
