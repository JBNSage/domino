let count = 0;

/** An id no other entry on this device has, such as for a mesa or a saved team. */
export function newId(prefix: string): string {
  count += 1;
  return `${prefix}${Date.now()}-${count}`;
}
