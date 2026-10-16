// Google Calendar, entirely in the browser (no server): Google Identity Services gives a short-lived token
// (each person signs in to their own Google account), then the Calendar API is called directly.
// Used to add/update/delete events (appointments, task reminders) and by the appointments import.
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

export async function api(token, path, { method = 'GET', body } = {}) {
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
