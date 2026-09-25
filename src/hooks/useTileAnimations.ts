import { useLayoutEffect, useRef } from 'react';
import type { TileState } from '../logic/gameState';

/*
 * Tile animations use the Web Animations API (element.animate) rather than inline styles or
 * class toggling: it never writes to element.style, so it can't fight React's style prop, and
 * a one-shot animation restarts cleanly on the same element without forcing a reflow.
 *
 * pop / wiggle animate the individual `scale` / `rotate` properties, so they compose with the
 * `transform` used by FLIP and the fly-into animation instead of overwriting it.
 */

export const MERGE_MS = 260;

const POP_EASE = 'cubic-bezier(.22,1.4,.4,1)';
// Per-keyframe easing matches CSS @keyframes, where the timing function applies to each segment.
const POP: Keyframe[] = [
  { scale: 0.55, easing: POP_EASE },
  { scale: 1.16, offset: 0.6, easing: POP_EASE },
  { scale: 1 },
];
const WIGGLE: Keyframe[] = [
  [0, 0],
  [0.15, -7],
  [0.3, 7],
  [0.45, -5],
  [0.6, 5],
  [0.75, -2],
  [1, 0],
].map(([offset, deg]) => ({ offset, rotate: `${deg}deg`, easing: 'ease' }));

// CSS's prefers-reduced-motion rule only covers CSS animations, so check it here too.
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useTileAnimations(tiles: readonly TileState[], popId: number | null) {
  const els = useRef(new Map<number, HTMLElement>());
  const before = useRef<Map<number, DOMRect> | null>(null);

  // After React moves tiles: FLIP each one from its old spot, then pop the merged tile.
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    if (reducedMotion()) return;
    if (prev)
      for (const [id, el] of els.current) {
        const from = prev.get(id);
        if (!from) continue;
        const to = el.getBoundingClientRect();
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (!dx && !dy) continue;
        el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], {
          duration: 300,
          easing: 'cubic-bezier(.2,.9,.3,1)',
        });
      }
    if (popId !== null) els.current.get(popId)?.animate(POP, 420);
  }, [tiles, popId]);

  return {
    /** Callback ref for the tile with this id. */
    register: (id: number) => (el: HTMLElement | null) => {
      if (!el) return;
      els.current.set(id, el);
      return () => {
        els.current.delete(id);
      };
    },
    /** Snapshot tile positions right before a dispatch that moves tiles. */
    captureRects: () => {
      before.current = new Map(
        [...els.current].map(([id, el]) => [id, el.getBoundingClientRect()] as const)
      );
    },
    /** Shrink tile `fromId` into tile `intoId` and fade it out. It stays hidden until removed. */
    flyInto: (fromId: number, intoId: number) => {
      const a = els.current.get(fromId);
      const b = els.current.get(intoId);
      if (!a || !b) return;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      a.animate(
        [
          { zIndex: 5, transform: 'none', opacity: 1 },
          {
            zIndex: 5,
            transform: `translate(${rb.left - ra.left}px, ${rb.top - ra.top}px) scale(.4)`,
            opacity: 0,
          },
        ],
        { duration: reducedMotion() ? 0 : MERGE_MS, easing: 'ease-in', fill: 'forwards' }
      );
    },
    wiggle: (id: number) => {
      if (!reducedMotion()) els.current.get(id)?.animate(WIGGLE, 500);
    },
  };
}
