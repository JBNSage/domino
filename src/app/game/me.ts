import { cleanLabel } from './state';

/** The person using this phone, as other phones at a shared mesa see them. */
export type Profile = { name: string };

/** A name picked from `names`, so nobody starts as an empty field. */
export function randomName(names: readonly string[], random: () => number = Math.random): string {
  const index = Math.min(names.length - 1, Math.floor(random() * names.length));
  return names[index] ?? '';
}

/** Validates a saved profile; anything malformed yields null so a new name is made. */
export function parseProfile(value: unknown): Profile | null {
  if (typeof value !== 'object' || value === null) return null;
  const name = (value as Record<string, unknown>)['name'];
  if (typeof name !== 'string') return null;
  const clean = cleanLabel(name, '');
  return clean === '' ? null : { name: clean };
}
