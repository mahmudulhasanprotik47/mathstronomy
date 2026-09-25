import type { PlanetKey } from '../data/planets';
import type { StarCount } from '../hooks/useGameSave';
import type { GeneratedLevel } from './generateLevel';
import { hasAnyValidMove, mergeResult } from './mergeRules';

export interface TileState {
  id: number;
  value: number;
}

interface Snapshot {
  tiles: TileState[];
  moves: number;
}

export interface GameState {
  key: PlanetKey;
  target: number;
  par: number;
  cols: 2 | 3;
  tiles: TileState[];
  /** Id of the first-tapped tile, waiting for a partner. */
  sel: number | null;
  moves: number;
  /** "New tiles" presses this level; costs stars. */
  shuffles: number;
  history: Snapshot[];
  nudge: string;
  /** Set while the merge animation plays; input is blocked until commitMerge. */
  merging: { fromId: number; intoId: number; result: number } | null;
  /** Tile that just received a merge and should play its pop animation. */
  popId: number | null;
  /** Next free tile id. Kept in state so the reducer stays pure. */
  nextId: number;
}

export interface WinResult {
  stars: StarCount;
  moves: number;
  target: number;
}

export type TapOutcome =
  | { kind: 'ignored' }
  | { kind: 'select' }
  | { kind: 'deselect' }
  | { kind: 'invalid'; firstId: number }
  | { kind: 'merge'; firstId: number; result: number };

export type GameAction =
  | { type: 'tap'; id: number }
  | { type: 'commitMerge' }
  | { type: 'undo' }
  | { type: 'newTiles'; level: GeneratedLevel };

const NUDGE_STUCK = 'Hmm! Tap Undo, or grab some New tiles ✨';
const NUDGE_FRESH = 'Fresh tiles! 🌟';

export function initGame(
  key: PlanetKey,
  level: GeneratedLevel,
  shuffles = 0,
  firstId = 1
): GameState {
  return {
    key,
    target: level.target,
    par: level.par,
    cols: level.tiles.length <= 4 ? 2 : 3,
    tiles: level.tiles.map((value, i) => ({ id: firstId + i, value })),
    sel: null,
    moves: 0,
    shuffles,
    history: [],
    nudge: '',
    merging: null,
    popId: null,
    nextId: firstId + level.tiles.length,
  };
}

/** What tapping tile `id` would do. The UI uses it to pick sounds and animations before dispatching. */
export function classifyTap(s: GameState, id: number): TapOutcome {
  if (s.merging) return { kind: 'ignored' };
  const second = s.tiles.find((t) => t.id === id);
  if (!second) return { kind: 'ignored' };
  if (s.sel === id) return { kind: 'deselect' };
  const first = s.tiles.find((t) => t.id === s.sel);
  if (!first) return { kind: 'select' };
  const result = mergeResult(s.key, first.value, second.value);
  return result === null
    ? { kind: 'invalid', firstId: first.id }
    : { kind: 'merge', firstId: first.id, result };
}

function applyTap(s: GameState, id: number): GameState {
  const outcome = classifyTap(s, id);
  switch (outcome.kind) {
    case 'ignored':
      return s;
    case 'deselect':
      return { ...s, sel: null, nudge: '' };
    case 'select':
      return { ...s, sel: id, nudge: '' };
    case 'invalid':
      // keep the first tile selected, no penalty
      return {
        ...s,
        nudge:
          s.key === 'div'
            ? "Those don't share evenly — try another pair!"
            : 'Tap the bigger number first!',
      };
    case 'merge':
      return {
        ...s,
        sel: null,
        nudge: '',
        merging: { fromId: outcome.firstId, intoId: id, result: outcome.result },
      };
  }
}

export function gameReducer(s: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'tap':
      return applyTap(s, action.id);
    case 'commitMerge': {
      if (!s.merging) return s;
      const { fromId, intoId, result } = s.merging;
      const tiles = s.tiles
        .filter((t) => t.id !== fromId)
        .map((t) => (t.id === intoId ? { ...t, value: result } : t));
      const won = result === s.target;
      const stuck =
        !won &&
        !hasAnyValidMove(
          s.key,
          tiles.map((t) => t.value)
        );
      return {
        ...s,
        tiles,
        moves: s.moves + 1,
        history: [...s.history, { tiles: s.tiles, moves: s.moves }],
        merging: null,
        popId: intoId,
        nudge: stuck ? NUDGE_STUCK : '',
      };
    }
    case 'undo': {
      const snap = s.history.at(-1);
      if (s.merging || !snap) return s;
      return {
        ...s,
        tiles: snap.tiles,
        moves: snap.moves,
        history: s.history.slice(0, -1),
        sel: null,
        popId: null,
        nudge: '',
      };
    }
    case 'newTiles':
      if (s.merging) return s;
      return { ...initGame(s.key, action.level, s.shuffles + 1, s.nextId), nudge: NUDGE_FRESH };
  }
}

export function starsFor(moves: number, par: number, shuffles: number): StarCount {
  if (moves <= par && shuffles === 0) return 3;
  if (moves <= par + 2 && shuffles <= 1) return 2;
  return 1;
}
