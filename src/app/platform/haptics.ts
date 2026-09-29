/** Vibrates where the browser can. iOS has no vibration on the web, so it stays silent there. */
function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Some browsers throw before the first user gesture.
  }
}

export const haptics = {
  tap: () => vibrate(15),
  win: () => vibrate([30, 60, 30, 60, 80]),
};
