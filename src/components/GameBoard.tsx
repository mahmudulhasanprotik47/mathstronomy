import { useEffect, useEffectEvent, useReducer } from 'react';
import type { Planet } from '../data/planets';
import { MERGE_MS, useTileAnimations } from '../hooks/useTileAnimations';
import type { SfxName } from '../hooks/useSound';
import { classifyTap, gameReducer, initGame, starsFor, type WinResult } from '../logic/gameState';
import { generateLevel } from '../logic/generateLevel';
import { themeVars } from './theme';
import { Tile } from './Tile';
import { TopBar } from './TopBar';

interface GameBoardProps {
  planet: Planet;
  idx: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onWin: (result: WinResult) => void;
  play: (name: SfxName) => void;
}

/** One level. The parent remounts it (via `key`) for "Next level" and "Play again". */
export function GameBoard({
  planet,
  idx,
  soundOn,
  onToggleSound,
  onBack,
  onWin,
  play,
}: GameBoardProps) {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    initGame(planet.key, generateLevel(planet.key, idx))
  );
  const anim = useTileAnimations(state.tiles, state.popId);
  const [before, bold, after] = planet.rule;

  // Runs when the fly-into animation ends. Win is decided here, once, not by watching state.
  const finishMerge = useEffectEvent(() => {
    const { merging, moves, par, shuffles, target } = state;
    if (!merging) return;
    anim.captureRects();
    dispatch({ type: 'commitMerge' });
    if (merging.result === target)
      onWin({ stars: starsFor(moves + 1, par, shuffles), moves: moves + 1, target });
  });

  // Cleared on unmount, so leaving mid-merge can't commit a move or report a phantom win.
  useEffect(() => {
    if (!state.merging) return;
    const timer = setTimeout(() => finishMerge(), MERGE_MS);
    return () => clearTimeout(timer);
  }, [state.merging]);

  const handleTap = (id: number) => {
    const outcome = classifyTap(state, id);
    switch (outcome.kind) {
      case 'ignored':
        return;
      case 'deselect':
        play('tap');
        break;
      case 'select':
        play('pick');
        break;
      case 'invalid':
        anim.wiggle(outcome.firstId);
        anim.wiggle(id);
        play('nope');
        break;
      case 'merge':
        anim.flyInto(outcome.firstId, id);
        play('merge');
        break;
    }
    dispatch({ type: 'tap', id });
  };

  const handleUndo = () => {
    if (state.merging || !state.history.length) return;
    play('tap');
    anim.captureRects();
    dispatch({ type: 'undo' });
  };

  const handleNewTiles = () => {
    if (state.merging) return;
    play('pick');
    dispatch({ type: 'newTiles', level: generateLevel(planet.key, idx) });
  };

  return (
    <section className="screen" style={themeVars(planet)}>
      <TopBar
        title={`Level ${idx + 1} · ${planet.name}`}
        onBack={onBack}
        backLabel="Back to level map"
      >
        <button
          type="button"
          className="icobtn"
          aria-label="Toggle sound"
          aria-pressed={soundOn}
          onClick={onToggleSound}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
      </TopBar>
      <div className="targetcard">
        <div className="lab">Make this number</div>
        <div className="num" aria-live="polite">
          {state.target}
        </div>
      </div>
      <p className="rule">
        {before}
        <b>{bold}</b>
        {after}
      </p>
      <div className="hud">
        <span>
          Moves <b>{state.moves}</b>
        </span>
        <span>
          Par <b>{state.par}</b>
        </span>
      </div>
      <div className="grid" style={{ '--cols': state.cols }}>
        {state.tiles.map((t) => (
          <Tile
            key={t.id}
            ref={anim.register(t.id)}
            value={t.value}
            selected={state.sel === t.id}
            receiving={state.merging?.intoId === t.id}
            onClick={() => handleTap(t.id)}
          />
        ))}
      </div>
      <div className="nudge" aria-live="polite">
        {state.nudge}
      </div>
      <div className="actions">
        <button type="button" className="btn" disabled={!state.history.length} onClick={handleUndo}>
          ↶ Undo
        </button>
        <button type="button" className="btn" onClick={handleNewTiles}>
          ✨ New tiles
        </button>
      </div>
    </section>
  );
}
