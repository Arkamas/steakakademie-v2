'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import Link from 'next/link';
import MarcoAvatar from './MarcoAvatar';
import { useAvatarStateMachine } from '@/hooks/useAvatarStateMachine';

const SUGGESTIONS = [
  'Welcher Cut ist am besten für Anfänger?',
  'Was ist Reverse Sear und wie funktioniert es?',
  'Wie erkenne ich ob mein Steak medium rare ist?',
  'Mein Steak ist grau geworden — was tun?',
];

// ── Bilder: Vorderseite (Portrait) + Rückseite (am Grill) ────────────────────
const MARCO_PORTRAIT  = '/images/authors/marco-richter.jpg';
const MARCO_BACK      = '/images/marco-back.jpg';

export default function MarcoWidget() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevIsLoading = useRef(false);

  // Zustandsmaschine
  const { state: avatarState, send } = useAvatarStateMachine();

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
  });

  // Widget öffnen / schließen
  const handleToggle = useCallback(() => {
    if (!open) {
      setOpen(true);
      setHasOpened(true);
      send('OPEN');
    } else {
      send('CLOSE');
      // Panel erst schließen wenn Farewell-Animation durch (onClosed)
    }
  }, [open, send]);

  // Farewell-Animation beendet → Panel schließen
  const handleAvatarClosed = useCallback(() => {
    send('CLOSED');
    setOpen(false);
  }, [send]);

  // Umdreh-Animation beendet → idle
  const handleAvatarGreeted = useCallback(() => {
    send('GREETED');
  }, [send]);

  // Nutzer tippt → listening / idle
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(e);
      if (e.target.value.trim()) {
        send('USER_TYPING');
      } else {
        send('IDLE');
      }
    },
    [handleInputChange, send]
  );

  // Submit → thinking
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      handleSubmit(e);
      send('SUBMIT');
    },
    [handleSubmit, send]
  );

  // isLoading-Übergang → STREAM_START / STREAM_DONE
  useEffect(() => {
    if (isLoading && !prevIsLoading.current) send('STREAM_START');
    if (!isLoading && prevIsLoading.current)  send('STREAM_DONE');
    prevIsLoading.current = isLoading;
  }, [isLoading, send]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSuggestion(text: string) {
    setInput(text);
    send('USER_TYPING');
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!hasOpened && (
          <motion.button
            onClick={handleToggle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-brand-gold/40 bg-text-primary px-4 py-2 text-xs text-brand-gold shadow-xl font-sans cursor-pointer hover:border-brand-gold/70 transition-colors"
          >
            Frag Marco — deinen KI-BBQ-Guide 🥩
          </motion.button>
        )}

        <button
          onClick={handleToggle}
          className="relative"
          aria-label="KI-Assistent Marco öffnen — Chatbot, keine echte Person"
          aria-expanded={open}
        >
          {/* X-Icon-Overlay beim Öffnen */}
          <AnimatePresence mode="wait">
            {open && (
              <motion.span
                key="close"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center rounded-full z-10 bg-[#0D0D0D]/80"
              >
                <X size={20} className="text-white" />
              </motion.span>
            )}
          </AnimatePresence>

          <span
            aria-hidden
            className="absolute -top-1 -right-1 z-20 rounded border border-brand-gold/50 bg-[#0D0D0D]/85 px-1 py-px text-[9px] font-sans font-bold tracking-wide text-brand-gold"
          >
            KI
          </span>
          <MarcoAvatar
            state={avatarState}
            onGreeted={handleAvatarGreeted}
            onClosed={handleAvatarClosed}
            size="md"
            portraitSrc={MARCO_PORTRAIT}
            backFaceSrc={MARCO_BACK}
          />
        </button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col border border-white/10 bg-surface-elevated shadow-2xl shadow-black/60 sm:w-[380px]"
            style={{ maxHeight: '520px' }}
          >
            {/* Panel-Header mit Avatar */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <MarcoAvatar
                state={avatarState}
                size="sm"
                portraitSrc={MARCO_PORTRAIT}
                backFaceSrc={MARCO_BACK}
              />
              <div>
                <p className="text-sm font-bold text-white font-sans">Marco</p>
                <p className="text-xs font-sans" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {avatarState === 'thinking'  ? 'Denkt nach…'
                 : avatarState === 'responding' ? 'Antwortet…'
                 : avatarState === 'listening'  ? 'Hört zu'
                 : 'Dein BBQ-Guide · Steakakademie'}
                </p>
                <p className="text-xs font-sans mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  KI-Assistent · Keine Rechts- oder Gesundheitsberatung
                </p>
              </div>
              <motion.div
                className="ml-auto h-2 w-2 rounded-full"
                animate={{
                  backgroundColor:
                    avatarState === 'thinking'  ? '#F5A623' :
                    avatarState === 'responding' ? '#B43C00' :
                    '#22c55e',
                  scale: isLoading ? [1, 1.4, 1] : 1,
                }}
                transition={{ scale: { duration: 0.8, repeat: Infinity } }}
              />
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ minHeight: '200px', maxHeight: '340px' }}
            >
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-center text-xs font-sans" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Als KI-Assistent beantwortet Marco deine BBQ-Fragen
                  </p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="w-full border border-white/15 bg-white/8 px-3 py-2 text-left text-xs font-sans text-white/70 transition-colors hover:border-brand-gold/40 hover:bg-white/10 hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m: Message) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed font-sans ${
                      m.role === 'user'
                        ? 'bg-brand-fire/70 text-white'
                        : 'bg-white/10 text-white/90'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-3 py-2">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-bounce motion-reduce:animate-none"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
            >
              <label htmlFor="marco-input" className="sr-only">Frage an Marco</label>
              <input
                id="marco-input"
                value={input}
                onChange={handleInput}
                placeholder="Deine BBQ-Frage…"
                disabled={isLoading}
                autoComplete="off"
                className="flex-1 border border-white/10 bg-white/5 px-3 py-2 text-sm font-sans text-white placeholder-white/30 focus:border-brand-gold/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-fire text-white transition-colors hover:bg-brand-fire/80 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Senden"
              >
                <Send size={14} />
              </button>
            </form>

            {/* KI-Offenlegung (EU AI Act Art. 50 Abs. 1). Kontrast-Fix 17.08.2026:
                stand vorher auf rgba(255,255,255,0.2) bei 10px — rechnerisch rund
                1,5:1 gegen den dunklen Panel-Grund und damit praktisch unlesbar.
                Ein Hinweis, den niemand lesen kann, ist kein Hinweis. */}
            <p className="px-4 pb-3 text-center text-[11px] font-sans" style={{ color: 'rgba(255,255,255,0.6)' }}>
              🤖 Marco ist ein KI-Assistent — keine Rechts-, Gesundheits- oder Steuerberatung.{' '}
              <Link href="/ki-disclaimer" className="underline hover:opacity-60 transition-opacity">
                KI-Hinweise
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
