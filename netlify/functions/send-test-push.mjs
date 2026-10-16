// Settings → "התראת בדיקה". Uses the caller's own login token (only signed-in family members), and sends
// to that user's own devices only.
import { firestore } from '../lib/firestore.mjs';
import { pushConfigured, sendPush } from '../lib/push.mjs';

const uidOf = (token) => {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).user_id; } catch { return null; }
};

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  if (!pushConfigured()) return Response.json({ ok: false, error: 'no_key' }, { status: 500 });

  try {
    const db = firestore(token);
    // Reading through Firestore with the caller's token is what verifies it (rules reject a bad token).
    const mine = (await db.list('push_subs')).filter((s) => s.uid === uidOf(token));
    if (!mine.length) return Response.json({ ok: false, error: 'no_devices' }, { status: 400 });
    const sent = await sendPush(db, { title: '🔔 TommyCare', body: 'התראת בדיקה: ההתראות עובדות ✓', url: '/settings', tag: 'test' }, mine);
    return Response.json({ ok: sent > 0, sent, error: sent ? undefined : 'send_failed' });
  } catch (err) {
    console.error(err);
    const denied = /PERMISSION_DENIED|UNAUTHENTICATED|40[13]/.test(err.message);
    return Response.json({ ok: false, error: denied ? 'not_signed_in' : err.message }, { status: denied ? 401 : 500 });
  }
};

export const config = { path: '/api/send-test-push' };
