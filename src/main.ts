import './style.css';
import { Timer } from './timer';
import { DEFAULT_CUES, LEAD_IN, PRE_ROLL } from './constants';
import { getCueIndices } from './cues';
import { loadCues, saveCues, loadElapsed, saveElapsed, loadMuted, saveMuted } from './storage';
import { resumeAudio, triggerCue, triggerLeadIn, setMuted, isMuted } from './audio';
import { buildShareUrl, parseHashCues } from './share';
import { buildCueList, renderAll } from './ui';
import { openEditor } from './editor';
import type { Cue } from './types';

// ── State ─────────────────────────────────────────────────────────────────────
let cues: Cue[] = loadCues() ?? DEFAULT_CUES.map(c => ({ ...c }));

// ── Audio transition tracking ─────────────────────────────────────────────────
// prevCueIdx: last cue index for which we fired a sound (-2 = uninitialised)
let prevCueIdx      = -2;
// leadInTriggeredFor: nextIdx for which we already played the lead-in blip
let leadInTriggeredFor = -1;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const startBtn      = document.getElementById('startBtn')      as HTMLButtonElement;
const pauseBtn      = document.getElementById('pauseBtn')      as HTMLButtonElement;
const resetBtn      = document.getElementById('resetBtn')      as HTMLButtonElement;
const editBtn       = document.getElementById('editBtn')       as HTMLButtonElement;
const muteBtn       = document.getElementById('muteBtn')       as HTMLButtonElement;
const copyLinkBtn   = document.getElementById('copyLinkBtn')   as HTMLButtonElement;
const shareModal    = document.getElementById('shareModal')    as HTMLElement;
const shareLoadBtn  = document.getElementById('shareLoadBtn')  as HTMLButtonElement;
const shareDismissBtn = document.getElementById('shareDismissBtn') as HTMLButtonElement;

// ── Timer ─────────────────────────────────────────────────────────────────────
const timer = new Timer(PRE_ROLL);

// Restore persisted elapsed time
const savedElapsed = loadElapsed();
if (savedElapsed !== null && savedElapsed > 0) {
  timer.setElapsed(savedElapsed);
}

// ── Mute ─────────────────────────────────────────────────────────────────────
setMuted(loadMuted());
syncMuteBtn();

// ── Shared-link modal ─────────────────────────────────────────────────────────
const hashCues = parseHashCues();
if (hashCues && hashCues.length > 0) {
  shareModal.style.display = 'flex';

  shareLoadBtn.addEventListener('click', () => {
    cues = hashCues;
    saveCues(cues);
    buildCueList(cues);
    renderAll(timer.elapsed, timer.running, cues);
    shareModal.style.display = 'none';
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  shareDismissBtn.addEventListener('click', () => {
    shareModal.style.display = 'none';
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });
}

// ── Timer tick ────────────────────────────────────────────────────────────────
timer.on((elapsed, running) => {
  renderAll(elapsed, running, cues);
  if (!running) return;

  const { currentIdx, nextIdx } = getCueIndices(elapsed, cues);

  // Fire cue sound when we advance to a new cue
  if (currentIdx >= 0 && currentIdx > prevCueIdx) {
    triggerCue(cues[currentIdx].color);
  }
  prevCueIdx = currentIdx;

  // Fire lead-in blip once when entering the LEAD_IN window
  if (nextIdx < cues.length) {
    const until = cues[nextIdx].t - Math.max(0, elapsed);
    if (until > 0 && until <= LEAD_IN && leadInTriggeredFor !== nextIdx) {
      triggerLeadIn();
      leadInTriggeredFor = nextIdx;
    }
  }

  saveElapsed(elapsed);
});

// ── Button handlers ───────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  resumeAudio(); // must be in a user-gesture handler for iOS Web Audio
  // Seed tracking state so we don't fire stale sounds on resume
  const { currentIdx } = getCueIndices(timer.elapsed, cues);
  prevCueIdx         = currentIdx;
  leadInTriggeredFor = currentIdx; // anything ≤ currentIdx is already "handled"
  timer.start();
});

pauseBtn.addEventListener('click', () => {
  timer.pause();
  saveElapsed(timer.elapsed);
});

resetBtn.addEventListener('click', () => {
  timer.reset();
  prevCueIdx         = -2;
  leadInTriggeredFor = -1;
  saveElapsed(0);
});

editBtn.addEventListener('click', () => {
  openEditor(cues, (updated) => {
    cues = updated;
    saveCues(cues);
    buildCueList(cues);
    renderAll(timer.elapsed, timer.running, cues);
  });
});

muteBtn.addEventListener('click', () => {
  setMuted(!isMuted());
  saveMuted(isMuted());
  syncMuteBtn();
});

copyLinkBtn.addEventListener('click', () => {
  const url = buildShareUrl(cues);
  navigator.clipboard.writeText(url)
    .then(() => {
      const orig = copyLinkBtn.textContent;
      copyLinkBtn.textContent = '✓';
      setTimeout(() => { copyLinkBtn.textContent = orig; }, 1500);
    })
    .catch(() => { prompt('Copy this link:', url); });
});

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const target = e.target as Element;
  if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      timer.running ? pauseBtn.click() : startBtn.click();
      break;
    case 'KeyR':
      if (!e.ctrlKey && !e.metaKey) resetBtn.click();
      break;
    case 'KeyE':
      editBtn.click();
      break;
    case 'KeyM':
      muteBtn.click();
      break;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function syncMuteBtn(): void {
  muteBtn.textContent = isMuted() ? '🔇' : '🔊';
  muteBtn.title       = isMuted() ? 'Unmute (M)' : 'Mute (M)';
}

// ── Boot ──────────────────────────────────────────────────────────────────────
buildCueList(cues);
renderAll(timer.elapsed, timer.running, cues);
