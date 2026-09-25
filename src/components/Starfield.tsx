import { useState } from 'react';

function makeStars() {
  return Array.from({ length: 70 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2.2 + 1,
    delay: (Math.random() * 4).toFixed(2),
  }));
}

/** Twinkling background stars. Random positions are generated once, not on every render. */
export function Starfield() {
  const [stars] = useState(makeStars);
  return (
    <div className="sky" aria-hidden="true">
      {stars.map((s, i) => (
        <i
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}
