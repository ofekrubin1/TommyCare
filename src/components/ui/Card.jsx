import { cn } from '@/lib/utils';
import { useCanEdit } from '@/hooks/useCanEdit';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-card rounded-xl2 shadow-soft border border-line/60 p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action, className }) {
  const canEdit = useCanEdit(); // section actions are add / archive buttons
  return (
    <div className={cn('flex items-center justify-between mb-2', className)}>
      <h2 className="text-sm font-semibold text-mute">{children}</h2>
      {canEdit && action}
    </div>
  );
}

export function EmptyState({ icon: Icon, text, children }) {
  return (
    <div className="flex flex-col items-center text-center py-8 text-mute">
      {Icon && <Icon className="w-8 h-8 mb-2 opacity-50" strokeWidth={1.5} />}
      <p className="text-sm">{text}</p>
      {children}
    </div>
  );
}
