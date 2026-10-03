import { TestBed } from '@angular/core/testing';

import { MESA_CLOUD, SharedMesa } from './cloud';
import { FakeMesaCloud } from './cloud.fake';
import { GameStore } from './game.store';
import { HistoryStore } from './history.store';
import { MeStore } from './me.store';
import { SharingStore } from './sharing.store';
import { addPlayer, addTable, renameTable, saveTeam, setActive, updateTable } from './tables';
import { TablesStore } from './tables.store';

/** A mesa on another phone, owned by Ana, that a link can join. */
const theirs: SharedMesa = {
  id: 'm9',
  doc: {
    name: 'Club',
    players: ['Pedro'],
    teams: [],
    createdBy: 'ana',
    createdAt: 0,
  },
  members: [{ uid: 'ana', name: 'Ana', owner: true, scores: true, joinedAt: 0 }],
  matches: [],
  live: null,
  liveLoaded: true,
  invite: null,
};

describe('Sharing a mesa', () => {
  let cloud: FakeMesaCloud;
  let tables: TablesStore;
  let sharing: SharingStore;
  let store: GameStore;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [{ provide: MESA_CLOUD, useClass: FakeMesaCloud }],
    });
    cloud = TestBed.inject(MESA_CLOUD) as FakeMesaCloud;
    tables = TestBed.inject(TablesStore);
    sharing = TestBed.inject(SharingStore);
    store = TestBed.inject(GameStore);
    TestBed.inject(MeStore).rename('Juan');
  });

  afterEach(() => vi.useRealTimers());

  const local = () =>
    tables.change((current) =>
      updateTable(setActive(addTable(current, 'm1', 'Casa'), 'm1'), 'm1', (table) =>
        saveTeam(addPlayer(addPlayer(table, 'Luis'), 'Pedro'), {
          id: 's1',
          name: 'Los Primos',
          players: ['Juan', 'Luis'],
        }),
      ),
    );

  it('moves the mesa, its teams and its matches to the cloud, still in use', async () => {
    local();
    store.addPoints('a', 200);
    store.closeRound();
    expect(TestBed.inject(HistoryStore).history().matches[0].tableId).toBe('m1');

    const id = (await sharing.share('m1')) ?? '';
    expect(id).not.toBe('m1');

    const mesa = tables.tables().tables.find((table) => table.id === id);
    expect(mesa?.shared).toMatchObject({ owner: true, scores: true });
    expect(mesa?.players).toEqual(['Juan', 'Luis', 'Pedro']);
    expect(mesa?.teams[0].name).toBe('Los Primos');
    // This phone's person went in as a member, not as a name written by hand.
    expect(cloud.mesas().get(id)?.doc?.players).toEqual(['Luis', 'Pedro']);
    expect(tables.active()?.id).toBe(id);
    expect(cloud.mesas().get(id)?.matches).toHaveLength(1);
    expect(TestBed.inject(HistoryStore).history().matches[0]).toMatchObject({
      tableId: id,
      table: 'Casa',
    });
    TestBed.tick();
    expect(localStorage.getItem('domino/tables/v1')).toBeNull();
    expect(sharing.link(id)).toMatch(new RegExp(`#unirse\\?m=${id}&k=\\w+&n=Casa$`));
  });

  it('lets owners change the mesa, through the cloud, and undo it', async () => {
    local();
    const shared = (await sharing.share('m1')) ?? '';
    tables.change((current) => renameTable(current, shared, 'Casa Grande'));
    expect(cloud.mesas().get(shared)?.doc?.name).toBe('Casa Grande');

    store.removeTablePlayer(shared, 'Pedro');
    expect(tables.active()?.players).toEqual(['Juan', 'Luis']);
    store.restore();
    expect(tables.active()?.players).toEqual(['Juan', 'Luis', 'Pedro']);
  });

  it("joins by link, watching, with this phone's own name, and puts the mesa in use", async () => {
    cloud.invites.set('m9', { mesa: theirs, token: 'k1' });

    expect(await sharing.join({ id: 'm9', token: 'wrong', name: 'Club' })).toBe('refused');
    expect(await sharing.join({ id: 'm9', token: 'k1', name: 'Club' })).toBeNull();

    const mesa = tables.active();
    expect(mesa?.id).toBe('m9');
    expect(mesa?.shared).toMatchObject({ owner: false, scores: false });
    expect(mesa?.players).toEqual(['Ana', 'Juan', 'Pedro']);
  });

  it('keeps a mesa as it is when someone who does not own it tries to change it', async () => {
    cloud.invites.set('m9', { mesa: theirs, token: 'k1' });
    await sharing.join({ id: 'm9', token: 'k1', name: 'Club' });
    cloud.writes.length = 0;

    tables.change((current) => renameTable(current, 'm9', 'Mío'));
    sharing.setRole('m9', 'ana', { owner: false });
    sharing.newLink('m9');

    expect(tables.active()?.name).toBe('Club');
    expect(cloud.writes).toEqual([]);
  });

  it('lets an owner decide who owns and who scores, and take people out', async () => {
    local();
    const shared = (await sharing.share('m1')) ?? '';
    cloud.fromOtherPhone(shared, (mesa) => ({
      ...mesa,
      members: [
        ...mesa.members,
        { uid: 'eva', name: 'Eva', owner: false, scores: false, joinedAt: 2 },
      ],
    }));

    sharing.setRole(shared, 'eva', { scores: true });
    expect(tables.active()?.shared?.members.find((member) => member.uid === 'eva')?.scores).toBe(
      true,
    );
    // Nobody changes their own role.
    sharing.setRole(shared, 'me', { owner: false });
    expect(tables.active()?.shared?.owner).toBe(true);

    sharing.removeMember(shared, 'eva');
    expect(tables.active()?.players).toEqual(['Juan', 'Luis', 'Pedro']);
  });

  it('carries a new name to every shared mesa', async () => {
    local();
    await sharing.share('m1');
    TestBed.tick();
    TestBed.inject(MeStore).rename('Juancho');
    TestBed.tick();
    expect(tables.active()?.players).toEqual(['Juancho', 'Luis', 'Pedro']);
    expect(tables.active()?.teams[0].players).toEqual(['Juancho', 'Luis']);
  });

  it('removes a mesa for everyone, and leaves one that is not yours', async () => {
    local();
    const shared = (await sharing.share('m1')) ?? '';
    expect(await sharing.deleteMesa(shared)).toBe(true);
    expect(tables.tables().tables).toHaveLength(0);
    expect(tables.active()).toBeNull();

    cloud.invites.set('m9', { mesa: theirs, token: 'k1' });
    await sharing.join({ id: 'm9', token: 'k1', name: 'Club' });
    expect(await sharing.deleteMesa('m9')).toBe(false);
    await sharing.leave('m9');
    expect(tables.tables().tables).toHaveLength(0);
  });

  it('says so when another owner deletes the mesa, and keeps the match on this phone', async () => {
    local();
    const shared = (await sharing.share('m1')) ?? '';
    store.addPoints('a', 30);

    cloud.loseFromOtherPhone(shared, 'deleted');
    TestBed.tick();

    expect(sharing.notice()).toBe(
      'Un dueño eliminó la mesa Casa. La partida sigue en este teléfono.',
    );
    expect(tables.active()).toBeNull();
    expect(store.state().rows).toHaveLength(1);
    expect(store.canScore()).toBe(true);
    // Not in use any more, even after a restart.
    expect(localStorage.getItem('domino/tables-active/v1')).toBeNull();

    sharing.dismissNotice();
    expect(sharing.notice()).toBeNull();
  });

  it('says so when this phone is taken out of a mesa', async () => {
    cloud.invites.set('m9', { mesa: theirs, token: 'k1' });
    await sharing.join({ id: 'm9', token: 'k1', name: 'Club' });

    cloud.loseFromOtherPhone('m9', 'removed');
    TestBed.tick();

    expect(sharing.notice()).toBe('Ya no estás en la mesa Club.');
    expect(tables.tables().tables).toHaveLength(0);
  });

  it('says nothing when the mesa is deleted or left from this phone', async () => {
    local();
    const shared = (await sharing.share('m1')) ?? '';
    await sharing.deleteMesa(shared);
    TestBed.tick();
    expect(sharing.notice()).toBeNull();
  });
});
