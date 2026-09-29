import { Injectable, effect, signal } from '@angular/core';

import { Rule, TournamentTeam, isCount, parseTeams } from './tournament';

export const DRAFT_KEY = 'domino/tournament-draft/v1';

/**
 * The teams and the rule being prepared for a tournament. It outlives the
 * setup screen and the app, so a stray Back costs nothing, and the next
 * tournament starts from the teams of the last one.
 */
export type Draft = {
  teams: TournamentTeam[];
  kind: Rule['kind'];
  count: number;
  /** False while it only mirrors the board, so it can follow a renamed team. */
  touched: boolean;
};

export function parseDraft(value: unknown): Draft | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const teams = parseTeams(raw.teams);
  if (teams === null) return null;
  const kind = raw.kind === 'bestOf' || raw.kind === 'free' ? raw.kind : 'firstTo';
  return { teams, kind, count: isCount(raw.count) ? raw.count : 3, touched: raw.touched === true };
}

function load(): Draft | null {
  try {
    return parseDraft(JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null'));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class TournamentDraft {
  readonly draft = signal<Draft | null>(load());

  constructor() {
    effect(() => {
      const draft = this.draft();
      try {
        if (draft === null) localStorage.removeItem(DRAFT_KEY);
        else localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // Without storage the draft lasts until the app is closed.
      }
    });
  }

  /** Keeps the teams of a tournament that ended, with the names they ended with. */
  keepTeams(teams: TournamentTeam[]): void {
    this.draft.update((draft) => ({
      kind: draft?.kind ?? 'firstTo',
      count: draft?.count ?? 3,
      teams,
      touched: true,
    }));
  }
}
