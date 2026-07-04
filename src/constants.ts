import type { ColorKey, Cue } from './types';

export const COLOR_HEX: Record<ColorKey, string> = {
  green:  '#55c34a',
  yellow: '#e2c93b',
  orange: '#e08a2c',
  blue:   '#3e8fd6',
  red:    '#d64545',
};

export const PRE_ROLL = 5; // seconds of countdown before elapsed reaches 0
export const LEAD_IN  = 5; // seconds before a cue to show "Get Ready" warning

export const DEFAULT_CUES: Cue[] = [
  { id: 'd1', t: 0,   name: 'KAS',     color: 'green'  },
  { id: 'd2', t: 10,  name: 'Dwarf',   color: 'yellow' },
  { id: 'd3', t: 20,  name: 'CANI',    color: 'orange' },
  { id: 'd4', t: 31,  name: 'Dwarf',   color: 'yellow' },
  { id: 'd5', t: 55,  name: 'Dovekie', color: 'blue'   },
  { id: 'd6', t: 100, name: 'KAS',     color: 'green'  },
  { id: 'd7', t: 129, name: 'Dwarf',   color: 'yellow' },
  { id: 'd8', t: 160, name: 'END',     color: 'red'    },
];
