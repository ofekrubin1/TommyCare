import { useState } from 'react';
import { C } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';

// Sleep with start + end. "Still sleeping" leaves end empty; the home screen shows a "woke up" button.
export default function SleepSheet({ record, onClose }) {
  const [start, setStart] = useState(toLocalInput(record?.start));
  const [ongoing, setOngoing] = useState(record ? !record.end : true);
  const [end, setEnd] = useState(toLocalInput(record?.end));
  const [note, setNote] = useState(record?.note || '');
  const invalid = !start || (!ongoing && (!end || end <= start));

  return (
    <RecordSheet
      collection={C.sleeps} record={record} onClose={onClose} title={['שינה', 'עריכת שינה']}
      values={() => ({ start: fromLocalInput(start), end: ongoing ? null : fromLocalInput(end), note: note.trim() })}
      canSave={!invalid}
      duplicate={{ field: 'start', label: 'שינה' }}
    >
      <DateTimeField label="נרדמה" value={start} onChange={setStart} />
      <Switch label="עדיין ישנה" checked={ongoing} onChange={setOngoing} />
      {!ongoing && (
        <DateTimeField label="התעוררה" value={end} min={start} onChange={setEnd} />
      )}
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </RecordSheet>
  );
}
