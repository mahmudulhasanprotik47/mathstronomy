import type { CSSProperties } from 'react';
import type { Planet } from '../data/planets';

/** Planet colours as the --p1 / --p2 variables used by nodes, tiles, cards and buttons. */
export const themeVars = (planet: Planet): CSSProperties => ({
  '--p1': planet.c1,
  '--p2': planet.c2,
});
