/**
 * Steakakademie — Marken-Konstanten für die Videoproduktion.
 *
 * Kanonische Quelle: docs/openmontage/steakakademie.style.yaml
 * Farben zusätzlich abgeglichen mit tailwind.config.js der Website.
 * Änderungen hier und im Playbook synchron halten.
 */

export const BRAND = {
  bg: "#120C07",        // Marken-Dunkel
  bgLift: "#1C120A",    // Karten-/Flächenton
  gold: "#C8882A",      // Primär
  ember: "#E85018",     // Hitze/Warnung — sparsam
  text: "#E6D5C3",      // Pergament
  muted: "#9A8878",
  copper: "#8C5A22",
} as const;

export const FONT = {
  display: "Playfair Display Steak",
  sans: "DM Sans Steak",
} as const;

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * TikTok blendet UI über das Video. Alles Inhaltliche gehört zwischen
 * diese Grenzen, sonst verdeckt es die Caption-Leiste oder die Button-Spalte.
 */
export const SAFE = {
  top: 260,
  bottom: 520,
  side: 96,
} as const;
