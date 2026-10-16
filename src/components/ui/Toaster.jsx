import { useEffect, useState } from 'react';
import { TriangleAlert, X } from 'lucide-react';
import { onError } from '@/lib/errors';

// Error messages from anywhere in the app (lib/errors.js), shown above the bottom bar for a few seconds.
export function Toaster() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => onError((t) => {
    setToasts((list) => (list.some((x) => x.message === t.message) ? list : [...list, t]));
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 6000);
  }), []);
  if (!toasts.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-lg flex-col gap-2 px-4" role="alert">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-start gap-2 rounded-2xl bg-ink px-4 py-3 text-sm text-bg shadow-lg">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-none text-diaper" />
          <span className="flex-1">{t.message}</span>
          <button type="button" aria-label="סגירה" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}
