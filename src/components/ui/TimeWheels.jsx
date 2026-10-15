import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const ITEM = 44; // px per row
const VISIBLE = 5; // rows shown (selection in the middle)
const pad = (n) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

// One scroll-snapping column (native momentum scrolling on iPhone).
function Wheel({ items, value, onChange, label }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const index = Math.max(0, items.indexOf(value));

  useEffect(() => { if (ref.current) ref.current.scrollTop = index * ITEM; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM)));
      if (items[i] !== value) onChange(items[i]);
    }, 80);
  };

  return (
    <div className="relative w-24" style={{ height: ITEM * VISIBLE }}>
      <div className="pointer-events-none absolute inset-x-1 rounded-xl bg-accent/10" style={{ top: ITEM * 2, height: ITEM }} />
      <div
        ref={ref}
        onScroll={onScroll}
        aria-label={label}
        className="relative h-full overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'y mandatory', WebkitMaskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)' }}
      >
        <div style={{ height: ITEM * 2 }} />
        {items.map((x, i) => (
          <button
            key={x}
            type="button"
            onClick={() => ref.current.scrollTo({ top: i * ITEM, behavior: 'smooth' })}
            className={cn('flex w-full items-center justify-center tabular-nums transition-colors', x === value ? 'text-2xl font-bold text-ink' : 'text-xl text-mute/70')}
            style={{ height: ITEM, scrollSnapAlign: 'center' }}
          >
            {x}
          </button>
        ))}
        <div style={{ height: ITEM * 2 }} />
      </div>
    </div>
  );
}

const nearest5 = (m) => pad(Math.min(55, Math.round(Number(m) / 5) * 5));

// A single time button; tapping opens hour : minute wheels (minutes in 5s). value/onChange use "HH:mm" ('' = no time).
export function TimeButton({ value, onChange, allowEmpty = false, className }) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState('09');
  const [m, setM] = useState('00');

  const show = () => {
    const [vh, vm] = (value || '').split(':');
    const now = new Date();
    setH(vh || pad(now.getHours()));
    setM(vm ? nearest5(vm) : nearest5(now.getMinutes()));
    setOpen(true);
  };
  const done = (v) => { onChange(v); setOpen(false); };

  return (
    <>
      <button
        type="button"
        onClick={show}
        dir="ltr"
        className={cn('h-12 w-full min-w-0 rounded-xl border border-line bg-bg/60 text-center text-lg font-medium tabular-nums text-ink', !value && 'text-mute', className)}
      >
        {value || 'ללא שעה'}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center" dir="rtl">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-card px-5 pt-4 shadow-2xl" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <p className="mb-2 text-center font-semibold">בחירת שעה</p>
            <div className="flex items-center justify-center gap-2" dir="ltr">
              <Wheel items={HOURS} value={h} onChange={setH} label="שעה" />
              <span className="pb-1 text-3xl font-bold text-mute">:</span>
              <Wheel items={MINUTES} value={m} onChange={setM} label="דקות" />
            </div>
            <div className={cn('mt-3 grid gap-2', allowEmpty ? 'grid-cols-2' : 'grid-cols-1')}>
              {allowEmpty && <button type="button" onClick={() => done('')} className="rounded-xl border border-line py-3 font-medium text-mute">ללא שעה</button>}
              <button type="button" onClick={() => done(`${h}:${m}`)} className="rounded-xl bg-accent py-3 font-semibold text-white">אישור</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
