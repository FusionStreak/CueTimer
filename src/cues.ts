import type { Cue } from './types';

export interface CueIndices {
  currentIdx: number;
  nextIdx: number;
}

/** Returns the index of the currently active cue and the next cue. */
export function getCueIndices(elapsed: number, cues: Cue[]): CueIndices {
  const clampedElapsed = Math.max(0, elapsed);
  let currentIdx = -1;
  for (let i = 0; i < cues.length; i++) {
    if (cues[i].t <= clampedElapsed) currentIdx = i;
    else break;
  }
  if (elapsed < 0) currentIdx = -1; // during pre-roll, no cue is active
  return { currentIdx, nextIdx: currentIdx + 1 };
}

/** Formats seconds as MM:SS. */
export function fmt(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Parses a "MM:SS" or plain-seconds string into seconds. Returns null on failure. */
export function parseMmSs(str: string): number | null {
  const trimmed = str.trim();
  if (trimmed.includes(':')) {
    const [mStr, sStr] = trimmed.split(':');
    const m = parseInt(mStr, 10);
    const s = parseInt(sStr, 10);
    if (!isNaN(m) && !isNaN(s) && s < 60 && m >= 0) return m * 60 + s;
  } else {
    const n = parseInt(trimmed, 10);
    if (!isNaN(n) && n >= 0) return n;
  }
  return null;
}

/** Generates a short random ID. */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
