import { useState } from 'react';
import { format } from 'date-fns';
import { C } from '@/data';
import { RecordSheet } from '@/components/forms/RecordSheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { TimeButton } from '@/components/ui/TimeWheels';
import { Chip, Segmented, Switch } from '@/components/ui/Choice';
import { DEFAULT_DURATION, DOCTOR_TYPES, DURATIONS } from './appointmentUtils';

// Before: type, date, time (5-minute steps), length (for the calendar), place, questions. After ("done"): optional summary of what happened.
// mode="done": opened from the "done" checkbox, focused on the summary.
export default function AppointmentSheet({ record, mode, onClose }) {
  const [doctor, setDoctor] = useState(record?.doctor_type || DOCTOR_TYPES[0]);
  const [date, setDate] = useState(record?.date || format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(record?.time || '');
  const [duration, setDuration] = useState(record?.duration || DEFAULT_DURATION);
  const [location, setLocation] = useState(record?.location || '');
  const [note, setNote] = useState(record?.note || '');
  const [summary, setSummary] = useState(record?.summary || '');
  const [done, setDone] = useState(mode === 'done' || !!record?.done);
  const customDoctor = !DOCTOR_TYPES.slice(0, -1).includes(doctor);

  const values = () => ({
    doctor_type: doctor.trim(), date, time, duration: time ? duration : null, location: location.trim(), note: note.trim(), summary: summary.trim(),
    done, done_at: done ? record?.done_at || new Date().toISOString() : null,
  });

  if (mode === 'done') {
    return (
      <RecordSheet collection={C.appointments} record={record} onClose={onClose} title={`${record.doctor_type} · מה היה בתור?`} values={values} saveText="סימון כבוצע">
        <Field label={<>מה היה בתור<Optional /></>}>
          <Textarea rows={5} placeholder="מה נאמר, המלצות, מרשמים, משקל" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
      </RecordSheet>
    );
  }

  return (
    <RecordSheet
      collection={C.appointments} record={record} onClose={onClose} title={['תור חדש', 'עריכת תור']}
      values={values} canSave={!!date && !!doctor.trim() && doctor !== 'אחר'}
    >
      <Field as="div" label="סוג רופא">
        {/* one row, scrolls sideways */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {DOCTOR_TYPES.map((t) => <Chip key={t} className="flex-none whitespace-nowrap" selected={doctor === t || (t === 'אחר' && customDoctor)} onClick={() => setDoctor(t)}>{t}</Chip>)}
        </div>
        {customDoctor && (
          <Input className="mt-2" placeholder="איזה רופא?" value={doctor === 'אחר' ? '' : doctor} onChange={(e) => setDoctor(e.target.value || 'אחר')} />
        )}
      </Field>
      <Field as="div" label="תאריך ושעה">
        <div className="grid grid-cols-2 gap-3">
          <Input type="date" className="h-12 text-center text-lg font-medium" value={date} onChange={(e) => setDate(e.target.value)} />
          <TimeButton value={time} onChange={setTime} allowEmpty />
        </div>
      </Field>
      {time && (
        <Field as="div" label="משך התור">
          <Segmented options={DURATIONS.map((d) => ({ value: d.value, label: d.short }))} value={duration} onChange={setDuration} />
        </Field>
      )}
      <Field label={<>מקום<Optional /></>}><Input value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
      <Field label="הערה / שאלות לשאול"><Textarea rows={2} placeholder="מה חשוב לשאול בתור?" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      {record && (
        <>
          <Switch label="התור בוצע" checked={done} onChange={setDone} />
          {done && (
            <Field label={<>מה היה בתור<Optional /></>}><Textarea rows={4} placeholder="מה נאמר, המלצות, מרשמים, משקל" value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
          )}
        </>
      )}
    </RecordSheet>
  );
}
