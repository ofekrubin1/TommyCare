import { useState } from 'react';
import { format } from 'date-fns';
import { C, collection } from '@/data';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Chip } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { DOCTOR_TYPES, isPast } from './appointmentUtils';

// Before: type, date, time, place, questions to ask. After: summary of what happened.
export default function AppointmentSheet({ record, onClose }) {
  const [doctor, setDoctor] = useState(record?.doctor_type || DOCTOR_TYPES[0]);
  const [date, setDate] = useState(record?.date || format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(record?.time || '');
  const [location, setLocation] = useState(record?.location || '');
  const [note, setNote] = useState(record?.note || '');
  const [summary, setSummary] = useState(record?.summary || '');
  const [saving, setSaving] = useState(false);
  const past = record && isPast(record);

  const save = async () => {
    setSaving(true);
    const data = { doctor_type: doctor.trim(), date, time, location: location.trim(), note: note.trim(), summary: summary.trim() };
    try {
      if (record) await collection(C.appointments).update(record.id, data);
      else await collection(C.appointments).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={record ? (past ? 'סיכום תור' : 'עריכת תור') : 'תור חדש'}>
      <Field label="סוג רופא">
        <div className="flex flex-wrap gap-2">
          {DOCTOR_TYPES.map((t) => <Chip key={t} selected={doctor === t} onClick={() => setDoctor(t)}>{t}</Chip>)}
        </div>
        {!DOCTOR_TYPES.slice(0, -1).includes(doctor) && (
          <Input className="mt-2" placeholder="איזה רופא?" value={doctor === 'אחר' ? '' : doctor} onChange={(e) => setDoctor(e.target.value || 'אחר')} />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="תאריך"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="שעה"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
      </div>
      <Field label="מקום"><Input placeholder="לא חובה" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
      <Field label="הערה / שאלות לשאול"><Textarea rows={3} placeholder="מה חשוב לשאול בתור?" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      {record && (
        <Field label="מה היה בתור"><Textarea rows={4} autoFocus={past} placeholder="מה נאמר, המלצות, מרשמים, משקל" value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
      )}
      <Button className="w-full" onClick={save} disabled={saving || !date || !doctor.trim()}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
