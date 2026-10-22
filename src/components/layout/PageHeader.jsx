import { useCanEdit } from '@/hooks/useCanEdit';
import { ChildPicker } from '@/features/children/ChildPicker';

// `child`: show the current child with a switcher (screens that belong to one child: journal, health).
export function PageHeader({ title, subtitle, action, child = false }) {
  const canEdit = useCanEdit();
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-2">
      <div>
        {subtitle && <p className="text-sm text-mute">{subtitle}</p>}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {/* a long child name wraps the picker to its own row instead of being cut */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {child && <ChildPicker />}
        {canEdit && action}
      </div>
    </header>
  );
}
