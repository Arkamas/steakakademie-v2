# 001 — Animate the ArbeitszeitPlaner first-run mask (entrance + exit)

- **Status**: TODO
- **Commit**: dd322a1
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Cohesion & tokens
- **Estimated scope**: 1 file, ~15 lines changed

## Problem

`src/components/gruendung/ArbeitszeitPlaner.tsx:180` renders a modal mask that
**opens automatically on a user's first visit** — `setMaskOpen(true)` fires from the
load effect at lines 127 and 130 when no `configured` flag is found in
localStorage. It is the first thing a new Gründer-Schmiede visitor sees.

It appears with zero motion: a full-viewport dimmed backdrop and a dialog snap
into existence between two frames.

```tsx
/* src/components/gruendung/ArbeitszeitPlaner.tsx:179-182 — current */
      {/* Maske */}
      {maskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-sm border border-border-subtle bg-surface-base p-6 shadow-xl">
```

```tsx
/* src/components/gruendung/ArbeitszeitPlaner.tsx:215-220 — current (close path) */
              <button
                onClick={() => setMaskOpen(false)}
                className="rounded-sm bg-brand-fire px-5 py-2 font-sans text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Timetable bauen
              </button>
```

Closing is equally abrupt: `setMaskOpen(false)` unmounts the subtree instantly,
so the mask vanishes with no exit at all.

Why it matters: this is the **only** modal in the codebase that does not animate.
`src/components/recipe/RecipeSubmitModal.tsx:241` and
`src/components/ui/ExitIntent.tsx:78` both spring in with a matched backdrop fade.
A user who meets the abrupt one first reads the whole Gründer-Schmiede area as
less finished than the rest of the site. Frequency is first-run/rare, which is
exactly the tier where a standard modal animation is warranted.

## Target

Backdrop fades; panel fades, rises slightly and scales up from 0.97. Exit is
faster than entrance. Movement is dropped — but opacity feedback kept — under
`prefers-reduced-motion`.

```tsx
/* target — backdrop */
<motion.div
  key="mask-backdrop"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
>
```

```tsx
/* target — panel (reduce === false) */
<motion.div
  initial={{ opacity: 0, scale: 0.97, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.16 } }}
  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
  className="w-full max-w-lg rounded-sm border border-border-subtle bg-surface-base p-6 shadow-xl"
>
```

```tsx
/* target — panel (reduce === true): opacity only, no transform */
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0, transition: { duration: 0.12 } }}
transition={{ duration: 0.15 }}
```

Exact values and where each comes from:

| Value | Source |
| --- | --- |
| `{ type: 'spring', stiffness: 300, damping: 26 }` | `src/components/recipe/RecipeSubmitModal.tsx:260`, verbatim |
| `scale: 0.97` | `src/components/ui/ExitIntent.tsx:95`, verbatim |
| Exit as a fixed short duration, not a spring | `src/components/recipe/RecipeSubmitModal.tsx:259` (`exit={{ …, transition: { duration: 0.18 } }}`) |
| `ease: [0, 0, 0.2, 1]` | Tailwind `ease-out`, written literally at `src/app/globals.css:194` — the repo's only easing curve |
| `y: 12` (not `-24`) | `ExitIntent` enters downward because it sits at `top-[10%]`. This mask is vertically centered (`items-center`), so it rises from below. |

Do **not** add `transform-origin`. The dialog is centered; `center` is correct for
modals and needs no declaration.

## Repo conventions to follow

- This repo has **no easing custom properties**. There is no `--ease-out`. Use the
  literal cubic-bezier array `[0, 0, 0.2, 1]` in Framer, or the Tailwind class
  `ease-out`. Do not introduce a token file.
- framer-motion v11 is already a dependency (`package.json`). Do not add anything.
- Reduced motion in Framer components is handled with the `useReducedMotion()`
  hook, not with CSS. Five components already do this — **exemplar:
  `src/components/diplome/MedalCeremony.tsx:50`** (`const reduce = useReducedMotion();`,
  then branching the variants). `src/app/globals.css:384` documents this split
  explicitly: "Framer-Motion-Komponenten regeln es ueber useReducedMotion."
- **Primary exemplar to imitate: `src/components/recipe/RecipeSubmitModal.tsx:241-264`** —
  `AnimatePresence` wrapping a keyed backdrop `motion.div` and a keyed panel
  `motion.div`.
- The file is already `'use client'` (line 1). No directive change needed.

## Steps

1. In `src/components/gruendung/ArbeitszeitPlaner.tsx`, extend the React import
   on line 3 and add a framer-motion import directly beneath it:

   ```tsx
   import { useEffect, useMemo, useState } from 'react';
   import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
   ```

2. Inside the `ArbeitszeitPlaner` component, immediately after the state
   declarations (after line 115, `const [ntEffort, setNtEffort] = useState('2');`),
   add:

   ```tsx
   const reduce = useReducedMotion();
   ```

3. Still inside the component and **after** the `if (!loaded)` early return at
   lines 173-175 — placement matters only for readability; before the `return (`
   on line 177 — add the two variant objects:

   ```tsx
   // Modal-Motion: Feder wie RecipeSubmitModal, Ausgang bewusst kuerzer als der
   // Eingang. Bei prefers-reduced-motion bleibt die Deckkraft als Rueckmeldung,
   // Verschiebung und Skalierung entfallen (siehe globals.css REDUCED MOTION).
   const maskePanelMotion = reduce
     ? {
         initial: { opacity: 0 },
         animate: { opacity: 1 },
         exit: { opacity: 0, transition: { duration: 0.12 } },
         transition: { duration: 0.15 },
       }
     : {
         initial: { opacity: 0, scale: 0.97, y: 12 },
         animate: { opacity: 1, scale: 1, y: 0 },
         exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.16 } },
         transition: { type: 'spring' as const, stiffness: 300, damping: 26 },
       };
   ```

4. Replace lines 179-181 — the comment, the `{maskOpen && (` opener and the
   backdrop `div` — with an `AnimatePresence` wrapper and a `motion.div` backdrop.
   Keep the `className` string byte-for-byte identical:

   ```tsx
   {/* Maske */}
   <AnimatePresence>
     {maskOpen && (
       <motion.div
         key="mask-backdrop"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
       >
   ```

   Do **not** pass `initial={false}` to `AnimatePresence`. The default is what
   makes the first-run entrance play at all.

5. Change the panel `div` on line 182 to a `motion.div` spreading the variants
   from step 3. The `className` is unchanged:

   ```tsx
   <motion.div
     {...maskePanelMotion}
     className="w-full max-w-lg rounded-sm border border-border-subtle bg-surface-base p-6 shadow-xl"
   >
   ```

6. Close the new elements at the end of the mask block (currently lines 222-224):
   the panel closes as `</motion.div>`, the backdrop closes as `</motion.div>`,
   then `)}`, then `</AnimatePresence>`. Verify the JSX nests as
   `AnimatePresence > motion.div(backdrop) > motion.div(panel)`.

## Boundaries

- Do NOT touch any other part of `ArbeitszeitPlaner.tsx`: not the task list, not
  the timetable, not the `weekly <= 0` warning at line 261, not the `toggleDone`
  checkbox at line 280. Those are separate findings with their own plans.
- Do NOT touch `RecipeSubmitModal.tsx`, `ExitIntent.tsx`, or any other component.
  They are read-only reference material here.
- Do NOT change any `className` string, any copy, any layout, or the
  localStorage/`configured` logic. Motion wrappers only.
- Do NOT add `role="dialog"`, `aria-modal`, an Escape handler, or a focus trap.
  This mask is genuinely missing all four (unlike `ExitIntent.tsx:96-98`), but
  that is an accessibility fix, not a motion fix — see "Noted, out of scope".
- Do NOT add dependencies. framer-motion v11 is already installed.
- Do NOT add easing custom properties or a token file to `globals.css`.
- If any step does not match the code you find (the repo has drifted since
  commit `dd322a1`), STOP and report which step mismatched. Do not improvise.

## Verification

- **Mechanical**: `npm run build` — must exit 0. Note for the executor: per
  `CLAUDE.md` section A, this repo's `node_modules` is a **Windows** install;
  `npm run build` and `tsc` only run in the Windows session. If you are on Linux,
  do NOT attempt the build — report that it was not run rather than reporting green.
  A syntax-only fallback that works anywhere: parse the file with the TypeScript
  parser and assert `parseDiagnostics.length === 0`. That catches JSX nesting
  mistakes from steps 4-6 but proves nothing about types.
- **Feel check**: `npm run dev`, open `/gruender-schmiede/planer`, then in DevTools
  Application → Local Storage delete the planner key and reload to re-trigger the
  first run. Confirm:
  - The mask **animates on that first automatic open** — this is the whole point,
    and it is the step most likely to silently fail if `initial={false}` crept
    onto `AnimatePresence`.
  - The backdrop fades in together with the panel; the backdrop must not appear
    a frame ahead as a hard black flash.
  - Clicking "Timetable bauen" plays a visible exit. Before this change the mask
    vanished instantly; if it still vanishes instantly, `AnimatePresence` is not
    wrapping the conditional correctly.
  - Reopening via the "Zeiten ändern" button (line 247) animates the same way.
  - Open and close it rapidly several times — the panel should retarget smoothly
    from wherever it is, never jump to `scale(0.97)` and restart.
  - DevTools → Animations panel at 10% playback: the panel scales **up** from
    0.97 to 1, never from 0, and the spring settles without visible overshoot
    (damping 26 against stiffness 300 is near-critical — any bounce means the
    values were transcribed wrong).
  - DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`, then reload
    and re-trigger: the panel must fade only. No scale, no vertical movement.
- **Done when**: the mask enters and exits with motion on both the automatic
  first-run open and the manual reopen; reduced motion yields a pure fade; no
  `className`, copy, or logic elsewhere in the file differs from `dd322a1`
  (`git diff --stat` should show one file and roughly 15-25 changed lines).

## Noted, out of scope

Found while specifying this plan; deliberately NOT part of it, and worth its own
ticket: the mask has no `role="dialog"`, no `aria-modal="true"`, no `aria-label`,
no Escape-to-close, and no focus trap or focus return. `ExitIntent.tsx:96-98` and
`RecipeSubmitModal.tsx:262-265` all have the ARIA attributes; `ExitIntent.tsx:70-76`
adds the Escape handler. Since this dialog opens *unprompted* on first visit and
covers the whole viewport, a keyboard user currently has no advertised way out.
That is a more serious defect than the missing animation.
