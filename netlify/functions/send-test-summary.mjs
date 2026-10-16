// Settings → "מייל בדיקה". Uses the caller's own login token, so only signed-in family members can trigger it,
// and it only ever emails the addresses saved in Settings. Also checks the system (robot) account the 06:00 job uses.
process.env.TZ = 'Asia/Jerusalem';

import { firestore, robotToken } from '../lib/firestore.mjs';
import { buildSummaryEmail, loadDayData, recipientsOf } from '../lib/dailySummary.mjs';
import { sendMail } from '../lib/mailer.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const db = firestore(token);
    const settings = (await db.get('settings', 'app')) || {};
    const to = recipientsOf(settings);
    if (!to.length) return Response.json({ ok: false, error: 'no_email' }, { status: 400 });
    const email = buildSummaryEmail({ babyName: settings.baby_name, data: await loadDayData(db), appUrl: process.env.URL, test: true });
    await sendMail({ to: to.join(', '), ...email });
    return Response.json({ ok: true, to: to.join(', '), robot: await checkRobot() });
  } catch (err) {
    console.error(err);
    const denied = /PERMISSION_DENIED|UNAUTHENTICATED|40[13]/.test(err.message);
    return Response.json({ ok: false, error: denied ? 'not_signed_in' : err.message }, { status: denied ? 401 : 500 });
  }
};

// Can the 06:00 job sign in and read the data? Returns 'ok' or the reason it can't.
async function checkRobot() {
  try {
    await firestore(await robotToken()).get('settings', 'app');
    return 'ok';
  } catch (err) {
    return err.message.includes('TC_ROBOT') ? 'missing' : /INVALID|PASSWORD|EMAIL_NOT_FOUND|400/.test(err.message) ? 'bad_login' : 'error';
  }
}

export const config = { path: '/api/send-test-summary' };
