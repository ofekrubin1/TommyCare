import { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { collection } from '@/data';
import { useBabyData } from '@/hooks/useBabyData';
import { useCanEdit } from '@/hooks/useCanEdit';
import { useNow } from '@/hooks/useNow';
import { daysWithData, summarizeDay } from '@/lib/summary';
import { dayKey, dayLabel, dm, todayKey } from '@/lib/time';
import { MORE_DAYS, RECENT_DAYS } from '@/data/timeWindow';
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

function DayCard({ dayKey: k, open, onToggle, data, events, now, nameOf, globalFilter }) {
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
          {globalFilter === 'all' && <FilterMenu small value={localFilter} onChange={setLocalFilter} events={allDayEvents} />}
          {shown.length
            ? <EventList events={shown} nameOf={nameOf} />
            : <p className="py-4 text-center text-sm text-mute">{filter === 'all' ? 'אין רישומים ביום הזה' : `אין ${filterLabel(filter)} ביום הזה`}</p>}
        </div>
      )}
      {confirmDelete && <DeleteDaySheet dayKey={k} events={allDayEvents} onClose={() => setConfirmDelete(false)} />}
    </Card>
  );
}

// Everything, grouped by day (06:00 → 06:00), newest first. On top: search by date and/or by record type.
// Loads the last 7 days; "תצוגה מורחבת" loads 30 more days at a time ("ימים קודמים" pages through loaded days).
export default function JournalPage() {
  const [windowDays, setWindowDays] = useState(RECENT_DAYS);
  const [loadedBefore, setLoadedBefore] = useState(null); // day count before the last "load older", to know when there's no more
  const data = useBabyData(windowDays);
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
  const dataDays = daysWithData(data).length;
  const noOlder = !data.loading && loadedBefore !== null && dataDays === loadedBefore;
  const loadOlder = () => { setLoadedBefore(dataDays); setWindowDays((d) => d + MORE_DAYS); setLimit((l) => l + 14); };

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
          <div className="min-w-0 flex-1"><FilterMenu value={filter} onChange={setFilter} events={events} /></div>
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
          {!days.length && <p className="py-8 text-center text-sm text-mute">{filter === 'all' ? 'אין רישומים עדיין' : `אין ${filterLabel(filter)} עדיין`}</p>}
          {days.length > limit
            ? <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 14)}>ימים קודמים</Button>
            : !noOlder && (
              <Button variant="outline" className="w-full" onClick={loadOlder} disabled={data.loading}>
                {data.loading ? 'טוען...' : `תצוגה מורחבת · ימים לפני ${dm(dayKey(data.since))}`}
              </Button>
            )}
        </>
      )}
    </div>
  );
}
