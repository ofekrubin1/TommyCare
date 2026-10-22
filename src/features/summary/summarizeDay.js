import { differenceInMinutes, parseISO } from 'date-fns';
import { dayKey } from '../../lib/time.js';

// Daily totals for one "day" (06:00 → 06:00). Every log adds to these counts.
export function summarizeDay(key, { feedings = [], diapers = [], sleeps = [], pumping = [] }, now = new Date()) {
  const inDay = (x, field = 'time') => x[field] && dayKey(x[field]) === key;
  const f = feedings.filter((x) => inDay(x));
  const d = diapers.filter((x) => inDay(x));
  const s = sleeps.filter((x) => inDay(x, 'start'));
  const p = pumping.filter((x) => inDay(x));

  const sleepMinutes = s.reduce((sum, x) => sum + Math.max(0, differenceInMinutes(x.end ? parseISO(x.end) : now, parseISO(x.start))), 0);
  return {
    key,
    feedings: f.length,
    breast: f.filter((x) => x.type === 'breast').length,
    formula: f.filter((x) => x.type === 'formula').length,
    pumped: f.filter((x) => x.type === 'pumped').length,
    bottleMl: f.reduce((sum, x) => sum + (Number(x.amount_ml) || 0), 0),
    diapers: d.length,
    pee: d.filter((x) => x.pee).length,
    poop: d.filter((x) => x.poop).length,
    sleepMinutes,
    sleeps: s.length,
    pumpedMl: p.reduce((sum, x) => sum + (Number(x.amount_ml) || 0), 0),
  };
}

// All days that have any record, newest first.
export function daysWithData(sources) {
  const keys = new Set();
  for (const [field, list] of [['time', sources.feedings], ['time', sources.diapers], ['start', sources.sleeps], ['time', sources.notes], ['time', sources.pumping]]) {
    for (const x of list || []) if (x[field]) keys.add(dayKey(x[field]));
  }
  return [...keys].sort().reverse();
}
