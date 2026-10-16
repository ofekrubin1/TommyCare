import { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { collection } from '@/data';
import { useBabyData } from '@/hooks/useBabyData';
import { useCanEdit } from '@/hooks/useCanEdit';
import { useNow } from '@/hooks/useNow';
import { daysWithData, summarizeDay } from '@/lib/summary';
import { dayKey, dayLabel, todayKey } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DayPicker } from '@/components/ui/DayPicker';
import { Sheet } from '@/components/ui/Sheet';
import { PageHeader } from '@/components/layout/PageHeader';
import { useProfiles } from '@/features/auth/AuthProvider';
import { COLLECTION_OF, EventList } from '@/features/timeline/EventRow';
import { toEvents } from '@/features/timeline/events';
import { filterEvents, filterLabel } from '@/features/timeline/eventFilters';
import { FilterChips } from '@/features/timeline/FilterChips';
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

function DayCard({ dayKey: k, open, onToggle, data, events, now, nameOf, globalFilter }) {
  const canEdit = useCanEdit();
  const [localFilter, setLocalFilter] = useState(null); // null = follow the filter on top
  const [confirmDelete, setConfirmDelete] = useState(false);
  const filter = localFilter ?? globalFilter;
  const allDayEvents = events.filter((e) => dayKey(e.time) === k);
  const shown = filterEvents(allDayEvents, filter);

  return (
    <Card>
      <button onClick={onToggle} className="mb-3 flex w-full items-center justify-between">
        <span className="flex items-center gap-2">
          <bdi className="font-semibold">{dayLabel(k)}</bdi>
          {/* separate chip so the number doesn't run into the date (14/10 + 9 → "14/109") */}
          {filter !== 'all' && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{shown.length} {filterLabel(filter)}</span>}
        </span>
        <ChevronDown className={cn('h-5 w-5 text-mute transition', open && 'rotate-180')} />
      </button>
      <DaySummary summary={summarizeDay(k, data, now)} />
      {open && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <FilterChips small value={filter} onChange={setLocalFilter} />
          {shown.length
            ? <EventList events={shown} nameOf={nameOf} />
            : <p className="py-4 text-center text-sm text-mute">{filter === 'all' ? 'אין רישומים ביום הזה' : `אין ${filterLabel(filter)} ביום הזה`}</p>}
          {canEdit && allDayEvents.length > 0 && (
            <button onClick={() => setConfirmDelete(true)} className="flex w-full items-center justify-center gap-1.5 pt-2 text-sm text-danger">
              <Trash2 className="h-4 w-4" />מחיקת כל היום
            </button>
          )}
        </div>
      )}
      {confirmDelete && <DeleteDaySheet dayKey={k} events={allDayEvents} onClose={() => setConfirmDelete(false)} />}
    </Card>
  );
}

// Everything, grouped by day (06:00 → 06:00), newest first. On top: search by date and/or by record type.
export default function JournalPage() {
  const data = useBabyData();
  const { nameOf } = useProfiles();
  const now = useNow();
  const [open, setOpen] = useState(() => new Set([todayKey()]));
  const [limit, setLimit] = useState(14);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const events = toEvents(data, now);
  const matching = filterEvents(events, filter);
  // With a type filter, only days that have such records (opened, so the results show right away).
  const days = filter === 'all'
    ? [...new Set([todayKey(), ...daysWithData(data)])].sort().reverse()
    : [...new Set(matching.map((e) => dayKey(e.time)))].sort().reverse();
  const isOpen = (k) => filter !== 'all' || open.has(k);
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const cardProps = { data, events, now, nameOf, globalFilter: filter };

  return (
    <div className="space-y-3">
      <PageHeader title="יומן" subtitle="כל יום מתחיל ב-06:00" />
      <Card className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span className="w-20 flex-none text-sm font-medium text-mute">תאריך</span>
          <DayPicker value={search} onChange={setSearch} enabledDays={new Set(daysWithData(data))} />
        </div>
        <div className="flex items-start gap-2">
          <span className="w-20 flex-none pt-1.5 text-sm font-medium text-mute">סוג רשומה</span>
          <div className="min-w-0 flex-1"><FilterChips value={filter} onChange={setFilter} /></div>
        </div>
        {filter !== 'all' && !search && (
          <p className="text-xs text-mute">{matching.length} {filterLabel(filter)} ב-{days.length} ימים</p>
        )}
      </Card>

      {search ? (
        <DayCard key={`${search}-${filter}`} dayKey={search} open onToggle={() => setSearch('')} {...cardProps} />
      ) : (
        <>
          {days.slice(0, limit).map((k) => <DayCard key={`${k}-${filter}`} dayKey={k} open={isOpen(k)} onToggle={() => toggle(k)} {...cardProps} />)}
          {!days.length && <p className="py-8 text-center text-sm text-mute">אין {filterLabel(filter)} עדיין</p>}
          {days.length > limit && <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 14)}>ימים קודמים</Button>}
        </>
      )}
    </div>
  );
}
