import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useChildren } from '@/hooks/useSettings';
import { ChildAvatar, ChildSwitcher } from './ChildSwitcher';

// "Whose screen is this": the current child's photo + name; tap to switch. The choice is app-wide, so home,
// journal and health always show the same child.
export function ChildPicker() {
  const { child } = useChildren();
  const [open, setOpen] = useState(false);
  if (!child) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="מעבר בין הילדים"
        className="flex flex-none items-center gap-1.5 rounded-full border border-line bg-card py-1 pl-2 pr-1 shadow-soft">
        <ChildAvatar child={child} className="h-7 w-7 text-base" />
        <span className="whitespace-nowrap text-sm font-semibold">{child.name}</span>
        <ChevronDown className="h-4 w-4 text-mute" />
      </button>
      {open && <ChildSwitcher onClose={() => setOpen(false)} />}
    </>
  );
}
