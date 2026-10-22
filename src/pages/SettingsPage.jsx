import { useEffect, useState } from 'react';
import { auth, C, collection, isLocalBackend } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { getTheme, setTheme } from '@/lib/theme';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { Segmented, Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FEEDING_OPTIONS } from '@/features/feeding/feedingTypes';
import { GENDERS } from '@/lib/gender';
import { useAuth, useProfiles } from '@/features/auth/AuthProvider';
import { displayUser } from '@/features/auth/username';
import { useCanEdit } from '@/hooks/useCanEdit';
import { UsersCard } from '@/features/settings/UsersCard';
import { ChildrenCard } from '@/features/settings/ChildrenCard';
import { SummaryEmailCard } from '@/features/settings/SummaryEmailCard';
import { ExportCard } from '@/features/settings/ExportCard';
import { PushCard } from '@/features/settings/PushCard';
import { LocalTools } from '@/features/settings/LocalTools';

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
    // The current child's details (the family's settings have their own cards).
    const { baby_name, birth_date, default_feeding_type, baby_gender = '' } = form;
    await save({ baby_name, birth_date, default_feeding_type, baby_gender, feeding_alert_hours: Number(form.feeding_alert_hours) || 3 });
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
          <Field label="השם שלי" hint="מופיע ליד רישומים. שם המשתמש לכניסה לא משתנה."><Input value={myName} onChange={(e) => setMyName(e.target.value)} /></Field>
          <Button className="w-full" onClick={saveMyName}>{saved ? 'נשמר ✓' : 'שמירה'}</Button>
        </Card>
        <PushCard />
        {themeCard}
        {isLocalBackend && <LocalTools />}
        <p className="text-center text-xs text-mute">מחובר/ת כ-{displayUser(user?.email)} · מצב צפייה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="הגדרות" />
      <Card className="space-y-4">
        <SectionTitle>{settings.baby_name}</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Field label="שם"><Input className="h-[46px]" value={form.baby_name} onChange={(e) => setForm({ ...form, baby_name: e.target.value })} /></Field>
          <Field label="תאריך לידה"><Input type="date" className="h-[46px] text-center" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></Field>
        </div>
        <Field as="div" label="בן או בת">
          <Segmented options={GENDERS} value={form.baby_gender || ''} onChange={(v) => setForm({ ...form, baby_gender: v })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="סוג האכלה ברירת מחדל">
            <Select className="h-[46px]" value={form.default_feeding_type} onChange={(e) => setForm({ ...form, default_feeding_type: e.target.value })}>
              {FEEDING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
          <Field label="התראה אחרי (שעות)">
            <Input type="number" inputMode="decimal" step="0.5" min="1" max="12" className="h-[46px]" value={form.feeding_alert_hours} onChange={(e) => setForm({ ...form, feeding_alert_hours: e.target.value })} />
          </Field>
        </div>
        <p className="text-xs text-mute">ההתראה במסך הבית קופצת אחרי כך וכך שעות בלי האכלה.</p>
        <Button className="w-full" onClick={submit}>{saved ? 'נשמר ✓' : 'שמירה'}</Button>
      </Card>

      <ChildrenCard />

      <PushCard />

      <SummaryEmailCard settings={settings} save={save} />

      <UsersCard />

      <ExportCard />

      {themeCard}

      {isLocalBackend && <LocalTools />}

      <p className="text-center text-xs text-mute">מחובר/ת כ-{displayUser(user?.email)}</p>
    </div>
  );
}
