/**
 * Steakakademie — Kerntemperatur-Erklärer (Vertical / TikTok).
 *
 * Zahlengetriebene Kinetic-Typo-Komposition. Bewusst ohne Stock-Material:
 * Bei diesem Thema IST die Zahl das Motiv, und der Free-Path hat (noch) keine
 * Bildquelle (Pexels/Pixabay brauchen Keys — siehe docs/openmontage-integration.md).
 *
 * Szenen und Timings kommen als Props aus timeline.json; die Szenenlängen sind
 * aus der real gemessenen Piper-Narration abgeleitet, nicht geschätzt.
 */

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, FONT, SAFE } from "./brand";
import { BrandFonts } from "./useBrandFonts";

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

export interface TempCard {
  label: string;
  sub: string;
  wert: string;
  ton: "gold" | "ember";
}

export interface Regel {
  nr: string;
  titel: string;
  text: string;
}

export interface Szene {
  id: string;
  typ: string;
  untertitel: string;
  start: number; // Sekunden
  dauer: number; // Sekunden
  audio: string; // staticFile-Pfad
  audioDelay: number; // Sekunden Vorlauf, bevor die Stimme einsetzt
  visual: Record<string, unknown>;
}

export interface KerntemperaturProps {
  [key: string]: unknown;
  szenen: Szene[];
}

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------

/** Weiches Ein-/Ausblenden am Szenenrand — hält den Schnitt ruhig (Playbook). */
const useSceneFade = (dauerFrames: number) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, 12, Math.max(13, dauerFrames - 12), dauerFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

const useRise = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 26, stiffness: 90, mass: 0.9 },
  });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
  };
};

// ---------------------------------------------------------------------------
// Hintergrund — Glut statt Farbverlaufs-Tapete
// ---------------------------------------------------------------------------

const Glut: React.FC<{ intensitaet?: number }> = ({ intensitaet = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const puls = 0.5 + 0.5 * Math.sin(frame / (fps * 2.6));
  const puls2 = 0.5 + 0.5 * Math.cos(frame / (fps * 3.9));

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      {/* Glutkern unten — die Wärmequelle sitzt immer unter dem Bild */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 45% at 50% ${104 + puls * 3}%,
            rgba(232, 80, 24, ${0.3 * intensitaet}) 0%,
            rgba(200, 136, 42, ${0.13 * intensitaet}) 38%,
            transparent 72%)`,
        }}
      />
      {/* Zweiter, kühlerer Schein oben links — bricht die Symmetrie */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 34% at ${22 + puls2 * 6}% 22%,
            rgba(200, 136, 42, ${0.11 * intensitaet}) 0%, transparent 65%)`,
        }}
      />
      {/* Vignette — zieht den Blick in die Mitte */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 78% 58% at 50% 45%, transparent 42%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Marco — der Avatar. Siehe docs/avatare/marco.md.
//
// Leitlinie von dort: Rücken/Hände sind der Normalzustand, das Gesicht ist die
// Ausnahme und markiert den Autoritätsmoment. Beide Quellbilder sind nur
// 512×512 — der Hintergrund läuft deshalb bewusst abgedunkelt und leicht
// unscharf als Stimmungsfläche, nicht als scharfes Motiv.
// ---------------------------------------------------------------------------

const MarcoHintergrund: React.FC<{ bild: string }> = ({ bild }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Langsames Heranfahren — Ruhe, kein Zoom-Effekt.
  const zoom = interpolate(frame, [0, fps * 9], [1.04, 1.13], {
    extrapolateRight: "clamp",
  });
  const auf = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: auf }}>
      <Img
        src={staticFile(bild)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
          filter: "brightness(0.42) saturate(1.08) blur(3px)",
        }}
      />
      {/* Nach unten abdunkeln, damit Text und Untertitel sicher tragen */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(18,12,7,0.55) 0%, rgba(18,12,7,0.2) 32%, rgba(18,12,7,0.86) 78%, ${BRAND.bg} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const MarcoPortrait: React.FC<{
  bild: string;
  groesse: number;
  delay?: number;
  label?: string;
  hinweis?: string;
}> = ({ bild, groesse, delay = 0, label, hinweis }) => {
  const st = useRise(delay);
  return (
    <div style={{ ...st, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: groesse,
          height: groesse,
          borderRadius: "50%",
          overflow: "hidden",
          border: `4px solid ${BRAND.gold}`,
          boxShadow: `0 0 42px rgba(232,80,24,0.34), 0 8px 30px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Die Quelle ist eine Halbfigur — ohne Zoom auf den Kopf wirkt Marco
            im Kreis verloren. transformOrigin zieht den Ausschnitt aufs Gesicht. */}
        <Img
          src={staticFile(bild)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.75)",
            transformOrigin: "52% 24%",
          }}
        />
      </div>
      {label && (
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "0.22em",
            color: BRAND.gold,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
      {hinweis && (
        <div
          style={{
            marginTop: 8,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 23,
            letterSpacing: "0.16em",
            color: BRAND.muted,
            textTransform: "uppercase",
          }}
        >
          {hinweis}
        </div>
      )}
    </div>
  );
};

/** Feines Korn — nimmt dem Digitalbild die Sterilität (Playbook: „warmes Filmkorn"). */
const Korn: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.055,
        mixBlendMode: "overlay",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "360px 360px",
        backgroundPosition: `${(frame * 7) % 360}px ${(frame * 11) % 360}px`,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const st = useRise(delay);
  return (
    <div
      style={{
        ...st,
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: "0.28em",
        color: BRAND.gold,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
};

const Unterzeile: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const st = useRise(delay);
  return (
    <div
      style={{
        ...st,
        fontFamily: FONT.sans,
        fontWeight: 500,
        fontSize: 46,
        lineHeight: 1.42,
        color: BRAND.text,
        maxWidth: 820,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Szene 1 — Hook: die Zahl
// ---------------------------------------------------------------------------

const HeroNumber: React.FC<{ visual: Record<string, unknown> }> = ({ visual }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ziel = parseInt(String(visual.zahl), 10);
  // Kurzer Zähllauf: die Zahl „rastet ein", statt einfach da zu sein.
  const zaehler = Math.round(
    interpolate(frame, [4, fps * 1.1], [ziel - 9, ziel], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const eingerastet = frame > fps * 1.1;

  const s = spring({ frame, fps, config: { damping: 22, stiffness: 70 } });
  const scale = interpolate(s, [0, 1], [0.9, 1]);
  const glow = eingerastet
    ? 40 + 14 * Math.sin((frame - fps * 1.1) / (fps * 0.7))
    : 16;

  return (
    <div style={zentriert}>
      <Kicker delay={2}>{String(visual.kicker)}</Kicker>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          transform: `scale(${scale})`,
          marginTop: 28,
          // Großzügig, sonst läuft die Unterzeile in die Ziffern:
          // Playfair-Ziffern ragen bei enger Zeilenhöhe aus ihrer Box.
          marginBottom: 78,
        }}
      >
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 900,
            fontSize: 430,
            lineHeight: 1,
            color: BRAND.text,
            textShadow: `0 0 ${glow}px rgba(232,80,24,0.55), 0 0 ${glow * 2.4}px rgba(200,136,42,0.28)`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {zaehler}
        </span>
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 1,
            color: BRAND.gold,
            marginTop: 42,
            marginLeft: 10,
          }}
        >
          {String(visual.einheit)}
        </span>
      </div>
      <Unterzeile delay={fps * 1.25}>{String(visual.unterzeile)}</Unterzeile>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Szene 2 — Statement: „Minuten lügen."
// ---------------------------------------------------------------------------

const Statement: React.FC<{ visual: Record<string, unknown> }> = ({ visual }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const z1 = useRise(2);
  const z2 = useRise(10);

  // Durchstreichen von „Minuten" — die Behauptung wird sichtbar kassiert.
  const strich = interpolate(frame, [fps * 0.9, fps * 1.6], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={zentriert}>
      <div style={{ ...z1, position: "relative" }}>
        <span style={grossZeile}>{String(visual.zeile1)}</span>
        <div
          style={{
            position: "absolute",
            left: -10,
            right: -10,
            top: "52%",
            height: 11,
            background: BRAND.ember,
            width: `${strich}%`,
            borderRadius: 6,
            boxShadow: `0 0 26px ${BRAND.ember}`,
          }}
        />
      </div>
      <div style={{ ...z2, marginBottom: 44 }}>
        <span style={{ ...grossZeile, color: BRAND.gold }}>
          {String(visual.zeile2)}
        </span>
      </div>
      <Unterzeile delay={fps * 1.1}>{String(visual.unterzeile)}</Unterzeile>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Szene 3 — Die vier Zahlen
// ---------------------------------------------------------------------------

const TempCards: React.FC<{ visual: Record<string, unknown> }> = ({ visual }) => {
  const { fps } = useVideoConfig();
  const karten = visual.karten as TempCard[];
  const titel = useRise(2);

  return (
    <div style={{ ...zentriert, justifyContent: "center" }}>
      <div
        style={{
          ...titel,
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 92,
          color: BRAND.text,
          marginBottom: 54,
        }}
      >
        {String(visual.titel)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, width: "100%" }}>
        {karten.map((k, i) => (
          <Karte key={k.label} karte={k} delay={10 + i * fps * 0.62} />
        ))}
      </div>
    </div>
  );
};

const Karte: React.FC<{ karte: TempCard; delay: number }> = ({ karte, delay }) => {
  const st = useRise(delay);
  const akzent = karte.ton === "ember" ? BRAND.ember : BRAND.gold;
  return (
    <div
      style={{
        ...st,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: BRAND.bgLift,
        borderLeft: `10px solid ${akzent}`,
        borderRadius: 14,
        padding: "30px 40px",
        boxShadow: "0 6px 26px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: "0.13em",
            color: BRAND.text,
          }}
        >
          {karte.label}
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 33,
            color: BRAND.muted,
            marginTop: 6,
          }}
        >
          {karte.sub}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 900,
            fontSize: 124,
            lineHeight: 0.9,
            color: akzent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {karte.wert}
        </span>
        <span
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 44,
            color: akzent,
            marginTop: 8,
            marginLeft: 4,
          }}
        >
          °C
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Szene 4 — Carryover
// ---------------------------------------------------------------------------

const Carryover: React.FC<{ visual: Record<string, unknown> }> = ({ visual }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const von = Number(visual.von);
  const bis = Number(visual.bis);

  const titel = useRise(2);
  const merk = useRise(fps * 2.6);

  // Die Zahl steigt nach — genau das, was der Satz behauptet.
  const wert = interpolate(frame, [fps * 0.9, fps * 2.4], [von, bis], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fortschritt = interpolate(frame, [fps * 0.9, fps * 2.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={zentriert}>
      <div
        style={{
          ...titel,
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 88,
          color: BRAND.text,
          marginBottom: 16,
        }}
      >
        {String(visual.titel)}
      </div>
      <div
        style={{
          fontFamily: FONT.sans,
          fontWeight: 500,
          fontSize: 42,
          color: BRAND.gold,
          marginBottom: 52,
        }}
      >
        {String(visual.unterzeile)}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 66 }}>
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 900,
            fontSize: 290,
            lineHeight: 1,
            color: BRAND.text,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 ${20 + fortschritt * 46}px rgba(232,80,24,${0.25 + fortschritt * 0.4})`,
          }}
        >
          {Math.round(wert)}
        </span>
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 104,
            color: BRAND.ember,
            marginTop: 30,
            marginLeft: 8,
          }}
        >
          °C
        </span>
      </div>

      {/* Balken: der Nachzieh-Korridor als Fläche, nicht als Behauptung */}
      <div
        style={{
          width: 760,
          height: 16,
          borderRadius: 10,
          background: "rgba(230,213,195,0.14)",
          overflow: "hidden",
          marginBottom: 46,
        }}
      >
        <div
          style={{
            width: `${fortschritt * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.ember})`,
            boxShadow: `0 0 22px ${BRAND.ember}`,
          }}
        />
      </div>

      <div
        style={{
          ...merk,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 50,
          color: BRAND.text,
          background: BRAND.bgLift,
          border: `2px solid ${BRAND.gold}`,
          borderRadius: 12,
          padding: "26px 38px",
          maxWidth: 860,
        }}
      >
        {String(visual.merksatz)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Szene 5 — Zwei Regeln
// ---------------------------------------------------------------------------

const TwoRules: React.FC<{ visual: Record<string, unknown> }> = ({ visual }) => {
  const { fps } = useVideoConfig();
  const regeln = visual.regeln as Regel[];
  const portrait = visual.portrait as string | undefined;

  return (
    <div style={{ ...zentriert, justifyContent: "center", gap: 56 }}>
      {/* Der Autoritätsmoment: hier zeigt Marco Gesicht (docs/avatare/marco.md §3) */}
      {portrait && (
        <MarcoPortrait
          bild={portrait}
          groesse={300}
          delay={2}
          label={visual.portraitLabel as string | undefined}
          hinweis={visual.portraitHinweis as string | undefined}
        />
      )}
      {regeln.map((r, i) => (
        <RegelZeile key={r.nr} regel={r} delay={fps * 0.7 + i * fps * 0.8} />
      ))}
    </div>
  );
};

const RegelZeile: React.FC<{ regel: Regel; delay: number }> = ({ regel, delay }) => {
  const st = useRise(delay);
  return (
    <div style={{ ...st, display: "flex", gap: 34, alignItems: "flex-start", textAlign: "left" }}>
      <div
        style={{
          flexShrink: 0,
          width: 104,
          height: 104,
          borderRadius: "50%",
          border: `4px solid ${BRAND.gold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 58,
          color: BRAND.gold,
        }}
      >
        {regel.nr}
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 76,
            color: BRAND.text,
            marginBottom: 14,
          }}
        >
          {regel.titel}
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 43,
            lineHeight: 1.4,
            color: BRAND.muted,
            maxWidth: 700,
          }}
        >
          {regel.text}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Szene 6 — CTA
// ---------------------------------------------------------------------------

const CTA: React.FC<{ visual: Record<string, unknown> }> = ({ visual }) => {
  const { fps } = useVideoConfig();
  const t = useRise(2);
  const u = useRise(12);
  const d = useRise(fps * 0.9);
  const h = useRise(fps * 1.6);

  const portrait = visual.portrait as string | undefined;

  return (
    <div style={zentriert}>
      {/* Signatur — der Absender bekommt ein Gesicht */}
      {portrait && (
        <div style={{ marginBottom: 40 }}>
          <MarcoPortrait bild={portrait} groesse={168} delay={0} />
        </div>
      )}
      <div
        style={{
          ...t,
          fontFamily: FONT.display,
          fontWeight: 900,
          fontSize: 116,
          color: BRAND.text,
          marginBottom: 20,
        }}
      >
        {String(visual.titel)}
      </div>
      <div
        style={{
          ...u,
          fontFamily: FONT.sans,
          fontWeight: 500,
          fontSize: 46,
          color: BRAND.muted,
          marginBottom: 64,
        }}
      >
        {String(visual.unterzeile)}
      </div>
      <div
        style={{
          ...d,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 58,
          letterSpacing: "0.05em",
          color: BRAND.bg,
          background: BRAND.gold,
          borderRadius: 14,
          padding: "26px 52px",
        }}
      >
        {String(visual.domain)}
      </div>
      {/* KI-Transparenz — Pflicht laut Briefing, gehört sichtbar ins Video */}
      <div
        style={{
          ...h,
          marginTop: 68,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "0.1em",
          color: BRAND.muted,
          textTransform: "uppercase",
        }}
      >
        {String(visual.hinweis)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Untertitel — Pflicht bei Vertical (Playbook)
// ---------------------------------------------------------------------------

const Untertitel: React.FC<{ text: string; dauerFrames: number }> = ({
  text,
  dauerFrames,
}) => {
  const frame = useCurrentFrame();
  const op = interpolate(
    frame,
    [0, 8, Math.max(9, dauerFrames - 8), dauerFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.side,
        right: SAFE.side,
        bottom: SAFE.bottom - 130,
        opacity: op,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.35,
          color: BRAND.text,
          background: "rgba(18,12,7,0.82)",
          borderRadius: 10,
          padding: "14px 24px",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Layout-Konstanten
// ---------------------------------------------------------------------------

const zentriert: React.CSSProperties = {
  position: "absolute",
  top: SAFE.top,
  bottom: SAFE.bottom,
  left: SAFE.side,
  right: SAFE.side,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const grossZeile: React.CSSProperties = {
  fontFamily: FONT.display,
  fontWeight: 900,
  fontSize: 168,
  lineHeight: 1.02,
  color: BRAND.text,
};

// ---------------------------------------------------------------------------
// Szenen-Router
// ---------------------------------------------------------------------------

const SzenenInhalt: React.FC<{ szene: Szene; dauerFrames: number }> = ({
  szene,
  dauerFrames,
}) => {
  const fade = useSceneFade(dauerFrames);
  let inhalt: React.ReactNode;

  switch (szene.typ) {
    case "hero_number":
      inhalt = <HeroNumber visual={szene.visual} />;
      break;
    case "statement":
      inhalt = <Statement visual={szene.visual} />;
      break;
    case "temp_cards":
      inhalt = <TempCards visual={szene.visual} />;
      break;
    case "carryover":
      inhalt = <Carryover visual={szene.visual} />;
      break;
    case "two_rules":
      inhalt = <TwoRules visual={szene.visual} />;
      break;
    case "cta":
      inhalt = <CTA visual={szene.visual} />;
      break;
    default:
      inhalt = null;
  }

  const hintergrund = szene.visual.hintergrund as string | undefined;

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {hintergrund && <MarcoHintergrund bild={hintergrund} />}
      {inhalt}
      <Untertitel text={szene.untertitel} dauerFrames={dauerFrames} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Hauptkomposition
// ---------------------------------------------------------------------------

export const Kerntemperatur: React.FC<KerntemperaturProps> = ({ szenen }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <BrandFonts />
      <Glut />

      {szenen.map((sz) => {
        const von = Math.round(sz.start * fps);
        const dauerFrames = Math.round(sz.dauer * fps);
        return (
          <Sequence key={sz.id} from={von} durationInFrames={dauerFrames} name={sz.id}>
            <SzenenInhalt szene={sz} dauerFrames={dauerFrames} />
            <Sequence from={Math.round(sz.audioDelay * fps)}>
              <Audio src={staticFile(sz.audio)} />
            </Sequence>
          </Sequence>
        );
      })}

      <Korn />
    </AbsoluteFill>
  );
};
