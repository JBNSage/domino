---
version: 1
slug: "app-tsx"
primary_target: "App.tsx"
related_targets: []
---

# Scoreboard (App.tsx)

Scope: the single screen of the app and its three overlays (points sheet, value sheet, winner screen). Visitor mode: Operate.

Audience and job: one player at the domino table records each hand in a couple of taps; everyone else reads the totals from their seat. Content: two teams, running totals, rows of hands, target, quick points, rounds won. Constraints: Spanish only, iOS and Android, system light/dark, system font size, Reduce Motion, 44pt/48dp targets.

Chosen direction: Liga de Carreras, a dealt challenger the user picked over the assigned direction after one re-roll. Memorable moment: the two liveries meeting on a diagonal seam at the top of the screen.

## Direction contract

THESIS: Two rival liveries own the screen. Each team is a colour flood with hull-sized numerals. Refuses the category default of two neutral rounded cards with a tinted number.

OWN-WORLD: Graphite ground (#0E1114) at night, pit-silver ground (#F1F2F4) by day. Safety orange (#FF5A00) is team A, acid yellow (#DFFF00) is team B; both are fills carrying graphite ink, never text colours on the ground. Every filled shape is a parallelogram leaning 12 degrees, the triple-slash mark included, which is the only ornament. Two stated exceptions stay rectangular: text fields, because a caret and selection need a straight box, and the sheet panel, which is the system surface the slabs sit on. Team colours may print as text only on a graphite fill (rounds chip, winning row). Kanit extra-bold italic caps for names, numerals and buttons.

STORY: The scorer opens the app and sees who is ahead and how far each team is from the target. They tap a livery, type the hand, and the row lands under it. When a team reaches the target its colour floods the screen.

FIRST VIEWPORT: Top line "SE GANA CON 200" as an outlined slab, reset at the right. Below, a 170pt lockup split by a diagonal seam: orange left, yellow right, each with name, total at about 64pt, points remaining and rounds won. Hands list fills the middle as leaning rows in two columns centred under the liveries, hand number between them, delete floating at the row's right edge. Two filled "+30" slabs are pinned at the bottom, one per column.

SIGNATURE INTERACTION: A new hand streaks in horizontally from its team's side and the total snaps with a decal pop. Winner: the team colour floods the whole screen. Motion grammar: horizontal, 180 to 220ms, exponential ease-out; Reduce Motion cuts to instant. Text follows the system font size up to 1.6x; hull numerals stop at 1.2x and shrink to fit so totals never truncate.

FORM: Anti-aliased racing league identity (dealt challenger, re-roll round 1); seed key a7e7dbb8.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: none.
