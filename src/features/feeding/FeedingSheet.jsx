import { useState } from 'react';
import { C, collection } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { CheckTile, Segmented } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { BREAST_SIDES, FEEDING_OPTIONS, FEEDING_TYPES, isBottle } from './feedingTypes';
import { useCollection } from '@/hooks/useCollection';
import { findRecentDuplicate } from '@/features/timeline/duplicates';
import { DuplicateWarning } from '@/features/timeline/DuplicateWarning';

// Feeding start: type (defaults to the setting), breast sides (both by default), start time (defaults to now),
// optional ml for bottles, note.
export default function FeedingSheet({ record, onClose }) {
  const { settings } = useSettings();
  const [type, setType] = useState(record?.type || settings.default_feeding_type);
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [amount, setAmount] = useState(record?.amount_ml ?? '');
  const [note, setNote] = useState(record?.note || '');
  const [sides, setSides] = useState(record?.sides?.length ? record.sides : ['right', 'left']);
  const toggleSide = (side) => setSides((s) => (s.includes(side) ? s.filter((x) => x !== side) : [...s, side]));
  const [saving, setSaving] = useState(false);

  const [dup, setDup] = useState(null);
  const { data: existing } = useCollection(C.feedings);

  const save = async (force = false) => {
    const data = { type, time: fromLocalInput(time), amount_ml: isBottle(type) && amount !== '' ? Number(amount) : null,
      sides: type === 'breast' ? BREAST_SIDES.map((x) => x.value).filter((v) => sides.includes(v)) : null, note: note.trim() };
    if (!record && !force) {
      const found = findRecentDuplicate(existing, data.time, (r) => r.type === type);
      if (found) { setDup(found); return; }
    }
    setDup(null);
    setSaving(true);
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
      {type === 'breast' && (
        <div className="grid grid-cols-2 gap-3">
          {BREAST_SIDES.map((x) => <CheckTile key={x.value} label={x.label} checked={sides.includes(x.value)} onChange={() => toggleSide(x.value)} />)}
        </div>
      )}
      <DateTimeField label="שעת התחלה" value={time} onChange={setTime} />
      {isBottle(type) && (
        <Field label="כמות (מ״ל)" hint="לא חובה">
          <Input type="number" inputMode="numeric" min="0" placeholder="לדוגמה 90" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      )}
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <DuplicateWarning found={dup} label={type === 'breast' ? 'הנקה' : `האכלה (${FEEDING_TYPES[type].label})`} field="time" onCancel={() => setDup(null)} onConfirm={() => save(true)} />
      {!dup && <Button className="w-full" onClick={() => save()} disabled={saving || !time || (type === 'breast' && !sides.length)}>{saving ? 'שומר...' : 'שמירה'}</Button>}
    </Sheet>
  );
}
