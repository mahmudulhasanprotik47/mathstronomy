import { describe, expect, it } from 'vitest';
import { ANCHOR_IDX, LEVEL_COUNT, LEVELS, NODE_POS, generateNodePositions } from './levels';
import { PLANETS } from './planets';

// Copied verbatim from legacy-reference/index.html, independent of levels.ts on purpose.
const LEGACY_LEVELS = {
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

describe('LEVELS', () => {
  for (const { key } of PLANETS) {
    // Level interfaces have no index signature, so widen to plain objects to read fields by name.
    const levels = LEVELS[key].map((l: object) => l as Record<string, number>);

    it(`${key} has ${LEVEL_COUNT} levels`, () => {
      expect(levels).toHaveLength(LEVEL_COUNT);
    });

    it(`${key} levels 3, 6, 9, 12, 15 are the original levels exactly`, () => {
      LEGACY_LEVELS[key].forEach((orig, j) => {
        expect(levels[(j + 1) * 3 - 1]).toStrictEqual(orig);
      });
    });

    it(`${key} fields only move one direction within each gap`, () => {
      for (let s = 1; s < ANCHOR_IDX.length; s++) {
        const from = ANCHOR_IDX[s - 1];
        const to = ANCHOR_IDX[s];
        for (const field of Object.keys(levels[from])) {
          const dir = Math.sign(levels[to][field] - levels[from][field]);
          for (let i = from; i < to; i++) {
            const step = levels[i + 1][field] - levels[i][field];
            expect(step * dir, `${field} at level ${i + 2}`).toBeGreaterThanOrEqual(0);
            if (dir === 0) expect(step).toBe(0);
          }
        }
      }
    });
  }
});

describe('generateNodePositions', () => {
  it.each([0, 1, 2, 5, 15, 40])('returns %i valid points', (count) => {
    const pts = generateNodePositions(count);
    expect(pts).toHaveLength(count);
    for (const { x, y } of pts) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
    for (let i = 1; i < pts.length; i++) expect(pts[i].y).toBeLessThan(pts[i - 1].y);
  });

  it('NODE_POS has one node per level', () => {
    expect(NODE_POS).toHaveLength(LEVEL_COUNT);
  });
});
