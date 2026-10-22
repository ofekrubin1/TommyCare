// Sample data for the local test environment (5173): ~5 days of realistic logs relative to now, a few older
// days (to test "load older days"), and three users: ofek (owner), maayan (editor), guest (view only).
import { addDays, addMinutes, format, subDays } from 'date-fns';
import { DAY_START_HOUR } from '@/config/appConfig';
import { localUid } from './localBackend';
import { CHILD_COLLECTIONS, FAMILY_COLLECTIONS } from '../index.js';

let n = 0;
const id = () => `seed${++n}`;
const iso = (d) => d.toISOString();

export function buildSampleData(now = new Date()) {
  const db = { tasks: {}, roles: {}, gifts: {}, feedings: {}, diapers: {}, sleeps: {}, notes: {}, pumping: {}, fever: {}, med_doses: {}, meds: {}, growth: {}, vaccinations: {}, appointments: {}, shopping: {}, settings: {}, profiles: {} };
  const put = (col, data) => { const k = id(); db[col][k] = { created_at: iso(now), updated_at: iso(now), created_by: localUid('ofek'), ...data }; return k; };
  const birth = subDays(now, 60);

  db.settings.app = { baby_name: 'Tommy', birth_date: format(birth, 'yyyy-MM-dd'), default_feeding_type: 'breast', feeding_alert_hours: 3 };
  db.profiles[localUid('ofek')] = { name: 'אופק', email: 'ofek@tommycare.app' };
  db.profiles[localUid('maayan')] = { name: 'מעיין', email: 'maayan@tommycare.app' };
  db.profiles[localUid('guest')] = { name: 'סבתא', email: 'guest@tommycare.app' };
  db.roles[localUid('maayan')] = { role: 'editor' };
  db.roles[localUid('guest')] = { role: 'viewer' };
  const vitD = put('meds', { name: 'ויטמין D', dose: '400 יחב״ל (טיפות)', daily: true, active: true });

  // Start 4 days ago at 06:00, step through the day.
  let t = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), DAY_START_HOUR, 10), -4);
  const types = ['breast', 'breast', 'breast', 'pumped', 'breast', 'formula'];
  let i = 0;
  while (t < addMinutes(now, -20)) {
    const type = types[i % types.length];
    put('feedings', { type, time: iso(t), amount_ml: type === 'breast' ? null : 60 + (i % 3) * 15, sides: type === 'breast' ? (i % 5 === 2 ? ['left'] : ['right', 'left']) : null, note: i % 7 === 3 ? 'אכלה טוב, נרדמה בסוף' : '' });
    const diaperAt = addMinutes(t, 25);
    if (diaperAt < now) {
      const poop = i % 3 === 0;
      put('diapers', { time: iso(diaperAt), pee: i % 5 !== 4, poop, poop_color: poop ? (i % 2 ? 'yellow' : 'mustard') : null, poop_texture: poop ? 'soft' : null, rash: false, note: '' });
    }
    const sleepStart = addMinutes(t, 40), sleepEnd = addMinutes(t, 40 + 90 + (i % 4) * 20);
    if (sleepEnd < now) put('sleeps', { start: iso(sleepStart), end: iso(sleepEnd), note: '' });
    t = addMinutes(t, 150 + (i % 4) * 20);
    i++;
  }
  // Vitamin D every morning at 09:05 (today too, if it's past that).
  for (let d = 4; d >= 0; d--) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, 9, 5);
    if (at < now) put('med_doses', { med_id: vitD, time: iso(at) });
  }
  // The latest nap is still going.
  put('sleeps', { start: iso(addMinutes(now, -35)), end: null, note: '' });

  put('notes', { time: iso(subDays(now, 2)), text: 'חייכה בפעם הראשונה ממש! 🥹' });
  put('notes', { time: iso(addMinutes(now, -180)), text: 'הייתה עצבנית אחרי האכלת הבוקר, נרגעה במנשא' });
  put('pumping', { time: iso(subDays(now, 1)), amount_ml: 120, stored: true, storage: 'freezer', used: false, note: '' });
  put('pumping', { time: iso(addMinutes(now, -300)), amount_ml: 90, stored: true, storage: 'fridge', used: false, note: '' });
  put('fever', { time: iso(subDays(now, 3)), temp_c: 37.4, symptoms: 'נזלת קלה', medicine: '', dose: '', note: '' });

  put('growth', { date: format(birth, 'yyyy-MM-dd'), weight_kg: 3.25, height_cm: 50, head_cm: 34.5, note: 'לידה' });
  put('growth', { date: format(addDays(birth, 14), 'yyyy-MM-dd'), weight_kg: 3.6, height_cm: 52, head_cm: 35.5, note: 'טיפת חלב' });
  put('growth', { date: format(addDays(birth, 30), 'yyyy-MM-dd'), weight_kg: 4.15, height_cm: 54, head_cm: 37, note: 'טיפת חלב' });
  db.vaccinations.hbv1 = { name: 'צהבת B · מנה 1', date: format(birth, 'yyyy-MM-dd'), note: 'בבית החולים', updated_at: iso(now) };

  put('appointments', { doctor_type: 'טיפת חלב', date: format(subDays(now, 8), 'yyyy-MM-dd'), time: '10:30', location: 'טיפת חלב השכונתית', note: 'לשאול על ויטמין D', summary: 'משקל 4.15. הכל תקין, להמשיך ויטמין D. ביקור הבא בגיל חודשיים לחיסונים.', done: true, done_at: iso(subDays(now, 8)) });
  put('appointments', { doctor_type: 'רופא/ת ילדים', date: format(addDays(now, 1), 'yyyy-MM-dd'), time: '16:15', location: 'מכבי', note: 'פריחה קלה בלחי, גזים בערב', summary: '' });
  put('appointments', { doctor_type: 'טיפת חלב', date: format(addDays(birth, 61), 'yyyy-MM-dd'), time: '09:00', location: 'טיפת חלב השכונתית', note: 'חיסוני חודשיים', summary: '' });

  // Older than the 30-day window: only visible after "load older days" in the journal.
  for (const daysAgo of [40, 41, 55]) {
    const at = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0), daysAgo);
    put('feedings', { type: 'breast', time: iso(at), amount_ml: null, sides: ['right', 'left'], note: `ישן (${daysAgo} ימים)` });
    put('diapers', { time: iso(addMinutes(at, 30)), pee: true, poop: false, rash: false, note: '' });
  }

  put('tasks', { title: 'להזמין תור לטיפת חלב', note: '', done: false, remind_at: iso(addDays(now, 1)), reminded_at: null, remind_pending: true });
  put('tasks', { title: 'לקנות מדחום חדש', note: 'דיגיטלי, לאוזן', done: false, remind_at: null });
  put('tasks', { title: 'לשלוח תמונות לסבתא', note: '', done: true, done_at: iso(subDays(now, 1)) });

  put('gifts', { name: 'שובר BuyMe', from: 'סבתא רינה', value: 300, note: 'בתוקף עד 12/2027', used: false });
  put('gifts', { name: 'שובר Wolt', from: 'החברים מהעבודה', value: 200, note: '', used: false });
  put('gifts', { name: 'עגלה', from: 'ההורים', value: null, note: '', used: true });
  for (const [name, quantity, status, note] of [['חיתולים מידה 1', '2 חבילות', 'open', 'רק Pampers'], ['מגבונים', '', 'open'], ['משחת החתלה', '', 'bought'], ['בגד גוף 3-6', '4', 'archived']]) {
    put('shopping', { name, quantity, status, note: note || '' });
  }
  return toFamilyLayout(db, now);
}

// The flat sample (one child) → the family layout: Tommy's records under families/main/children/child1, shared
// lists under families/main, plus a second child (איתי, a few days old) with a couple of entries of their own.
function toFamilyLayout(flat, now) {
  const out = {};
  const F = 'families/main';
  for (const [name, docs] of Object.entries(flat)) {
    if (CHILD_COLLECTIONS.includes(name)) out[`${F}/children/child1/${name}`] = docs;
    else if (name === 'settings') continue;
    else if (FAMILY_COLLECTIONS.includes(name)) out[`${F}/${name}`] = docs;
    else out[name] = docs;
  }
  const app = flat.settings.app;
  out.families = { main: { name: 'המשפחה' } };
  out[`${F}/settings`] = { app: { summary_enabled: false, roles_v2: true } };
  const itai = format(subDays(now, 3), 'yyyy-MM-dd');
  out[`${F}/children`] = {
    child1: { name: app.baby_name, birth_date: app.birth_date, photo: '', default_feeding_type: 'breast', feeding_alert_hours: 3, order: 1 },
    child2: { name: 'איתי', birth_date: itai, photo: '', default_feeding_type: 'formula', feeding_alert_hours: 3, order: 2 },
  };
  const by = { created_at: iso(now), updated_at: iso(now), created_by: localUid('ofek') };
  out[`${F}/children/child2/feedings`] = {
    itai1: { ...by, type: 'formula', time: iso(addMinutes(now, -200)), amount_ml: 60, sides: null, note: 'בקבוק ראשון של איתי' },
    itai2: { ...by, type: 'formula', time: iso(addMinutes(now, -40)), amount_ml: 70, sides: null, note: '' },
  };
  out[`${F}/children/child2/diapers`] = { itai3: { ...by, time: iso(addMinutes(now, -30)), pee: true, poop: false, rash: false, note: '' } };
  return out;
}

// The same sample in the layout before families (all collections at the top level), to try the one-time move.
export function buildLegacySampleData(now = new Date()) {
  n = 0;
  const flat = {};
  const fam = buildSampleData(now);
  for (const [path, docs] of Object.entries(fam)) {
    const parts = path.split('/');
    if (parts[0] !== 'families' || parts.length === 1) { if (parts[0] !== 'families') flat[path] = docs; continue; }
    if (parts[2] === 'children' && parts.length === 5 && parts[3] === 'child1') flat[parts[4]] = docs;
    else if (parts.length === 3 && parts[2] !== 'children' && parts[2] !== 'settings') flat[parts[2]] = docs;
  }
  const c = fam['families/main/children'].child1;
  flat.settings = { app: { baby_name: c.name, birth_date: c.birth_date, default_feeding_type: 'breast', feeding_alert_hours: 3, roles_v2: true } };
  return flat;
}
