/**
 * Lädt die Marken-Schriften aus dem lokalen public/-Ordner.
 *
 * Warum lokal statt @remotion/google-fonts: kein Netzwerk-Request beim Rendern.
 * Das macht den Render reproduzierbar, offline-fähig und konsistent mit der
 * DSGVO-Linie der Website (dort werden dieselben Schriften selbst gehostet).
 *
 * delayRender/continueRender müssen INNERHALB der Komponente laufen — auf
 * Modulebene gibt es beim Bundling weder `window` noch `document`.
 */

import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { FONT } from "./brand";

const FACES = [
  { family: FONT.display, file: "steakakademie/fonts/PlayfairDisplay.woff2", weight: "400 900" },
  { family: FONT.sans, file: "steakakademie/fonts/DMSans.woff2", weight: "400 700" },
];

export const BrandFonts: React.FC = () => {
  const [handle] = useState(() => delayRender("Marken-Schriften laden"));

  useEffect(() => {
    let abgebrochen = false;

    (async () => {
      try {
        await Promise.all(
          FACES.map(async (f) => {
            const face = new FontFace(
              f.family,
              `url(${staticFile(f.file)}) format('woff2')`,
              { weight: f.weight }
            );
            await face.load();
            document.fonts.add(face);
          })
        );
        // Erst wenn die Faces wirklich einsatzbereit sind, darf gerendert werden —
        // sonst brennt Frame 0 in einer Ersatzschrift.
        await document.fonts.ready;
      } catch (err) {
        // Sichtbar scheitern ist besser als still in Arial zu rendern.
        console.error("Marken-Schriften konnten nicht geladen werden:", err);
      } finally {
        if (!abgebrochen) continueRender(handle);
      }
    })();

    return () => {
      abgebrochen = true;
    };
  }, [handle]);

  return null;
};
