/**
 * Records on the root element whether the last input was touch or the
 * keyboard. Focus stays where a screen reader needs it; the ring is only
 * drawn for the keyboard. Returns a function that stops it.
 */
export function followModality(): () => void {
  const root = document.documentElement;
  // A screen can open by itself on launch, before anything was touched.
  if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) {
    root.dataset['input'] = 'touch';
  }
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') root.dataset['input'] = 'touch';
  };
  const onKey = (event: KeyboardEvent) => {
    // Typing digits on a phone's keyboard is not keyboard navigation.
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) root.dataset['input'] = 'keyboard';
  };

  document.addEventListener('pointerdown', onPointer, true);
  document.addEventListener('keydown', onKey, true);
  return () => {
    document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('keydown', onKey, true);
  };
}
