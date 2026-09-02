# 006 — EmberGlow vom Repaint auf Compositor-Layer umstellen

- **Status**: OPEN — Messung liegt vor (02.09.2026), Umsetzung offen
- **Commit**: `fc059a0`
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 1 Datei, ~40 Zeilen (`src/components/ui/EmberGlow.tsx`)

## Vorgeschichte

`plans/README.md` führte diesen Punkt unter „Nicht in Plänen enthalten" mit der Auflage:
*„Braucht erst eine Messung, bevor sich ein Umbau auf zwei Opacity-Layer rechtfertigen lässt."*
Die Messung ist am 02.09.2026 erfolgt und steht unten unter „Messung". Sie bestätigt den
Befund — in kleinerer Größenordnung als vermutet. Dieser Plan ist deshalb **LOW**, nicht
MEDIUM, und ausdrücklich kein Dringlichkeitsfall.

## Problem

`EmberGlow` ist ein bildschirmfüllendes `position: fixed`-Element, dessen **`background`**
sich beim Scrollen ändert:

```tsx
// src/components/ui/EmberGlow.tsx:70-79 — aktuell
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? window.scrollY / max : 0;
      el.style.setProperty('--ember-rgb', spectrumAt(t));
      // Glimmen nur, solange der Nutzer wirklich scrollt.
      el.style.setProperty('--ember-alpha', '0.22');
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => el.style.setProperty('--ember-alpha', '0.13'), 600);
    };
```

```tsx
// src/components/ui/EmberGlow.tsx:100-111 — aktuell
        {
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          '--ember-rgb': '140 47 57', // Rare — Startzustand am Seitenanfang
          '--ember-alpha': '0.13',
          background:
            'radial-gradient(58% 34% at 50% 102%, rgb(var(--ember-rgb) / var(--ember-alpha)) 0%, rgb(var(--ember-rgb) / calc(var(--ember-alpha) * 0.45)) 42%, transparent 74%)',
          transition: 'background 700ms ease',
          willChange: 'background',
        } as React.CSSProperties
```

Zwei Punkte daran sind teuer:

1. **`background` ist keine Compositor-Property.** Jede Farbänderung zwingt den Browser,
   ein viewport-großes Element neu zu zeichnen — pro Frame, während des Scrollens.
2. **`willChange: 'background'` bringt nichts.** Eine eigene Compositor-Ebene bekommt ein
   Element nur über `transform`, `opacity` oder `filter`. Für `background` ist der Hinweis
   wirkungslos und kostet allenfalls Speicher.

## Messung (02.09.2026)

A/B auf `https://steakakademie.de/`, identisches rAF-Scroll-Skript über 4 s und die volle
Seitenhöhe, Consent-Banner vorher weggeklickt, einziger Unterschied `display:none` am
EmberGlow-Element. Drei Durchläufe je Zustand im Wechsel. Paint-Zahlen aus dem
Chrome-Trace (`devtools.timeline`), Frame-Zeiten aus `requestAnimationFrame`.

| Messwert (ungedrosselt) | mit EmberGlow | ohne | Differenz |
| --- | --- | --- | --- |
| Bilder/s beim Scrollen | 52,5 | 55,6 | **−3,1 (−6 %)** |
| Frame-Zeit 95p | 33,4 ms | 27,8 ms | +5,6 ms (+20 %) |
| **Paint-Ereignisse** | **372** | **301** | **+71 (+24 %)** |
| Paint gesamt | 592 ms | 517 ms | +75 ms (+15 %) |
| Style-Recalcs | 539 | 575 | −36 (−6 %) |

Einzelläufe ohne Überlappung — Paints mit: 384 / 380 / 353, ohne: 308 / 295 / 300.
Bilder/s mit: 53,8 / 53,3 / 50,3, ohne: 57,3 / 55,5 / 54,0. Das Signal ist real.

**Zwei Gegenproben, die den Befund eingrenzen — beide widerlegen eine Vermutung:**

- **4× CPU-Drosselung trägt nicht.** Einzelläufe mit 17,3 / 16,5 / 11,0 fps gegen ohne
  15,3 / 18,5 / 11,8 fps — die Gruppen überlappen. Auf einem überlasteten Gerät geht der
  Anteil im Rauschen unter. Diese Zahlen sind **kein** Beleg und dürfen nicht zitiert werden.
- **Die Ruhephase kostet nichts.** Erwartet war, dass `transition: background 700ms` plus
  der Alpha-Wechsel nach 600 ms Ruhe auch nach dem Scrollen weiter repaintet. Zwei Sekunden
  Stillstand, drei Läufe je Zustand: mit 35 Paints / 51 ms, ohne 42 Paints / 57 ms — kein
  Mehraufwand. Die Seite zeichnet im Leerlauf ohnehin ~40-mal in zwei Sekunden (vermutlich
  das rotierende Spotlight in `FrischSaisonal`). **Der Befund beschränkt sich auf die
  Scroll-Phase.**

Einordnung: Auf einem Desktop merkt das niemand, und 33 ms im 95. Perzentil sind ein
übersprungenes Bild, kein sichtbares Stocken. Der Umbau lohnt als Aufräumarbeit, nicht als
Rettung.

## Target

Die Farbe wird **nicht mehr interpoliert**. Stattdessen liegen alle fünf Garstufen als
eigene, statisch gezeichnete Ebenen übereinander; beim Scrollen ändert sich ausschließlich
deren `opacity`. Opacity läuft auf dem Compositor — ohne Repaint des Gradienten.

```tsx
// target — Struktur, nicht wörtlich zu übernehmen
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.13,                  // das „Glimmen": 0.13 ruhend, 0.22 beim Scrollen
        transition: 'opacity 700ms ease',
        willChange: 'opacity',
      }}
    >
      {GARGRAD_STOPS.map((stop, i) => (
        <div
          key={stop.label}
          data-gargrad={stop.label}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === 0 ? 1 : 0,   // Startzustand: Rare
            transition: 'opacity 700ms ease',
            willChange: 'opacity',
            background: `radial-gradient(58% 34% at 50% 102%, ${stop.hex} 0%, ${stop.hex}73 42%, transparent 74%)`,
          }}
        />
      ))}
    </div>
  );
```

Der Scroll-Handler setzt dann nur noch Opacities:

```tsx
// target — Kern des Handlers
    const seg = t * (GARGRAD_STOPS.length - 1);
    const i = Math.min(GARGRAD_STOPS.length - 2, Math.floor(seg));
    const f = seg - i;
    layers.forEach((layer, k) => {
      layer.style.opacity = k === i ? String(1 - f) : k === i + 1 ? String(f) : '0';
    });
    el.style.opacity = '0.22';          // Glimmen beim Scrollen
    // idleTimer wie bisher → zurück auf '0.13'
```

### Warum das optisch nicht identisch ist — und warum das vertretbar ist

Bisher wird **die Farbe** interpoliert und einmal mit Alpha gezeichnet. Neu werden **zwei
Ebenen** mit Alpha überblendet. Alpha-Komposition ist nicht additiv:
`a_gesamt = a₁ + a₂·(1 − a₁)`. Am ungünstigsten Punkt (`f = 0,5`, beide Ebenen halb
sichtbar, Gradientenmitte) ergibt das rechnerisch `1 − (1 − 0,065)² ≈ 0,126` statt `0,130`
— rund **3 % weniger Deckkraft**, und nur genau in der Mitte zwischen zwei Garstufen. Bei
einem Effekt, der ohnehin bei 13 % Deckkraft liegt, ist das nicht wahrnehmbar. Trotzdem
gehört es in den Feel Check: Wenn beim langsamen Durchscrollen ein „Loch" zwischen zwei
Stufen sichtbar wird, ist der Ansatz zu verwerfen statt nachzujustieren.

Zweite Abweichung, bewusst in Kauf genommen: Der Farbverlauf ist nicht mehr stufenlos über
das gesamte Spektrum interpoliert, sondern eine Überblendung zwischen benachbarten Stufen.
Bei linearer Interpolation im selben RGB-Raum ist das rechnerisch derselbe Farbort — die
Kurve unterscheidet sich nur, weil zwei Alpha-Ebenen statt einer gezeichnet werden.

## Repo conventions to follow

- Die Datei ist eine Client-Komponente mit `'use client'` in Zeile 1 — bleibt.
- Der Kopfkommentar (Zeilen 4–24) dokumentiert die **Entscheidung Uwe, 15.08.2026**: keine
  Dauerschleifen-Animation, Bewegung nur als Reaktion auf Nutzerhandlung, Gargrad-Spektrum
  als bedeutungstragender Verlauf. Diese Entscheidung wird durch den Umbau **nicht**
  berührt und der Kommentar bleibt inhaltlich stehen — ergänzt um zwei Sätze, warum jetzt
  Ebenen statt einer interpolierten Farbe.
- `GARGRAD_STOPS` ist exportiert. Der Export bleibt, auch wenn ihn derzeit niemand außerhalb
  der Datei importiert (geprüft: kein Treffer in `src/`).
- Deutsche Kommentare, `//` für Zeilen, `/** */` für den Dateikopf — wie im Bestand.

## Steps

1. `hexToRgb`, `STOP_RGB` und `spectrumAt` entfallen ersatzlos — die Interpolation wandert
   in die Opacity-Gewichte. `GARGRAD_STOPS` bleibt.
2. Ein `useRef` auf den Container plus Zugriff auf die fünf Ebenen (Array-Ref oder
   `container.children`).
3. Markup wie unter „Target": ein Container mit `opacity`/`transition`/`willChange`, darin
   fünf absolut positionierte Ebenen mit je statischem Gradienten.
4. Scroll-Handler umbauen: `t` wird wie bisher berechnet, danach Segment und Bruchteil
   bestimmen und die Opacities setzen. Der rAF-Riegel (`ticking`) und der `idleTimer` mit
   600 ms bleiben unverändert.
5. Reduced Motion wie bisher: `if (reduceMotion)` setzt `transition = 'none'` — jetzt auf
   dem Container **und** auf allen fünf Ebenen.
6. `willChange: 'background'` ist ersatzlos zu entfernen; auf den Ebenen steht
   `willChange: 'opacity'`.

## Boundaries

- Genau eine Datei: `src/components/ui/EmberGlow.tsx`.
- **Keine** Änderung an `src/app/layout.tsx` — die Einbindung bleibt, wie sie ist (Zeile 111).
- Die fünf Farbwerte aus `GARGRAD_STOPS` bleiben **unverändert**. Der Plan ändert die
  Technik, nicht die Gestaltung.
- Die Alpha-Werte 0,13 (ruhend) und 0,22 (beim Scrollen), die 600 ms Ruhe-Verzögerung und
  die 700 ms Übergangsdauer bleiben unverändert.
- `SmokeEffect.tsx` bleibt unangetastet — der Ein-Zeilen-Revert in `layout.tsx` muss weiter
  möglich sein.
- **Kein** zusätzlicher Effekt, keine Pulsation, keine Dauerschleife. Das ist in
  `plans/README.md` ausdrücklich abgelehnt und bleibt abgelehnt.
- Bei Drift gegenüber Commit `fc059a0`: STOPP und melden.

## Risiko, das vorab zu prüfen ist

Fünf bildschirmfüllende Ebenen mit `will-change: opacity` erzeugen fünf Compositor-Layer.
Bei 1280×800 sind das rund 16 MB GPU-Speicher, auf einem 4K-Schirm entsprechend mehr.
Sollte sich das als Verschlechterung zeigen, ist die Rückfallvariante: **zwei** Ebenen statt
fünf, die beim Überschreiten einer Segmentgrenze ihre Farbe wechseln. Dann fällt Repaint nur
noch viermal pro Vollscroll an statt in jedem Frame — schlechter als fünf Ebenen, aber immer
noch deutlich besser als der Ist-Zustand.

## Verification

- **Mechanisch**:
  - `npx tsc --noEmit` → exit 0.
  - `npm run build` → exit 0, alle Gates grün.
  - Die alten CSS-Variablen dürfen nicht mehr vorkommen:
    ```bash
    grep -c "ember-rgb\|ember-alpha" src/components/ui/EmberGlow.tsx   # erwartet: 0
    ```
- **Messung — dieselbe Methode wie oben, sonst ist sie nicht vergleichbar**:
  A/B gegen `display:none`, 4 s rAF-Scroll über die volle Seitenhöhe, Consent-Banner
  weggeklickt, ungedrosselt, mindestens 3 Durchläufe je Zustand, Paint-Zahlen aus dem
  Chrome-Trace mit Kategorie `devtools.timeline`.
  **Done when**: Die Differenz bei den Paint-Ereignissen liegt im Rauschen — konkret: Die
  Einzelläufe „mit" und „ohne" überlappen sich, statt wie heute klar getrennt zu sein
  (heute: 384/380/353 gegen 308/295/300). Die Bilder/s dürfen nicht unter den heutigen Wert
  von 52,5 fallen.
- **Feel check**:
  - Startseite langsam von oben nach unten scrollen: Der Schein wandert weiterhin sichtbar
    von dunklem Blutrot über Rosé-Braun und Karamell nach Röstbraun. **Kein Sprung, kein
    Flackern, kein „Loch" an den Übergängen zwischen zwei Garstufen.**
  - Beim Scrollen glimmt es auf, nach ~600 ms Ruhe geht es zurück — unverändert zum Ist.
  - Mit `prefers-reduced-motion: reduce`: Die Farbe wechselt weiterhin mit der Scrolltiefe,
    aber hart statt weich. Nichts pulsiert.
  - DevTools → Rendering → **Paint Flashing** beim Scrollen: Der bildschirmfüllende grüne
    Blitz über der gesamten Fläche muss verschwinden. Das ist die anschaulichste Probe.
  - DevTools → Layers: Es dürfen nicht mehr Layer entstehen als die fünf Ebenen plus
    Container.
