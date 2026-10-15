import { cn } from '@/lib/utils';

// min-w-0 + appearance-none: iOS date/time inputs otherwise keep a wide intrinsic size and overflow their column.
const control = 'w-full min-w-0 appearance-none rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-ink placeholder:text-mute/60 focus:outline-none focus:border-accent/60';

// `as="div"` when the field holds more than one control (a <label> would focus only the first).
export function Field({ label, hint, children, className, as: Tag = 'label' }) {
  return (
    <Tag className={cn('block min-w-0 space-y-1.5', className)}>
      {label && <span className="block text-sm font-medium text-mute">{label}</span>}
      {children}
      {hint && <span className="block text-xs text-mute">{hint}</span>}
    </Tag>
  );
}

export const Input = ({ className, ...props }) => <input className={cn(control, className)} {...props} />;

export const Textarea = ({ className, ...props }) => <textarea rows={2} className={cn(control, 'resize-none', className)} {...props} />;

export const Select = ({ className, children, ...props }) => (
  <select className={cn(control, className)} {...props}>{children}</select>
);

export const Optional = () => <span className="font-normal text-mute/70"> (אופציונלי)</span>;
