// Builds an .ics calendar event. Pure (no browser/Node APIs), shared by the app, the dev server and
// the /api/ics function (Cloudflare). Timed events are in UTC, so no VTIMEZONE block is needed.
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const compact = (date) => date.replace(/-/g, '');
const CRLF = '\r\n';

function nextDay(date) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// RFC 5545: lines longer than 75 bytes continue on the next line after a space (never inside a character).
function fold(line) {
  const enc = new TextEncoder();
  const out = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join(`${CRLF} `);
}

// { uid, title, start (ISO instant) | date (yyyy-MM-dd, all day), minutes, location, description, alarms: [minutes before] }
export function buildIcs({ uid, title, start, date, minutes = 30, location, description, alarms = [] }) {
  const when = start
    ? [`DTSTART:${utc(new Date(start))}`, `DTEND:${utc(new Date(Date.parse(start) + minutes * 60_000))}`]
    : [`DTSTART;VALUE=DATE:${compact(date)}`, `DTEND;VALUE=DATE:${compact(nextDay(date))}`];
  const alarm = (m) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, `TRIGGER:${m ? `-PT${m}M` : 'PT0M'}`, 'END:VALARM'];
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TommyCare//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || `${Date.now()}`}@tommycare`, `DTSTAMP:${utc(new Date())}`, ...when,
    `SUMMARY:${esc(title)}`,
    location && `LOCATION:${esc(location)}`,
    description && `DESCRIPTION:${esc(description)}`,
    ...alarms.flatMap(alarm),
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).map(fold).join(CRLF) + CRLF;
}

// Query string ⇄ event, for the /api/ics link.
export function icsFromQuery(q) {
  const alarms = (q.get('alarms') || '').split(',').filter((x) => x !== '').map(Number).filter((n) => Number.isFinite(n) && n >= 0);
  return buildIcs({
    uid: q.get('uid'), title: q.get('title') || 'TommyCare', start: q.get('start') || undefined, date: q.get('date') || undefined,
    minutes: Number(q.get('min')) || 30, location: q.get('loc'), description: q.get('desc'), alarms,
  });
}
