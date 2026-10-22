import { differenceInCalendarDays, parseISO } from 'date-fns';
import { dueDate, VACCINE_SCHEDULE } from '@/features/vaccines/schedule';

// Merges the official schedule with what the family recorded:
//   records keyed by schedule key → given date / note / edited name or due date / hidden
//   records with custom: true    → vaccines added by hand
export function buildVaccineList(birthDate, records) {
  const byId = Object.fromEntries(records.map((r) => [r.id, r]));
  const scheduled = VACCINE_SCHEDULE.map((v) => {
    const r = byId[v.key] || {};
    return {
      key: v.key, custom: false, months: v.months, hidden: !!r.hidden,
      name: r.name || v.name,
      due: r.due_date || dueDate(birthDate, v.months),
      given: r.date || null, note: r.note || '', record: byId[v.key] || null,
    };
  });
  const custom = records.filter((r) => r.custom).map((r) => ({
    key: r.id, custom: true, months: null, hidden: false, name: r.name, due: r.due_date || null, given: r.date || null, note: r.note || '', record: r,
  }));
  return [...scheduled, ...custom].sort((a, b) => (a.due || a.given || '9999').localeCompare(b.due || b.given || '9999'));
}

export function statusOf(v, today = new Date()) {
  if (v.given) return 'done';
  if (!v.due) return '';
  const days = differenceInCalendarDays(parseISO(v.due), today);
  return days < 0 ? 'late' : days <= 14 ? 'soon' : '';
}

// Not given, not hidden, due within `days` (or overdue). Used for the home-screen reminder.
export const dueVaccines = (birthDate, records, days = 14, today = new Date()) =>
  buildVaccineList(birthDate, records).filter((v) => !v.hidden && !v.given && v.due && differenceInCalendarDays(parseISO(v.due), today) <= days);
