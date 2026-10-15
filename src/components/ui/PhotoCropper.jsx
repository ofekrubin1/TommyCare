import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut } from 'lucide-react';

const VIEW = 280; // px, the circle on screen
const OUT = 320; // px, saved image size
const MAX_ZOOM = 4;

// Drag to move, pinch (or the slider) to zoom, inside a circle. Saves a small square JPEG data URL.
export function PhotoCropper({ file, onCancel, onSave }) {
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const gesture = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const base = img ? VIEW / Math.min(img.width, img.height) : 1; // zoom 1 = image just covers the circle
  const scale = base * zoom;

  // Keep the image covering the whole circle.
  const clamp = (p, s = scale) => img ? ({
    x: Math.min(0, Math.max(VIEW - img.width * s, p.x)),
    y: Math.min(0, Math.max(VIEW - img.height * s, p.y)),
  }) : p;

  useEffect(() => { if (img) setPos(clamp({ x: (VIEW - img.width * base) / 2, y: (VIEW - img.height * base) / 2 }, base)); }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zoom around a point of the circle (its center by default), keeping that point fixed.
  const zoomTo = (z, cx = VIEW / 2, cy = VIEW / 2) => {
    const nz = Math.min(MAX_ZOOM, Math.max(1, z));
    const ns = base * nz;
    setPos((p) => clamp({ x: cx - ((cx - p.x) / scale) * ns, y: cy - ((cy - p.y) / scale) * ns }, ns));
    setZoom(nz);
  };

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = null;
  };
  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      setPos((p) => clamp({ x: p.x + e.clientX - prev.x, y: p.y + e.clientY - prev.y }));
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = (pts[0].x + pts[1].x) / 2 - rect.left, cy = (pts[0].y + pts[1].y) / 2 - rect.top;
      if (gesture.current) zoomTo(gesture.current.zoom * (dist / gesture.current.dist), cx, cy);
      else gesture.current = { dist, zoom };
    }
  };
  const onUp = (e) => { pointers.current.delete(e.pointerId); gesture.current = null; };

  const save = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = OUT;
    const side = VIEW / scale;
    canvas.getContext('2d').drawImage(img, -pos.x / scale, -pos.y / scale, side, side, 0, 0, OUT, OUT);
    onSave(canvas.toDataURL('image/jpeg', 0.85));
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 px-5 text-white" dir="rtl">
      <p className="mb-4 text-center text-sm text-white/80">הזיזו את התמונה באצבע, וצבטו כדי להגדיל</p>
      <div
        className="relative overflow-hidden rounded-full bg-black ring-2 ring-white/70"
        style={{ width: VIEW, height: VIEW, touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {img && (
          <img
            src={img.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
            style={{ width: img.width * scale, height: img.height * scale, transform: `translate(${pos.x}px, ${pos.y}px)` }}
          />
        )}
      </div>
      <div className="mt-5 flex w-full max-w-xs items-center gap-3" dir="ltr">
        <ZoomOut className="h-5 w-5 flex-none text-white/70" />
        <input type="range" min="1" max={MAX_ZOOM} step="0.01" value={zoom} onChange={(e) => zoomTo(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" aria-label="זום" />
        <ZoomIn className="h-5 w-5 flex-none text-white/70" />
      </div>
      <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-white/30 py-3 font-medium">ביטול</button>
        <button type="button" onClick={save} disabled={!img} className="rounded-xl bg-accent py-3 font-semibold disabled:opacity-50">שמירה</button>
      </div>
    </div>,
    document.body
  );
}
