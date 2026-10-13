import { useState } from 'react';
import { C, collection } from '@/data';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';

// A regular medicine / vitamin. "Daily" ones get a "given today" checkbox on the home screen.
export default function MedSheet({ record, onClose }) {
  const [name, setName] = useState(record?.name || '');
  const [dose, setDose] = useState(record?.dose || '');
  const [daily, setDaily] = useState(record?.daily ?? true);
  const [active, setActive] = useState(record?.active ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { name: name.trim(), dose: dose.trim(), daily, active };
    try {
      if (record) await collection(C.meds).update(record.id, data);
      else await collection(C.meds).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת תרופה' : 'תרופה / ויטמין'}>
      <Field label="שם">
        <Input placeholder="לדוגמה: ויטמין D" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="מינון">
        <Input placeholder="לפי הנחיית הרופא/ה" value={dose} onChange={(e) => setDose(e.target.value)} />
      </Field>
      <Switch label="ניתן כל יום (תזכורת במסך הבית)" checked={daily} onChange={setDaily} />
      <Switch label="פעיל" checked={active} onChange={setActive} />
      <Button className="w-full" onClick={save} disabled={saving || !name.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
