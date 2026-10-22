import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Bell, CalendarCheck, Check, ListChecks, Plus } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useCanEdit } from '@/core/auth/useRole';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import { cachedToken, deleteGoogleEvent } from '@/lib/googleCalendar';
import { PageHeader } from '@/components/layout/PageHeader';
import TaskSheet from '@/features/tasks/TaskSheet';

// Deleting a task also removes its Google Calendar event, when Google is already signed in (no popup).
async function removeTask(task) {
  await collection(C.tasks).remove(task.id);
  const token = task.google_event_id && cachedToken();
  if (token) deleteGoogleEvent(token, task.google_event_id).catch(() => {});
}

function TaskRow({ task, now, onEdit }) {
  const canEdit = useCanEdit();
  const due = task.remind_at && parseISO(task.remind_at);
  const late = !task.done && due && due < now;
  const toggle = () => collection(C.tasks).update(task.id, { done: !task.done, done_at: task.done ? null : new Date().toISOString() });
  return (
    <div className="flex items-start gap-3 py-2.5">
      <button
        onClick={toggle}
        disabled={!canEdit}
        role="checkbox"
        aria-checked={!!task.done}
        aria-label={task.done ? `ביטול סימון ${task.title}` : `סימון ${task.title} כבוצעה`}
        className={cn('mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2', task.done ? 'border-note bg-note text-white' : 'border-line')}
      >
        {task.done && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <button onClick={onEdit} disabled={!canEdit} className="min-w-0 flex-1 text-right">
        <span className={cn('block font-medium', task.done && 'text-mute line-through')}>{task.title}</span>
        {task.note && <span className="block whitespace-pre-wrap text-sm text-mute">{task.note}</span>}
        {due && !task.done && (
          <span className={cn('mt-0.5 flex items-center gap-1 text-xs', late ? 'text-danger' : 'text-accent')}>
            <Bell className="h-3.5 w-3.5" />{format(due, 'dd/MM HH:mm')}{task.reminded_at ? ' · נשלחה תזכורת' : ''}
            {task.google_event_id && <CalendarCheck className="h-3.5 w-3.5" aria-label="ב-Google Calendar" />}
          </span>
        )}
      </button>
      <RowActions onDelete={() => removeTask(task)} />
    </div>
  );
}

// Tasks for Tom, like the shopping list: open (by reminder time) → done.
export default function TasksPage() {
  const { data } = useCollection(C.tasks);
  const now = useNow(60_000);
  const [editing, setEditing] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const canEdit = useCanEdit();
  const open = data.filter((t) => !t.done).sort((a, b) => (a.remind_at || '9999').localeCompare(b.remind_at || '9999') || (b.created_at || '').localeCompare(a.created_at || ''));
  const done = data.filter((t) => t.done).sort((a, b) => (b.done_at || '').localeCompare(a.done_at || ''));
  const rowProps = (t) => ({ task: t, now, onEdit: () => setEditing(t) });

  return (
    <div className="space-y-4">
      <PageHeader title="משימות" action={canEdit && <Button className="py-2 text-sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />משימה</Button>} />
      <Card>
        <SectionTitle>לעשות ({open.length})</SectionTitle>
        {!open.length ? <EmptyState icon={ListChecks} text="אין משימות פתוחות" /> : (
          <div className="divide-y divide-line">{open.map((t) => <TaskRow key={t.id} {...rowProps(t)} />)}</div>
        )}
      </Card>
      {done.length > 0 && (
        <Card>
          <button onClick={() => setShowDone((v) => !v)} className="flex w-full items-center gap-2 text-sm font-semibold text-mute">
            <Check className="h-4 w-4" />בוצעו ({done.length})
          </button>
          {showDone && <div className="mt-2 divide-y divide-line">{done.map((t) => <TaskRow key={t.id} {...rowProps(t)} />)}</div>}
        </Card>
      )}
      {editing && <TaskSheet record={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
