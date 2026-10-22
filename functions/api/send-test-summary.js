// POST /api/send-test-summary (Settings → "מייל בדיקה"). Uses the caller's own login token, so only signed-in
// family members can trigger it, and it only emails the addresses saved in Settings. Also checks the system
// (robot) account the scheduled jobs use.
import { firestore, robotToken } from '../../server/firestore.js';
import { sendMail } from '../../server/mailer.js';
import { dailySummary } from '../../server/jobs.js';
import { loadFamilySettings } from '../../server/family.js';

async function checkRobot(env) {
  try {
    await loadFamilySettings(firestore(await robotToken(env)));
    return 'ok';
  } catch (err) {
    return err.message.includes('TC_ROBOT') ? 'missing' : /INVALID|PASSWORD|EMAIL_NOT_FOUND|400/.test(err.message) ? 'bad_login' : 'error';
  }
}

export async function onRequestPost({ request, env }) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  try {
    const db = firestore(token);
    const result = await dailySummary({ db, env, now: Date.now(), mail: (m) => sendMail(env, m) }, { test: true });
    if (result.skipped) return Response.json({ ok: false, error: 'no_email' }, { status: 400 });
    const to = (await loadFamilySettings(db)).summary_emails?.join(', ');
    return Response.json({ ok: true, to, robot: await checkRobot(env) });
  } catch (err) {
    console.error(err);
    const denied = /PERMISSION_DENIED|UNAUTHENTICATED|40[13]/.test(err.message);
    return Response.json({ ok: false, error: denied ? 'not_signed_in' : err.message }, { status: denied ? 401 : 500 });
  }
}
