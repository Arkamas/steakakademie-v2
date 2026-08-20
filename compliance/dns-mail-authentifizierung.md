# E-Mail-Authentifizierung steakakademie.de — Bestand und Maßnahmen (KAN-76)

**Gemessen am 20.08.2026** per DNS-Abfrage. Alles hier ist nachprüfbar mit
`nslookup -type=TXT <name>` bzw. `Resolve-DnsName`.

Diese Datei liegt im Repo, die Änderungen gehören aber **nicht** hierher: Sie
werden im DNS vorgenommen (Cloudflare). Das Repo hält nur fest, was gilt und
warum — sonst weiß in sechs Monaten niemand mehr, warum ein Record so aussieht.

## Ist-Zustand

| Record | Wert | Bewertung |
|---|---|---|
| MX | `route1/2/3.mx.cloudflare.net` | Cloudflare Email Routing (Empfang) |
| SPF (Root) | `v=spf1 include:_spf.mx.cloudflare.net ~all` | deckt nur Cloudflare-Routing-IPs |
| SPF `send.` | `v=spf1 include:amazonses.com ~all` | Resend (nutzt SES) |
| DKIM | `resend._domainkey` vorhanden | **existiert** — auf der Root-Domain |
| DMARC | `v=DMARC1; p=none;` | **keine Auswertung**, kein `rua` |

## Der Befund des Testats stimmt nur halb

Das Anwalts-Testat vom 18.08.2026 nennt „Kein DKIM, DMARC auf p=none".

**DKIM existiert** — unter dem Selektor `resend._domainkey`. Vermutlich wurde
auf die üblichen Selektoren (`default`, `google`, `selector1`) geprüft und der
anbieterspezifische übersehen.

**DMARC auf `p=none` stimmt** — und ist schlimmer als es klingt, aber aus einem
anderen Grund als vermutet. `p=none` allein ist kein Fehler, sondern der
vorgesehene erste Schritt: beobachten, bevor man durchsetzt. Nur fehlt hier
`rua=` — die Adresse, an die Provider ihre Berichte schicken. **Ohne `rua`
beobachtet niemand irgendwas.** Das ist der schlechteste aller Zustände: keine
Durchsetzung *und* keine Sichtbarkeit. Der Record erfüllt eine Formalie und
leistet nichts.

## Offene Frage vor jeder Änderung: Loops oder Resend?

Das DNS ist für **Resend** eingerichtet (`send.` mit SES-SPF, `resend._domainkey`).
Der Code versendet aber über **Loops**:

- `src/app/api/widerruf/route.ts` — Eingangsbestätigung Widerruf
- `src/app/api/kontakt/route.ts` — Kontaktformular (KAN-70, seit 6051e35)

Für Loops gibt es **keine** DKIM-Records (`loops._domainkey` und Varianten
geprüft, nichts gefunden). Daraus folgt eines von beidem:

1. **Loops versendet unter eigener Domain** (`@loops.so`). Dann ist DMARC von
   steakakademie.de nicht betroffen — aber die Mails kommen sichtbar von einem
   Fremdabsender, und ein späteres `p=reject` ändert daran nichts.
2. **Loops ist auf eine steakakademie.de-Absenderadresse konfiguriert.** Dann
   fehlen SPF-Include und DKIM, die Mails sind nicht authentifiziert — und
   spätestens bei `p=quarantine` landen sie im Spam. Betroffen wäre auch die
   Zustellung des Kontaktformulars an pitmaster@.

**Das ist im Loops-Dashboard nachzusehen (Sending Domain), bevor DMARC
verschärft wird.** Fall 2 unbemerkt zu verschärfen hieße, die eigene
Kontaktzustellung abzuschalten.

## Maßnahmen, in dieser Reihenfolge

### 1. DMARC-Berichte einschalten (sofort, risikolos)

```
_dmarc.steakakademie.de  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@steakakademie.de; fo=1; adkim=r; aspf=r"
```

Ändert an der Zustellung nichts, liefert aber ab dem nächsten Tag Berichte:
wer im Namen der Domain versendet, was authentifiziert ist und was nicht.
Ohne diese Daten ist jede Verschärfung ein Blindflug.

`dmarc@steakakademie.de` muss im Cloudflare Email Routing auf ein Postfach
zeigen, das tatsächlich empfängt — nach dem Befund vom 19.08.2026 also auf
**pitmaster@**, nicht auf eine der unverifizierten Adressen.

### 2. Absenderlage klären

Loops-Dashboard prüfen (siehe oben). Bei Fall 2: SPF-Include und DKIM von Loops
ergänzen, sonst Absender auf Resend umstellen oder bei Loops-Domain belassen.

### 3. Zwei bis vier Wochen Berichte auswerten

Erst wenn die Berichte zeigen, dass **alle** legitimen Absender durchgehen,
weitergehen. Typische Überraschungen: Newsletter-Tools, Ticketsysteme,
Formular-Dienste, die jahrelang mitversendet haben.

### 4. Schrittweise verschärfen

```
p=quarantine; pct=25    →  pct=100    →  p=reject
```

Jede Stufe mindestens eine Woche beobachten. `pct=` begrenzt den Anteil
betroffener Mails und macht Fehler billig.

### 5. SPF aufräumen

Der Root-SPF deckt nur den Empfangsweg ab. Wenn von der Root-Domain nie
versendet wird, ist `v=spf1 -all` die ehrlichere Angabe als ein `~all`, das
Versand suggeriert. Das aber erst nach Schritt 3 — vorher ist unklar, wer
tatsächlich versendet.

## Was das Repo dazu beiträgt

Nichts Technisches — DNS liegt außerhalb. Aber der Zusammenhang zu KAN-70 ist
real: Die Kontaktzustellung hängt an Loops. Wird DMARC verschärft, ohne die
Absenderlage zu klären, kann das Formular weiterhin speichern und trotzdem
keine Mail mehr zustellen. Die Nachricht wäre dann in `kontaktanfragen`, aber
niemand erführe davon. Genau dafür trägt die Tabelle die Spalte `mail_sent` und
einen Teil-Index auf die offenen Zeilen.
