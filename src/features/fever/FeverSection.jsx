import { format, parseISO } from 'date-fns';
import { Plus, Thermometer } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useNow } from '@/hooks/useNow';
import { sinceText } from '@/lib/time';
import { byTimeDesc, cn } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import { useQuickAdd } from '@/features/timeline/QuickAddProvider';

export default function FeverSection() {
  const { data } = useCollection(C.fever);
  const openSheet = useQuickAdd();
  const now = useNow();
  const rows = [...data].sort(byTimeDesc());
  const lastMed = rows.find((r) => r.medicine);

  return (
    <Card>
      <SectionTitle action={<Button variant="soft" className="py-1.5 px-3 text-sm" onClick={() => openSheet('fever')}><Plus className="w-4 h-4" />מדידה</Button>}>
        חום ומחלה
      </SectionTitle>
      {lastMed && (
        <p className="mb-2 rounded-xl bg-health/10 px-3 py-2 text-sm text-health">
          תרופה אחרונה: {lastMed.medicine}{lastMed.dose ? ` (${lastMed.dose})` : ''}, {sinceText(lastMed.time, now)}
        </p>
      )}
      {!rows.length ? <EmptyState icon={Thermometer} text="אין מדידות חום" /> : (
        <div className="divide-y divide-line">
          {rows.slice(0, 30).map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5">
              <span className={cn('w-14 text-lg font-bold tabular-nums', r.temp_c >= 38 ? 'text-danger' : 'text-ink')}>{r.temp_c ? `${r.temp_c}°` : '–'}</span>
              <span className="flex-1 min-w-0 text-sm">
                <span className="block text-mute">{format(parseISO(r.time), 'dd/MM HH:mm')}</span>
                {[r.symptoms, r.medicine && `${r.medicine}${r.dose ? ` ${r.dose}` : ''}`, r.note].filter(Boolean).join(' · ')}
              </span>
              <RowActions onEdit={() => openSheet('fever', r)} onDelete={() => collection(C.fever).remove(r.id)} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
