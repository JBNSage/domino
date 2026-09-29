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
- `src/app/components/`: one file per component, template and styles inline. `sheet.ts` is the bottom sheet for a short task; `screen.ts` is the full screen for the history, the mesas and the tournament. `team-edits.ts` builds the requests for the team sheet from each place a team can change. There is no router.
- `src/app/directives/`: `appFitText` (shrinks one line of text to fit) and `appLongPress`.
- `src/app/platform/`: browser features that may be missing (wake lock, vibration).
- `src/app/copy.ts`: every Spanish string.
- `src/styles.css`: design tokens as CSS custom properties, the `.lean` slab and `.slab` button.

## Rules

- Interface language is Spanish only; add strings to `copy.ts`.
- Sheets open through their `open()` method, called directly from the tap, so the keyboard opens with them on iOS. Do not open them from an effect. Screens without a text field may follow state, as the winner screen does.
- A change that can be undone whole goes through `GameStore.change()`, which keeps the board, the tournament and the history entries it wrote together.
- The wins of a team saved at a mesa live in `State.tally`, by its id, so undoing a closed match takes them back too. Tournament teams sit with `saved: null` and never touch the tally.
- "Mesa" (a place and its people, `tables.ts`) and "tabla" (a tournament's standings) are different things in code and copy.
- Team colours belong to the side of the board, not to a team: in a tournament a team takes the colour of the seat it sits in.
- The app is served under a subpath on GitHub Pages: keep asset and manifest paths relative.
- Input text is at least 16px, or iOS zooms the page.
