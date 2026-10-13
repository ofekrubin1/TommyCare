import { useState } from 'react';
import { Archive, CalendarClock, MapPin, Plus } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import AppointmentSheet from './AppointmentSheet';
import { archived, upcoming, whenText } from './appointmentUtils';

function AppointmentRow({ a, now, onOpen, past }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <button onClick={onOpen} className="flex-1 min-w-0 text-right">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{a.doctor_type}</span>
          <span className={cn('text-sm', past ? 'text-mute' : 'text-health font-medium')}>{whenText(a, now)}</span>
        </div>
        {a.location && <p className="flex items-center gap-1 text-sm text-mute"><MapPin className="w-3.5 h-3.5" />{a.location}</p>}
        {a.note && <p className="mt-1 text-sm text-mute whitespace-pre-wrap"><span className="font-medium">לשאול: </span>{a.note}</p>}
        {past && (a.summary
          ? <p className="mt-1 rounded-lg bg-note/10 px-2.5 py-1.5 text-sm whitespace-pre-wrap">{a.summary}</p>
          : <p className="mt-1 text-sm text-accent">+ להוסיף מה היה בתור</p>)}
      </button>
      <RowActions onDelete={() => collection(C.appointments).remove(a.id)} />
    </div>
  );
}

export default function AppointmentsSection() {
  const { data } = useCollection(C.appointments);
  const now = useNow(60_000);
  const [editing, setEditing] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const next = upcoming(data, now);
  const past = archived(data, now);

  return (
    <Card>
      <SectionTitle action={<Button variant="soft" className="py-1.5 px-3 text-sm" onClick={() => setEditing('new')}><Plus className="w-4 h-4" />תור</Button>}>
        תורים קרובים
      </SectionTitle>
      {!next.length ? <EmptyState icon={CalendarClock} text="אין תורים קרובים" /> : (
        <div className="divide-y divide-line">{next.map((a) => <AppointmentRow key={a.id} a={a} now={now} onOpen={() => setEditing(a)} />)}</div>
      )}
      {past.length > 0 && (
        <div className="mt-2 border-t border-line pt-2">
          <button onClick={() => setShowArchive((v) => !v)} className="flex items-center gap-2 py-1 text-sm font-medium text-mute">
            <Archive className="w-4 h-4" />ארכיון תורים ({past.length})
          </button>
          {showArchive && <div className="divide-y divide-line">{past.map((a) => <AppointmentRow key={a.id} a={a} now={now} past onOpen={() => setEditing(a)} />)}</div>}
        </div>
      )}
      {editing && <AppointmentSheet record={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
