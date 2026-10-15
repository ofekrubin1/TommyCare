import { useState } from 'react';
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet } from './Sheet';

const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

// Date button + month calendar where only `enabledDays` (Set of "yyyy-MM-dd") can be picked; other days are greyed out.
export function DayPicker({ value, onChange, enabledDays, placeholder = 'בחירת תאריך' }) {
  const sorted = [...enabledDays].sort();
  const first = sorted[0], last = sorted.at(-1);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(parseISO(value || last || format(new Date(), 'yyyy-MM-dd'))));

  const show = () => { setMonth(startOfMonth(parseISO(value || last || format(new Date(), 'yyyy-MM-dd')))); setOpen(true); };
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
  const canPrev = first && format(subMonths(month, 1), 'yyyy-MM') >= first.slice(0, 7);
  const canNext = last && format(addMonths(month, 1), 'yyyy-MM') <= last.slice(0, 7);

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button type="button" onClick={show} className={cn('flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-bg/60 text-base font-medium', !value && 'text-mute')}>
          <CalendarDays className="h-4 w-4 text-mute" />
          {value ? format(parseISO(value), 'dd/MM/yyyy') : placeholder}
        </button>
        {value && <button type="button" onClick={() => onChange('')} aria-label="ניקוי חיפוש" className="p-2 text-mute"><X className="h-5 w-5" /></button>}
      </div>
      {open && (
        <Sheet open onClose={() => setOpen(false)} title="בחירת יום">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setMonth(subMonths(month, 1))} disabled={!canPrev} aria-label="חודש קודם" className="rounded-lg p-2 disabled:opacity-20">
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="font-semibold">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
            <button type="button" onClick={() => setMonth(addMonths(month, 1))} disabled={!canNext} aria-label="חודש הבא" className="rounded-lg p-2 disabled:opacity-20">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-mute">
            {DAY_NAMES.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 pb-2">
            {days.map((d) => {
              const key = format(d, 'yyyy-MM-dd');
              const inMonth = isSameMonth(d, month);
              const enabled = inMonth && enabledDays.has(key);
              const selected = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!enabled}
                  onClick={() => { onChange(key); setOpen(false); }}
                  className={cn(
                    'relative flex h-11 items-center justify-center rounded-xl text-sm tabular-nums',
                    !inMonth && 'invisible',
                    selected ? 'bg-accent font-bold text-white' : enabled ? 'font-semibold text-ink active:bg-accent/10' : 'text-mute/35',
                  )}
                >
                  {format(d, 'd')}
                  {enabled && !selected && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>
          <p className="pb-2 text-center text-xs text-mute">אפשר לבחור רק ימים שיש בהם רישומים</p>
        </Sheet>
      )}
    </>
  );
}
