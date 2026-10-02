import { Invite } from './cloud';

/** The part of the address that says a link is an invitation to a mesa. */
const ROUTE = 'unirse';

/**
 * The link that lets someone join a mesa: the app's own address, and after a
 * `#` the mesa, its code and its name, so the join screen can name the mesa
 * before the person is let in to read it.
 */
export function buildInvite(base: string, invite: Invite): string {
  const params = new URLSearchParams({ m: invite.id, k: invite.token, n: invite.name });
  return `${base.split('#')[0]}#${ROUTE}?${params.toString()}`;
}

/** The invitation a link carries, or null when the address is not one. */
export function parseInvite(hash: string): Invite | null {
  const text = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!text.startsWith(`${ROUTE}?`)) return null;
  const params = new URLSearchParams(text.slice(ROUTE.length + 1));
  const id = params.get('m')?.trim() ?? '';
  const token = params.get('k')?.trim() ?? '';
  const name = params.get('n')?.trim() ?? '';
  if (id === '' || token === '' || /[/\s]/.test(id)) return null;
  return { id, token, name };
}
