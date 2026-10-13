import { useState } from 'react';
import { Plus, Ruler } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { dm } from '@/lib/time';
import { num } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Choice';
import { RowActions } from '@/components/ui/RowActions';
import GrowthSheet from './GrowthSheet';
import { GrowthChart } from './GrowthChart';

const METRICS = [
  { value: 'weight_kg', label: 'משקל', unit: 'ק״ג' },
  { value: 'height_cm', label: 'גובה', unit: 'ס״מ' },
  { value: 'head_cm', label: 'היקף ראש', unit: 'ס״מ' },
];

export default function GrowthSection() {
  const { data } = useCollection(C.growth);
  const [metric, setMetric] = useState('weight_kg');
  const [editing, setEditing] = useState(null);
  const rows = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const m = METRICS.find((x) => x.value === metric);
  const points = rows.filter((r) => r[metric] != null).map((r) => ({ date: r.date, value: r[metric] }));

  return (
    <Card>
      <SectionTitle action={<Button variant="soft" className="py-1.5 px-3 text-sm" onClick={() => setEditing('new')}><Plus className="w-4 h-4" />מדידה</Button>}>
        גדילה
      </SectionTitle>
      {!rows.length ? (
        <EmptyState icon={Ruler} text="עוד אין מדידות. אחרי ביקור בטיפת חלב, רשמו כאן משקל, גובה והיקף ראש." />
      ) : (
        <>
          <Segmented options={METRICS} value={metric} onChange={setMetric} />
          <div className="mt-3"><GrowthChart points={points} unit={m.unit} /></div>
          <div className="mt-2 divide-y divide-line">
            {[...rows].reverse().map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2">
                <span className="w-12 text-sm text-mute tabular-nums">{dm(r.date)}</span>
                <span className="flex-1 text-sm">
                  {[r.weight_kg != null && `${num(r.weight_kg, 2)} ק״ג`, r.height_cm != null && `${num(r.height_cm)} ס״מ`, r.head_cm != null && `ראש ${num(r.head_cm)}`].filter(Boolean).join(' · ')}
                  {r.note && <span className="block text-xs text-mute">{r.note}</span>}
                </span>
                <RowActions onEdit={() => setEditing(r)} onDelete={() => collection(C.growth).remove(r.id)} />
              </div>
            ))}
          </div>
        </>
      )}
      {editing && <GrowthSheet record={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
