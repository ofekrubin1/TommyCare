import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { auth, C, collection, isLocalBackend } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { getTheme, setTheme } from '@/lib/theme';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FEEDING_OPTIONS } from '@/features/feeding/feedingTypes';
import { useAuth, useProfiles } from '@/features/auth/AuthProvider';

const THEMES = [{ value: 'auto', label: 'אוטומטי' }, { value: 'light', label: 'בהיר' }, { value: 'dark', label: 'כהה' }];

function LocalTools() {
  const load = async () => {
    const [{ buildSampleData }, { replaceAll }] = await Promise.all([import('@/data/local/seed'), import('@/data/local/localBackend')]);
    replaceAll(buildSampleData());
  };
  const clear = async () => (await import('@/data/local/localBackend')).replaceAll({});
  return (
    <Card className="border-dashed border-accent/50">
      <SectionTitle>סביבת בדיקה</SectionTitle>
      <p className="mb-3 text-sm text-mute">הנתונים כאן נשמרים רק בדפדפן הזה ולא מגיעים ל-Firebase.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={load}>טעינת נתוני דוגמה</Button>
        <Button variant="danger" onClick={clear}>מחיקת הכל</Button>
      </div>
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

  useEffect(() => setForm(settings), [JSON.stringify(settings)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setMyName(nameOf(user?.uid)), [nameOf(user?.uid)]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    await save({ ...form, feeding_alert_hours: Number(form.feeding_alert_hours) || 3 });
    if (user && myName.trim()) await collection(C.profiles).set(user.uid, { name: myName.trim(), email: user.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="הגדרות" />
      <Card className="space-y-4">
        <SectionTitle>התינוקת</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="שם"><Input value={form.baby_name} onChange={(e) => setForm({ ...form, baby_name: e.target.value })} /></Field>
          <Field label="תאריך לידה"><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></Field>
        </div>
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

      <Card className="space-y-3">
        <SectionTitle>תצוגה</SectionTitle>
        <Segmented options={THEMES} value={theme} onChange={(v) => { setTheme(v); setThemeState(v); }} />
      </Card>

      {isLocalBackend ? <LocalTools /> : (
        <Card className="flex items-center justify-between">
          <span className="text-sm text-mute">{user?.email}</span>
          <Button variant="ghost" className="py-2" onClick={() => auth.signOut()}><LogOut className="w-4 h-4" />התנתקות</Button>
        </Card>
      )}
    </div>
  );
}
