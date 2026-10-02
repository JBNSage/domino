---
target: start screen
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/juanbello/Documents/personal/domino/src/app/components/home-screen.ts"
target_fingerprint: "sha256:149b2f1632538ffb783010040737252b280478479f5bb5bc92d54ded6ffe9184"
target_path: /Users/juanbello/Documents/personal/domino/src/app/components/home-screen.ts
timestamp: 2026-10-02T21-38-47Z
slug: src-app-components-home-screen-ts
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | A prepared personalised setup is invisible at Inicio; the facts line always states the defaults |
| 2 | Match System / Real World | 3 | VS, Equipo, Meta are table language; "Puntos rápidos +30" unexplained |
| 3 | User Control and Freedom | 3 | Quick match undoable, back to Inicio; but via a 3 s bar |
| 4 | Consistency and Standards | 3 | "Torneo" vs "Torneo nuevo"; two buttons wrapped in a nav landmark |
| 5 | Error Prevention | 2 | A 390x555 target discards a prepared setup with no sign |
| 6 | Recognition Rather Than Recall | 3 | User must remember they customised |
| 7 | Flexibility and Efficiency | 2 | No one-tap "same as last time" for regulars |
| 8 | Aesthetic and Minimalist Design | 3 | Strong and restrained; about 60% of each flood is empty |
| 9 | Error Recovery | 2 | Undo says "Partida rápida empezada", not what was replaced |
| 10 | Help and Documentation | 3 | Second lines and install hint clear |
| Total | | 26/40 | Acceptable |

## Design Specificity Verdict
Specific: the board's own liveries, seam, VS, Kanit italic and lean; not category-interchangeable. Gaps: the floods are mostly empty on tall screens; the grid (555 px) and the board lockup (about 380 px) do not share geometry, so the hand-off is a cross-fade of two compositions (double VS at 60 ms). Detector: CLI and in-page overlay on Inicio, the menu and Personalizar found 0 anti-patterns. Contrast: facts and help lines 9.9:1 dark / 7.1:1 light; band 18.9:1.

## Priority Issues
1. [P1] Quick match silently discards a prepared setup. Fix: show what is prepared on Personalizar's second line (or make it the hero while it exists); name the loss in the undo copy. /impeccable clarify
2. [P2] The grid and the board lockup do not share geometry; the hand-off double-exposes. Fix: make the top of the grid the board lockup's size and seam so parting reveals the same panels. /impeccable animate + layout
3. [P2] Empty floods (about 60% of each livery at 800+ px tall). Fix: poster-scale letter, bring the names down, or cap the grid. /impeccable layout
4. [P2] The hero ignores who plays (always Equipo A vs B). Note: defaults were the user's explicit choice; an added "Revancha" option is the alternative. /impeccable shape
5. [P3] Install hint rhythm: "Ahora no" inset 8 px; 5-6 visible actions with the hint. /impeccable polish

## Persona Red Flags
Casey: whole grid is a hot zone that can discard a setup; menu top-right. Jordan: "Puntos rápidos" unexplained; "Torneo" vs "Torneo nuevo". Sam: Tab starts at Menú; nav landmark around two buttons; undo announcement doesn't name the loss. Table scorer: "Equipo A / B" gives the table nothing to confirm; the meta is stated only in muted 15 px text.

## Minor Observations
Glint is a gradient while DESIGN.md says no gradients except a moment's light (document the exception); square focus ring on Menú; help lines wrap at 320; Personalizar stacks teams vertically while Inicio sets them side by side; lone "Cerrar" in the menu at Inicio.

## Questions to Consider
Should the hero become the last match's teams for regulars? Should Inicio be the 0-0 board lockup under a band? Should a prepared setup change what the hero does?
