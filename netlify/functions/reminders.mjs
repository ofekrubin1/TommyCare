// Runs every 15 minutes:
// 1. Tasks: for each open task whose reminder time has come, a push notification to the phones that turned on
//    notifications (Settings → התראות לטלפון); if no phone has, an email to the addresses in Settings. Sent once.
// 2. Feeding: when a child's last feeding is older than their "alert after X hours" (default 3), a push to every
//    phone with notifications on. Once per feeding (the next feeding starts a new count).
import { firestore, robotToken } from '../lib/firestore.mjs';
import { recipientsOf, TZ } from '../lib/dailySummary.mjs';
import { sendMail } from '../lib/mailer.mjs';
import { pushConfigured, sendPush } from '../lib/push.mjs';
import { FAMILY, childPath, loadChildren, loadFamilySettings } from '../lib/family.mjs';
import { FEEDING_TYPES } from '../../src/features/feeding/feedingTypes.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const hm = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const HOUR = 3600_000;
const STALE_MS = 24 * HOUR; // task reminders more than a day late are skipped, not sent

function reminderEmail({ task, appUrl }) {
  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#FBF7F4;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <div style="max-width:480px;margin:0 auto;padding:22px 16px;">
    <div style="font-size:13px;color:#8A8083;">🔔 תזכורת · TommyCare · ${when(task.remind_at)}</div>
    <div style="background:#fff;border-radius:16px;padding:16px 18px;margin:10px 0 12px;border:1px solid #EFE6E1;">
      <div style="font-size:20px;font-weight:bold;color:#3A3335;">${esc(task.title)}</div>
      ${task.note ? `<div style="font-size:14px;color:#6B6266;line-height:1.7;margin-top:6px;white-space:pre-wrap;">${esc(task.note)}</div>` : ''}
    </div>
    ${appUrl ? `<div style="text-align:center;margin:18px 0 4px;"><a href="${esc(appUrl)}/tasks" style="display:inline-block;background:#D66A83;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 26px;border-radius:12px;">למשימות</a></div>` : ''}
  </div></body></html>`;
  return { subject: `🔔 תזכורת: ${task.title}`, html, text: `תזכורת: ${task.title}${task.note ? `\n${task.note}` : ''}` };
}

export async function taskReminders(db, devices, settings, now, push = sendPush, mail = sendMail) {
  const due = (await db.list(`${FAMILY}/tasks`)).filter((t) => !t.done && t.remind_at && !t.reminded_at && Date.parse(t.remind_at) <= now);
  const to = recipientsOf(settings);
  let sent = 0;
  for (const task of due) {
    if (now - Date.parse(task.remind_at) <= STALE_MS) {
      const delivered = devices.length
        ? await push(db, { title: `🔔 ${task.title}`, body: task.note || `תזכורת · ${when(task.remind_at)}`, url: '/tasks', tag: `task-${task.id}` }, devices)
        : 0;
      if (!delivered && to.length) await mail({ to: to.join(', '), ...reminderEmail({ task, appUrl: process.env.URL }) });
      else if (!delivered) throw new Error(`task ${task.id}: no phone and no email to remind`); // retried next run
      sent++;
    }
    // Marked only after a successful send, so a failure retries on the next run.
    await db.update(`${FAMILY}/tasks`, task.id, { reminded_at: new Date().toISOString() });
  }
  return sent;
}

export async function feedingAlerts(db, devices, now, push = sendPush) {
  if (!devices.length) return 0;
  let sent = 0;
  for (const child of await loadChildren(db)) {
    const hours = Number(child.feeding_alert_hours) || 3;
    // The latest feeding of the last day (a child with none, e.g. a brand-new one, gets no alerts).
    const [last] = await db.since(childPath(child.id), 'feedings', 'time', new Date(now - 24 * HOUR).toISOString(), { limit: 1 });
    if (!last || now - Date.parse(last.time) < hours * HOUR || child.feeding_alert_for === last.id) continue;
    const passed = Math.floor((now - Date.parse(last.time)) / HOUR);
    const type = FEEDING_TYPES[last.type]?.label || 'האכלה';
    await push(db, {
      title: `🍼 ${child.name}: עברו ${passed} שעות מההאכלה`,
      body: `האכלה אחרונה ב-${hm(last.time)} (${type})`,
      url: '/', tag: `feeding-${child.id}`,
    }, devices);
    await db.update(`${FAMILY}/children`, child.id, { feeding_alert_for: last.id });
    sent++;
  }
  return sent;
}

export default async () => {
  const db = firestore(await robotToken());
  const now = Date.now();
  const [settings, devices] = await Promise.all([loadFamilySettings(db), pushConfigured() ? db.list('push_subs') : []]);
  const tasks = await taskReminders(db, devices, settings, now);
  const feedings = await feedingAlerts(db, devices, now);
  console.log(`reminders: ${tasks} task reminder(s), ${feedings} feeding alert(s), ${devices.length} phone(s)`);
  return Response.json({ tasks, feedings });
};

export const config = { schedule: '*/15 * * * *' };
