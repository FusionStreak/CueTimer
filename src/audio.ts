// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026  Sayfullah Eid
import type { ColorKey } from './types';

// Each color maps to a distinct pitch so cue sounds are identifiable
const PITCH: Record<ColorKey, number> = {
  green:  880,
  yellow: 660,
  orange: 550,
  blue:   440,
  red:    330,
};

let _ctx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext | null {
  if (!('AudioContext' in window)) return null;
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
}

/** Must be called from a user-gesture handler to unblock Web Audio on iOS/Safari. */
export function resumeAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') void c.resume();
}

function beep(freq: number, duration: number, gain: number): void {
  const c = getCtx();
  if (!c) return;
  const osc  = c.createOscillator();
  const gainNode = c.createGain();
  osc.connect(gainNode);
  gainNode.connect(c.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gainNode.gain.setValueAtTime(0, c.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration + 0.02);
}

export function setMuted(value: boolean): void { _muted = value; }
export function isMuted(): boolean { return _muted; }

/** Play a pitched tone when a cue activates. */
export function triggerCue(color: ColorKey): void {
  if (_muted) return;
  beep(PITCH[color], 0.25, 0.5);
}

/** Play a soft blip when entering the lead-in window. */
export function triggerLeadIn(): void {
  if (_muted) return;
  beep(880, 0.08, 0.2);
}
