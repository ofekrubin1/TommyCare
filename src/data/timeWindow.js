// Logs grow every day, so screens load only a recent window of them (plus older days on request).
import { parseISO } from 'date-fns';
import { shiftDay, todayKey } from '@/lib/time';
import { DAY_START_HOUR } from '@/config/appConfig';

// The time field of each log collection (what the window filters on).
export const TIME_FIELD = {
  feedings: 'time', diapers: 'time', sleeps: 'start', notes: 'time', pumping: 'time', fever: 'time', med_doses: 'time',
};

// Default window: the journal and home show the last 7 days; the journal's "תצוגה מורחבת" loads 30 more at a time.
export const RECENT_DAYS = 7;
export const MORE_DAYS = 30;

// Start of the app day (06:00) `days` days ago, as an ISO instant. Stable for the whole day, so every screen
// asking for the same window shares one live query.
export function windowStart(days = RECENT_DAYS) {
  const d = parseISO(shiftDay(todayKey(), -days));
  d.setHours(DAY_START_HOUR, 0, 0, 0);
  return d.toISOString();
}
