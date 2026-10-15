import { cn } from '@/lib/utils';

// Horizontal tab chips at the top of a page (scrolls sideways if they don't fit).
export function TabChips({ tabs, value, onChange, tone = 'bg-health' }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn('flex-none rounded-full px-4 py-2 text-sm font-medium transition', t.value === value ? `${tone} text-white` : 'border border-line bg-card text-mute')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
