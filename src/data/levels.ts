import type { PlanetKey } from './planets';

interface LevelBase {
  /** Merges in the guaranteed solution. */
  par: number;
  /** Extra distractor tiles. */
  dist: number;
}
/** lo/hi = range of each addend. */
export interface AddLevel extends LevelBase {
  lo: number;
  hi: number;
}
/** lo/hi = range of each factor; cap = max allowed product. */
export interface MulLevel extends LevelBase {
  lo: number;
  hi: number;
  cap: number;
}
/** t = target range, b = range of each number subtracted. */
export interface SubLevel extends LevelBase {
  tLo: number;
  tHi: number;
  bLo: number;
  bHi: number;
}
/** t = target range, d = range of each divisor; cap = max starting dividend. */
export interface DivLevel extends LevelBase {
  tLo: number;
  tHi: number;
  dLo: number;
  dHi: number;
  cap: number;
}

export interface LevelConfigs {
  add: AddLevel;
  sub: SubLevel;
  mul: MulLevel;
  div: DivLevel;
}
type LevelTable = { readonly [K in PlanetKey]: readonly LevelConfigs[K][] };

export const LEVEL_COUNT = 15;

/** The original five hand-tuned levels. They land at levels 3, 6, 9, 12, 15. */
const CHECKPOINTS: LevelTable = {
  add: [
    { par: 1, dist: 2, lo: 1, hi: 9 },
    { par: 2, dist: 2, lo: 1, hi: 9 },
    { par: 2, dist: 3, lo: 2, hi: 12 },
    { par: 3, dist: 2, lo: 2, hi: 15 },
    { par: 3, dist: 3, lo: 3, hi: 20 },
  ],
  sub: [
    { par: 1, dist: 2, tLo: 2, tHi: 9, bLo: 1, bHi: 8 },
    { par: 2, dist: 2, tLo: 2, tHi: 10, bLo: 1, bHi: 9 },
    { par: 2, dist: 3, tLo: 3, tHi: 12, bLo: 2, bHi: 10 },
    { par: 3, dist: 2, tLo: 3, tHi: 12, bLo: 2, bHi: 9 },
    { par: 3, dist: 3, tLo: 4, tHi: 15, bLo: 2, bHi: 12 },
  ],
  mul: [
    { par: 1, dist: 2, lo: 2, hi: 5, cap: 40 },
    { par: 1, dist: 3, lo: 2, hi: 9, cap: 81 },
    { par: 2, dist: 2, lo: 2, hi: 5, cap: 100 },
    { par: 2, dist: 3, lo: 2, hi: 6, cap: 180 },
    { par: 3, dist: 3, lo: 2, hi: 4, cap: 220 },
  ],
  div: [
    { par: 1, dist: 2, tLo: 2, tHi: 10, dLo: 2, dHi: 5, cap: 60 },
    { par: 1, dist: 3, tLo: 2, tHi: 12, dLo: 2, dHi: 9, cap: 110 },
    { par: 2, dist: 2, tLo: 2, tHi: 10, dLo: 2, dHi: 4, cap: 160 },
    { par: 2, dist: 3, tLo: 2, tHi: 12, dLo: 2, dHi: 5, cap: 250 },
    { par: 3, dist: 2, tLo: 2, tHi: 8, dLo: 2, dHi: 3, cap: 220 },
  ],
};

/** Gentler starting point for level 1, below the first checkpoint. */
const INTRO: { readonly [K in PlanetKey]: LevelConfigs[K] } = {
  add: { par: 1, dist: 1, lo: 1, hi: 5 },
  sub: { par: 1, dist: 1, tLo: 2, tHi: 5, bLo: 1, bHi: 4 },
  mul: { par: 1, dist: 1, lo: 2, hi: 3, cap: 9 },
  div: { par: 1, dist: 1, tLo: 2, tHi: 5, dLo: 2, dHi: 3, cap: 15 },
};

/** Zero-based level index of each anchor: INTRO, then the five checkpoints. */
export const ANCHOR_IDX = [0, 2, 5, 8, 11, 14] as const;

/**
 * Fills the gaps between anchors by linear interpolation, rounding each field.
 * Rounding is monotone, so every field stays between its two neighbouring anchors.
 */
function interpolateLevels<T extends LevelBase & Record<keyof T, number>>(
  intro: T,
  checkpoints: readonly T[]
): T[] {
  const anchors = [intro, ...checkpoints];
  return Array.from({ length: LEVEL_COUNT }, (_, i) => {
    const s = ANCHOR_IDX.findIndex((ai) => ai >= i);
    if (ANCHOR_IDX[s] === i) return anchors[s];
    const a = anchors[s - 1];
    const b = anchors[s];
    const t = (i - ANCHOR_IDX[s - 1]) / (ANCHOR_IDX[s] - ANCHOR_IDX[s - 1]);
    const keys = Object.keys(a) as (keyof T)[];
    return Object.fromEntries(keys.map((k) => [k, Math.round(a[k] + (b[k] - a[k]) * t)])) as T;
  });
}

export const LEVELS: LevelTable = {
  add: interpolateLevels(INTRO.add, CHECKPOINTS.add),
  sub: interpolateLevels(INTRO.sub, CHECKPOINTS.sub),
  mul: interpolateLevels(INTRO.mul, CHECKPOINTS.mul),
  div: interpolateLevels(INTRO.div, CHECKPOINTS.div),
};

/** Map node position, in percent of the map box. */
export interface NodePos {
  x: number;
  y: number;
}

/** A gentle S-curve climbing from bottom (y 85) to top (y 15), swinging x between 28 and 72. */
export function generateNodePositions(count: number): NodePos[] {
  const round1 = (v: number) => Math.round(v * 10) / 10;
  return Array.from({ length: Math.max(0, count) }, (_, i) => ({
    x: round1(50 + 22 * Math.sin((i * Math.PI) / 2)),
    y: round1(85 - (count > 1 ? (70 * i) / (count - 1) : 0)),
  }));
}

export const NODE_POS: readonly NodePos[] = generateNodePositions(LEVEL_COUNT);
