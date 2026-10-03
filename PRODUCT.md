# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Angular + TypeScript, shipped as an installable progressive web app (PWA) on GitHub Pages, so it needs no app store. It began as an Expo app; the user asked for the move. No router: the scoreboard is the page, Inicio is a layer over it while nothing is being played, and every other surface is a sheet or a full screen above them. Signals for state and localStorage persistence were chosen for the smallest app that meets the brief.

## Users

People playing dominoes in two teams who need one person at the table to keep score on their phone. They score between hands, with the phone in one hand or lying on the table, anywhere and at any time of day.

## Product Purpose

A domino score keeper that is ready the instant it opens: a match is one tap away, with no sign-in and nothing to configure first. Success is that a hand's points are recorded in a couple of taps and nobody at the table argues about the total.

## Positioning

A match under way opens on its live scoreboard. With nothing being played the app opens on Inicio: the two default teams lined up, which are the quick match in one tap, and below them a personalised match (teams, players, meta and quick points) or a tournament. Two teams, one running list, one target. The history, statistics and mesas are behind one menu button.

## Operating Context

- Inicio shows while nothing is being played: no hands, no step owed and no tournament. It is where the app opens then, where "Inicio" in the menu leads, and where the app returns by itself after "Borrar → Todo" and after a tournament is closed. A match that is under way, or one closed on the board, stays on the board.
- The grid at Inicio holds the match the app knows about and starts it in one tap: the one set up in "Personalizar partida" ("Empezar partida"), else the last match played when it was not the plain one ("Revancha", with its teams and meta), else Equipo A against Equipo B at meta 200 and +30 ("Partida rápida"). When the grid holds another match, "Partida rápida" is the first choice under it and always starts from those defaults; what it replaces can be undone by name, which returns to Inicio. "Personalizar partida" opens a screen with the two teams, the meta and the quick points, starting from what was used last. The mesa in use stays in use either way.
- A match is played to a target score (default 200, user-editable).
- Points are entered per hand for one team; the other team scores 0 on that row.
- Quick points add a fixed bonus (default 30, user-editable) to one team in a single tap.
- When a team reaches the target the match ends, the winner is celebrated, the list resets, the winner's count of matches won goes up by one, and the match is kept in the history.
- A tournament is a series of matches between two or more teams. After each match the winner stays at the table and the team that has waited longest comes in; either side can be given to another waiting team.
- A mesa is a place where the same people usually play. It keeps their names and the teams they usually form. A mesa is put in use from its own screen ("Jugar en esta mesa"), which at a clean board opens the choice of the first two teams. With a mesa in use, players are picked from its list; after each match the same teams play on, or "Cambiar equipos" opens the choice of other players or another saved team.
- A tournament ends when a team reaches a set number of wins ("Primero a N"), wins the majority of a set number of matches ("Mejor de N"), or when it is ended by hand ("Libre"). Ended by hand with first place shared, it goes to tie-break matches between the tied teams, or ends without a champion.

## Capabilities and Constraints

- Two teams, default names "Equipo A" and "Equipo B", renamable from the points input or from the menu.
- A team has two named players or none. One team may have players while the other has none.
- Up to 12 mesas, each with up to 40 players and 20 saved teams. One mesa is in use at a time, or none ("Sin mesa"), which keeps the players written by hand. A player cannot be in both teams of a match.
- At a mesa, a saved team is its two players, and its wins are the matches those two won together there, read from the history. Changing a player without "Guardar en la mesa" makes another team: the saved one keeps its players and wins, and the new pair brings the wins it has there. With "Guardar en la mesa" the saved team takes the new players. Tournament matches count in the tournament too, since they are in the history.
- Statistics, worked out from the history: each player's and each couple's win rate, ordered best first, and each player's rate with every partner. Single and tournament matches count; a team without named players is left out. A name is the same person at every mesa, ignoring accents and capitals. Records under 5 matches are listed apart, and the order counts one extra win and loss for everyone, so a single lucky match does not lead. They can be narrowed to one mesa (or matches at none) and to today, 7 days, 30 days or chosen dates.
- Mesas, players and saved teams can be removed with undo; a player in a saved team stays until that team changes. The history records the mesa of each match.
- The history keeps finished matches (teams, players, every hand) and finished tournaments (ranking, champion, matches), filtered by "Todo", "Partidas" or "Torneos". Entries can be removed one by one or all at once, and both can be undone. It holds the 500 most recent matches.
- A tournament has 2 to 12 teams. Its table orders them by matches won; teams level on wins share a place.
- The teams and rule being prepared for a tournament are kept, and the next tournament starts from the teams of the last one.
- While a tournament is played, the board states what it is played for and which match it is.
- The board marks the moments of a match without slowing it: each hand, the lead changing sides ("¡Se pone delante!"), a team at match point ("Faltan 25 para ganar", within 30 of the target), the start of a match, a win and a champion. None of it holds up a tap.
- Rows can be deleted to fix mistakes.
- Changing the target re-evaluates the match; if a team already meets the new target, the winner is shown.
- Works offline once opened, and everything persists across app restarts: rows, teams and players, target, quick value, matches won, the tournament under way, the history and the mesas.
- Follows the system light/dark setting unless the reader chooses light or dark.
- Portrait phone is the target; tablets are not a design target.
- Everything stays on the device unless a mesa is shared. There is no sign-in: every phone gets a made-up name for its person ("Doble Seis"), which they can change from the menu, and an anonymous account that is created the first time the phone shares or joins a mesa. Losing the phone, or clearing the browser, loses that account; the person joins again by link.
- A shared mesa lives in the cloud (Firebase): its players, saved teams, the matches played there and the match being played now. Only shared mesas leave the phone; sharing moves a mesa, its teams and its matches, and other mesas stay offline as before.
- Sharing is for owners: a share screen sends the mesa's link by WhatsApp, copies it, or shows it as a QR code to scan across the table. "Crear enlace nuevo" makes the old link stop letting anyone in.
- A link opens in the installed app on Android (when installed from Chrome). On an iPhone a link or a QR scanned with the Camera always opens Safari, whose storage is separate from the installed app. So the app joins by itself: Mesas → "Escanear QR" reads the code with the camera inside the app, and "Unirse con un enlace" takes a pasted link. On an iPhone the join screen in Safari says this first, with "Copiar enlace", before offering to join in Safari.
- Whoever opens the link joins the mesa as a player with their own name, which only they change; owners can take them out. They start by watching: they see the players, teams, matches and the live board, but add no points until an owner lets them ("Anota"). The person who shares is the first owner, and owners make others owners. Only owners change the mesa (its name, players written by hand, saved teams), remove matches, choose who may score, and delete it, which happens at once for everyone, without undo. The others are told, in the bar under the board or on Inicio, until they tap "Entendido": that an owner deleted the mesa, or that they are no longer in it; a match in progress stays on their phone as an ordinary match.
- The live board of a shared mesa is the same on every phone at it: a hand added on one lands on the others, even when phones were offline at the time; each phone keeps working without signal and catches up. Whole-board undo takes back only this phone's step and keeps a hand another phone added meanwhile. While a tournament is played the board stays on the phone; its matches still go to the mesa's history. "Borrar historial" clears only what the phone keeps; a shared mesa's matches belong to the mesa.
- Privacy: a shared mesa's names, teams and scores are stored in Firebase (Google Cloud) and readable only by its members. Nothing else leaves the phone.
- Undecided: variants where both teams score in one hand; brackets or fixed fixtures.

## Brand Commitments

- Interface language is Spanish only.
- No existing name, logo, or visual identity. Working name: "Dominó".

## Evidence on Hand

None. No logo, illustrations, or photography exist; future work must not fabricate claims about users or usage.

## Product Principles

1. A match under way is the home screen, and every other surface is a short detour from it. With none, Inicio puts the next one a tap away.
2. Entering points takes fewer taps than saying them out loud.
3. Mistakes are cheap: anything entered can be removed, and removal can be undone.
4. The totals are always legible from across the table.

## Accessibility & Inclusion

Honor system font size, Reduce Motion, light and dark appearance, and minimum touch targets (48 px). Every control carries a Spanish accessibility label.
