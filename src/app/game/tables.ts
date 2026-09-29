import { Players, cleanLabel, cleanPlayer, fold, parsePlayers, sameName } from './state';

export const MAX_TABLES = 12;
export const MAX_TABLE_PLAYERS = 40;
export const MAX_SAVED_TEAMS = 20;

/** A team that usually plays at a mesa. */
export type SavedTeam = {
  id: string;
  name: string;
  players: Players | null;
};

/** A place where the same people usually play: who they are, and the teams they form. */
export type Table = {
  id: string;
  name: string;
  /** In alphabetical order. */
  players: string[];
  teams: SavedTeam[];
};

export type Tables = {
  tables: Table[];
  /** The mesa being played at, or null to write every name by hand. */
  active: string | null;
};

export const noTables: Tables = { tables: [], active: null };

const alphabetical = (one: string, other: string) =>
  one.localeCompare(other, 'es', { sensitivity: 'base' });

export function tableOf(tables: Tables, id: string | null): Table | null {
  return tables.tables.find((table) => table.id === id) ?? null;
}

export function activeTable(tables: Tables): Table | null {
  return tableOf(tables, tables.active);
}

export function tableNameTaken(tables: Tables, name: string, except: string | null = null) {
  return tables.tables.some((table) => table.id !== except && sameName(table.name, name));
}

/** A new mesa, which becomes the one being played at. */
export function addTable(tables: Tables, id: string, name: string): Tables {
  const clean = cleanLabel(name, '');
  if (clean === '' || tables.tables.length >= MAX_TABLES || tableNameTaken(tables, clean)) {
    return tables;
  }
  const table: Table = { id, name: clean, players: [], teams: [] };
  return { tables: [...tables.tables, table], active: id };
}

export function renameTable(tables: Tables, id: string, name: string): Tables {
  const clean = cleanLabel(name, '');
  const table = tableOf(tables, id);
  if (table === null || clean === '' || clean === table.name) return tables;
  if (tableNameTaken(tables, clean, id)) return tables;
  return updateTable(tables, id, (current) => ({ ...current, name: clean }));
}

export function removeTable(tables: Tables, id: string): Tables {
  if (tableOf(tables, id) === null) return tables;
  return {
    tables: tables.tables.filter((table) => table.id !== id),
    active: tables.active === id ? null : tables.active,
  };
}

export function setActive(tables: Tables, id: string | null): Tables {
  if (id === tables.active) return tables;
  if (id !== null && tableOf(tables, id) === null) return tables;
  return { ...tables, active: id };
}

/** Applies a change to one mesa; a change that returns the same mesa changes nothing. */
export function updateTable(tables: Tables, id: string, change: (table: Table) => Table): Tables {
  const table = tableOf(tables, id);
  if (table === null) return tables;
  const changed = change(table);
  if (changed === table) return tables;
  return { ...tables, tables: tables.tables.map((each) => (each.id === id ? changed : each)) };
}

/** The name as the mesa spells it, if the player is there. */
export function playerNamed(table: Table, name: string): string | null {
  return table.players.find((player) => sameName(player, name)) ?? null;
}

export function addPlayer(table: Table, name: string): Table {
  const clean = cleanPlayer(name);
  if (clean === '' || table.players.length >= MAX_TABLE_PLAYERS) return table;
  if (playerNamed(table, clean) !== null) return table;
  return { ...table, players: [...table.players, clean].sort(alphabetical) };
}

/** Renames a player everywhere in the mesa, its saved teams included. */
export function renamePlayer(table: Table, from: string, to: string): Table {
  const clean = cleanPlayer(to);
  if (clean === '' || clean === from) return table;
  const taken = table.players.some((player) => player !== from && sameName(player, clean));
  if (taken || !table.players.includes(from)) return table;
  const rename = (player: string) => (player === from ? clean : player);
  return {
    ...table,
    players: table.players.map(rename).sort(alphabetical),
    teams: table.teams.map((team) =>
      team.players === null
        ? team
        : { ...team, players: [rename(team.players[0]), rename(team.players[1])] },
    ),
  };
}

export function teamsUsing(table: Table, player: string): SavedTeam[] {
  return table.teams.filter(
    (team) => team.players?.some((each) => sameName(each, player)) ?? false,
  );
}

/** A player in a saved team stays until the team changes. */
export function removePlayer(table: Table, player: string): Table {
  if (!table.players.includes(player) || teamsUsing(table, player).length > 0) return table;
  return { ...table, players: table.players.filter((each) => each !== player) };
}

export function teamNameTaken(table: Table, name: string, except: string | null = null) {
  return table.teams.some((team) => team.id !== except && sameName(team.name, name));
}

/** Adds or replaces a saved team. Its players join the mesa if they were not there. */
export function saveTeam(table: Table, team: SavedTeam): Table {
  const name = cleanLabel(team.name, '');
  const exists = table.teams.some((each) => each.id === team.id);
  if (name === '' || teamNameTaken(table, name, team.id)) return table;
  if (!exists && table.teams.length >= MAX_SAVED_TEAMS) return table;

  const withPlayers = (team.players ?? []).reduce(
    (current, player) =>
      playerNamed(current, player) === null
        ? { ...current, players: [...current.players, cleanPlayer(player)].sort(alphabetical) }
        : current,
    table,
  );
  const saved: SavedTeam = { id: team.id, name, players: team.players };
  return {
    ...withPlayers,
    teams: exists
      ? table.teams.map((each) => (each.id === team.id ? saved : each))
      : [...table.teams, saved],
  };
}

export function removeTeam(table: Table, id: string): Table {
  if (!table.teams.some((team) => team.id === id)) return table;
  return { ...table, teams: table.teams.filter((team) => team.id !== id) };
}

/** The players whose name contains what was typed, accents and case aside. */
export function filterPlayers(players: string[], text: string): string[] {
  const wanted = fold(text);
  return wanted === '' ? players : players.filter((player) => fold(player).includes(wanted));
}

function parseTable(value: unknown): Table | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const name = cleanLabel(raw.name, '');
  if (name === '') return null;

  let table: Table = { id: raw.id, name, players: [], teams: [] };
  // Each entry goes through the same rules as when it was added, so no duplicate gets in.
  for (const player of Array.isArray(raw.players) ? raw.players : []) {
    if (typeof player === 'string') table = addPlayer(table, player);
  }
  for (const item of Array.isArray(raw.teams) ? raw.teams : []) {
    if (typeof item !== 'object' || item === null) continue;
    const team = item as Record<string, unknown>;
    if (typeof team.id !== 'string' || typeof team.name !== 'string') continue;
    table = saveTeam(table, { id: team.id, name: team.name, players: parsePlayers(team.players) });
  }
  return table;
}

/** Keeps every mesa that can be read. */
export function parseTables(value: unknown): Tables {
  if (typeof value !== 'object' || value === null) return noTables;
  const raw = value as Record<string, unknown>;
  const tables: Table[] = [];
  for (const item of Array.isArray(raw.tables) ? raw.tables : []) {
    const table = parseTable(item);
    if (table === null || tables.length >= MAX_TABLES) continue;
    if (tables.some((each) => each.id === table.id || sameName(each.name, table.name))) continue;
    tables.push(table);
  }
  const active =
    typeof raw.active === 'string' && tables.some((table) => table.id === raw.active)
      ? raw.active
      : null;
  return { tables, active };
}
