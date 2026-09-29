/**
 * Keeps the screen on while the scoreboard is visible. The browser drops the
 * lock whenever the page is hidden, so it is requested again on return.
 * Returns a function that stops it.
 */
export function keepAwake(): () => void {
  if (!('wakeLock' in navigator)) return () => {};

  let lock: WakeLockSentinel | null = null;
  let stopped = false;

  const request = async () => {
    if (stopped || document.visibilityState !== 'visible') return;
    try {
      lock = await navigator.wakeLock.request('screen');
    } catch {
      // Refused on low battery or without permission; the app works without it.
    }
  };

  document.addEventListener('visibilitychange', request);
  request();

  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', request);
    lock?.release().catch(() => {});
  };
}
