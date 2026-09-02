# Animation plans

Implementation plans produced by the `improve-animations` skill. Each plan is
self-contained: an executor with no context from the originating conversation
should be able to follow it end to end.

Written against commit `dd322a1`. If the repo has drifted, a plan's step that no
longer matches the code is a STOP signal, not something to improvise around —
re-run `improve-animations reconcile` instead.

## Plans

| # | Title | Severity | Files | Status |
| --- | --- | --- | --- | --- |
| [001](001-arbeitszeitplaner-modal-motion.md) | Animate the ArbeitszeitPlaner first-run mask (entrance + exit) | MEDIUM | `src/components/gruendung/ArbeitszeitPlaner.tsx` | TODO |

## Execution order

Only one plan so far, so order is trivial. 001 has no dependencies and touches a
single file that no other planned work touches.

## Notes for future plans

Findings already identified but **not yet written up as plans** (from two
`find-animation-opportunities` sweeps). If any of these become plans, they belong
in this table, and the two marked below share a file with each other — not with 001.

- `StreitfallUmfrage.tsx:154` — the poll result bar carries
  `transition-all duration-500` but mounts already at its final width, so it
  never animates. Highest-leverage item found; fixes a dead transition rather
  than adding one.
- `RoadmapClient.tsx:1899` **and** `TaxCalculator.tsx:283` — the same defect
  twice: a rotating chevron over a panel that snaps open. Two call sites, so this
  wants one extracted collapse component rather than two inline fixes. Write
  these as a single plan.
- `TaxCalculator.tsx:194` and `:176` — result cards re-rank on every slider frame
  with no identity bridge, and country toggles add/remove cards instantly. Same
  file; likely one plan. Feel-check on a real device is mandatory here — a layout
  spring under a fast slider drag may fight the drag.
- `NewsletterSignup.tsx:147`, `ConsentBanner.tsx:52`, `CookCoach.tsx:146` —
  state changes that teleport (form→success swap, first-visit banner, completion
  message).
- `ArbeitszeitPlaner.tsx:280` — the done-checkbox swaps colours via inline style
  with no `transition` and no press feedback. Shares a file with 001; do it
  **after** 001 lands to avoid a conflicting diff.
- Press-feedback consistency: 12 components have zero `:active` state while
  `Header.tsx`, `RecipeSubmitModal.tsx`, `ProductCard.tsx` and `.btn-affiliate`
  all use `active:scale-[0.98] motion-reduce:active:scale-100`.
