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

- `src/app/game/`: the rules (`state.ts`, a pure reducer), persistence (`storage.ts`) and the signals store (`game.store.ts`). No DOM access in `state.ts`.
- `src/app/components/`: one file per component, template and styles inline.
- `src/app/directives/`: `appFitText` (shrinks one line of text to fit) and `appLongPress`.
- `src/app/platform/`: browser features that may be missing (wake lock, vibration).
- `src/app/copy.ts`: every Spanish string.
- `src/styles.css`: design tokens as CSS custom properties, the `.lean` slab and `.slab` button.

## Rules

- Interface language is Spanish only; add strings to `copy.ts`.
- Sheets open through their `open()` method, called directly from the tap, so the keyboard opens with them on iOS. Do not open them from an effect.
- The app is served under a subpath on GitHub Pages: keep asset and manifest paths relative.
- Input text is at least 16px, or iOS zooms the page.
