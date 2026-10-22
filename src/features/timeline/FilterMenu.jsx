import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_FILTERS } from './eventFilters';

// The main choices; "עוד" opens the rest (only types that exist in the shown records).
const MAIN = ['all', 'feeding', 'diaper', 'med'];

// Record-type filter as a dropdown: the main categories, and "עוד" for the specific ones (breast, pee, sleep...).
// variant "button": a full-width button showing the chosen type (top of the journal).
// variant "icon": a funnel next to a day's date; highlighted while a type is chosen. `align`: which edge the list
// opens from ("left" for a funnel on the left side).
export function FilterMenu({ value, onChange, events, variant = 'button', align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(!MAIN.includes(value));
  const ref = useRef(null);
  const main = EVENT_FILTERS.filter((f) => MAIN.includes(f.value));
  const extra = EVENT_FILTERS.filter((f) => !MAIN.includes(f.value) && (f.value === value || events.some(f.match)));
  const options = more ? [...main, ...extra] : main;
  const current = EVENT_FILTERS.find((f) => f.value === value) || EVENT_FILTERS[0];
  const active = value !== 'all';

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const trigger = variant === 'icon' ? (
    <button
      type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
      aria-label={active ? `סינון: ${current.label}` : 'סינון לפי סוג'}
      className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition', active ? 'bg-accent/15 text-accent' : 'bg-line/60 text-mute')}
    >
      <Filter className="h-[18px] w-[18px]" />
    </button>
  ) : (
    // The whole label shows (wrapping if needed); with a type chosen, a × takes the arrow's place and clears it.
    <div className={cn('flex min-h-11 w-full items-center rounded-xl border bg-bg/60 font-medium transition', active ? 'border-accent text-accent' : 'border-line text-ink')}>
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-3 text-right"
      >
        <span aria-hidden="true">{current.icon}</span>
        <span className="flex-1 leading-tight">{current.label}</span>
        {!active && <ChevronDown className={cn('ml-3 h-4 w-4 flex-none text-mute transition', open && 'rotate-180')} />}
      </button>
      {active && (
        <button type="button" onClick={() => onChange('all')} aria-label="ניקוי הסינון" className="flex-none py-2 pl-2.5 pr-1 text-mute">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  // Next to a day's funnel: a small × that clears that day's filter.
  const clear = variant === 'icon' && active && (
    <button type="button" onClick={() => onChange('all')} aria-label="ניקוי הסינון" className="flex-none p-1 text-mute">
      <X className="h-4 w-4" />
    </button>
  );

  return (
    <div ref={ref} className={cn('relative flex items-center', variant === 'button' ? 'w-full' : 'flex-none')}>
      {trigger}
      {clear}
      {open && (
        <ul role="listbox" className={cn('absolute top-full z-30 mt-1.5 max-h-[60vh] min-w-[13rem] overflow-y-auto rounded-2xl border border-line bg-card py-1 shadow-lg', align === 'left' ? 'left-0' : 'right-0')}>
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
