import { useCanEdit } from '@/core/auth/useRole';

// `aside`: shown to everyone next to the title (e.g. the child switcher); `action`: only for users who can edit.
export function PageHeader({ title, subtitle, action, aside }) {
  const canEdit = useCanEdit();
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-2">
      <div>
        {subtitle && <p className="text-sm text-mute">{subtitle}</p>}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {/* something long here (a child's name) wraps to its own row instead of being cut */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {aside}
        {canEdit && action}
      </div>
    </header>
  );
}
