---
target: tables and statistics feats
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/juanbello/Documents/personal/domino/src/app/components/stats-screen.ts"
target_fingerprint: "sha256:4b66f483edce72cd24755c0c628d838604135751c8acf7480cc82f40862af090"
target_path: /Users/juanbello/Documents/personal/domino/src/app/components/stats-screen.ts
timestamp: 2026-09-29T14-35-21Z
slug: src-app-components-stats-screen-ts
---
Method: dual-agent (A: design review · B: detector + browser evidence). Scope: Mesas and Estadísticas.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Mesa hidden from the header line during a tournament |
| 2 | Match System / Real World | 3 | 100% from 1 match presented as the best |
| 3 | User Control and Freedom | 3 | 3 s undo for a 40-player mesa; row tap switches mesa |
| 4 | Consistency and Standards | 3 | Row selects on Mesas list, edits on mesa screen; new mesa skips Primera partida |
| 5 | Error Prevention | 2 | Accidental mesa switch; small-sample rankings |
| 6 | Recognition Rather Than Recall | 3 | Seat sheet up to 19 teams, no search |
| 7 | Flexibility and Efficiency | 2 | Locked step after every mesa match; no minimum matches |
| 8 | Aesthetic and Minimalist Design | 3 | Mesa screen one long scroll |
| 9 | Error Recovery | 3 | Clear inline errors; Quitar filtros |
| 10 | Help and Documentation | 2 | "Mesa: ninguna" unexplained in the menu |
| **Total** | | **27/40** | **Good** |

## Design Specificity
Authored for this product. Estadísticas is the generic leaderboard pattern in house style. Detector: 0 CLI findings (probe confirmed parsing). Overlay: all-caps-body real on "Los jugadores se escriben a mano." and the player detail line; clipped-overflow-container false positive. No contrast, target, naming, overflow, small-text or reduced-motion failures.

## Priority Issues
- [P1] Creating a mesa does not lead to playing at it (no Primera partida, re-tapping the active mesa is a no-op). Fix: open Primera partida on leaving a new mesa with 4+ players and an empty board; tapping the active mesa at an empty board opens it. /impeccable onboard
- [P1] Statistics ignore sample size: 1 de 1 ranks first with the lead keyline above 8 de 11. Fix: rank with +1 win +1 loss; muted "Menos de 5 partidas" section; "1 de 1 ganada". /impeccable clarify
- [P1] Tapping a mesa row switches mesa; editing behind a muted pencil. Fix: row opens the mesa; "Jugar en esta mesa" action; "En uso" on its own line. /impeccable layout
- [P2] 320@200% clipping (mesa name, seat name, menu team slab, couples ellipsised, seat-sheet title mid-word break); 740x360 menu mesa label and stats chrome taking half the height. /impeccable adapt
- [P2] Undo bar carries to the next screen over content; 3 s for mesa deletion relies on the confirmation. /impeccable harden

## Persona Red Flags
Casey: peek-tap switches mesa; locked step every match; seat sheet unordered, no search; keep switch below fold with 40 chips.
Sam: next-match lead sentence skipped; player list count not announced; shared places not announced; name field reached after wrap; Chrome focusable scroller on player detail.
Riley: renaming a player splits stats; deleting the active mesa orphans saved ids; player detail blank without message; 14-option mesa filter with no scroll hint.

## Minor Observations
Player detail repeats counts; mesa name shown three times; seat-sheet wins muted; "Fechas: Todo" reads oddly; long noTeams help; DESIGN.md overview counts outdated.

## Questions
Locked step every match vs opt-in rotation? Head-to-head instead of percentages? Offer a mesa when the same four names play twice?
