import { addDays, differenceInCalendarDays, differenceInMinutes, format, parseISO, subHours } from 'date-fns';
import { DAY_START_HOUR } from '../config/appConfig.js';

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Which "day" (yyyy-MM-dd, starting 06:00) a moment belongs to.
export const dayKey = (iso) => format(subHours(typeof iso === 'string' ? parseISO(iso) : iso, DAY_START_HOUR), 'yyyy-MM-dd');
export const todayKey = () => dayKey(new Date());
export const shiftDay = (key, n) => format(addDays(parseISO(key), n), 'yyyy-MM-dd');

export const hm = (iso) => format(parseISO(iso), 'HH:mm');
export const dm = (key) => format(parseISO(key), 'dd/MM');

export function dayLabel(key) {
  const diff = differenceInCalendarDays(parseISO(todayKey()), parseISO(key));
  if (diff === 0) return 'היום';
  if (diff === 1) return 'אתמול';
  return `יום ${HE_DAYS[parseISO(key).getDay()]} · ${dm(key)}`;
}

// Form value "yyyy-MM-ddTHH:mm" and back. New entries start at now, rounded to the nearest 5 minutes.
export function roundTo5(d = new Date()) {
  const r = new Date(d);
  r.setSeconds(0, 0);
  r.setMinutes(Math.round(r.getMinutes() / 5) * 5);
  return r;
}
export const toLocalInput = (iso) => format(iso ? parseISO(iso) : roundTo5(), "yyyy-MM-dd'T'HH:mm");
export const fromLocalInput = (v) => new Date(v).toISOString();

export function sinceText(iso, now = new Date()) {
  const min = Math.max(0, differenceInMinutes(now, parseISO(iso)));
  if (min < 1) return 'עכשיו';
  if (min < 60) return `לפני ${min} דק׳`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `לפני ${h}:${String(m).padStart(2, '0')} ש׳` : `לפני ${h} ש׳`;
}

export function durationText(minutes) {
  const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
  if (!h) return `${m} דק׳`;
  return m ? `${h} ש׳ ${m} דק׳` : `${h} ש׳`;
}

// "בת 8 שבועות ו-4 ימים" / "בן ..." (gender: 'girl' | 'boy'; not set → just "8 שבועות ו-4 ימים").
export function ageText(birthDate, now = new Date(), gender = '') {
  if (!birthDate) return '';
  const days = differenceInCalendarDays(now, parseISO(birthDate));
  if (days < 0) return '';
  const p = gender === 'girl' ? 'בת ' : gender === 'boy' ? 'בן ' : '';
  if (days < 14) return `${p}${days} ימים`;
  if (days < 90) return `${p}${Math.floor(days / 7)} שבועות${days % 7 ? ` ו-${days % 7} ימים` : ''}`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${p}${months} חודשים`;
  return `${p}${Math.floor(months / 12)} שנים`;
}
