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

// Floating, see-through tab bar (like WhatsApp's): a rounded pill low on the screen, over the home-indicator
// area like WhatsApp (not above it); the page shows
// through it, blurred. The current tab gets a soft pill of its own.
export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3" style={{ paddingBottom: 'max(0.4rem, calc(env(safe-area-inset-bottom) - 0.9rem))' }}>
      <div className="glass-bar pointer-events-auto mx-auto grid max-w-lg grid-cols-6 gap-0.5 rounded-full p-1.5">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn('flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] transition', isActive ? 'glass-tab-active font-semibold text-ink' : 'text-ink/75')}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-[22px] w-[22px]', isActive && 'text-accent')} strokeWidth={isActive ? 2.2 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
