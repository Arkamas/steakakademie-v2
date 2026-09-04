# BOT_PAT — warum die Agenten-Workflows ein eigenes Token brauchen

**Abteilung 1 (Systems & Ops).** Stand 04.09.2026.

## Der Befund

Seit **01.09.2026** schützt Branch Protection `main`: kein Direct-Push, drei Pflicht-Checks
(P0-Gates, Stille Content-Defekte, Vercel). Richtig so — aber die sechs Agenten-Workflows
pushten weiterhin direkt auf `main`. Ergebnis: **Letzter Bot-Commit 27.08.** Glossar- und
Rezept-Agent liefen vier Tage lang täglich ins Leere, ohne dass es jemand gemerkt hat.

Der naheliegende Fix — Bots öffnen PRs statt zu pushen — hat eine zweite Falle: **Ein PR,
den ein Workflow mit `github.token` erstellt, löst keine `pull_request`-Workflows aus.**
GitHub verhindert so Endlosschleifen. Die Pflicht-Checks `build-guard` und `content-gates`
laufen also nie auf diesem PR, Branch Protection verlangt sie aber → der PR ist
unmergefähig. Das betraf auch das Cut-Foto-Gate vom Juli.

## Die Lösung

Alle sechs Workflows nutzen jetzt `.github/actions/pr-statt-push` (eine Composite Action,
ein Ort für die Logik) und bevorzugen das Secret **`BOT_PAT`**. Mit PAT erstellt = Checks
laufen = PR mergefähig. Ohne PAT fällt die Action auf `github.token` zurück, der PR
entsteht trotzdem — mit sichtbarer Warnung im PR-Text und im Job-Summary.

| Workflow | Inhalt | Auto-Merge nach grünen Checks? |
|---|---|---|
| `glossary-grow` | Glossar-Text | ✅ ja (kein Review nötig) |
| `ideen-radar` | Titel/Link/Datum-Backlog | ✅ ja |
| `train-pork-lora` | eine JSON mit LoRA-URL | ✅ ja |
| `recipe-grow` | Rezept-Text **+ FLUX-Bild** | ❌ Review (Regel 8c: Bild prüfen) |
| `regenerate-recipe-images` | FLUX-Bilder | ❌ Review |
| `generate-cut-images` | FLUX-Cut-Fotos | ❌ Review |

Auto-Merge braucht zusätzlich das Repo-Setting **Settings → General → „Allow auto-merge"**.
Fehlt es, bleibt der PR offen und die Action schreibt eine Warnung — nichts bricht.

## Einrichten (Uwe, ~3 Minuten, 0 €)

1. GitHub → Settings (Profil, nicht Repo) → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
2. Name `steakakademie-bot`, Expiration 1 Jahr, **Repository access: Only select
   repositories → `Arkamas/steakakademie-v2`**.
3. Permissions → Repository permissions:
   - **Contents: Read and write**
   - **Pull requests: Read and write**
   - alles andere: No access.
4. Token kopieren → Repo `steakakademie-v2` → Settings → Secrets and variables → Actions →
   New repository secret → Name **`BOT_PAT`**, Wert einfügen.
5. Repo → Settings → General → Pull Requests → ☑ **Allow auto-merge**.

Danach einmal `glossary-grow` per `workflow_dispatch` starten und im Summary prüfen:
„PR geöffnet", keine PAT-Warnung, Checks laufen an.

## Nebenbei gehärtet: Inputs nie direkt in Shell-Zeilen

`${{ ... }}` wird von GitHub **vor** der Shell in die Zeile eingesetzt — steht dort ein
von außen setzbarer Wert, ist das ein Einfallstor. Alle 15 Fundstellen laufen jetzt über
`env:` (`IN_*`) und werden in der Shell als `"$IN_..."` gelesen; `social-grow` prüft sein
`limit` zusätzlich auf reine Ziffern, weil es direkt an eine Kommandozeile geht.

**Lehre aus der Suche selbst (04.09.):** Der erste Scan suchte nur `inputs.` und übersah
`content-grow` und `social-grow`, die `github.event.inputs.` schreiben — dieselbe Sache,
andere Schreibweise. Beim Nachziehen wurde deshalb gegen **alle** von außen
beeinflussbaren Kontexte geprüft (`github.event.*`, `inputs.*`, `github.head_ref`,
`github.ref_name`) statt gegen ein Muster. Wer künftig einen Workflow ergänzt, prüft mit:

```bash
python3 - <<'EOF'
import yaml, glob, re
pat = re.compile(r'\$\{\{\s*([^}]+?)\s*\}\}')
risky = ('github.event.', 'inputs.', 'github.head_ref', 'github.ref_name')
for f in sorted(glob.glob('.github/workflows/*.yml')):
    d = yaml.safe_load(open(f, encoding='utf-8'))
    for job in (d.get('jobs') or {}).values():
        for st in job.get('steps', []):
            r = st.get('run')
            if isinstance(r, str):
                for m in pat.finditer(r):
                    if any(x in m.group(1) for x in risky):
                        print(f, st.get('name'), m.group(1))
EOF
```

Kein Treffer = sauber.

## Was NICHT zu tun ist

- **Kein „Allow GitHub Actions to bypass branch protection".** Das würde die Bots wieder
  ungeprüft auf `main` lassen — genau der Zustand, den die Gates verhindern sollen.
- **Kein klassischer PAT mit `repo`-Scope.** Fine-grained, nur dieses Repo, zwei Rechte.
- Token nie in Code, nie in `.env.example`, nie in Doku.

## Ablaufdatum

Das Token läuft nach einem Jahr ab. Ab dann erstellen die Bots PRs ohne Checks und warnen
sichtbar — der Betrieb steht nicht still, aber die Warnung ist ernst zu nehmen.
Erinnerung: **August 2027** neues Token, gleiches Secret.
