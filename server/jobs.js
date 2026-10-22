// The scheduled jobs (run every minute by the Cloudflare cron worker, workers/cron):
// - taskReminders: tasks whose reminder time has come → push to the phones with notifications on; if there are
//   none, email to the addresses in Settings. Sent once (remind_pending → false).
// - feedingAlerts: a child's last feeding is older than their "alert after X hours" (default 3) → push to every
//   phone. Once per feeding (the next feeding starts a new count).
// - dailySummary: between 06:00 and 10:00 Israel time, once a day, the summary email of the day that just ended.
// Each check reads only what it needs (pending tasks, each child's latest feeding), so a run every minute stays
// far inside Firestore's free daily reads.
import { FEEDING_TYPES } from '../src/features/feeding/feedingTypes.js';
import { dayKey } from '../src/lib/time.js';
import { FAMILY, childPath, loadChildren, loadFamilySettings, recipientsOf } from './family.js';
import { buildSummaryEmail, loadChildrenDays } from './dailySummary.js';
import { hmText, israelHour, israelWall, whenText } from './israelTime.js';

const HOUR = 3600_000;
const STALE_MS = 24 * HOUR; // task reminders more than a day late are skipped, not sent
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function reminderEmail(task, appUrl) {
  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#FBF7F4;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <div style="max-width:480px;margin:0 auto;padding:22px 16px;">
    <div style="font-size:13px;color:#8A8083;">🔔 תזכורת · TommyCare · ${whenText(task.remind_at)}</div>
    <div style="background:#fff;border-radius:16px;padding:16px 18px;margin:10px 0 12px;border:1px solid #EFE6E1;">
      <div style="font-size:20px;font-weight:bold;color:#3A3335;">${esc(task.title)}</div>
      ${task.note ? `<div style="font-size:14px;color:#6B6266;line-height:1.7;margin-top:6px;white-space:pre-wrap;">${esc(task.note)}</div>` : ''}
    </div>
    ${appUrl ? `<div style="text-align:center;margin:18px 0 4px;"><a href="${esc(appUrl)}/tasks" style="display:inline-block;background:#D66A83;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 26px;border-radius:12px;">למשימות</a></div>` : ''}
  </div></body></html>`;
  return { subject: `🔔 תזכורת: ${task.title}`, html, text: `תזכורת: ${task.title}${task.note ? `\n${task.note}` : ''}` };
}

// `ctx`: { db, devices: () => push_subs (loaded once, on first need), push(payload, devices), mail(message), env, now }
export async function taskReminders(ctx) {
  const { db, now } = ctx;
  const due = (await db.where(FAMILY, 'tasks', 'remind_pending', true)).filter((t) => t.remind_at && Date.parse(t.remind_at) <= now);
  let sent = 0;
  for (const task of due) {
    if (!task.done && now - Date.parse(task.remind_at) <= STALE_MS) {
      const devices = await ctx.devices();
      const delivered = devices.length
        ? await ctx.push({ title: `🔔 ${task.title}`, body: task.note || `תזכורת · ${whenText(task.remind_at)}`, url: '/tasks', tag: `task-${task.id}` }, devices)
        : 0;
      if (!delivered) {
        const to = recipientsOf(await loadFamilySettings(db));
        if (!to.length) throw new Error(`task ${task.id}: no phone and no email to remind`); // retried next minute
        await ctx.mail({ to: to.join(', '), ...reminderEmail(task, ctx.env.APP_URL) });
      }
      sent++;
    }
    // Marked only after a successful send (or for a done / day-old task), so a failure retries next minute.
    await db.update(`${FAMILY}/tasks`, task.id, { reminded_at: new Date(now).toISOString(), remind_pending: false });
  }
  return sent;
}

export async function feedingAlerts(ctx) {
  const { db, now } = ctx;
  let sent = 0;
  for (const child of await loadChildren(db)) {
    const hours = Number(child.feeding_alert_hours) || 3;
    // The latest feeding of the last day (a child with none, e.g. a brand-new one, gets no alerts).
    const [last] = await db.since(childPath(child.id), 'feedings', 'time', new Date(now - 24 * HOUR).toISOString(), { limit: 1 });
    if (!last || now - Date.parse(last.time) < hours * HOUR || child.feeding_alert_for === last.id) continue;
    const devices = await ctx.devices();
    if (!devices.length) continue;
    const passed = Math.floor((now - Date.parse(last.time)) / HOUR);
    await ctx.push({
      title: `🍼 ${child.name}: עברו ${passed} שעות מההאכלה`,
      body: `האכלה אחרונה ב-${hmText(last.time)} (${FEEDING_TYPES[last.type]?.label || 'האכלה'})`,
      url: '/', tag: `feeding-${child.id}`,
    }, devices);
    await db.update(`${FAMILY}/children`, child.id, { feeding_alert_for: last.id });
    sent++;
  }
  return sent;
}

// Between 06:00 and 10:00 Israel time (retried each minute until it succeeds), once per day.
export async function dailySummary(ctx, { test = false } = {}) {
  const { db, now } = ctx;
  if (!test) {
    const hour = israelHour(new Date(now));
    if (hour < 6 || hour >= 10) return { skipped: 'outside 06:00-10:00' };
  }
  const settings = await loadFamilySettings(db);
  const to = recipientsOf(settings);
  const today = dayKey(israelWall(new Date(now)).toISOString());
  if (!test && (!settings.summary_enabled || !to.length)) return { skipped: 'disabled or no email' };
  if (!test && settings.last_summary_date === today) return { skipped: 'already sent today' };
  if (!to.length) return { skipped: 'no email' };
  const email = buildSummaryEmail({ children: await loadChildrenDays(db), appUrl: ctx.env.APP_URL, test });
  await ctx.mail({ to: to.join(', '), ...email });
  if (!test) await db.update(`${FAMILY}/settings`, 'app', { last_summary_date: today });
  return { sent: to.length };
}
