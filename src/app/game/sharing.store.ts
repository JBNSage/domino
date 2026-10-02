import { Injectable, effect, inject, untracked } from '@angular/core';

import { Invite, JoinFailure, MESA_CLOUD, Member } from './cloud';
import { GameStore } from './game.store';
import { HistoryStore } from './history.store';
import { newId, newToken } from './ids';
import { buildInvite } from './invite';
import { MeStore } from './me.store';
import { toLiveDoc, toMatchDoc, toMesaDoc } from './mesa-doc';
import { sameName } from './state';
import { setActive } from './tables';
import { TablesStore } from './tables.store';

/**
 * Sharing a mesa and everything around it: moving it to the cloud, the link,
 * joining by it, leaving, the owners' say over who is in and what they may do,
 * and removing the mesa for everyone.
 */
@Injectable({ providedIn: 'root' })
export class SharingStore {
  private readonly cloud = inject(MESA_CLOUD);
  private readonly tables = inject(TablesStore);
  private readonly history = inject(HistoryStore);
  private readonly game = inject(GameStore);
  private readonly me = inject(MeStore);

  constructor() {
    // A new name reaches every shared mesa this phone is in.
    let first = true;
    effect(() => {
      const name = this.me.name();
      if (first) {
        first = false;
        return;
      }
      untracked(() => this.cloud.renameMe(name));
    });
  }

  /** Whether this phone already belongs to a shared mesa. */
  isMember(id: string): boolean {
    return this.cloud.mesas().has(id);
  }

  /**
   * Moves a mesa to the cloud with this phone as its owner: its players, saved
   * teams, the matches played there and, if it is in use, the match under way.
   * Returns whether it worked; if not, nothing has moved.
   */
  /** Returns the shared mesa's id, which is not the one it had on the phone, or null. */
  async share(id: string): Promise<string | null> {
    const table = this.tables.tables().tables.find((each) => each.id === id && !each.shared);
    if (table === undefined) return null;
    // Sharing needs the cloud to answer; offline it would hang and leave things half moved.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;

    // Signed in first, so this phone's person is a member, not a name, in all that moves.
    let uid: string;
    try {
      uid = await this.cloud.signIn();
    } catch (error) {
      console.warn('Compartir mesa', error);
      return null;
    }
    const name = this.me.name();
    const me: Member = { uid, name, owner: true, scores: true, joinedAt: Date.now() };

    // A new id in the cloud for every attempt, so one that half failed never blocks the next.
    const cloudId = newId('m');
    const kept = this.history.localOf(
      (match) =>
        match.tableId === id ||
        (match.tableId === null && match.table !== null && sameName(match.table, table.name)),
    );
    const matches = kept.map((match) =>
      toMatchDoc({ ...match, table: table.name, tableId: cloudId }, [me]),
    );
    const inUse = this.tables.active()?.id === id && this.game.tournament() === null;
    const live = inUse ? toLiveDoc(this.game.state(), newId('x'), [me], uid, Date.now()) : null;

    try {
      await this.cloud.share(cloudId, toMesaDoc(table, [me]), name, matches, live, newToken());
    } catch (error) {
      // Nothing has left the phone: the mesa and its matches are as they were.
      console.warn('Compartir mesa', error);
      return null;
    }
    // Everything landed: only now does the phone let go of its own copy.
    this.history.dropLocal(kept.map((match) => match.id));
    this.tables.forgetLocal(id, cloudId);
    return cloudId;
  }

  /** Joins a mesa by its link and puts it in use; owners decide later who may score. */
  async join(invite: Invite): Promise<JoinFailure | null> {
    if (!this.isMember(invite.id)) {
      const failure = await this.cloud.join(invite, this.me.name());
      if (failure !== null) return failure;
    }
    this.tables.useShared(invite.id);
    return null;
  }

  /** Leaves a shared mesa; it stays in the cloud for the others. */
  async leave(id: string): Promise<void> {
    if (this.tables.active()?.id === id) this.tables.change((tables) => setActive(tables, null));
    await this.cloud.leave(id);
  }

  /** Removes a shared mesa for everyone. Only owners can. */
  async deleteMesa(id: string): Promise<boolean> {
    if (!this.ownerOf(id)) return false;
    if (this.tables.active()?.id === id) this.tables.change((tables) => setActive(tables, null));
    try {
      await this.cloud.deleteMesa(id);
      return true;
    } catch (error) {
      console.warn('Eliminar mesa', error);
      return false;
    }
  }

  setRole(id: string, uid: string, role: Partial<Pick<Member, 'owner' | 'scores'>>): void {
    if (this.ownerOf(id) && uid !== this.cloud.uid()) this.cloud.setRole(id, uid, role);
  }

  removeMember(id: string, uid: string): void {
    if (this.ownerOf(id) && uid !== this.cloud.uid()) this.cloud.removeMember(id, uid);
  }

  /** A new link; the old one stops letting anyone in. */
  newLink(id: string): void {
    if (this.ownerOf(id)) this.cloud.rotateInvite(id, newToken());
  }

  /** The link that lets someone join, or null while it is not known (or not an owner). */
  link(id: string): string | null {
    const table = this.tables.tables().tables.find((each) => each.id === id);
    const token = table?.shared?.invite ?? null;
    if (table === undefined || token === null) return null;
    return buildInvite(document.baseURI, { id, token, name: table.name });
  }

  private ownerOf(id: string): boolean {
    return this.tables.tables().tables.some((table) => table.id === id && table.shared?.owner);
  }
}
