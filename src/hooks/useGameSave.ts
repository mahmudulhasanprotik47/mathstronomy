import { useEffect, useState } from 'react';
import { LEVEL_COUNT } from '../data/levels';
import { PLANETS, type PlanetKey } from '../data/planets';

export type StarCount = 0 | 1 | 2 | 3;

export interface PlanetProgress {
  /** Highest playable level, 1..LEVEL_COUNT. */
  unlocked: number;
  /** Best stars per level; length LEVEL_COUNT. */
  stars: StarCount[];
}

export interface SaveData {
  v: 2;
  sound: boolean;
  progress: Record<PlanetKey, PlanetProgress>;
}

const LS_KEY = 'numberExplorers.v1';

export function freshSave(): SaveData {
  const progress = Object.fromEntries(
    PLANETS.map((p) => [p.key, { unlocked: 1, stars: Array<StarCount>(LEVEL_COUNT).fill(0) }])
  ) as Record<PlanetKey, PlanetProgress>;
  return { v: 2, sound: true, progress };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const clampInt = (v: unknown, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(v) | 0));

/** Reads the save, clamping every value into range. Anything unreadable or not v2 → fresh save. */
export function loadSave(): SaveData {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
    if (isRecord(raw) && raw.v === 2 && isRecord(raw.progress)) {
      const base = freshSave();
      for (const { key } of PLANETS) {
        const s = raw.progress[key];
        if (!isRecord(s)) continue;
        base.progress[key].unlocked = clampInt(s.unlocked, 1, LEVEL_COUNT);
        if (Array.isArray(s.stars))
          for (let i = 0; i < LEVEL_COUNT; i++)
            base.progress[key].stars[i] = clampInt(s.stars[i], 0, 3) as StarCount;
      }
      base.sound = raw.sound !== false;
      return base;
    }
  } catch {
    // corrupt JSON or blocked storage: fall through to a fresh save
  }
  return freshSave();
}

export function useGameSave() {
  const [save, setSave] = useState(loadSave);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(save));
    } catch {
      // storage full or blocked: progress just won't persist this session
    }
  }, [save]);

  const toggleSound = () => setSave((s) => ({ ...s, sound: !s.sound }));

  /** Keeps the best star count for the level and unlocks the next one. */
  const recordWin = (key: PlanetKey, idx: number, earned: StarCount) =>
    setSave((s) => {
      const prog = s.progress[key];
      const stars = prog.stars.map((v, i) => (i === idx ? (Math.max(v, earned) as StarCount) : v));
      const unlocked = idx + 1 < LEVEL_COUNT ? Math.max(prog.unlocked, idx + 2) : prog.unlocked;
      return { ...s, progress: { ...s.progress, [key]: { unlocked, stars } } };
    });

  return { save, toggleSound, recordWin };
}
