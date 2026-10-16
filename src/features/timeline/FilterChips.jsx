import { cn } from '@/lib/utils';
import { EVENT_FILTERS } from './eventFilters';

// Record-type chips (scroll sideways). Only types that exist in `events` are offered, with their count.
export function FilterChips({ value, onChange, events, small = false }) {
  const options = EVENT_FILTERS
    .map((f) => ({ ...f, count: events.filter(f.match).length }))
    .filter((f) => f.value === 'all' || f.value === value || f.count > 0);
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {options.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={cn(
            'flex-none rounded-full border transition',
            small ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            value === f.value ? 'border-accent bg-accent text-white' : 'border-line bg-card text-mute',
          )}
        >
          {f.label}{f.value !== 'all' && <span className="mr-1 opacity-70">{f.count}</span>}
        </button>
      ))}
    </div>
  );
}
