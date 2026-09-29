import { Injectable, inject } from '@angular/core';

import { copy } from '../copy';
import { GameStore } from '../game/game.store';
import { newId } from '../game/ids';
import { DEFAULT_NAMES, TeamId, otherTeam } from '../game/state';
import { SavedTeam } from '../game/tables';
import { TablesStore } from '../game/tables.store';
import { teamOf } from '../game/tournament';
import { TeamEdit } from './team-sheet';

/**
 * What the team sheet is asked to change, for each place a team can be
 * changed from: a side of the board, a seat between two tournament matches,
 * or the list of a mesa.
 */
@Injectable({ providedIn: 'root' })
export class TeamEdits {
  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);

  /** The team at one side, or proposed for it between two tournament matches. */
  side(side: TeamId): TeamEdit {
    const tournament = this.store.tournament();
    const table = this.tables.active()?.id ?? null;

    if (tournament !== null && tournament.phase === 'between') {
      const team = teamOf(tournament, tournament.seats[side]);
      const other = teamOf(tournament, tournament.seats[otherTeam(side)]);
      return {
        title: copy.players.title,
        accent: `var(--c-team-${side})`,
        name: team.name,
        players: team.players,
        fallback: team.name,
        taken: tournament.teams.filter((each) => each.id !== team.id).map((each) => each.name),
        confirm: copy.players.save,
        table,
        blocked: other.players ?? [],
        keep: null,
        save: (name, players) => this.store.setTournamentTeam(team.id, name, players),
      };
    }

    const { teams } = this.store.state();
    const team = teams[side];
    const other = teams[otherTeam(side)];
    // In a tournament no two teams share a name; at the board, the two playing do not.
    const taken =
      tournament === null
        ? [other.name]
        : tournament.teams
            .filter((each) => each.id !== tournament.seats[side])
            .map((each) => each.name);
    const savedHere = this.savedHere(team.saved);
    return {
      title: copy.players.title,
      accent: `var(--c-team-${side})`,
      name: team.name,
      players: team.players,
      fallback: DEFAULT_NAMES[side],
      taken,
      confirm: copy.players.save,
      table,
      blocked: other.players ?? [],
      // Tournament teams belong to the tournament, not to the mesa.
      keep: table === null || tournament !== null ? null : savedHere !== null,
      savedId: savedHere,
      save: (name, players, keep) => {
        if (table === null || tournament !== null || !keep) {
          this.store.setTeam(side, name, players);
          return;
        }
        const id = savedHere ?? newId('s');
        this.store.saveTableTeam(table, { id, name, players });
        this.store.setTeam(side, name, players, id);
      },
    };
  }

  /** A team made up on the spot, which takes one side. */
  newAtSide(side: TeamId): TeamEdit {
    const table = this.tables.active()?.id ?? null;
    const other = this.store.state().teams[otherTeam(side)];
    return {
      title: copy.players.newTitle,
      accent: `var(--c-team-${side})`,
      name: '',
      players: null,
      fallback: DEFAULT_NAMES[side],
      taken: [other.name],
      confirm: copy.players.save,
      table,
      blocked: other.players ?? [],
      keep: table === null ? null : false,
      savedId: null,
      save: (name, players, keep) => {
        const saved = table !== null && keep ? newId('s') : null;
        if (table !== null && saved !== null) {
          this.store.saveTableTeam(table, { id: saved, name, players });
        }
        this.store.seatTeam(side, { name, players, saved });
      },
    };
  }

  /** A team kept at a mesa, or a new one for it when `team` is null. */
  saved(table: string, team: SavedTeam | null, fallback: string): TeamEdit {
    const mesa = this.tables.tables().tables.find((each) => each.id === table);
    const others = (mesa?.teams ?? []).filter((each) => each.id !== team?.id);
    return {
      title: team === null ? copy.players.newTitle : copy.players.title,
      accent: null,
      name: team?.name ?? '',
      players: team?.players ?? null,
      fallback,
      taken: others.map((each) => each.name),
      confirm: team === null ? copy.players.add : copy.players.save,
      table,
      blocked: [],
      keep: null,
      save: (name, players) =>
        this.store.saveTableTeam(table, { id: team?.id ?? newId('s'), name, players }),
      remove: team === null ? undefined : () => this.store.removeTableTeam(table, team.id),
    };
  }

  /** The saved team a board team is, if it belongs to the mesa in use. */
  private savedHere(saved: string | null): string | null {
    const table = this.tables.active();
    return saved !== null && table?.teams.some((team) => team.id === saved) ? saved : null;
  }
}
