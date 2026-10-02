import { Injectable, computed, effect, signal } from '@angular/core';

import type {
  Invite,
  JoinFailure,
  LiveDoc,
  LiveWrites,
  MatchDoc,
  Member,
  MesaCloud,
  MesaDoc,
  SharedMesa,
} from '../game/cloud';
import type { Backend } from './firebase';
import { firebaseConfig } from './firebase.config';

/** What this phone keeps about the cloud: its account and the mesas it is in. */
type Marker = { uid: string | null; mesas: string[] };

const MARKER_KEY = 'domino/cloud/v1';

function loadMarker(): Marker {
  try {
    const raw = JSON.parse(localStorage.getItem(MARKER_KEY) ?? 'null') as unknown;
    if (typeof raw !== 'object' || raw === null) return { uid: null, mesas: [] };
    const { uid, mesas } = raw as Record<string, unknown>;
    return {
      uid: typeof uid === 'string' ? uid : null,
      mesas: Array.isArray(mesas) ? mesas.filter((id): id is string => typeof id === 'string') : [],
    };
  } catch {
    return { uid: null, mesas: [] };
  }
}

function saveMarker(marker: Marker): void {
  try {
    if (marker.uid === null && marker.mesas.length === 0) localStorage.removeItem(MARKER_KEY);
    else localStorage.setItem(MARKER_KEY, JSON.stringify(marker));
  } catch {
    // Without storage the phone forgets its mesas on restart, which re-joining fixes.
  }
}

const empty = (id: string): SharedMesa => ({
  id,
  doc: null,
  members: [],
  matches: [],
  live: null,
  liveLoaded: false,
  invite: null,
});

/**
 * Shared mesas through Firebase. The SDK is only loaded once this phone has
 * shared or joined a mesa; until then nothing here touches the network.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreMesaCloud implements MesaCloud {
  private readonly marker = signal(loadMarker());
  readonly uid = computed(() => this.marker().uid);
  readonly mesas = signal<ReadonlyMap<string, SharedMesa>>(new Map());

  private backend: Promise<Backend> | null = null;
  private readonly stops = new Map<string, () => void>();
  private readonly inviteStops = new Map<string, () => void>();

  constructor() {
    effect(() => saveMarker(this.marker()));
    const known = this.marker().mesas;
    if (known.length > 0) {
      this.mesas.set(new Map(known.map((id) => [id, empty(id)])));
      this.ready()
        .then(() => known.forEach((id) => this.listen(id)))
        .catch((error: unknown) => console.warn('Mesas compartidas', error));
    }
  }

  async signIn(): Promise<string> {
    return (await this.ready()).uid;
  }

  async share(
    id: string,
    doc: Omit<MesaDoc, 'createdBy' | 'createdAt'>,
    me: string,
    matches: MatchDoc[],
    live: LiveDoc | null,
    token: string,
  ): Promise<void> {
    const backend = await this.ready();
    await backend.share(id, doc, me, matches, live, token);
    // Shown at once, as it was written; the cloud's own copy follows.
    const member: Member = {
      uid: backend.uid,
      name: me,
      owner: true,
      scores: true,
      joinedAt: Date.now(),
    };
    this.mesas.update((mesas) =>
      new Map(mesas).set(id, {
        id,
        doc: { ...doc, createdBy: backend.uid, createdAt: Date.now() },
        members: [member],
        matches,
        live,
        liveLoaded: true,
        invite: token,
      }),
    );
    this.remember(id);
  }

  async join(invite: Invite, me: string): Promise<JoinFailure | null> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
    let backend: Backend;
    try {
      backend = await this.ready();
    } catch {
      return 'offline';
    }
    const failure = await backend.join(invite, me);
    if (failure === null) this.remember(invite.id);
    return failure;
  }

  async leave(id: string): Promise<void> {
    this.forget(id);
    const backend = await this.ready();
    await backend.leave(id);
  }

  async deleteMesa(id: string): Promise<void> {
    const backend = await this.ready();
    await backend.deleteMesa(id);
    this.forget(id);
  }

  writeMesa(id: string, doc: Pick<MesaDoc, 'name' | 'players' | 'teams'>): void {
    this.patch(id, (mesa) =>
      mesa.doc === null ? mesa : { ...mesa, doc: { ...mesa.doc, ...doc } },
    );
    this.run((backend) => backend.writeMesa(id, doc));
  }

  setRole(id: string, uid: string, role: Partial<Pick<Member, 'owner' | 'scores'>>): void {
    this.patch(id, (mesa) => ({
      ...mesa,
      members: mesa.members.map((member) => (member.uid === uid ? { ...member, ...role } : member)),
    }));
    this.run((backend) => backend.setRole(id, uid, role));
  }

  removeMember(id: string, uid: string): void {
    this.patch(id, (mesa) => ({
      ...mesa,
      members: mesa.members.filter((member) => member.uid !== uid),
    }));
    this.run((backend) => backend.removeMember(id, uid));
  }

  rotateInvite(id: string, token: string): void {
    this.patch(id, (mesa) => ({ ...mesa, invite: token }));
    this.run((backend) => backend.rotateInvite(id, token));
  }

  renameMe(name: string): void {
    const uid = this.uid();
    const ids = this.marker().mesas;
    if (uid === null || ids.length === 0) return;
    for (const id of ids) {
      this.patch(id, (mesa) => ({
        ...mesa,
        members: mesa.members.map((member) => (member.uid === uid ? { ...member, name } : member)),
      }));
    }
    this.run((backend) => backend.renameMe(ids, name));
  }

  addMatch(id: string, match: MatchDoc): void {
    this.patch(id, (mesa) => ({
      ...mesa,
      matches: [...mesa.matches.filter((each) => each.id !== match.id), match],
    }));
    this.run((backend) => backend.addMatch(id, match));
  }

  removeMatch(id: string, matchId: string): void {
    this.patch(id, (mesa) => ({
      ...mesa,
      matches: mesa.matches.filter((each) => each.id !== matchId),
    }));
    this.run((backend) => backend.removeMatch(id, matchId));
  }

  setLive(id: string, live: LiveDoc): void {
    this.patch(id, (mesa) => ({ ...mesa, live, liveLoaded: true }));
    this.run((backend) => backend.setLive(id, live));
  }

  updateLive(id: string, writes: LiveWrites): void {
    this.patch(id, (mesa) => {
      if (mesa.live === null) return mesa;
      const rows = { ...mesa.live.rows };
      for (const [row, value] of Object.entries(writes.rows)) {
        if (value === null) delete rows[row];
        else rows[row] = value;
      }
      return { ...mesa, live: { ...mesa.live, ...writes.fields, rows } };
    });
    this.run((backend) => backend.updateLive(id, writes));
  }

  /** Loads Firebase and signs in, once. A failure lets the next call try again. */
  private ready(): Promise<Backend> {
    if (this.backend === null) {
      const config = firebaseConfig;
      this.backend =
        config === null
          ? Promise.reject(new Error('Firebase no está configurado (platform/firebase.config.ts).'))
          : import('./firebase').then((module) => module.connect(config));
      this.backend
        .then((backend) => this.marker.update((marker) => ({ ...marker, uid: backend.uid })))
        .catch(() => (this.backend = null));
    }
    return this.backend;
  }

  /** A write in the background: the cloud keeps it while offline and sends it later. */
  private run(write: (backend: Backend) => Promise<void>): void {
    this.ready()
      .then(write)
      .catch((error: unknown) => console.warn('Mesa compartida', error));
  }

  /** Shows a change at once; the cloud's own copy follows. */
  private patch(id: string, change: (mesa: SharedMesa) => SharedMesa): void {
    const mesa = this.mesas().get(id);
    if (mesa === undefined) return;
    this.mesas.update((mesas) => new Map(mesas).set(id, change(mesa)));
  }

  private remember(id: string): void {
    this.marker.update((marker) =>
      marker.mesas.includes(id) ? marker : { ...marker, mesas: [...marker.mesas, id] },
    );
    if (!this.mesas().has(id)) this.mesas.update((mesas) => new Map(mesas).set(id, empty(id)));
    this.listen(id);
  }

  private forget(id: string): void {
    this.stops.get(id)?.();
    this.stops.delete(id);
    this.inviteStops.get(id)?.();
    this.inviteStops.delete(id);
    this.marker.update((marker) => ({
      ...marker,
      mesas: marker.mesas.filter((each) => each !== id),
    }));
    this.mesas.update((mesas) => {
      const next = new Map(mesas);
      next.delete(id);
      return next;
    });
  }

  private listen(id: string): void {
    if (this.stops.has(id)) return;
    void this.ready().then((backend) => {
      if (this.stops.has(id) || !this.marker().mesas.includes(id)) return;
      this.stops.set(
        id,
        backend.listen(id, {
          mesa: (doc) => this.patch(id, (mesa) => ({ ...mesa, doc })),
          members: (members) => {
            this.patch(id, (mesa) => ({ ...mesa, members }));
            this.followInvite(backend, id);
          },
          matches: (matches) => this.patch(id, (mesa) => ({ ...mesa, matches })),
          live: (live, confirmed) =>
            this.patch(id, (mesa) => ({ ...mesa, live, liveLoaded: mesa.liveLoaded || confirmed })),
          gone: () => this.forget(id),
        }),
      );
    });
  }

  /** The link code is read only while this phone owns the mesa. */
  private followInvite(backend: Backend, id: string): void {
    const owner =
      this.mesas()
        .get(id)
        ?.members.some((member) => member.uid === backend.uid && member.owner) ?? false;
    const following = this.inviteStops.has(id);
    if (owner && !following) {
      this.inviteStops.set(
        id,
        backend.listenInvite(id, (token) => this.patch(id, (mesa) => ({ ...mesa, invite: token }))),
      );
    } else if (!owner && following) {
      this.inviteStops.get(id)?.();
      this.inviteStops.delete(id);
      this.patch(id, (mesa) => ({ ...mesa, invite: null }));
    }
  }
}
