import { useState } from 'react';
import { format } from 'date-fns';
import { C, collection } from '@/data';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';

// Add a vaccine by hand, or edit one (name, due date, given + date, note).
// Scheduled vaccines are stored under their schedule key; custom ones get their own document.
export default function VaccineSheet({ vaccine, onClose }) {
  const isNew = !vaccine;
  const [name, setName] = useState(vaccine?.name || '');
  const [due, setDue] = useState(vaccine?.due || '');
  const [given, setGiven] = useState(!!vaccine?.given);
  const [date, setDate] = useState(vaccine?.given || format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState(vaccine?.note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const data = { name: name.trim(), due_date: due || null, date: given ? date : null, note: note.trim(), hidden: false };
    try {
      if (isNew) await collection(C.vaccinations).add({ ...data, custom: true });
      else await collection(C.vaccinations).set(vaccine.key, vaccine.custom ? { ...data, custom: true } : data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={isNew ? 'חיסון חדש' : 'עריכת חיסון'}>
      <Field label="שם החיסון"><Input autoFocus={isNew} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={<>מועד מתוכנן<Optional /></>}><Input type="date" className="h-12" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      <Switch label="בוצע" checked={given} onChange={setGiven} />
      {given && <Field label="תאריך החיסון"><Input type="date" className="h-12" value={date} onChange={(e) => setDate(e.target.value)} /></Field>}
      <Field label={<>הערה<Optional /></>}><Textarea placeholder="לדוגמה: תגובה, מקום הזריקה" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Button className="w-full" onClick={save} disabled={saving || !name.trim() || (given && !date)}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
