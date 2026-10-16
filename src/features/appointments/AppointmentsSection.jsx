import { useState } from 'react';
import { Archive, CalendarClock, Check, MapPin, Plus } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { CalendarButton } from '@/components/ui/CalendarButton';
import { useSettings } from '@/hooks/useSettings';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import AppointmentSheet from './AppointmentSheet';
import GoogleCalendarImport from './GoogleCalendarImport';
import { archived, isOverdue, upcoming, whenText } from './appointmentUtils';
import { useCanEdit } from '@/hooks/useCanEdit';

function AppointmentRow({ a, now, onEdit, onToggleDone, babyName }) {
  const overdue = isOverdue(a, now);
  const canEdit = useCanEdit();
  return (
    <div className="flex items-start gap-3 py-3">
      <button
        onClick={onToggleDone}
        disabled={!canEdit}
        role="checkbox"
        aria-checked={!!a.done}
        aria-label={a.done ? 'ביטול סימון בוצע' : 'סימון שהתור בוצע'}
        className={cn('mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2', a.done ? 'border-health bg-health text-white' : overdue ? 'border-diaper' : 'border-line')}
      >
        {a.done && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <button onClick={onEdit} disabled={!canEdit} className="min-w-0 flex-1 text-right">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">{a.doctor_type}</span>
          <span className={cn('text-sm', a.done ? 'text-mute' : 'font-medium text-health')}>{whenText(a, now)}</span>
          {overdue && <span className="text-xs font-medium text-diaper">עבר המועד · לסמן כבוצע?</span>}
        </div>
        {a.location && <p className="flex items-center gap-1 text-sm text-mute"><MapPin className="h-3.5 w-3.5" />{a.location}</p>}
        {a.note && <p className="mt-1 whitespace-pre-wrap text-sm text-mute"><span className="font-medium">לשאול: </span>{a.note}</p>}
        {a.summary && <p className="mt-1 whitespace-pre-wrap rounded-lg bg-note/10 px-2.5 py-1.5 text-sm">{a.summary}</p>}
      </button>
      {!a.done && (
        <CalendarButton
          event={{
            id: a.id, title: `${babyName}-${a.doctor_type}`, // "תום-טיפת חלב": the import reads this prefix back
            date: a.date, time: a.time, location: a.location, description: a.note || '', alarms: a.time ? [1440, 120] : [1440],
          }}
          googleEventId={a.google_event_id}
          // Linked like an imported event, so "ייבוא מ-Google Calendar" won't add it again.
          onGoogleSaved={canEdit ? ({ id, updated }) => collection(C.appointments).update(a.id, { google_event_id: id, google_updated: updated }) : undefined}
        />
      )}
      <RowActions onDelete={() => collection(C.appointments).remove(a.id)} />
    </div>
  );
}

export default function AppointmentsSection() {
  const { data } = useCollection(C.appointments);
  const { settings } = useSettings();
  const canEdit = useCanEdit();
  const now = useNow(60_000);
  const [sheet, setSheet] = useState(null); // { record, mode }
  const [showArchive, setShowArchive] = useState(false);
  const next = upcoming(data);
  const past = archived(data);

  // Checking "done" opens "what happened" (optional); unchecking moves it back to upcoming.
  const toggleDone = (a) => (a.done
    ? collection(C.appointments).update(a.id, { done: false, done_at: null })
    : setSheet({ record: a, mode: 'done' }));
  const rowProps = (a) => ({ a, now, babyName: settings.baby_name, onEdit: () => setSheet({ record: a }), onToggleDone: () => toggleDone(a) });

  return (
    <Card>
      <SectionTitle action={<Button variant="soft" className="px-3 py-1.5 text-sm" onClick={() => setSheet({ record: null })}><Plus className="h-4 w-4" />תור</Button>}>
        תורים
      </SectionTitle>
      {!next.length ? <EmptyState icon={CalendarClock} text="אין תורים פתוחים" /> : (
        <div className="divide-y divide-line">{next.map((a) => <AppointmentRow key={a.id} {...rowProps(a)} />)}</div>
      )}
      {past.length > 0 && (
        <div className="mt-2 border-t border-line pt-2">
          <button onClick={() => setShowArchive((v) => !v)} className="flex items-center gap-2 py-1 text-sm font-medium text-mute">
            <Archive className="h-4 w-4" />ארכיון תורים שבוצעו ({past.length})
          </button>
          {showArchive && <div className="divide-y divide-line">{past.map((a) => <AppointmentRow key={a.id} {...rowProps(a)} />)}</div>}
        </div>
      )}
      {canEdit && <GoogleCalendarImport appointments={data} />}
      {sheet && <AppointmentSheet key={sheet.record?.id || 'new'} record={sheet.record} mode={sheet.mode} onClose={() => setSheet(null)} />}
    </Card>
  );
}
