import { LEVEL_COUNT } from '../data/levels';
import { PLANETS, type PlanetKey } from '../data/planets';
import type { SaveData } from '../hooks/useGameSave';

interface PlanetSelectProps {
  progress: SaveData['progress'];
  soundOn: boolean;
  onToggleSound: () => void;
  onPick: (key: PlanetKey) => void;
}

/** Home screen: title, the four planets with progress, and the sound toggle. */
export function PlanetSelect({ progress, soundOn, onToggleSound, onPick }: PlanetSelectProps) {
  return (
    <section className="screen">
      <h1 className="title">Mathstronomy</h1>
      <p className="sub">Pick a planet to explore 🚀</p>
      <div className="planets">
        {PLANETS.map((p) => {
          const { stars } = progress[p.key];
          const total = stars.reduce<number>((a, b) => a + b, 0);
          const done = stars.filter((s) => s > 0).length;
          return (
            <button key={p.key} type="button" className="planet" onClick={() => onPick(p.key)}>
              <div className="orb" style={{ '--c1': p.c1, '--c2': p.c2 }}>
                {p.sym}
              </div>
              <b>{p.name}</b>
              <small>
                {done}/{LEVEL_COUNT} levels
              </small>
              <div className="prog">
                ★ {total}/{LEVEL_COUNT * 3}
              </div>
            </button>
          );
        })}
      </div>
      <p className="legend" style={{ marginTop: 18 }}>
        Tap two tiles to join them.
        <br />
        Reach the target number to land safely!
      </p>
      <div className="actions" style={{ marginTop: 16 }}>
        <button type="button" className="btn" onClick={onToggleSound}>
          {soundOn ? '🔊 Sound: On' : '🔇 Sound: Off'}
        </button>
      </div>
    </section>
  );
}
