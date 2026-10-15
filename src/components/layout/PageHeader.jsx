import { useCanEdit } from '@/hooks/useCanEdit';

export function PageHeader({ title, subtitle, action }) {
  const canEdit = useCanEdit();
  return (
    <header className="flex items-end justify-between gap-3 pt-2">
      <div>
        {subtitle && <p className="text-sm text-mute">{subtitle}</p>}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {canEdit && action}
    </header>
  );
}
