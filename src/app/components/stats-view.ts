import { Injectable, computed, inject, signal } from '@angular/core';

import { copy } from '../copy';
import { HistoryStore } from '../game/history.store';
import {
  DatePreset,
  StatsFilter,
  TableChoice,
  coupleStats,
  hasPlayers,
  matchesFor,
  noFilter,
  playerStats,
  presetOf,
  tablesIn,
} from '../game/stats';

export type StatsTab = 'players' | 'couples';

/**
 * What the statistics screens look at. The filters last while the app is
 * open, so a player's detail and the way back to the lists agree.
 */
@Injectable({ providedIn: 'root' })
export class StatsView {
  private readonly history = inject(HistoryStore);

  readonly filter = signal<StatsFilter>(noFilter);
  readonly tab = signal<StatsTab>('players');

  /** The mesas the history knows, and whether matches were played at none. */
  readonly tables = computed(() => tablesIn(this.history.history()));

  readonly matches = computed(() => matchesFor(this.history.history(), this.filter()));
  readonly players = computed(() => playerStats(this.matches()));
  readonly couples = computed(() => coupleStats(this.matches()));

  /** Matches that count: those with at least one team of named players. */
  readonly counted = computed(
    () =>
      this.matches().filter(
        (match) => match.teams.a.players !== null || match.teams.b.players !== null,
      ).length,
  );

  readonly empty = computed(() => this.history.history().matches.length === 0);
  readonly noPlayers = computed(() => !this.empty() && !hasPlayers(this.history.history().matches));
  readonly tableLabel = computed(() => labelOf(this.filter().table));
  readonly datesLabel = computed(() => {
    const filter = this.filter();
    const preset = presetOf(filter, Date.now());
    return preset === null ? copy.stats.range(filter.from, filter.to) : presetLabel(preset);
  });

  clear(): void {
    this.filter.set(noFilter);
  }
}

export function labelOf(table: TableChoice): string {
  if (table.kind === 'all') return copy.stats.allTables;
  return table.kind === 'none' ? copy.stats.noTable : table.name;
}

export function presetLabel(preset: DatePreset): string {
  return {
    all: copy.stats.all,
    today: copy.stats.today,
    week: copy.stats.week,
    month: copy.stats.month,
  }[preset];
}
