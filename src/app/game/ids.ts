let count = 0;

/**
 * An id no other entry has, such as for a mesa, a saved team or a hand. The
 * random tail keeps two phones sharing a mesa from making the same one.
 */
export function newId(prefix: string): string {
  count += 1;
  const tail = Math.random().toString(36).slice(2, 6).padEnd(4, '0');
  return `${prefix}${Date.now()}-${count}${tail}`;
}

/** A code that cannot be guessed, for the link that lets someone join a mesa. */
export function newToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
}
