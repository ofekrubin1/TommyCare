import { differenceInMinutes, parseISO } from 'date-fns';
import { TriangleAlert } from 'lucide-react';
import { hm } from '@/lib/time';

// Shown inside a form when the same kind of entry was logged within 20 minutes of the chosen time.
export function DuplicateWarning({ found, label, field = 'time', onConfirm, onCancel }) {
  if (!found) return null;
  const at = found[field];
  const minutes = Math.abs(differenceInMinutes(new Date(), parseISO(at)));
  return (
    <div className="space-y-2 rounded-2xl border border-diaper/40 bg-diaper/10 p-3">
      <p className="flex items-start gap-2 text-sm">
        <TriangleAlert className="mt-0.5 h-4 w-4 flex-none text-diaper" />
        <span>כבר נרשמה {label} ב-{hm(at)}{minutes < 120 ? ` (לפני ${minutes} דק׳)` : ''}. להוסיף בכל זאת?</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-line bg-card py-2.5 text-sm font-medium">ביטול</button>
        <button type="button" onClick={onConfirm} className="rounded-xl bg-diaper py-2.5 text-sm font-semibold text-white">להוסיף בכל זאת</button>
      </div>
    </div>
  );
}
