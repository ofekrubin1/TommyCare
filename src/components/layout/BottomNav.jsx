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

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto grid max-w-lg grid-cols-6">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-accent font-semibold' : 'text-mute')}>
            {({ isActive }) => (
              <>
                <span className={cn('rounded-full px-3 py-1 transition', isActive && 'bg-accent/10')}><Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} /></span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
