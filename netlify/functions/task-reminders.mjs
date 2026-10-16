// Runs every 15 minutes; emails a reminder for each open task whose reminder time has come,
// to the addresses set in Settings (same list as the daily summary). Each reminder is sent once.
import { firestore, robotToken } from '../lib/firestore.mjs';
import { recipientsOf, TZ } from '../lib/dailySummary.mjs';
import { sendMail } from '../lib/mailer.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const STALE_MS = 24 * 60 * 60 * 1000; // reminders more than a day late are skipped, not sent

function reminderEmail({ babyName, task, appUrl }) {
  const name = esc(babyName || 'תום');
  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#FBF7F4;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <div style="max-width:480px;margin:0 auto;padding:22px 16px;">
    <div style="font-size:13px;color:#8A8083;">🔔 תזכורת · ${name} · ${when(task.remind_at)}</div>
    <div style="background:#fff;border-radius:16px;padding:16px 18px;margin:10px 0 12px;border:1px solid #EFE6E1;">
      <div style="font-size:20px;font-weight:bold;color:#3A3335;">${esc(task.title)}</div>
      ${task.note ? `<div style="font-size:14px;color:#6B6266;line-height:1.7;margin-top:6px;white-space:pre-wrap;">${esc(task.note)}</div>` : ''}
    </div>
    ${appUrl ? `<div style="text-align:center;margin:18px 0 4px;"><a href="${esc(appUrl)}/tasks" style="display:inline-block;background:#D66A83;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 26px;border-radius:12px;">למשימות</a></div>` : ''}
  </div></body></html>`;
  const text = `תזכורת (${babyName || 'תום'}): ${task.title}${task.note ? `\n${task.note}` : ''}`;
  return { subject: `🔔 תזכורת: ${task.title}`, html, text };
}

export default async () => {
  const db = firestore(await robotToken());
  const now = Date.now();
  const due = (await db.list('tasks')).filter((t) => !t.done && t.remind_at && !t.reminded_at && Date.parse(t.remind_at) <= now);
  if (!due.length) return Response.json({ due: 0 });

  const settings = (await db.get('settings', 'app')) || {};
  const to = recipientsOf(settings);
  if (!to.length) return Response.json({ skipped: 'no email in settings', due: due.length });

  let sent = 0;
  for (const task of due) {
    const stale = now - Date.parse(task.remind_at) > STALE_MS;
    if (!stale) {
      await sendMail({ to: to.join(', '), ...reminderEmail({ babyName: settings.baby_name, task, appUrl: process.env.URL }) });
      sent++;
    }
    // Marked only after a successful send, so a failure retries on the next run.
    await db.update('tasks', task.id, { reminded_at: new Date().toISOString() });
  }
  console.log(`task-reminders: sent ${sent} of ${due.length} to ${to.join(', ')}`);
  return Response.json({ sent, due: due.length });
};

export const config = { schedule: '*/15 * * * *' };
