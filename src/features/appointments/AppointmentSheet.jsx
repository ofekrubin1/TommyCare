import { useState } from 'react';
import { format } from 'date-fns';
import { C, collection } from '@/data';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Optional, Textarea } from '@/components/ui/Field';
import { TimeButton } from '@/components/ui/TimeWheels';
import { Chip, Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
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
  const [saving, setSaving] = useState(false);
  const customDoctor = !DOCTOR_TYPES.slice(0, -1).includes(doctor);

  const save = async () => {
    setSaving(true);
    const data = {
      doctor_type: doctor.trim(), date, time, duration: time ? duration : null, location: location.trim(), note: note.trim(), summary: summary.trim(),
      done, done_at: done ? record?.done_at || new Date().toISOString() : null,
    };
    try {
      if (record) await collection(C.appointments).update(record.id, data);
      else await collection(C.appointments).add(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'done') {
    return (
      <Sheet open onClose={onClose} title={`${record.doctor_type} · מה היה בתור?`}>
        <Field label={<>מה היה בתור<Optional /></>}>
          <Textarea rows={5} autoFocus placeholder="מה נאמר, המלצות, מרשמים, משקל" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
        <Button className="w-full" onClick={save} disabled={saving}>{saving ? 'שומר...' : 'סימון כבוצע'}</Button>
      </Sheet>
    );
  }

  return (
    <Sheet open onClose={onClose} title={record ? 'עריכת תור' : 'תור חדש'}>
      <Field as="div" label="סוג רופא">
        <div className="flex flex-wrap gap-2">
          {DOCTOR_TYPES.map((t) => <Chip key={t} selected={doctor === t || (t === 'אחר' && customDoctor)} onClick={() => setDoctor(t)}>{t}</Chip>)}
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
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => <Chip key={d.value} selected={duration === d.value} onClick={() => setDuration(d.value)}>{d.label}</Chip>)}
          </div>
        </Field>
      )}
      <Field label={<>מקום<Optional /></>}><Input value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
      <Field label="הערה / שאלות לשאול"><Textarea rows={3} placeholder="מה חשוב לשאול בתור?" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      {record && (
        <>
          <Switch label="התור בוצע" checked={done} onChange={setDone} />
          {done && (
            <Field label={<>מה היה בתור<Optional /></>}><Textarea rows={4} placeholder="מה נאמר, המלצות, מרשמים, משקל" value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
          )}
        </>
      )}
      <Button className="w-full" onClick={save} disabled={saving || !date || !doctor.trim() || doctor === 'אחר'}>{saving ? 'שומר...' : 'שמירה'}</Button>
    </Sheet>
  );
}
