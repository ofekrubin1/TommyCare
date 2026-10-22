import { differenceInMinutes, parseISO } from 'date-fns';
import { Milk, Droplets, Moon, StickyNote, Thermometer, Pill, FlaskConical } from 'lucide-react';
import { dayKey, durationText, hm } from '@/lib/time';
import { FEEDING_TYPES, isBottle, sidesText } from '@/features/feeding/feedingTypes';
import { colorLabel, diaperTitle, textureLabel } from '@/features/diapers/diaperOptions';

// Each kind: how it looks and which sheet edits it.
export const KINDS = {
  feeding: { icon: Milk, color: 'text-feed bg-feed/10', label: 'האכלה' },
  diaper: { icon: Droplets, color: 'text-diaper bg-diaper/10', label: 'חיתול' },
  sleep: { icon: Moon, color: 'text-sleep bg-sleep/10', label: 'שינה' },
  note: { icon: StickyNote, color: 'text-note bg-note/10', label: 'הערה' },
  pumping: { icon: FlaskConical, color: 'text-pump bg-pump/10', label: 'שאיבה' },
  fever: { icon: Thermometer, color: 'text-danger bg-danger/10', label: 'חום' },
  med: { icon: Pill, color: 'text-health bg-health/10', label: 'תרופה' },
};

const join = (...parts) => parts.filter(Boolean).join(' · ');

// Normalizes every record type into one row shape for the timeline.
export function toEvents(data, now = new Date()) {
  const medName = Object.fromEntries((data.meds || []).map((m) => [m.id, m.name]));
  const ev = [];
  for (const f of data.feedings || []) {
    ev.push({ kind: 'feeding', record: f, time: f.time, title: FEEDING_TYPES[f.type]?.label || 'האכלה',
      detail: join(f.type === 'breast' && sidesText(f.sides), isBottle(f.type) && f.amount_ml ? `${f.amount_ml} מ״ל` : '', f.note) });
  }
  for (const d of data.diapers || []) {
    ev.push({ kind: 'diaper', record: d, time: d.time, title: diaperTitle(d),
      detail: join(colorLabel(d.poop_color), textureLabel(d.poop_texture), d.rash && 'תפרחת', d.note) });
  }
  for (const s of data.sleeps || []) {
    const minutes = differenceInMinutes(s.end ? parseISO(s.end) : now, parseISO(s.start));
    ev.push({ kind: 'sleep', record: s, time: s.start, title: s.end ? `שינה עד ${hm(s.end)}` : 'בשינה עכשיו',
      detail: join(durationText(Math.max(0, minutes)), s.note), live: !s.end });
  }
  for (const n of data.notes || []) ev.push({ kind: 'note', record: n, time: n.time, title: n.text });
  for (const p of data.pumping || []) {
    ev.push({ kind: 'pumping', record: p, time: p.time, title: `שאיבה ${p.amount_ml || 0} מ״ל`,
      detail: join(p.stored && (p.storage === 'freezer' ? 'למקפיא' : 'למקרר'), p.note) });
  }
  for (const t of data.fever || []) {
    ev.push({ kind: 'fever', record: t, time: t.time, title: t.temp_c ? `${t.temp_c}°` : 'מחלה',
      detail: join(t.symptoms, t.medicine && `${t.medicine}${t.dose ? ` ${t.dose}` : ''}`, t.note) });
  }
  for (const m of data.medDoses || []) {
    ev.push({ kind: 'med', record: m, time: m.time, title: medName[m.med_id] || m.name || 'תרופה', detail: m.note });
  }
  return ev.filter((e) => e.time).sort((a, b) => b.time.localeCompare(a.time));
}

export const eventsForDay = (data, key, now) => toEvents(data, now).filter((e) => dayKey(e.time) === key);
