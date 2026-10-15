import { cn } from '@/lib/utils';
import { Field, Input } from './Field';

const pad = (n) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, h) => pad(h));

const wheel = 'h-12 w-[4.25rem] appearance-none rounded-xl border border-line bg-bg/60 text-center text-xl font-semibold tabular-nums text-ink focus:outline-none focus:border-accent/60';

// Hour + minute pickers (native wheels on iPhone, much bigger than the built-in time field).
// value/onChange use "HH:mm". `step` = minute increments (5 for appointments).
export function TimePicker({ value, onChange, step = 1, allowEmpty = false }) {
  const [h, m] = value ? value.split(':') : ['', ''];
  const minutes = Array.from({ length: 60 / step }, (_, i) => pad(i * step));
  if (m && !minutes.includes(m)) minutes.push(m); // keep an existing off-step value visible
  minutes.sort();
  const set = (nh, nm) => onChange(nh === '' && nm === '' ? '' : `${nh || '00'}:${nm || '00'}`);
  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      <select aria-label="שעה" className={wheel} value={h} onChange={(e) => set(e.target.value, m)}>
        {allowEmpty && <option value="">--</option>}
        {HOURS.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <span className="text-xl font-semibold text-mute">:</span>
      <select aria-label="דקות" className={wheel} value={m} onChange={(e) => set(h, e.target.value)}>
        {allowEmpty && <option value="">--</option>}
        {minutes.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}

// Date + time for logs. value/onChange use "yyyy-MM-ddTHH:mm" (same as toLocalInput / fromLocalInput).
export function DateTimeField({ label, value, onChange, min, step = 1, className }) {
  const [date, time] = (value || 'T').split('T');
  return (
    <Field as="div" label={label} className={className}>
      <div className="flex items-center gap-2">
        <Input type="date" className={cn('h-12 flex-1 text-base')} value={date} min={min?.split('T')[0]} onChange={(e) => e.target.value && onChange(`${e.target.value}T${time}`)} />
        <TimePicker value={time} step={step} onChange={(t) => onChange(`${date}T${t}`)} />
      </div>
    </Field>
  );
}
