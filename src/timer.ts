// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026  Sayfullah Eid
export type TimerListener = (elapsed: number, running: boolean) => void;

export class Timer {
  private _elapsed = 0;
  private _running = false;
  private _lastTick: number | null = null;
  private _rafId: number | null = null;
  private readonly _listeners: TimerListener[] = [];
  private readonly _preRoll: number;

  constructor(preRoll: number) {
    this._preRoll = preRoll;
  }

  get elapsed(): number  { return this._elapsed; }
  get running(): boolean { return this._running; }

  on(listener: TimerListener): void {
    this._listeners.push(listener);
  }

  private _emit(): void {
    for (const l of this._listeners) l(this._elapsed, this._running);
  }

  private readonly _tick = (ts: number): void => {
    if (!this._running) return;
    if (this._lastTick === null) this._lastTick = ts;
    const delta = (ts - this._lastTick) / 1000;
    this._lastTick = ts;
    this._elapsed += delta;
    this._emit();
    this._rafId = requestAnimationFrame(this._tick);
  };

  /** Begin (or resume) the timer. On a fresh start (elapsed === 0), begins pre-roll. */
  start(): void {
    if (this._running) return;
    if (this._elapsed === 0) this._elapsed = -this._preRoll;
    this._running = true;
    this._lastTick = null;
    this._rafId = requestAnimationFrame(this._tick);
    this._emit();
  }

  pause(): void {
    this._running = false;
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._emit();
  }

  reset(): void {
    this._running = false;
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._elapsed = 0;
    this._lastTick = null;
    this._emit();
  }

  /** Restore elapsed time without starting the timer (used to reload saved state). */
  setElapsed(value: number): void {
    this._elapsed = value;
    this._emit();
  }
}
