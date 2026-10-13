import { differenceInCalendarDays, format, parseISO } from 'date-fns';

export const DOCTOR_TYPES = ['רופא/ת ילדים', 'טיפת חלב', 'אורתופד/ית', 'עור', 'עיניים', 'אא״ג', 'אחר'];

// Appointment moment: date + time (time optional → end of that day, so it stays "upcoming" all day).
export const apptMoment = (a) => parseISO(`${a.date}T${a.time || '23:59'}`);

export const isPast = (a, now = new Date()) => apptMoment(a) < now;

export function whenText(a, now = new Date()) {
  const days = differenceInCalendarDays(parseISO(a.date), now);
  const day = days === 0 ? 'היום' : days === 1 ? 'מחר' : format(parseISO(a.date), 'dd/MM/yyyy');
  return a.time ? `${day} · ${a.time}` : day;
}

export const upcoming = (list, now = new Date()) => list.filter((a) => !isPast(a, now)).sort((a, b) => apptMoment(a) - apptMoment(b));
export const archived = (list, now = new Date()) => list.filter((a) => isPast(a, now)).sort((a, b) => apptMoment(b) - apptMoment(a));
