import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-accent text-white shadow-soft active:brightness-95',
  soft: 'bg-accent/10 text-accent active:bg-accent/20',
  ghost: 'text-mute active:bg-line/60',
  outline: 'border border-line text-ink bg-card active:bg-line/40',
  danger: 'bg-danger/10 text-danger active:bg-danger/20',
};

export function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-medium transition disabled:opacity-40',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

