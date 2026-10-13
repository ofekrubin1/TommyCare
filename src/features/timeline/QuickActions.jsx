import { Droplets, FlaskConical, Milk, Moon, StickyNote, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuickAdd } from './QuickAddProvider';

const MAIN = [
  { kind: 'feeding', label: 'האכלה', icon: Milk, tone: 'bg-feed text-white' },
  { kind: 'diaper', label: 'חיתול', icon: Droplets, tone: 'bg-diaper text-white' },
  { kind: 'sleep', label: 'שינה', icon: Moon, tone: 'bg-sleep text-white' },
  { kind: 'note', label: 'מה קרה?', icon: StickyNote, tone: 'bg-note text-white' },
];
const MORE = [
  { kind: 'pumping', label: 'שאיבה', icon: FlaskConical, tone: 'text-pump bg-pump/10' },
  { kind: 'fever', label: 'חום', icon: Thermometer, tone: 'text-danger bg-danger/10' },
];

// Big, thumb-sized buttons for the most common logs.
export function QuickActions() {
  const openSheet = useQuickAdd();
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {MAIN.map(({ kind, label, icon: Icon, tone }) => (
          <button key={kind} onClick={() => openSheet(kind)} className={cn('flex flex-col items-center gap-1 rounded-2xl py-3.5 shadow-soft active:scale-[0.97] transition', tone)}>
            <Icon className="h-6 w-6" strokeWidth={1.8} />
            <span className="text-sm font-semibold">{label}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MORE.map(({ kind, label, icon: Icon, tone }) => (
          <button key={kind} onClick={() => openSheet(kind)} className={cn('flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium', tone)}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
    </div>
  );
}
