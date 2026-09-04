/**
 * SCORM 1.2 API wrapper
 * Finds the LMS-injected API object and exposes typed helpers.
 * Safe to call in non-SCORM environments (ops are no-ops).
 */

type ScormAPI = {
  LMSInitialize: (s: string) => string;
  LMSFinish: (s: string) => string;
  LMSGetValue: (key: string) => string;
  LMSSetValue: (key: string, val: string) => string;
  LMSCommit: (s: string) => string;
  LMSGetLastError: () => string;
};

function findAPI(win: Window & typeof globalThis): ScormAPI | null {
  let attempts = 0;
  let current: Window & typeof globalThis = win;
  while (!('API' in current) && current.parent && current.parent !== current && attempts < 7) {
    attempts++;
    current = current.parent as Window & typeof globalThis;
  }
  return (current as unknown as Record<string, ScormAPI>)['API'] ?? null;
}

let api: ScormAPI | null = null;
let initialized = false;
let sessionStart: number | null = null;

export function scormInit(): boolean {
  if (initialized) return true;
  api = findAPI(window);
  if (!api) return false;
  const result = api.LMSInitialize('');
  initialized = result === 'true';
  if (initialized) {
    sessionStart = Date.now();
    // Set status to incomplete until we explicitly pass/fail
    api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
    api.LMSCommit('');
  }
  return initialized;
}

export function scormSetScore(score: number, min = 0, max = 100): void {
  if (!api || !initialized) return;
  api.LMSSetValue('cmi.core.score.raw', String(Math.round(score)));
  api.LMSSetValue('cmi.core.score.min', String(min));
  api.LMSSetValue('cmi.core.score.max', String(max));
}

export function scormComplete(passed: boolean): void {
  if (!api || !initialized) return;
  api.LMSSetValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');
  api.LMSCommit('');
}

export function scormSetTime(): void {
  if (!api || !initialized || !sessionStart) return;
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  api.LMSSetValue('cmi.core.session_time', `${pad(h)}:${pad(m)}:${pad(s)}`);
}

/** 
 * Store per-zone scores in cmi.suspend_data as JSON.
 * LMS may or may not surface these but they're preserved across sessions.
 */
export function scormSetZoneData(zones: Record<string, number>): void {
  if (!api || !initialized) return;
  try {
    api.LMSSetValue('cmi.suspend_data', JSON.stringify(zones));
  } catch {
    // ignore — suspend_data may be length-limited on some LMS
  }
}

export function scormFinish(): void {
  if (!api || !initialized) return;
  scormSetTime();
  api.LMSCommit('');
  api.LMSFinish('');
  initialized = false;
}
