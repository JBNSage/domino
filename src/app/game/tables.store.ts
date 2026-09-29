import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { TABLES_KEY, loadTables, readTables, saveTables } from './storage';
import { Table, Tables, activeTable, updateTable } from './tables';

/** The mesas kept on this device, and the one being played at. */
@Injectable({ providedIn: 'root' })
export class TablesStore {
  readonly tables = signal<Tables>(loadTables());
  readonly active = computed(() => activeTable(this.tables()));

  constructor() {
    effect(() => saveTables(this.tables()));
    this.followOtherTabs();
  }

  /** Applies one of the rules in `tables.ts` to all the mesas. */
  change(apply: (tables: Tables) => Tables): void {
    this.tables.update(apply);
  }

  /** Applies a change to one mesa. */
  changeTable(id: string, apply: (table: Table) => Table): void {
    this.tables.update((tables) => updateTable(tables, id, apply));
  }

  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== TABLES_KEY && event.key !== null) return;
      const tables = readTables(event.newValue);
      if (JSON.stringify(tables) !== JSON.stringify(this.tables())) this.tables.set(tables);
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
