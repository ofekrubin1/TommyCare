// "Add to iPhone calendar" for an app event { id, title, date, time, durationMinutes, location, description, alarms }:
// a real .ics URL (blob/data links do nothing on iOS). Google Calendar is added via its API (googleCalendar.js).
export function icsUrl({ id, title, date, time, durationMinutes = 30, location, description, alarms = [] }) {
  const q = new URLSearchParams({ uid: id || '', title, min: String(durationMinutes), alarms: alarms.join(',') });
  if (time) q.set('start', new Date(`${date}T${time}:00`).toISOString()); else q.set('date', date);
  if (location) q.set('loc', location);
  if (description) q.set('desc', description);
  return `${window.location.origin}/.netlify/functions/ics?${q}`;
}

// Safari shows its "Add to Calendar" screen for the .ics. Never navigate the app's own window to it: in the
// home-screen app that replaces the app with no way back. There, hand the link to Safari itself
// (x-safari-https://, iOS 17+); elsewhere open a new tab. Call directly from a tap.
export function openIphoneCalendar(event) {
  const url = icsUrl(event);
  const standalone = window.navigator.standalone || window.matchMedia?.('(display-mode: standalone)').matches;
  if (standalone && /iPhone|iPad|iPod/.test(navigator.userAgent) && url.startsWith('https://')) {
    window.location.href = url.replace(/^https:/, 'x-safari-https:');
  } else {
    window.open(url, '_blank');
  }
}
