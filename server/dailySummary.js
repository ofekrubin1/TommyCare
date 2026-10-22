// The 06:00 summary email for the day that just ended: feedings, diapers, sleep — a section per child.
// Days are Israeli days (06:00 → 06:00) even though the server runs in UTC (see israelTime.js).
import { summarizeDay } from '../src/features/summary/summarizeDay.js';
import { dayKey, shiftDay } from '../src/lib/time.js';
import { childPath, loadChildren } from './family.js';
import { israelIso, israelWall } from './israelTime.js';
import { escapeHtml as esc } from '../src/lib/html.js';

// The app day that just ended, in Israel.
export const yesterdayKey = (now = new Date()) => shiftDay(dayKey(israelWall(now).toISOString()), -1);

const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('he-IL');
const dmy = (key) => key.split('-').reverse().join('/');

function block(title, color, main, rows) {
  return `<div style="background:#fff;border-radius:16px;padding:16px 18px;margin:0 0 12px;border:1px solid #EFE6E1;">
    <div style="font-size:13px;color:${color};font-weight:bold;">${title}</div>
    <div style="font-size:26px;font-weight:bold;color:#3A3335;margin:2px 0 6px;">${main}</div>
    ${rows.filter(Boolean).map((r) => `<div style="font-size:13px;color:#6B6266;line-height:1.7;">${r}</div>`).join('')}
  </div>`;
}

// `children`: [{ name, data: { feedings, diapers, sleeps } }] — one section per child (just the blocks for one).
// `key`: the day to summarize (defaults to the day that just ended).
export function buildSummaryEmail({ children, key = yesterdayKey(), appUrl, test = false }) {
  const now = israelWall();
  const days = children.map((c) => ({ name: c.name || 'תום', s: summarizeDay(key, c.data, now) }));
  const several = days.length > 1;
  const title = several ? 'סיכום יומי' : `${esc(days[0]?.name)} · סיכום יומי`;
  const feedTypes = (s) => [s.breast && `הנקה ${s.breast}`, s.formula && `תמ״ל ${s.formula}`, s.pumped && `בקבוק שאיבה ${s.pumped}`].filter(Boolean).join(' · ');

  const section = ({ name, s }) => `
    ${several ? `<div style="font-size:18px;font-weight:bold;color:#3A3335;margin:18px 0 8px;">${esc(name)}</div>` : ''}
    ${block('🍼 האכלות', '#D66A83', s.feedings, [feedTypes(s), s.bottleMl && `${s.bottleMl} מ״ל בבקבוק`])}
    ${block('💧 חיתולים', '#D69C34', `פיפי ${s.pee} · קקי ${s.poop}`, [`${s.diapers} חיתולים`])}
    ${block('🌙 שינה', '#6875C4', `${n1(s.sleepMinutes / 60)} שעות`, [s.sleeps && `${s.sleeps} פעמים`])}`;

  const html = `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#FBF7F4;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <div style="max-width:480px;margin:0 auto;padding:22px 16px;">
    <div style="font-size:22px;font-weight:bold;color:#3A3335;">🐣 ${title}</div>
    <div style="font-size:13px;color:#8A8083;margin:2px 0 16px;">${dmy(key)} · מ-06:00 עד 06:00${test ? ' · מייל בדיקה' : ''}</div>
    ${days.map(section).join('')}
    ${appUrl ? `<div style="text-align:center;margin:18px 0 4px;"><a href="${esc(appUrl)}/journal" style="display:inline-block;background:#D66A83;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 26px;border-radius:12px;">ליומן המלא</a></div>` : ''}
    <div style="font-size:11px;color:#B0A8AB;text-align:center;margin-top:16px;">אפשר לשנות או לכבות את המייל בהגדרות של TommyCare.</div>
  </div></body></html>`;

  const text = days.map(({ name, s }) => [
    `${name} · סיכום יומי ${dmy(key)}`,
    `האכלות: ${s.feedings}${feedTypes(s) ? ` (${feedTypes(s)})` : ''}${s.bottleMl ? `, ${s.bottleMl} מ״ל בבקבוק` : ''}`,
    `פיפי ${s.pee} · קקי ${s.poop} (${s.diapers} חיתולים)`,
    `שינה: ${n1(s.sleepMinutes / 60)} שעות`,
  ].join('\n')).join('\n\n');
  const who = several ? days.map((d) => d.name).join(' ו') : days[0]?.name;
  return { subject: `${test ? '[בדיקה] ' : ''}🐣 ${who} · סיכום ${dmy(key)}`, html, text };
}

// Every child with the records the summary needs (the last 3 days are plenty for "yesterday"), with their
// times moved to Israel's wall clock for the shared day logic.
export async function loadChildrenDays(db) {
  const from = new Date(Date.now() - 3 * 864e5).toISOString();
  const local = (rows, fields) => rows.map((r) => ({ ...r, ...Object.fromEntries(fields.map((f) => [f, israelIso(r[f])])) }));
  const children = await loadChildren(db);
  return Promise.all(children.map(async (c) => {
    const parent = childPath(c.id);
    const [feedings, diapers, sleeps] = await Promise.all([
      db.since(parent, 'feedings', 'time', from), db.since(parent, 'diapers', 'time', from), db.since(parent, 'sleeps', 'start', from),
    ]);
    return { name: c.name, data: { feedings: local(feedings, ['time']), diapers: local(diapers, ['time']), sleeps: local(sleeps, ['start', 'end']) } };
  }));
}
