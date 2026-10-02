This is an Angular progressive web app (PWA), used mostly on phones and installed from the browser. Prioritize mobile-first patterns, performance, offline use, and behaviour that is the same in Safari on iOS and Chrome on Android.

## Angular changes between versions

Read the major version of `@angular/core` in `package.json` and check https://angular.dev before using an API from memory. This project uses standalone components, signals, zoneless change detection and the built-in control flow (`@if`, `@for`).

## Commands

Node comes from `.nvmrc` (`nvm use`).

```bash
npm start          # dev server (ng serve)
npm run lint       # lint
npm run typecheck  # typecheck
npm test           # unit tests, once, headless (Vitest)
npm run build      # production build into dist/domino/browser
```

Run lint, typecheck and tests before declaring any task done. The service worker only runs in a production build.

## Structure

- `src/app/game/`: the rules of a match (`state.ts`, a pure reducer), of a tournament (`tournament.ts`), of the history (`history.ts`) and of the mesas (`tables.ts`, the saved players and teams of a place) and of the statistics (`stats.ts`, worked out from the history); persistence (`storage.ts`); and the signals stores (`game.store.ts` for the board and the tournament, `history.store.ts` for finished matches, `tables.store.ts` for the mesas). No DOM access in `state.ts`, `tournament.ts`, `history.ts`, `tables.ts` or `stats.ts`.
- `src/app/components/`: one file per component, template and styles inline. `sheet.ts` is the bottom sheet for a short task; `screen.ts` is the full screen for the history, the mesas and the tournament. `home-screen.ts` is Inicio, `match-setup-screen.ts` sets up a personalised match, and `seats.ts` is the two sides of the next match, shared with `next-match-screen.ts`. `install-hint.ts` is the suggestion to install the app, at Inicio and in the board's empty list. `team-edits.ts` builds the requests for the team sheet from each place a team can change. There is no router.
- `src/app/directives/`: `appFitText` (shrinks one line of text to fit) and `appLongPress`.
- `src/app/platform/`: browser features that may be missing (wake lock, vibration).
- Shared mesas: `game/cloud.ts` (the `MesaCloud` interface, the cloud documents' types and the `MESA_CLOUD` token), `game/mesa-doc.ts` (pure conversions between the app's mesa, match and board and their documents, with player names resolved through member ids), `game/invite.ts` (the link), `game/sharing.store.ts` (share, join, leave, roles, delete), `game/me.store.ts` (this phone's name), `game/cloud.fake.ts` (an in-memory cloud for specs). `platform/cloud.ts` implements `MesaCloud`; `platform/firebase.ts` is the only file that imports the Firebase SDK and is loaded on demand; `platform/firebase.config.ts` holds the public web config. `firestore.rules` is the source of truth for who may read and write what.
- `src/app/copy.ts`: every Spanish string.
- `src/styles.css`: design tokens as CSS custom properties, the `.lean` slab, the `.livery` cut and `.slab` button.

## Rules

- Interface language is Spanish only; add strings to `copy.ts`.
- Sheets open through their `open()` method, called directly from the tap, so the keyboard opens with them on iOS. Do not open them from an effect. Screens without a text field may follow state, as the winner screen does.
- A change that can be undone whole goes through `GameStore.change()`, which keeps the board, the tournament, the history entries it wrote and whether Inicio showed together.
- Only stores talk to `MESA_CLOUD`; components call stores. Never import `firebase/*` outside `platform/firebase.ts`, and never load it before the phone has shared or joined a mesa (the `domino/cloud/v1` marker), so the app and the specs pay nothing for it otherwise. Specs provide `FakeMesaCloud` for `MESA_CLOUD`.
- A shared mesa is changed only by its owners: stores refuse the change, the interface hides it, and `firestore.rules` enforces it. The live board is mirrored in `GameStore.dispatch` as field-level writes (`liveWrites`), so hands from two phones never overwrite each other; a hand is ordered by when it was played, then by id.
- Inicio is an in-page layer over the board, not a dialog, shown while `GameStore.atHome()`. The board stays mounted and `inert` beneath it, so the start of a match plays on it. Sheets and screens open above Inicio as they do above the board.
- A team saved at a mesa is its two players. Its wins there are worked out from the history (`teamWinsAt` in `stats.ts`): the matches those two won together at that mesa. Changing a player without saving makes another team, which brings its own wins. Tournament teams sit with `saved: null` and count their wins in the tournament.
- "Mesa" (a place and its people, `tables.ts`) and "tabla" (a tournament's standings) are different things in code and copy.
- Team colours belong to the side of the board, not to a team: in a tournament a team takes the colour of the seat it sits in.
- The app is served under a subpath on GitHub Pages: keep asset and manifest paths relative.
- Input text is at least 16px, or iOS zooms the page.
