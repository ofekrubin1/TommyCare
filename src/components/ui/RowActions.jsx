import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useCanEdit } from '@/hooks/useCanEdit';

// Edit + delete (with a second tap to confirm) for list rows.
export function RowActions({ onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const canEdit = useCanEdit();
  if (!canEdit) return null;
  return (
    <div className="flex items-center gap-1 flex-none">
      {onEdit && (
        <button onClick={onEdit} aria-label="עריכה" className="p-2 rounded-lg text-mute active:bg-line/60">
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {onDelete && (confirming ? (
        <button onClick={() => { setConfirming(false); onDelete(); }} onBlur={() => setConfirming(false)} autoFocus className="px-2 py-1 rounded-lg bg-danger/10 text-danger text-xs font-medium">
          למחוק?
        </button>
      ) : (
        <button onClick={() => setConfirming(true)} aria-label="מחיקה" className="p-2 rounded-lg text-mute active:bg-line/60">
          <Trash2 className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
