// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026  Sayfullah Eid
import type { Cue } from './types';

const PREFIX = 'cues=';

export function encodeCues(cues: Cue[]): string {
  return btoa(encodeURIComponent(JSON.stringify(cues)));
}

export function decodeCues(encoded: string): Cue[] | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as Cue[];
  } catch { return null; }
}

/** Returns a full URL with the cue list encoded in the hash. */
export function buildShareUrl(cues: Cue[]): string {
  const url = new URL(window.location.href);
  url.hash = PREFIX + encodeCues(cues);
  return url.toString();
}

/** Reads cues from the current page's URL hash, or null if absent/invalid. */
export function parseHashCues(): Cue[] | null {
  const hash = window.location.hash.slice(1); // strip leading #
  if (!hash.startsWith(PREFIX)) return null;
  return decodeCues(hash.slice(PREFIX.length));
}
