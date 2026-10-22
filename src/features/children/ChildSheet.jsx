import { useState } from 'react';
import { C, collectionAt, setCurrentChild } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input, Select } from '@/components/ui/Field';
import { FEEDING_OPTIONS } from '@/features/feeding/feedingTypes';
import { Segmented } from '@/components/ui/Choice';
import { GENDERS } from '@/lib/gender';

// Add or edit a child: name, birth date, boy/girl (the app's wording), default feeding type, home-screen alert after X hours without feeding.
// A new child gets an empty log of their own and becomes the current child.
export default function ChildSheet({ record, nextOrder = 1, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [birth, setBirth] = useState(record?.birth_date || '');
  const [feeding, setFeeding] = useState(record?.default_feeding_type || 'breast');
  const [alertHours, setAlertHours] = useState(record?.feeding_alert_hours ?? 3);
  const [gender, setGender] = useState(record?.gender || '');

  const afterSave = (id) => {
    if (record) return;
    collectionAt(C.families).set('main', { name: 'המשפחה' }); // the family document (first child of a new family)
    setCurrentChild(id);
  };

  return (
    <RecordSheet
      collection={C.children} record={record} onClose={onClose} title={['ילד/ה חדש/ה', `עריכת ${record?.name || ''}`]}
      values={() => ({ name: name.trim(), birth_date: birth, gender, default_feeding_type: feeding, feeding_alert_hours: Number(alertHours) || 3 })}
      newDefaults={{ order: nextOrder, photo: '' }}
      canSave={!!name.trim()}
      afterSave={afterSave}
    >
      <div className="grid grid-cols-2 gap-2">
        <Field label="שם"><Input className="h-[46px]" placeholder="לדוגמה: איתי" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="תאריך לידה"><Input type="date" className="h-[46px] text-center" value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
      </div>
      <Field as="div" label="בן או בת"><Segmented options={GENDERS} value={gender} onChange={setGender} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="סוג האכלה ברירת מחדל">
          <Select className="h-[46px]" value={feeding} onChange={(e) => setFeeding(e.target.value)}>
            {FEEDING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="התראה אחרי (שעות)">
          <Input type="number" inputMode="decimal" step="0.5" min="1" max="12" className="h-[46px]" value={alertHours} onChange={(e) => setAlertHours(e.target.value)} />
        </Field>
      </div>
      {!record && <p className="text-xs text-mute">ל{name.trim() || 'ילד/ה'} יהיה יומן נפרד, שמתחיל ריק. קניות, מתנות ומשימות משותפות לכל המשפחה.</p>}
    </RecordSheet>
  );
}
