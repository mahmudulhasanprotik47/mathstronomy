import type { CSSProperties } from 'react';
import type { Planet, PlanetKey } from '../data/planets';

const NAVY = '#0C1530';
const CREAM = '#FFF7E8';

/**
 * One flat accent per planet, plus the ink colour that reads on it. Navy passes large-text
 * contrast on the three lighter accents; the violet is dark enough that cream reads better.
 */
const ACCENTS: Record<PlanetKey, { accent: string; ink: string }> = {
  add: { accent: '#FF6B4A', ink: NAVY },
  sub: { accent: '#38B6C2', ink: NAVY },
  mul: { accent: '#8B5FBF', ink: CREAM },
  div: { accent: '#4FB477', ink: NAVY },
};

/** Planet colours as the --accent / --on-accent variables used by nodes, tiles and cards. */
export const themeVars = (planet: Planet): CSSProperties => ({
  '--accent': ACCENTS[planet.key].accent,
  '--on-accent': ACCENTS[planet.key].ink,
});
