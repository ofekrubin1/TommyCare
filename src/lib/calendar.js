// "Add to iPhone calendar" for an app event { id, title, date, time, durationMinutes, location, description, alarms }:
// a real .ics URL (blob/data links do nothing on iOS). Google Calendar is added via its API (googleCalendar.js).
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
