import { useState } from 'react';
import { C } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Textarea } from '@/components/ui/Field';

// Free-text "what happened today" entry; appears in the daily log.
export default function NoteSheet({ record, onClose }) {
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [text, setText] = useState(record?.text || '');

  return (
    <RecordSheet
      collection={C.notes} record={record} onClose={onClose} title={['מה קרה?', 'עריכת הערה']}
      values={() => ({ time: fromLocalInput(time), text: text.trim() })}
      canSave={!!text.trim()}
    >
      <Field label="מה קרה">
        <Textarea rows={4} placeholder="לדוגמה: חיוך ראשון!" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <DateTimeField label="שעה" value={time} onChange={setTime} />
    </RecordSheet>
  );
}
