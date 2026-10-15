import { format, parseISO } from 'date-fns';
import { summarizeDay } from '@/lib/summary';
import { ageText, dayKey, dm, shiftDay, todayKey } from '@/lib/time';
import { num } from '@/lib/utils';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const th = 'padding:8px;background:#F6E7EB;color:#8A3D52;font-size:12px;text-align:right;font-weight:bold;';
const td = 'padding:7px 8px;border-bottom:1px solid #EEE;font-size:12px;color:#333;';

function table(headers, rows) {
  return `<table style="width:100%;border-collapse:collapse;margin-top:6px;"><thead><tr>${headers.map((h) => `<th style="${th}">${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td style="${td}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const section = (title, body) => `<div style="margin-top:22px;"><div style="font-size:15px;font-weight:bold;color:#8A3D52;border-bottom:2px solid #D66A83;padding-bottom:4px;">${title}</div>${body}</div>`;

// HTML for the doctor report: last 7 days of daily totals, growth, meds, fever and upcoming appointments.
export function buildReportHtml({ settings, data, growth, appointments }) {
  const today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(today, -i));
  const summaries = days.map((k) => summarizeDay(k, data));
  // Average only over days that have records (not days before tracking started).
  const tracked = summaries.filter((x) => x.feedings || x.diapers || x.sleeps);
  const avg = (f) => (tracked.length ? num(tracked.reduce((s, x) => s + f(x), 0) / tracked.length) : '-');

  const dailyRows = summaries.map((s) => [
    dm(s.key), s.feedings, [s.breast && `הנקה ${s.breast}`, s.formula && `תמ״ל ${s.formula}`, s.pumped && `שאיבה ${s.pumped}`].filter(Boolean).join(', ') || '-',
    s.bottleMl ? `${s.bottleMl}` : '-', s.pee, s.poop, num(s.sleepMinutes / 60),
  ]);
  dailyRows.push([`<b>ממוצע</b>`, `<b>${avg((x) => x.feedings)}</b>`, '', '', `<b>${avg((x) => x.pee)}</b>`, `<b>${avg((x) => x.poop)}</b>`, `<b>${avg((x) => x.sleepMinutes / 60)}</b>`]);

  const growthRows = [...growth].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
    .map((g) => [format(parseISO(g.date), 'dd/MM/yyyy'), g.weight_kg != null ? num(g.weight_kg, 2) : '-', g.height_cm ?? '-', g.head_cm ?? '-']);
  const feverRows = data.fever.filter((f) => f.time && days.includes(dayKey(f.time)))
    .sort((a, b) => b.time.localeCompare(a.time)).slice(0, 15)
    .map((f) => [format(parseISO(f.time), 'dd/MM HH:mm'), f.temp_c ? `${f.temp_c}°` : '-', esc(f.symptoms) || '-', esc([f.medicine, f.dose].filter(Boolean).join(' ')) || '-']);
  const meds = data.meds.filter((m) => m.active !== false);
  const medRows = meds.map((m) => {
    const given = days.filter((k) => data.medDoses.some((d) => d.med_id === m.id && dayKey(d.time) === k)).length;
    return [esc(m.name), esc(m.dose) || '-', m.daily ? `${given}/7 ימים` : '-'];
  });
  const nextAppts = appointments.filter((a) => !a.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
    .map((a) => [format(parseISO(a.date), 'dd/MM/yyyy') + (a.time ? ` ${a.time}` : ''), esc(a.doctor_type), esc(a.note) || '-']);

  return `<div style="font-family:Arial,Helvetica,sans-serif;direction:rtl;width:794px;background:#fff;padding:32px 36px;box-sizing:border-box;color:#333;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #D66A83;padding-bottom:10px;">
      <div><div style="font-size:24px;font-weight:bold;color:#3A3335;">${esc(settings.baby_name)}</div>
      <div style="font-size:13px;color:#777;">${[settings.birth_date && `נולדה ${format(parseISO(settings.birth_date), 'dd/MM/yyyy')}`, ageText(settings.birth_date)].filter(Boolean).join(' · ')}</div></div>
      <div style="font-size:12px;color:#777;text-align:left;">דוח לרופא · 7 ימים אחרונים<br/>${format(new Date(), 'dd/MM/yyyy')}</div>
    </div>
    ${section('סיכום יומי', table(['יום', 'האכלות', 'סוג', 'מ״ל בבקבוק', 'פיפי', 'קקי', 'שעות שינה'], dailyRows))}
    ${growthRows.length ? section('גדילה', table(['תאריך', 'משקל (ק״ג)', 'גובה (ס״מ)', 'היקף ראש (ס״מ)'], growthRows)) : ''}
    ${medRows.length ? section('תרופות וויטמינים', table(['שם', 'מינון', 'ניתן'], medRows)) : ''}
    ${feverRows.length ? section('חום ומחלה', table(['מתי', 'חום', 'תסמינים', 'תרופה'], feverRows)) : ''}
    ${nextAppts.length ? section('תורים קרובים', table(['מתי', 'רופא', 'שאלות / הערה'], nextAppts)) : ''}
    <div style="margin-top:24px;font-size:10px;color:#AAA;text-align:center;">הופק מ-TommyCare · יום נספר מ-06:00 עד 06:00</div>
  </div>`;
}

