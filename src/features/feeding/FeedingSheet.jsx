import { useState } from 'react';
import { C, collection } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { FEEDING_OPTIONS, isBottle } from './feedingTypes';

// Feeding start: type (defaults to the setting), start time (defaults to now), optional ml for bottles, note.
export default function FeedingSheet({ record, onClose }) {
  const { settings } = useSettings();
  const [type, setType] = useState(record?.type || settings.default_feeding_type);
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [amount, setAmount] = useState(record?.amount_ml ?? '');
  const [note, setNote] = useState(record?.note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { type, time: fromLocalInput(time), amount_ml: isBottle(type) && amount !== '' ? Number(amount) : null, note: note.trim() };
    try {
      if (record) await collection(C.feedings).update(record.id, data);
      else await collection(C.feedings).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת האכלה' : 'האכלה'}>
      <Segmented options={FEEDING_OPTIONS} value={type} onChange={setType} />
      <Field label="שעת התחלה">
        <Input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} />
      </Field>
      {isBottle(type) && (
        <Field label="כמות (מ״ל)" hint="לא חובה">
          <Input type="number" inputMode="numeric" min="0" placeholder="לדוגמה 90" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      )}
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <Button className="w-full" onClick={save} disabled={saving || !time}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
