import { useState } from 'react';
import { C, collection } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { useCollection } from '@/hooks/useCollection';
import { findRecentDuplicate } from '@/features/timeline/duplicates';
import { DuplicateWarning } from '@/features/timeline/DuplicateWarning';

// Sleep with start + end. "Still sleeping" leaves end empty; the home screen shows a "woke up" button.
export default function SleepSheet({ record, onClose }) {
  const [start, setStart] = useState(toLocalInput(record?.start));
  const [ongoing, setOngoing] = useState(record ? !record.end : true);
  const [end, setEnd] = useState(toLocalInput(record?.end));
  const [note, setNote] = useState(record?.note || '');
  const [saving, setSaving] = useState(false);
  const invalid = !start || (!ongoing && (!end || end <= start));

  const [dup, setDup] = useState(null);
  const { data: existing } = useCollection(C.sleeps);

  const save = async (force = false) => {
    const data = { start: fromLocalInput(start), end: ongoing ? null : fromLocalInput(end), note: note.trim() };
    if (!record && !force) {
      const found = findRecentDuplicate(existing, data.start, () => true, 'start');
      if (found) { setDup(found); return; }
    }
    setDup(null);
    setSaving(true);
    try {
      if (record) await collection(C.sleeps).update(record.id, data);
      else await collection(C.sleeps).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת שינה' : 'שינה'}>
      <DateTimeField label="נרדמה" value={start} onChange={setStart} />
      <Switch label="עדיין ישנה" checked={ongoing} onChange={setOngoing} />
      {!ongoing && (
        <DateTimeField label="התעוררה" value={end} min={start} onChange={setEnd} />
      )}
      <Field label="הערה">
        <Textarea placeholder="לא חובה" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <DuplicateWarning found={dup} label={'שינה'} field="start" onCancel={() => setDup(null)} onConfirm={() => save(true)} />
      {!dup && <Button className="w-full" onClick={() => save()} disabled={saving || invalid}>{saving ? 'שומר...' : 'שמירה'}</Button>}
    </Sheet>
  );
}
