// Cloudflare cron worker: every minute, task reminders + "X hours since feeding" alerts, and (06:00–10:00 Israel
// time) the daily summary email. The logic lives in server/jobs.js; each job runs on its own, so one failing
// doesn't stop the others. Secrets: TC_ROBOT_EMAIL, TC_ROBOT_PASSWORD, GMAIL_USER, GMAIL_APP_PASSWORD, VAPID_PRIVATE_KEY.
import { firestore, robotToken } from '../../server/firestore.js';
import { pushConfigured, sendPush } from '../../server/push.js';
import { sendMail } from '../../server/mailer.js';
import { dailySummary, feedingAlerts, taskReminders } from '../../server/jobs.js';

export async function runJobs(env, now = Date.now()) {
  const db = firestore(await robotToken(env));
  let devices;
  const ctx = {
    db, env, now,
    // only phones of the current app (address saved by the app; old addresses / removed apps are skipped)
    devices: async () => (devices ??= pushConfigured(env) ? (await db.list('push_subs')).filter((s) => s.origin === env.APP_URL) : []),
    push: (payload, list) => sendPush(db, payload, list, env),
    mail: (message) => sendMail(env, message),
  };
  const result = {};
  for (const [name, job] of Object.entries({ tasks: taskReminders, feeding: feedingAlerts, summary: dailySummary })) {
    try {
      result[name] = await job(ctx);
    } catch (err) {
      result[name] = `error: ${err.message}`;
      console.error(`${name}: ${err.stack || err.message}`);
    }
  }
  return result;
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runJobs(env).then((r) => {
      if (r.tasks || r.feeding || r.summary?.sent || Object.values(r).some((v) => String(v).startsWith('error'))) console.log(JSON.stringify(r));
    }).catch((err) => console.error(`jobs not run: ${err.message}`))); // e.g. the system account can't sign in
  },
};
