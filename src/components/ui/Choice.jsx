import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Segmented single choice (e.g. feeding type).
export function Segmented({ options, value, onChange }) {
  return (
    <div className="grid gap-1 rounded-xl bg-bg p-1 border border-line" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('rounded-lg py-2 text-sm font-medium transition', value === o.value ? 'bg-card shadow-soft text-ink' : 'text-mute')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Big checkbox tile (e.g. pee / poop).
export function CheckTile({ checked, onChange, label, emoji }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 py-4 transition',
        checked ? 'border-accent bg-accent/10' : 'border-line bg-bg/60'
      )}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-medium">{label}</span>
      {checked && <Check className="absolute top-2 left-2 w-4 h-4 text-accent" strokeWidth={3} />}
    </button>
  );
}

// Small toggle chip (e.g. poop color).
export function Chip({ selected, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('rounded-full border px-3 py-1.5 text-sm transition', selected ? 'border-accent bg-accent/10 text-accent' : 'border-line text-mute', className)}
    >
      {children}
    </button>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between py-1">
      <span className="text-[15px]">{label}</span>
      <span dir="ltr" className={cn('flex h-6 w-11 items-center rounded-full p-0.5 transition', checked ? 'bg-accent' : 'bg-line')}>
        <span className={cn('h-5 w-5 rounded-full bg-white shadow transition', checked && 'translate-x-5')} />
      </span>
    </button>
  );
}
