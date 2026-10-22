// Loading indicator: a happy baby drinking from a bottle; the milk drains in three steps (full → ⅔ → ⅓ → empty)
// and refills, and the bottle bobs a little as if sipping. Animations: .baby-bottle / .bottle-milk in index.css.
export function BottleLoader({ className = 'min-h-[50vh]', label = 'טוען...' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-label={label}>
      <svg viewBox="0 0 120 96" className="h-24 w-[7.5rem]" aria-hidden="true">
        <defs>
          <clipPath id="baby-bottle-body"><rect x="74" y="56" width="34" height="22" rx="9" /></clipPath>
        </defs>
        {/* ear + head */}
        <circle cx="16" cy="56" r="8" fill="#F5C9A8" />
        <circle cx="50" cy="54" r="36" fill="#F8D7BC" />
        {/* hair curl */}
        <path d="M44 20c2-8 14-9 15-2 1 5-6 6-6 2" fill="none" stroke="#A06A45" strokeWidth="3.5" strokeLinecap="round" />
        {/* happy closed eyes */}
        <path d="M28 49q6-6 12 0" fill="none" stroke="#5B4038" strokeWidth="3" strokeLinecap="round" />
        <path d="M52 49q6-6 12 0" fill="none" stroke="#5B4038" strokeWidth="3" strokeLinecap="round" />
        {/* cheeks */}
        <ellipse cx="27" cy="63" rx="7" ry="4.5" fill="#F29BAE" opacity="0.55" />
        <ellipse cx="66" cy="62" rx="6" ry="4" fill="#F29BAE" opacity="0.55" />
        {/* the bottle, nipple in the mouth */}
        <g className="baby-bottle">
          <g transform="rotate(-18 66 68)">
            <path d="M54 68q0-5 6-5h4v10h-4q-6 0-6-5z" className="fill-accent/35" />
            <rect x="64" y="60" width="10" height="16" rx="3" className="fill-accent/75" />
            {/* empty glass, the milk inside it, then the outline and measuring marks */}
            <rect x="74" y="56" width="34" height="22" rx="9" className="fill-accent/30" />
            <g clipPath="url(#baby-bottle-body)">
              <rect x="74" y="56" width="34" height="22" className="bottle-milk" fill="#FFFFFF" />
            </g>
            <rect x="74" y="56" width="34" height="22" rx="9" fill="none" className="stroke-accent" strokeWidth="2.4" />
            <path d="M84 56v6M92 56v6M100 56v6" className="stroke-accent" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
