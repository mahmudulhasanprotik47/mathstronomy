import { describe, expect, it } from 'vitest';
import type { PlanetKey } from '../data/planets';
import { classifyTap, gameReducer, initGame, starsFor, type GameState } from './gameState';

const game = (key: PlanetKey, tiles: number[], target: number, par = 2) =>
  initGame(key, { tiles, target, par });

// Tile ids start at 1, in the order the values are given.
const tap = (s: GameState, id: number) => gameReducer(s, { type: 'tap', id });
const merge = (s: GameState, a: number, b: number) =>
  gameReducer(tap(tap(s, a), b), { type: 'commitMerge' });
const values = (s: GameState) => s.tiles.map((t) => t.value);

describe('initGame', () => {
  it('uses 2 columns for up to 4 tiles, else 3', () => {
    expect(game('add', [1, 2, 3, 4], 9).cols).toBe(2);
    expect(game('add', [1, 2, 3, 4, 5], 9).cols).toBe(3);
  });
});

describe('tapping', () => {
  it('selects, then deselects the same tile', () => {
    const s = tap(game('add', [1, 2, 3], 9), 1);
    expect(s.sel).toBe(1);
    expect(tap(s, 1).sel).toBeNull();
  });

  it('rejects small-first on sub, keeping the selection and nudging', () => {
    const s = tap(tap(game('sub', [3, 9, 4], 2), 1), 2);
    expect(s.sel).toBe(1);
    expect(s.merging).toBeNull();
    expect(s.nudge).toBe('Tap the bigger number first!');
  });

  it('rejects non-divisors on div with its own nudge', () => {
    const s = tap(tap(game('div', [7, 3, 4], 2), 1), 2);
    expect(s.nudge).toBe("Those don't share evenly — try another pair!");
  });

  it('starts a merge, blocks input, then commits it', () => {
    const s = tap(tap(game('add', [1, 2, 3], 9), 1), 2);
    expect(s.merging).toEqual({ fromId: 1, intoId: 2, result: 3 });
    expect(s.sel).toBeNull();
    expect(classifyTap(s, 3)).toEqual({ kind: 'ignored' });
    expect(gameReducer(s, { type: 'undo' })).toBe(s);

    const done = gameReducer(s, { type: 'commitMerge' });
    expect(done.tiles).toEqual([
      { id: 2, value: 3 },
      { id: 3, value: 3 },
    ]);
    expect(done.moves).toBe(1);
    expect(done.history).toHaveLength(1);
    expect(done.popId).toBe(2);
    expect(done.merging).toBeNull();
  });

  it('ignores taps on unknown tiles', () => {
    const s = game('add', [1, 2, 3], 9);
    expect(tap(s, 99)).toBe(s);
  });
});

describe('stuck detection', () => {
  it('nudges when no pair can merge', () => {
    // 6 - 3 leaves [3, 3]: equal values can't subtract
    const s = merge(game('sub', [6, 3, 3], 1), 1, 2);
    expect(values(s)).toEqual([3, 3]);
    expect(s.nudge).toBe('Hmm! Tap Undo, or grab some New tiles ✨');
  });

  it('does not nudge when the merge hits the target', () => {
    const s = merge(game('add', [4, 5, 1], 9), 1, 2);
    expect(values(s)).toContain(9);
    expect(s.nudge).toBe('');
  });
});

describe('undo', () => {
  it('restores the previous tiles and move count', () => {
    const start = game('add', [1, 2, 3], 9);
    const s = gameReducer(merge(start, 1, 2), { type: 'undo' });
    expect(s.tiles).toEqual(start.tiles);
    expect(s.moves).toBe(0);
    expect(s.history).toHaveLength(0);
  });

  it('does nothing with no history', () => {
    const s = game('add', [1, 2, 3], 9);
    expect(gameReducer(s, { type: 'undo' })).toBe(s);
  });
});

describe('newTiles', () => {
  const level = { tiles: [4, 5, 6], target: 15, par: 2 };

  it('resets the board, counts the shuffle and uses fresh ids', () => {
    const played = merge(game('add', [1, 2, 3], 9), 1, 2);
    const s = gameReducer(played, { type: 'newTiles', level });
    expect(values(s)).toEqual([4, 5, 6]);
    expect(s.shuffles).toBe(1);
    expect(s.moves).toBe(0);
    expect(s.history).toHaveLength(0);
    expect(s.tiles.map((t) => t.id)).toEqual([4, 5, 6]);
    expect(s.nudge).toBe('Fresh tiles! 🌟');
  });

  it('is blocked mid-merge', () => {
    const s = tap(tap(game('add', [1, 2, 3], 9), 1), 2);
    expect(gameReducer(s, { type: 'newTiles', level })).toBe(s);
  });
});

describe('starsFor', () => {
  it.each([
    [2, 2, 0, 3], // at par, no shuffles
    [1, 2, 0, 3],
    [2, 2, 1, 2], // one shuffle caps at 2
    [4, 2, 0, 2], // par + 2
    [4, 2, 1, 2],
    [5, 2, 0, 1], // par + 3
    [2, 2, 2, 1], // two shuffles
  ])('moves %i, par %i, shuffles %i → %i stars', (moves, par, shuffles, stars) => {
    expect(starsFor(moves, par, shuffles)).toBe(stars);
  });
});
