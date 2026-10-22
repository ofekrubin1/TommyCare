import { useId } from 'react';

// Loading indicator: a baby sitting and drinking from a bottle (face clear, one hand holding the bottle's end,
// the other on the tummy). The milk drains toward the nipple, stopping exactly on each of the bottle's marks,
// then refills; the baby rocks, kicks, blinks, little hearts float up, and "loading..." counts its dots.
// Animations: .loader-* in index.css.
const SKIN = '#F3C4A2', HAND = '#F6CBAA', FACE = '#F8D7BC';
const BOTTLE = 'rgb(214 106 131)';

export function BottleLoader({ className = 'min-h-[50vh]', label = 'טוען...' }) {
  const clip = `loader-clip-${useId().replace(/:/g, '')}`; // unique per loader on the page
  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`} role="status" aria-label={label}>
      <svg viewBox="0 0 160 160" className="h-28 w-28" aria-hidden="true">
        <defs>
          <clipPath id={clip}><rect x="16" y="-9" width="30" height="18" rx="7" /></clipPath>
        </defs>
        <ellipse cx="80" cy="150" rx="38" ry="5" fill="#000" opacity="0.06" />
        <path className="loader-heart" d="M40 40 c-3-4-9-1-6 3 l6 5 6-5 c3-4-3-7-6-3z" fill="#F29BAE" />
        <path className="loader-heart loader-heart-2" d="M128 30 c-2.5-3.5-7.5-1-5 2.5 l5 4 5-4 c2.5-3.5-2.5-6-5-2.5z" fill="#F7B6C4" />
        <g className="loader-baby">
          {/* legs */}
          <g className="loader-leg-l">
            <path d="M71 125 Q58 131 51 140" stroke={SKIN} strokeWidth="13" strokeLinecap="round" fill="none" />
            <ellipse cx="48" cy="142" rx="8" ry="6" fill={HAND} />
          </g>
          <g className="loader-leg-r">
            <path d="M89 125 Q102 131 109 140" stroke={SKIN} strokeWidth="13" strokeLinecap="round" fill="none" />
            <ellipse cx="112" cy="142" rx="8" ry="6" fill={HAND} />
          </g>
          {/* onesie with a heart, diaper */}
          <ellipse cx="80" cy="107" rx="24" ry="26" fill="#BFE6DA" />
          <path d="M59 119 Q80 140 101 119 Q99 135 80 137 Q61 135 59 119 Z" fill="#FFFFFF" stroke="#E7DFD9" strokeWidth="1.5" />
          <path d="M80 104 c-2-3-7-1-5 2 l5 4 5-4 c2-3-3-5-5-2z" fill="#F29BAE" opacity="0.8" />
          {/* left arm resting on the tummy */}
          <path d="M59 97 Q58 112 70 114" stroke={SKIN} strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="72" cy="114" r="5.5" fill={HAND} />
          {/* head */}
          <circle cx="56" cy="60" r="6" fill={SKIN} />
          <circle cx="104" cy="60" r="6" fill={SKIN} />
          <circle cx="80" cy="58" r="25" fill={FACE} />
          <path d="M76 34 c1-7 11-8 12-2 1 4-5 5-5 1" fill="none" stroke="#A06A45" strokeWidth="3" strokeLinecap="round" />
          <g className="loader-eyes">
            <path d="M66 55 q5-5 10 0" fill="none" stroke="#5B4038" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M84 55 q5-5 10 0" fill="none" stroke="#5B4038" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <ellipse cx="65" cy="65" rx="5" ry="3.2" fill="#F29BAE" opacity="0.6" />
          <ellipse cx="96" cy="65" rx="5" ry="3.2" fill="#F29BAE" opacity="0.6" />
          {/* right arm: short and chubby, elbow out to the side, up to the bottle (outside the face) */}
          <path d="M99 94 Q112 98 114 88 Q116 80 117 72" stroke={SKIN} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* bottle: nipple in the mouth, the rest out to the side */}
          <g className="loader-bottle">
            <g transform="translate(80 72) rotate(-18)">
              <path d="M0 0 q0-5 5-5 h4 v10 h-4 q-5 0-5-5 z" fill={BOTTLE} fillOpacity="0.4" />
              <rect x="8" y="-7" width="9" height="14" rx="3" fill={BOTTLE} fillOpacity="0.8" />
              <rect x="16" y="-9" width="30" height="18" rx="7" fill={BOTTLE} fillOpacity="0.25" />
              <g clipPath={`url(#${clip})`}>
                <rect className="loader-milk" x="16" y="-9" width="30" height="18" fill="#FFFFFF" />
              </g>
              <rect x="16" y="-9" width="30" height="18" rx="7" fill="none" stroke={BOTTLE} strokeWidth="2.2" />
              {/* the marks the milk stops on (x 39, 32, 25) */}
              <path d="M25 -9 v5 M32 -9 v5 M39 -9 v5" stroke={BOTTLE} strokeWidth="1.6" strokeLinecap="round" />
            </g>
            {/* a little hand cupping the bottle from below, thumb over the top */}
            <ellipse cx="118" cy="66" rx="6.5" ry="5.5" fill={HAND} transform="rotate(-18 118 66)" />
            <circle cx="121" cy="58.5" r="3" fill={HAND} />
          </g>
        </g>
      </svg>
      <p dir="ltr" className="text-sm font-semibold tracking-wide text-accent">loading<span className="loader-dots" /></p>
    </div>
  );
}
