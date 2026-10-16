import { useState } from 'react';
import { C } from '@/data';
import { useSettings } from '@/hooks/useSettings';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { CheckTile, Segmented } from '@/components/ui/Choice';
import { BREAST_SIDES, FEEDING_OPTIONS, FEEDING_TYPES, isBottle } from './feedingTypes';

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

  return (
    <RecordSheet
      collection={C.feedings} record={record} onClose={onClose} title={['האכלה', 'עריכת האכלה']}
      values={() => ({
        type, time: fromLocalInput(time), amount_ml: isBottle(type) && amount !== '' ? Number(amount) : null,
        sides: type === 'breast' ? BREAST_SIDES.map((x) => x.value).filter((v) => sides.includes(v)) : null, note: note.trim(),
      })}
      canSave={!!time && (type !== 'breast' || sides.length > 0)}
      duplicate={{ isSame: (r) => r.type === type, label: type === 'breast' ? 'הנקה' : `האכלה (${FEEDING_TYPES[type].label})` }}
    >
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
    </RecordSheet>
  );
}
