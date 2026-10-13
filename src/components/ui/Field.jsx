import { cn } from '@/lib/utils';

const control = 'w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-ink placeholder:text-mute/60 focus:outline-none focus:border-accent/60';

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      {label && <span className="text-sm font-medium text-mute">{label}</span>}
      {children}
      {hint && <span className="block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export const Input = ({ className, ...props }) => <input className={cn(control, className)} {...props} />;

export const Textarea = ({ className, ...props }) => <textarea rows={2} className={cn(control, 'resize-none', className)} {...props} />;

export const Select = ({ className, children, ...props }) => (
  <select className={cn(control, 'appearance-none', className)} {...props}>{children}</select>
);
