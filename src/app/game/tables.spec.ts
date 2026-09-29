import {
  MAX_TABLES,
  MAX_TABLE_PLAYERS,
  Table,
  Tables,
  addPlayer,
  addTable,
  filterPlayers,
  noTables,
  parseTables,
  removePlayer,
  removeTable,
  renamePlayer,
  saveTeam,
  setActive,
  teamsUsing,
} from './tables';

const table = (players: string[] = [], teams: Table['teams'] = []): Table => ({
  id: 'm1',
  name: 'Casa de Ana',
  players,
  teams,
});

describe('mesas', () => {
  it('are not in use until chosen', () => {
    const tables = addTable(noTables, 'm1', '  Casa   de Ana ');
    expect(tables.tables).toEqual([table()]);
    expect(tables.active).toBeNull();
    expect(setActive(tables, 'm1').active).toBe('m1');
  });

  it('refuse a name already used, whatever the accents or case', () => {
    const tables = addTable(addTable(noTables, 'm1', 'Club Ñandú'), 'm2', 'club nandu');
    expect(tables.tables).toHaveLength(1);
  });

  it('stop at the limit', () => {
    let tables: Tables = noTables;
    for (let index = 0; index <= MAX_TABLES; index += 1) {
      tables = addTable(tables, `m${index}`, `Mesa ${index}`);
    }
    expect(tables.tables).toHaveLength(MAX_TABLES);
  });

  it('leave no mesa in use when the one in use is removed', () => {
    const tables = setActive(addTable(noTables, 'm1', 'Casa'), 'm1');
    expect(removeTable(tables, 'm1')).toEqual(noTables);
  });

  it('can be put down, and only known mesas can be picked up', () => {
    const tables = setActive(addTable(noTables, 'm1', 'Casa'), 'm1');
    expect(setActive(tables, null).active).toBeNull();
    expect(setActive(tables, 'nope')).toBe(tables);
  });
});

describe('players of a mesa', () => {
  it('are kept in alphabetical order and never twice', () => {
    const players = ['Rosa', 'ana', 'Ángel', 'ANA'].reduce(addPlayer, table()).players;
    expect(players).toEqual(['ana', 'Ángel', 'Rosa']);
  });

  it('stop at the limit', () => {
    let current = table();
    for (let index = 0; index <= MAX_TABLE_PLAYERS; index += 1) {
      current = addPlayer(current, `Jugador ${index}`);
    }
    expect(current.players).toHaveLength(MAX_TABLE_PLAYERS);
  });

  it('are renamed inside their saved teams too', () => {
    const current = table(
      ['Ana', 'Luis'],
      [{ id: 's1', name: 'Primos', players: ['Ana', 'Luis'] }],
    );
    const renamed = renamePlayer(current, 'Ana', 'Anita');
    expect(renamed.players).toEqual(['Anita', 'Luis']);
    expect(renamed.teams[0].players).toEqual(['Anita', 'Luis']);
    expect(renamePlayer(current, 'Ana', 'luis')).toBe(current);
  });

  it('cannot be removed while a saved team counts on them', () => {
    const current = table(
      ['Ana', 'Luis', 'Rosa'],
      [{ id: 's1', name: 'Primos', players: ['Ana', 'Luis'] }],
    );
    expect(teamsUsing(current, 'ana').map((team) => team.name)).toEqual(['Primos']);
    expect(removePlayer(current, 'Ana')).toBe(current);
    expect(removePlayer(current, 'Rosa').players).toEqual(['Ana', 'Luis']);
  });

  it('are found by any part of the name, accents and case aside', () => {
    expect(filterPlayers(['Ángel', 'Rosa', 'Ana'], 'an')).toEqual(['Ángel', 'Ana']);
    expect(filterPlayers(['Ángel', 'Rosa'], '')).toEqual(['Ángel', 'Rosa']);
  });
});

describe('saved teams', () => {
  it('bring their players into the mesa', () => {
    const saved = saveTeam(table(['Ana']), { id: 's1', name: 'Primos', players: ['ana', 'Luis'] });
    expect(saved.players).toEqual(['Ana', 'Luis']);
    expect(saved.teams).toEqual([{ id: 's1', name: 'Primos', players: ['ana', 'Luis'] }]);
  });

  it('are replaced by id, and refuse the name of another team', () => {
    const first = saveTeam(table(), { id: 's1', name: 'Primos', players: null });
    const second = saveTeam(first, { id: 's2', name: 'Tías', players: null });
    expect(saveTeam(second, { id: 's2', name: 'primos', players: null })).toBe(second);
    const renamed = saveTeam(second, { id: 's1', name: 'Primas', players: null });
    expect(renamed.teams.map((team) => team.name)).toEqual(['Primas', 'Tías']);
  });
});

describe('saved mesas', () => {
  it('are read back, dropping what cannot be read', () => {
    const saved = {
      active: 'm1',
      tables: [
        {
          id: 'm1',
          name: 'Casa',
          players: ['Ana', 'ana', 3],
          teams: [{ id: 's1', name: 'Uno', players: ['Ana', 'Luis'] }, { name: 'sin id' }],
        },
        { id: 'm2', name: '' },
        'basura',
      ],
    };
    expect(parseTables(saved)).toEqual({
      active: 'm1',
      tables: [
        {
          id: 'm1',
          name: 'Casa',
          players: ['Ana', 'Luis'],
          teams: [{ id: 's1', name: 'Uno', players: ['Ana', 'Luis'] }],
        },
      ],
    });
    expect(parseTables(null)).toEqual(noTables);
    expect(parseTables({ tables: [], active: 'gone' }).active).toBeNull();
  });
});
