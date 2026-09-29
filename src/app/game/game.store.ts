import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { copy } from '../copy';
import { haptics } from '../platform/haptics';
import { History } from './history';
import { HistoryStore } from './history.store';
import { teamWinsAt } from './stats';
import { TablesStore } from './tables.store';
import {
  SavedTeam,
  Tables,
  removePlayer,
  removeTable,
  removeTeam,
  renamePlayer,
  saveTeam,
  setActive,
  updateTable,
} from './tables';
import { TournamentDraft } from './tournament-draft';
import {
  Action,
  Players,
  Row,
  State,
  TEAM_IDS,
  UNDO_SECONDS,
  sameName,
  samePlayers,
  Team,
  TeamId,
  initialState,
  reducer,
  selectTotals,
  selectWinner,
} from './state';
import {
  STORAGE_KEY,
  TOURNAMENT_KEY,
  loadState,
  loadTournament,
  readState,
  readTournament,
  saveState,
  forgetSavedUndo,
  saveTournament,
} from './storage';
import {
  Rule,
  Tournament,
  TournamentTeam,
  champion,
  create,
  end,
  lastWinningSeat,
  recordResult,
  renameTeam,
  setSeat,
  standings,
  startMatch,
  startTieBreak,
  teamOf,
  winsOf,
} from './tournament';

export const UNDO_MS = UNDO_SECONDS * 1000;

/** A no-break space: invisible, but enough for a live region to speak again. */
const REPEAT_MARK = String.fromCharCode(160);

/** History entries written by a change, which go when the change is taken back. */
type Recorded = { matches: string[]; tournaments: string[] };

const nothingRecorded: Recorded = { matches: [], tournaments: [] };

/** The board and the tournament as they were, and what was written since. */
type Snapshot = { state: State; tournament: Tournament | null; recorded: Recorded };

/**
 * How an action is taken back. Changes to one hand are reversed on their own,
 * so hands scored in the meantime stay. A reset, a closed match or a change to
 * the tournament goes back to everything as it was. Entries removed from the
 * history or the mesas are put back.
 */
type Reversal =
  | { kind: 'restoreRow'; row: Row; index: number }
  | { kind: 'removeRow'; id: string }
  | { kind: 'editRow'; id: string; points: number }
  | { kind: 'snapshot'; snapshot: Snapshot }
  | { kind: 'history'; removed: History }
  | { kind: 'tables'; before: Tables; after: Tables; relink: Relink[] };

/** A side whose saved team went with a removed mesa, and the link it had. */
type Relink = { side: TeamId; saved: string };

export type Undo = { message: string; reversal: Reversal };

export type MatchResult = {
  winner: TeamId;
  names: Record<TeamId, string>;
  players: Record<TeamId, Players | null>;
  totals: Record<TeamId, number>;
  /** Matches the winner will have won once this one is counted. */
  roundsAfter: number;
};

/** The change that can end a round, kept so the winner screen can take it back. */
type LastChange = { kind: 'hand' } | { kind: 'target' | 'edit'; snapshot: State };

/** What `correct` did, so the screen can follow up. */
export type Correction = 'restored' | 'deleted' | 'settings';

@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly state = signal<State>(loadState() ?? initialState);
  /** The tournament being played, if any. */
  readonly tournament = signal<Tournament | null>(loadTournament());
  readonly undo = signal<Undo | null>(null);
  /** Text for the screen reader's live region. */
  readonly announcement = signal('');

  readonly totals = computed(() => selectTotals(this.state()));
  readonly winner = computed(() => selectWinner(this.state()));

  readonly result = computed<MatchResult | null>(() => {
    const winner = this.winner();
    if (winner === null) return null;
    const { teams } = this.state();
    return {
      winner,
      names: { a: teams.a.name, b: teams.b.name },
      players: { a: teams.a.players, b: teams.b.players },
      totals: this.totals(),
      roundsAfter: teams[winner].roundsWon + 1,
    };
  });

  // What ended the round: a target or a hand changed in this session, the last
  // hand, or, after a restart, an earlier change that no single hand explains.
  readonly cause = computed<'restore' | 'hand' | 'settings'>(() => {
    if (this.lastChange().kind !== 'hand') return 'restore';
    const state = this.state();
    const lastHandDecides =
      state.rows.length > 0 && selectWinner({ ...state, rows: state.rows.slice(0, -1) }) === null;
    return lastHandDecides ? 'hand' : 'settings';
  });

  readonly correctLabel = computed(() => {
    const change = this.lastChange();
    if (change.kind === 'target') return copy.winner.restoreTarget(change.snapshot.target);
    if (change.kind === 'edit') return copy.winner.undoEdit;
    return this.cause() === 'hand' ? copy.winner.correct : copy.winner.changeTarget;
  });

  /** What closing the match leads to: another match, or the end of the tournament. */
  readonly closeLabel = computed(() => {
    const tournament = this.tournament();
    const result = this.result();
    if (tournament === null || result === null) return copy.winner.close;
    const after = recordResult(tournament, '', result.winner, result.totals);
    if (after.phase === 'done') return copy.tournament.result;
    return after.phase === 'between' ? copy.tournament.next : copy.winner.close;
  });

  /** At a mesa, the next match can be played by other teams or players. */
  readonly canRotate = computed(() => this.tournament() === null && this.tables.active() !== null);

  /** Whether the way back on offer undoes a whole step, such as closing a match. */
  readonly canGoBack = computed(() => this.undo()?.reversal.kind === 'snapshot');

  /** A way back that belongs on the screens above the board: removed entries. */
  readonly screenUndo = computed(() => {
    const kind = this.undo()?.reversal.kind;
    return kind === 'history' || kind === 'tables';
  });

  private readonly history = inject(HistoryStore);
  private readonly draft = inject(TournamentDraft);
  private readonly tables = inject(TablesStore);
  private readonly lastChange = signal<LastChange>({ kind: 'hand' });
  private undoTimer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 0;

  constructor() {
    effect(() => saveState(this.state()));

    effect(() => saveTournament(this.tournament()));

    // Versions before 3-second undo kept an offer across restarts.
    forgetSavedUndo();

    effect(() => {
      const result = this.result();
      if (result === null) return;
      haptics.win();
      untracked(() => this.announce(copy.winner.body(result.names[result.winner])));
    });

    // A way back to older mesas would undo whatever changed them since.
    effect(() => {
      const tables = this.tables.tables();
      untracked(() => {
        const reversal = this.undo()?.reversal;
        if (reversal?.kind === 'tables' && reversal.after !== tables) this.clearUndo();
      });
    });

    this.followOtherTabs();
  }

  dispatch(action: Action): void {
    this.state.update((state) => reducer(state, action));
  }

  addPoints(team: TeamId, points: number): Row | null {
    // Between two matches of a tournament nobody is playing.
    if ((this.tournament()?.phase ?? 'playing') !== 'playing') return null;
    const before = this.state();
    const id = this.newId();
    this.dispatch({ type: 'addPoints', team, points, id });
    const state = this.state();
    if (state === before) return null;

    this.lastChange.set({ kind: 'hand' });
    this.boardChanged();
    haptics.tap();
    this.announce(copy.team.announce(state.teams[team].name, this.totals()[team]));
    return state.rows[state.rows.length - 1];
  }

  /** One tap and no sheet, so a slip of the thumb gets its own way back. */
  addQuick(team: TeamId): void {
    const value = this.state().quickValue;
    const row = this.addPoints(team, value);
    if (row === null) return;
    this.offer(copy.undo.quickAdded(value, this.state().teams[team].name), {
      kind: 'removeRow',
      id: row.id,
    });
  }

  editRow(row: Row, index: number, points: number): void {
    const before = this.state();
    this.dispatch({ type: 'editRow', id: row.id, points });
    if (this.state() === before) return;

    this.lastChange.set({ kind: 'edit', snapshot: before });
    haptics.tap();
    this.offer(copy.undo.handEdited(index + 1, points), {
      kind: 'editRow',
      id: row.id,
      points: row.points,
    });
  }

  renameTeam(team: TeamId, name: string): void {
    this.setTeam(team, name, this.state().teams[team].players);
  }

  /** Changes the team at one side; `saved` links it to a team of the mesa, or unlinks it. */
  setTeam(team: TeamId, name: string, players: Players | null, saved?: string | null): void {
    const before = this.state();
    // Other players make another team: it brings its own wins at the mesa.
    const roundsWon = samePlayers(players, before.teams[team].players)
      ? undefined
      : this.winsHere(name, players);
    this.dispatch({ type: 'setTeam', team, name, players, saved, roundsWon });
    if (this.state() === before) return;
    // In a tournament the team keeps its new name when it leaves the table.
    const changed = this.state().teams[team];
    this.tournament.update((tournament) =>
      tournament === null
        ? null
        : renameTeam(tournament, tournament.seats[team], changed.name, changed.players),
    );
    // While the next teams are chosen, the closed match can still be taken back.
    if (this.state().between === null) this.boardChanged();
  }

  /** Another team takes one side, bringing the wins it has at the mesa. */
  seatTeam(team: TeamId, seated: Omit<SavedTeam, 'id'> & { saved: string | null }): void {
    const roundsWon = this.winsHere(seated.name, seated.players) ?? 0;
    this.dispatch({ type: 'seatTeam', team, ...seated, roundsWon });
    this.announce(copy.seat.announce(this.state().teams[team].name));
  }

  /** Starts the match once the two teams are chosen. */
  startMatch(): void {
    if (this.state().between === null) return;
    this.dispatch({ type: 'resume' });
  }

  /**
   * Plays at a mesa, or at none. At a clean board outside a tournament, the
   * mesa's first two teams are chosen, even when it was already in use.
   */
  chooseTable(id: string | null): void {
    this.tables.change((tables) => setActive(tables, id));
    if (this.tables.tables().active !== id) return;
    if (id === null) this.dispatch({ type: 'resume' });
    else if (this.tournament() === null) this.dispatch({ type: 'waitForTeams' });
  }

  /** Renames a player at a mesa, in its saved teams, at the board and in its matches. */
  renameTablePlayer(table: string, from: string, to: string): void {
    const before = this.tables.tables();
    this.tables.changeTable(table, (current) => renamePlayer(current, from, to));
    const mesa = this.tables.tables().tables.find((each) => each.id === table);
    if (this.tables.tables() === before || mesa === undefined) return;
    const renamed = mesa.players.find((player) => sameName(player, to)) ?? to;

    this.history.renamePlayer(
      (match) =>
        match.tableId === table ||
        (match.tableId === null && match.table !== null && sameName(match.table, mesa.name)),
      from,
      renamed,
    );
    if (this.tables.active()?.id !== table) return;
    const { teams } = this.state();
    for (const side of TEAM_IDS) {
      const players = teams[side].players;
      if (players === null || !players.some((player) => sameName(player, from))) continue;
      const next = players.map((player) => (sameName(player, from) ? renamed : player)) as Players;
      this.dispatch({ type: 'setTeam', team: side, name: teams[side].name, players: next });
    }
  }

  /**
   * The wins a team has at the mesa in use, from the history: the same two
   * people, whatever the team is called. Undefined outside a mesa, or in a
   * tournament, which counts its own.
   */
  winsHere(name: string, players: Players | null): number | undefined {
    const mesa = this.tables.active();
    if (mesa === null || this.tournament() !== null) return undefined;
    return teamWinsAt(this.history.history(), mesa, { name, players });
  }

  /** Clears an offer to bring back a removed entry, once its screen is left behind. */
  dismissScreenUndo(): void {
    if (this.screenUndo()) this.clearUndo();
  }

  /** Keeps a team at a mesa; the side it sits at, if any, follows the change. */
  saveTableTeam(table: string, team: SavedTeam): void {
    this.tables.changeTable(table, (current) => saveTeam(current, team));
    if (this.tournament() !== null) return;
    const { teams } = this.state();
    for (const side of TEAM_IDS) {
      if (teams[side].saved !== team.id) continue;
      this.setTeam(side, team.name, team.players);
    }
  }

  /** Removes a mesa; the teams at the board that were saved there stop counting for it. */
  removeTable(id: string): void {
    const mesa = this.tables.tables().tables.find((table) => table.id === id);
    const { teams } = this.state();
    const relink: Relink[] = TEAM_IDS.flatMap((side) => {
      const saved = teams[side].saved;
      return saved !== null && mesa?.teams.some((team) => team.id === saved)
        ? [{ side, saved }]
        : [];
    });
    this.changeTables(copy.undo.tableDeleted, (tables) => removeTable(tables, id), relink);
    for (const { side } of relink) {
      const team = this.state().teams[side];
      this.dispatch({
        type: 'setTeam',
        team: side,
        name: team.name,
        players: team.players,
        saved: null,
      });
    }
  }

  removeTablePlayer(table: string, player: string): void {
    this.changeTables(copy.undo.playerDeleted, (tables) =>
      updateTable(tables, table, (current) => removePlayer(current, player)),
    );
  }

  removeTableTeam(table: string, team: string): void {
    this.changeTables(copy.undo.teamDeleted, (tables) =>
      updateTable(tables, table, (current) => removeTeam(current, team)),
    );
  }

  /** Changes a tournament team, such as its players between two matches. */
  setTournamentTeam(id: string, name: string, players: Players | null): void {
    const tournament = this.tournament();
    if (tournament === null) return;
    const side = TEAM_IDS.find((seat) => tournament.seats[seat] === id);
    if (tournament.phase === 'playing' && side !== undefined) {
      this.setTeam(side, name, players);
      return;
    }
    this.tournament.set(renameTeam(tournament, id, name, players));
  }

  deleteRow(row: Row, index: number): void {
    const before = this.state();
    this.dispatch({ type: 'deleteRow', id: row.id });
    if (this.state() === before) return;
    this.offer(copy.undo.handDeleted(index + 1), { kind: 'restoreRow', row, index });
  }

  /**
   * Counts the win and keeps the match in the history. At a mesa, `rotate`
   * asks for the next two teams first; otherwise the same teams play on.
   */
  closeRound(rotate = false): void {
    const result = this.result();
    if (result === null) return;
    const { teams, target, rows } = this.state();
    const tournament = this.tournament();
    const table = this.tables.active();
    const id = this.newId();

    this.change(copy.undo.roundClosed, () => {
      this.history.addMatch({
        id,
        endedAt: Date.now(),
        target,
        teams: {
          a: { name: teams.a.name, players: teams.a.players },
          b: { name: teams.b.name, players: teams.b.players },
        },
        rows,
        winner: result.winner,
        tournament: tournament?.id ?? null,
        tieBreak: tournament !== null && tournament.tieBreak !== null,
        table: table?.name ?? null,
        tableId: table?.id ?? null,
      });
      // A tournament has its own step between matches.
      const pause = rotate && table !== null && tournament === null;
      this.dispatch({ type: 'closeRound', winner: result.winner, pause });
      if (tournament !== null) {
        this.tournament.set(recordResult(tournament, id, result.winner, result.totals));
      }
      return { matches: [id], tournaments: [] };
    });

    const winner = this.tournamentWinner();
    if (winner !== null) this.announce(copy.tournament.announceChampion(winner));
  }

  clearRows(): void {
    this.change(copy.undo.handsCleared, () => this.dispatch({ type: 'clearRows' }));
  }

  resetAll(): void {
    // A tournament is ended from its table, not swept away with the board.
    if (this.tournament() !== null) return;
    this.change(copy.undo.allReset, () => this.dispatch({ type: 'resetAll' }));
  }

  startTournament(teams: TournamentTeam[], rule: Rule): void {
    this.change(copy.undo.tournamentStarted, () => {
      const tournament = create(this.newId(), Date.now(), teams, rule);
      this.tournament.set(tournament);
      this.seat(tournament);
    });
  }

  /** Changes who plays next, while the next match is being chosen. */
  setSeat(seat: TeamId, team: string): void {
    this.tournament.update((tournament) =>
      tournament === null ? null : setSeat(tournament, seat, team),
    );
  }

  startNextMatch(): void {
    const tournament = this.tournament();
    if (tournament === null || tournament.phase !== 'between') return;
    const playing = startMatch(tournament);
    this.tournament.set(playing);
    this.seat(playing);
  }

  /** Ends the tournament by hand, with whoever leads as champion. */
  endTournament(): void {
    const tournament = this.tournament();
    if (tournament === null) return;
    if (tournament.results.length === 0) {
      this.change(copy.undo.tournamentCancelled, () => this.leaveTournament());
      return;
    }
    this.change(copy.undo.tournamentEnded, () => {
      this.tournament.set(end(tournament));
      this.dispatch({ type: 'clearRows' });
    });
    const winner = this.tournamentWinner();
    if (winner !== null) this.announce(copy.tournament.announceChampion(winner));
  }

  startTieBreak(): void {
    const tournament = this.tournament();
    if (tournament === null) return;
    this.change(copy.undo.tieBreakStarted, () => {
      const tied = startTieBreak(tournament);
      this.tournament.set(tied);
      this.seat(tied);
    });
  }

  /** Keeps the finished tournament in the history and returns to a clean board. */
  finishTournament(): void {
    const tournament = this.tournament();
    if (tournament === null || tournament.phase !== 'done') return;
    this.change(copy.undo.tournamentSaved, () => {
      const winner = champion(tournament);
      this.history.addTournament({
        id: tournament.id,
        startedAt: tournament.startedAt,
        endedAt: Date.now(),
        rule: tournament.rule,
        ranking: standings(tournament),
        champion: winner?.id ?? null,
        championSeat: winner === null ? null : lastWinningSeat(tournament, winner.id),
        results: tournament.results,
      });
      this.leaveTournament();
      return { matches: [], tournaments: [tournament.id] };
    });
  }

  deleteMatch(id: string): void {
    this.offerHistory(copy.undo.matchDeleted, this.history.remove({ matches: [id] }));
  }

  deleteTournament(id: string): void {
    const removed = this.history.remove({ tournaments: [id] });
    this.offerHistory(copy.undo.tournamentDeleted, removed);
  }

  clearHistory(): void {
    this.offerHistory(copy.undo.historyCleared, this.history.clear());
  }

  saveSettings(target: number, quickValue: number): void {
    const before = this.state();
    this.dispatch({ type: 'setTarget', target });
    this.dispatch({ type: 'setQuickValue', value: quickValue });
    if (this.state() === before) return;
    if (target !== before.target) this.lastChange.set({ kind: 'target', snapshot: before });
    this.boardChanged();
  }

  /** Takes back whatever ended the round. */
  correct(): Correction {
    const change = this.lastChange();
    const cause = this.cause();
    this.lastChange.set({ kind: 'hand' });

    if (change.kind !== 'hand') {
      this.dispatch({ type: 'hydrate', state: change.snapshot });
      this.clearUndo();
      return 'restored';
    }
    if (cause === 'hand') {
      const rows = this.state().rows;
      this.deleteRow(rows[rows.length - 1], rows.length - 1);
      return 'deleted';
    }
    return 'settings';
  }

  /** Takes the offer. Returns the hand that came back or changed, if it was one. */
  restore(): string | null {
    const undo = this.undo();
    if (undo === null) return null;
    const { reversal } = undo;
    this.clearUndo();
    this.lastChange.set({ kind: 'hand' });
    this.announce(copy.undo.done);

    switch (reversal.kind) {
      case 'restoreRow':
        this.dispatch({ type: 'restoreRow', row: reversal.row, index: reversal.index });
        return reversal.row.id;
      case 'removeRow':
        this.dispatch({ type: 'deleteRow', id: reversal.id });
        return null;
      case 'editRow':
        this.dispatch({ type: 'editRow', id: reversal.id, points: reversal.points });
        return reversal.id;
      case 'snapshot':
        this.dispatch({ type: 'hydrate', state: reversal.snapshot.state });
        this.tournament.set(reversal.snapshot.tournament);
        this.history.remove({
          matches: reversal.snapshot.recorded.matches,
          records: reversal.snapshot.recorded.tournaments,
        });
        return null;
      case 'history':
        this.history.restore(reversal.removed);
        return null;
      case 'tables':
        this.tables.tables.set(reversal.before);
        for (const { side, saved } of reversal.relink) {
          const team = this.state().teams[side];
          this.dispatch({
            type: 'setTeam',
            team: side,
            name: team.name,
            players: team.players,
            saved,
          });
        }
        return null;
    }
  }

  /** Keeps a short-lived offer open while someone is reaching for it. */
  holdUndo(): void {
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = null;
  }

  /** Every offer ends a few seconds after it is made, or after it is let go. */
  releaseUndo(): void {
    this.holdUndo();
    if (this.undo() === null) return;
    this.undoTimer = setTimeout(() => this.undo.set(null), UNDO_MS);
  }

  announce(message: string): void {
    // A live region only speaks when its text changes, so a repeat gets a trailing space.
    this.announcement.update((current) => (current === message ? message + REPEAT_MARK : message));
  }

  private newId(): string {
    this.nextId += 1;
    return `${Date.now()}-${this.nextId}`;
  }

  private offer(message: string, reversal: Reversal): void {
    this.undo.set({ message, reversal });
    this.announce(`${message}. ${copy.undo.action}`);
    this.releaseUndo();
  }

  private offerHistory(message: string, removed: History): void {
    if (removed.matches.length === 0 && removed.tournaments.length === 0) return;
    this.offer(message, { kind: 'history', removed });
  }

  /** Removes something from the mesas, with a way back. */
  private changeTables(
    message: string,
    apply: (tables: Tables) => Tables,
    relink: Relink[] = [],
  ): void {
    const before = this.tables.tables();
    this.tables.change(apply);
    const after = this.tables.tables();
    if (after === before) return;
    this.offer(message, { kind: 'tables', before, after, relink });
  }

  /** Makes a change that can be taken back whole. */
  private change(message: string, apply: () => Recorded | void): void {
    const state = this.state();
    const tournament = this.tournament();
    const recorded = apply() ?? nothingRecorded;
    if (this.state() === state && this.tournament() === tournament) return;
    this.lastChange.set({ kind: 'hand' });
    this.offer(message, { kind: 'snapshot', snapshot: { state, tournament, recorded } });
  }

  /** Sits the tournament's two teams at the board, with the wins they bring. */
  private seat(tournament: Tournament): void {
    const at = (side: TeamId): Team => {
      const { name, players } = teamOf(tournament, tournament.seats[side]);
      // Tournament wins are counted by the tournament, not by the mesa.
      return { name, players, roundsWon: winsOf(tournament, tournament.seats[side]), saved: null };
    };
    this.dispatch({ type: 'seat', teams: { a: at('a'), b: at('b') } });
  }

  /** Back to single matches: the last two teams stay, their count starts again. */
  private leaveTournament(): void {
    const { a, b } = this.state().teams;
    const tournament = this.tournament();
    if (tournament !== null) this.draft.keepTeams(tournament.teams);
    this.tournament.set(null);
    this.dispatch({
      type: 'seat',
      teams: { a: { ...a, roundsWon: 0 }, b: { ...b, roundsWon: 0 } },
    });
  }

  private tournamentWinner(): string | null {
    const tournament = this.tournament();
    if (tournament === null || tournament.phase !== 'done') return null;
    return champion(tournament)?.name ?? null;
  }

  /** Going back to an old board would now erase newer work, so that offer ends. */
  private boardChanged(): void {
    if (this.undo()?.reversal.kind === 'snapshot') this.clearUndo();
  }

  private clearUndo(): void {
    this.holdUndo();
    this.undo.set(null);
  }

  /** The installed app and a browser tab can both be open; the newest save wins in both. */
  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === STORAGE_KEY || event.key === null) {
        const state = readState(event.newValue) ?? initialState;
        if (JSON.stringify(state) === JSON.stringify(this.state())) return;
        this.state.set(state);
        this.lastChange.set({ kind: 'hand' });
        // Whatever this tab was offering belongs to a board that is gone.
        this.clearUndo();
      }
      if (event.key === TOURNAMENT_KEY || event.key === null) {
        const tournament = readTournament(event.newValue);
        if (JSON.stringify(tournament) !== JSON.stringify(this.tournament())) {
          this.tournament.set(tournament);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
