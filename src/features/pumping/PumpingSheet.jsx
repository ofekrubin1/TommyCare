import { useState } from 'react';
import { C, collection } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Segmented, Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';

export const STORAGE = [
  { value: 'fridge', label: 'מקרר' },
  { value: 'freezer', label: 'מקפיא' },
];

// Pumping session; "stored" milk joins the stash until marked as used.
export default function PumpingSheet({ record, onClose }) {
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [amount, setAmount] = useState(record?.amount_ml ?? '');
  const [stored, setStored] = useState(record?.stored ?? true);
  const [storage, setStorage] = useState(record?.storage || 'fridge');
  const [note, setNote] = useState(record?.note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { time: fromLocalInput(time), amount_ml: Number(amount), stored, storage: stored ? storage : null, used: record?.used ?? false, note: note.trim() };
    try {
      if (record) await collection(C.pumping).update(record.id, data);
      else await collection(C.pumping).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת שאיבה' : 'שאיבה'}>
      <DateTimeField label="שעה" value={time} onChange={setTime} />
      <Field label="כמות (מ״ל)">
        <Input type="number" inputMode="numeric" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Switch label="נשמר למלאי" checked={stored} onChange={setStored} />
      {stored && <Segmented options={STORAGE} value={storage} onChange={setStorage} />}
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <Button className="w-full" onClick={save} disabled={saving || !amount}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
