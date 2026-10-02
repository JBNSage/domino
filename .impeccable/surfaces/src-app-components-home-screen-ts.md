---
version: 1
slug: "src-app-components-home-screen-ts"
primary_target: "src/app/components/home-screen.ts"
related_targets: ["src/app/components/match-setup-screen.ts"]
---

# Inicio and Personalizar partida

Scope: the start screen shown over the board while nothing is being played (`src/app/components/home-screen.ts`), and the screen that sets up a personalised match (`src/app/components/match-setup-screen.ts`). Visitor mode: Operate.

Audience and job: the one person keeping score picks how the next game is played, in one tap for the usual match. Content: the two default teams, the default meta and quick points, the ways to personalise a match or start a tournament. Constraints: Spanish only, portrait phone, iOS Safari and Android Chrome, system font size, Reduce Motion, 48px targets. Inherits Liga de Carreras unchanged.

## Direction contract

THESIS: The starting grid. The two liveries, nose to nose on the board's own seam with VS between them, are the quick match itself. Refuses the category default of a title and three equal menu buttons.

OWN-WORLD: The board's world, unchanged: graphite or pit-silver ground, safety orange and acid yellow floods carrying graphite ink, the 12-degree lean on every filled shape, Kanit extra-bold italic capitals, the triple-slash mark as the only ornament.

STORY: Opening with nothing in play, the scorer sees the two sides already lined up and taps them to play. Anyone wanting other teams, players, meta or quick points, or a tournament, finds both one tap below in the thumb zone.

FIRST VIEWPORT: Header as the board's, with the mark and DOMINÓ in place of the meta slab. The two liveries fill the middle of the screen, names at the top, VS on the seam, an ink band "PARTIDA RÁPIDA ›" across their foot. A facts line under them. Two outlined slabs pinned at the bottom: "Personalizar partida" and "Torneo", each with one muted line.

SIGNATURE INTERACTION: Tapping the grid parts the two liveries while the board, already live beneath, plays its match-start slam; coming back to Inicio mid-session, the sides slam in and the VS lands. A light crosses the band every 2.4 s. Reduce Motion removes all of it.

FORM: Extension of an established world (Liga de Carreras); structure chosen with the user from three options (the grid, ranked first); no seed roll at extension scope.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: none.
