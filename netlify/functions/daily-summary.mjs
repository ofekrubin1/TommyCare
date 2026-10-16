// Runs every hour; between 06:00 and 10:00 Israel time it emails, once a day, the summary of the day
// that just ended (feedings, diapers, sleep) to the addresses set in Settings.
process.env.TZ = 'Asia/Jerusalem'; // day boundaries (06:00) are computed in Israel time

import { firestore, robotToken } from '../lib/firestore.mjs';
import { buildSummaryEmail, israelHour, loadDayData, recipientsOf } from '../lib/dailySummary.mjs';
import { sendMail } from '../lib/mailer.mjs';
import { todayKey } from '../../src/lib/time.js';

export default async () => {
  const hour = israelHour();
  if (hour < 6 || hour >= 10) return Response.json({ skipped: 'outside 06:00-10:00', hour });

  const db = firestore(await robotToken());
  const settings = (await db.get('settings', 'app')) || {};
  const today = todayKey();
  const to = recipientsOf(settings);
  if (!settings.summary_enabled || !to.length) return Response.json({ skipped: 'disabled or no email' });
  if (settings.last_summary_date === today) return Response.json({ skipped: 'already sent today' });

  const email = buildSummaryEmail({ babyName: settings.baby_name, data: await loadDayData(db), appUrl: process.env.URL });
  await sendMail({ to: to.join(', '), ...email });
  // Recorded only after a successful send, so a failure retries next hour.
  await db.update('settings', 'app', { last_summary_date: today });
  console.log(`daily-summary sent to ${to.join(', ')} for the day before ${today}`);
  return Response.json({ sent: true });
};

export const config = { schedule: '0 * * * *' };
