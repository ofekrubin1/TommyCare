import { cn } from '@/lib/utils';
import { Field, Input } from './Field';

const pad = (n) => String(n).padStart(2, '0');
// Every 5 minutes, 00:00 → 23:55.
const TIMES = Array.from({ length: 24 * 12 }, (_, i) => `${pad(Math.floor(i / 12))}:${pad((i % 12) * 5)}`);

const half = 'h-12 w-full text-center text-lg font-medium tabular-nums';

// One time button (native wheel on iPhone) in 5-minute steps. value/onChange use "HH:mm".
// An existing off-grid time (e.g. 19:57 from older data) stays selectable.
export function TimeSelect({ value, onChange, allowEmpty = false, className }) {
  const options = value && !TIMES.includes(value) ? [...TIMES, value].sort() : TIMES;
  return (
    <select
      aria-label="שעה"
      dir="ltr"
      className={cn('w-full min-w-0 appearance-none rounded-xl border border-line bg-bg/60 text-ink focus:outline-none focus:border-accent/60', half, className)}
      style={{ textAlignLast: 'center' }}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {allowEmpty && <option value="">ללא שעה</option>}
      {options.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

// Half date, half time. value/onChange use "yyyy-MM-ddTHH:mm" (same as toLocalInput / fromLocalInput).
export function DateTimeField({ label, value, onChange, min, className }) {
  const [date, time] = (value || 'T').split('T');
  return (
    <Field as="div" label={label} className={className}>
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" className={half} value={date} min={min?.split('T')[0]} onChange={(e) => e.target.value && onChange(`${e.target.value}T${time}`)} />
        <TimeSelect value={time} onChange={(t) => onChange(`${date}T${t}`)} />
      </div>
    </Field>
  );
}
