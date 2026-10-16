// Builds the 06:00 summary email for the day that just ended: feedings, diapers, sleep only.
import { summarizeDay } from '../../src/lib/summary.js';
import { shiftDay, todayKey } from '../../src/lib/time.js';

export const TZ = 'Asia/Jerusalem';

// Wall-clock hour in Israel (functions run in UTC).
export const israelHour = (now = new Date()) =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(now));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('he-IL');
const dmy = (key) => key.split('-').reverse().join('/');

function change(cur, prev) {
  if (prev == null) return '';
  const d = Math.round((cur - prev) * 10) / 10;
  if (!d) return '<span style="color:#999;">כמו ביום הקודם</span>';
  return `<span style="color:#999;">${d > 0 ? '+' : ''}${n1(d)} מהיום הקודם</span>`;
}

function block(title, color, main, rows) {
  return `<div style="background:#fff;border-radius:16px;padding:16px 18px;margin:0 0 12px;border:1px solid #EFE6E1;">
    <div style="font-size:13px;color:${color};font-weight:bold;">${title}</div>
    <div style="font-size:26px;font-weight:bold;color:#3A3335;margin:2px 0 6px;">${main}</div>
    ${rows.filter(Boolean).map((r) => `<div style="font-size:13px;color:#6B6266;line-height:1.7;">${r}</div>`).join('')}
  </div>`;
}

// `data`: { feedings, diapers, sleeps }. `key`: the day to summarize (defaults to the day that just ended).
export function buildSummaryEmail({ babyName, data, key = shiftDay(todayKey(), -1), appUrl, test = false }) {
  const s = summarizeDay(key, data, new Date());
  const p = summarizeDay(shiftDay(key, -1), data, new Date());
  const hasPrev = p.feedings || p.diapers || p.sleeps;
  const prev = (f) => (hasPrev ? f(p) : null);
  const name = esc(babyName || 'תום');

  const feedTypes = [s.breast && `הנקה ${s.breast}`, s.formula && `תמ״ל ${s.formula}`, s.pumped && `בקבוק שאיבה ${s.pumped}`].filter(Boolean).join(' · ');
  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#FBF7F4;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <div style="max-width:480px;margin:0 auto;padding:22px 16px;">
    <div style="font-size:22px;font-weight:bold;color:#3A3335;">🐣 ${name} · סיכום יומי</div>
    <div style="font-size:13px;color:#8A8083;margin:2px 0 16px;">${dmy(key)} · מ-06:00 עד 06:00${test ? ' · מייל בדיקה' : ''}</div>
    ${block('🍼 האכלות', '#D66A83', s.feedings, [feedTypes, s.bottleMl && `${s.bottleMl} מ״ל בבקבוק`, change(s.feedings, prev((x) => x.feedings))])}
    ${block('💧 חיתולים', '#D69C34', s.diapers, [`פיפי ${s.pee} · קקי ${s.poop}`, change(s.diapers, prev((x) => x.diapers))])}
    ${block('🌙 שינה', '#6875C4', `${n1(s.sleepMinutes / 60)} שעות`, [s.sleeps && `${s.sleeps} פעמים`, change(s.sleepMinutes / 60, prev((x) => x.sleepMinutes / 60))])}
    ${appUrl ? `<div style="text-align:center;margin:18px 0 4px;"><a href="${esc(appUrl)}/journal" style="display:inline-block;background:#D66A83;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 26px;border-radius:12px;">ליומן המלא</a></div>` : ''}
    <div style="font-size:11px;color:#B0A8AB;text-align:center;margin-top:16px;">אפשר לשנות או לכבות את המייל בהגדרות של TommyCare.</div>
  </div></body></html>`;

  const text = [
    `${babyName || 'תום'} · סיכום יומי ${dmy(key)}`,
    `האכלות: ${s.feedings}${feedTypes ? ` (${feedTypes})` : ''}${s.bottleMl ? `, ${s.bottleMl} מ״ל בבקבוק` : ''}`,
    `חיתולים: ${s.diapers} (פיפי ${s.pee}, קקי ${s.poop})`,
    `שינה: ${n1(s.sleepMinutes / 60)} שעות`,
  ].join('\n');
  return { subject: `${test ? '[בדיקה] ' : ''}🐣 ${babyName || 'תום'} · סיכום ${dmy(key)}`, html, text };
}

export async function loadDayData(db) {
  const [feedings, diapers, sleeps] = await Promise.all([db.list('feedings'), db.list('diapers'), db.list('sleeps')]);
  return { feedings, diapers, sleeps };
}

// Recipients: the saved list, or the single address from before multi-recipient support.
export const recipientsOf = (settings) =>
  (settings.summary_emails?.length ? settings.summary_emails : settings.summary_email ? [settings.summary_email] : []).filter(Boolean);
