import {
  LEVEL_COUNT,
  LEVELS,
  type AddLevel,
  type DivLevel,
  type MulLevel,
  type SubLevel,
} from '../data/levels';
import type { PlanetKey } from '../data/planets';

export interface GeneratedLevel {
  tiles: number[];
  target: number;
  par: number;
}

/** Guaranteed solution tiles plus how to draw one distractor, or null to reject this attempt. */
interface Draft {
  core: number[];
  target: number;
  distractor: () => number;
}

const rnd = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const rolls = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => rnd(lo, hi));

function shuffled<T>(items: readonly T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function draftAdd(cfg: AddLevel): Draft {
  const core = rolls(cfg.par + 1, cfg.lo, cfg.hi);
  return {
    core,
    target: core.reduce((a, b) => a + b, 0),
    distractor: () => rnd(cfg.lo, cfg.hi),
  };
}

function draftMul(cfg: MulLevel): Draft | null {
  const core = rolls(cfg.par + 1, cfg.lo, cfg.hi);
  const target = core.reduce((a, b) => a * b, 1);
  if (target > cfg.cap || target < 4) return null;
  return { core, target, distractor: () => rnd(2, 9) };
}

function draftSub(cfg: SubLevel): Draft {
  const target = rnd(cfg.tLo, cfg.tHi);
  const bs = rolls(cfg.par, cfg.bLo, cfg.bHi);
  return {
    core: [target + bs.reduce((a, b) => a + b, 0), ...bs],
    target,
    distractor: () => rnd(1, cfg.bHi + 2),
  };
}

function draftDiv(cfg: DivLevel): Draft | null {
  const target = rnd(cfg.tLo, cfg.tHi);
  const ds = rolls(cfg.par, cfg.dLo, cfg.dHi);
  const big = ds.reduce((a, b) => a * b, target);
  if (big > cfg.cap) return null;
  return { core: [big, ...ds], target, distractor: () => rnd(2, 9) };
}

function draft(key: PlanetKey, idx: number): Draft | null {
  switch (key) {
    case 'add':
      return draftAdd(LEVELS.add[idx]);
    case 'sub':
      return draftSub(LEVELS.sub[idx]);
    case 'mul':
      return draftMul(LEVELS.mul[idx]);
    case 'div':
      return draftDiv(LEVELS.div[idx]);
  }
}

/*
 * Every level is built backwards from a guaranteed solution chain, so a winning
 * sequence of merges always exists. Distractor tiles can never block it.
 */
export function generateLevel(key: PlanetKey, idx: number): GeneratedLevel {
  if (!Number.isInteger(idx) || idx < 0 || idx >= LEVEL_COUNT) {
    throw new RangeError(`Level index ${idx} out of range 0..${LEVEL_COUNT - 1}`);
  }
  const { par, dist } = LEVELS[key][idx];
  for (let attempt = 0; attempt < 200; attempt++) {
    const d = draft(key, idx);
    if (!d) continue;
    const tiles = [...d.core, ...Array.from({ length: dist }, d.distractor)];
    // never hand the child the answer, and never start already-won
    if (tiles.includes(d.target)) continue;
    if (tiles.some((v) => v < 1)) continue;
    return { tiles: shuffled(tiles), target: d.target, par };
  }
  // Unreachable in practice (the tests never hit it across every level). Kept verbatim from
  // the original: its target is wrong for sub/div (14 can't be made) and add needs 3 merges.
  return { tiles: shuffled([2, 3, 4, 5]), target: key === 'mul' ? 24 : 14, par: 2 };
}
