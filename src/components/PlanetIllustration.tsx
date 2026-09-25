import { useId } from 'react';
import type { PlanetKey } from '../data/planets';

const CREAM = '#FFF7E8';

interface Spot {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface PlanetArt {
  /** Sphere radial gradient: highlight (top-left) → base → shadow (bottom-right). */
  stops: readonly [string, string, string];
  /** Surface marks (craters, lava patches, cloud bands), clipped to the sphere. */
  spots: readonly Spot[];
  spotColor: string;
  symbol: string;
  symbolColor: string;
  radius: number;
  /** Extra layers: a Saturn-style ring behind the sphere, or a glow halo with flares. */
  extra?: 'ring' | 'star';
}

// Drawn on a 100×100 canvas, centred at (50, 50).
const ART: Record<PlanetKey, PlanetArt> = {
  add: {
    stops: ['#FFB38F', '#FF6B4A', '#6E2418'],
    spots: [
      { cx: 36, cy: 60, rx: 8, ry: 5 },
      { cx: 60, cy: 36, rx: 6, ry: 4 },
      { cx: 64, cy: 64, rx: 5, ry: 3.5 },
    ],
    spotColor: 'rgba(92, 24, 14, 0.45)',
    symbol: '+',
    symbolColor: CREAM,
    radius: 36,
  },
  sub: {
    stops: ['#E1E8F2', '#9DAECB', '#46598A'],
    spots: [
      { cx: 36, cy: 40, rx: 6, ry: 6 },
      { cx: 63, cy: 58, rx: 8, ry: 8 },
      { cx: 42, cy: 67, rx: 4, ry: 4 },
      { cx: 65, cy: 34, rx: 3.5, ry: 3.5 },
    ],
    spotColor: 'rgba(52, 68, 110, 0.5)',
    symbol: '−',
    symbolColor: CREAM,
    radius: 36,
  },
  mul: {
    stops: ['#FFF6D2', '#F4D57E', '#8B5FBF'],
    spots: [],
    spotColor: 'transparent',
    symbol: '×',
    symbolColor: '#4A2E6B',
    radius: 25,
    extra: 'star',
  },
  div: {
    stops: ['#BDF2D1', '#4FB477', '#1C5A37'],
    spots: [
      { cx: 50, cy: 38, rx: 30, ry: 3 },
      { cx: 50, cy: 62, rx: 30, ry: 2.5 },
    ],
    spotColor: 'rgba(24, 80, 48, 0.4)',
    symbol: '÷',
    symbolColor: CREAM,
    radius: 30,
    extra: 'ring',
  },
};

const FLARES = [
  [50, 3, 50, 19],
  [50, 81, 50, 97],
  [3, 50, 19, 50],
  [81, 50, 97, 50],
] as const;

interface PlanetIllustrationProps {
  planet: PlanetKey;
  /** Rendered width and height in px. */
  size?: number;
}

/**
 * Static SVG planet. Gradients live in <defs> and never change after mount, so React has
 * nothing to update on re-render and the browser has nothing to repaint.
 */
export function PlanetIllustration({ planet, size = 92 }: PlanetIllustrationProps) {
  const art = ART[planet];
  // Unique per instance so two copies of the same planet don't share gradient ids.
  const uid = useId().replace(/[^\w-]/g, '');
  const body = `${uid}-body`;
  const clip = `${uid}-clip`;
  const glow = `${uid}-glow`;
  const [light, base, shade] = art.stops;

  return (
    <svg className="planet-art" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={body} cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={base} />
          <stop offset="1" stopColor={shade} />
        </radialGradient>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r={art.radius} />
        </clipPath>
        {art.extra === 'star' && (
          <radialGradient id={glow}>
            <stop offset="0" stopColor="#FFD666" stopOpacity="0.6" />
            <stop offset="0.45" stopColor="#8B5FBF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8B5FBF" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {art.extra === 'star' && <circle cx="50" cy="50" r="49" fill={`url(#${glow})`} />}
      {art.extra === 'ring' && (
        <ellipse
          cx="50"
          cy="50"
          rx="47"
          ry="12"
          transform="rotate(-20 50 50)"
          fill="none"
          stroke="#CDEFD9"
          strokeWidth="6"
        />
      )}

      <circle
        cx="50"
        cy="50"
        r={art.radius}
        fill={`url(#${body})`}
        stroke={CREAM}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
      <g clipPath={`url(#${clip})`} fill={art.spotColor}>
        {art.spots.map((s, i) => (
          <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />
        ))}
      </g>

      {art.extra === 'star' &&
        FLARES.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FFF3C4"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fontSize={art.extra === 'star' ? 30 : 38}
        fill={art.symbolColor}
      >
        {art.symbol}
      </text>
    </svg>
  );
}
