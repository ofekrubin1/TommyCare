// Builds an .ics calendar event (opens "Add to Calendar" on iPhone) with reminders a day and 2 hours before.
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const compact = (date) => date.replace(/-/g, '');
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function nextDay(date) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function addMinutes(date, time, minutes) {
  const d = new Date(`${date}T${time}:00`);
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export function appointmentIcs({ id, title, date, time, location, description, durationMinutes = 30 }) {
  const when = time
    ? [`DTSTART;TZID=Asia/Jerusalem:${compact(date)}T${time.replace(':', '')}00`, `DTEND;TZID=Asia/Jerusalem:${addMinutes(date, time, durationMinutes)}`]
    : [`DTSTART;VALUE=DATE:${compact(date)}`, `DTEND;VALUE=DATE:${compact(nextDay(date))}`];
  const alarm = (trigger) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, `TRIGGER:${trigger}`, 'END:VALARM'];
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TommyCare//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@tommycare`, `DTSTAMP:${stamp()}`, ...when,
    `SUMMARY:${esc(title)}`,
    location && `LOCATION:${esc(location)}`,
    description && `DESCRIPTION:${esc(description)}`,
    ...alarm('-P1D'), ...(time ? alarm('-PT2H') : []),
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}
