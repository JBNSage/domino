# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Angular + TypeScript, shipped as an installable progressive web app (PWA) on GitHub Pages, so it needs no app store. It began as an Expo app; the user asked for the move. No router: the scoreboard is the page, and every other surface is a sheet or a full screen above it. Signals for state and localStorage persistence were chosen for the smallest app that meets the brief.

## Users

People playing dominoes in two teams who need one person at the table to keep score on their phone. They score between hands, with the phone in one hand or lying on the table, anywhere and at any time of day.

## Product Purpose

A domino score keeper that is ready the instant it opens: no setup, no menu, no account. Success is that a hand's points are recorded in a couple of taps and nobody at the table argues about the total.

## Positioning

Opens directly on the live scoreboard. Two teams, one running list, one target; nothing to configure before the first point. Players, the history and tournaments are there for those who want them, behind one menu button.

## Operating Context

- A match is played to a target score (default 200, user-editable).
- Points are entered per hand for one team; the other team scores 0 on that row.
- Quick points add a fixed bonus (default 30, user-editable) to one team in a single tap.
- When a team reaches the target the match ends, the winner is celebrated, the list resets, the winner's count of matches won goes up by one, and the match is kept in the history.
- A tournament is a series of matches between two or more teams. After each match the winner stays at the table and the team that has waited longest comes in; either side can be given to another waiting team.
- A mesa is a place where the same people usually play. It keeps their names and the teams they usually form. With a mesa in use, players are picked from its list, and after each match the next two teams are chosen: the same teams, other players, or another saved team.
- A tournament ends when a team reaches a set number of wins ("Primero a N"), wins the majority of a set number of matches ("Mejor de N"), or when it is ended by hand ("Libre"). Ended by hand with first place shared, it goes to tie-break matches between the tied teams, or ends without a champion.

## Capabilities and Constraints

- Two teams, default names "Equipo A" and "Equipo B", renamable from the points input or from the menu.
- A team has two named players or none. One team may have players while the other has none.
- Up to 12 mesas, each with up to 40 players and 20 saved teams. One mesa is in use at a time, or none ("Sin mesa"), which keeps the players written by hand. A player cannot be in both teams of a match.
- At a mesa, a saved team's matches won follow the team: it keeps them while it sits out, and changing only its players keeps them. Tournament matches do not add to them. "Borrar > Todo" sets them back to 0.
- Mesas, players and saved teams can be removed with undo; a player in a saved team stays until that team changes. The history records the mesa of each match.
- The history keeps finished matches (teams, players, every hand) and finished tournaments (ranking, champion, matches), filtered by "Todo", "Partidas" or "Torneos". Entries can be removed one by one or all at once, and both can be undone. It holds the 500 most recent matches.
- A tournament has 2 to 12 teams. Its table orders them by matches won; teams level on wins share a place.
- The teams and rule being prepared for a tournament are kept, and the next tournament starts from the teams of the last one.
- While a tournament is played, the board states what it is played for and which match it is.
- Rows can be deleted to fix mistakes.
- Changing the target re-evaluates the match; if a team already meets the new target, the winner is shown.
- Works offline once opened, and everything persists across app restarts: rows, teams and players, target, quick value, matches won, the tournament under way, the history and the mesas.
- Follows the system light/dark setting unless the reader chooses light or dark.
- Portrait phone is the target; tablets are not a design target.
- Everything stays on the device: no accounts, no sync, no sharing of results.
- Undecided: variants where both teams score in one hand; statistics per player; brackets or fixed fixtures.

## Brand Commitments

- Interface language is Spanish only.
- No existing name, logo, or visual identity. Working name: "Dominó".

## Evidence on Hand

None. No logo, illustrations, or photography exist; future work must not fabricate claims about users or usage.

## Product Principles

1. The scoreboard is the home screen; every other surface is a short detour from it.
2. Entering points takes fewer taps than saying them out loud.
3. Mistakes are cheap: anything entered can be removed, and removal can be undone.
4. The totals are always legible from across the table.

## Accessibility & Inclusion

Honor system font size, Reduce Motion, light and dark appearance, and minimum touch targets (48 px). Every control carries a Spanish accessibility label.
