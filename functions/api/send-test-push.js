// POST /api/send-test-push (Settings → "התראת בדיקה"). Uses the caller's own login token (only signed-in family
// members), and sends to that user's own devices only.
import { firestore } from '../../server/firestore.js';
import { pushConfigured, sendPush } from '../../server/push.js';

const uidOf = (token) => {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).user_id; } catch { return null; }
};

export async function onRequestPost({ request, env }) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  if (!pushConfigured(env)) return Response.json({ ok: false, error: 'no_key' }, { status: 500 });
  try {
    const db = firestore(token);
    // Reading through Firestore with the caller's token is what verifies it (rules reject a bad token).
    const mine = (await db.list('push_subs')).filter((s) => s.uid === uidOf(token) && s.origin === env.APP_URL);
    if (!mine.length) return Response.json({ ok: false, error: 'no_devices' }, { status: 400 });
    const sent = await sendPush(db, { title: 'התראת בדיקה', body: 'ההתראות עובדות ✓', url: '/settings', tag: 'test' }, mine, env);
    return Response.json({ ok: sent > 0, sent, error: sent ? undefined : 'send_failed' });
  } catch (err) {
    console.error(err);
    const denied = /PERMISSION_DENIED|UNAUTHENTICATED|40[13]/.test(err.message);
    return Response.json({ ok: false, error: denied ? 'not_signed_in' : err.message }, { status: denied ? 401 : 500 });
  }
}
