export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** The exponential ease-out of `--ease-out`, for the Web Animations API. */
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Plays an animation where the browser can and the reader has not asked for less motion. */
export function play(
  element: Element | null | undefined,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  if (!element || prefersReducedMotion() || typeof element.animate !== 'function') return null;
  return element.animate(keyframes, { easing: EASE_OUT, ...options });
}

/**
 * Counts a number up in a text node, on the same ease-out curve. Returns a
 * stop, which leaves the text as it is for the caller to set.
 */
export function roll(
  text: Text,
  from: number,
  to: number,
  duration: number,
  delay = 0,
  done?: () => void,
): () => void {
  const final = String(to);
  if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function' || from === to) {
    text.data = final;
    done?.();
    return () => undefined;
  }
  let frame = 0;
  let start: number | null = null;
  text.data = String(from);
  const step = (now: number) => {
    start ??= now + delay;
    const progress = Math.min(1, Math.max(0, (now - start) / duration));
    // 1 - 2^(-10t): fast at first, settling on the value.
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    text.data = String(Math.round(from + (to - from) * eased));
    if (progress < 1) frame = requestAnimationFrame(step);
    else done?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

/**
 * Throws small leaning bars out of the middle of `host`, which fall away and
 * are removed. The host must be positioned; the bars never take a tap.
 */
export function burst(host: HTMLElement, colours: string[], count: number): void {
  if (prefersReducedMotion() || typeof host.animate !== 'function') return;
  const width = host.clientWidth;
  const height = host.clientHeight;
  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement('span');
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.4;
    const reach = 0.55 + Math.random() * 0.6;
    const x = Math.cos(angle) * width * 0.7 * reach;
    const y = Math.sin(angle) * height * 1.6 * reach - height * 0.4;
    const size = 10 + Math.random() * 16;
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${size * 0.42}px;margin:${-size * 0.21}px 0 0 ${-size / 2}px;background:${colours[index % colours.length]};transform:skewX(-12deg);pointer-events:none;z-index:1;`;
    host.append(bar);
    const spin = (Math.random() - 0.5) * 540;
    bar
      .animate(
        [
          { transform: 'translate(0, 0) skewX(-12deg) rotate(0deg) scale(0.4)', opacity: 1 },
          {
            transform: `translate(${x}px, ${y}px) skewX(-12deg) rotate(${spin / 2}deg) scale(1)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translate(${x * 1.15}px, ${y + height * 0.9}px) skewX(-12deg) rotate(${spin}deg) scale(0.8)`,
            opacity: 0,
          },
        ],
        {
          duration: 1100 + Math.random() * 300,
          delay: Math.random() * 80,
          easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)',
          fill: 'backwards',
        },
      )
      .finished.catch(() => undefined)
      .finally(() => bar.remove());
  }
}
