// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026  Sayfullah Eid
import type { Cue } from './types';
import { COLOR_HEX, LEAD_IN } from './constants';
import { getCueIndices, fmt } from './cues';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const clockDisplay = document.getElementById('clockDisplay') as HTMLElement;
const prerollLabel = document.getElementById('prerollLabel') as HTMLElement;
const statusText   = document.getElementById('statusText')   as HTMLElement;
const nowWho       = document.getElementById('nowWho')       as HTMLElement;
const nowIn        = document.getElementById('nowIn')        as HTMLElement;
const nextWho      = document.getElementById('nextWho')      as HTMLElement;
const nextIn       = document.getElementById('nextIn')       as HTMLElement;
const nowCard      = document.getElementById('nowCard')      as HTMLElement;
const nextCard     = document.getElementById('nextCard')     as HTMLElement;
const nextEyebrow  = document.getElementById('nextEyebrow')  as HTMLElement;
const cueListEl    = document.getElementById('cueList')      as HTMLElement;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Rebuilds the static cue list rows (call when cues change). */
export function buildCueList(cues: Cue[]): void {
  cueListEl.innerHTML = '';
  cues.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'cue';
    row.id = `cue-${i}`;
    row.style.setProperty('--row-color', COLOR_HEX[c.color]);
    row.innerHTML = `
      <div class="t">${fmt(c.t)}</div>
      <div class="dot" style="background:${COLOR_HEX[c.color]}"></div>
      <div class="name">${escapeHtml(c.name)}</div>
      <div class="tag" style="color:${COLOR_HEX[c.color]}">${c.color.toUpperCase()}</div>
    `;
    cueListEl.appendChild(row);
  });
}

/** Full render: clock, now/next cards, cue row highlights. */
export function renderAll(elapsed: number, running: boolean, cues: Cue[]): void {
  renderClock(elapsed, running);
  renderNowNext(elapsed, running, cues);
  renderCueRows(elapsed, cues);
}

function renderClock(elapsed: number, running: boolean): void {
  if (elapsed < 0) {
    clockDisplay.textContent = String(Math.ceil(-elapsed));
    clockDisplay.className = 'clock preroll';
    prerollLabel.style.visibility = 'visible';
  } else {
    clockDisplay.textContent = fmt(elapsed);
    clockDisplay.className = `clock ${running ? 'running' : 'paused'}`;
    prerollLabel.style.visibility = 'hidden';
  }

  statusText.textContent =
    elapsed < 0  ? 'STARTING' :
    running      ? 'RUNNING'  :
    elapsed > 0  ? 'PAUSED'   : 'READY';
}

function renderNowNext(elapsed: number, running: boolean, cues: Cue[]): void {
  const { currentIdx, nextIdx } = getCueIndices(elapsed, cues);

  // Now card
  if (currentIdx >= 0) {
    const c = cues[currentIdx];
    nowWho.innerHTML = `<span class="swatch" style="background:${COLOR_HEX[c.color]}"></span>${escapeHtml(c.name)}`;
    nowCard.style.setProperty('--now-color', COLOR_HEX[c.color]);
    nowIn.textContent = `cue started ${fmt(Math.max(0, elapsed) - c.t)} ago`;
  } else {
    nowWho.textContent = '—';
    nowIn.textContent =
      elapsed < 0 ? 'action starts when clock hits 0' :
      running     ? 'waiting for first cue'            :
                    'press start to begin';
  }

  // Next card
  if (nextIdx < cues.length) {
    const n = cues[nextIdx];
    nextWho.innerHTML = `<span class="swatch" style="background:${COLOR_HEX[n.color]}"></span>${escapeHtml(n.name)}`;
    const until = n.t - Math.max(0, elapsed);
    nextIn.textContent = `in ${fmt(until)}`;
    nextCard.style.setProperty('--next-color', COLOR_HEX[n.color]);
    const inLeadIn = running && until <= LEAD_IN && until > 0;
    nextCard.classList.toggle('leadin', inLeadIn);
    nextEyebrow.textContent = inLeadIn ? 'Get Ready' : 'Next Up';
  } else {
    nextWho.textContent = currentIdx === cues.length - 1 ? 'Scene complete' : '—';
    nextIn.textContent  = '';
    nextCard.classList.remove('leadin');
    nextCard.style.removeProperty('--next-color');
    nextEyebrow.textContent = 'Next Up';
  }
}

function renderCueRows(elapsed: number, cues: Cue[]): void {
  const { currentIdx } = getCueIndices(elapsed, cues);
  cues.forEach((_, i) => {
    const row = document.getElementById(`cue-${i}`);
    if (!row) return;
    row.classList.toggle('active', i === currentIdx);
    row.classList.toggle('done',   i < currentIdx);
  });
}
