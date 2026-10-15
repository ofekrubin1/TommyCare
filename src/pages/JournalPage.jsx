import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useBabyData } from '@/hooks/useBabyData';
import { useNow } from '@/hooks/useNow';
import { daysWithData, summarizeDay } from '@/lib/summary';
import { dayKey, dayLabel, todayKey } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DayPicker } from '@/components/ui/DayPicker';
import { PageHeader } from '@/components/layout/PageHeader';
import { useProfiles } from '@/features/auth/AuthProvider';
import { EventList } from '@/features/timeline/EventRow';
import { toEvents } from '@/features/timeline/events';
import { DaySummary } from '@/features/summary/DaySummary';

function DayCard({ dayKey: k, open, onToggle, data, events, now, nameOf }) {
  const dayEvents = open ? events.filter((e) => dayKey(e.time) === k) : [];
  return (
    <Card>
      <button onClick={onToggle} className="mb-3 flex w-full items-center justify-between">
        <span className="font-semibold">{dayLabel(k)}</span>
        <ChevronDown className={cn('h-5 w-5 text-mute transition', open && 'rotate-180')} />
      </button>
      <DaySummary summary={summarizeDay(k, data, now)} />
      {open && (
        <div className="mt-3 border-t border-line pt-1">
          {dayEvents.length ? <EventList events={dayEvents} nameOf={nameOf} /> : <p className="py-4 text-center text-sm text-mute">אין רישומים ביום הזה</p>}
        </div>
      )}
    </Card>
  );
}

// Everything, grouped by day (06:00 → 06:00), newest first, with a date search on top.
export default function JournalPage() {
  const data = useBabyData();
  const { nameOf } = useProfiles();
  const now = useNow();
  const [open, setOpen] = useState(() => new Set([todayKey()]));
  const [limit, setLimit] = useState(14);
  const [search, setSearch] = useState('');
  const days = [...new Set([todayKey(), ...daysWithData(data)])].sort().reverse();
  const events = toEvents(data, now);
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const cardProps = { data, events, now, nameOf };

  return (
    <div className="space-y-3">
      <PageHeader title="יומן" subtitle="כל יום מתחיל ב-06:00" />
      <Card className="flex items-center gap-2 p-3">
        <span className="flex-none text-sm font-medium text-mute">חיפוש תאריך</span>
        <DayPicker value={search} onChange={setSearch} enabledDays={new Set(daysWithData(data))} />
      </Card>

      {search ? (
        <DayCard dayKey={search} open onToggle={() => setSearch('')} {...cardProps} />
      ) : (
        <>
          {days.slice(0, limit).map((k) => <DayCard key={k} dayKey={k} open={open.has(k)} onToggle={() => toggle(k)} {...cardProps} />)}
          {days.length > limit && <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 14)}>ימים קודמים</Button>}
        </>
      )}
    </div>
  );
}
