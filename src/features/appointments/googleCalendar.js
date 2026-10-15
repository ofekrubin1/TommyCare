// Reads appointments from Google Calendar, entirely in the browser (no server):
// Google Identity Services gives a short-lived read-only token, then the Calendar API is called directly.
import { format, parseISO } from 'date-fns';
import { GOOGLE_CLIENT_ID } from '@/config/googleConfig';

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const API = 'https://www.googleapis.com/calendar/v3';

export const googleConfigured = () => !!GOOGLE_CLIENT_ID;

let gisLoaded;
function loadGis() {
  gisLoaded ||= new Promise((resolve, reject) => {
    const s = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true });
    s.onload = resolve;
    s.onerror = () => { gisLoaded = null; reject(new Error('Google sign-in could not load')); };
    document.head.appendChild(s);
  });
  return gisLoaded;
}

// Opens Google's consent popup (must run from a tap) and resolves with an access token.
export async function getAccessToken() {
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (r) => (r.error ? reject(new Error(r.error)) : resolve(r.access_token)),
      error_callback: (e) => reject(new Error(e?.type || 'popup_closed')),
    });
    client.requestAccessToken({ prompt: '' });
  });
}

async function api(token, path) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Google Calendar ${res.status}`);
  return res.json();
}

export async function listCalendars(token) {
  const { items = [] } = await api(token, '/users/me/calendarList?minAccessRole=reader');
  return items.map((c) => ({ id: c.id, name: c.summaryOverride || c.summary, primary: !!c.primary }));
}

const plainText = (html) => (html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

// Events from a month ago to a year ahead, as appointment fields.
export async function fetchEvents(token, calendarId) {
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
  return events.filter((e) => e.status !== 'cancelled' && e.start).map((e) => {
    const start = e.start.dateTime ? parseISO(e.start.dateTime) : null;
    return {
      google_event_id: e.id,
      google_updated: e.updated,
      doctor_type: (e.summary || 'תור').trim(),
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
  const seen = new Set(events.map((e) => e.google_event_id));
  const add = [], update = [], remove = [];
  for (const e of events) {
    const existing = byEvent.get(e.google_event_id);
    if (!existing) add.push({ ...e, summary: '', done: false });
    else if (existing.google_updated !== e.google_updated) update.push({ id: existing.id, data: e });
  }
  const windowStart = format(new Date(Date.now() - 30 * 864e5), 'yyyy-MM-dd');
  for (const a of byEvent.values()) {
    // Deleted from the calendar (and still open) → remove here too.
    if (!seen.has(a.google_event_id) && !a.done && a.date >= windowStart) remove.push(a.id);
  }
  return { add, update, remove };
}
