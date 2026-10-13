import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Bottom sheet for quick-add / edit forms. Thumb-friendly on phones.
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-label={title}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card rounded-t-3xl shadow-2xl animate-[sheet_.18s_ease-out]"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="sticky top-0 bg-card z-10 px-5 pt-3 pb-2">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} aria-label="סגור" className="p-2 -m-2 text-mute"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="px-5 pt-2 space-y-4">{children}</div>
      </div>
      <style>{'@keyframes sheet{from{transform:translateY(40px);opacity:.6}to{transform:none;opacity:1}}'}</style>
    </div>,
    document.body
  );
}
