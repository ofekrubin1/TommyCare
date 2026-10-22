// Loading indicator: a feeding bottle that empties in three steps (full → ⅔ → ⅓ → empty) and refills.
export function BottleLoader({ className = 'min-h-[50vh]', label = 'טוען...' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-label={label}>
      <svg viewBox="0 0 40 64" className="h-14 w-9 text-accent" aria-hidden="true">
        <defs>
          <clipPath id="bottle-body"><rect x="9" y="21" width="22" height="39" rx="6" /></clipPath>
        </defs>
        {/* nipple + collar */}
        <path d="M16 13c0-5 2-9 4-9s4 4 4 9z" className="fill-accent/25" />
        <rect x="11" y="13" width="18" height="7" rx="2" className="fill-accent/60" />
        {/* milk, drained in steps (see .bottle-milk in index.css) */}
        <g clipPath="url(#bottle-body)">
          <rect x="9" y="21" width="22" height="39" className="bottle-milk fill-accent/35" />
        </g>
        {/* body outline + measuring marks */}
        <rect x="9" y="21" width="22" height="39" rx="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M9 34h5M9 43h5M9 52h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
