// Cron parser: next N runs + human-readable explanation.
// Supports 5-field standard cron (minute, hour, day-of-month, month, day-of-week).

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'] as const;
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface CronField {
  values: number[];   // sorted unique
  raw: string;        // original text
  step?: number;      // if `*/N`
}

const MAX_VALUES = [59, 23, 31, 12, 7]; // inclusive max for each field (0-based for DOW: 0=Sun)

function parseField(raw: string, min: number, max: number): CronField {
  const trimmed = raw.trim();
  let step = 1;
  let body = trimmed;
  if (trimmed.includes('/')) {
    const [b, s] = trimmed.split('/');
    body = b!;
    step = Math.max(1, parseInt(s || '1', 10));
  }
  const out = new Set<number>();
  for (const part of body.split(',')) {
    const p = part.trim();
    if (p === '*') {
      for (let v = min; v <= max; v++) out.add(v);
    } else if (p.includes('-')) {
      const [lo, hi] = p.split('-').map(x => parseInt(x, 10));
      if (isNaN(lo!) || isNaN(hi!)) throw new Error(`bad range: ${p}`);
      for (let v = lo!; v <= hi!; v++) out.add(v);
    } else {
      const v = parseInt(p, 10);
      if (isNaN(v)) throw new Error(`bad value: ${p}`);
      out.add(v);
    }
  }
  if (step > 1) {
    const minVal = Math.min(...out);
    const stepped = new Set<number>();
    for (let v = minVal; v <= max; v += step) stepped.add(v);
    return { values: [...stepped].sort((a, b) => a - b), raw: trimmed, step };
  }
  return { values: [...out].sort((a, b) => a - b), raw: trimmed };
}

export interface ParsedCron {
  fields: [CronField, CronField, CronField, CronField, CronField];
  raw: string;
}

export function parseCron(expr: string): ParsedCron {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`expected 5 fields, got ${parts.length}`);
  }
  const mins = parseField(parts[0]!, 0, MAX_VALUES[0]!);
  const hours = parseField(parts[1]!, 0, MAX_VALUES[1]!);
  const doms = parseField(parts[2]!, 1, MAX_VALUES[2]!);
  const months = parseField(parts[3]!, 1, MAX_VALUES[3]!);
  const dows = parseField(parts[4]!, 0, MAX_VALUES[4]!);
  return { fields: [mins, hours, doms, months, dows], raw: expr.trim() };
}

function nextOccurrence(parsed: ParsedCron, from: Date, tz: 'UTC' | 'local'): Date | null {
  const [mins, hours, doms, months, dows] = parsed.fields;
  // Work in a copy of `from` and bump minute by 1 to find NEXT run.
  const d = new Date(from.getTime() + 60_000);
  d.setSeconds(0, 0);
  // Use UTC getters for stable iteration
  for (let i = 0; i < 366 * 24 * 60; i++) {
    const month = (tz === 'UTC' ? d.getUTCMonth() : d.getMonth()) + 1;
    const dom = tz === 'UTC' ? d.getUTCDate() : d.getDate();
    const dow = tz === 'UTC' ? d.getUTCDay() : d.getDay();
    const hour = tz === 'UTC' ? d.getUTCHours() : d.getHours();
    const minute = tz === 'UTC' ? d.getUTCMinutes() : d.getMinutes();
    if (months.values.includes(month) && dows.values.includes(dow) && doms.values.includes(dom) && hours.values.includes(hour) && mins.values.includes(minute)) {
      return d;
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return null;
}

export function nextRuns(parsed: ParsedCron, n: number, tz: 'UTC' | 'local'): Date[] {
  const runs: Date[] = [];
  let cursor = new Date();
  for (let i = 0; i < n; i++) {
    const r = nextOccurrence(parsed, cursor, tz);
    if (!r) break;
    runs.push(r);
    cursor = r;
  }
  return runs;
}

function fieldDescription(f: CronField, max: number, isDow: boolean): string {
  if (f.raw === '*') return 'every';
  if (f.raw.startsWith('*/')) return `every ${f.raw.slice(2)}`;
  if (f.raw.includes(',')) return `on ${f.raw}`;
  if (f.raw.includes('-')) {
    const [lo, hi] = f.raw.split('-');
    if (isDow) return `on ${DOW_NAMES[parseInt(lo!, 10)]}-${DOW_NAMES[parseInt(hi!, 10)]}`;
    if (max === 12) return `in months ${lo}-${hi}`;
    if (max === 31) return `on day ${lo}-${hi} of the month`;
    if (max === 23) return `during hours ${lo}-${hi}`;
    return `values ${lo}-${hi}`;
  }
  const v = parseInt(f.raw, 10);
  if (isNaN(v)) return f.raw;
  if (isDow) return `on ${DOW_NAMES[v]}`;
  if (max === 12) return `in ${MONTH_NAMES[v]}`;
  return `at ${v}`;
}

export function explain(parsed: ParsedCron): string {
  const [mins, hours, doms, months, dows] = parsed.fields;
  return `Runs ${fieldDescription(mins, 60, false)} minute, ${fieldDescription(hours, 23, false)}, ${fieldDescription(doms, 31, false)}, ${fieldDescription(months, 12, false)}, ${fieldDescription(dows, 7, true)}.`;
}

function $(id: string) { return document.getElementById(id)!; }

export function cronSection() {
  const input = $('cron-input') as HTMLInputElement;
  const tz = $('cron-tz') as HTMLSelectElement;
  const errEl = $('cron-error');
  const nextList = $('cron-next');
  const explainEl = $('cron-explain');

  function run() {
    errEl.classList.add('hidden');
    nextList.innerHTML = '';
    try {
      const parsed = parseCron(input.value);
      const tzMode = tz.value as 'UTC' | 'local';
      const runs = nextRuns(parsed, 10, tzMode);
      const frag = document.createDocumentFragment();
      for (const r of runs) {
        const li = document.createElement('li');
        li.className = 'px-4 py-2 flex items-center justify-between hover:bg-bg transition-colors';
        const left = document.createElement('span');
        left.className = 'text-ink';
        left.textContent = (tzMode === 'UTC' ? r.toISOString() : r.toLocaleString()).replace('T', ' ').slice(0, 19);
        const right = document.createElement('span');
        const diff = r.getTime() - Date.now();
        right.className = 'text-xs text-muted';
        if (diff < 60_000) right.textContent = 'in <1 min';
        else if (diff < 3_600_000) right.textContent = `in ${Math.round(diff / 60_000)} min`;
        else if (diff < 86_400_000) right.textContent = `in ${Math.round(diff / 3_600_000)} h`;
        else right.textContent = `in ${Math.round(diff / 86_400_000)} d`;
        li.append(left, right);
        frag.appendChild(li);
      }
      nextList.appendChild(frag);
      explainEl.textContent = explain(parsed);
    } catch (e) {
      errEl.textContent = (e as Error).message;
      errEl.classList.remove('hidden');
      explainEl.textContent = '—';
    }
  }

  input.addEventListener('input', run);
  tz.addEventListener('change', run);

  if (!input.value) input.value = '*/15 9-17 * * 1-5';
  run();
}
