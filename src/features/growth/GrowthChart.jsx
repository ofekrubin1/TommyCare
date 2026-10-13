import { parseISO } from 'date-fns';
import { dm } from '@/lib/time';
import { num } from '@/lib/utils';

// Minimal line chart (no chart library): one metric over time.
export function GrowthChart({ points, unit }) {
  if (points.length < 2) return <p className="py-6 text-center text-sm text-mute">הגרף יופיע אחרי שתי מדידות לפחות</p>;
  const W = 320, H = 150, P = { l: 34, r: 10, t: 12, b: 22 };
  const xs = points.map((p) => parseISO(p.date).getTime());
  const ys = points.map((p) => p.value);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const pad = (Math.max(...ys) - Math.min(...ys)) * 0.15 || 1;
  const [y0, y1] = [Math.min(...ys) - pad, Math.max(...ys) + pad];
  const sx = (x) => P.l + ((x - x0) / (x1 - x0 || 1)) * (W - P.l - P.r);
  const sy = (y) => H - P.b - ((y - y0) / (y1 - y0)) * (H - P.t - P.b);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(xs[i]).toFixed(1)},${sy(p.value).toFixed(1)}`).join(' ');
  const ticks = [y0 + pad, (y0 + y1) / 2, y1 - pad];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="גרף גדילה" dir="ltr">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={sy(t)} y2={sy(t)} className="stroke-line" strokeWidth="1" />
          <text x={P.l - 6} y={sy(t) + 3} textAnchor="end" className="fill-mute" fontSize="9">{num(t, 1)}</text>
        </g>
      ))}
      <path d={path} fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.date + i}>
          <circle cx={sx(xs[i])} cy={sy(p.value)} r="3.5" className="fill-card stroke-accent" strokeWidth="2" />
          {(i === 0 || i === points.length - 1) && (
            <text x={sx(xs[i])} y={H - 6} textAnchor={i === 0 ? 'start' : 'end'} className="fill-mute" fontSize="9">{dm(p.date)}</text>
          )}
        </g>
      ))}
      <text x={W - P.r} y={P.t - 2} textAnchor="end" className="fill-mute" fontSize="9">{unit}</text>
    </svg>
  );
}
