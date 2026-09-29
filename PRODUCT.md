# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Expo + React Native + TypeScript, shipping to iOS and Android. Expo was named by the user; TypeScript, a single screen without a router, and AsyncStorage persistence were delegated and chosen for the smallest app that meets the brief.

## Users

People playing dominoes in two teams who need one person at the table to keep score on their phone. They score between hands, with the phone in one hand or lying on the table, anywhere and at any time of day.

## Product Purpose

A domino score keeper that is ready the instant it opens: no setup, no menu, no account. Success is that a hand's points are recorded in a couple of taps and nobody at the table argues about the total.

## Positioning

Opens directly on the live scoreboard. Two teams, one running list, one target; nothing to configure before the first point.

## Operating Context

- A match is played to a target score (default 200, user-editable).
- Points are entered per hand for one team; the other team scores 0 on that row.
- Quick points add a fixed bonus (default 30, user-editable) to one team in a single tap.
- When a team reaches the target the match ends, the winner is celebrated, the list resets, and the winner's rounds-won count goes up by one.

## Capabilities and Constraints

- Two teams, default names "Equipo A" and "Equipo B", renamable from the points input.
- Rows can be deleted to fix mistakes.
- Changing the target re-evaluates the match; if a team already meets the new target, the winner is shown.
- Everything persists across app restarts: rows, team names, target, quick value, rounds won.
- Follows the system light/dark setting.
- Portrait phone is the target; tablets are not a design target.
- Undecided: variants where both teams score in one hand; more than two teams; match history.

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

Honor system font size, Reduce Motion, light and dark appearance, and minimum touch targets (44 pt iOS, 48 dp Android). Every control carries a Spanish accessibility label.
