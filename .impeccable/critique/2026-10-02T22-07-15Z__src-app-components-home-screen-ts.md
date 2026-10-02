---
target: start screen
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/juanbello/Documents/personal/domino/src/app/components/home-screen.ts"
target_fingerprint: "sha256:d2e62e33e62ef9751ac4df9de0b4a7c65e362aff3a61b348d8d2cb9e3fb51290"
target_path: /Users/juanbello/Documents/personal/domino/src/app/components/home-screen.ts
timestamp: 2026-10-02T22-07-15Z
slug: src-app-components-home-screen-ts
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | "Preparada" line and undo naming are good; the hero never reflects state |
| 2 | Match System / Real World | 3 | "Puntos rápidos +30" unexplained |
| 3 | User Control and Freedom | 3 | Every start undoable, but only for 3 s |
| 4 | Consistency and Standards | 3 | Chevron on the band vs arrow on Revancha for the same "plays now" |
| 5 | Error Prevention | 2 | Largest target discards a prepared, never-played setup |
| 6 | Recognition Rather Than Recall | 3 | Historial, Estadísticas, Mesas behind an unlabelled icon |
| 7 | Flexibility and Efficiency | 3 | Right after a personalised match, the same teams again costs two taps |
| 8 | Aesthetic and Minimalist Design | 3 | On iPhone with Revancha: six targets and a 348 px grid |
| 9 | Error Recovery | 3 | Undo copy names the loss; at 320 the bar covers the board's empty heading |
| 10 | Help and Documentation | 3 | Helpers right-sized; nothing explains a quick point |
| Total | | 29/40 | Good |

## Design Specificity Verdict
Specific on first run (liveries on the board's seam are the button; the fold is a real continuity, seam measured exact at six sizes). Drifts toward a banner over three equal slabs once Revancha shows on a small phone; the grid never shows the user's own teams. Detector: CLI and in-page overlay clean on Inicio, menu and Personalizar. Contrast all AA/AAA (letters 6.05:1 on orange, 16.6:1 on yellow). No overlaps or overflow at 390x844, 375x667, 320x640; touch targets all >= 48.

## Priority Issues
1. [P1] The grid has no visible keyboard focus ring: computed but painted over by the panels. Fix: draw it on a layer above. /impeccable harden
2. [P1] The hero is state-blind: always Equipo A vs B, even with a prepared setup or after Los Primos win; a prepared, never-played setup is lost after the 3 s undo. Conflicts with the recorded decision that quick match is always defaults. /impeccable shape
3. [P2] Strip-mode rules for VS and band are dead code (base rules come later): VS touches the band at 740x360, 8 px at iPhone 320x640. Fix: move the container blocks below the base rules. /impeccable adapt
4. [P2] Install hint outranks the product on an iPhone's first run: 131 px of prose between hero and choices. /impeccable distill
5. [P3] Signifiers and the first 100 ms of the hand-off: chevron vs arrow; Revancha looks like the navigating slabs; header and footer text superimposed, liveries blank for a beat. /impeccable polish

## Persona Red Flags
Casey: grid is 66% of the screen and resets a prepared setup; menu top-right; "Ahora no" 13 px above the first choice. Jordan: "Puntos rápidos +30" undefined; band's chevron reads as navigation. Sam: no visible ring on the grid though focus is sent there; no landmark at Inicio; Tab starts at Menú. Table scorer: real teams only at 13 px muted; Revancha and Personalizar differ by a 20 px glyph.

## Minor Observations
DESIGN.md contradictions (Moments still says slam/part; "8-second timer"; short-screen choices padding); "EQUIPO B" 5 px from the edge at 320 with Revancha; short-wide labels tight to the leaning edge; 16-char truncation reads as a fragment; board's VS tag covers Equipo B's 0 at 500 ms.

## Questions to Consider
If the grid is the match, why is it never their match? Does the band need to shimmer forever? Should a third choice change the composition instead of joining the stack?
