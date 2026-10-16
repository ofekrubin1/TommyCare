import { format, parseISO } from 'date-fns';
import { FlaskConical, Plus } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { byTimeAsc, byTimeDesc } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { useQuickAdd } from '@/features/timeline/QuickAddProvider';
import { STORAGE } from '@/features/pumping/PumpingSheet';
import { useCanEdit } from '@/hooks/useCanEdit';

export default function PumpingPage() {
  const { data } = useCollection(C.pumping);
  const openSheet = useQuickAdd();
  const canEdit = useCanEdit();
  const stash = data.filter((p) => p.stored && !p.used).sort(byTimeAsc()); // oldest first: use these first
  const recent = [...data].sort(byTimeDesc()).slice(0, 30);

  return (
    <div className="space-y-4">
      <PageHeader title="שאיבה ומלאי חלב" action={<Button className="py-2 text-sm" onClick={() => openSheet('pumping')}><Plus className="w-4 h-4" />שאיבה</Button>} />
      <Card>
        <SectionTitle>במלאי</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {STORAGE.map((s) => {
            const items = stash.filter((p) => p.storage === s.value);
            return (
              <div key={s.value} className="rounded-2xl bg-pump/10 p-3 text-center text-pump">
                <div className="text-2xl font-bold tabular-nums">{items.reduce((sum, p) => sum + (p.amount_ml || 0), 0)}</div>
                <div className="text-xs">מ״ל ב{s.label} · {items.length} מנות</div>
              </div>
            );
          })}
        </div>
        {stash.length > 0 && (
          <div className="mt-3 divide-y divide-line">
            {stash.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <span className="flex-1 text-sm">
                  <span className="font-medium">{p.amount_ml} מ״ל</span>
                  <span className="text-mute"> · {p.storage === 'freezer' ? 'מקפיא' : 'מקרר'} · {format(parseISO(p.time), 'dd/MM HH:mm')}</span>
                </span>
                {canEdit && <Button variant="soft" className="py-1 px-2 text-sm" onClick={() => collection(C.pumping).update(p.id, { used: true })}>השתמשנו</Button>}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>שאיבות אחרונות</SectionTitle>
        {!recent.length ? <EmptyState icon={FlaskConical} text="עוד לא נרשמו שאיבות" /> : (
          <div className="divide-y divide-line">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <span className="flex-1 text-sm">
                  <span className="font-medium">{p.amount_ml} מ״ל</span>
                  <span className="text-mute"> · {format(parseISO(p.time), 'dd/MM HH:mm')}{p.used ? ' · נוצל' : ''}{p.note ? ` · ${p.note}` : ''}</span>
                </span>
                <RowActions onEdit={() => openSheet('pumping', p)} onDelete={() => collection(C.pumping).remove(p.id)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
