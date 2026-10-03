import { FirebaseOptions, initializeApp } from 'firebase/app';
import { indexedDBLocalPersistence, initializeAuth, signInAnonymously } from 'firebase/auth';
import {
  DocumentData,
  DocumentReference,
  FieldPath,
  Firestore,
  WriteBatch,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocFromServer,
  getDocs,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import type {
  Invite,
  JoinFailure,
  LiveDoc,
  LiveWrites,
  MatchDoc,
  Member,
  MesaDoc,
} from '../game/cloud';

/**
 * The only file that talks to Firebase. It is loaded on demand, the first
 * time this phone shares or joins a mesa, so the app never carries it before.
 */

/** What one shared mesa's listeners report. */
export type MesaSink = {
  mesa: (doc: MesaDoc) => void;
  members: (members: Member[]) => void;
  matches: (matches: MatchDoc[]) => void;
  /** The live match, and whether that is what the server holds (not just an empty cache). */
  live: (live: LiveDoc | null, confirmed: boolean) => void;
  /** The mesa is gone, or this phone was taken out of it. */
  gone: () => void;
};

/** A batch holds at most 500 writes; this leaves room. */
const CHUNK = 400;

/** How long joining waits for the cloud before saying the phone is offline. */
const JOIN_WAIT_MS = 15000;

/** Refused by the rules. Checked by code: the SDK's error class is not always the one imported here. */
const denied = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: unknown }).code === 'permission-denied';

function toMember(id: string, data: DocumentData): Member {
  return {
    uid: id,
    name: typeof data['name'] === 'string' ? data['name'] : '',
    owner: data['owner'] === true,
    scores: data['scores'] === true,
    joinedAt: typeof data['joinedAt'] === 'number' ? data['joinedAt'] : 0,
  };
}

export class Backend {
  constructor(
    private readonly db: Firestore,
    readonly uid: string,
  ) {}

  private mesa(id: string): DocumentReference {
    return doc(this.db, 'mesas', id);
  }

  private member(id: string, uid: string): DocumentReference {
    return doc(this.db, 'mesas', id, 'members', uid);
  }

  private live(id: string): DocumentReference {
    return doc(this.db, 'mesas', id, 'live', 'board');
  }

  private invite(id: string): DocumentReference {
    return doc(this.db, 'mesas', id, 'private', 'invite');
  }

  /** Follows everything of one mesa. Returns the way to stop. */
  listen(id: string, sink: MesaSink): () => void {
    const mesa = this.mesa(id);
    const fail = (error: unknown) => {
      if (denied(error)) sink.gone();
      else console.warn('Mesa compartida', id, error);
    };
    const stops = [
      onSnapshot(
        mesa,
        (snap) => {
          if (snap.exists()) sink.mesa(snap.data() as MesaDoc);
          // Missing on the server, not just in the cache: it was removed.
          else if (!snap.metadata.fromCache) sink.gone();
        },
        fail,
      ),
      onSnapshot(
        collection(mesa, 'members'),
        (snap) => sink.members(snap.docs.map((each) => toMember(each.id, each.data()))),
        fail,
      ),
      onSnapshot(
        collection(mesa, 'matches'),
        (snap) => sink.matches(snap.docs.map((each) => each.data() as MatchDoc)),
        fail,
      ),
      onSnapshot(
        this.live(id),
        (snap) =>
          sink.live(
            snap.exists() ? (snap.data() as LiveDoc) : null,
            snap.exists() || !snap.metadata.fromCache,
          ),
        fail,
      ),
    ];
    return () => stops.forEach((stop) => stop());
  }

  /** The mesa's link code; only owners may read it, so others get null. */
  listenInvite(id: string, set: (token: string | null) => void): () => void {
    return onSnapshot(
      this.invite(id),
      (snap) => set(snap.exists() ? String(snap.data()['token'] ?? '') || null : null),
      () => set(null),
    );
  }

  async share(
    id: string,
    mesa: Omit<MesaDoc, 'createdBy' | 'createdAt'>,
    me: string,
    matches: MatchDoc[],
    live: LiveDoc | null,
    token: string,
  ): Promise<void> {
    const now = Date.now();
    const batch = writeBatch(this.db);
    batch.set(this.mesa(id), { ...mesa, createdBy: this.uid, createdAt: now });
    batch.set(this.member(id, this.uid), { name: me, owner: true, scores: true, joinedAt: now });
    batch.set(this.invite(id), { token });
    if (live !== null) batch.set(this.live(id), live);
    await batch.commit();
    for (let start = 0; start < matches.length; start += CHUNK) {
      const chunk = writeBatch(this.db);
      for (const match of matches.slice(start, start + CHUNK)) {
        chunk.set(doc(this.mesa(id), 'matches', match.id), match);
      }
      await chunk.commit();
    }
  }

  async join(invite: Invite, me: string): Promise<JoinFailure | null> {
    // The code goes where no member can read it, in the same batch as the member.
    const batch = writeBatch(this.db);
    batch.set(doc(this.mesa(invite.id), 'joins', this.uid), { token: invite.token });
    batch.set(this.member(invite.id, this.uid), {
      name: me,
      owner: false,
      scores: false,
      joinedAt: Date.now(),
    });
    const write = batch.commit();
    // A write waits for the server; without one, joining cannot be confirmed.
    const timeout = new Promise<'offline'>((resolve) =>
      setTimeout(() => resolve('offline'), JOIN_WAIT_MS),
    );
    try {
      return (await Promise.race([write.then(() => null), timeout])) ?? null;
    } catch (error) {
      if (!denied(error)) {
        console.warn('Unirse', error);
        return 'offline';
      }
      // Refused: perhaps because an earlier, slow join already landed. Only then is it checked.
      return (await this.isMember(invite.id)) ? null : 'refused';
    }
  }

  private async isMember(id: string): Promise<boolean> {
    try {
      return (await getDocFromServer(this.member(id, this.uid))).exists();
    } catch {
      return false;
    }
  }

  async leave(id: string): Promise<void> {
    await deleteDoc(this.member(id, this.uid)).catch(() => {});
  }

  /** Removes a mesa and everything in it; the owner's own place goes last. */
  async deleteMesa(id: string): Promise<void> {
    const mesa = this.mesa(id);
    const [matches, members, joins] = await Promise.all([
      getDocs(collection(mesa, 'matches')),
      getDocs(collection(mesa, 'members')),
      getDocs(collection(mesa, 'joins')),
    ]);
    const refs = [
      ...matches.docs.map((each) => each.ref),
      ...joins.docs.map((each) => each.ref),
      this.live(id),
      this.invite(id),
      ...members.docs.filter((each) => each.id !== this.uid).map((each) => each.ref),
    ];
    for (let start = 0; start < refs.length; start += CHUNK) {
      const batch: WriteBatch = writeBatch(this.db);
      for (const ref of refs.slice(start, start + CHUNK)) batch.delete(ref);
      await batch.commit();
    }
    await deleteDoc(mesa);
    await deleteDoc(this.member(id, this.uid));
  }

  writeMesa(id: string, mesa: Pick<MesaDoc, 'name' | 'players' | 'teams'>): Promise<void> {
    return updateDoc(this.mesa(id), mesa);
  }

  setRole(id: string, uid: string, role: Partial<Pick<Member, 'owner' | 'scores'>>): Promise<void> {
    return updateDoc(this.member(id, uid), role);
  }

  removeMember(id: string, uid: string): Promise<void> {
    return deleteDoc(this.member(id, uid));
  }

  rotateInvite(id: string, token: string): Promise<void> {
    return setDoc(this.invite(id), { token });
  }

  async renameMe(ids: readonly string[], name: string): Promise<void> {
    await Promise.all(ids.map((id) => updateDoc(this.member(id, this.uid), { name })));
  }

  addMatch(id: string, match: MatchDoc): Promise<void> {
    return setDoc(doc(this.mesa(id), 'matches', match.id), match);
  }

  removeMatch(id: string, matchId: string): Promise<void> {
    return deleteDoc(doc(this.mesa(id), 'matches', matchId));
  }

  setLive(id: string, live: LiveDoc): Promise<void> {
    return setDoc(this.live(id), live);
  }

  /** Writes only what changed, field by field, so hands from two phones never collide. */
  updateLive(id: string, writes: LiveWrites): Promise<void> {
    const pairs: unknown[] = [];
    for (const [key, value] of Object.entries(writes.fields)) pairs.push(key, value);
    for (const [row, value] of Object.entries(writes.rows)) {
      pairs.push(new FieldPath('rows', row), value ?? deleteField());
    }
    if (pairs.length === 0) return Promise.resolve();
    const [field, value, ...rest] = pairs;
    return updateDoc(this.live(id), field as string | FieldPath, value, ...rest);
  }
}

export async function connect(config: FirebaseOptions): Promise<Backend> {
  const app = initializeApp(config);
  const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  return new Backend(db, user.uid);
}
