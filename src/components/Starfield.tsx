import { memo } from 'react';

const STAR_COLORS = ['#FFF7E8', '#7C8CC7'];

// Scattered once per page load. The nebula blobs and film grain are static CSS on .sky.
const STARS = Array.from({ length: 24 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 1 + Math.random(),
  fill: STAR_COLORS[i % 2],
}));

/**
 * Fixed background: nebula, stars, grain. Rendered by App beside the screens (never inside
 * GameBoard) and memoised, so gameplay never re-renders or repaints it.
 */
export const Starfield = memo(function Starfield() {
  return (
    <div className="sky" aria-hidden="true">
      <svg className="sky-stars">
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.fill} />
        ))}
      </svg>
    </div>
  );
});
