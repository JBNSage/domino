import {
  LiveDoc,
  LiveRow,
  LiveTeam,
  LiveWrites,
  MatchDoc,
  Member,
  MesaDoc,
  PlayerIds,
  SharedMesa,
  TeamDoc,
} from './cloud';
import { MatchRecord } from './history';
import { Players, Row, State, TEAM_IDS, TeamId, sameName } from './state';
import { SavedTeam, Table } from './tables';

/**
 * Between the app's mesas, matches and board and their documents in the cloud.
 * Players stay names everywhere in the app; next to each pair the cloud keeps
 * which member each one is, so a member's new name reaches every team and
 * match without anyone rewriting them.
 */

const alphabetical = (one: string, other: string) =>
  one.localeCompare(other, 'es', { sensitivity: 'base' });

export function memberNamed(members: readonly Member[], name: string): Member | null {
  return members.find((member) => sameName(member.name, name)) ?? null;
}

/** Which member each player is, by name; null when neither is one. */
export function idsFor(players: Players | null, members: readonly Member[]): PlayerIds | null {
  if (players === null) return null;
  const ids: PlayerIds = [
    memberNamed(members, players[0])?.uid ?? null,
    memberNamed(members, players[1])?.uid ?? null,
  ];
  return ids[0] === null && ids[1] === null ? null : ids;
}

/** A pair as it reads now: a member still at the mesa goes by their current name. */
export function resolvePlayers(
  players: Players | null,
  ids: PlayerIds | null | undefined,
  members: readonly Member[],
): Players | null {
  if (players === null || !ids) return players;
  const name = (index: 0 | 1) =>
    members.find((member) => member.uid === ids[index])?.name ?? players[index];
  return [name(0), name(1)];
}

function toTeamDoc(team: SavedTeam, members: readonly Member[]): TeamDoc {
  return { ...team, playerIds: idsFor(team.players, members) };
}

function fromTeamDoc(team: TeamDoc, members: readonly Member[]): SavedTeam {
  return {
    id: team.id,
    name: team.name,
    players: resolvePlayers(team.players, team.playerIds, members),
  };
}

/** The players a mesa offers: those written by hand and its members, once each. */
export function mesaPlayers(written: readonly string[], members: readonly Member[]): string[] {
  const players = members.map((member) => member.name);
  for (const name of written) {
    if (!players.some((player) => sameName(player, name))) players.push(name);
  }
  return players.sort(alphabetical);
}

/** The parts of a mesa its owners write. Members are left out: they are players by joining. */
export function toMesaDoc(
  table: Table,
  members: readonly Member[],
): Pick<MesaDoc, 'name' | 'players' | 'teams'> {
  return {
    name: table.name,
    players: table.players.filter((player) => memberNamed(members, player) === null),
    teams: table.teams.map((team) => toTeamDoc(team, members)),
  };
}

/** A shared mesa as the app shows it, from this phone's point of view. */
export function fromShared(shared: SharedMesa, uid: string | null): Table | null {
  if (shared.doc === null) return null;
  const me = shared.members.find((member) => member.uid === uid) ?? null;
  return {
    id: shared.id,
    name: shared.doc.name,
    players: mesaPlayers(shared.doc.players, shared.members),
    teams: shared.doc.teams.map((team) => fromTeamDoc(team, shared.members)),
    shared: {
      owner: me?.owner ?? false,
      scores: (me?.owner ?? false) || (me?.scores ?? false),
      me: uid,
      members: shared.members,
      invite: shared.invite,
    },
  };
}

export function toMatchDoc(match: MatchRecord, members: readonly Member[]): MatchDoc {
  const { id, endedAt, target, rows, winner, tournament, tieBreak } = match;
  const team = (side: TeamId) => ({
    ...match.teams[side],
    playerIds: idsFor(match.teams[side].players, members),
  });
  return {
    id,
    endedAt,
    target,
    rows,
    winner,
    tournament,
    tieBreak,
    teams: { a: team('a'), b: team('b') },
  };
}

export function fromMatchDoc(
  match: MatchDoc,
  mesa: { id: string; name: string },
  members: readonly Member[],
): MatchRecord {
  const { id, endedAt, target, rows, winner, tournament, tieBreak } = match;
  const team = (side: TeamId) => ({
    name: match.teams[side].name,
    players: resolvePlayers(match.teams[side].players, match.teams[side].playerIds, members),
  });
  return {
    id,
    endedAt,
    target,
    rows,
    winner,
    tournament,
    tieBreak,
    teams: { a: team('a'), b: team('b') },
    table: mesa.name,
    tableId: mesa.id,
  };
}

/** Hands in the order they were played; the id settles two played at the same moment. */
function orderedRows(rows: Record<string, LiveRow>): (LiveRow & { id: string })[] {
  return Object.entries(rows)
    .map(([id, row]) => ({ ...row, id }))
    .sort(
      (one, other) => one.at - other.at || (one.id < other.id ? -1 : one.id > other.id ? 1 : 0),
    );
}

/** The board of a live match, with each hand's time and author kept apart. */
export function fromLiveDoc(
  live: LiveDoc,
  members: readonly Member[],
): { state: State; matchId: string; rows: ReadonlyMap<string, LiveRow> } {
  const rows = orderedRows(live.rows);
  const team = (id: TeamId) => {
    const { playerIds, ...rest } = live.teams[id];
    return { ...rest, players: resolvePlayers(rest.players, playerIds, members) };
  };
  return {
    state: {
      teams: { a: team('a'), b: team('b') },
      target: live.target,
      quickValue: live.quickValue,
      between: live.between,
      rows: rows.map(({ id, team, points }) => ({ id, team, points })),
    },
    matchId: live.matchId,
    rows: new Map(rows.map(({ id, ...row }) => [id, row])),
  };
}

function liveTeam(state: State, id: TeamId, members: readonly Member[]): LiveTeam {
  const team = state.teams[id];
  return { ...team, playerIds: idsFor(team.players, members) };
}

/** A whole live match from a board, such as when a mesa is first shared. */
export function toLiveDoc(
  state: State,
  matchId: string,
  members: readonly Member[],
  by: string,
  now: number,
): LiveDoc {
  const rows: Record<string, LiveRow> = {};
  state.rows.forEach((row, index) => {
    rows[row.id] = { team: row.team, points: row.points, at: now + index, by };
  });
  return {
    matchId,
    teams: { a: liveTeam(state, 'a', members), b: liveTeam(state, 'b', members) },
    target: state.target,
    quickValue: state.quickValue,
    between: state.between,
    rows,
  };
}

const sameTeam = (one: State['teams'][TeamId], other: State['teams'][TeamId]) =>
  JSON.stringify(one) === JSON.stringify(other);

/**
 * What a change to the board writes to the live match: only what changed, so a
 * hand another phone added meanwhile is left alone. A hand that comes back keeps
 * its place through `atOf`; a new one is played now. A cleared board starts a
 * new match id.
 */
export function liveWrites(
  before: State,
  after: State,
  context: {
    members: readonly Member[];
    by: string;
    now: number;
    atOf: (id: string) => number | undefined;
    newMatchId: () => string;
  },
): LiveWrites {
  const fields: LiveWrites['fields'] = {};
  const rows: LiveWrites['rows'] = {};

  for (const id of TEAM_IDS) {
    if (!sameTeam(before.teams[id], after.teams[id])) {
      fields.teams = {
        a: liveTeam(after, 'a', context.members),
        b: liveTeam(after, 'b', context.members),
      };
    }
  }
  if (before.target !== after.target) fields.target = after.target;
  if (before.quickValue !== after.quickValue) fields.quickValue = after.quickValue;
  if (before.between !== after.between) fields.between = after.between;

  const old = new Map<string, Row>(before.rows.map((row) => [row.id, row]));
  const now = new Map<string, Row>(after.rows.map((row) => [row.id, row]));
  for (const [id] of old) if (!now.has(id)) rows[id] = null;
  let next = context.now;
  for (const [id, row] of now) {
    const was = old.get(id);
    if (was !== undefined && was.team === row.team && was.points === row.points) continue;
    rows[id] = {
      team: row.team,
      points: row.points,
      at: context.atOf(id) ?? next++,
      by: context.by,
    };
  }
  if (before.rows.length > 0 && after.rows.length === 0) fields.matchId = context.newMatchId();

  return { fields, rows };
}

export function isEmptyWrite(writes: LiveWrites): boolean {
  return Object.keys(writes.fields).length === 0 && Object.keys(writes.rows).length === 0;
}

/** Two boards that show the same thing, whatever order their fields were written in. */
export function sameBoard(one: State, other: State): boolean {
  const team = (state: State, id: TeamId) => {
    const { name, players, roundsWon, saved } = state.teams[id];
    return [name, players?.[0] ?? null, players?.[1] ?? null, roundsWon, saved];
  };
  const rows = (state: State) => state.rows.map((row) => [row.id, row.team, row.points]);
  const flat = (state: State) =>
    JSON.stringify([
      team(state, 'a'),
      team(state, 'b'),
      state.target,
      state.quickValue,
      state.between,
      rows(state),
    ]);
  return flat(one) === flat(other);
}
