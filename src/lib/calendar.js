// "Add to calendar" for an app event { id, title, date, time, durationMinutes, location, description, alarms }.
// iPhone: a real .ics URL (blob/data links do nothing on iOS). Google: the Calendar API (see googleCalendar.js),
// or Google's "new event" page when no Google Client ID is set.
const compact = (date) => date.replace(/-/g, '');
const pad = (n) => String(n).padStart(2, '0');

function plusMinutes(date, time, minutes) {
  const d = new Date(`${date}T${time}:00`);
  d.setMinutes(d.getMinutes() + minutes);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function nextDay(date) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function googleCalendarUrl({ title, date, time, location, description, durationMinutes = 30 }) {
  const dates = time ? `${compact(date)}T${time.replace(':', '')}00/${plusMinutes(date, time, durationMinutes)}` : `${compact(date)}/${nextDay(date)}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates, ctz: 'Asia/Jerusalem' });
  if (location) q.set('location', location);
  if (description) q.set('details', description);
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function openGoogleCalendarPage(event) {
  window.open(googleCalendarUrl(event), '_blank', 'noopener');
}

export function icsUrl({ id, title, date, time, durationMinutes = 30, location, description, alarms = [] }) {
  const q = new URLSearchParams({ uid: id || '', title, min: String(durationMinutes), alarms: alarms.join(',') });
  if (time) q.set('start', new Date(`${date}T${time}:00`).toISOString()); else q.set('date', date);
  if (location) q.set('loc', location);
  if (description) q.set('desc', description);
  return `${window.location.origin}/.netlify/functions/ics?${q}`;
}

// Safari shows "Add to Calendar" for the .ics. From the home-screen app, open it in Safari's sheet instead
// (the app window itself ignores calendar files). Call directly from a tap.
export function openIphoneCalendar(event) {
  const url = icsUrl(event);
  if (window.navigator.standalone || window.matchMedia?.('(display-mode: standalone)').matches) window.open(url, '_blank');
  else window.location.href = url;
}
