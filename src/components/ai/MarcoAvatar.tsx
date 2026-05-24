'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ── Glow-Ring je State (Tailwind box-shadow via style) ────────────────────────

const GLOW: Record<AvatarState, string> = {
  hidden:     '0 0 0px rgba(210,125,45,0)',
  greeting:   '0 0 0 2px #C8882A, 0 0 24px rgba(210,125,45,0.7), 0 0 48px rgba(210,125,45,0.3)',
  idle:       '0 0 0 1.5px rgba(200,136,42,0.6), 0 0 12px rgba(210,125,45,0.25)',
  listening:  '0 0 0 2px rgba(180,60,0,0.8), 0 0 18px rgba(180,60,0,0.4)',
  thinking:   '0 0 0 2px rgba(245,166,35,0.7), 0 0 14px rgba(245,166,35,0.35)',
  responding: '0 0 0 2px #F5A623, 0 0 22px rgba(245,166,35,0.55), 0 0 44px rgba(245,166,35,0.2)',
  farewell:   '0 0 0 1px rgba(200,136,42,0.3), 0 0 8px rgba(210,125,45,0.1)',
};

// ── CSS-Fallback-Animationen je State ─────────────────────────────────────────

const FALLBACK_VARIANTS = {
  hidden:     { opacity: 0, scale: 0.85 },
  greeting:   { opacity: 1, scale: 1 },
  idle:       { opacity: 1, scale: 1 },
  listening:  { opacity: 1, scale: 1.04 },
  thinking:   { opacity: 1, scale: 1 },
  responding: { opacity: 1, scale: 1 },
  farewell:   { opacity: 0.6, scale: 0.9 },
};

// ── Idle-Float-Keyframes (Framer Motion keyframe array) ───────────────────────

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
  portraitSrc?: string;      // optionales Portrait-Bild
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarcoAvatar({
  state,
  onGreeted,
  onClosed,
  size = 'md',
  className = '',
  portraitSrc,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

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

  // 3D-Umdreh-Rotation: greeting = -180→0, farewell = 0→180
  const rotateY = state === 'greeting' ? [-180, 0]
                : state === 'farewell' ? [0, 180]
                : 0;

  function handleAnimationComplete() {
    if (state === 'greeting') onGreeted?.();
    if (state === 'farewell') onClosed?.();
  }

  return (
    <div
      style={{ width: dim, height: dim, perspective: '300px' }}
      className={`shrink-0 ${className}`}
    >
      <motion.div
        className="relative rounded-full overflow-hidden w-full h-full bg-[#0D0D0D]"
        style={{ boxShadow: GLOW[state] }}
        variants={FALLBACK_VARIANTS}
        animate={{
          ...FALLBACK_VARIANTS[state],
          rotateY,
          ...extraAnimate,
        }}
        transition={{
          rotateY: { duration: state === 'greeting' ? 0.7 : 0.5, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.3 },
          scale:   { duration: 0.3 },
          boxShadow: { duration: 0.4 },
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        {/* Fallback: Portrait oder Initiale */}
        <div className="absolute inset-0 flex items-center justify-center">
          {portraitSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portraitSrc}
              alt="Marco"
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
        </div>

        {/* Responding-Overlay: goldener Pulse-Ring */}
        <AnimatePresence>
          {state === 'responding' && (
            <motion.div
              key="responding-ring"
              className="absolute inset-0 rounded-full border-2 border-brand-gold"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [0.85, 1.15, 0.85] }}
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
              animate={{ rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
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
      </motion.div>
    </div>
  );
}
