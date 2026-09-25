export type PlanetKey = 'add' | 'sub' | 'mul' | 'div';

export interface Planet {
  key: PlanetKey;
  name: string;
  sym: string;
  /** Gradient colours, exposed to CSS as --c1 / --c2. */
  c1: string;
  c2: string;
  /** Rule sentence split around its one emphasised phrase: before, bold, after. */
  rule: readonly [before: string, bold: string, after: string];
}

export const PLANETS: readonly Planet[] = [
  {
    key: 'add',
    name: 'Plus Planet',
    sym: '+',
    c1: '#ffa14a',
    c2: '#ff5f6d',
    rule: ['Tap any two tiles to ', 'add', ' them together.'],
  },
  {
    key: 'sub',
    name: 'Minus Moon',
    sym: '−',
    c1: '#6ed0ff',
    c2: '#3a6fd8',
    rule: ['Tap the ', 'bigger', ' tile first, then a smaller one, to subtract.'],
  },
  {
    key: 'mul',
    name: 'Times Star',
    sym: '×',
    c1: '#c98cff',
    c2: '#7a45d6',
    rule: ['Tap any two tiles to ', 'multiply', ' them.'],
  },
  {
    key: 'div',
    name: 'Divide Dome',
    sym: '÷',
    c1: '#5fe6ad',
    c2: '#149e74',
    rule: ['Two tiles join only if they ', 'share evenly', '. Wiggle means try another pair!'],
  },
];

export const PMAP = Object.fromEntries(PLANETS.map((p) => [p.key, p])) as Record<
  PlanetKey,
  Planet
>;
