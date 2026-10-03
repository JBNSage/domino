import { Injectable, signal } from '@angular/core';

import {
  Invite,
  JoinFailure,
  LiveDoc,
  LiveWrites,
  LostMesa,
  MatchDoc,
  Member,
  MesaCloud,
  MesaDoc,
  SharedMesa,
} from './cloud';

/**
 * Shared mesas in memory, for specs: every change lands at once, as Firestore's
 * own cache shows it. `fromOtherPhone` plays someone else at the mesa, and
 * `invites` holds the mesas a link can join.
 */
@Injectable()
export class FakeMesaCloud implements MesaCloud {
  readonly uid = signal<string | null>('me');
  readonly mesas = signal<ReadonlyMap<string, SharedMesa>>(new Map());
  readonly lost = signal<LostMesa | null>(null);

  /** Mesas on other phones that a link could join, by id. */
  readonly invites = new Map<string, { mesa: SharedMesa; token: string }>();
  /** Writes made, in order, for specs that check what reached the cloud. */
  readonly writes: string[] = [];
  /** Set to make joining fail. */
  joinFailure: JoinFailure | null = null;

  /** Counts the times sharing was prepared ahead, for specs. */
  warmUps = 0;

  warmUp(): void {
    this.warmUps += 1;
  }

  async signIn(): Promise<string> {
    return 'me';
  }

  async share(
    id: string,
    doc: Omit<MesaDoc, 'createdBy' | 'createdAt'>,
    me: string,
    matches: MatchDoc[],
    live: LiveDoc | null,
    token: string,
  ): Promise<void> {
    this.writes.push(`share ${id}`);
    const member: Member = { uid: 'me', name: me, owner: true, scores: true, joinedAt: 0 };
    this.set({
      id,
      doc: { ...doc, createdBy: 'me', createdAt: 0 },
      members: [member],
      matches,
      live,
      liveLoaded: true,
      invite: token,
    });
  }

  async join(invite: Invite, me: string): Promise<JoinFailure | null> {
    if (this.joinFailure !== null) return this.joinFailure;
    const found = this.invites.get(invite.id);
    if (found === undefined || found.token !== invite.token) return 'refused';
    const member: Member = { uid: 'me', name: me, owner: false, scores: false, joinedAt: 1 };
    this.set({
      ...found.mesa,
      members: [...found.mesa.members, member],
      liveLoaded: true,
      invite: null,
    });
    return null;
  }

  async leave(id: string): Promise<void> {
    this.writes.push(`leave ${id}`);
    this.drop(id);
  }

  async deleteMesa(id: string): Promise<void> {
    this.writes.push(`delete ${id}`);
    this.drop(id);
  }

  writeMesa(id: string, doc: Pick<MesaDoc, 'name' | 'players' | 'teams'>): void {
    this.writes.push(`mesa ${id}`);
    this.patch(id, (mesa) =>
      mesa.doc === null ? mesa : { ...mesa, doc: { ...mesa.doc, ...doc } },
    );
  }

  setRole(id: string, uid: string, role: Partial<Pick<Member, 'owner' | 'scores'>>): void {
    this.writes.push(`role ${id} ${uid}`);
    this.patch(id, (mesa) => ({
      ...mesa,
      members: mesa.members.map((member) => (member.uid === uid ? { ...member, ...role } : member)),
    }));
  }

  removeMember(id: string, uid: string): void {
    this.writes.push(`remove ${id} ${uid}`);
    this.patch(id, (mesa) => ({
      ...mesa,
      members: mesa.members.filter((member) => member.uid !== uid),
    }));
  }

  rotateInvite(id: string, token: string): void {
    this.writes.push(`invite ${id}`);
    this.patch(id, (mesa) => ({ ...mesa, invite: token }));
  }

  renameMe(name: string): void {
    for (const id of this.mesas().keys()) {
      this.patch(id, (mesa) => ({
        ...mesa,
        members: mesa.members.map((member) => (member.uid === 'me' ? { ...member, name } : member)),
      }));
    }
  }

  addMatch(id: string, match: MatchDoc): void {
    this.writes.push(`match ${id} ${match.id}`);
    this.patch(id, (mesa) => ({
      ...mesa,
      matches: [...mesa.matches.filter((each) => each.id !== match.id), match],
    }));
  }

  removeMatch(id: string, matchId: string): void {
    this.writes.push(`unmatch ${id} ${matchId}`);
    this.patch(id, (mesa) => ({
      ...mesa,
      matches: mesa.matches.filter((each) => each.id !== matchId),
    }));
  }

  setLive(id: string, live: LiveDoc): void {
    this.writes.push(`live ${id}`);
    this.patch(id, (mesa) => ({ ...mesa, live, liveLoaded: true }));
  }

  updateLive(id: string, writes: LiveWrites): void {
    this.writes.push(`board ${id}`);
    this.patch(id, (mesa) => applyLive(mesa, writes));
  }

  /** Someone else at the mesa changes it, as a snapshot from the cloud would bring. */
  fromOtherPhone(id: string, change: (mesa: SharedMesa) => SharedMesa): void {
    this.patch(id, change);
  }

  /** An owner on another phone deletes the mesa, or takes this phone out of it. */
  loseFromOtherPhone(id: string, why: LostMesa['why']): void {
    const name = this.mesas().get(id)?.doc?.name;
    this.drop(id);
    if (name !== undefined) this.lost.set({ id, name, why });
  }

  /** Forgets a mesa quietly, as leaving or deleting it from this phone does. */
  drop(id: string): void {
    this.mesas.update((mesas) => {
      const next = new Map(mesas);
      next.delete(id);
      return next;
    });
  }

  private set(mesa: SharedMesa): void {
    this.mesas.update((mesas) => new Map(mesas).set(mesa.id, mesa));
  }

  private patch(id: string, change: (mesa: SharedMesa) => SharedMesa): void {
    const mesa = this.mesas().get(id);
    if (mesa !== undefined) this.set(change(mesa));
  }
}

/** A live write applied to a mesa's live match, as Firestore merges field paths. */
export function applyLive(mesa: SharedMesa, writes: LiveWrites): SharedMesa {
  if (mesa.live === null) return mesa;
  const rows = { ...mesa.live.rows };
  for (const [row, value] of Object.entries(writes.rows)) {
    if (value === null) delete rows[row];
    else rows[row] = value;
  }
  return { ...mesa, live: { ...mesa.live, ...writes.fields, rows } };
}
