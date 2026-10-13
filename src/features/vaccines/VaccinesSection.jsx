import { useState } from 'react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { Check, Syringe } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useSettings } from '@/hooks/useSettings';
import { dueDate, VACCINE_SCHEDULE } from '@/lib/vaccines';
import { cn } from '@/lib/utils';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

// Vaccines that are due within `days` (or overdue) and not yet given. Used for the home-screen reminder.
export function dueVaccines(birthDate, done, days = 14, today = new Date()) {
  if (!birthDate) return [];
  return VACCINE_SCHEDULE
    .filter((v) => !done[v.key])
    .map((v) => ({ ...v, due: dueDate(birthDate, v.months) }))
    .filter((v) => differenceInCalendarDays(parseISO(v.due), today) <= days);
}

function MarkSheet({ vaccine, record, onClose }) {
  const [date, setDate] = useState(record?.date || format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState(record?.note || '');
  const save = async () => {
    await collection(C.vaccinations).set(vaccine.key, { name: vaccine.name, date, note: note.trim() });
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title={vaccine.name}>
      <Field label="תאריך החיסון"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="הערה"><Textarea placeholder="לדוגמה: תגובה, מקום הזריקה" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Button className="w-full" onClick={save} disabled={!date}>סימון כבוצע</Button>
      {record && <Button variant="danger" className="w-full" onClick={() => { collection(C.vaccinations).remove(vaccine.key); onClose(); }}>ביטול הסימון</Button>}
    </Sheet>
  );
}

export default function VaccinesSection() {
  const { settings } = useSettings();
  const { data } = useCollection(C.vaccinations);
  const [open, setOpen] = useState(null);
  const done = Object.fromEntries(data.map((v) => [v.id, v]));
  const today = new Date();

  return (
    <Card>
      <SectionTitle>חיסונים</SectionTitle>
      {!settings.birth_date && <p className="mb-2 rounded-xl bg-diaper/10 px-3 py-2 text-sm text-diaper">הוסיפו תאריך לידה בהגדרות כדי לראות מתי כל חיסון.</p>}
      <div className="divide-y divide-line">
        {VACCINE_SCHEDULE.map((v) => {
          const record = done[v.key];
          const due = dueDate(settings.birth_date, v.months);
          const daysLeft = due ? differenceInCalendarDays(parseISO(due), today) : null;
          const status = record ? 'done' : daysLeft == null ? '' : daysLeft < 0 ? 'late' : daysLeft <= 14 ? 'soon' : '';
          return (
            <button key={v.key} onClick={() => setOpen(v)} className="flex w-full items-center gap-3 py-2.5 text-right">
              <span className={cn('flex h-7 w-7 flex-none items-center justify-center rounded-full',
                record ? 'bg-health text-white' : status === 'late' ? 'bg-danger/10 text-danger' : status === 'soon' ? 'bg-diaper/10 text-diaper' : 'bg-line/60 text-mute')}>
                {record ? <Check className="h-4 w-4" strokeWidth={3} /> : <Syringe className="h-3.5 w-3.5" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium">{v.name}</span>
                <span className="block text-xs text-mute">
                  {record ? `בוצע ${format(parseISO(record.date), 'dd/MM/yyyy')}${record.note ? ` · ${record.note}` : ''}`
                    : due ? `${v.months === 0 ? 'בלידה' : `גיל ${v.months} חודשים`} · ${format(parseISO(due), 'dd/MM/yyyy')}${status === 'late' ? ' · עבר המועד' : status === 'soon' ? ' · בקרוב' : ''}`
                      : v.months === 0 ? 'בלידה' : `גיל ${v.months} חודשים`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-mute">הלוח מבוסס על תוכנית החיסונים של משרד הבריאות. כדאי לוודא מול טיפת חלב.</p>
      {open && <MarkSheet vaccine={open} record={done[open.key]} onClose={() => setOpen(null)} />}
    </Card>
  );
}
