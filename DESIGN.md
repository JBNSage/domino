---
name: Dominó
description: Two-team domino scoreboard drawn as rival racing liveries on a graphite or pit-silver ground.
colors:
  team-a: "#FF5A00"
  team-b: "#DFFF00"
  ink: "#0E1114"
  ground-night: "#0E1114"
  surface-night: "#1A1E23"
  surface-raised-night: "#2A2F36"
  line-night: "#6B7480"
  text-night: "#FFFFFF"
  text-muted-night: "#B6BCC4"
  danger-night: "#FF6B5C"
  scrim-night: "rgba(0, 0, 0, 0.72)"
  ground-day: "#F1F2F4"
  surface-day: "#FFFFFF"
  surface-raised-day: "#E1E4E8"
  line-day: "#7D858F"
  text-day: "#0E1114"
  text-muted-day: "#4A525B"
  danger-day: "#B3261E"
  scrim-day: "rgba(14, 17, 20, 0.6)"
typography:
  hull:
    fontFamily: "Kanit, sans-serif"
    fontSize: "76px"
    fontWeight: 800
    lineHeight: 1.05
    fontFeature: "tnum"
  title:
    fontFamily: "Kanit, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
  button:
    fontFamily: "Kanit, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.5px"
  body:
    fontFamily: "Kanit, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Kanit, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    fontFeature: "tnum"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
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
  slab-button-outlined:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
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
    typography: "{typography.label}"
    padding: "2px 12px"
  score-row:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.text-muted-night}"
    typography: "{typography.label}"
    height: "52px"
  score-row-latest:
    backgroundColor: "{colors.surface-raised-night}"
    textColor: "{colors.text-muted-night}"
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
    padding: "8px 16px"
    height: "76px"
  sheet-panel:
    backgroundColor: "{colors.ground-night}"
    textColor: "{colors.text-night}"
    padding: "24px"
  winner-slab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.team-a}"
    padding: "24px 40px 12px 40px"
  winner-slab-other:
    backgroundColor: "{colors.team-a}"
    textColor: "{colors.ink}"
    padding: "8px 32px"
  undo-snackbar:
    backgroundColor: "{colors.text-night}"
    textColor: "{colors.ground-night}"
    typography: "{typography.body}"
    padding: "0 8px 0 24px"
    height: "52px"
---

# Design System: Dominó

All lengths are density-independent points (iOS pt, Android dp), written as `px` in the tokens for tool portability. Component tokens reference the night appearance, which is the app's default; the day appearance swaps each `-night` colour for its `-day` sibling and leaves the team colours and ink untouched.

## Overview

**Creative North Star: "Liga de Carreras"**

The scoreboard is painted like two rival race cars parked nose to nose. Each team owns a flood of one loud colour with its total set in numerals large enough to read from the far seat at the table, and every other surface steps back to graphite at night or pit silver by day. There is one screen, and its three overlays (points sheet, value sheet, winner screen) are built from the same parts.

The system has one shape and one typeface. The shape is a parallelogram that leans 12 degrees forward, used for buttons, rows, chips, the two liveries and the full-screen winner flood. The typeface is Kanit, set in heavy italic capitals for everything that is a name, a number or a command, and in upright medium only for full sentences. The only ornament is a mark of three small leaning bars cut from the same shape.

Density is low and the targets are large: the smallest control is 48 points, slab buttons are 56 points tall, and the screen carries no navigation, no cards and no icons beyond three small utility symbols.

**Key Characteristics:**
- Two saturated team colours used as fills, always carrying graphite ink.
- One forward-leaning parallelogram as the shape of every filled element; zero corner radius anywhere.
- Kanit extra-bold italic capitals with tabular numerals; hull-sized totals at 76 points.
- Flat tonal layering on a single ground colour per appearance.
- Horizontal motion only, 200 to 220 ms, exponential ease-out, removed under Reduce Motion.
- Spanish interface copy throughout.

## Colors

Two loud liveries on a neutral ground that flips between graphite and pit silver with the system appearance.

### Primary
- **Safety Orange** (`team-a`, #FF5A00): team A. Floods the left livery, the team A points chip in each row, the left quick-points slab, the slash mark on team A's points sheet, and the whole screen when team A wins.

### Secondary
- **Acid Yellow** (`team-b`, #DFFF00): team B. The same roles on the right side. Also the caret colour of the value sheet's number field at night.

### Neutral
- **Graphite Ink** (`ink`, #0E1114): everything printed on a team colour, in both appearances. Also the fill of the rounds chip, the winner's slab and the "Nueva ronda" slab on the winner screen.
- **Graphite Ground** (`ground-night`, #0E1114) / **Pit Silver Ground** (`ground-day`, #F1F2F4): the screen and the sheet panel. Also the interior of outlined slabs.
- **Surface** (`surface-night`, #1A1E23 / `surface-day`, #FFFFFF): score rows and the number field.
- **Raised Surface** (`surface-raised-night`, #2A2F36 / `surface-raised-day`, #E1E4E8): the most recent row in the list, and the fill of any disabled slab button.
- **Line** (`line-night`, #6B7480 / `line-day`, #7D858F): the 2-point outline of outlined slabs and fields, the hairline above the quick-points bar, text selection colour, and the slash mark in the empty state.
- **Text** (`text-night`, #FFFFFF / `text-day`, #0E1114): primary text on the ground, and the fill of the neutral "Guardar" slab.
- **Muted Text** (`text-muted-night`, #B6BCC4 / `text-muted-day`, #4A525B): field labels, hand numbers, zero cells, hints, the three utility icons, and the label of a disabled slab.
- **Danger** (`danger-night`, #FF6B5C / `danger-day`, #B3261E): the border of an invalid number field and its error sentence. Nothing else.
- **Scrim** (`scrim-night` / `scrim-day`): the dimmed layer behind a sheet.

### Named Rules
**The Livery Rule.** A team colour is a fill. It carries Graphite Ink and never prints as text on the ground or on a surface.

**The Graphite Exception Rule.** A team colour prints as text only on a Graphite Ink fill: the rounds chip inside each livery and the winner's slab on the winner screen.

**The Same Ink Rule.** Ink on a team colour is #0E1114 in both appearances. It does not invert when the ground does.

## Typography

**Display Font:** Kanit 800 ExtraBold Italic (`Kanit_800ExtraBold_Italic`)
**Label Font:** Kanit 600 SemiBold Italic (`Kanit_600SemiBold_Italic`)
**Body Font:** Kanit 500 Medium, upright (`Kanit_500Medium`)

All three faces load from `@expo-google-fonts/kanit`. No fallback face is declared; the screen renders nothing until the fonts resolve.

**Character:** A single family doing two jobs. The italic cuts are fast and loud for names, numbers and commands; the upright medium is quiet and used only where a full sentence has to be read.

### Hierarchy
- **Hull** (800 italic, 76, line-height 1.05, tabular numerals): the team totals in the lockup.
- **Title** (800 italic, 28, uppercase): the target value in the header, the team name field, sheet titles, the empty-state heading, the winner sentence.
- **Button** (800 italic, 20, uppercase; 0.5 letter-spacing on slab buttons only): slab button labels, team names on the liveries, points inside row chips. Zero cells use the same size in the 600 italic cut.
- **Body** (500 upright, 16, line-height 1.45, sentence case): empty-state explanation, error sentence, snackbar message. The header's "Se gana con" label and the winner's rounds line use size 16 in the 600 italic cut, uppercase.
- **Label** (600 italic, 13, uppercase, tabular numerals): field labels, points remaining, rounds chip, hand numbers. The quick-points hint uses size 13 in the upright 500 cut, sentence case.

Four sizes sit outside the theme scale as literals: the winner's total (132, line-height 140), the winner heading (56, line-height 64), the other team's total on the winner screen (56, line-height 62) and the number field's input text (44). All are 800 italic.

### Named Rules
**The Caps Italic Rule.** Names, numbers and commands are italic capitals. Upright sentence case is reserved for full sentences: explanations, hints, errors and the snackbar message.

**The Tabular Rule.** Every numeral that can change is set with tabular figures so totals and columns do not shift as they update.

**The Hull Cap Rule.** Text follows the system font size up to 1.6 times. Hull numerals, the winner heading, both winner-screen totals and the number field stop at 1.2 times, and hull numerals, the winner's total and button labels shrink to fit one line, so a total never truncates.

## Layout

A single portrait column with four fixed bands, top to bottom, inside the safe area:

1. **Header.** Target slab at the left, reset control at the right. Padding 24 left, 8 right, 12 vertical.
2. **Lockup.** Two equal panels, edge to edge, minimum height 172. Each livery bleeds 48 past the screen edge and leans a fixed 36 points, leaving a 6-point diagonal seam of ground between them.
3. **List.** Fills the remaining height and scrolls. 16 horizontal padding, 12 vertical, 8 between rows. Each row has two equal team columns with a 44-wide hand number between them, so points sit centred under their livery. The list scrolls to the newest row when one is added. When empty, the content is left-aligned and vertically centred with 32 horizontal padding.
4. **Quick bar.** Pinned to the bottom above the safe-area inset, separated by a hairline. Two equal slab buttons with a 24 gap, one per column, and a centred hint line beneath.

Spacing comes from a six-step scale (4, 8, 12, 16, 24, 32). Minimum touch target is 48 in either dimension. Sheets rise from the bottom edge, pad 24 on three sides with 16 between their blocks, and lift with the keyboard. There are no breakpoints; tablets and landscape are not designed for.

## Elevation & Depth

Depth is tonal. Three neutral steps stack on each other (ground, surface, raised surface) and the team colours sit on top of all of them as flat fills. Overlays separate from the screen with a scrim, and the undo snackbar separates from the list by inverting the neutral colours. There are no shadows and no elevation values anywhere in the build.

### Named Rules
**The Tonal Step Rule.** A surface is distinguished from what is beneath it by stepping one neutral tone, never by a shadow or a gradient. The newest row is marked by moving from Surface to Raised Surface.

## Shapes

One silhouette: a parallelogram whose top edge is shifted right of its bottom edge by 12 degrees (horizontal offset = height × 0.2126). It is the same direction as the italic type, so shapes and letters lean together. Corners are sharp; no radius is used anywhere in the build.

Every leaning shape is drawn as a vector path (`react-native-svg`) measured from the element's laid-out size, because Android does not render skew transforms. The shape sits behind its content as an absolute layer; the content itself is not skewed.

Outlined shapes are two stacked paths: the outer in Line colour, the inner in Ground colour inset by 2 points (2.2 on the slanted sides to keep the stroke visually even).

The triple-slash mark is three of the same parallelograms side by side, each 0.62 of its height wide with a gap of 0.05 of its height. It appears at 14 to 40 points tall: above sheet content (18, in the sheet's accent), in the empty state (22, Line colour) and above the winner heading (40, Graphite Ink).

Two kinds of surface are rectangular by design: text fields, because a caret and a selection need a straight box, and the sheet panel, which is the ground the slabs sit on.

### Named Rules
**The Lean Rule.** Every filled shape is the 12-degree parallelogram, drawn as a path. Do not reach for a skew transform, a rotated view or a rounded rectangle.

**The One Ornament Rule.** The triple-slash mark is the only decoration. It is hidden from assistive technology.

## Components

### Buttons
Slab buttons are blunt and physical: a leaning block that shoves sideways when pressed.
- **Shape:** the leaning parallelogram, minimum height 56, 24 horizontal padding, label centred on one line.
- **Team (filled):** team colour fill, Graphite Ink label. Used for the quick-points slabs and the points sheet's "Anotar".
- **Neutral (filled):** Text colour fill with Ground colour label ("Guardar"). On the winner screen the same slab is Graphite Ink with a white label ("Nueva ronda").
- **Outlined:** Ground interior with a 2-point Line outline and Text colour label ("Cancelar").
- **Disabled:** Raised Surface fill, Muted Text label, regardless of variant.
- **Pressed:** the whole button shifts 3 points to the right and its shape drops to 78% opacity. There is no hover or focus ring; this is a touch-only build.
- **Long press:** the quick-points slabs open the value sheet on long press.

### Target Slab
An outlined slab in the header, minimum height 48, holding the "Se gana con" label (16, Muted Text), the target value (28, Text) and a 16-point pencil icon. Pressed: shifts 3 points right, shape at 60% opacity.

### Liveries
The two panels of the lockup. Each is a full-height team-colour parallelogram holding, top to bottom: team name (20), total (76, hull), points remaining (13) and the rounds chip. All text is Graphite Ink. The whole panel is one button that opens the points sheet. Pressed: shape at 80% opacity. When the total changes it scales from 1.14 back to 1 over 220 ms.

### Chips
- **Rounds chip:** Graphite Ink parallelogram, 12 horizontal and 2 vertical padding, label in the panel's own team colour (13, uppercase).
- **Points chip:** team-colour parallelogram inside a score row, minimum width 64, 12 horizontal and 4 vertical padding, points in Graphite Ink (20).

### Score Rows
- **Shape:** leaning parallelogram, minimum height 52, Surface fill. The newest row uses Raised Surface.
- **Content:** team A cell, zero-padded hand number (13, Muted Text), team B cell. The scoring team's cell holds a points chip; the other shows a muted 0.
- **Delete:** a 20-point close icon in a 48-wide target floating over the row's right edge, so it never moves the columns. Pressed: 50% opacity. Deleting shows the undo snackbar for 5 seconds.
- **Entrance:** a new row slides in 56 points from its team's side over 200 ms.

### Inputs / Fields
- **Number field:** rectangular, Surface fill, 2-point Line border, minimum height 76, 16 horizontal padding, input text 44 in 800 italic with tabular numerals. Label above in 13 uppercase Muted Text. Placeholder "0" in Muted Text.
- **Name field:** no box; a 2-point Line underline, minimum height 48, text 28 uppercase, with a 20-point pencil icon at the right.
- **Caret and selection:** selection is Line colour; the caret is the sheet's team colour at night and Text colour by day.
- **Error:** border switches to Danger and a Danger sentence (16, upright) appears beneath. The confirm slab is disabled while the value is invalid.

### Sheets
A rectangular Ground-colour panel rising from the bottom over a Scrim. It opens with the triple-slash mark in the sheet's accent (the team colour for the points sheet, Text colour for the value sheet), then its fields, then a row of two equal slab buttons with a 16 gap: outlined cancel on the left, filled confirm on the right. Tapping the scrim or the system Back closes it. The number field takes focus as the sheet appears.

### Winner Screen
The winning team's colour floods the entire screen as one oversized parallelogram that sweeps in from that team's side over 220 ms. On it, in Graphite Ink: the triple-slash mark (40), the heading (56), the winner sentence (28) and the rounds line (16). The scores group is centred in the flexible middle of the screen, between the heading and the close button, with a 12 gap between its two slabs.
- **Winner's slab:** a large Graphite Ink parallelogram with the team name (20) stacked above the total (132, shrinks to fit one line), both printed in the winning team colour. Padding 40 horizontal, 24 top, 12 bottom.
- **Other team's slab:** smaller, an ink-outlined parallelogram filled with the flood colour, name at the left (20) and total at the right (56), both in Graphite Ink. Padding 32 horizontal, 8 vertical.
- **Close:** a Graphite Ink slab button with a white label closes the screen and starts the next round.

### Navigation
None. The header carries two utility controls: the target slab and a 24-point refresh icon in a 48-square target (pressed: 50% opacity) that opens a system confirmation alert.

### Icons
Three Ionicons glyphs, always Muted Text colour: `pencil` (16 and 20), `close` (20), `refresh` (24). They mark utilities and never carry a team colour.

### Undo Snackbar
A leaning slab in inverse colours (Text colour fill, Ground colour text) floating 8 above the quick bar with 16 side margins, minimum height 52, padding 24 left and 8 right. It is cut from the same parallelogram as every other slab and casts no shadow. Message in 16 upright; the action is 16 in 800 italic capitals, underlined, in a 48-tall target. Pressed: action at 60% opacity.

### Motion
Movement is horizontal and brief: 200 ms for a row entering, 220 ms for the total's pop and the winner flood, all with an exponential ease-out on the native driver. Sheets and the winner screen additionally use the platform's own modal transitions (slide for sheets, fade for the winner screen). With Reduce Motion on, the three authored animations cut to their end state, both modal transitions are skipped, and list scrolling stops animating. A new hand and a win each fire a haptic.

## Do's and Don'ts

### Do:
- **Do** draw every filled shape as the 12-degree parallelogram path (offset = height × 0.2126), leaning the same way as the italic type.
- **Do** put Graphite Ink (#0E1114) on Safety Orange and Acid Yellow in both appearances.
- **Do** set names, numbers and commands in Kanit italic capitals, and keep upright sentence case for full sentences.
- **Do** use tabular numerals for any number that updates.
- **Do** cap dynamic type at 1.6 times for text and 1.2 times for hull-scale numerals, and let hull numerals shrink to fit.
- **Do** keep every touch target at least 48 points and slab buttons at least 56 tall.
- **Do** mark state by stepping a neutral tone (Surface to Raised Surface) or by swapping fill and outline.
- **Do** move things sideways, from the side of the team they belong to, in 200 to 220 ms with an exponential ease-out, and skip the movement under Reduce Motion.
- **Do** keep text fields and the sheet panel rectangular.

### Don't:
- **Don't** print a team colour as text on the ground or on a neutral surface; it is only legible as text on a Graphite Ink fill.
- **Don't** round a corner. No radius exists in this system.
- **Don't** use a skew transform to lean a shape; Android will not render it.
- **Don't** skew or rotate content inside a leaning shape. The shape leans; the italic does the rest.
- **Don't** add shadows, gradients or blur to slabs, rows, chips, liveries, fields or sheets.
- **Don't** invert the ink on team colours in the day appearance.
- **Don't** use Danger for anything other than an invalid field and its message.
- **Don't** add a second ornament alongside the triple-slash mark.
- **Don't** give a utility icon a team colour.
