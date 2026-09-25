import { useCallback } from 'react';

export type SfxName = 'pick' | 'merge' | 'nope' | 'win' | 'tap';

interface Tone {
  freq: number;
  delay: number;
  dur: number;
  type: OscillatorType;
  vol: number;
}

const SFX: Record<SfxName, readonly Tone[]> = {
  pick: [{ freq: 640, delay: 0, dur: 0.11, type: 'sine', vol: 0.12 }],
  merge: [
    { freq: 520, delay: 0, dur: 0.12, type: 'sine', vol: 0.14 },
    { freq: 790, delay: 0.07, dur: 0.2, type: 'sine', vol: 0.12 },
  ],
  nope: [
    { freq: 215, delay: 0, dur: 0.1, type: 'triangle', vol: 0.11 },
    { freq: 170, delay: 0.09, dur: 0.14, type: 'triangle', vol: 0.1 },
  ],
  win: [523, 659, 784, 1047].map((freq, i): Tone => ({
    freq,
    delay: i * 0.11,
    dur: 0.35,
    type: 'sine',
    vol: 0.14,
  })),
  tap: [{ freq: 420, delay: 0, dur: 0.08, type: 'sine', vol: 0.09 }],
};

// One shared context for the whole app; browsers limit how many can exist.
let ctx: AudioContext | null = null;

/** Lazily creates the context (must happen in a user gesture) and wakes it if suspended. */
function ensureAudio(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      ctx = null;
    }
  }
  if (ctx?.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(ac: AudioContext, { freq, delay, dur, type, vol }: Tone) {
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/**
 * `ignoreMute` is for the sound toggle: it plays a blip right after switching sound on,
 * while `enabled` in that handler still holds the old (muted) value.
 */
export function useSound(enabled: boolean) {
  const play = useCallback(
    (name: SfxName, opts?: { ignoreMute?: boolean }) => {
      if (!enabled && !opts?.ignoreMute) return;
      const ac = ensureAudio();
      if (!ac) return;
      for (const t of SFX[name]) tone(ac, t);
    },
    [enabled]
  );
  return { play };
}
