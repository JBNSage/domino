import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { MESA_CLOUD } from './cloud';
import { fromShared, toMesaDoc } from './mesa-doc';
import { TABLES_KEY, loadTables, readTables, saveTables } from './storage';
import { Table, Tables, activeTable, updateTable } from './tables';

/** Where the id of a shared mesa in use is kept, since the mesa itself is not on this device. */
const SHARED_ACTIVE_KEY = 'domino/tables-active/v1';

function loadSharedActive(): string | null {
  try {
    return localStorage.getItem(SHARED_ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveSharedActive(id: string | null): void {
  try {
    if (id === null) localStorage.removeItem(SHARED_ACTIVE_KEY);
    else localStorage.setItem(SHARED_ACTIVE_KEY, id);
  } catch {
    // Without storage the shared mesa is chosen again after a restart.
  }
}

/**
 * The mesas: those kept on this device, and the shared ones, kept in the
 * cloud, that this device belongs to. Every rule in `tables.ts` applies to
 * both; a change to a shared mesa is written to the cloud, and only its owners
 * may make one.
 */
@Injectable({ providedIn: 'root' })
export class TablesStore {
  private readonly cloud = inject(MESA_CLOUD);
  private readonly local = signal<Tables>(loadTables());
  private readonly sharedActive = signal<string | null>(loadSharedActive());

  readonly tables = computed<Tables>(() => {
    const local = this.local();
    const uid = this.cloud.uid();
    const shared = [...this.cloud.mesas().values()]
      .map((mesa) => fromShared(mesa, uid))
      .filter((table): table is Table => table !== null);
    if (shared.length === 0 && this.sharedActive() === null) return local;
    const ids = new Set(shared.map((table) => table.id));
    return {
      tables: [...local.tables.filter((table) => !ids.has(table.id)), ...shared],
      active: local.active ?? (ids.has(this.sharedActive() ?? '') ? this.sharedActive() : null),
    };
  });
  readonly active = computed(() => activeTable(this.tables()));

  /** A shared mesa chosen on this phone that the cloud has not brought yet, or null. */
  readonly pendingShared = computed(() => {
    const id = this.sharedActive();
    if (id === null) return null;
    const mesa = this.cloud.mesas().get(id);
    return mesa !== undefined && mesa.doc === null ? id : null;
  });

  constructor() {
    effect(() => saveTables(this.local()));
    effect(() => saveSharedActive(this.sharedActive()));
    this.followOtherTabs();
  }

  /** Applies one of the rules in `tables.ts` to all the mesas. */
  change(apply: (tables: Tables) => Tables): void {
    const before = this.tables();
    const after = apply(before);
    if (after !== before) this.apply(before, after);
  }

  /** Applies a change to one mesa. */
  changeTable(id: string, apply: (table: Table) => Table): void {
    this.change((tables) => updateTable(tables, id, apply));
  }

  /** Puts the mesas back as they were, such as when a removal is undone. */
  restore(before: Tables): void {
    this.apply(this.tables(), before);
  }

  /** Puts a shared mesa in use before it has arrived, such as right after joining it. */
  useShared(id: string): void {
    this.local.update((tables) => (tables.active === null ? tables : { ...tables, active: null }));
    this.sharedActive.set(id);
  }

  /** Stops using a shared mesa that is gone. Returns whether it was the one in use. */
  releaseShared(id: string): boolean {
    if (this.sharedActive() !== id) return false;
    this.sharedActive.set(null);
    return true;
  }

  /** Takes a mesa off this device once it has moved to the cloud, where it is `cloudId`. */
  forgetLocal(id: string, cloudId: string): void {
    const wasActive = this.local().active === id;
    this.local.update((tables) => ({
      tables: tables.tables.filter((table) => table.id !== id),
      active: tables.active === id ? null : tables.active,
    }));
    if (wasActive) this.sharedActive.set(cloudId);
  }

  private apply(before: Tables, after: Tables): void {
    const shared = new Map(
      before.tables.filter((table) => table.shared).map((table) => [table.id, table]),
    );
    const local = after.tables.filter((table) => !shared.has(table.id) && !table.shared);
    for (const table of after.tables) {
      const was = shared.get(table.id);
      // A shared mesa changes in the cloud, and only when an owner changes it.
      if (was === undefined || was === table || !was.shared?.owner) continue;
      this.cloud.writeMesa(table.id, toMesaDoc(table, was.shared.members));
    }
    const active = after.active;
    const activeShared = active !== null && shared.has(active);
    this.local.set({ tables: local, active: activeShared ? null : active });
    this.sharedActive.set(activeShared ? active : null);
  }

  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === SHARED_ACTIVE_KEY) {
        if (event.newValue !== this.sharedActive()) this.sharedActive.set(event.newValue);
        return;
      }
      if (event.key !== TABLES_KEY && event.key !== null) return;
      const tables = readTables(event.newValue);
      if (JSON.stringify(tables) !== JSON.stringify(this.local())) this.local.set(tables);
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
