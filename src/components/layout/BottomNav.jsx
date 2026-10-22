import { NavLink } from 'react-router-dom';
import { BookOpen, Ellipsis, HeartPulse, House, ListChecks, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/', label: 'בית', icon: House, end: true },
  { to: '/journal', label: 'יומן', icon: BookOpen },
  { to: '/health', label: 'בריאות', icon: HeartPulse },
  { to: '/shopping', label: 'קניות', icon: ShoppingCart },
  { to: '/tasks', label: 'משימות', icon: ListChecks },
  { to: '/more', label: 'עוד', icon: Ellipsis },
];

// Floating, see-through tab bar (like WhatsApp's): a rounded pill above the bottom edge; the page shows
// through it, blurred. The current tab gets a soft pill of its own.
export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="pointer-events-auto mx-auto grid max-w-lg grid-cols-6 gap-0.5 rounded-[2rem] border border-white/40 bg-card/70 p-1.5 shadow-[0_8px_30px_rgb(0_0_0/0.12)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn('flex flex-col items-center gap-0.5 rounded-[1.4rem] py-1.5 text-[11px] transition', isActive ? 'bg-ink/[0.07] font-semibold text-accent dark:bg-white/10' : 'text-mute')}
          >
            {({ isActive }) => (
              <>
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
