import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useBabyData } from '@/hooks/useBabyData';
import { useNow } from '@/hooks/useNow';
import { daysWithData, summarizeDay } from '@/lib/summary';
import { dayKey, dayLabel, todayKey } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useProfiles } from '@/features/auth/AuthProvider';
import { EventList } from '@/features/timeline/EventRow';
import { toEvents } from '@/features/timeline/events';
import { DaySummary } from '@/features/summary/DaySummary';

// Everything, grouped by day (06:00 → 06:00), with each day's totals on top.
export default function JournalPage() {
  const data = useBabyData();
  const { nameOf } = useProfiles();
  const now = useNow();
  const [open, setOpen] = useState(() => new Set([todayKey()]));
  const [limit, setLimit] = useState(14);
  const days = [...new Set([todayKey(), ...daysWithData(data)])];
  const events = toEvents(data, now);

  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <div className="space-y-3">
      <PageHeader title="יומן" subtitle="כל יום מתחיל ב-06:00" />
      {days.slice(0, limit).map((k) => {
        const isOpen = open.has(k);
        const dayEvents = isOpen ? events.filter((e) => dayKey(e.time) === k) : [];
        return (
          <Card key={k}>
            <button onClick={() => toggle(k)} className="mb-3 flex w-full items-center justify-between">
              <span className="font-semibold">{dayLabel(k)}</span>
              <ChevronDown className={cn('h-5 w-5 text-mute transition', isOpen && 'rotate-180')} />
            </button>
            <DaySummary summary={summarizeDay(k, data, now)} />
            {isOpen && (
              <div className="mt-3 border-t border-line pt-1">
                {dayEvents.length ? <EventList events={dayEvents} nameOf={nameOf} /> : <p className="py-4 text-center text-sm text-mute">אין רישומים</p>}
              </div>
            )}
          </Card>
        );
      })}
      {days.length > limit && <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 14)}>ימים קודמים</Button>}
    </div>
  );
}
