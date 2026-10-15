import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { auth, C, collection } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { getTheme, setTheme } from '@/lib/theme';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Segmented, Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FEEDING_OPTIONS } from '@/features/feeding/feedingTypes';
import { useAuth, useProfiles } from '@/features/auth/AuthProvider';
import { displayUser } from '@/features/auth/username';
import { useCanEdit } from '@/hooks/useCanEdit';
import { UsersCard } from './UsersCard';

const THEMES = [{ value: 'auto', label: 'אוטומטי' }, { value: 'light', label: 'בהיר' }, { value: 'dark', label: 'כהה' }];

const TEST_ERRORS = {
  no_email: 'שמרו קודם כתובת אימייל',
  not_signed_in: 'צריך להתחבר מחדש',
};

// 06:00 email with the summary of the day that just ended (feedings, diapers, sleep).
function SummaryEmailCard({ settings, save }) {
  const [email, setEmail] = useState(settings.summary_email || '');
  const [enabled, setEnabled] = useState(!!settings.summary_enabled);
  const [state, setState] = useState({ status: 'idle', message: '' });
  useEffect(() => { setEmail(settings.summary_email || ''); setEnabled(!!settings.summary_enabled); }, [settings.summary_email, settings.summary_enabled]);
  const dirty = email.trim() !== (settings.summary_email || '') || enabled !== !!settings.summary_enabled;
  // Functions only exist on the deployed site (not in the local dev server).
  const canTest = !import.meta.env.DEV;

  const persist = () => save({ summary_email: email.trim(), summary_enabled: enabled });
  const sendTest = async () => {
    setState({ status: 'sending', message: '' });
    try {
      if (dirty) await persist();
      const res = await fetch('/api/send-test-summary', { method: 'POST', headers: { Authorization: `Bearer ${await auth.getToken()}` } });
      const body = await res.json().catch(() => ({}));
      const ROBOT = {
        missing: 'אבל המייל היומי לא יישלח: חסרים TC_ROBOT_EMAIL / TC_ROBOT_PASSWORD ב-Netlify.',
        bad_login: 'אבל המייל היומי לא יישלח: משתמש המערכת (TC_ROBOT_EMAIL / TC_ROBOT_PASSWORD) לא מצליח להתחבר.',
        error: 'אבל בדיקת משתמש המערכת נכשלה.',
      };
      setState(res.ok && body.ok
        ? body.robot === 'ok'
          ? { status: 'ok', message: `נשלח מייל בדיקה אל ${body.to}. המייל היומי ב-06:00 מוכן ✓` }
          : { status: 'error', message: `נשלח מייל בדיקה אל ${body.to}, ${ROBOT[body.robot] || ROBOT.error}` }
        : { status: 'error', message: TEST_ERRORS[body.error] || `השליחה נכשלה: ${body.error || res.status}` });
    } catch {
      setState({ status: 'error', message: 'השליחה נכשלה. בדקו את החיבור לאינטרנט.' });
    }
  };

  return (
    <Card className="space-y-3">
      <SectionTitle>סיכום יומי במייל</SectionTitle>
      <p className="text-sm text-mute">כל בוקר ב-06:00: האכלות, חיתולים ושינה של היום שהסתיים.</p>
      <Field label="אימייל לעדכונים"><Input type="email" dir="ltr" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Switch label="לשלוח סיכום כל בוקר" checked={enabled} onChange={setEnabled} />
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={persist} disabled={!dirty || (enabled && !email.trim())}>{dirty ? 'שמירה' : 'נשמר ✓'}</Button>
        <Button variant="outline" onClick={sendTest} disabled={!canTest || !email.trim() || state.status === 'sending'}>
          <Send className="h-4 w-4" />{state.status === 'sending' ? 'שולח...' : 'מייל בדיקה'}
        </Button>
      </div>
      {!canTest && <p className="text-xs text-mute">מייל בדיקה זמין באתר עצמו (אחרי ההעלאה ל-Netlify).</p>}
      {state.message && <p className={`text-sm ${state.status === 'ok' ? 'text-note' : 'text-danger'}`}>{state.message}</p>}
    </Card>
  );
}

export default function SettingsPage() {
  const { settings, save } = useSettings();
  const { user } = useAuth();
  const { nameOf } = useProfiles();
  const [form, setForm] = useState(settings);
  const [myName, setMyName] = useState('');
  const [theme, setThemeState] = useState(getTheme());
  const [saved, setSaved] = useState(false);
  const canEdit = useCanEdit();

  useEffect(() => setForm(settings), [JSON.stringify(settings)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setMyName(nameOf(user?.uid)), [nameOf(user?.uid)]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    await save({ ...form, feeding_alert_hours: Number(form.feeding_alert_hours) || 3 });
    if (user && myName.trim()) await collection(C.profiles).set(user.uid, { name: myName.trim(), email: user.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveMyName = async () => {
    if (user && myName.trim()) await collection(C.profiles).set(user.uid, { name: myName.trim(), email: user.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const themeCard = (
    <Card className="space-y-3">
      <SectionTitle>תצוגה</SectionTitle>
      <Segmented options={THEMES} value={theme} onChange={(v) => { setTheme(v); setThemeState(v); }} />
    </Card>
  );

  // View-only users: just their own name and the display theme.
  if (!canEdit) {
    return (
      <div className="space-y-4">
        <PageHeader title="הגדרות" />
        <Card className="space-y-3">
          <Field label="השם שלי"><Input value={myName} onChange={(e) => setMyName(e.target.value)} /></Field>
          <Button className="w-full" onClick={saveMyName}>{saved ? 'נשמר ✓' : 'שמירה'}</Button>
        </Card>
        {themeCard}
        <p className="text-center text-xs text-mute">מחובר/ת כ-{displayUser(user?.email)} · מצב צפייה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="הגדרות" />
      <Card className="space-y-4">
        <SectionTitle>התינוקת</SectionTitle>
        <Field label="שם"><Input value={form.baby_name} onChange={(e) => setForm({ ...form, baby_name: e.target.value })} /></Field>
        <Field label="תאריך לידה"><Input type="date" className="h-12" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></Field>
        <Field label="סוג האכלה ברירת מחדל">
          <Segmented options={FEEDING_OPTIONS} value={form.default_feeding_type} onChange={(v) => setForm({ ...form, default_feeding_type: v })} />
        </Field>
        <Field label="התראה במסך הבית אחרי (שעות בלי האכלה)">
          <Input type="number" inputMode="decimal" step="0.5" min="1" max="12" value={form.feeding_alert_hours} onChange={(e) => setForm({ ...form, feeding_alert_hours: e.target.value })} />
        </Field>
        <Field label="השם שלי" hint="מופיע ליד רישומים שלך (״נרשם ע״י״)">
          <Input placeholder="לדוגמה: אופק" value={myName} onChange={(e) => setMyName(e.target.value)} />
        </Field>
        <Button className="w-full" onClick={submit}>{saved ? 'נשמר ✓' : 'שמירה'}</Button>
      </Card>

      <SummaryEmailCard settings={settings} save={save} />

      <UsersCard />

      {themeCard}

      <p className="text-center text-xs text-mute">מחובר/ת כ-{displayUser(user?.email)}</p>
    </div>
  );
}
