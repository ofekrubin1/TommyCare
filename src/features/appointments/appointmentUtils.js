import { addMinutes, differenceInCalendarDays, format, parseISO } from 'date-fns';

export const DOCTOR_TYPES = ['רופא/ת ילדים', 'טיפת חלב', 'אורתופד/ית', 'עור', 'עיניים', 'אא״ג', 'אחר'];

// Appointment moment: date + time (time optional → end of that day).
export const apptMoment = (a) => parseISO(`${a.date}T${a.time || '23:59'}`);

export const isOverdue = (a, now = new Date()) => !a.done && apptMoment(a) < now;

// Appointment length in minutes (for the calendar). Older appointments have none → half an hour.
export const DURATIONS = [{ value: 15, label: '15 דק׳' }, { value: 30, label: 'חצי שעה' }, { value: 45, label: '45 דק׳' }, { value: 60, label: 'שעה' }, { value: 90, label: 'שעה וחצי' }, { value: 120, label: 'שעתיים' }];
export const DEFAULT_DURATION = 30;
export const endTime = (a) => format(addMinutes(apptMoment(a), a.duration || DEFAULT_DURATION), 'HH:mm');

export function whenText(a, now = new Date()) {
  const days = differenceInCalendarDays(parseISO(a.date), now);
  const day = days === 0 ? 'היום' : days === 1 ? 'מחר' : format(parseISO(a.date), 'dd/MM/yyyy');
  if (!a.time) return day;
  return a.duration ? `${day} · ${a.time}–${endTime(a)}` : `${day} · ${a.time}`;
}

// An appointment moves to the archive only when someone marks it as done (not when its time passes).
export const upcoming = (list) => list.filter((a) => !a.done).sort((a, b) => apptMoment(a) - apptMoment(b));
export const archived = (list) => list.filter((a) => a.done).sort((a, b) => apptMoment(b) - apptMoment(a));
