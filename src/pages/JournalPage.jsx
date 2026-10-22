import { useState } from 'react';
import { useBabyData } from '@/features/timeline/useBabyData';
import { useNow } from '@/hooks/useNow';
import { daysWithData } from '@/features/summary/summarizeDay';
import { dayKey, dm, todayKey } from '@/lib/time';
import { MORE_DAYS, RECENT_DAYS } from '@/data/timeWindow';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DayPicker } from '@/components/ui/DayPicker';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChildPicker } from '@/features/children/ChildPicker';
import { useProfiles } from '@/core/auth/AuthProvider';
import { toEvents } from '@/features/timeline/events';
import { filterEvents, filterLabel } from '@/features/timeline/eventFilters';
import { FilterMenu } from '@/features/timeline/FilterMenu';
import { DayCard } from '@/features/journal/DayCard';

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
  // With a type filter every matching day starts open (the results show right away), and can still be closed.
  const [closedWhileFiltered, setClosedWhileFiltered] = useState(() => new Set());
  const isOpen = (k) => (filter !== 'all' ? !closedWhileFiltered.has(k) : open.has(k));
  const flip = (s, k) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; };
  const toggle = (k) => (filter !== 'all' ? setClosedWhileFiltered((s) => flip(s, k)) : setOpen((s) => flip(s, k)));
  const chooseFilter = (v) => { setFilter(v); setClosedWhileFiltered(new Set()); };
  const cardProps = { data, events, now, nameOf, globalFilter: filter };
  const dataDays = daysWithData(data).length;
  const noOlder = !data.loading && loadedBefore !== null && dataDays === loadedBefore;
  const loadOlder = () => { setLoadedBefore(dataDays); setWindowDays((d) => d + MORE_DAYS); setLimit((l) => l + 14); };

  return (
    <div className="space-y-3">
      <PageHeader title="יומן" subtitle="כל יום מתחיל ב-06:00" aside={<ChildPicker />} />
      <Card className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0 space-y-1.5">
            <span className="block text-sm font-medium text-mute">תאריך</span>
            <DayPicker value={search} onChange={setSearch} enabledDays={new Set(daysWithData(data))} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <span className="block text-sm font-medium text-mute">סוג רשומה</span>
            <FilterMenu value={filter} onChange={chooseFilter} events={events} />
          </div>
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
            : noOlder ? (
              days.length > 0 && <p className="py-3 text-center text-sm text-mute">אין רשומות ישנות יותר מ-{dm(days.at(-1))}</p>
            ) : (
              <Button variant="outline" className="w-full" onClick={loadOlder} disabled={data.loading}>
                {/* the oldest day on screen, not the start of the loaded window */}
                {data.loading ? 'טוען...' : `תצוגה מורחבת · ימים לפני ${dm(days.at(-1) || dayKey(data.since))}`}
              </Button>
            )}
        </>
      )}
    </div>
  );
}
