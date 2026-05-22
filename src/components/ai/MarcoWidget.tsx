'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

const SUGGESTIONS = [
  'Welcher Cut ist am besten für Anfänger?',
  'Was ist Reverse Sear und wie funktioniert es?',
  'Wie erkenne ich ob mein Steak medium rare ist?',
  'Mein Steak ist grau geworden — was tun?',
];

export default function MarcoWidget() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
  });

  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSuggestion(text: string) {
    setInput(text);
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!hasOpened && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-brand-gold/40 bg-text-primary px-4 py-2 text-xs text-brand-gold shadow-xl font-sans"
          >
            Frag Marco — deinen BBQ-Guide 🥩
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full overflow-hidden border-2 border-brand-gold shadow-lg shadow-brand-fire/20 transition-colors hover:border-brand-fire bg-text-primary"
          aria-label="BBQ-Guide Marco öffnen"
        >
          <AnimatePresence mode="wait">
            {open && (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-text-primary/90 rounded-full z-10"
              >
                <X size={20} className="text-white" />
              </motion.span>
            )}
          </AnimatePresence>
          {/* Marco Avatar — Initialen-Fallback */}
          <span className="font-serif text-2xl font-bold text-brand-gold select-none">M</span>
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col rounded-none border border-text-primary bg-text-primary shadow-2xl shadow-black/60 sm:w-[380px]"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/20 border border-brand-gold/40 shrink-0">
                <span className="font-serif text-sm font-bold text-brand-gold">M</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white font-sans">Marco</p>
                <p className="text-xs text-white/40 font-sans">Dein BBQ-Guide · Steakakademie</p>
              </div>
              <div className="ml-auto flex h-2 w-2 rounded-full bg-green-500" />
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ minHeight: '200px', maxHeight: '340px' }}
            >
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-center text-xs text-white/30 font-sans">Stell Marco deine BBQ-Frage</p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="w-full rounded-none border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/60 transition-colors hover:border-brand-gold/30 hover:text-white font-sans"
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
                          className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-bounce"
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
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
            >
              <label htmlFor="marco-input" className="sr-only">Frage an Marco</label>
              <input
                id="marco-input"
                value={input}
                onChange={handleInputChange}
                placeholder="Deine BBQ-Frage…"
                disabled={isLoading}
                autoComplete="off"
                className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-brand-gold/50 disabled:opacity-50 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand-fire text-white transition-colors hover:bg-brand-fire/80 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Senden"
              >
                <Send size={14} />
              </button>
            </form>

            <p className="px-4 pb-3 text-center text-[10px] text-white/20 font-sans">
              KI-Antworten können Fehler enthalten · Steakakademie.de
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
