import { InjectionToken, Signal, inject } from '@angular/core';

import { FirestoreMesaCloud } from '../platform/cloud';
import { MatchRecord, RecordedTeam } from './history';
import { Between, Team, TeamId } from './state';
import { SavedTeam } from './tables';

/**
 * A shared mesa as it is kept in the cloud, and the one door the stores use to
 * reach it. Nothing here loads the Firebase SDK: `platform/firebase.ts` does,
 * on demand.
 */

/** A person at a shared mesa: their own name, and what the owners let them do. */
export type Member = {
  uid: string;
  name: string;
  owner: boolean;
  /** Whether they may add points to the match being played. Owners always may. */
  scores: boolean;
  joinedAt: number;
};

/** Which member each player of a pair is, so a renamed member is renamed everywhere. */
export type PlayerIds = [string | null, string | null];

export type TeamDoc = SavedTeam & { playerIds: PlayerIds | null };

/** The mesa itself: its name, the players written by hand and its saved teams. */
export type MesaDoc = {
  name: string;
  /** Players written by hand; members are players too, by their own name. */
  players: string[];
  teams: TeamDoc[];
  createdBy: string;
  createdAt: number;
};

export type RecordedTeamDoc = RecordedTeam & { playerIds: PlayerIds | null };

/** A finished match of the mesa; which mesa is implied by where it is kept. */
export type MatchDoc = Omit<MatchRecord, 'table' | 'tableId' | 'teams'> & {
  teams: Record<TeamId, RecordedTeamDoc>;
};

/** One hand of the live match. Hands are ordered by when they were played, then by id. */
export type LiveRow = { team: TeamId; points: number; at: number; by: string };

export type LiveTeam = Team & { playerIds: PlayerIds | null };

/**
 * The match being played at the mesa. Hands are a map keyed by id, so two
 * phones adding hands at once, even offline, never overwrite each other.
 */
export type LiveDoc = {
  /** The id the match will have once it is finished, the same on every phone. */
  matchId: string;
  teams: Record<TeamId, LiveTeam>;
  target: number;
  quickValue: number;
  between: Between | null;
  rows: Record<string, LiveRow>;
};

/** A change to the live match: fields to set, and hands to set or (null) remove. */
export type LiveWrites = {
  fields: Partial<Omit<LiveDoc, 'rows'>>;
  rows: Record<string, LiveRow | null>;
};

/** Everything this phone can see of one shared mesa. */
export type SharedMesa = {
  id: string;
  /** Null until the first read arrives. */
  doc: MesaDoc | null;
  members: Member[];
  matches: MatchDoc[];
  live: LiveDoc | null;
  /**
   * Whether `live` has been read: a mesa whose live match has not arrived yet
   * is not a mesa without one, and must not be given a new one.
   */
  liveLoaded: boolean;
  /** The code in the mesa's link; only owners can read it. */
  invite: string | null;
};

/** What a link to a mesa carries. */
export type Invite = { id: string; token: string; name: string };

/** A shared mesa this phone lost from elsewhere: an owner deleted it, or took this phone out. */
export type LostMesa = { id: string; name: string; why: 'deleted' | 'removed' };

/** Why joining did not happen. */
export type JoinFailure = 'offline' | 'refused';

export interface MesaCloud {
  /** This phone's account, once signed in. */
  readonly uid: Signal<string | null>;
  /** Every shared mesa this phone belongs to, kept up to date. */
  readonly mesas: Signal<ReadonlyMap<string, SharedMesa>>;
  /**
   * The last mesa taken away by someone else, so the person can be told.
   * Leaving or deleting from this phone never sets it.
   */
  readonly lost: Signal<LostMesa | null>;

  /**
   * Loads what sharing needs and signs in, ahead of time, such as while the
   * join screen is read, so the step itself only writes. Never fails.
   */
  warmUp(): void;
  /** Signs this phone in, once, and returns its account. Needs the network the first time. */
  signIn(): Promise<string>;
  /** Moves a mesa to the cloud, with this phone as its first owner. */
  share(
    id: string,
    doc: Omit<MesaDoc, 'createdBy' | 'createdAt'>,
    me: string,
    matches: MatchDoc[],
    live: LiveDoc | null,
    token: string,
  ): Promise<void>;
  /** Joins by link; the owners decide later what the new member may do. */
  join(invite: Invite, me: string): Promise<JoinFailure | null>;
  /** Leaves a mesa, or forgets one this phone was removed from. */
  leave(id: string): Promise<void>;
  /** Removes a mesa for everyone. */
  deleteMesa(id: string): Promise<void>;

  writeMesa(id: string, doc: Pick<MesaDoc, 'name' | 'players' | 'teams'>): void;
  setRole(id: string, uid: string, role: Partial<Pick<Member, 'owner' | 'scores'>>): void;
  removeMember(id: string, uid: string): void;
  rotateInvite(id: string, token: string): void;
  renameMe(name: string): void;
  addMatch(id: string, match: MatchDoc): void;
  removeMatch(id: string, matchId: string): void;
  setLive(id: string, live: LiveDoc): void;
  updateLive(id: string, writes: LiveWrites): void;
}

export const MESA_CLOUD = new InjectionToken<MesaCloud>('MesaCloud', {
  providedIn: 'root',
  factory: () => inject(FirestoreMesaCloud),
});
