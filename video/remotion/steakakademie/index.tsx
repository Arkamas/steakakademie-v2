/**
 * Eigener Remotion-Einstiegspunkt der Steakakademie.
 *
 * Bewusst getrennt von src/index.tsx des OpenMontage-Composers: Wir registrieren
 * nur unsere eigene Komposition und fassen keine Upstream-Datei an — damit bleibt
 * `npm run video:setup` (git fetch + checkout) konfliktfrei.
 *
 * Render:
 *   npx remotion render src/steakakademie/index.tsx Kerntemperatur out.mp4 \
 *     --props ../../video/kerntemperatur-tiktok/timeline.json
 */

import React from "react";
import { Composition, registerRoot } from "remotion";
import { Kerntemperatur, KerntemperaturProps } from "./Kerntemperatur";
import { FPS, WIDTH, HEIGHT } from "./brand";

const calculateMetadata = async ({ props }: { props: KerntemperaturProps }) => {
  const szenen = props.szenen || [];
  if (szenen.length === 0) return { durationInFrames: FPS * 60 };
  const ende = Math.max(...szenen.map((s) => s.start + s.dauer));
  return { durationInFrames: Math.round(ende * FPS) };
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Kerntemperatur"
    component={Kerntemperatur}
    durationInFrames={FPS * 60}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ szenen: [] } as unknown as KerntemperaturProps}
    calculateMetadata={calculateMetadata}
  />
);

registerRoot(RemotionRoot);
