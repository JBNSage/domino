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
---

# Design System: Dominó

Dominó is an Angular progressive web app. Every token below is a CSS custom property on `:root` in `src/styles.css`; component styles live inline in `src/app/components/*.ts`. Lengths are CSS pixels and type sizes are rem, so they follow the reader's font size. Component tokens reference the night appearance, which is the default; the day appearance is applied by `data-scheme="light"` on the root element, swaps each `-night` colour for its `-day` sibling and leaves the team colours and ink untouched. The CSS names drop the suffix (`--c-ground`, `--c-surface`, `--c-raised`, `--c-line`, `--c-text`, `--c-muted`, `--c-danger`, `--c-on-danger`, `--c-team-edge`, `--c-scrim`).

## Overview

**Creative North Star: "Liga de Carreras"**

The scoreboard is painted like two rival race cars parked nose to nose. Each team owns a flood of one loud colour with its total set in numerals large enough to read from the far seat at the table, and every other surface steps back to graphite at night or pit silver by day. There is one screen, and its four overlays (points sheet, settings sheet, reset sheet, winner screen) are built from the same parts.

The system has one shape and one typeface. The shape is a parallelogram that leans 12 degrees forward, used for buttons, rows, chips, the two liveries, the undo bar and the full-screen winner flood. The typeface is Kanit, set in heavy italic capitals for everything that is a name, a number or a command, and in upright medium only for full sentences. The only ornament is a mark of three small leaning bars cut from the same shape.

Density is low and the targets are large: the smallest control is 48 pixels, slab buttons are 56 pixels tall (48 on a short screen), and the screen carries no navigation, no cards and no icons beyond two small utility symbols. On a wide screen the same phone column sits centred on the ground, 480 pixels wide.

**Key Characteristics:**
- Two saturated team colours used as fills, always carrying graphite ink.
- One forward-leaning parallelogram as the shape of every filled element; zero corner radius anywhere.
- Kanit extra-bold italic capitals with tabular numerals; hull-sized totals at 4.75rem.
- Flat tonal layering on a single ground colour per appearance.
- Brief motion, 200 to 220 ms, exponential ease-out, entering from the side that owns it; all of it removed under reduced motion.
- Spanish interface copy throughout, in the informal second person, with short imperative commands.

## Colors

Two loud liveries on a neutral ground that flips between graphite and pit silver. The appearance follows the system until the reader chooses otherwise: "Sistema", "Claro" or "Oscuro". The choice is kept on the device, resolved to `data-scheme` on the root element before the first paint, and is not part of the match, so "Todo" in the reset sheet leaves it alone.

### Primary
- **Safety Orange** (`team-a`): team A. Floods the left livery, the team A points chip in each row, the left "Anotar" slab, the slash mark and confirm slab on team A's points sheet, and the whole screen when team A wins.

### Secondary
- **Acid Yellow** (`team-b`): team B. The same roles on the right side.

### Neutral
- **Graphite Ink** (`ink`): everything printed on a team colour, in both appearances. Also the fill of the rounds chip, the winner's slab and the "Nueva ronda" slab on the winner screen, the outline of slabs that sit on the winner flood, and the scrollbar thumb of the winner screen.
- **On Ink** (`on-ink`): the label of the "Nueva ronda" slab. White in both appearances.
- **Graphite Ground** (`ground-night`) / **Pit Silver Ground** (`ground-day`): the page, the sheet panel and the interior of outlined slabs. Also the text and focus ring colour on the undo bar.
- **Surface** (`surface-night` / `surface-day`): score rows and the number field.
- **Raised Surface** (`surface-raised-night` / `surface-raised-day`): the most recent row in the list, a selected row, the fill of a disabled slab, and the scrollbar thumb of the list.
- **Line** (`line-night` / `line-day`): the 2-pixel outline of outlined slabs and fields, the underline of the name field, the 1-pixel hairlines above the quick bar and above the install hint, the text selection colour, and the slash mark in the empty state.
- **Text** (`text-night` / `text-day`): primary text on the ground, the default focus ring, the fill of the neutral "Guardar" and "Corregir" slabs and of the undo bar, the keyline of a selected row, the hand number of the newest row and of a selected one, the caret, the "Ahora no" action, the note on the reset sheet, and the slash mark of every sheet by day.
- **Muted Text** (`text-muted-night` / `text-muted-day`): field labels, hand numbers, zero cells, explanatory sentences, the help under each reset choice, the two utility icons, and the label of a disabled slab.
- **Team Edge** (`team-edge-night` / `team-edge-day`): a keyline around every team-colour fill that sits on the ground or a surface. Transparent and 0 pixels wide at night; Graphite Ink and 2 pixels wide by day (`--team-edge-width`), because orange and acid yellow lose their edge against pit silver and white.
- **Danger** (`danger-night` / `danger-day`) with **On Danger** (`on-danger-night` / `on-danger-day`): the border of an invalid number field and its error sentence; the fill of the two destructive slabs ("Eliminar" on a selected hand, "Todo" on the reset sheet); the slash mark of the reset sheet at night.
- **Scrim** (`scrim-night` / `scrim-day`): the dimmed backdrop behind a sheet.

### Named Rules
**The Livery Rule.** A team colour is a fill. It carries Graphite Ink and never prints as text on the ground or on a surface.

**The Graphite Exception Rule.** A team colour prints as text only on a Graphite Ink fill: the rounds chip inside each livery and the winner's slab on the winner screen.

**The Same Ink Rule.** Ink on a team colour is Graphite Ink in both appearances. It does not invert when the ground does.

**The Day Keyline Rule.** By day every team-colour fill on the ground or a surface wears a 2-pixel Graphite Ink keyline: liveries, points chips and team slabs. At night the keyline has no width. The winner flood never wears one.

**The Danger Rule.** Danger means an invalid value or an action that deletes. It is never decoration and never a team.

## Typography

**Display Font:** Kanit 800 italic (with `sans-serif`)
**Label Font:** Kanit 600 italic (with `sans-serif`)
**Body Font:** Kanit 500 upright (with `sans-serif`)

The three cuts are self-hosted from `@fontsource/kanit` (latin subset), so they work offline. `font-synthesis: none` stops the browser from faking a weight or a slant that was not loaded.

**Character:** A single family doing two jobs. The italic cuts are fast and loud for names, numbers and commands; the upright medium is quiet and used only where a full sentence has to be read.

### Hierarchy
- **Winner** (800 italic, 8.25rem, line-height 1.06, tabular): the winner's total on the winner screen.
- **Hull** (800 italic, 4.75rem, line-height 1.05, tabular): the team totals in the lockup. Both totals drop to Display size together when either has more than four digits.
- **Display** (800 italic, 3.5rem, uppercase): the winner heading and the other team's total on the winner screen.
- **Field** (800 italic, 2.75rem, line-height 1.2, tabular): the text typed into a number field.
- **Title** (800 italic, 1.75rem, uppercase): the target value in the header, the team name field, sheet titles (including the heading of a hand being corrected), the empty-state heading, the winner sentence. Headings use line-height 1.15 and balanced wrapping. On a short screen it also sets the text of a number field, the winner heading and the other team's total.
- **Button** (800 italic, 1.25rem, uppercase, 0.5px letter-spacing on slabs): slab labels, team names on the liveries and the winner screen, points inside row chips. Zero cells use the same size in the 600 italic cut.
- **Compact** (800 italic, 1.125rem, uppercase): the label of a compact slab.
- **Body** (500 upright, 1rem, line-height 1.45, sentence case): the empty-state and install sentences (capped at 34ch), the help and note on the reset sheet (capped at 65ch, line-height 1.35), field messages, the undo message. The header's "Meta" label and the winner's rounds line use this size in the 600 italic cut, uppercase; the text actions ("Deshacer", "Actualizar", "Ahora no") use it in 800 italic, uppercase, underlined.
- **Meta** (600 italic, 0.9375rem, uppercase, 0.4px letter-spacing, tabular): points remaining and the rounds chip inside a livery; the team name on a livery on a short screen.
- **Label** (600 italic, 0.8125rem, uppercase): field labels and hand numbers. The hand number of the newest row and of a selected row is 800.

### Named Rules
**The Caps Italic Rule.** Names, numbers and commands are italic capitals. Upright sentence case is reserved for full sentences: explanations, errors, notices and the undo message.

**The Tabular Rule.** Every numeral that can change is set with tabular figures so totals and columns do not shift as they update.

**The Hull Cap Rule.** Type is sized in rem and follows the reader's font size, up to a pixel cap written into each token as `min(rem, px)`. Text stops at 1.6 times its designed size (Title, Button, Compact, Body, Meta, Label). Numerals and the winner heading stop at 1.2 times (Winner, Hull, Display, Field), because they are already large and must stay on one line.

**The One Line Rule.** Totals, team names, slab labels and the winner heading shrink to fit their box on one line rather than wrap or truncate. They never shrink below 0.5 of their designed size; the winner's total may go to 0.4. The fit leaves 4% of slack, because letter-spacing does not shrink with the type, and only the width is clipped, so tall glyphs such as an opening exclamation mark stay whole.

### Voice
Copy lives in `src/app/copy.ts`. Commands are one or two words ("Anotar", "Guardar", "Cancelar", "Corregir", "Eliminar", "Deshacer", "Instalar", "Nueva ronda"). The score that wins a round has one name everywhere: "Meta". Sentences address the reader as "tú" and say what to do ("Escribe un número entre 1 y 999, sin signos ni decimales."). A consequence is stated before it happens ("Equipo A ya tiene 210: al guardar, gana la ronda.") and the confirm label changes to match ("Terminar ronda"). Exclamation is used once, on the winner heading.

## Layout

One column, the full dynamic viewport tall (`100dvh`), capped at 480 pixels wide (`--column`) and centred on the ground. The page itself never scrolls; only the list does. Four bands, top to bottom:

1. **Header.** Target slab at the left; at the right, two 48-pixel icon controls side by side: appearance, then reset. Padding 24 left, 8 right, 12 vertical. The top safe-area inset is added above it.
2. **Lockup.** Two equal panels, edge to edge, minimum height 172. Each livery bleeds 48 past the column edge and leans a fixed 36 pixels, leaving a diagonal seam of ground about 6 pixels wide between them.
3. **List.** Fills the remaining height and scrolls inside itself. 16 horizontal padding, 12 vertical, 8 between rows. Each row has two equal team columns with a 44-wide hand number between them, so points sit centred under their livery. The list follows a new hand to the end; a correction or a deletion further up leaves the reader where they are, unless the undo bar arrives while the end of the list is within 80 pixels, in which case the list moves to the end so the bar does not cover it. When empty, the content is left-aligned and vertically centred with 32 horizontal padding. While the undo bar is showing, the list gains bottom padding equal to the bar's height so the last row stays visible.
4. **Quick bar.** Pinned to the bottom, separated from the list by a 1-pixel Line hairline. Two equal columns with a 24 gap, one per team. Each column stacks a compact outlined quick-points slab above the team's filled "Anotar" slab with an 8 gap, so the every-hand action sits at the bottom edge. Padding 12 top, 24 sides, 12 plus the bottom safe-area inset below.

Spacing comes from a six-step scale (4, 8, 12, 16, 24, 32). Minimum target is 48 pixels in either dimension (`--min-target`).

Sheets are anchored to the bottom edge, capped at the same 480 column, and no taller than 92% of the viewport minus the keyboard; they scroll inside themselves past that. The app shell measures the on-screen keyboard from the visual viewport and publishes it as `--keyboard-inset`; a sheet's bottom edge sits at that inset, so its buttons stay above the keyboard. Sheet panels pad 24 on top and sides, the larger of 16 and the bottom safe-area inset below, with 16 between blocks.

Pairs of actions sit side by side and wrap onto separate lines once the reader's text size needs the room (each wants at least 7.5rem; the primary action grows 1.5 times faster than the other).

### Short screens

There is one responsive step, and it is about height. When the viewport is no taller than 36em (`@media (max-height: 36em)`) the same parts are set more tightly so the hands keep their room; a second step applies when that short viewport is also at least 30em wide (`and (min-width: 30em)`). Both are measured in em, so a phone on its side and a small phone with large text get the same layout. The column stays 480 wide and centred.

- **Header:** vertical padding drops from 12 to 4.
- **Lockup:** the panels lose their minimum height and become a strip with 8 vertical padding. The team name is set in Meta size on its own line, the total in Field size, and the points remaining and rounds chip sit under the total, or beside it at 30em wide. An empty rounds chip is removed instead of keeping its space.
- **Quick bar:** 8 top and bottom padding, 16 between the columns, both slabs 48 tall. At 30em wide the quick-points slab sits beside "Anotar" in each column, each taking half, with 12 horizontal padding.
- **Number field:** minimum height 56, Title size.
- **Sheets:** 12 between blocks, 16 top padding, and the triple-slash mark is not shown.
- **Winner screen:** the compact variant described under Components.

A desktop window shows the phone column centred. Tablets are not designed for. The web manifest still asks for portrait.

## Elevation & Depth

Depth is tonal. Three neutral steps stack on each other (ground, surface, raised surface) and the team colours sit on top of all of them as flat fills. Overlays separate from the screen with a scrim, and the undo bar separates from the list by inverting the neutral colours. There are no shadows, gradients or blurs anywhere in the build.

### Named Rules
**The Tonal Step Rule.** A surface is distinguished from what is beneath it by stepping one neutral tone, never by a shadow or a gradient. The newest row is marked by moving from Surface to Raised Surface. A selected row takes the same step and adds a 2-pixel Text colour keyline.

## Shapes

One silhouette: a parallelogram whose top edge is shifted right of its bottom edge by 12 degrees (horizontal offset = height × 0.2126). It is the same direction as the italic type, so shapes and letters lean together. Corners are sharp; no radius is used anywhere in the build.

The shape is drawn in CSS in two ways, and the content is never skewed in either.

- **The leaning layer.** Any element that needs the shape gets a pseudo-element behind its content, filled with `--fill`, bordered 2 pixels in `--edge`, and skewed 12 degrees (`transform: skewX(-12deg)`). The element isolates its own stacking context so the layer stays behind its label and in front of the page. The layer is inset horizontally (`--lean-inset`) by half the lean so the slanted ends stay inside the element's box: 6 by default, 3 for chips, 5 for the three option slabs under a selected hand, 8 for the other team's slab on the winner screen, 24 for the winner's slab (12 in its compact form). An outline is the layer's own border, so fill and outline are one box. Used for slabs, rows, chips, the undo bar and the winner screen's slabs.
- **The cut.** Where the lean must be a fixed distance rather than a fixed angle, the shape is cut with `clip-path`. The two liveries are cut on a fixed 36-pixel seam so the diagonal between them stays parallel at any height; by day a second, slightly larger cut in Graphite Ink sits behind each one as the keyline. The slash mark is cut as a percentage polygon.

The winner flood is a single layer skewed the same 12 degrees and stretched 60% past each side of the screen, so its slanted ends are never seen.

The triple-slash mark is three of the same parallelograms side by side, each 0.62 of its height wide with a gap of 0.05 of its height. It appears above sheet content (18 tall; in the sheet's accent at night and in Text colour by day, where acid yellow would vanish on the pale ground), in the empty state (22, Line colour) and above the winner heading (40, Graphite Ink). On a short screen the sheets and the winner screen leave it out.

Two kinds of surface are rectangular by design: text fields, because a caret and a selection need a straight box, and the sheet panel, which is the ground the slabs sit on.

### Named Rules
**The Lean Rule.** Every filled shape is the 12-degree parallelogram. Skew the layer behind the content, or cut it; never skew, rotate or round the element that holds the text.

**The One Ornament Rule.** The triple-slash mark is the only decoration. It is hidden from assistive technology.

## Components

### Buttons
Slab buttons are blunt and physical: a leaning block that shoves sideways when pressed.
- **Shape:** the leaning layer, minimum height 56, 24 horizontal padding (12 when paired in a row), label centred on one line and shrunk to fit. On a short screen the slabs of the quick bar and the winner screen are 48 tall.
- **Outlined (default):** Ground interior, 2-pixel Line outline, Text label. "Cancelar", "Solo las manos", "Instalar", the quick-points slab.
- **Compact:** minimum height 48, 16 horizontal padding, Compact type. The target slab, the quick-points slab, the three options under a selected hand, "Instalar", the reset sheet's "Cancelar", the winner screen's correction slab.
- **Team:** team colour fill, Graphite Ink label, Team Edge keyline. "Anotar" in the quick bar and on the points sheet.
- **Neutral filled:** Text colour fill, Ground colour label. "Guardar" and "Terminar ronda" on the settings sheet; compact "Corregir" under a selected hand.
- **Ink:** Graphite Ink fill, On Ink label. "Nueva ronda" on the winner screen.
- **Danger:** Danger fill, On Danger label, no outline. "Eliminar" and "Todo".
- **Disabled:** Raised Surface fill, Muted Text label, no outline, default cursor, regardless of variant. It does not respond to hover or press.
- **Hover** (pointer devices only): the layer brightens by 12%.
- **Pressed:** the layer drops to 70% opacity (`--pressed`) and the whole button shifts 3 pixels right over 90 ms. The shift is skipped under reduced motion; the opacity stays.
- **Focus-visible:** a 3-pixel outline, 3 pixels off the element, in Text colour. Surfaces that are not the ground set their own ring colour: Graphite Ink on the liveries and the winner screen, Ground colour on the undo bar. After a touch the ring is not drawn on anything but a text field, while focus itself stays where it is; Tab or an arrow key brings the ring back.
- **Text action:** where a second, lighter action sits beside a message, it is a 48-tall target with no shape: Body size, 800 italic capitals, underlined 0.2em below the baseline, pressed at 70% opacity. "Deshacer" and "Actualizar" on the undo bar (in Ground colour), "Ahora no" on the install hint (in Text colour).
- **Long press:** holding a quick-points slab for 500 ms without moving more than 10 pixels opens the settings sheet on the quick-points field; the click that follows is swallowed.

### Target Slab
A compact outlined slab in the header holding the "Meta" label (Body size, 600 italic, Muted Text), the target value (Title, Text) and a 16-pixel pencil icon. It opens the settings sheet ("Ajustes") on the target field. States are those of any slab.

### Liveries
The two panels of the lockup. Each is a full-height team-colour cut holding, top to bottom: team name (Button), total (Hull), points remaining (Meta) and the rounds chip. All text is Graphite Ink. The whole panel is one button that opens the points sheet.
- **Hover:** fill brightens by 6%. **Pressed:** fill at 70% opacity. **Focus-visible:** Graphite Ink ring drawn 8 pixels inside the panel.
- **Total pop:** when a total changes it scales from 1.14 back to 1 over 220 ms, anchored at its left edge.

### Chips
- **Rounds chip:** Graphite Ink leaning layer, 12 horizontal and 2 vertical padding, label in the panel's own team colour (Meta). With no rounds won it is invisible but keeps its space, so both totals stay level.
- **Points chip:** team-colour leaning layer inside a score row, minimum width 64, 12 horizontal and 4 vertical padding, points in Graphite Ink (Button), Team Edge keyline.

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
- **Install hint:** where the app can be installed and the reader has not dismissed the hint, a second block follows 24 below, under a 1-pixel Line hairline with 16 padding above: one Body sentence in Muted Text, then the actions in a wrapping row. Where the browser can install on request, a compact outlined "Instalar" slab and the text action "Ahora no"; on iOS the sentence names the share menu and "Ahora no" stands alone. It is not shown once installed, and it leaves with the first hand.

### Inputs / Fields
- **Number field:** rectangular, Surface fill, 2-pixel Line border, minimum height 76, 8 by 16 padding, Field type. Label 4 above in Label type, Muted Text. There is no placeholder; an empty field is empty. The numeric keypad is requested. What is typed is left as typed: a sign, a decimal or a letter is reported as an error, never removed silently. Focusing selects the whole value. On a short screen the minimum height is 56 and the text is Title size.
- **Name field:** no box; a 2-pixel Line underline, minimum height 48, Title type, uppercase. At its right the pencil icon (20) sits in a 48-pixel square that is the field's own label, so touching it starts the rename.
- **Focus:** the number field takes the 3-pixel Text ring flush against its border. The name field takes the same ring 2 pixels off. Fields keep their ring after a touch.
- **Caret and selection:** selection is Line colour with Text colour type. The caret is Text colour, except in the points field of the points sheet at night, where it is the team colour.
- **Error:** the border switches to Danger and a Danger sentence (Body, upright) appears beneath. The confirm slab is disabled while any value is invalid.
- **Notice:** a Text colour sentence in the same place, stating a consequence of saving without blocking it.
- **Enter:** moves to the next field, or confirms from the last one.

### Sheets
A rectangular Ground-colour panel on a native `<dialog>`, rising from the bottom over a Scrim. It opens with the triple-slash mark in the sheet's accent, then its title or fields, then its actions. The first field takes focus as the sheet opens, so the keyboard arrives with it.
- **Points sheet** (accent: the team colour): name field, points field, then "Cancelar" and the team's "Anotar". With a new name and no points the confirm reads "Guardar nombre". The same sheet corrects a hand: a Title heading ("Corregir mano 2 de Equipo B") takes the place of the name field, the points field opens with the hand's points selected, and the confirm reads "Guardar".
- **Settings sheet** (accent: Text colour): title "Ajustes", the appearance choice, the fields "Meta: puntos para ganar" and "Puntos rápidos: el botón +", then "Cancelar" and neutral "Guardar".
- **Reset sheet** (accent: Danger): title, then two choices, each a full-width slab with its explanation 8 beneath it in Muted Text, tied to the button as its description: outlined "Solo las manos" and Danger "Todo". Below them one sentence in Text colour says that both can be undone, then a compact outlined "Cancelar". Blocks are 16 apart.
- **Closing:** Escape, the system Back gesture, a tap on the scrim and "Cancelar" all close the sheet and discard; nothing is saved without its button.
- **Motion:** the panel slides up from below over 200 ms while the scrim fades in, and reverses on close.

### Winner Screen
A full-screen `<dialog>`. The winning team's colour floods the screen, sweeping in from that team's side over 220 ms; the content fades in 60 ms behind it. The content keeps to the 480 column. On the flood, in Graphite Ink: the triple-slash mark (40), the heading (Display), the winner sentence (Title) and the rounds line (Body size, 600 italic). The scores group is centred in the flexible middle of the screen with a 12 gap between its two slabs. Heading and scores scroll together when they do not fit, with a thin Graphite Ink scrollbar; the actions are pinned 16 below that region and never leave the screen.
- **Winner's slab:** a large Graphite Ink leaning layer with the team name (Button) stacked above the total (Winner, shrinks to fit), both printed in the winning team colour. Padding 40 horizontal, 24 top, 12 bottom.
- **Other team's slab:** the flood colour with a 2-pixel Graphite Ink outline, name at the left (Button) and total at the right (Display), both in Graphite Ink. Padding 32 horizontal, 8 vertical.
- **Actions:** stacked with a 12 gap. A compact slab in the flood colour with an ink outline takes back what ended the round; its label names the cause ("Corregir última mano", "Deshacer la corrección", "Volver a meta 200", "Cambiar la meta"). Below it, the Ink slab "Nueva ronda" counts the win and clears the board.
- **Compact (short screens):** the mark is left out, the heading drops to Title size and the winner sentence to Button size. The scores sit at the top of their region with 12 vertical padding. The winner's slab becomes a single line, name at the left and total at the right in Display size, padding 32 horizontal and 8 vertical, lean inset 12; the other team's total drops to Title size. Actions are 48 tall with an 8 gap, and at 30em wide they sit side by side, each taking half, with a 12 gap.
- **Closing:** Escape and the system Back do the same as the correction slab. The winner screen waits until any open sheet has closed.

### Navigation
None. The header carries two utility controls: the target slab and the reset control, a 24-pixel bin icon in a 48-pixel square that opens the reset sheet. Hover turns the icon from Muted Text to Text colour; pressed drops it to 70% opacity.

### Appearance Choice
Three compact outlined slabs in one row under the label "Apariencia" (Label size, Muted Text): "Sistema", "Claro", "Oscuro", 8 apart, lean inset 5. The chosen one takes the neutral fill (Text colour, Ground label, no edge). It is a radio group: arrow keys move the choice and wrap around. It applies on touch and is announced; "Guardar" and "Cancelar" belong to the two numbers only. The header control is the one-tap form of the same choice: it switches to the opposite of what is showing, whatever decided it, and its name says where it leads ("Cambiar a modo claro" / "Cambiar a modo oscuro").

### Icons
Line icons drawn inline as SVG on a 24 grid with a 2-pixel round-capped stroke, always Muted Text colour: a pencil (16 in the target slab, 20 in the 48-pixel label beside the name field), a bin (24), and the appearance mark (24), which shows what is on now: a moon by night, a sun by day. They mark utilities, are hidden from assistive technology, and never carry a team colour.

### Undo Bar
The board's one transient bar: a leaning layer in inverse colours (Text colour fill, Ground colour type) floating over the bottom of the list, 8 above the quick bar with 16 side margins, minimum height 52, padding 24 left, 8 right and 4 above and below. The message is Body type, upright, line-height 1.25; it wraps onto as many lines as it needs and the bar grows with it. The action is a text action that keeps its width; its focus ring is Ground colour, drawn 5 pixels inside the target so the whole ring sits on the bar's own fill. It rises 12 pixels while fading in over 200 ms.
- **One hand:** a deleted hand, a corrected hand and a hand added with the quick-points slab each offer an undo for 8 seconds. Only that hand is reversed, so hands scored in the meantime stay.
- **The whole board:** a closed round, cleared hands and a full reset offer an undo with no time limit. The offer survives closing and reopening the app, and ends when the board next changes.
- **Update notice:** with nothing to undo and no hands on the board, the same bar says that a new version is waiting ("Hay una versión nueva") with the action "Actualizar". It never interrupts a round.

### Motion
Every authored movement is brief and uses one curve, an exponential ease-out (`--ease-out`).
- **Row enter:** 200 ms, 56 pixels sideways from the scoring team's side.
- **Total pop:** 220 ms, scale 1.14 to 1.
- **Sheet slide:** 200 ms, up from below the bottom edge, with the scrim fading over the same time.
- **Winner flood:** 220 ms, from 1.6 screen widths on the winner's side; content fades in over 220 ms after a 60 ms delay.
- **Undo bar rise:** 200 ms, 12 pixels up with a fade.
- **Press shift:** 90 ms, 3 pixels right.

All of it is declared only when the reader has not asked for reduced motion. Under `prefers-reduced-motion` every surface appears in its final state, the press keeps its opacity change but not its shift, and the list jumps to the end instead of scrolling smoothly. Where the browser supports it, a new hand gives a 15 ms vibration and a win gives a short pattern; iOS stays silent. The screen is kept awake while the scoreboard is visible.

### Accessibility Behaviour
- **Announcements.** One visually hidden live region (`role="status"`) speaks each change: the scoring team's name and new total after a hand, the winner sentence when a round is won, the undo message followed by "Deshacer" when an undo is offered, and "Deshecho" once it is taken. A repeated message is altered invisibly so it is spoken again. Field errors and notices sit in their own always-present status element tied to the field, so they are heard as they arrive.
- **Labels.** Every control carries a Spanish label that states its result: a livery reads its name, total, points remaining and rounds won; a row reads its hand, team and points and says that it opens options; a selected hand is a group named the same way, and "Corregir" and "Eliminar" name the hand they act on. The points sheet is named for what it does: "Anotar para" the team, or the hand being corrected.
- **Dialogs.** Sheets and the winner screen are modal `<dialog>` elements named by their title. Escape and system Back close them. Focus returns to the control that opened the sheet, for every kind of input; after a touch only the ring is withheld, so a screen reader continues from the same place.
- **Undo bar.** The 8-second timer of a single hand pauses while the pointer is over the bar or focus is inside it, and starts again when it leaves. Once an undo is taken the bar is gone, so focus moves to the hand that came back or changed, or to the board itself, which shows no ring.
- **Long press.** Long press has no keyboard or screen-reader equivalent, so it is only a shortcut: the header's target slab opens the same settings sheet, where the quick-points value is the second field.
- **Text size.** Layout survives the reader's font size up to the caps: paired actions stack, labels shrink to fit, the undo message wraps, sheets and the winner's scores scroll inside themselves, and the short-screen layout arrives sooner because its thresholds are in em.
- **Page.** The document language is Spanish and the page has one visually hidden heading with the app's name.

## Do's and Don'ts

### Do:
- **Do** draw every filled shape as the 12-degree parallelogram (offset = height × 0.2126), leaning the same way as the italic type: a skewed layer behind the content, or a clip-path cut where the lean is a fixed distance.
- **Do** inset the leaning layer by half its lean so the slanted ends stay inside the element's box.
- **Do** put Graphite Ink on Safety Orange and Acid Yellow in both appearances.
- **Do** give every team-colour fill on the ground or a surface the 2-pixel Graphite Ink keyline by day.
- **Do** set names, numbers and commands in Kanit italic capitals, and keep upright sentence case for full sentences.
- **Do** use tabular numerals for any number that updates.
- **Do** size type in rem with a pixel cap: 1.6 times for text, 1.2 times for numerals and the winner heading. Let one-line text shrink to fit.
- **Do** keep every target at least 48 pixels and slab buttons at least 56 tall; on a short screen slabs may drop to 48, never lower.
- **Do** mark state by stepping a neutral tone (Surface to Raised Surface), by adding a Text colour keyline, or by swapping fill and outline.
- **Do** give every interactive element the 3-pixel focus ring, in a colour that contrasts with the surface it sits on and drawn wholly on that surface. After a touch, withhold the ring but leave focus where it is; text fields always keep theirs.
- **Do** bring things in from the side or edge that owns them, in 200 to 220 ms with the exponential ease-out, and declare the movement only when reduced motion is not requested.
- **Do** keep text fields and the sheet panel rectangular.
- **Do** keep sheets above the on-screen keyboard and inside the 480 column.
- **Do** tighten the same parts when the viewport is 36em tall or less, with thresholds in em, and keep the actions of every overlay on screen.
- **Do** keep what is about to change in view while its options are showing, and put each explanation directly under the action it explains.
- **Do** give any gesture-only shortcut a visible control that reaches the same value.

### Don't:
- **Don't** print a team colour as text on the ground or on a neutral surface; it is only legible as text on a Graphite Ink fill.
- **Don't** round a corner. No radius exists in this system.
- **Don't** skew or rotate the element that holds text. The layer behind it leans; the italic does the rest.
- **Don't** add shadows, gradients or blur to slabs, rows, chips, liveries, fields or sheets.
- **Don't** invert the ink on team colours in the day appearance.
- **Don't** use Danger for anything other than an invalid value or an action that deletes.
- **Don't** add a second ornament alongside the triple-slash mark.
- **Don't** give a utility icon a team colour.
- **Don't** save anything when a sheet is dismissed; only its button commits.
- **Don't** let the page scroll; the list is the only scrolling region on the board.
