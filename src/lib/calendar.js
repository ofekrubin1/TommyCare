import { API_ORIGIN } from '@/config/appConfig';

// Event lengths to choose from (appointments, task reminders), in minutes.
// `short`: for a one-row picker.
export const EVENT_DURATIONS = [
  { value: 15, label: '15 דק׳', short: '15 ד׳' }, { value: 30, label: 'חצי שעה', short: '30 ד׳' }, { value: 45, label: '45 דק׳', short: '45 ד׳' },
  { value: 60, label: 'שעה', short: 'שעה' }, { value: 90, label: 'שעה וחצי', short: '1.5 ש׳' }, { value: 120, label: 'שעתיים', short: '2 ש׳' },
];

// "Add to iPhone calendar" for an app event { id, title, date, time, durationMinutes, location, description, alarms }:
// a real .ics URL (blob/data links do nothing on iOS). Google Calendar is added via its API (googleCalendar.js).
export function icsUrl({ id, title, date, time, durationMinutes = 30, location, description, alarms = [] }) {
  const q = new URLSearchParams({ uid: id || '', title, min: String(durationMinutes), alarms: alarms.join(',') });
  if (time) q.set('start', new Date(`${date}T${time}:00`).toISOString()); else q.set('date', date);
  if (location) q.set('loc', location);
  if (description) q.set('desc', description);
  return `${API_ORIGIN || window.location.origin}/api/ics?${q}`;
}

// Safari shows its "Add to Calendar" screen for the .ics. The file comes from the server's own address
// (tommycare.pages.dev), outside the home-screen app's address, so on iPhone the app opens it in a Safari sheet
// *over* the app: "Add", then "Done" (or swipe down) and you're back in the app. Never navigate the app's own
// window to it (that replaced the app with no way back). Call directly from a tap.
export function openIphoneCalendar(event) {
  const url = icsUrl(event);
  const standalone = window.navigator.standalone || window.matchMedia?.('(display-mode: standalone)').matches;
  // Same address as the app (dev server): an in-app sheet isn't possible, so hand it to Safari itself (iOS 17+).
  const sameOrigin = new URL(url).origin === window.location.origin;
  if (standalone && sameOrigin && /iPhone|iPad|iPod/.test(navigator.userAgent) && url.startsWith('https://')) {
    window.location.href = url.replace(/^https:/, 'x-safari-https:');
  } else {
    window.open(url, '_blank');
  }
}
