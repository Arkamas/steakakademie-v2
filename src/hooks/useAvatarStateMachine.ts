'use client';

import { useReducer, useCallback } from 'react';

// ── States ───────────────────────────────────────────────────────────────────

export type AvatarState =
  | 'hidden'      // Widget geschlossen, Marco ist weggekehrt
  | 'greeting'    // Umdreh-Animation: Marco dreht sich zur Kamera
  | 'idle'        // Ruhezustand — sanfte Loop-Animation
  | 'listening'   // Nutzer tippt / wartet auf Eingabe
  | 'thinking'    // KI verarbeitet Anfrage
  | 'responding'  // KI streamt Antwort
  | 'farewell';   // Widget schließt — Marco dreht sich weg

export type AvatarEvent =
  | 'OPEN'
  | 'GREETED'       // Umdreh-Animation beendet
  | 'USER_TYPING'
  | 'IDLE'          // Input leer / Eingabe gestoppt
  | 'SUBMIT'
  | 'STREAM_START'
  | 'STREAM_DONE'
  | 'CLOSE'
  | 'CLOSED';       // Farewell-Animation beendet

// ── Transition table ─────────────────────────────────────────────────────────

const TRANSITIONS: Record<AvatarState, Partial<Record<AvatarEvent, AvatarState>>> = {
  hidden:     { OPEN:         'greeting'   },
  greeting:   { GREETED:      'idle',       CLOSE: 'farewell'  },
  idle:       { USER_TYPING:  'listening',  CLOSE: 'farewell', SUBMIT: 'thinking' },
  listening:  { SUBMIT:       'thinking',   IDLE:  'idle',     CLOSE:  'farewell' },
  thinking:   { STREAM_START: 'responding', STREAM_DONE: 'idle', CLOSE: 'farewell' },
  responding: { STREAM_DONE:  'idle',       CLOSE: 'farewell'  },
  farewell:   { CLOSED:       'hidden',     OPEN:  'greeting'  },
};

function reducer(state: AvatarState, event: AvatarEvent): AvatarState {
  return TRANSITIONS[state]?.[event] ?? state;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAvatarStateMachine() {
  const [state, dispatch] = useReducer(reducer, 'hidden');
  const send = useCallback((event: AvatarEvent) => dispatch(event), []);
  return { state, send };
}
