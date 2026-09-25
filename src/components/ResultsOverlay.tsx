import { useState } from 'react';
import type { Planet } from '../data/planets';
import type { WinResult } from '../logic/gameState';
import { themeVars } from './theme';

interface ResultsOverlayProps {
  planet: Planet;
  result: WinResult;
  hasNext: boolean;
  onNext: () => void;
  onAgain: () => void;
  onMap: () => void;
}

const TITLES = ['', 'Nice work!', 'Great job!', 'Perfect!'] as const;
const CONFETTI_COLORS = ['#FFD666', '#FF6B4A', '#38B6C2', '#8B5FBF', '#4FB477', '#FFF7E8'];

function makeConfetti() {
  return Array.from({ length: 44 }, () => ({
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    duration: 1.7 + Math.random() * 1.4,
    delay: Math.random() * 0.5,
  }));
}

/** Win card with stars and confetti. Confetti is part of the overlay and goes when it closes. */
export function ResultsOverlay({
  planet,
  result,
  hasNext,
  onNext,
  onAgain,
  onMap,
}: ResultsOverlayProps) {
  const [confetti] = useState(makeConfetti);
  const { stars, moves, target } = result;

  return (
    <div
      className="overlay"
      style={themeVars(planet)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      <div className="card">
        <h3 id="win-title">{TITLES[stars]}</h3>
        <p>
          You made {target} in {moves} move{moves === 1 ? '' : 's'}.
        </p>
        <div className="bigstars" role="img" aria-label={`${stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={i < stars ? 'on' : undefined}
              style={{ animationDelay: `${0.15 + i * 0.16}s` }}
            >
              ★
            </span>
          ))}
        </div>
        <div className="actions">
          {hasNext && (
            <button type="button" className="btn big" autoFocus onClick={onNext}>
              Next level →
            </button>
          )}
          <button type="button" className="btn" autoFocus={!hasNext} onClick={onAgain}>
            Play again
          </button>
          <button type="button" className="btn" onClick={onMap}>
            Map
          </button>
        </div>
      </div>
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <i
            key={i}
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
