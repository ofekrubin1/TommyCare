// Google Calendar, entirely in the browser (no server): Google Identity Services gives a short-lived token,
// then the Calendar API is called directly. Reads appointments (import) and adds/updates/deletes events.
import { format, parseISO } from 'date-fns';
import { GOOGLE_CLIENT_ID } from '@/config/googleConfig';

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const API = 'https://www.googleapis.com/calendar/v3';

export const googleConfigured = () => !!GOOGLE_CLIENT_ID;

let gisLoaded;
let cached = null; // { token, exp }: reused for ~an hour, so later saves need no popup
export function loadGis() {
  gisLoaded ||= new Promise((resolve, reject) => {
    const s = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true });
    s.onload = resolve;
    s.onerror = () => { gisLoaded = null; reject(new Error('Google sign-in could not load')); };
    document.head.appendChild(s);
  });
  return gisLoaded;
}

// The token from earlier in this session, if still valid (no popup).
export const cachedToken = () => (cached && cached.exp > Date.now() ? cached.token : null);

// Opens Google's consent popup (must run from a tap) and resolves with an access token.
export async function getAccessToken() {
  if (cachedToken()) return cachedToken();
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (r) => {
        if (r.error) return reject(new Error(r.error));
        cached = { token: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000 - 60_000 };
        resolve(r.access_token);
      },
      error_callback: (e) => reject(new Error(e?.type || 'popup_closed')),
    });
    client.requestAccessToken({ prompt: '' });
  });
}

async function api(token, path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) }, body: body && JSON.stringify(body),
  });
  if (method === 'DELETE' && (res.status === 404 || res.status === 410)) return null; // already gone
  if (!res.ok) throw new Error(`Google Calendar ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// App event { title, date, time, durationMinutes, location, description, alarms } → Calendar API event (Israel time).
function toGoogleEvent({ title, date, time, durationMinutes = 30, location, description, alarms = [] }) {
  const timed = (d) => ({ dateTime: format(d, "yyyy-MM-dd'T'HH:mm:ss"), timeZone: 'Asia/Jerusalem' });
  const start = time && parseISO(`${date}T${time}`);
  const nextDay = format(new Date(parseISO(date).getTime() + 36 * 3600_000), 'yyyy-MM-dd');
  return {
    summary: title,
    location: location || '',
    description: description || '',
    start: start ? timed(start) : { date },
    end: start ? timed(new Date(start.getTime() + durationMinutes * 60_000)) : { date: nextDay },
    reminders: { useDefault: false, overrides: alarms.map((minutes) => ({ method: 'popup', minutes })) },
  };
}

// Adds the event to the main calendar, or updates it if `eventId` still exists there. Returns { id, updated }.
export async function saveGoogleEvent(token, event, eventId) {
  const body = toGoogleEvent(event);
  if (eventId) {
    try {
      const e = await api(token, `/calendars/primary/events/${encodeURIComponent(eventId)}`, { method: 'PUT', body });
      return { id: e.id, updated: e.updated };
    } catch (err) {
      if (!/ 40[34]$| 410$/.test(err.message)) throw err; // deleted from the calendar → add it again
    }
  }
  const e = await api(token, '/calendars/primary/events', { method: 'POST', body });
  return { id: e.id, updated: e.updated };
}

export const deleteGoogleEvent = (token, eventId) => api(token, `/calendars/primary/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' });

// Kept for a possible "choose calendar" option later.
export async function listCalendars(token) {
  const { items = [] } = await api(token, '/users/me/calendarList?minAccessRole=reader');
  return items.map((c) => ({ id: c.id, name: c.summaryOverride || c.summary, primary: !!c.primary }));
}

const plainText = (html) => (html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

// "תום-טיפת חלב" / "תום - טיפת חלב" / "תום טיפת חלב" → "טיפת חלב". Other events → null (not Tom's).
export function doctorFromTitle(title, babyName) {
  const t = (title || '').trim(), name = (babyName || '').trim();
  if (!name || !t.startsWith(name)) return null;
  const rest = t.slice(name.length).replace(/^[\s\-–—:·]+/, '').trim();
  return rest || 'תור';
}

// The app's own exported events carry UID "<appointment id>@tommycare".
export const appIdFromUid = (uid) => (uid?.endsWith('@tommycare') ? uid.slice(0, -'@tommycare'.length) : null);

// Events titled "<baby name>-…", from a month ago to a year ahead, as appointment fields.
export async function fetchEvents(token, babyName, calendarId = 'primary') {
  const min = new Date(Date.now() - 30 * 864e5).toISOString();
  const max = new Date(Date.now() + 365 * 864e5).toISOString();
  const events = [];
  let pageToken = '';
  do {
    const q = new URLSearchParams({ timeMin: min, timeMax: max, singleEvents: 'true', orderBy: 'startTime', maxResults: '250', ...(pageToken && { pageToken }) });
    const body = await api(token, `/calendars/${encodeURIComponent(calendarId)}/events?${q}`);
    events.push(...(body.items || []));
    pageToken = body.nextPageToken || '';
  } while (pageToken);
  return events.filter((e) => e.status !== 'cancelled' && e.start && doctorFromTitle(e.summary, babyName)).map((e) => {
    const start = e.start.dateTime ? parseISO(e.start.dateTime) : null;
    return {
      google_event_id: e.id,
      google_updated: e.updated,
      ical_uid: e.iCalUID || '',
      doctor_type: doctorFromTitle(e.summary, babyName),
      date: start ? format(start, 'yyyy-MM-dd') : e.start.date,
      time: start ? format(start, 'HH:mm') : '',
      location: (e.location || '').trim(),
      note: plainText(e.description),
    };
  });
}

// Merges calendar events into existing appointments. Never touches "done" or "what happened".
// Returns { add: [...], update: [{ id, data }], remove: [id] }.
export function planSync(appointments, events) {
  const byEvent = new Map(appointments.filter((a) => a.google_event_id).map((a) => [a.google_event_id, a]));
  const byId = new Map(appointments.map((a) => [a.id, a]));
  const seen = new Set(events.map((e) => e.google_event_id));
  const add = [], update = [], remove = [];
  for (const e of events) {
    const existing = byEvent.get(e.google_event_id);
    const exported = !existing && byId.get(appIdFromUid(e.ical_uid));
    if (exported) update.push({ id: exported.id, data: { google_event_id: e.google_event_id, google_updated: e.google_updated } }); // just link it
    else if (!existing) add.push({ ...e, summary: '', done: false });
    else if (existing.google_updated !== e.google_updated) update.push({ id: existing.id, data: e });
  }
  const windowStart = format(new Date(Date.now() - 30 * 864e5), 'yyyy-MM-dd');
  for (const a of byEvent.values()) {
    // Deleted from the calendar (and still open) → remove here too.
    if (!seen.has(a.google_event_id) && !a.done && a.date >= windowStart) remove.push(a.id);
  }
  return { add, update, remove };
}
