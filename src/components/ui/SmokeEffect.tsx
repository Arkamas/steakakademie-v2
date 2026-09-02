'use client';

import { m as motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

// ── Feste Puff-Konfigurationen — kein Math.random() (SSR-sicher) ─────────────
interface PuffConfig {
  id: number;
  delay: number;   // Startverzögerung (s)
  x: number;       // px vom linken Rand des Containers
  size: number;    // Durchmesser (px)
  drift: number;   // horizontale Drift (px, positiv = nach rechts)
  duration: number; // Animationsdauer (s)
}

const PUFFS: PuffConfig[] = [
  { id: 0, delay: 0,    x: 8,  size: 55,  drift: 10,  duration: 8    },
  { id: 1, delay: 2.8,  x: 38, size: 80,  drift: -8,  duration: 10.5 },
  { id: 2, delay: 5.2,  x: 18, size: 45,  drift: 14,  duration: 7    },
  { id: 3, delay: 1.4,  x: 52, size: 70,  drift: -12, duration: 9.5  },
  { id: 4, delay: 7,    x: 28, size: 90,  drift: 6,   duration: 12   },
  { id: 5, delay: 3.6,  x: 4,  size: 60,  drift: -4,  duration: 8.5  },
  { id: 6, delay: 9,    x: 44, size: 50,  drift: 16,  duration: 7.5  },
  { id: 7, delay: 6.3,  x: 22, size: 75,  drift: -7,  duration: 11   },
];

// ── Einzel-Rauchpuff ──────────────────────────────────────────────────────────
function SmokePuff({
  config,
  containerWidth,
  side,
}: {
  config: PuffConfig;
  containerWidth: number;
  side: 'left' | 'right';
}) {
  const xPos =
    side === 'left'
      ? config.x
      : containerWidth - config.x - config.size;

  const driftX = side === 'left' ? config.drift : -config.drift;

  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: -config.size,
        left: xPos,
        width: config.size,
        height: config.size,
        borderRadius: '50%',
        // Warmes Grau — passend zur dunklen BBQ-Ästhetik
        background:
          'radial-gradient(circle at center, rgba(210,185,155,0.26) 0%, rgba(170,145,115,0.12) 45%, transparent 72%)',
        filter: `blur(${Math.round(config.size * 0.28)}px)`,
        willChange: 'transform, opacity',
      }}
      animate={{
        y: [0, -320, -720, -1100],
        x: [0, driftX * 0.4, driftX, driftX * 0.7],
        scale: [0.35, 0.9, 1.7, 2.6],
        opacity: [0, 0.91, 0.55, 0],
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        repeat: Infinity,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.25, 0.65, 1],
      }}
    />
  );
}

// ── Eine Rauchseite ───────────────────────────────────────────────────────────
const CONTAINER_WIDTH = 110; // px

function SmokeSide({ side }: { side: 'left' | 'right' }) {
  const maskDir = side === 'left' ? 'to right' : 'to left';
  const maskGradient = `linear-gradient(${maskDir}, rgba(0,0,0,1.0) 0%, rgba(0,0,0,0.61) 55%, transparent 100%)`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        [side]: 0,
        bottom: 0,
        top: 0,
        width: CONTAINER_WIDTH,
        pointerEvents: 'none',
        zIndex: 8,
        overflow: 'hidden',
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
      }}
    >
      {PUFFS.map((puff) => (
        <SmokePuff
          key={puff.id}
          config={puff}
          containerWidth={CONTAINER_WIDTH}
          side={side}
        />
      ))}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function SmokeEffect() {
  // Barrierefreiheit: Nutzer die Bewegung reduziert haben bekommen keinen Rauch
  const shouldReduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  // Performance: nur auf Desktop rendern.
  // Auf Mobile (< 1024px) ist der Rand-Rauch kaum sichtbar, kostet aber
  // GPU-Performance durch 16 Blur-Filter-Animationen → Scroll-Jank.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (shouldReduce || !isDesktop) return null;

  return (
    <>
      <SmokeSide side="left" />
      <SmokeSide side="right" />
    </>
  );
}
