import { TestBed } from '@angular/core/testing';

import { DRAFT_KEY, TournamentDraft, parseDraft } from './tournament-draft';

const teams = ['Uno', 'Dos', 'Tres'].map((name, index) => ({
  id: `t${index}`,
  name,
  players: null,
}));

describe('TournamentDraft', () => {
  beforeEach(() => localStorage.clear());

  it('starts with nothing prepared', () => {
    expect(TestBed.inject(TournamentDraft).draft()).toBeNull();
  });

  it('is saved as it changes, and restored', () => {
    const drafts = TestBed.inject(TournamentDraft);
    drafts.draft.set({ teams, kind: 'bestOf', count: 5, touched: true });
    TestBed.tick();
    expect(parseDraft(JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null'))).toEqual(
      drafts.draft(),
    );
  });

  it('keeps the rule when it takes the teams of a finished tournament', () => {
    const drafts = TestBed.inject(TournamentDraft);
    drafts.draft.set({ teams: teams.slice(0, 2), kind: 'free', count: 4, touched: false });
    drafts.keepTeams(teams);
    expect(drafts.draft()).toEqual({ teams, kind: 'free', count: 4, touched: true });
  });
});

describe('parseDraft', () => {
  it('rejects a draft without two teams', () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft({ teams: teams.slice(0, 1), kind: 'free', count: 3 })).toBeNull();
  });

  it('falls back to first to three when the rule is unreadable', () => {
    expect(parseDraft({ teams, kind: 'sudden', count: 0 })).toEqual({
      teams,
      kind: 'firstTo',
      count: 3,
      touched: false,
    });
  });
});
