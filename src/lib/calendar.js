// "Add to calendar" for appointments and tasks: Google Calendar (a link that always works) or the iPhone calendar (.ics).
import { appointmentIcs } from './ics';

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

// Event: { id, title, date: 'yyyy-MM-dd', time: 'HH:mm' | '', location?, description?, durationMinutes? }
export function googleCalendarUrl({ title, date, time, location, description, durationMinutes = 30 }) {
  const dates = time
    ? `${compact(date)}T${time.replace(':', '')}00/${plusMinutes(date, time, durationMinutes)}`
    : `${compact(date)}/${nextDay(date)}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates, ctz: 'Asia/Jerusalem' });
  if (location) q.set('location', location);
  if (description) q.set('details', description);
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function openGoogleCalendar(event) {
  window.open(googleCalendarUrl(event), '_blank', 'noopener');
}

// iPhone: navigating to the calendar file makes Safari show "Add to Calendar" (a blob download often does nothing there).
export function openIphoneCalendar(event) {
  window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(appointmentIcs(event))}`;
}
