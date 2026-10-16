// Sends Web Push notifications to the devices saved in Firestore (push_subs), from Settings → התראות לטלפון.
// Needs the VAPID_PRIVATE_KEY environment variable (its public half is in src/config/pushConfig.js).
import webpush from 'web-push';
import { VAPID_PUBLIC_KEY } from '../../src/config/pushConfig.js';

export const pushConfigured = () => !!process.env.VAPID_PRIVATE_KEY;

// payload: { title, body, url, tag }. `subs` defaults to every saved device. Returns how many got it.
// Devices that unsubscribed or were reset (404/410) are removed.
export async function sendPush(db, payload, subs) {
  if (!pushConfigured()) throw new Error('Set VAPID_PRIVATE_KEY in Netlify environment variables.');
  webpush.setVapidDetails(`mailto:${process.env.GMAIL_USER || 'tommycare@example.com'}`, VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const list = subs || await db.list('push_subs');
  let sent = 0;
  await Promise.all(list.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 6 * 3600, urgency: 'high' });
      sent++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) await db.remove('push_subs', s.id).catch(() => {});
      else console.error(`push to ${s.device || s.id} failed: ${err.statusCode} ${err.body || err.message}`);
    }
  }));
  return sent;
}
