---
name: Dominó
description: Two-team domino scoreboard drawn as rival racing liveries on a graphite or pit-silver ground.
colors:
  team-a: "#FF5A00"
  team-b: "#DFFF00"
  ink: "#0E1114"
  on-ink: "#FFFFFF"
  ground-night: "#0E1114"
  surface-night: "#1A1E23"
  surface-raised-night: "#2A2F36"
  line-night: "#6B7480"
  text-night: "#FFFFFF"
  text-muted-night: "#B6BCC4"
  danger-night: "#FF6B5C"
  on-danger-night: "#0E1114"
  team-edge-night: "transparent"
  scrim-night: "rgb(0 0 0 / 0.72)"
  ground-day: "#F1F2F4"
  surface-day: "#FFFFFF"
  surface-raised-day: "#E1E4E8"
  line-day: "#7D858F"
  text-day: "#0E1114"
  text-muted-day: "#4A525B"
  danger-day: "#B3261E"
  on-danger-day: "#FFFFFF"
  team-edge-day: "#0E1114"
  scrim-day: "rgb(14 17 20 / 0.6)"
typography:
  winner:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(8.25rem, 158.4px)"
    fontWeight: 800
    lineHeight: 1.06
    fontFeature: "tnum"
  hull:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(4.75rem, 91.2px)"
    fontWeight: 800
    lineHeight: 1.05
    fontFeature: "tnum"
  display:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(3.5rem, 67.2px)"
    fontWeight: 800
    lineHeight: 1.15
  field:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(2.75rem, 52.8px)"
    fontWeight: 800
    lineHeight: 1.2
    fontFeature: "tnum"
  title:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(1.75rem, 44.8px)"
    fontWeight: 800
    lineHeight: 1.2
  button:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(1.25rem, 32px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.5px"
  compact:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(1.125rem, 28.8px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.5px"
  body:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(1rem, 25.6px)"
    fontWeight: 500
    lineHeight: 1.45
  meta:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(0.9375rem, 24px)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.4px"
    fontFeature: "tnum"
  label:
    fontFamily: "Kanit, sans-serif"
    fontSize: "min(0.8125rem, 20.8px)"
    fontWeight: 600
    lineHeight: 1.3
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  slab-button-outlined:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  slab-button-compact:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.compact}"
    padding: "0 16px"
    height: "48px"
  slab-button-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  slab-button-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  slab-button-neutral:
    backgroundColor: "{colors.text-night}"
    textColor: "{colors.ground-night}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  slab-button-danger:
    backgroundColor: "{colors.danger-night}"
    textColor: "{colors.on-danger-night}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  slab-button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  slab-button-disabled:
    backgroundColor: "{colors.surface-raised-night}"
    textColor: "{colors.text-muted-night}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  target-slab:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.title}"
    padding: "0 16px"
    height: "48px"
  livery-panel-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.hull}"
    padding: "16px 24px 16px 16px"
    height: "172px"
  livery-panel-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.hull}"
    padding: "16px 16px 16px 32px"
    height: "172px"
  rounds-chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.team-a}"
    typography: "{typography.meta}"
    padding: "2px 12px"
  score-row:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-muted-night}"
    typography: "{typography.label}"
    height: "52px"
  score-row-latest:
    backgroundColor: "{colors.surface-raised-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.label}"
    height: "52px"
  score-row-selected:
    backgroundColor: "{colors.surface-raised-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.label}"
    height: "52px"
  points-chip:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    padding: "4px 12px"
    width: "64px"
  number-field:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.field}"
    padding: "8px 16px"
    height: "76px"
  sheet-panel:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    padding: "24px 24px 16px 24px"
    width: "480px"
  winner-slab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.team-a}"
    typography: "{typography.winner}"
    padding: "24px 40px 12px 40px"
  winner-slab-other:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "8px 32px"
  undo-snackbar:
    backgroundColor: "{colors.text-night}"
    textColor: "{colors.ground-night}"
    typography: "{typography.body}"
    padding: "4px 8px 4px 24px"
    height: "52px"
  slab-button-danger-outlined:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.danger-night}"
    typography: "{typography.compact}"
    padding: "0 16px"
    height: "48px"
  menu-button:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-muted-night}"
    size: "48px"
  status-line:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.meta}"
    padding: "0 16px"
    height: "48px"
  choice-slab-off:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.compact}"
    padding: "0 8px"
    height: "48px"
  choice-slab-on:
    backgroundColor: "{colors.text-night}"
    textColor: "{colors.ground-night}"
    typography: "{typography.compact}"
    padding: "0 8px"
    height: "48px"
  text-field:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.title}"
    padding: "4px 0"
    height: "48px"
  screen:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.title}"
    padding: "8px 16px 24px 16px"
    width: "480px"
  screen-flood-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "8px 16px 24px 16px"
    width: "480px"
  screen-flood-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "8px 16px 24px 16px"
    width: "480px"
  ranking-row:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "8px 24px 8px 16px"
    height: "60px"
  ranking-row-first:
    backgroundColor: "{colors.surface-raised-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "8px 24px 8px 16px"
    height: "60px"
  team-row:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "8px 24px 8px 16px"
    height: "60px"
  picker-option:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "8px 24px"
    height: "60px"
  match-entry:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "12px 52px 12px 24px"
  tournament-entry:
    backgroundColor: "{colors.surface-raised-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "12px 52px 12px 24px"
  match-side-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "12px 36px"
  match-side-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "12px 36px"
  seat-slab-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "16px 40px"
    height: "120px"
  seat-slab-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "16px 40px"
    height: "120px"
  champion-slab:
    backgroundColor: "{colors.text-night}"
    textColor: "{colors.ground-night}"
    typography: "{typography.display}"
    padding: "16px 48px"
  champion-slab-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "16px 48px"
  champion-slab-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "16px 48px"
  champion-slab-on-flood:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.team-a}"
    typography: "{typography.display}"
    padding: "16px 48px"
  header-brand:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.title}"
    height: "48px"
  inicio-livery-team-a:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    typography: "{typography.hull}"
    padding: "16px 24px 16px 16px"
    height: "172px"
  inicio-livery-team-b:
    backgroundColor: "{colors.team-b}"
    textColor: "{colors.ink}"
    typography: "{typography.hull}"
    padding: "16px 16px 16px 32px"
    height: "172px"
  inicio-vs:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.field}"
    padding: "8px 24px"
  inicio-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button}"
    padding: "0 24px"
    height: "56px"
  inicio-choice:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.button}"
    padding: "0 16px 0 24px"
    height: "64px"
  rules-slab:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    typography: "{typography.title}"
    padding: "4px 16px 4px 24px"
    height: "64px"
---

# Design System: Dominó

Dominó is an Angular progressive web app. Every token below is a CSS custom property on `:root` in `src/styles.css`; component styles live inline in `src/app/components/*.ts`. Lengths are CSS pixels and type sizes are rem, so they follow the reader's font size. Component tokens reference the night appearance, which is the default; the day appearance is applied by `data-scheme="light"` on the root element, swaps each `-night` colour for its `-day` sibling and leaves the team colours and ink untouched. The CSS names drop the suffix (`--c-ground`, `--c-surface`, `--c-raised`, `--c-line`, `--c-text`, `--c-muted`, `--c-danger`, `--c-on-danger`, `--c-team-edge`, `--c-scrim`).

## Overview

**Creative North Star: "Liga de Carreras"**

The scoreboard is painted like two rival race cars parked nose to nose. Each team owns a flood of one loud colour with its total set in numerals large enough to read from the far seat at the table, and every other surface steps back to graphite at night or pit silver by day. There is one board, and while nothing is being played Inicio lies over it: the two liveries lined up nose to nose, which are the quick match. Above them sit twelve bottom sheets (menu, points, settings, reset, team, seat, name, team picker, statistics filter, removing a mesa, end of tournament, clearing the history), twelve full screens (history, match, tournament record, personalised match, tournament setup, next match, standings, champion, mesas, mesa, statistics, player statistics) and the winner screen, all built from the same parts.

The system has one shape and one typeface. The shape is a parallelogram that leans 12 degrees forward, used for buttons, rows, list entries, chips, the two liveries, the seat and champion slabs, the undo bar and the full-screen floods. The typeface is Kanit, set in heavy italic capitals for everything that is a name, a number or a command, and in upright medium only for full sentences. The only ornament is a mark of three small leaning bars cut from the same shape.

Density is low and the targets are large: the smallest control is 48 pixels and slab buttons are 56 pixels tall (48 on a short screen). The board has no navigation bar and no tabs: one menu button in the header opens a sheet that leads to everything that is not scoring, and a full screen returns through its back control. There are no cards, and the icons are a few small line symbols. On a wide screen the same phone column sits centred on the ground, 480 pixels wide.

**Key Characteristics:**
- Two saturated team colours used as fills, always carrying graphite ink.
- One forward-leaning parallelogram as the shape of every filled element; zero corner radius anywhere.
- Kanit extra-bold italic capitals with tabular numerals; hull-sized totals at 4.75rem.
- Flat tonal layering on a single ground colour per appearance.
- Brief motion, 200 to 220 ms, exponential ease-out, entering from the side that owns it; a few moments of the game (a hand, the lead changing, a new match, a win, a champion) go further, never holding up a tap. All of it is removed under reduced motion.
- Spanish interface copy throughout, in the informal second person, with short imperative commands.

## Colors

Two loud liveries on a neutral ground that flips between graphite and pit silver. The appearance follows the system until the reader chooses otherwise in the menu sheet: "Sistema", "Claro" or "Oscuro". The choice is kept on the device, resolved to `data-scheme` on the root element before the first paint, and is not part of the match, so "Todo" in the reset sheet leaves it alone.

### Primary
- **Safety Orange** (`team-a`): the left side of the board. Floods the left livery, the left points chip in each row, the left "Anotar" slab, the slash mark and confirm slab on that side's points sheet, and the whole screen when that side wins. Away from the board it fills the left side of Inicio, the left team's slab in the menu, the upper seat slab, the left side of a finished match, the winner's total in a match entry, and the champion slab, chip and flood of a team that last won on the left.

### Secondary
- **Acid Yellow** (`team-b`): the right side of the board. The same roles on the right side.

### Neutral
- **Graphite Ink** (`ink`): everything printed on a team colour, in both appearances, including the swap arrows on a seat slab and the back control of a flooded screen. Also the fill of the rounds chip, the wins chip on a seat slab, the "Ganador" chip, the winner's slab and the closing slab on the winner screen, the champion slab and "Guardar y salir" on a flooded champion screen, and the VS and the "Partida rápida" band at Inicio; the outline of slabs that sit on a flood; the footer hairline and the scrollbar thumb on a flood.
- **On Ink** (`on-ink`): the label of the closing slab on the winner screen and of "Guardar y salir" on a flooded champion screen, and the VS and the "Partida rápida" band at Inicio. White in both appearances.
- **Graphite Ground** (`ground-night`) / **Pit Silver Ground** (`ground-day`): the page, the sheet panel, the full screens and the interior of outlined slabs. Also the text and focus ring colour on the undo bar, and the label of any neutral fill.
- **Surface** (`surface-night` / `surface-day`): score rows, the number field and the header's status line; away from the board, match entries, ranking rows, the team rows of the tournament setup, the options of the team picker and the hands of a finished match.
- **Raised Surface** (`surface-raised-night` / `surface-raised-day`): the most recent row in the list, a selected row, the leading rows of a ranking, a tournament among the entries of the history, the fill of a disabled slab, and the scrollbar thumb of the list and of a screen.
- **Line** (`line-night` / `line-day`): the 2-pixel outline of outlined slabs and fields, the underline of the name field and of a text field, the 1-pixel hairlines above the quick bar, above the install hint, above a screen's pinned actions and above the choices at Inicio, the text selection colour, and the slash mark in an empty state.
- **Text** (`text-night` / `text-day`): primary text on the ground, the default focus ring, the fill of the neutral slabs ("Guardar", "Corregir", "Empezar torneo", "Empezar partida", "Guardar y salir", "Jugar desempate"), of the chosen slab in a choice group, of the undo bar and of a champion that has no side; the keyline of a selected row and of the leading rows of a ranking, the hand number of the newest row and of a selected one, the underline of a text field in focus, the caret, the "Ahora no" action, the note on the reset sheet, the header's status line, the "En juego" line of a ranking row, the "Desempate" flag of a match entry, the slash mark of a tournament entry, the slash mark and the app's name in the header at Inicio, and the slash mark of every sheet by day.
- **Muted Text** (`text-muted-night` / `text-muted-day`): field labels, group labels and column heads, hand numbers, zero cells, explanatory sentences, the help under each reset choice, the players line on a neutral surface, the facts line of a screen and of Inicio, the second line of a choice at Inicio, the label of a rules slab, dates, position numbers and matches lost in a ranking, the losing team in a match entry, a placeholder, the pencil and menu icons, the chevron of the status line, of a list entry and of a choice at Inicio, and the label of a disabled slab.
- **Team Edge** (`team-edge-night` / `team-edge-day`): a keyline around every team-colour fill that sits on the ground or a surface. Transparent and 0 pixels wide at night; Graphite Ink and 2 pixels wide by day (`--team-edge-width`), because orange and acid yellow lose their edge against pit silver and white.
- **Danger** (`danger-night` / `danger-day`) with **On Danger** (`on-danger-night` / `on-danger-day`): the border of an invalid number field, the underline of an invalid text field, and their error sentence; the fill of the destructive slabs ("Eliminar" on a selected hand, "Todo" on the reset sheet, and the confirming slab of the end-of-tournament sheet and of the sheet that clears the history); the outline, label and icon of the outlined destructive slabs ("Borrar" in the menu, "Eliminar equipo", "Borrar historial", "Terminar torneo", "Eliminar" on a match or a tournament of the history); the slash mark of the reset sheet, of the end-of-tournament sheet and of the sheet that clears the history at night.
- **Scrim** (`scrim-night` / `scrim-day`): the dimmed backdrop behind a sheet.

### Named Rules
**The Livery Rule.** A team colour is a fill. It carries Graphite Ink and never prints as text on the ground or on a surface.

**The Seat Rule.** In a tournament a team colour belongs to a side of the board, not to a team: the left seat is Safety Orange and the right seat is Acid Yellow, and a team wears the colour of the seat it takes. A champion is shown in the colour of the side it last won on, and in Text colour when there is none.

**The Graphite Exception Rule.** A team colour prints as text only on a Graphite Ink fill: the rounds chip inside each livery, the wins chip on a seat slab, the "Ganador" chip on the side of a finished match, the winner's slab on the winner screen and the champion slab on its own flood.

**The Same Ink Rule.** Ink on a team colour is Graphite Ink in both appearances. It does not invert when the ground does.

**The Day Keyline Rule.** By day every team-colour fill on the ground or a surface wears a 2-pixel Graphite Ink keyline: liveries, points chips, team slabs, seat slabs, the sides of a finished match, and the champion slab and chip. At night the keyline has no width. The winner flood and the flood of a screen never wear one.

**The Danger Rule.** Danger means an invalid value or an action that deletes or ends what was being kept. Outlined in Danger on the ground, a slab leads to deleting or ending; filled with Danger, it is the action that does it. It is never decoration and never a team.

## Typography

**Display Font:** Kanit 800 italic (with `sans-serif`)
**Label Font:** Kanit 600 italic (with `sans-serif`)
**Body Font:** Kanit 500 upright (with `sans-serif`)

The three cuts are self-hosted from `@fontsource/kanit` (latin subset), so they work offline. `font-synthesis: none` stops the browser from faking a weight or a slant that was not loaded.

**Character:** A single family doing two jobs. The italic cuts are fast and loud for names, numbers and commands; the upright medium is quiet and used only where a full sentence has to be read.

### Hierarchy
- **Winner** (800 italic, 8.25rem, line-height 1.06, tabular): the winner's total on the winner screen.
- **Hull** (800 italic, 4.75rem, line-height 1.05, tabular): the team totals in the lockup, and the letter of each side at Inicio (line-height 1). Both totals drop to Display size together when either has more than four digits.
- **Display** (800 italic, 3.5rem, uppercase): the winner heading and the other team's total on the winner screen; the two totals of a finished match (line-height 1.1, tabular); the name on the champion slab.
- **Field** (800 italic, 2.75rem, line-height 1.2, tabular): the text typed into a number field; the VS at Inicio (line-height 1).
- **Title** (800 italic, 1.75rem, uppercase): the target value in the header, the team name field and the text field, sheet and screen titles (including the heading of a hand being corrected), the empty-state headings, the winner sentence, the team name on a seat slab, "Sin campeón" on a tournament record, the app's name in the header at Inicio, the word "Equipo" on each side at Inicio, and the value of a rules slab (line-height 1.1, tabular, shrunk to fit). Position numbers and the matches won and lost in a ranking use this size at line-height 1, held to 8vw on a narrow phone; matches lost are 600. Headings use line-height 1.15 and balanced wrapping. On a short screen it also sets the text of a number field, the winner heading, the other team's total, the name on the champion slab, and the letter and the VS at Inicio.
- **Button** (800 italic, 1.25rem, uppercase, 0.5px letter-spacing on slabs): slab labels, team names on the liveries, the winner screen, list entries, ranking rows and the sides of a finished match, points inside row chips, the two player fields of the team sheet, the section headings of a screen ("Clasificación", "Partidas"), the names waiting their turn, the "Partida rápida" band at Inicio. Zero cells and the losing total of a match entry use the same size in the 600 italic cut.
- **Compact** (800 italic, 1.125rem, uppercase): the label of a compact slab.
- **Body** (500 upright, 1rem, line-height 1.45, sentence case): the empty-state, install and lead sentences (capped at 34ch), the notes of the tournament screens (capped at 40ch), the help and note on the reset and end-of-tournament sheets (capped at 65ch, line-height 1.35), field messages, the undo message. The header's "Meta" label, the winner's wins line and the players line on the champion slab use this size in the 600 italic cut, uppercase; the text actions ("Deshacer", "Actualizar", "Ahora no") use it in 800 italic, uppercase, underlined.
- **Meta** (600 italic, 0.9375rem, uppercase, 0.4px letter-spacing, tabular): points remaining and the rounds chip inside a livery; the header's status line; the wins chip and the players line on a seat slab; the "Ganador" chip; the role and wins lines on the champion slab; the team name on a livery on a short screen; the facts line at Inicio ("Meta 200 · Puntos rápidos +30").
- **Label** (600 italic, 0.8125rem, uppercase): field labels, group labels ("Apariencia", "Equipos y jugadores", "Equipos", "Esperan turno", "Reglas"), column heads and hand numbers; the players line under a team name on a livery, on the winner screen, in a ranking row, in a team row, in a match entry, in an option of the team picker and on the side of a finished match; dates, the number of a match inside its tournament ("Partida 1"), summaries and the facts line of a screen (line-height 1.5); the second line of a menu entry and of a choice at Inicio, and the label of a rules slab. The hand number of the newest row and of a selected row is 800, and so is the "En juego" line of a ranking row.

### Named Rules
**The Caps Italic Rule.** Names, numbers and commands are italic capitals. Upright sentence case is reserved for full sentences: explanations, errors, notices and the undo message.

**The Tabular Rule.** Every numeral that can change is set with tabular figures so totals and columns do not shift as they update.

**The Hull Cap Rule.** Type is sized in rem and follows the reader's font size, up to a pixel cap written into each token as `min(rem, px)`. Text stops at 1.6 times its designed size (Title, Button, Compact, Body, Meta, Label). Numerals and the winner heading stop at 1.2 times (Winner, Hull, Display, Field), because they are already large and must stay on one line.

**The One Line Rule.** Totals, team names, slab labels, screen titles, the header's status line and the winner heading shrink to fit their box on one line rather than wrap or truncate. They never shrink below 0.5 of their designed size, and never below 12 pixels, the smallest type that can still be read at the table; the winner's total and the labels of a choice group may go to 0.4, above the same 12 pixels. The fit leaves 4% of slack, because letter-spacing does not shrink with the type, and only the width is clipped, so tall glyphs such as an opening exclamation mark stay whole. A players line is never shrunk: it wraps, as described under Components.

### Voice
Copy lives in `src/app/copy.ts`. Commands are one to three words ("Anotar", "Guardar", "Cancelar", "Corregir", "Eliminar", "Borrar", "Deshacer", "Instalar", "Nueva partida", "Empezar torneo", "Guardar y salir"). Removing has two verbs: "Borrar" clears many at once (the hands, the history) and "Eliminar" removes one item (a hand, a match, a tournament, a team). Taking a step back is always "Deshacer". A game to the target is a "partida" everywhere, a hand is a "mano", and the score that wins a match has one name: "Meta". Matches won are counted as "1 victoria", "2 victorias". Two players are written as a pair joined by a middle dot ("ANA · LUIS"). A team name may be singular or plural, so no verb depends on it: "Victoria de Los Primos", "Mano 1: 120 para Los Primos". Sentences address the reader as "tú" and say what to do ("Escribe un número entre 1 y 999, sin signos ni decimales."). A consequence is stated before it happens ("Equipo A ya tiene 210: al guardar, la partida termina a su favor.") and the confirm label changes to match ("Terminar partida"). Exclamation is used once, on the winner heading.

## Layout

One column, the full dynamic viewport tall (`100dvh`), capped at 480 pixels wide (`--column`) and centred on the ground. The page itself never scrolls; only the list does. The board has four bands, top to bottom:

1. **Header.** Target slab at the left (at Inicio, the app's name) and one 48-pixel menu control at the right, at least 8 apart. While a tournament is being played the status line sits 8 under them, across the width and ending 16 short of the right edge. Padding 24 left, 8 right, 12 vertical. The top safe-area inset is added above it.
2. **Lockup.** Two equal panels, edge to edge, minimum height 172. Each livery bleeds 48 past the column edge and leans a fixed 36 pixels, leaving a diagonal seam of ground about 6 pixels wide between them.
3. **List.** Fills the remaining height and scrolls inside itself. 16 horizontal padding, 12 vertical, 8 between rows. Each row has two equal team columns with a 44-wide hand number between them, so points sit centred under their livery. The list follows a new hand to the end; a correction or a deletion further up leaves the reader where they are, unless the undo bar arrives while the end of the list is within 80 pixels, in which case the list moves to the end so the bar does not cover it. When empty, the content is left-aligned and vertically centred with 32 horizontal padding. While the undo bar is showing, the list gains bottom padding equal to the bar's height so the last row stays visible.
4. **Quick bar.** Pinned to the bottom, separated from the list by a 1-pixel Line hairline. Two equal columns with a 24 gap, one per team. Each column stacks a compact outlined quick-points slab above the team's filled "Anotar" slab with an 8 gap, so the every-hand action sits at the bottom edge. Padding 12 top, 24 sides, 12 plus the bottom safe-area inset below.

Spacing comes from a six-step scale (4, 8, 12, 16, 24, 32). Minimum target is 48 pixels in either dimension (`--min-target`).

Sheets are anchored to the bottom edge, capped at the same 480 column, and no taller than 92% of the viewport minus the keyboard; they scroll inside themselves past that. The app shell measures the on-screen keyboard from the visual viewport and publishes it as `--keyboard-inset`; a sheet's bottom edge sits at that inset, so its buttons stay above the keyboard. Sheet panels pad 24 on top and sides, the larger of 16 and the bottom safe-area inset below, with 16 between blocks.

Full screens cover the board and keep to the same 480 column, in three bands. The bar holds a 48-pixel back control and the title (Title, shrunk to fit), 4 apart, with padding 8 left, 24 right and 12 vertical; a locked screen has no back control and pads 24 at the left and above. The body fills the remaining height and is the only part that scrolls: 24 between blocks, padding 8 above, 16 at the sides and 24 below. The actions are pinned in a footer under a 1-pixel Line hairline, stacked with a 12 gap, 32 from the sides, 12 above and the larger of 12 and the bottom safe-area inset, plus 4, below; a screen with no actions has no footer. Blocks inside the body are inset a further 8 where they are text rather than slabs.

Inicio covers the board while nothing is being played. It is a layer of the page, not a dialog: the whole viewport in Ground colour, with the content in the same 480 column, in four bands top to bottom.

1. **Header.** The board's header, with the app's name in place of the target slab, and the status line under it while a mesa is in use.
2. **Grid.** The two liveries, cut and bled as in the lockup, fill the flexible height, at least 172. They pad 16, with 24 at the seam on the left and 32 on the right, and hold their content at the top. The VS sits on the centre of the seam; the "Partida rápida" band crosses their foot, 24 from each side and 16 above the bottom edge.
3. **Facts line.** 12 above, 24 at the sides, 16 below.
4. **Choices.** Pinned to the bottom under a 1-pixel Line hairline: two outlined slabs stacked 12 apart, with 12 above, 24 at the sides, and the larger of 12 and the bottom safe-area inset, plus 4, below.

Pairs of actions sit side by side and wrap onto separate lines once the reader's text size needs the room (each wants at least 7.5rem; the primary action grows 1.5 times faster than the other).

### Short screens

There is one responsive step, and it is about height. When the viewport is no taller than 36em (`@media (max-height: 36em)`) the same parts are set more tightly so the hands keep their room; a second step applies when that short viewport is also at least 30em wide (`and (min-width: 30em)`). Both are measured in em, so a phone on its side and a small phone with large text get the same layout. The column stays 480 wide and centred.

- **Header:** vertical padding drops from 12 to 4. At 30em wide the status line sits between the target slab and the menu control, in the room they leave, 8 from each.
- **Lockup:** the panels lose their minimum height and become a strip with 8 vertical padding. The team name is set in Meta size on its own line, the total in Field size, and the points remaining and rounds chip sit under the total, or beside it at 30em wide. An empty rounds chip is removed instead of keeping its space.
- **Quick bar:** 8 top and bottom padding, 16 between the columns, both slabs 48 tall. At 30em wide the quick-points slab sits beside "Anotar" in each column, each taking half, with 12 horizontal padding.
- **Number field:** minimum height 56, Title size.
- **Sheets:** 12 between blocks, 16 top padding, and the triple-slash mark is not shown. At 30em wide the two entries of the menu sheet sit side by side, each taking half, 48 tall.
- **Full screens:** the bar's vertical padding drops to 4 (12 above on a locked screen), blocks in the body are 16 apart, and the footer pads 8 above and the larger of 8 and the bottom safe-area inset below. At 30em wide the footer's actions sit in one row, each taking an equal share, with 12 horizontal padding.
- **Inicio:** the grid's minimum height drops to 112 and its sides pad 8 vertically; the letter sits beside "Equipo" on the same baseline, 8 apart, in Title size; the VS drops to Title size, with 2 vertical and 16 horizontal padding, and sits 40% down the seam; the band is 48 tall and 8 above the bottom edge. The facts line pads 8 vertically. The choices are 48 tall and 8 apart, with 8 above and the larger of 8 and the bottom safe-area inset below, and their second lines are left out. At 30em wide the two choices sit side by side, each taking an equal share, with 12 horizontal padding, and "Personalizar partida" is shortened to "Personalizar" so both labels keep one size.
- **Seat slabs:** no minimum height, 8 vertical padding, and the wins chip 4 under the name. At 30em wide the two seats sit side by side, 4 apart, with 24 horizontal padding.
- **Champion slab:** 8 vertical padding and the name in Title size.
- **Winner screen:** the compact variant described under Components.

No rule is keyed to a narrow width. On a narrow phone a few paddings and figures are held to a share of the width instead (the choice slabs, the ranking and team rows, the seat slabs and the sides of a finished match), so the names keep their room.

A desktop window shows the phone column centred. Tablets are not designed for. The web manifest still asks for portrait.

## Elevation & Depth

Depth is tonal. Three neutral steps stack on each other (ground, surface, raised surface) and the team colours sit on top of all of them as flat fills. Sheets separate from what is beneath them with a scrim, a full screen and Inicio cover the board completely with their own ground or flood, and the undo bar separates from the list by inverting the neutral colours. There are no shadows or blurs anywhere in the build, and no gradients except the passing light of a moment.

### Named Rules
**The Tonal Step Rule.** A surface is distinguished from what is beneath it by stepping one neutral tone, never by a shadow or a gradient. The newest row is marked by moving from Surface to Raised Surface. A selected row takes the same step and adds a 2-pixel Text colour keyline, and so do the rows that lead a ranking. In the history a tournament sits on Raised Surface among matches on Surface.

## Shapes

One silhouette: a parallelogram whose top edge is shifted right of its bottom edge by 12 degrees (horizontal offset = height × 0.2126). It is the same direction as the italic type, so shapes and letters lean together. Corners are sharp; no radius is used anywhere in the build.

The shape is drawn in CSS in two ways, and the content is never skewed in either.

- **The leaning layer.** Any element that needs the shape gets a pseudo-element behind its content, filled with `--fill`, bordered 2 pixels in `--edge`, and skewed 12 degrees (`transform: skewX(-12deg)`). The element isolates its own stacking context so the layer stays behind its label and in front of the page. The layer is inset horizontally (`--lean-inset`) by half the lean so the slanted ends stay inside the element's box: 6 by default; 3 for chips; 5 for slabs that share a row in thirds or halves (the options under a selected hand, the choice slabs, the team slabs of the menu, the rules slabs of a personalised match) and for the header's status line; 8 for list entries, ranking rows, team rows, picker options, the other team's slab on the winner screen and the "Partida rápida" band at Inicio; 18 for a seat slab and the side of a finished match; 22 for the champion slab; 24 for the winner's slab (12 in its compact form). An outline is the layer's own border, so fill and outline are one box. Used for slabs, rows, entries, chips, the undo bar and the slabs of the winner and tournament screens.
- **The cut.** Where the lean must be a fixed distance rather than a fixed angle, the shape is cut with `clip-path`. The livery cut is defined once in the global stylesheet (`.livery`, with `.livery--a` and `.livery--b` for the side) and used by the board's lockup and by Inicio's grid. Each livery is cut on a fixed 36-pixel seam, reaching 15 past the centre line and bleeding 48 past the outer edge, so the diagonal between the two stays parallel at any height; by day a second, slightly larger cut in Graphite Ink sits behind each one as the keyline. The slash mark is cut as a percentage polygon.

The winner flood and the flood of a champion screen are a single layer skewed the same 12 degrees and stretched 60% past each side of the screen, so its slanted ends are never seen.

The triple-slash mark is three of the same parallelograms side by side, each 0.62 of its height wide with a gap of 0.05 of its height. It appears above sheet content (18 tall; in the sheet's accent at night and in Text colour by day, where acid yellow would vanish on the pale ground), in the empty state of the board and of the history (22, Line colour), beside the word "Torneo" in a tournament entry of the history (14, Text colour), beside the app's name in the header at Inicio (22, Text colour) and above the winner heading (40, Graphite Ink). On a short screen the sheets and the winner screen leave it out.

Three kinds of surface are rectangular by design: text fields, because a caret and a selection need a straight box or a straight line, and the sheet panel and the full screen, which are the ground the slabs sit on.

### Named Rules
**The Lean Rule.** Every filled shape is the 12-degree parallelogram. Skew the layer behind the content, or cut it; never skew, rotate or round the element that holds the text.

**The One Ornament Rule.** The triple-slash mark is the only decoration. It is hidden from assistive technology.

## Components

### Buttons
Slab buttons are blunt and physical: a leaning block that shoves sideways when pressed.
- **Shape:** the leaning layer, minimum height 56, 24 horizontal padding (12 when paired in a row), label centred on one line and shrunk to fit. On a short screen the slabs of the quick bar and the winner screen are 48 tall. The entries of the menu and the choices at Inicio set their label at the left.
- **Outlined (default):** Ground interior, 2-pixel Line outline, Text label. "Cancelar", "Cerrar", "Solo las manos", "Instalar", "Añadir equipo", "Tabla", "Abrir la tabla", "Deshacer", "Seguir jugando", the entries of the menu, the choices at Inicio ("Personalizar partida", "Torneo"), the quick-points slab.
- **Compact:** minimum height 48, 16 horizontal padding, Compact type. The target slab, the quick-points slab, the three options under a selected hand, the choice slabs, the team slabs and the closing row of the menu, "Instalar", "Añadir equipo", "Abrir la tabla", the "Cancelar" of the reset sheet, of the picker and of the sheet that clears the history, the secondary actions in a screen's footer, the winner screen's correction slab, the rules slabs of a personalised match. A compact slab that stands alone in a body or a sheet sits at the left and is as wide as its label.
- **Team:** team colour fill, Graphite Ink label, Team Edge keyline. "Anotar" in the quick bar and on the points sheet, the two team slabs of the menu, and the confirm of the team sheet when it edits a team at the board.
- **Neutral filled:** Text colour fill, Ground colour label. "Guardar" and "Terminar partida" on the settings sheet; the confirm of the team sheet for a team with no side; "Empezar torneo", "Empezar partida", "Jugar desempate" and "Guardar y salir"; compact "Corregir" under a selected hand.
- **Ink:** Graphite Ink fill, On Ink label. The closing slab on the winner screen ("Nueva partida"; in a tournament "Siguiente partida" or "Ver resultado") and "Guardar y salir" on a flooded champion screen.
- **Danger:** Danger fill, On Danger label, no outline (`.slab--danger`). The action that deletes or ends: "Eliminar" under a selected hand, "Todo", the confirming slab of the end-of-tournament sheet ("Terminar torneo", "Terminar sin campeón", "Cancelar torneo") and "Borrar historial" on the sheet that confirms it.
- **Danger outlined:** compact, Ground interior, 2-pixel Danger outline, Danger label (`.slab--warn`). The action that leads to deleting or ending: "Borrar" in the menu (with a 20-pixel bin icon in the same colour), "Eliminar equipo", "Borrar historial" at the end of the history, "Terminar torneo" in the footer of the standings, and "Eliminar" in the footer of a match and of a tournament record.
- **On a flood:** an outlined slab takes a transparent interior with a Graphite Ink outline and label ("Deshacer" on a flooded champion screen), or the flood colour with the same outline (the winner screen's correction slab).
- **Disabled:** Raised Surface fill, Muted Text label, no outline, default cursor, regardless of variant. It does not respond to hover or press.
- **Hover** (pointer devices only): the layer brightens by 12%.
- **Pressed:** the layer drops to 70% opacity (`--pressed`) and the whole button shifts 3 pixels right over 90 ms. The shift is skipped under reduced motion; the opacity stays.
- **Focus-visible:** a 3-pixel outline, 3 pixels off the element, in Text colour. Surfaces that are not the ground set their own ring colour: Graphite Ink on the liveries, Inicio's grid, the seat slabs, the winner screen and a flooded screen, Ground colour on the undo bar. After a touch the ring is not drawn on anything but a text field, while focus itself stays where it is; Tab or an arrow key brings the ring back. A device with a coarse pointer starts as touch, so a screen that opens by itself on launch draws no ring.
- **Text action:** where a second, lighter action sits beside a message, it is a 48-tall target with no shape: Body size, 800 italic capitals, underlined 0.2em below the baseline, pressed at 70% opacity. "Deshacer" and "Actualizar" on the undo bar (in Ground colour), "Ahora no" on the install hint (in Text colour).
- **Long press:** holding a quick-points slab for 500 ms without moving more than 10 pixels opens the settings sheet on the quick-points field; the click that follows is swallowed.

### Header Slabs
The target slab is a compact outlined slab in the header holding the "Meta" label (Body size, 600 italic, Muted Text, shrunk to fit), the target value (Title, Text) and a 16-pixel pencil icon. It opens the settings sheet ("Ajustes") on the target field, and gives way first when the header runs out of width. States are those of any slab.
- **Status line:** while a tournament is being played, what is being played for stays in sight under the target slab and the menu control: "Gana con 2 victorias · Partida 3", "Torneo libre · Partida 1", "Desempate · Partida 4". Outside a tournament, with a mesa in use, the same line names it: "Mesa: Casa de Ana". It is a leaning Surface layer with no outline (lean inset 5), minimum height 48, 16 horizontal padding, the text at the left (Meta, Text colour, tabular, shrunk to fit) and a 20-pixel chevron at the right in Muted Text. The whole line is a button that opens the standings, or the list of mesas. Hover brightens the layer by 12%; pressed drops it to 70% opacity.
- **Brand:** at Inicio nothing is being played for yet, so the target slab gives way to the app's name: the triple-slash mark (22, Text colour) and "Dominó" (Title, line-height 1.15), 12 apart, at least 48 tall so the header keeps its height. It is not a button. The menu control and the status line are the board's.

### Liveries
The two panels of the lockup. Each is a full-height team-colour cut holding, top to bottom: team name (Button) with the players line under it when the team has players (Label, "ANA · LUIS"), total (Hull), points remaining (Meta) and the rounds chip. All text is Graphite Ink. The whole panel is one button that opens the points sheet.
- **Hover:** fill brightens by 6%. **Pressed:** fill at 70% opacity. **Focus-visible:** Graphite Ink ring drawn 8 pixels inside the panel.
- **A hand lands:** the total rolls up to its new value, kicks and settles, a "+25" tag rises off it, and a light passes across that livery (see Moments).
- **Match point stripe:** when a team that has scored is within 30 points of the target (a quarter of the target when that is less), its "Faltan 25" line becomes a Graphite Ink leaning stripe (lean inset 6, padding 2 vertical and 16 horizontal) in the panel's colour: "Faltan 25" (Meta, 800) over "para ganar" (Label, 800), each line fitted on its own, so the stripe is two lines at any width. It slides in from its side, and a light crosses it every 2.4 s. The panel's accessible label ends with the same sentence.

### Inicio
The starting grid, shown over the board while nothing is being played: no hands, no step owed and no tournament. The app opens on it then, the menu's "Inicio" leads to it, and the app returns to it by itself after "Todo" on the reset sheet and once a tournament is closed. A match under way, or one closed on the board, stays on the board. Inicio is a layer of the page, not a dialog, and the board stays mounted beneath it, inert. Sheets and full screens open above it as they do above the board.
- **Grid:** the two liveries side by side are one button, the quick match: Equipo A against Equipo B with no players, meta 200 and +30, whatever was used last. Each side holds "Equipo" (Title) over its letter at poster scale (the smaller of 40% of the grid's width and half its height less 96 pixels, so it stays clear of the VS), in Graphite Ink. The grid is a size container: at 320 pixels tall or less the letter joins "Equipo" on one line in Title size; at 240 or less both drop to Button size, the panels pad 8 vertically, the VS drops to Title size 40% down the seam and the band to 48 tall, 8 above the bottom. Hover brightens both fills by 6%; pressed drops both fills and the band to 70% opacity; the focus ring is Graphite Ink, drawn 8 inside the grid.
- **Seam:** the grid keeps the board's seam, not just its shape. The board's lockup leans 36 pixels over its own height; the grid leans by the same angle over its height (36 × grid height ÷ lockup height, measured from the board as both resize) and starts from the same point, so the top of the grid is exactly the board's lockup. Each outer edge bleeds out by the extra lean and the right livery reaches back by it, so the gap between the two stays the board's.
- **VS:** a Graphite Ink leaning layer with a 2-pixel Text colour keyline (lean inset 6), "VS" in On Ink at Field size, padding 8 vertical and 24 horizontal, centred on the seam. It never takes a tap of its own.
- **Band:** a Graphite Ink leaning layer (lean inset 8) across the foot of both liveries, at least 56 tall with 24 horizontal padding, holding "Partida rápida" (Button, On Ink, shrunk to fit) and a 24-pixel chevron, centred 8 apart. It says what the tap does. A band of white light at 22% crosses it every 2.4 s, as on the match point stripe: the passing light of a moment, the one gradient the system allows.
- **Facts line:** "Meta 200 · Puntos rápidos +30" (Meta, Muted Text, tabular): what the quick match plays to. It is hidden from assistive technology, because the grid's label already says it.
- **Undo bar:** takes the facts line's place at its own height, with 24 side margins, so a long message wraps without covering the band, the install hint or the choices; the grid gives up the height while it shows. Starting a match from Inicio ends any older whole-board offer, as any change to the board does.
- **Install hint:** the board's install hint (see Empty State and Install Hint), between the facts line and the choices, under a 1-pixel Line hairline, padding 12 above, 24 at the sides and 16 below. It goes with "Ahora no" or once installed, everywhere at once. It is left out on a short screen, and on a screen up to 48em tall while "Revancha" is offered, so the grid keeps its height; the board's empty list offers it then.
- **Choices:** outlined slabs 12 apart, at least 64 tall, padding 16 right and 24 left, each with its label (Button) over one line in Muted Text (Label) and a 20-pixel icon in Muted Text at the right; a group named "Otras formas de jugar".
  - **Revancha**, first, only when there is a last match and it was not Equipo A against Equipo B at meta 200, and Personalizar does not already hold its teams and meta: "Los Primos vs Equipo B · Meta 150" under it, and an arrow rather than a chevron, because it plays at once. It seats the last match's teams and meta, with the wins they have at the mesa in use, and keeps the quick points.
  - **Personalizar partida** over "Equipos, jugadores y reglas"; when the board holds anything other than the defaults, the line reads "Preparada: Los Primos vs Los Tíos · Meta 150" in Text colour, so the quick match never takes a setup unseen, and the slab's spoken label says the same.
  - **Torneo** over "Varios equipos, por turnos".
- **Undo after a start:** a quick match or a Revancha that replaces anything other than the defaults offers it back by name: "Partida rápida. Antes: Los Primos vs Los Tíos, meta 150" ("Revancha. Antes: …"); taking it returns to Inicio as it was.
- **Short screens:** the choices are 48 tall and 8 apart, their second lines are left out, and at 30em wide they sit side by side, each taking an equal share, with 8 horizontal padding, no icon and their short labels ("Revancha", "Personalizar", "Torneo") at one size taken from the row (the smaller of Compact and 3.4% of its width).
- **Motion:** at launch Inicio is simply there. Leaving for a match, the grid folds up onto the board's lockup over 220 ms (its words, VS and band fade in the first 100 ms, the rest of Inicio in 160 ms), then gives way to the board's liveries beneath, which do not slam in: the board's VS lands 200 ms later instead. Coming back mid-session, the grid unfolds from the lockup's height over 280 ms, its words and the choices fade in after 120 ms, the VS lands and the band rises. All of it is removed under reduced motion.

### Players Line
A team's two players on one line under its name, joined by a middle dot: "ANA · LUIS". The type is never shrunk. When the line has no room the second name moves under the first, and the dot stays with the first name so a wrapped line never starts with it. A name that does not fit by itself ends in an ellipsis. The names sit 0.4em apart. The line takes its size and colour from where it sits: Label on a livery, on the winner screen, in a ranking row, in a match entry, in an option of the team picker and on the side of a finished match; Meta on a seat slab; Body size in 600 italic on the champion slab. It is Muted Text on a neutral surface and Graphite Ink on a team colour. The team rows of the tournament setup and of a mesa write it the same way, with "Sin jugadores" in its place when there are none.

### Chips
- **Rounds chip:** Graphite Ink leaning layer, 12 horizontal and 2 vertical padding, label in the panel's own team colour (Meta). It counts the matches won: "1 victoria", "2 victorias". With none won it is invisible but keeps its space, so both totals stay level. The wins chip on a seat slab and the "Ganador" chip on the side of a finished match are the same chip; "Ganador" keeps its space on the losing side.
- **Points chip:** team-colour leaning layer inside a score row, minimum width 64, 12 horizontal and 4 vertical padding, points in Graphite Ink (Button), Team Edge keyline. The winner's total in a match entry is the same chip.
- **Champion chip:** in a tournament entry of the history, the champion's name (Button) on a leaning layer with 16 horizontal and 4 vertical padding: the colour of the side it last won on with Graphite Ink and the Team Edge keyline, or Text colour with a Ground label when there is none.

### Score Rows
- **Shape:** leaning layer, minimum height 52, Surface fill. The newest row uses Raised Surface and prints its hand number in Text colour at weight 800.
- **Content:** team A cell, zero-padded hand number (Label, Muted Text), team B cell. The scoring team's cell holds a points chip; the other shows a muted 0.
- **The row is a button.** Hover brightens the layer by 12%; pressed drops it to 70% opacity.
- **Selected:** tapping a row keeps the hand in view, so it is clear what is about to change. The row stays with all its content, on Raised Surface with a 2-pixel Text colour keyline and its hand number in Text colour at weight 800. 8 below it sits a row of three compact slabs sharing the width equally with an 8 gap and 12 horizontal padding: outlined "Cancelar", neutral filled "Corregir", Danger "Eliminar". Another 8 separates the group from the next row. Focus moves to "Cancelar"; choosing it, or Escape, restores the row and returns focus to it. Adding a hand or any change to the list drops the selection. One row is selected at a time.
- **Correct:** "Corregir" opens the points sheet on that hand. Saving shows the undo bar.
- **Delete:** "Eliminar" removes the hand, shows the undo bar and moves focus to its action.
- **Entrance:** a new row slides in 56 pixels from its team's side over 200 ms. Rows already on the board at launch arrive without moving.

### Empty State and Install Hint
With no hands the list shows the triple-slash mark (22, Line colour), a Title heading and one Body sentence in Muted Text, left-aligned with an 8 gap.
- **Install hint:** where the app can be installed and the reader has not dismissed the hint, a second block follows 24 below, under a 1-pixel Line hairline with 16 padding above: one Body sentence in Muted Text, then the actions in a wrapping row. Where the browser can install on request, a compact outlined "Instalar" slab and the text action "Ahora no"; on iOS the sentence names the share menu and "Ahora no" stands alone. It is not shown once installed, and it leaves with the first hand. The same hint, one component (`install-hint.ts`), also sits at Inicio.

### Inputs / Fields
- **Number field:** rectangular, Surface fill, 2-pixel Line border, minimum height 76, 8 by 16 padding, Field type. Label 4 above in Label type, Muted Text. There is no placeholder; an empty field is empty. The numeric keypad is requested. What is typed is left as typed: a sign, a decimal or a letter is reported as an error, never removed silently. Focusing selects the whole value. On a short screen the minimum height is 56 and the text is Title size.
- **Name field:** on the points sheet. No box; a 2-pixel Line underline, minimum height 48, Title type, uppercase. At its right the pencil icon (20) sits in a 48-pixel square that is the field's own label, so touching it starts the rename.
- **Text field:** one line of text written on an underline, used for a team's name and its two players. Label 4 above in Label type, Muted Text. No box; a 2-pixel Line underline, minimum height 48, 4 vertical padding, Title type (Button for the two players), uppercase. The name that will be used if the field is left empty shows as a placeholder in Muted Text. Focusing selects the whole value.
- **Player picker:** replaces the two player fields when a mesa is in use. Two places side by side, "Jugador 1" and "Jugador 2", each a label (Label, Muted Text) above a compact leaning slab (lean inset 5, minimum height 48, 16 horizontal padding, Compact type): empty, an outlined slab reading "Elegir" in Muted Text; filled, a Text colour slab with the name in Ground colour and an 18-pixel cross at its right. Tapping a filled place empties it; tapping an empty one moves to the search. The places stack once each has less than 9rem. Below, the search field "Buscar o añadir jugador" (the text field's underline and label, at least 16 pixels, Button type), then the mesa's players as leaning chips that wrap, 8 apart vertically and 4 horizontally (lean inset 4, minimum height 48, 16 horizontal padding, Body type 800): Surface fill, Text colour fill with Ground type once chosen, and for a player of the other team a transparent chip with a Raised Surface outline, Muted Text, the note "En el otro equipo" under the name (Label), which cannot be pressed. A chosen player goes to the first empty place, or replaces the second. Typing filters the list, accents and case aside. When what is typed is not a player of the mesa, a compact outlined slab with a plus offers "Añadir «MARTA» a la mesa", which adds and picks the player; Enter picks the one player that matches or adds the new one. A Muted sentence covers an empty mesa, a search with no match and a full mesa. Arrow keys move along the chips, and Arrow Up from the first returns to the search. As the sheet opens, focus starts on the first place, so the keyboard stays down until the search is chosen.
- **Keep switch:** "Guardar en la mesa", a 48-tall row with a leaning box (40 by 32, lean inset 3) at the left: outlined in Line colour when off, Text colour with a Ground check when on. Beside it the label (Compact type) above one sentence in Muted Text (Meta size) that says what it means: kept with its wins, only for this match, what happens to the saved team this one was ("Lo Malo queda en la mesa como está. Con otros jugadores, juega otro equipo."), or that the mesa already keeps 20 teams, when it is disabled.
- **Focus:** the number field and the text field take the 3-pixel Text ring flush against their own edge, so it never covers the label above, and the text field's underline turns to Text colour. The name field takes the same ring 2 pixels off. Fields keep their ring after a touch.
- **Caret and selection:** selection is Line colour with Text colour type. The caret is Text colour, except in the points field of the points sheet at night, where it is the team colour.
- **Error:** the border, or the underline of a text field, switches to Danger and a Danger sentence (Body, upright) appears beneath. The confirm slab is disabled while any value is invalid.
- **Notice:** a Text colour sentence in the same place, stating a consequence of saving without blocking it.
- **Enter:** moves to the next field, or confirms from the last one.

### Sheets
A rectangular Ground-colour panel on a native `<dialog>`, rising from the bottom over a Scrim. It opens with the triple-slash mark in the sheet's accent, then its title or fields, then its actions. The first field takes focus as the sheet opens, so the keyboard arrives with it. A sheet may open over a full screen.
- **Menu sheet** (accent: Text colour): title "Menú"; outlined slabs stacked 12 apart: first "Inicio", with "Elige cómo jugar" under it in Muted Text (Label), while nothing is being played and Inicio is not showing; then "Torneo" (or "Tabla del torneo" while one is being played), "Historial", "Estadísticas" and "Mesas", which carries a second line in Muted Text (Label) naming the mesa in use ("En uso: Casa de Ana", or "Ninguna en uso") and wraps rather than cutting it; under the label "Equipos y jugadores", one compact team slab per team, side by side 8 apart and stacking once each has less than 9rem, each in the colour of its side, opening the seat sheet when a mesa is in use outside a tournament and the team sheet otherwise; the appearance choice; then a row with compact outlined "Cerrar" and danger-outlined "Borrar", which opens the reset sheet. At Inicio there is no board in view to change or clear: the team slabs and "Borrar" are left out, and "Cerrar" stands alone at the left, as wide as its label. Each entry closes the menu and opens its own surface in the same tap.
- **Points sheet** (accent: the team colour): name field, points field, then "Cancelar" and the team's "Anotar". With a new name and no points the confirm reads "Guardar nombre". The same sheet corrects a hand: a Title heading ("Corregir mano 2 de Equipo B") takes the place of the name field, the points field opens with the hand's points selected, and the confirm reads "Guardar".
- **Settings sheet** (accent: Text colour): title "Ajustes", the fields "Meta: puntos para ganar" and "Puntos rápidos: el botón +", then "Cancelar" and neutral "Guardar".
- **Team sheet** (accent: the colour of the team's side, or Text colour for a team with no side yet): title ("Equipo" or "Equipo nuevo"), the name field, then the two player fields side by side, 16 apart, stacking once each has less than 8rem. With a mesa in use the player picker takes their place, and for a team at the board outside a tournament the keep switch follows it; kept at the mesa, the name may not repeat another team kept there. The switch starts off: a saved team is its two players, and changing one without the switch leaves the saved team as it was, which the sentence under the switch says by name; with it on, the saved team takes the new players and the wins those two have there. One sentence is always present beneath them: in Muted Text it says that the players are optional, both or neither, or, once a field is full, that names have 16 characters at most; in Danger it names the error (a name another team already has, or one player missing, which is not reported until the second player field has been entered). Where the team can be removed, a danger-outlined "Eliminar equipo" follows. Then "Cancelar" and the confirm ("Guardar" or "Añadir"), a team slab or a neutral one to match the accent.
- **Seat sheet** (accent: the colour of the side): a Title question naming the team to be replaced ("¿Quién juega en lugar de Los Primos?"), which breaks between words; a compact outlined "Cambiar jugadores" with a pencil, which opens the team sheet for the team at that side; then under a label the teams that can take the side, as leaning Surface rows 8 apart (minimum height 60, 24 horizontal and 8 vertical padding): name (Button) and players (Label, Muted Text) at the left, wins at the right in Text colour (Meta, 800), since they are why a team is picked. In a tournament they are the teams waiting, longest wait first ("Esperan turno"); at a mesa, the teams it keeps that are not at the board, most wins first ("Equipos de la mesa"), with a Muted sentence when there are none. Then a row of compact outlined "Cancelar" and, at a mesa, "Equipo nuevo" with a plus, which opens an empty team sheet for that side.
- **Name sheet** (accent: Text colour): one name, for a mesa or a player. Title, a text field, a sentence in Muted Text (a name is needed, or names have 16 characters at most) or in Danger (the name is taken), then, for a player, a danger-outlined "Eliminar jugador" or, when a saved team counts on the player, a Muted sentence naming that team instead. Then "Cancelar" and neutral "Crear" or "Guardar".
- **Statistics filter sheet** (accent: Text colour): title "Mesa" or "Fechas", then a radio group of leaning Surface rows 8 apart (minimum height 52, 24 horizontal padding, Compact type); the chosen one takes the Text colour fill with Ground type and a 20-pixel check. Mesa: "Todas", each mesa the history has matches from (by its newest name), and "Sin mesa" when there are matches at none. Dates: "Siempre", "Hoy", "7 días", "30 días" and "Fechas…". A choice applies and closes the sheet, except "Fechas…", which shows two native date fields, "Desde" and "Hasta" (underlined like a text field, at least 16 pixels), a sentence that a blank date sets no limit or, in Danger, that "Hasta" is before "Desde", and a neutral "Aplicar" beside "Cancelar". Focus starts on the current choice; arrow keys move along the rows.
- **Remove-mesa sheet** (accent: Danger): as the clear-history sheet: "¿Eliminar la mesa Casa de Ana?", what goes, counted ("Se borran 5 jugadores y 2 equipos guardados. El historial se conserva."), how long it can be undone, then Danger "Eliminar mesa" and a compact outlined "Cancelar". A mesa with no players and no teams goes without asking.
- **End-of-tournament sheet** (accent: Danger): a Title question, then what ending now would mean in Muted Text (capped at 65ch, line-height 1.35), with "Se puede deshacer." in Text colour. Actions are stacked 12 apart: with a tie at the top, neutral "Jugar desempate" and Danger "Terminar sin campeón"; while a tie-break is under way and still level, Danger "Terminar sin campeón" alone; with no match played, Danger "Cancelar torneo"; otherwise Danger "Terminar torneo". Below them a compact outlined "Seguir jugando".
- **Clear-history sheet** (accent: Danger): a Title question ("¿Borrar el historial?"), then what goes, counted, in Muted Text ("Se borra todo: 3 partidas y 1 torneo con sus partidas."; capped at 65ch, line-height 1.35), with how long it can be undone in Text colour. Actions are stacked 12 apart: Danger "Borrar historial", then a compact outlined "Cancelar".
- **Reset sheet** (accent: Danger): title, then two choices, each a full-width slab with its explanation 8 beneath it in Muted Text, tied to the button as its description: outlined "Solo las manos" and Danger "Todo". Below them one sentence in Text colour says that both can be undone, then a compact outlined "Cancelar". Blocks are 16 apart. During a tournament only "Solo las manos" is offered, the sentence says that it can be undone, and a Muted sentence says that the tournament is ended from its table, with a compact outlined "Abrir la tabla" 8 under it that closes the sheet and opens the standings.
- **Closing:** Escape, the system Back gesture, a tap on the scrim and "Cancelar" all close the sheet and discard; nothing is saved without its button.
- **Motion:** the panel slides up from below over 200 ms while the scrim fades in, and reverses on close.

### Winner Screen
A full-screen `<dialog>`. The winning side's colour floods the screen, sweeping in from that side over 220 ms; the content fades in 60 ms behind it. The content keeps to the 480 column. On the flood, in Graphite Ink: the triple-slash mark (40), the heading (Display), the winner sentence (Title) and the wins line (Body size, 600 italic). The scores group is centred in the flexible middle of the screen with a 12 gap between its two slabs. Heading and scores scroll together when they do not fit, with a thin Graphite Ink scrollbar; the actions are pinned 16 below that region and never leave the screen.
- **Winner's slab:** a large Graphite Ink leaning layer with the team name (Button) and its players line (Label) stacked above the total (Winner, shrinks to fit), all printed in the winning team colour. Padding 40 horizontal, 24 top, 12 bottom.
- **Other team's slab:** the flood colour with a 2-pixel Graphite Ink outline, name and players line at the left (Button, Label) and total at the right (Display), all in Graphite Ink. Padding 32 horizontal, 8 vertical.
- **Actions:** stacked with a 12 gap. A compact slab in the flood colour with an ink outline takes back what ended the match; its label names the cause ("Corregir última mano", "Deshacer la corrección", "Volver a meta 200", "Cambiar la meta"). At a mesa outside a tournament a second slab of the same kind, "Cambiar equipos", counts the win and opens the next-match step; the two share a row only when both labels fit whole (12rem each). Below them, the Ink slab counts the win and clears the board; its label says what follows: "Nueva partida" (at a mesa, with the same teams), or in a tournament "Siguiente partida" or "Ver resultado".
- **Compact (short screens):** the mark is left out, the heading drops to Title size and the winner sentence to Button size. The scores sit at the top of their region with 12 vertical padding. The winner's slab becomes a single line, name at the left and total at the right in Display size, padding 32 horizontal and 8 vertical, lean inset 12; the other team's total drops to Title size. Actions are 48 tall with an 8 gap, and at 30em wide they sit side by side, each taking half, with a 12 gap.
- **Closing:** Escape and the system Back do the same as the correction slab. The winner screen waits until any open sheet or full screen has closed.

### Full Screens
A full-screen `<dialog>` above the board for what takes more than a moment. Ground colour, Text colour type, the three bands described under Layout. The back control is a 48-pixel square with a 24-pixel chevron in the colour of the text; pressed, it drops to 70% opacity.
- **Closing:** the back control, Escape and the system Back return to where the reader came from. A locked screen shows a step that has to be answered: it has no back control, Escape does nothing, and if the system Back closes it, it opens again.
- **Flood:** a screen given a side is flooded with that side's colour, the same layer as the winner flood, and carries Graphite Ink: type, focus ring, footer hairline and scrollbar.
- **Motion:** the screen slides in from 24% to the right while fading in over 220 ms, and leaves the same way.
- **History** ("Historial"): a choice group "Mostrar" (Todo, Partidas, Torneos), then the entries, newest first, 8 apart; a match played in a tournament is listed inside its tournament. At the end a danger-outlined "Borrar historial", which opens the clear-history sheet. With nothing to show, the empty state of the board with its own heading and sentence, and no filter while the history itself is empty.
- **Match** ("Partida"): the facts line (Label, Muted Text, 16 between facts, wrapping): date, the mesa it was played at, target, hands, and whether it belonged to a tournament. Then the two sides, then every hand in order as score rows that cannot be pressed. Footer: compact danger-outlined "Eliminar", only for a match outside a tournament.
- **Tournament record** ("Torneo"): the facts line, the champion slab or "Sin campeón" (Title), then "Clasificación" with the ranking list and "Partidas" with the match entries, each under a Button heading with an 8 gap. Here an entry is headed by its number in the tournament ("Partida 1", "Partida 2") instead of a date. Footer: compact danger-outlined "Eliminar".
- **Tournament setup** ("Torneo nuevo"): under the label "Equipos", the team rows; with more than two teams, a sentence that explains the rotation (the winner stays and the team that has waited longest comes in); then a compact outlined "Añadir equipo" with a 20-pixel plus icon, replaced by a sentence once the limit is reached. Then the choice group "Final del torneo" (Primero a, Mejor de, Libre) with its number field ("Victorias para ganar", or "Al mejor de cuántas partidas"), whose notice says how many wins are needed, or a sentence for "Libre". A last sentence warns that the board will be cleared when there is something on it. Footer: neutral "Empezar torneo", disabled until the rule is valid. What is written here is kept on the device between visits, so closing the screen loses nothing, and the next tournament starts from the teams of the last one.
- **Personalised match** ("Personalizar partida"): opens from Inicio, with a back control that returns to it. A lead sentence in Muted Text, which describes each seat to a screen reader: "Toca un equipo para cambiar su nombre o sus jugadores.", or at a mesa "Toca un equipo para cambiar sus jugadores o poner otro equipo de la mesa.". Then the two seat slabs: with the pencil, each opens the team sheet for its side; at a mesa, with the swap arrows, the seat sheet. Their wins chip shows only at a mesa or once a team has won. When the two teams share a player, a Danger sentence names the player and "Empezar partida" is disabled. Then, under the label "Reglas", a row of two rules slabs, "Meta" and "Rápidos", each opening the settings sheet on its own field. Footer: neutral "Empezar partida". The board is clean, so what is chosen here is written to it straight away and kept on the way back. As the screen opens the seats face off (see Moments) and focus starts on the first seat; once a match starts, from here or anywhere else, the screen closes itself.
- **Rules slab:** a compact outlined slab (lean inset 5), at least 64 tall, padding 4 vertical, 16 right and 24 left, sharing the row 8 apart and stacking once each has less than 8rem: its label (Label, Muted Text) over its value (Title, tabular, shrunk to fit: "200", "+30"), and a 16-pixel pencil in Muted Text at the right. The row is inset 7 at each side, so its outer corners sit on the seat slabs' corners above.
- **Team row:** a leaning Surface row that is a button, minimum height 60, padding 8 vertical, 16 left, 24 right: position number (Title size, Muted Text), name (Button) above its players line or "Sin jugadores" (Label, Muted Text), and a 20-pixel pencil. It opens the team sheet. With a mesa in use and teams of it not yet in the list, "Añadir equipo" first opens a sheet that lists them as rows with a plus, adding one in a tap, with "Cancelar" and "Equipo nuevo" below.
- **Next match** (locked; "Primera partida", "Siguiente partida" or "Desempate"): opens between two matches of a tournament, after "Cambiar equipos" on the winner screen at a mesa, and after "Jugar en esta mesa" at a clean board. A lead sentence in Muted Text, which describes each seat to a screen reader, the two seat slabs 12 apart, and in a tournament, under the label "Esperan turno", the names of the waiting teams in one wrapping line (Button, line-height 1.4). When the two teams share a player, a Danger sentence names the player and "Empezar partida" is disabled. Footer: a row of compact outlined "Deshacer", when there is a step to take back, and in a tournament "Tabla"; below it neutral "Empezar partida". At a mesa, "Deshacer" brings back the match that was closed. As the screen opens, focus starts on the first seat that can be changed, because the two teams are the choice to make here. Taking back the start of the tournament returns to the setup, where its teams are waiting.
- **Mesas** ("Mesas"): one Muted sentence on what a mesa is; then where play is now, in Text colour ("Juegas en Casa de Ana." or "Juegas sin mesa: los jugadores se escriben a mano."), with a compact outlined "Jugar sin mesa" under it while a mesa is in use. Then one leaning row per mesa, 8 apart (lean inset 8, minimum height 64, 8 vertical and 24 horizontal padding): the name (Button, wrapping, never cut), its counts ("5 jugadores · 2 equipos", Label, tabular) and, for the one in use, "En uso" on its own line (Label, 800); that row takes the Text colour fill with Ground type, the others are Surface. A 20-pixel chevron says that the row opens the mesa. Then a compact outlined "Mesa nueva" with a plus, which opens the name sheet and then the new mesa, not yet in use; a Muted sentence replaces it at 12 mesas.
- **Mesa** (its name): a compact outlined "Cambiar nombre" with a pencil, which opens the name sheet. Under "Jugadores (5)" the players as the picker's chips, each opening the name sheet; past 16 players only the first 12 show, with a compact outlined "Ver los 40" (then "Ver menos"). Then an inline field "Añadir jugador" with a square compact slab holding a plus at its right, where Enter adds and the field stays open for the next name, with a Danger sentence for a name the mesa has. Under "Equipos guardados (2)" the teams as team rows with wrapping names and players and their wins at the right, each opening the team sheet with a danger-outlined "Eliminar equipo"; then "Añadir equipo". Muted sentences cover an empty list and a full one. Footer: compact danger-outlined "Eliminar mesa", then neutral "Jugar en esta mesa", which puts the mesa in use, closes the mesa screens and, at a clean board, opens "Primera partida". Renaming a player also renames them in the saved teams, at the board and in the matches played at that mesa.
- **Statistics** ("Estadísticas"): a filter row of two compact outlined slabs that state their value, "Mesa: Todas" and "Fechas: Siempre", side by side 8 apart and stacking once each has less than 9rem; a filter in use takes the neutral fill, so a narrowed list never passes for the whole. Each opens the filter sheet. Then the choice group "Ver" (Jugadores, Parejas); on a short wide screen the filters and the choice group share one row. Then the facts line ("40 partidas · 8 jugadores") and the stat rows with 5 matches or more, 8 apart, with their places; then, under "Menos de 5 partidas" and a Muted sentence saying why, the rest, with no place. The order counts one extra win and one extra loss for everyone, so a single match cannot top the list; the percentage shown is the plain one. With no finished match, or none with players, the empty state with its own heading and sentence; with nothing for the filters, a heading, a sentence and a compact outlined "Quitar filtros". The filters last while the app is open.
- **Player statistics** (the player's name): the facts line naming the filters, then the total on a Text colour leaning layer (lean inset 16, padding 16 top, 24 bottom, 48 sides) in Ground type: the rate in Hull numerals, "9 ganadas · 6 perdidas" (Meta) and a 10-tall meter in Ground colour. Under "Con cada pareja", one stat row per partner, split at 5 matches as on the lists. When the filters leave the player out, a Title heading and a sentence say so instead of an empty page.
- **Standings** ("Tabla"): the facts line (rule and matches played), a sentence naming the teams in a tie-break, and the ranking list, which marks the two teams at the board. Footer: danger-outlined "Terminar torneo", which opens the end-of-tournament sheet.
- **Champion** (locked; "Campeón del torneo", or "Torneo terminado" with no champion): flooded with the colour of the side the champion last won on. The champion slab in its ink form, or a sentence naming the tied teams, then "Clasificación" with the ranking list. Footer: compact "Deshacer", when there is a step to take back, and "Guardar y salir".

### Seat Slabs
The two sides of the next match, stacked: left seat above in Safety Orange, right seat below in Acid Yellow. One shared part sets them on the next-match screen and on the personalised match. Each is a leaning team-colour layer (lean inset 18, Team Edge keyline), minimum height 120, padding 16 vertical and 40 horizontal, holding the team name (Title), its players line (Meta) and the wins chip 8 below; all text is Graphite Ink. Where the wins chip is left out, a team with no players reads "Sin jugadores" in place of its players line.
- **VS mark:** a Graphite Ink leaning layer with a 2-pixel Text colour keyline, "VS" in On Ink (Title), centred on the gap between the two slabs. It never takes a tap.
- **"Entra":** in a tournament, a team that did not play the last match carries a Graphite Ink chip at its top right, "Entra" in its own colour (Label, 800).
- **The slab is a button** that asks to change its side. Where another team can take the side (between tournament matches, and at a mesa) it opens the seat sheet and shows a 28-pixel mark of two passing arrows at its right in Graphite Ink; on the personalised match outside a mesa it opens the team sheet and shows a 28-pixel pencil in the same place. With no team waiting it is disabled, the arrows are left out and it does not respond.
- **Hover:** fill brightens by 6%. **Pressed:** fill at 70% opacity. **Focus-visible:** Graphite Ink ring drawn 8 pixels inside the slab.

### Match Sides
The score of a finished match: two leaning team-colour layers side by side (lean inset 18, Team Edge keyline, padding 12 vertical and 36 horizontal), left side and right side as they sat at the board. Each holds the team name (Button), players line (Label), total (Display, shrinks to fit) and the "Ganador" chip, in Graphite Ink.

### List Entries
- **Match entry:** a leaning Surface layer that is a button (lean inset 8, padding 12 vertical, 24 left and 52 right, 4 between lines). A 20-pixel chevron in Muted Text sits 16 from the right edge, centred on the entry, and says that it opens. First the date, or inside a tournament record the number of the match ("Partida 1") (Label, Muted Text), with "Desempate" at its right in Text colour when it was one. Then one line per team, at least 36 tall: name (Button) above its players line (Label), and total at the right in a 64-wide column. The winner's line is Text colour with its total in a points chip of the side it played on; the other line is Muted Text with a plain total.
- **Tournament entry:** the same entry on Raised Surface, with the same chevron: date; a line with the triple-slash mark (14, Text colour), "Torneo" (Button) and the summary at the right ("4 equipos · 6 partidas", Label, Muted Text); a line with "Campeón" (Label, Muted Text) and the champion chip, or "Sin campeón".
- **States:** hover brightens the layer by 12%; pressed drops it to 70% opacity.

### Ranking List
A tournament's teams in order, most matches won first. Column heads in Label type, Muted Text (Graphite Ink on a flood): "Equipo", "G", "P". Rows are leaning Surface layers 8 apart (lean inset 8, minimum height 60, padding 8 vertical, 16 left, 24 right, 8 between columns): position number in a 2.25rem column (Muted Text), team name (Button) above its players line (Label, Muted Text) and, for the two teams at the board, the line "En juego" (Label size, 800, in the colour of the text), then matches won (800, Text colour) and lost (600, Muted Text), each centred in a 2.5rem column, all tabular. Teams level on wins share a position number, as they do when a champion is decided: two teams with the most wins are both 1 and the next is 3. The rows in first position, once there is at least one win, sit on Raised Surface with a 2-pixel Text colour keyline and print their position in Text colour. Rows are not buttons.

### Stat Row
A player or a couple and how often they won, on a leaning Surface layer (lean inset 8, minimum height 72, padding 8 vertical, 16 left, 24 right): the place in a 2.25rem column (Title size, Muted Text), then the name (Button, shrunk to fit) or the couple's players line (Button) with the rate at the right of the same line (Title size, 800, tabular, never shrunk, "60 %"), moving under the name when the line has no room, the record under it ("9 de 15 ganadas", "1 de 1 ganada", Label, Muted Text, wrapping), and an 8-tall leaning meter across the width: a Line colour track at 45% with a Text colour fill to the share won, which grows from empty over 420 ms unless motion is reduced. The rows in first place, once they have a win, take Raised Surface with a 2-pixel Text colour keyline and print their place in Text colour. The same rate over the same number of matches shares a place. A couple's players line is set at Compact size and wraps, the dot staying with the first name. A row below 5 matches has no place and no leader outline. A shared place is announced as "empatado". A player's row is a button with a 20-pixel chevron that opens the player; a couple's row is not. No side colour is used: the statistics are about people, not about the left or right of the board.

### Champion Slab
The team that won a tournament, on a large leaning layer (lean inset 22, padding 16 vertical and 48 horizontal): the name (Display, shrinks to fit), its players line (Body size, 600 italic) and the wins line (Meta) 4 below. On a tournament record the role "Campeón" (Meta) is printed above the name; on the champion screen the title already says it.
- **On the ground:** the colour of the side the champion last won on, Graphite Ink type, Team Edge keyline. With no side, Text colour fill with Ground colour type and no keyline.
- **On its own flood:** Graphite Ink fill with type in the flood's colour, as the winner's slab.
- **On the champion screen** it lands with a stamp and a burst when the tournament has just been decided (see Moments); opened again, it is simply there.

### Navigation
There is no navigation bar. The header's menu control, a 24-pixel mark of three leaning bars in a 48-pixel square, opens the menu sheet, which leads to Inicio (while nothing is being played and it is not already showing), the tournament, the history, the statistics, the mesas, the two teams, the appearance and the reset sheet. Hover turns the icon from Muted Text to Text colour; pressed drops it to 70% opacity; its focus ring is a 3-pixel leaning outline drawn on a layer of its own, withheld after a touch like every other ring. Full screens open one over another (history, then a tournament, then one of its matches) and each returns through its own back control. The steps that must be answered, the next match and the champion, open by themselves and are locked. Inicio leads to the quick match, the rematch, the personalised match and the tournament setup, and the personalised match returns to it through its back control; starting a match, by any of them, leaves Inicio for the board.

### Choice Group
One choice out of a few: compact outlined slabs in one row under a label (Label size, Muted Text), sharing the width equally, 8 apart, lean inset 5, 8 horizontal padding. The chosen one takes the neutral fill (Text colour, Ground label, no edge). Labels shrink to fit, down to 0.4. It is a radio group: arrow keys move the choice and wrap around. It applies on touch. Three are in use: "Apariencia" in the menu sheet (Sistema, Claro, Oscuro), which is announced as it changes; "Mostrar" in the history; "Final del torneo" in the tournament setup.

### Icons
Line icons drawn inline as SVG on a 24 grid with a round-capped stroke, 2 pixels wide on every one of them. Utility icons are Muted Text: a pencil (16 in the target slab and in a rules slab, 20 in a team row and in the 48-pixel label beside the name field), the menu mark (24), and the chevron that says a surface opens (20, at the right of the status line, of a list entry and of a choice at Inicio). An icon inside a slab or a bar takes the colour of its label: the plus of "Añadir equipo" (20), the bin of "Borrar" (20, Danger), the back chevron (24), the chevron of the "Partida rápida" band (24, On Ink), and the swap arrows or the pencil on a seat slab (28, Graphite Ink). They are hidden from assistive technology, and never carry a team colour.

### Undo Bar
The board's one transient bar: a leaning layer in inverse colours (Text colour fill, Ground colour type) floating over the bottom of the list, 8 above the quick bar with 16 side margins, minimum height 52, padding 24 left, 8 right and 4 above and below. The message is Body type, upright, line-height 1.25; it wraps onto as many lines as it needs and the bar grows with it. The action is a text action that keeps its width; once the message would have less than 9rem beside it, the action moves under the message, at the right. Its focus ring is Ground colour, drawn 5 pixels inside the target so the whole ring sits on the bar's own fill. It rises 12 pixels while fading in over 200 ms.
- **Three seconds, every offer:** every undo, whatever it takes back, stays on offer for 3 seconds and then goes. The time stops while a pointer rests on the bar or focus is inside it, and starts again from 3 seconds when it leaves. A newer offer replaces the one showing. No offer survives closing the app.
- **One hand:** a deleted hand, a corrected hand and a hand added with the quick-points slab. Only that hand is reversed, so hands scored in the meantime stay.
- **The whole board:** a closed match, cleared hands, a full reset, a quick match that replaced other teams or settings ("Partida rápida empezada") and every step of a tournament (started, tie-break started, ended, cancelled, saved). Taking one back returns to where it was offered, Inicio included: the quick match brings Inicio back with what it replaced, and a full reset brings the board back from Inicio. The offer also ends when the board next changes. On the two locked screens the same step back is the footer's "Deshacer", which follows the same 3 seconds and holds while touched or focused.
- **Removed entries:** a deleted match or tournament, a cleared history, and a removed mesa, player or saved team. On a full screen the bar floats over the end of the body, 8 above the footer, and offers back only what was removed from the history or the mesas; while it shows, the body gains 88 of bottom padding so its last entry stays visible. An offer to bring back a mesa also ends when the mesas change again.
- **Update notice:** with nothing to undo and no hands on the board, the same bar says that a new version is waiting ("Hay una versión nueva") with the action "Actualizar". It never interrupts a match, and it is shown on the board and at Inicio only.

### Motion
Every authored movement is brief and uses one curve, an exponential ease-out (`--ease-out`).
- **Row enter:** 200 ms, 56 pixels sideways from the scoring team's side.
- **Total pop:** 220 ms, scale 1.14 to 1.
- **Sheet slide:** 200 ms, up from below the bottom edge, with the scrim fading over the same time.
- **Screen slide:** 220 ms, from 24% to the right with a fade; a flooded screen's colour sweeps in as the winner flood does.
- **Winner flood:** 220 ms, from 1.6 screen widths on the winner's side; content fades in over 220 ms after a 60 ms delay.
- **Undo bar rise:** 200 ms, 12 pixels up with a fade.
- **Press shift:** 90 ms, 3 pixels right.

#### Moments
The game's events get more than a slide, so the table feels the score change hands. Every moment follows three rules. It never waits: its layers never take a tap, and the sheets, dialogs and buttons work from the first frame. A newer moment replaces one still playing. Only a forward action plays one; an undo, a correction, another tab or opening the app never do.
- **Hand:** the total rolls up from its old value over 380 ms (a lower value simply jumps), kicks to scale 1.12 with 3 degrees more lean and settles over 260 ms. A Graphite Ink tag with the points in the team colour ("+25", Compact) rises 28 pixels off the total and fades over 600 ms. A band of white light at 42% crosses that livery once, over 320 ms.
- **Lead change:** when a hand puts a team in front and the last team in front was the other one (a tie hands the lead to nobody), a Graphite Ink leaning band crosses both liveries 8 below their top edge, from the new leader's side: its name (Meta) over "¡Se pone delante!" (Title), in its colour. It arrives in 240 ms, holds and leaves by the far side, 1.1 s in all. On a short screen it is one line at Button size across the middle of the strip. The phone gives a double pulse, and the live region adds "¡Se pone delante!".
- **Match start:** after "Nueva partida", "Partida rápida", "Empezar partida" on the personalised match, the start of a match at a mesa, or a tournament match, both liveries slam in from their own sides and recoil 6 pixels at the seam (520 ms). A Graphite Ink "VS" (Title, On Ink) lands on the seam at scale 2 and stays until 900 ms. In a tournament a second band below it names the match: "Partida 1 · Primero a 2", "Partida 3", "Desempate · Partida 5" (1.3 s).
- **Win:** the flood sweeps in over 300 ms, followed by a Graphite Ink band a third of the screen wide that crosses and leaves by the far side (440 ms). The mark streaks in from the winner's side, the heading slams down from scale 1.3, the sentence rises, the winner's slab and then the other team's slide in from their own sides, and the winning total counts up from 0 over 640 ms. The wins line turns over: the old count slides up and out as the new one comes up from below. The actions only fade in, over 120 ms.
- **Next match:** the seat slabs slam in from their own sides (440 ms), the VS lands at scale 2 and "Entra" is stamped in. The personalised match opens with the same face-off.
- **Inicio:** at launch it is simply there. Arriving later in the session, it fades in over 220 ms while the two sides slam in from their own edges and recoil 6 pixels at the seam (480 ms), the VS lands from scale 2 (240 ms, after 260) and the band rises 12 pixels (240 ms, after 200). Leaving, it fades over 220 ms as the two sides part 40% towards their own edges, while the board beneath, already live and no longer inert, plays the match start. The band's light first crosses 600 ms in, then every 2.4 s.
- **Champion:** the champion slab stamps down from scale 1.35 (420 ms), about 36 small leaning bars in Graphite Ink, On Ink and the champion's colour burst from it and fall away (1.1 to 1.4 s, removed when done), and the ranking rows rise in 50 ms apart. The phone gives a long pattern.

All of it is declared only when the reader has not asked for reduced motion. Under `prefers-reduced-motion` every surface appears in its final state (the lead band and the VS still appear, fading in and out without moving, and the match point stripe keeps still), the press keeps its opacity change but not its shift, and the list jumps to the end instead of scrolling smoothly. Where the browser supports it, a new hand gives a 15 ms vibration and a win gives a short pattern; iOS stays silent. The screen is kept awake while the board is in use; at Inicio it may sleep.

### Accessibility Behaviour
- **Announcements.** One visually hidden live region (`role="status"`) speaks each change: the scoring team's name and new total after a hand, the winner sentence when a match is won, the champion when a tournament is won, the appearance when it is chosen, the undo message followed by "Deshacer" when an undo is offered, and "Deshecho" once it is taken. A repeated message is altered invisibly so it is spoken again. Every full screen carries its own copy of the region, because the board's is out of reach while a dialog is open. Field errors and notices sit in their own always-present status element tied to the field, so they are heard as they arrive.
- **Labels.** Every control carries a Spanish label that states its result: a livery reads its name, players, total, points remaining and matches won; a row reads its hand, team and points and says that it opens options; a selected hand is a group named the same way, and "Corregir" and "Eliminar" name the hand they act on. A history entry reads its date, result and what opening it shows; a ranking row reads its position, team, players, matches won and lost, and whether it is at the board, and the column heads "G" and "P" are spelled out once for screen readers; the status line reads what it shows and says that it opens the table; the grid at Inicio reads "Partida rápida: Equipo A contra Equipo B, meta 200, puntos rápidos +30"; a rules slab reads its value and that it changes it ("Meta: 200 puntos para ganar. Cambiar"); a seat reads its team, players and wins, and says that it can be changed. The points sheet is named for what it does: "Anotar para" the team, or the hand being corrected.
- **Dialogs.** Sheets, full screens and the winner screen are modal `<dialog>` elements named by their title. Escape and system Back close them, except a locked screen, which stays until its own action is taken. Focus returns to the control that opened the surface, for every kind of input; after a touch only the ring is withheld, so a screen reader continues from the same place. On a device with a coarse pointer the ring is withheld from the start, before anything has been touched. The menu closes before the surface it leads to opens, so focus comes back to the menu control.
- **Inicio.** Inicio is a layer of the page, not a dialog: the board beneath it is inert, and the page's one hidden heading sits outside both. When Inicio arrives during a session, focus moves to the grid; when it leaves, to the board, unless a dialog that is still open holds it. At launch focus is left where the browser puts it. An undo taken at Inicio returns focus to the grid.
- **Undo bar.** The 8-second timer of a single hand pauses while the pointer is over the bar or focus is inside it, and starts again when it leaves. Once an undo is taken the bar is gone, so focus moves to the hand that came back or changed, or to the board itself, which shows no ring.
- **Long press.** Long press has no keyboard or screen-reader equivalent, so it is only a shortcut: the header's target slab opens the same settings sheet, where the quick-points value is the second field.
- **Text size.** Layout survives the reader's font size up to the caps: paired actions stack, labels shrink to fit and stop at 12 pixels, the second name of a players line moves under the first, the undo message wraps and its action moves under it, the two player fields stack, sheets, screens and the winner's scores scroll inside themselves, and the short-screen layout arrives sooner because its thresholds are in em.
- **Page.** The document language is Spanish and the page has one visually hidden heading with the app's name.

## Do's and Don'ts

### Do:
- **Do** draw every filled shape as the 12-degree parallelogram (offset = height × 0.2126), leaning the same way as the italic type: a skewed layer behind the content, or a clip-path cut where the lean is a fixed distance.
- **Do** inset the leaning layer by half its lean so the slanted ends stay inside the element's box.
- **Do** put Graphite Ink on Safety Orange and Acid Yellow in both appearances.
- **Do** give every team-colour fill on the ground or a surface the 2-pixel Graphite Ink keyline by day.
- **Do** give a team the colour of the side it sits on in a tournament, and a champion the colour of the side it last won on, or Text colour when there is none.
- **Do** set names, numbers and commands in Kanit italic capitals, and keep upright sentence case for full sentences.
- **Do** use tabular numerals for any number that updates.
- **Do** size type in rem with a pixel cap: 1.6 times for text, 1.2 times for numerals and the winner heading. Let one-line text shrink to fit, never below 12 pixels, and let a players line wrap instead of shrinking.
- **Do** keep every target at least 48 pixels and slab buttons at least 56 tall; on a short screen slabs may drop to 48, never lower.
- **Do** outline in Danger the action that leads to deleting or ending, and fill with Danger the one that does it.
- **Do** mark state by stepping a neutral tone (Surface to Raised Surface), by adding a Text colour keyline, or by swapping fill and outline.
- **Do** give every interactive element the 3-pixel focus ring, in a colour that contrasts with the surface it sits on and drawn wholly on that surface. After a touch, withhold the ring but leave focus where it is; text fields always keep theirs.
- **Do** bring things in from the side or edge that owns them, in 200 to 220 ms with the exponential ease-out, and declare the movement only when reduced motion is not requested.
- **Do** keep text fields, the sheet panel and the full screen rectangular.
- **Do** keep sheets above the on-screen keyboard and inside the 480 column, and full screens inside the same column.
- **Do** pin a screen's actions in its footer and let only its body scroll.
- **Do** tighten the same parts when the viewport is 36em tall or less, with thresholds in em, and keep the actions of every overlay on screen.
- **Do** keep what is about to change in view while its options are showing, and put each explanation directly under the action it explains.
- **Do** give any gesture-only shortcut a visible control that reaches the same value.

### Don't:
- **Don't** print a team colour as text on the ground or on a neutral surface; it is only legible as text on a Graphite Ink fill.
- **Don't** round a corner. No radius exists in this system.
- **Don't** skew or rotate the element that holds text at rest. The layer behind it leans; the italic does the rest. A moment may pass through a skew and settle.
- **Don't** add shadows, gradients or blur to slabs, rows, chips, liveries, fields or sheets. The only gradient is the passing light of a moment.
- **Don't** make a moment wait for itself: nothing that plays may delay a tap, a sheet or the next hand.
- **Don't** celebrate an undo or a correction.
- **Don't** invert the ink on team colours in the day appearance.
- **Don't** use Danger for anything other than an invalid value or an action that deletes or ends.
- **Don't** add a second ornament alongside the triple-slash mark.
- **Don't** give a utility icon a team colour.
- **Don't** save anything when a sheet is dismissed; only its button commits.
- **Don't** let the page scroll; the list is the only scrolling region on the board, and the body the only one on a full screen.
