import { useState } from 'react';
import { format } from 'date-fns';
import { C, collection } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';

// Add a vaccine by hand, or edit one (name, due date, given + date, note).
// Scheduled vaccines are stored under their schedule key; custom ones get their own document.
export default function VaccineSheet({ vaccine, onClose }) {
  const isNew = !vaccine;
  const [name, setName] = useState(vaccine?.name || '');
  const [due, setDue] = useState(vaccine?.due || '');
  const [given, setGiven] = useState(!!vaccine?.given);
  const [date, setDate] = useState(vaccine?.given || format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState(vaccine?.note || '');

  const persist = async (data) => {
    if (isNew) return collection(C.vaccinations).add({ ...data, custom: true });
    await collection(C.vaccinations).set(vaccine.key, vaccine.custom ? { ...data, custom: true } : data);
    return vaccine.key;
  };

  return (
    <RecordSheet
      collection={C.vaccinations} record={vaccine} onClose={onClose} title={['חיסון חדש', 'עריכת חיסון']}
      values={() => ({ name: name.trim(), due_date: due || null, date: given ? date : null, note: note.trim(), hidden: false })}
      persist={persist}
      canSave={!!name.trim() && (!given || !!date)}
    >
      <Field label="שם החיסון"><Input autoFocus={isNew} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={<>מועד מתוכנן<Optional /></>}><Input type="date" className="h-12" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      <Switch label="בוצע" checked={given} onChange={setGiven} />
      {given && <Field label="תאריך החיסון"><Input type="date" className="h-12" value={date} onChange={(e) => setDate(e.target.value)} /></Field>}
      <Field label={<>הערה<Optional /></>}><Textarea placeholder="לדוגמה: תגובה, מקום הזריקה" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
    </RecordSheet>
  );
}
