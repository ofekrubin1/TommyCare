// Settings → "שלח מייל בדיקה". Uses the caller's own login token, so only signed-in family members can trigger it,
// and it only ever emails the address saved in Settings.
process.env.TZ = 'Asia/Jerusalem';

import { firestore } from '../lib/firestore.mjs';
import { buildSummaryEmail, loadDayData } from '../lib/dailySummary.mjs';
import { sendMail } from '../lib/mailer.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const db = firestore(token);
    const settings = (await db.get('settings', 'app')) || {};
    if (!settings.summary_email) return Response.json({ ok: false, error: 'no_email' }, { status: 400 });
    const email = buildSummaryEmail({ babyName: settings.baby_name, data: await loadDayData(db), appUrl: process.env.URL, test: true });
    await sendMail({ to: settings.summary_email, ...email });
    return Response.json({ ok: true, to: settings.summary_email });
  } catch (err) {
    console.error(err);
    const denied = /PERMISSION_DENIED|UNAUTHENTICATED|40[13]/.test(err.message);
    return Response.json({ ok: false, error: denied ? 'not_signed_in' : err.message }, { status: denied ? 401 : 500 });
  }
};

export const config = { path: '/api/send-test-summary' };
