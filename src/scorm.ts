type ScormApi = {
  LMSInitialize: (value: string) => string;
  LMSFinish: (value: string) => string;
  LMSGetValue: (element: string) => string;
  LMSSetValue: (element: string, value: string) => string;
  LMSCommit: (value: string) => string;
};

type ScormWindow = Window & { API?: ScormApi };

let api: ScormApi | null = null;
let initialized = false;
let finished = false;
let startedAt = Date.now();

function findApi(start: Window | null): ScormApi | null {
  let current = start as ScormWindow | null;
  for (let depth = 0; current && depth < 20; depth += 1) {
    try {
      if (current.API) return current.API;
      if (current.parent === current) break;
      current = current.parent as ScormWindow;
    } catch { break; }
  }
  return null;
}

function sessionTime(milliseconds: number) {
  const centiseconds = Math.floor(milliseconds / 10);
  const hours = Math.floor(centiseconds / 360000);
  const minutes = Math.floor((centiseconds % 360000) / 6000);
  const seconds = Math.floor((centiseconds % 6000) / 100);
  const hundredths = centiseconds % 100;
  return `${String(hours).padStart(4, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

export function initializeScorm() {
  if (initialized) return true;
  api = findApi(window);
  if (!api) {
    try { api = findApi(window.opener); } catch { api = null; }
  }
  if (!api || api.LMSInitialize('') !== 'true') { api = null; return false; }
  initialized = true; startedAt = Date.now();
  const status = api.LMSGetValue('cmi.core.lesson_status');
  if (!status || status === 'not attempted') api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
  api.LMSSetValue('cmi.core.score.min', '0');
  api.LMSSetValue('cmi.core.score.max', '100');
  api.LMSCommit('');
  window.addEventListener('pagehide', finishScorm, { once: true });
  return true;
}

export function isScormActive() { return initialized && Boolean(api); }

export function readScormProgress<T>() {
  if (!api || !initialized) return null;
  try {
    const value = api.LMSGetValue('cmi.suspend_data');
    if (!value) return null;
    const parsed = JSON.parse(value) as { version?: number; progress?: T };
    return parsed.progress ?? null;
  } catch { return null; }
}

export function saveScormProgress(progress: Record<string, boolean>) {
  if (!api || !initialized || finished) return;
  const scenarioKeys = ['office', 'evacuation', 'walkway', 'haze', 'reporting'];
  const completedScenarios = scenarioKeys.filter(key => progress[key]).length;
  const score = Math.round((completedScenarios / scenarioKeys.length) * 100);
  const complete = Boolean(progress.completion);
  api.LMSSetValue('cmi.core.score.raw', String(score));
  api.LMSSetValue('cmi.core.lesson_status', complete ? 'completed' : 'incomplete');
  api.LMSSetValue('cmi.core.lesson_location', complete ? 'completion' : `scenario-${completedScenarios + 1}`);
  api.LMSSetValue('cmi.core.exit', complete ? '' : 'suspend');
  api.LMSSetValue('cmi.suspend_data', JSON.stringify({ version: 1, progress }));
  api.LMSCommit('');
}

export function finishScorm() {
  if (!api || !initialized || finished) return;
  api.LMSSetValue('cmi.core.session_time', sessionTime(Date.now() - startedAt));
  api.LMSCommit('');
  api.LMSFinish('');
  finished = true;
}
