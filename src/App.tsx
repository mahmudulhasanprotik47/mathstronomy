import { useRef, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { LevelMap } from './components/LevelMap';
import { PlanetSelect } from './components/PlanetSelect';
import { ResultsOverlay } from './components/ResultsOverlay';
import { Starfield } from './components/Starfield';
import { LEVEL_COUNT } from './data/levels';
import { PMAP, type PlanetKey } from './data/planets';
import { useGameSave } from './hooks/useGameSave';
import { useSound } from './hooks/useSound';
import type { WinResult } from './logic/gameState';

// Plain screen state instead of a router: no deep links needed, and no URL states to guard.
type Screen =
  | { name: 'home' }
  | { name: 'map'; planet: PlanetKey }
  | { name: 'game'; planet: PlanetKey; idx: number; run: number };

function App() {
  const { save, toggleSound, recordWin } = useGameSave();
  const { play } = useSound(save.sound);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [result, setResult] = useState<WinResult | null>(null);
  const runs = useRef(0);

  const navigate = (next: Screen) => {
    window.scrollTo(0, 0);
    setResult(null);
    setScreen(next);
  };
  const goHome = () => navigate({ name: 'home' });
  const goMap = (planet: PlanetKey) => navigate({ name: 'map', planet });
  // `run` changes the GameBoard key, so replaying the same level still gets a fresh board.
  const goLevel = (planet: PlanetKey, idx: number) =>
    navigate({ name: 'game', planet, idx, run: ++runs.current });
  const tapThen = (action: () => void) => {
    play('tap');
    action();
  };

  const handleToggleSound = () => {
    if (!save.sound) play('pick', { ignoreMute: true });
    toggleSound();
  };

  const handleWin = (r: WinResult) => {
    if (screen.name !== 'game') return;
    recordWin(screen.planet, screen.idx, r.stars);
    setResult(r);
    play('win');
  };

  return (
    <>
      <Starfield />
      <main id="app">
        {screen.name === 'home' && (
          <PlanetSelect
            progress={save.progress}
            soundOn={save.sound}
            onToggleSound={handleToggleSound}
            onPick={(key) => tapThen(() => goMap(key))}
          />
        )}
        {screen.name === 'map' && (
          <LevelMap
            key={screen.planet}
            planet={PMAP[screen.planet]}
            progress={save.progress[screen.planet]}
            onBack={() => tapThen(goHome)}
            onPlay={(idx) => tapThen(() => goLevel(screen.planet, idx))}
          />
        )}
        {screen.name === 'game' && (
          <GameBoard
            key={`${screen.planet}-${screen.idx}-${screen.run}`}
            planet={PMAP[screen.planet]}
            idx={screen.idx}
            soundOn={save.sound}
            onToggleSound={handleToggleSound}
            onBack={() => tapThen(() => goMap(screen.planet))}
            onWin={handleWin}
            play={play}
          />
        )}
      </main>
      {screen.name === 'game' && result && (
        <ResultsOverlay
          planet={PMAP[screen.planet]}
          result={result}
          hasNext={screen.idx + 1 < LEVEL_COUNT}
          onNext={() => tapThen(() => goLevel(screen.planet, screen.idx + 1))}
          onAgain={() => tapThen(() => goLevel(screen.planet, screen.idx))}
          onMap={() => tapThen(() => goMap(screen.planet))}
        />
      )}
    </>
  );
}

export default App;
