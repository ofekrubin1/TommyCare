import { useState } from 'react';
import { C } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';

// A regular medicine / vitamin. "Daily" ones get a "given today" checkbox on the home screen.
export default function MedSheet({ record, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [dose, setDose] = useState(record?.dose || '');
  const [daily, setDaily] = useState(record?.daily ?? true);
  const [active, setActive] = useState(record?.active ?? true);

  return (
    <RecordSheet
      collection={C.meds} record={record} onClose={onClose} title={['תרופה / ויטמין', 'עריכת תרופה']}
      values={() => ({ name: name.trim(), dose: dose.trim(), daily, active })}
      canSave={!!name.trim()}
    >
      <Field label="שם">
        <Input placeholder="לדוגמה: ויטמין D" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="מינון">
        <Input placeholder="לפי הנחיית הרופא/ה" value={dose} onChange={(e) => setDose(e.target.value)} />
      </Field>
      <Switch label="ניתן כל יום (תזכורת במסך הבית)" checked={daily} onChange={setDaily} />
      <Switch label="פעיל" checked={active} onChange={setActive} />
    </RecordSheet>
  );
}
