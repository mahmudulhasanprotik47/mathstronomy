import { describe, expect, it } from 'vitest';
import { hasAnyValidMove, mergeResult } from './mergeRules';

describe('mergeResult', () => {
  it.each([
    ['add', 3, 4, 7],
    ['add', 4, 3, 7],
    ['mul', 3, 4, 12],
    ['mul', 4, 3, 12],
    ['sub', 9, 4, 5],
    ['sub', 4, 9, null], // smaller first is rejected
    ['sub', 5, 5, null], // never zero
    ['div', 12, 3, 4],
    ['div', 3, 12, 4], // order-free
    ['div', 7, 7, 1],
    ['div', 7, 3, null], // must divide evenly
    ['div', 0, 5, null], // lo > 0 guard
  ] as const)('%s(%i, %i) = %s', (key, a, b, expected) => {
    expect(mergeResult(key, a, b)).toBe(expected);
  });
});

describe('hasAnyValidMove', () => {
  it('is false with fewer than two tiles', () => {
    expect(hasAnyValidMove('add', [5])).toBe(false);
    expect(hasAnyValidMove('add', [])).toBe(false);
  });
  it('add and mul always have a move with two or more tiles', () => {
    expect(hasAnyValidMove('add', [1, 1])).toBe(true);
    expect(hasAnyValidMove('mul', [2, 9, 4])).toBe(true);
  });
  it('sub needs two different values', () => {
    expect(hasAnyValidMove('sub', [3, 3])).toBe(false);
    expect(hasAnyValidMove('sub', [3, 8])).toBe(true); // found in reverse order
  });
  it('div needs a dividing pair', () => {
    expect(hasAnyValidMove('div', [3, 5, 7])).toBe(false);
    expect(hasAnyValidMove('div', [3, 5, 15])).toBe(true);
  });
});
