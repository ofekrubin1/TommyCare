import { differenceInMinutes, parseISO } from 'date-fns';
import { Droplets, Milk, Moon, Sun, TriangleAlert } from 'lucide-react';
import { C, collection } from '@/data';
import { durationText, hm, sinceText } from '@/lib/time';
import { byTimeDesc, cn } from '@/lib/utils';
import { FEEDING_TYPES } from '@/features/feeding/feedingTypes';
import { diaperTitle } from '@/features/diapers/diaperOptions';
import { useCanEdit } from '@/hooks/useCanEdit';

function Tile({ icon: Icon, tone, title, value, sub, alert, children }) {
  return (
    <div className={cn('rounded-2xl border p-3', alert ? 'border-danger/40 bg-danger/5' : 'border-line bg-card')}>
      <div className={cn('mb-1 flex items-center gap-1.5 text-xs font-medium', tone)}>
        {alert ? <TriangleAlert className="h-3.5 w-3.5 text-danger" /> : <Icon className="h-3.5 w-3.5" />}{title}
      </div>
      <div className={cn('text-[15px] font-semibold leading-tight', alert && 'text-danger')}>{value}</div>
      {sub && <div className="text-xs text-mute">{sub}</div>}
      {children}
    </div>
  );
}

// "When was the last...?" — the most common question at 3am.
export function LastStatus({ data, now, alertHours }) {
  const canEdit = useCanEdit();
  const lastFeed = [...data.feedings].sort(byTimeDesc())[0];
  const lastDiaper = [...data.diapers].sort(byTimeDesc())[0];
  const sleeps = [...data.sleeps].sort(byTimeDesc('start'));
  const sleepingNow = sleeps.find((s) => !s.end);
  const lastSleep = sleeps.find((s) => s.end);
  const feedOverdue = lastFeed && differenceInMinutes(now, parseISO(lastFeed.time)) >= alertHours * 60;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Tile icon={Milk} tone="text-feed" title="האכלה" alert={feedOverdue}
        value={lastFeed ? sinceText(lastFeed.time, now) : '—'}
        sub={lastFeed ? `${hm(lastFeed.time)} · ${FEEDING_TYPES[lastFeed.type]?.short || ''}` : 'עוד לא נרשמה'} />
      <Tile icon={Droplets} tone="text-diaper" title="חיתול"
        value={lastDiaper ? sinceText(lastDiaper.time, now) : '—'}
        sub={lastDiaper ? `${hm(lastDiaper.time)} · ${diaperTitle(lastDiaper)}` : 'עוד לא נרשם'} />
      {sleepingNow ? (
        <Tile icon={Moon} tone="text-sleep" title="ישנה" value={durationText(differenceInMinutes(now, parseISO(sleepingNow.start)))} sub={`מ-${hm(sleepingNow.start)}`}>
          {canEdit && <button onClick={() => collection(C.sleeps).update(sleepingNow.id, { end: new Date().toISOString() })}
            className="mt-1.5 w-full rounded-lg bg-sleep/15 py-1 text-xs font-semibold text-sleep">התעוררה</button>}
        </Tile>
      ) : (
        <Tile icon={Sun} tone="text-sleep" title="ערה"
          value={lastSleep ? sinceText(lastSleep.end, now).replace('לפני ', '') : '—'}
          sub={lastSleep ? `התעוררה ב-${hm(lastSleep.end)}` : 'אין שינה רשומה'} />
      )}
    </div>
  );
}
