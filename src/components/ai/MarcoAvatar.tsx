'use client';

import { useRef, useState, useEffect } from 'react';
import { m as motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { AvatarState } from '@/hooks/useAvatarStateMachine';

// ── Video-Assets (werden in /public/videos/marco/ abgelegt) ──────────────────

const VIDEO: Partial<Record<AvatarState, { src: string; loop: boolean }>> = {
  greeting:   { src: '/videos/marco/greeting.mp4',   loop: false },
  idle:       { src: '/videos/marco/idle.mp4',        loop: true  },
  listening:  { src: '/videos/marco/listening.mp4',   loop: true  },
  thinking:   { src: '/videos/marco/thinking.mp4',    loop: true  },
  responding: { src: '/videos/marco/responding.mp4',  loop: true  },
  farewell:   { src: '/videos/marco/farewell.mp4',    loop: false },
};

// ── Glow-Ring je State ────────────────────────────────────────────────────────

const GLOW: Record<AvatarState, string> = {
  hidden:     '0 0 0px rgba(210,125,45,0)',
  greeting:   '0 0 0 2px #C8882A, 0 0 24px rgba(210,125,45,0.7), 0 0 48px rgba(210,125,45,0.3)',
  idle:       '0 0 0 1.5px rgba(200,136,42,0.6), 0 0 12px rgba(210,125,45,0.25)',
  listening:  '0 0 0 2px rgba(180,60,0,0.8), 0 0 18px rgba(180,60,0,0.4)',
  thinking:   '0 0 0 2px rgba(245,166,35,0.7), 0 0 14px rgba(245,166,35,0.35)',
  responding: '0 0 0 2px #F5A623, 0 0 22px rgba(245,166,35,0.55), 0 0 44px rgba(245,166,35,0.2)',
  farewell:   '0 0 0 1px rgba(200,136,42,0.3), 0 0 8px rgba(210,125,45,0.1)',
};

// ── rotateY pro State:
// 0°   = Vorderseite sichtbar (Marco schaut den User an)
// 180° = Rückseite sichtbar  (Marco steht am Grill, Rücken zum User)
// ─────────────────────────────────────────────────────────────────────────────

const ROTATIONS: Record<AvatarState, number> = {
  hidden:     180,  // Rückseite (Widget geschlossen)
  greeting:   180,  // Rückseite (Widget öffnet — Marco steht am Grill)
  idle:       180,  // Rückseite (wartet am Grill)
  listening:  180,  // Rückseite (User tippt — Marco noch am Grill)
  thinking:   0,    // Vorderseite — Framer animiert auto 180→0
  responding: 0,    // Vorderseite (antwortet)
  farewell:   180,  // Rückseite — dreht sich zurück zum Grill beim Schließen
};

// ── CSS-Fallback-Animationen je State ─────────────────────────────────────────

const FALLBACK_VARIANTS: Record<AvatarState, { opacity: number; scale: number }> = {
  hidden:     { opacity: 1, scale: 1 },    // Button immer sichtbar (Rücken am Grill)
  greeting:   { opacity: 1, scale: 1 },
  idle:       { opacity: 1, scale: 1 },
  listening:  { opacity: 1, scale: 1.04 },
  thinking:   { opacity: 1, scale: 1 },
  responding: { opacity: 1, scale: 1 },
  farewell:   { opacity: 0.7, scale: 0.95 },
};

// ── Idle-Float-Keyframes ──────────────────────────────────────────────────────

const IDLE_FLOAT = {
  y: [0, -4, 0],
  transition: { duration: 2.8, ease: 'easeInOut', repeat: Infinity },
};

const THINKING_PULSE = {
  scale: [1, 1.05, 1],
  transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  state: AvatarState;
  onGreeted?: () => void;
  onClosed?: () => void;
  size?: 'sm' | 'md';       // sm = 36px, md = 56px
  className?: string;
  portraitSrc?: string;      // Front: Marco schaut den User an
  backFaceSrc?: string;      // Back:  Marco am Grill, Rücken zum User
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarcoAvatar({
  state,
  onGreeted,
  onClosed,
  size = 'md',
  className = '',
  portraitSrc,
  backFaceSrc,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  // MotionConfig reducedMotion="user" schaltet Transform-Animationen ab. Die beiden
  // Endlos-Ladeindikatoren unten bestuenden dann nur noch aus Transform und stuenden
  // still — sie brauchen einen Opacity-Ersatz, damit die Rueckmeldung erhalten bleibt.
  const reduce = useReducedMotion();

  const dim = size === 'sm' ? 36 : 56;

  // Video-Steuerung: src wechseln + play/loop je State
  useEffect(() => {
    const el = videoRef.current;
    const clip = VIDEO[state];
    if (!el || !clip) {
      setVideoReady(false);
      return;
    }

    setVideoReady(false);
    el.src = clip.src;
    el.loop = clip.loop;
    el.load();

    const handleCanPlay = () => {
      setVideoReady(true);
      el.play().catch(() => setVideoReady(false));
    };
    const handleError = () => setVideoReady(false);

    el.addEventListener('canplaythrough', handleCanPlay);
    el.addEventListener('error', handleError);
    return () => {
      el.removeEventListener('canplaythrough', handleCanPlay);
      el.removeEventListener('error', handleError);
    };
  }, [state]);

  // State-spezifische Animationssteuerung für den Framer-Wrapper
  const extraAnimate = state === 'idle'      ? IDLE_FLOAT
                     : state === 'thinking'  ? THINKING_PULSE
                     : {};

  const rotateY = ROTATIONS[state];

  function handleAnimationComplete() {
    if (state === 'greeting') onGreeted?.();
    if (state === 'farewell') onClosed?.();
  }

  return (
    <div
      style={{ width: dim, height: dim, perspective: '600px' }}
      className={`shrink-0 ${className}`}
    >
      {/* Rotierendes Karten-Element — preserve-3d für echten Front/Back-Flip */}
      <motion.div
        className="relative w-full h-full"
        style={{
          boxShadow: GLOW[state],
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          ...FALLBACK_VARIANTS[state],
          rotateY,
          ...extraAnimate,
        }}
        transition={{
          rotateY:   { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          opacity:   { duration: 0.3 },
          scale:     { duration: 0.3 },
          boxShadow: { duration: 0.4 },
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        {/* ── VORDERSEITE: Marco schaut den User an ────────────────────────── */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden bg-[#0D0D0D] flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Fallback: Portrait oder Initiale */}
          {portraitSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portraitSrc}
              alt="Marco"
              width={dim}
              height={dim}
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="font-serif font-bold text-brand-gold select-none"
              style={{ fontSize: size === 'sm' ? '14px' : '22px' }}
            >
              M
            </span>
          )}

          {/* Responding-Overlay: goldener Pulse-Ring */}
          <AnimatePresence>
            {state === 'responding' && (
              <motion.div
                key="responding-ring"
                className="absolute inset-0 rounded-full border-2 border-brand-gold"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={reduce
                  ? { opacity: [0.5, 0.15, 0.5] }
                  : { opacity: [0.6, 0, 0.6], scale: [0.85, 1.15, 0.85] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>

          {/* Thinking-Overlay: rotierender Sektor-Ring */}
          <AnimatePresence>
            {state === 'thinking' && (
              <motion.div
                key="thinking-ring"
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(245,166,35,0) 0%, rgba(245,166,35,0.6) 25%, rgba(245,166,35,0) 50%)',
                }}
                animate={reduce ? { opacity: [1, 0.35, 1] } : { rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={reduce
                  ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </AnimatePresence>

          {/* Video-Overlay (faded-in sobald Asset vorhanden) */}
          <motion.video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            playsInline
            muted
            animate={{ opacity: videoReady ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          />
        </div>

        {/* ── RÜCKSEITE: Marco am Smoker/Grill — Rücken zum User ───────────── */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden bg-[#0D0D0D] flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',  // Rückseite: um 180° vorgedreht
          }}
        >
          {backFaceSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backFaceSrc}
              alt="Marco am Grill"
              width={dim}
              height={dim}
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Ember-Glow-Fallback wenn kein Bild vorhanden */
            <div className="w-full h-full flex items-center justify-center bg-[#1a0a00]">
              <span
                className="font-serif font-bold select-none"
                style={{
                  fontSize: size === 'sm' ? '14px' : '22px',
                  color: 'rgba(210,125,45,0.7)',
                }}
              >
                🔥
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
