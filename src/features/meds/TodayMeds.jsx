import { Check, Pill } from 'lucide-react';
import { C, collection } from '@/data';
import { dayKey, hm, todayKey } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const VITAMIN_D = { name: 'ויטמין D', dose: 'לפי הנחיית טיפת חלב', daily: true, active: true };

// "Given today?" checklist for daily meds; avoids giving a dose twice (or not at all).
export function TodayMeds({ meds, medDoses, nameOf }) {
  const daily = meds.filter((m) => m.daily && m.active !== false);
  const today = todayKey();

  if (!meds.length) {
    return (
      <Card className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-mute"><Pill className="w-4 h-4 text-health" />ויטמין D יומי?</div>
        <Button variant="soft" className="py-2 text-sm" onClick={() => collection(C.meds).add(VITAMIN_D)}>הוספה</Button>
      </Card>
    );
  }
  if (!daily.length) return null;

  return (
    <Card>
      <SectionTitle>תרופות היום</SectionTitle>
      <div className="space-y-2">
        {daily.map((m) => {
          const dose = medDoses.find((d) => d.med_id === m.id && dayKey(d.time) === today);
          const toggle = () => (dose
            ? collection(C.medDoses).remove(dose.id)
            : collection(C.medDoses).add({ med_id: m.id, time: new Date().toISOString() }));
          return (
            <button
              key={m.id}
              onClick={toggle}
              className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-right transition', dose ? 'border-health/40 bg-health/10' : 'border-line')}
            >
              <span className={cn('flex h-6 w-6 flex-none items-center justify-center rounded-md border-2', dose ? 'border-health bg-health text-white' : 'border-line')}>
                {dose && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className="flex-1">
                <span className="block font-medium">{m.name}</span>
                <span className="block text-xs text-mute">
                  {dose ? `ניתן ב-${hm(dose.time)}${nameOf(dose.created_by) ? ` ע״י ${nameOf(dose.created_by)}` : ''}` : m.dose || 'טרם ניתן היום'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
