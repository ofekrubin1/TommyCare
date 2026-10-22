// GET /api/ics?… → an .ics file for the event in the query string. Served from a real URL (not a blob/data link),
// because that's what makes iPhone Safari show its "Add to Calendar" screen. Stateless: no data is read.
import { icsFromQuery } from '../../src/lib/ics.js';

export function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams;
  if (!q.get('start') && !/^\d{4}-\d{2}-\d{2}$/.test(q.get('date') || '')) return new Response('Missing start or date', { status: 400 });
  return new Response(icsFromQuery(q), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="tommycare.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
