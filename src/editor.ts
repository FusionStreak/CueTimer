import type { Cue, ColorKey } from './types';
import { COLOR_HEX } from './constants';
import { parseMmSs, fmt, generateId } from './cues';

export type UpdateCallback = (cues: Cue[]) => void;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const panel   = document.getElementById('editorPanel')   as HTMLElement;
const overlay = document.getElementById('editorOverlay') as HTMLElement;
const closeBtn = document.getElementById('editorCloseBtn') as HTMLButtonElement;
const rowsEl  = document.getElementById('editorRows')    as HTMLElement;
const addBtn  = document.getElementById('addCueBtn')     as HTMLButtonElement;

// ── Module state ──────────────────────────────────────────────────────────────
let _cues: Cue[] = [];
let _onUpdate: UpdateCallback = () => {};
let _dragSrcIdx: number | null = null;

// ── Public API ────────────────────────────────────────────────────────────────

export function openEditor(initialCues: Cue[], callback: UpdateCallback): void {
  _cues = initialCues.map(c => ({ ...c }));
  _onUpdate = callback;
  renderRows();
  panel.classList.add('open');
  overlay.classList.add('open');
}

// ── Internal ──────────────────────────────────────────────────────────────────

function closeEditor(): void {
  _cues.sort((a, b) => a.t - b.t);
  _onUpdate(_cues);
  panel.classList.remove('open');
  overlay.classList.remove('open');
}

closeBtn.addEventListener('click', closeEditor);
overlay.addEventListener('click', closeEditor);

addBtn.addEventListener('click', () => {
  const lastT = _cues.length > 0 ? _cues[_cues.length - 1].t + 10 : 0;
  _cues.push({ id: generateId(), t: lastT, name: 'New Cue', color: 'green' });
  renderRows();
  _onUpdate([..._cues]);
  rowsEl.scrollTop = rowsEl.scrollHeight;
});

function renderRows(): void {
  rowsEl.innerHTML = '';

  _cues.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'editor-row';
    row.draggable = true;

    const colorOptions = (Object.keys(COLOR_HEX) as ColorKey[])
      .map(k => `<option value="${k}"${k === c.color ? ' selected' : ''}>${k}</option>`)
      .join('');

    row.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">⠿</div>
      <input class="time-input" type="text" value="${fmt(c.t)}" title="Time (MM:SS)" />
      <input class="name-input" type="text" value="${escapeAttr(c.name)}" placeholder="Name" />
      <select class="color-select">${colorOptions}</select>
      <div class="color-dot" style="background:${COLOR_HEX[c.color]}"></div>
      <button class="delete-btn icon-btn" title="Delete cue">✕</button>
    `;

    // Capture index for closures — forEach creates a new scope per iteration
    const idx = i;

    const timeInput  = row.querySelector<HTMLInputElement>('.time-input')!;
    const nameInput  = row.querySelector<HTMLInputElement>('.name-input')!;
    const colorSelect = row.querySelector<HTMLSelectElement>('.color-select')!;
    const colorDot   = row.querySelector<HTMLElement>('.color-dot')!;
    const deleteBtn  = row.querySelector<HTMLButtonElement>('.delete-btn')!;

    timeInput.addEventListener('change', () => {
      const t = parseMmSs(timeInput.value);
      if (t !== null) {
        _cues[idx].t = t;
        timeInput.value = fmt(t);
      } else {
        timeInput.value = fmt(_cues[idx].t); // revert invalid input
      }
      _onUpdate([..._cues]);
    });

    nameInput.addEventListener('input', () => {
      _cues[idx].name = nameInput.value;
      _onUpdate([..._cues]);
    });

    colorSelect.addEventListener('change', () => {
      _cues[idx].color = colorSelect.value as ColorKey;
      colorDot.style.background = COLOR_HEX[_cues[idx].color];
      _onUpdate([..._cues]);
    });

    deleteBtn.addEventListener('click', () => {
      _cues.splice(idx, 1);
      renderRows();
      _onUpdate([..._cues]);
    });

    // Drag-and-drop reorder
    row.addEventListener('dragstart', (e) => {
      _dragSrcIdx = idx;
      row.classList.add('dragging');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      rowsEl.querySelectorAll('.editor-row.drag-over')
        .forEach(r => r.classList.remove('drag-over'));
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (_dragSrcIdx === null || _dragSrcIdx === idx) return;
      const [moved] = _cues.splice(_dragSrcIdx, 1);
      _cues.splice(idx, 0, moved);
      _dragSrcIdx = null;
      renderRows();
      _onUpdate([..._cues]);
    });

    rowsEl.appendChild(row);
  });
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
