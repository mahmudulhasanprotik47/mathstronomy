import { useEffect, useRef } from 'react';
import { LEVEL_COUNT, NODE_POS } from '../data/levels';
import type { Planet } from '../data/planets';
import type { PlanetProgress } from '../hooks/useGameSave';
import { themeVars } from './theme';
import { TopBar } from './TopBar';

interface LevelMapProps {
  planet: Planet;
  progress: PlanetProgress;
  onBack: () => void;
  onPlay: (idx: number) => void;
}

const PATH_POINTS = NODE_POS.map((n) => `${n.x},${n.y}`).join(' ');

export function LevelMap({ planet, progress, onBack, onPlay }: LevelMapProps) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const total = progress.stars.reduce<number>((a, b) => a + b, 0);
  const [before, bold, after] = planet.rule;

  // The map is taller than the screen and level 1 is at the bottom: start at the newest level.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  return (
    <section className="screen" style={themeVars(planet)}>
      <TopBar title={planet.name} onBack={onBack} backLabel="Back to planets">
        <div className="icobtn" role="img" aria-label={`${total} stars earned`}>
          ★{total}
        </div>
      </TopBar>
      <div className="mapwrap" style={{ '--count': LEVEL_COUNT }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points={PATH_POINTS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="1 9"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {NODE_POS.map((pos, i) => {
          const unlocked = i + 1 <= progress.unlocked;
          return (
            <button
              key={i}
              ref={i + 1 === progress.unlocked ? currentRef : undefined}
              type="button"
              className={unlocked ? 'node' : 'node locked'}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              disabled={!unlocked}
              aria-label={unlocked ? `Level ${i + 1}` : `Level ${i + 1}, locked`}
              onClick={() => onPlay(i)}
            >
              {unlocked ? (
                <>
                  {i + 1}
                  <span className="stars">
                    {[0, 1, 2].map((s) => (
                      <span key={s} className={s < progress.stars[i] ? undefined : 'off'}>
                        ★
                      </span>
                    ))}
                  </span>
                </>
              ) : (
                '🔒'
              )}
            </button>
          );
        })}
      </div>
      <p className="legend">
        {before}
        <b>{bold}</b>
        {after}
      </p>
    </section>
  );
}
