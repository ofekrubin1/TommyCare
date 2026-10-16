import { useState } from 'react';
import { format } from 'date-fns';
import { C } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input, Textarea } from '@/components/ui/Field';

const optionalNumber = (v) => (v === '' || v == null ? null : Number(v));

export default function GrowthSheet({ record, onClose }) {
  const [date, setDate] = useState(record?.date || format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState(record?.weight_kg ?? '');
  const [height, setHeight] = useState(record?.height_cm ?? '');
  const [head, setHead] = useState(record?.head_cm ?? '');
  const [note, setNote] = useState(record?.note || '');

  return (
    <RecordSheet
      collection={C.growth} record={record} onClose={onClose} title={['מדידת גדילה', 'עריכת מדידה']}
      values={() => ({ date, weight_kg: optionalNumber(weight), height_cm: optionalNumber(height), head_cm: optionalNumber(head), note: note.trim() })}
      canSave={!!date && (weight !== '' || height !== '' || head !== '')}
    >
      <Field label="תאריך">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="משקל (ק״ג)">
          <Input type="number" inputMode="decimal" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="גובה (ס״מ)">
          <Input type="number" inputMode="decimal" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="היקף ראש">
          <Input type="number" inputMode="decimal" step="0.1" value={head} onChange={(e) => setHead(e.target.value)} />
        </Field>
      </div>
      <Field label="הערה">
        <Textarea placeholder="לדוגמה: נשקלה בטיפת חלב" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}
