import { useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPEN = 132; // px revealed: room for two buttons
const SNAP = 50;

// Swipe the row sideways to reveal Edit / Delete (both directions work, for right- and left-handed use).
// Delete asks for a second tap. Tapping the row itself still runs onClick.
export function SwipeRow({ children, onEdit, onDelete, onClick, className }) {
  const [x, setX] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const drag = useRef(null); // { startX, startY, base, horizontal }

  const settle = (dx) => setX(Math.abs(dx) > SNAP ? Math.sign(dx) * OPEN : 0);

  const onPointerDown = (e) => { drag.current = { startX: e.clientX, startY: e.clientY, base: x, horizontal: null }; };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (d.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) d.horizontal = Math.abs(dx) > Math.abs(dy);
    if (d.horizontal) setX(Math.max(-OPEN, Math.min(OPEN, d.base + dx)));
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.horizontal) { settle(d.base + (e.clientX - d.startX)); return; }
    if (d.horizontal === null) { if (x) setX(0); else onClick?.(); } // a tap
  };
  const close = () => { setX(0); setConfirm(false); };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* buttons sit on the side the row moved away from */}
      {x !== 0 && (
        <div className={cn('absolute inset-y-0 flex items-stretch', x > 0 ? 'left-0' : 'right-0')} style={{ width: OPEN }}>
          {onEdit && (
            <button onClick={() => { close(); onEdit(); }} className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-sleep/15 text-xs font-medium text-sleep">
              <Pencil className="h-4 w-4" />עריכה
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => (confirm ? (close(), onDelete()) : setConfirm(true))}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-danger/15 text-xs font-medium text-danger"
            >
              <Trash2 className="h-4 w-4" />{confirm ? 'בטוח?' : 'מחיקה'}
            </button>
          )}
        </div>
      )}
      <div
        className={cn('relative touch-pan-y bg-card', drag.current ? '' : 'transition-transform duration-200')}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current = null; settle(x); }}
      >
        {children}
      </div>
    </div>
  );
}
