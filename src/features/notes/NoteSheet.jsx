import { useState } from 'react';
import { C, collection } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

// Free-text "what happened today" entry; appears in the daily log.
export default function NoteSheet({ record, onClose }) {
  const [time, setTime] = useState(toLocalInput(record?.time));
  const [text, setText] = useState(record?.text || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { time: fromLocalInput(time), text: text.trim() };
    try {
      if (record) await collection(C.notes).update(record.id, data);
      else await collection(C.notes).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת הערה' : 'מה קרה?'}>
      <Field label="מה קרה">
        <Textarea rows={4} autoFocus placeholder="לדוגמה: חייכה בפעם הראשונה" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <DateTimeField label="שעה" value={time} onChange={setTime} />
      <Button className="w-full" onClick={save} disabled={saving || !text.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
