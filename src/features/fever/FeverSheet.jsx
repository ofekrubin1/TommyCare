import { useState } from 'react';
import { C } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';

// Temperature / illness entry, optionally with a medicine given (name, dose) so the next dose time is clear.
export default function FeverSheet({ record, onClose }) {
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [temp, setTemp] = useState(record?.temp_c ?? '');
  const [symptoms, setSymptoms] = useState(record?.symptoms || '');
  const [medicine, setMedicine] = useState(record?.medicine || '');
  const [dose, setDose] = useState(record?.dose || '');
  const [note, setNote] = useState(record?.note || '');

  return (
    <RecordSheet
      collection={C.fever} record={record} onClose={onClose} title={['חום ומחלה', 'עריכת מדידה']}
      values={() => ({
        time: fromLocalInput(time), temp_c: temp === '' ? null : Number(temp),
        symptoms: symptoms.trim(), medicine: medicine.trim(), dose: dose.trim(), note: note.trim(),
      })}
      canSave={temp !== '' || !!symptoms.trim() || !!medicine.trim()}
    >
      <DateTimeField label="שעה" value={time} onChange={setTime} />
      <Field label="חום (°C)">
        <Input type="number" inputMode="decimal" step="0.1" min="34" max="43" placeholder="37.5" value={temp} onChange={(e) => setTemp(e.target.value)} />
      </Field>
      <Field label="תסמינים">
        <Input placeholder="לדוגמה: נזלת, שיעול" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="תרופה שניתנה">
          <Input placeholder="לא חובה" value={medicine} onChange={(e) => setMedicine(e.target.value)} />
        </Field>
        <Field label="מינון">
          <Input placeholder="לדוגמה 2.5 מ״ל" value={dose} onChange={(e) => setDose(e.target.value)} />
        </Field>
      </div>
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}
