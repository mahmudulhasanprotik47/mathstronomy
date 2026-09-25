import { describe, expect, it } from 'vitest';
import { LEVEL_COUNT, LEVELS } from '../data/levels';
import { PLANETS, type PlanetKey } from '../data/planets';
import { generateLevel } from './generateLevel';
import { mergeResult } from './mergeRules';

const RUNS = 20;

/** Brute force: can `target` be made from `tiles` in at most `moves` merges? */
function solvable(key: PlanetKey, tiles: number[], target: number, moves: number): boolean {
  if (moves === 0) return false;
  for (let i = 0; i < tiles.length; i++)
    for (let j = 0; j < tiles.length; j++) {
      if (i === j) continue;
      const r = mergeResult(key, tiles[i], tiles[j]);
      if (r === null) continue;
      if (r === target) return true;
      const next = tiles.map((v, k) => (k === j ? r : v)).filter((_, k) => k !== i);
      if (solvable(key, next, target, moves - 1)) return true;
    }
  return false;
}

describe('generateLevel', () => {
  for (const { key } of PLANETS)
    for (let idx = 0; idx < LEVEL_COUNT; idx++) {
      const { par, dist } = LEVELS[key][idx];
      it(`${key} level ${idx + 1} is valid and solvable in par`, () => {
        for (let run = 0; run < RUNS; run++) {
          const lvl = generateLevel(key, idx);
          // matching par and tile count proves the fallback level was not used
          expect(lvl.par).toBe(par);
          expect(lvl.tiles).toHaveLength(par + 1 + dist);
          expect(lvl.tiles).not.toContain(lvl.target);
          expect(lvl.tiles.every((v) => Number.isInteger(v) && v >= 1)).toBe(true);
          expect(solvable(key, lvl.tiles, lvl.target, par)).toBe(true);
        }
      });
    }

  it('rejects out-of-range level indexes', () => {
    expect(() => generateLevel('add', -1)).toThrow(RangeError);
    expect(() => generateLevel('add', LEVEL_COUNT)).toThrow(RangeError);
    expect(() => generateLevel('add', 1.5)).toThrow(RangeError);
  });
});
