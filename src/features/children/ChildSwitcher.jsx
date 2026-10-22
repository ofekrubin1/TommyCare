import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { setCurrentChild } from '@/data';
import { useChildren } from '@/core/children/useChildren';
import { useCanEdit } from '@/core/auth/useRole';
import { ageText } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import ChildSheet from './ChildSheet';

export function ChildAvatar({ child, className = 'h-11 w-11 text-2xl' }) {
  return child?.photo
    ? <img src={child.photo} alt="" className={cn('flex-none rounded-full object-cover', className)} />
    : <span className={cn('flex flex-none items-center justify-center rounded-full bg-accent/10', className)}>🐣</span>;
}

// "Whose log is this?": every child, tap to switch (the whole app follows). Editors can add a child.
export function ChildSwitcher({ onClose }) {
  const { children, child: current } = useChildren();
  const canEdit = useCanEdit();
  const [adding, setAdding] = useState(false);
  if (adding) return <ChildSheet nextOrder={children.length + 1} onClose={onClose} />;
  return (
    <Sheet open onClose={onClose} title="מעבר בין הילדים">
      <div className="divide-y divide-line">
        {children.map((c) => (
          <button key={c.id} type="button" onClick={() => { setCurrentChild(c.id); onClose(); }} className="flex w-full items-center gap-3 py-3 text-right">
            <ChildAvatar child={c} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{c.name}</span>
              {c.birth_date && <span className="block text-sm text-mute">{ageText(c.birth_date, new Date(), c.gender)}</span>}
            </span>
            {c.id === current?.id && <Check className="h-5 w-5 text-accent" />}
          </button>
        ))}
      </div>
      {canEdit && <Button variant="outline" className="w-full" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />הוספת ילד/ה</Button>}
    </Sheet>
  );
}
