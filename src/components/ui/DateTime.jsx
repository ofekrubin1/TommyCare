import { Field, Input } from './Field';
import { TimeButton } from './TimeWheels';

// Half date, half time button (hour : minute wheels, 5-minute steps).
// value/onChange use "yyyy-MM-ddTHH:mm" (same as toLocalInput / fromLocalInput).
export function DateTimeField({ label, value, onChange, min, className }) {
  const [date, time] = (value || 'T').split('T');
  return (
    <Field as="div" label={label} className={className}>
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" className="h-12 text-center text-lg font-medium" value={date} min={min?.split('T')[0]} onChange={(e) => e.target.value && onChange(`${e.target.value}T${time}`)} />
        <TimeButton value={time} onChange={(t) => onChange(`${date}T${t}`)} />
      </div>
    </Field>
  );
}
