import { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { collection } from '@/data';
import { useCanEdit } from '@/core/auth/useRole';
import { summarizeDay } from '@/features/summary/summarizeDay';
import { dayKey, dayLabel } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { COLLECTION_OF, EventList } from '@/features/timeline/EventRow';
import { filterEvents, filterLabel } from '@/features/timeline/eventFilters';
import { FilterMenu } from '@/features/timeline/FilterMenu';
import { DaySummary } from '@/features/summary/DaySummary';

// "Delete the whole day": every record of that day (06:00 → 06:00), after a confirmation.
function DeleteDaySheet({ dayKey: k, events, onClose }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try {
      await Promise.all(events.map((e) => collection(COLLECTION_OF[e.kind]).remove(e.record.id)));
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open onClose={onClose} title={`מחיקת ${dayLabel(k)}`}>
      <p className="text-[15px]">כל {events.length} הרישומים של היום הזה יימחקו: האכלות, חיתולים, שינה, הערות ועוד. אי אפשר לבטל.</p>
      <Button variant="danger" className="w-full" onClick={remove} disabled={busy}><Trash2 className="h-5 w-5" />{busy ? 'מוחק...' : `מחיקת ${events.length} רישומים`}</Button>
      <Button variant="outline" className="w-full" onClick={onClose}>ביטול</Button>
    </Sheet>
  );
}

// One day of the journal (06:00 → 06:00): header (date, type filter, delete, open/close), the day's totals and,
// when open, its records. A filter on the journal's top applies to every day and replaces this day's own filter.
export function DayCard({ dayKey: k, open, onToggle, data, events, now, nameOf, globalFilter }) {
  const canEdit = useCanEdit();
  const [localFilter, setLocalFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(false);
  // A filter on top applies to every day, so the per-day filter only shows when that one is off.
  const filter = globalFilter !== 'all' ? globalFilter : localFilter;
  const allDayEvents = events.filter((e) => dayKey(e.time) === k);
  const shown = filterEvents(allDayEvents, filter);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-right">
          <bdi className="font-semibold">{dayLabel(k)}</bdi>
          {/* separate chip so the number doesn't run into the date (14/10 + 9 → "14/109") */}
          {filter !== 'all' && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{shown.length} {filterLabel(filter)}</span>}
        </button>
        {globalFilter === 'all' && allDayEvents.length > 0 && (
          <FilterMenu variant="icon" align="left" value={localFilter} events={allDayEvents}
            onChange={(v) => { setLocalFilter(v); if (!open) onToggle(); }} />
        )}
        {canEdit && allDayEvents.length > 0 && (
          <button onClick={() => setConfirmDelete(true)} aria-label={`מחיקת ${dayLabel(k)}`} className="rounded-lg p-1.5 text-mute active:bg-danger/10 active:text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <button onClick={onToggle} aria-label={open ? 'סגירה' : 'פתיחה'} className="p-1">
          <ChevronDown className={cn('h-5 w-5 text-mute transition', open && 'rotate-180')} />
        </button>
      </div>
      <DaySummary summary={summarizeDay(k, data, now)} />
      {open && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          {shown.length
            ? <EventList events={shown} nameOf={nameOf} />
            : <p className="py-4 text-center text-sm text-mute">{filter === 'all' ? 'אין רישומים ביום הזה' : `אין ${filterLabel(filter)} ביום הזה`}</p>}
        </div>
      )}
      {confirmDelete && <DeleteDaySheet dayKey={k} events={allDayEvents} onClose={() => setConfirmDelete(false)} />}
    </Card>
  );
}
