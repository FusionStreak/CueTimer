import type { Cue } from './types';

const KEY_CUES    = 'ft:cues';
const KEY_ELAPSED = 'ft:elapsed';
const KEY_MUTED   = 'ft:muted';

export function saveCues(cues: Cue[]): void {
  try { localStorage.setItem(KEY_CUES, JSON.stringify(cues)); } catch { /* storage full */ }
}

export function loadCues(): Cue[] | null {
  try {
    const raw = localStorage.getItem(KEY_CUES);
    return raw ? (JSON.parse(raw) as Cue[]) : null;
  } catch { return null; }
}

export function saveElapsed(n: number): void {
  try { localStorage.setItem(KEY_ELAPSED, String(n)); } catch { /* storage full */ }
}

export function loadElapsed(): number | null {
  const raw = localStorage.getItem(KEY_ELAPSED);
  if (raw === null) return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

export function saveMuted(muted: boolean): void {
  try { localStorage.setItem(KEY_MUTED, muted ? '1' : '0'); } catch { /* storage full */ }
}

export function loadMuted(): boolean {
  return localStorage.getItem(KEY_MUTED) === '1';
}
