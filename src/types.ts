// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026  Sayfullah Eid
export type ColorKey = 'green' | 'yellow' | 'orange' | 'blue' | 'red';

export interface Cue {
  id: string;
  t: number; // seconds from scene start
  name: string;
  color: ColorKey;
}
