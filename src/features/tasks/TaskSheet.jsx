import { useState } from 'react';
import { C, collection } from '@/data';
import { fromLocalInput, toLocalInput } from '@/lib/time';
import { Sheet } from '@/components/ui/Sheet';
import { DateTimeField } from '@/components/ui/DateTime';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';

// A task for Tom (e.g. "להזמין תור לטיפת חלב"), with an optional reminder time.
export default function TaskSheet({ record, onClose }) {
  const [title, setTitle] = useState(record?.title || '');
  const [note, setNote] = useState(record?.note || '');
  const [remind, setRemind] = useState(!!record?.remind_at);
  const [remindAt, setRemindAt] = useState(toLocalInput(record?.remind_at));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const at = remind ? fromLocalInput(remindAt) : null;
    // A new or moved reminder is sent again; an unchanged one keeps its "sent" mark.
    const data = { title: title.trim(), note: note.trim(), remind_at: at, ...(at !== (record?.remind_at || null) ? { reminded_at: null } : {}) };
    try {
      if (record) await collection(C.tasks).update(record.id, data);
      else await collection(C.tasks).add({ ...data, done: false });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת משימה' : 'משימה חדשה'}>
      <Field label="מה צריך לעשות"><Input autoFocus={!record} placeholder="לדוגמה: להזמין תור לטיפת חלב" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label={<>הערה<Optional /></>}><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Switch label="תזכורת" checked={remind} onChange={setRemind} />
      {remind && (
        <>
          <DateTimeField label="מתי להזכיר" value={remindAt} onChange={setRemindAt} />
          <p className="text-xs text-mute">התזכורת נשלחת במייל לכתובות שבהגדרות (סיכום יומי במייל). אפשר גם להוסיף ליומן מהרשימה.</p>
        </>
      )}
      <Button className="w-full" onClick={save} disabled={saving || !title.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
