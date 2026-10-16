import { cn } from '@/lib/utils';
import { EVENT_FILTERS } from './eventFilters';

// One row of record-type chips (scrolls sideways).
export function FilterChips({ value, onChange, small = false }) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {EVENT_FILTERS.map((f) => (
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
          {f.label}
        </button>
      ))}
    </div>
  );
}
