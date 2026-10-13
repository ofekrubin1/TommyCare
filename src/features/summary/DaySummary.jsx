import { cn, num } from '@/lib/utils';

function Stat({ value, label, className }) {
  return (
    <div className={cn('rounded-2xl px-2 py-2.5 text-center', className)}>
      <div className="text-xl font-bold tabular-nums leading-tight">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

// Daily totals: every feeding / diaper log adds to these counts.
export function DaySummary({ summary, compact = false }) {
  const s = summary;
  const feedDetail = [s.breast && `${s.breast} הנקה`, s.formula && `${s.formula} תמ״ל`, s.pumped && `${s.pumped} שאיבה`, s.bottleMl && `${s.bottleMl} מ״ל בבקבוק`].filter(Boolean).join(' · ');
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        <Stat value={s.feedings} label="האכלות" className="bg-feed/10 text-feed" />
        <Stat value={s.pee} label="פיפי" className="bg-diaper/10 text-diaper" />
        <Stat value={s.poop} label="קקי" className="bg-diaper/10 text-diaper" />
        <Stat value={num(s.sleepMinutes / 60)} label="שעות שינה" className="bg-sleep/10 text-sleep" />
      </div>
      {!compact && (feedDetail || s.diapers > 0 || s.pumpedMl > 0) && (
        <p className="mt-2 text-xs text-mute">
          {[feedDetail, s.diapers && `${s.diapers} חיתולים`, s.pumpedMl && `${s.pumpedMl} מ״ל נשאבו`].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}
