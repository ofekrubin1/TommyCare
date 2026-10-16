import { useEffect, useState } from 'react';
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
import { SummaryEmailCard } from './SummaryEmailCard';
import { ExportCard } from './ExportCard';

const THEMES = [{ value: 'auto', label: 'אוטומטי' }, { value: 'light', label: 'בהיר' }, { value: 'dark', label: 'כהה' }];

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

      <ExportCard />

      {themeCard}

      <p className="text-center text-xs text-mute">מחובר/ת כ-{displayUser(user?.email)}</p>
    </div>
  );
}
