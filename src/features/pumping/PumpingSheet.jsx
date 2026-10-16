import { useState } from 'react';
import { C } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Segmented, Switch } from '@/components/ui/Choice';

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

  return (
    <RecordSheet
      collection={C.pumping} record={record} onClose={onClose} title={['שאיבה', 'עריכת שאיבה']}
      values={() => ({ time: fromLocalInput(time), amount_ml: Number(amount), stored, storage: stored ? storage : null, used: record?.used ?? false, note: note.trim() })}
      canSave={!!amount}
      duplicate={{ label: 'שאיבה' }}
    >
      <DateTimeField label="שעה" value={time} onChange={setTime} />
      <Field label="כמות (מ״ל)">
        <Input type="number" inputMode="numeric" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Switch label="נשמר למלאי" checked={stored} onChange={setStored} />
      {stored && <Segmented options={STORAGE} value={storage} onChange={setStorage} />}
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}
