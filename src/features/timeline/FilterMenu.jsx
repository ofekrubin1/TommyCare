import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_FILTERS } from './eventFilters';

// The main choices; "עוד" opens the rest (only types that exist in the shown records).
const MAIN = ['all', 'feeding', 'diaper', 'med'];

// Record-type filter as a dropdown: the button shows the chosen type; the list offers the main categories,
// and "עוד" for the specific ones (breast, pee, sleep, fever...).
export function FilterMenu({ value, onChange, events, small = false }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(!MAIN.includes(value));
  const ref = useRef(null);
  const main = EVENT_FILTERS.filter((f) => MAIN.includes(f.value));
  const extra = EVENT_FILTERS.filter((f) => !MAIN.includes(f.value) && (f.value === value || events.some(f.match)));
  const options = more ? [...main, ...extra] : main;
  const current = EVENT_FILTERS.find((f) => f.value === value) || EVENT_FILTERS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn('flex items-center gap-2 rounded-xl border bg-card font-medium transition',
          value !== 'all' ? 'border-accent text-accent' : 'border-line text-ink',
          small ? 'px-2.5 py-1.5 text-sm' : 'px-3 py-2')}
      >
        <span aria-hidden="true">{current.icon}</span>
        {current.label}
        <ChevronDown className={cn('h-4 w-4 text-mute transition', open && 'rotate-180')} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 top-full z-30 mt-1.5 max-h-[60vh] min-w-[13rem] overflow-y-auto rounded-2xl border border-line bg-card py-1 shadow-lg">
          {options.map((f) => (
            <li key={f.value}>
              <button
                type="button"
                role="option"
                aria-selected={f.value === value}
                onClick={() => { onChange(f.value); setOpen(false); }}
                className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-right', f.value === value ? 'bg-accent/10 font-semibold text-accent' : 'active:bg-line/60')}
              >
                <span className="text-lg" aria-hidden="true">{f.icon}</span>
                <span className="flex-1">{f.label}</span>
                {f.value === value && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
          {!more && extra.length > 0 && (
            <li>
              <button type="button" onClick={() => setMore(true)} className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-right text-mute active:bg-line/60">
                <span className="text-lg" aria-hidden="true">⋯</span>
                <span className="flex-1">עוד</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
