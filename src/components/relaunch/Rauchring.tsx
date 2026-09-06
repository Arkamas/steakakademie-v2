/**
 * Markenzeichen „2b Rauchring" — die entschiedene Variante (Handoff-README,
 * Abschnitt Kopfzeile). Die acht anderen Entwürfe aus dem Prototyp werden
 * bewusst nicht implementiert. Zeichnung identisch mit
 * handoff/website-relaunch/assets/rauchring-mark.svg.
 *
 * `inner` ist die Farbe des innersten Rings — sie muss dem Grund entsprechen,
 * auf dem das Zeichen steht (#15120f auf dem Seitengrund, #201b17 auf Karten).
 */
export default function Rauchring({
  size = 40,
  inner = '#15120f',
  className,
}: {
  size?: number;
  inner?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ color: '#f4ede3', flex: 'none' }}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 34C24 18 46 12 64 16C82 20 92 36 88 54C84 72 68 86 48 86C28 86 12 74 12 56C12 48 14 42 18 34Z" fill="currentColor" />
      <path d="M26 38C31 26 47 21 62 24C76 27 84 40 80 54C77 67 65 78 49 78C33 78 21 69 21 56C21 49 23 44 26 38Z" fill="#e2531f" />
      <path d="M34 42C38 34 49 30 60 32C70 34 76 44 73 54C71 63 62 70 50 70C39 70 30 64 30 56C30 51 32 47 34 42Z" fill={inner} />
    </svg>
  );
}
