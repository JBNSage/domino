import { TestBed } from '@angular/core/testing';

import { MESA_CLOUD, SharedMesa } from './cloud';
import { FakeMesaCloud } from './cloud.fake';
import { MatchRecord } from './history';
import { HistoryStore } from './history.store';

const match = (id: string, endedAt: number, tableId: string | null): MatchRecord => ({
  id,
  endedAt,
  target: 200,
  teams: { a: { name: 'A', players: ['Ana', 'Luis'] }, b: { name: 'B', players: null } },
  rows: [{ id: `${id}-r`, team: 'a', points: 200 }],
  winner: 'a',
  tournament: null,
  tieBreak: false,
  table: tableId === null ? null : 'Casa',
  tableId,
});

const mesa: SharedMesa = {
  id: 'm1',
  doc: { name: 'Casa', players: [], teams: [], createdBy: 'me', createdAt: 0 },
  members: [{ uid: 'me', name: 'Ana', owner: true, scores: true, joinedAt: 0 }],
  matches: [],
  live: null,
  liveLoaded: true,
  invite: 'k',
};

describe('HistoryStore with shared mesas', () => {
  let store: HistoryStore;
  let cloud: FakeMesaCloud;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: MESA_CLOUD, useClass: FakeMesaCloud }],
    });
    cloud = TestBed.inject(MESA_CLOUD) as FakeMesaCloud;
    cloud.mesas.set(new Map([['m1', mesa]]));
    store = TestBed.inject(HistoryStore);
  });

  it("keeps a shared mesa's matches in the cloud and the rest on the phone, read as one", () => {
    store.addMatch(match('local', 1, null));
    store.addMatch(match('shared', 2, 'm1'));

    expect(cloud.writes).toEqual(['match m1 shared']);
    expect(store.history().matches.map((each) => each.id)).toEqual(['shared', 'local']);
    expect(store.history().matches[0]).toMatchObject({ table: 'Casa', tableId: 'm1' });
    TestBed.tick();
    expect(localStorage.getItem('domino/history/v1')).not.toContain('"shared"');
  });

  it("shows a member's new name in the matches they played", () => {
    store.addMatch(match('shared', 2, 'm1'));
    cloud.renameMe('Anita');
    expect(store.history().matches[0].teams.a.players).toEqual(['Anita', 'Luis']);
  });

  it('removes and brings back a shared match through the cloud', () => {
    store.addMatch(match('shared', 2, 'm1'));
    const removed = store.remove({ matches: ['shared'] });
    expect(store.history().matches).toHaveLength(0);
    store.restore(removed);
    expect(store.history().matches.map((each) => each.id)).toEqual(['shared']);
    expect(cloud.writes).toEqual(['match m1 shared', 'unmatch m1 shared', 'match m1 shared']);
  });

  it('clears only what the phone keeps', () => {
    store.addMatch(match('local', 1, null));
    store.addMatch(match('shared', 2, 'm1'));
    store.clear();
    expect(store.history().matches.map((each) => each.id)).toEqual(['shared']);
  });

  it('hands over the matches of a mesa that is about to be shared', () => {
    store.addMatch(match('casa', 1, 'm2'));
    store.addMatch(match('otra', 2, null));
    const kept = store.localOf((each) => each.tableId === 'm2');
    expect(kept.map((each) => each.id)).toEqual(['casa']);
    // Nothing is let go until the cloud has it.
    expect(store.history().matches).toHaveLength(2);
    store.dropLocal(kept.map((each) => each.id));
    expect(store.history().matches.map((each) => each.id)).toEqual(['otra']);
  });
});
