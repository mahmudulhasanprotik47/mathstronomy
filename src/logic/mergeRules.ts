import type { PlanetKey } from '../data/planets';

/** Result of merging `first` (tapped first) into `second`, or null if the pair can't merge. */
export function mergeResult(key: PlanetKey, first: number, second: number): number | null {
  switch (key) {
    case 'add':
      return first + second;
    case 'mul':
      return first * second;
    case 'sub':
      // bigger first, never negative, never zero
      return first > second ? first - second : null;
    case 'div': {
      // order-free, must divide evenly
      const hi = Math.max(first, second);
      const lo = Math.min(first, second);
      return lo > 0 && hi % lo === 0 ? hi / lo : null;
    }
    default: {
      const unknownKey: never = key;
      throw new Error(`Unknown planet: ${String(unknownKey)}`);
    }
  }
}

/** True if any ordered pair of tiles can merge. Both orders matter because sub is order-dependent. */
export function hasAnyValidMove(key: PlanetKey, values: readonly number[]): boolean {
  for (let i = 0; i < values.length; i++)
    for (let j = 0; j < values.length; j++) {
      if (i === j) continue;
      if (mergeResult(key, values[i], values[j]) !== null) return true;
    }
  return false;
}
