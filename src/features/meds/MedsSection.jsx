import { useState } from 'react';
import { Pill, Plus } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import MedSheet from './MedSheet';
import { VITAMIN_D } from './TodayMeds';
import { useCanEdit } from '@/core/auth/useRole';

export default function MedsSection() {
  const { data: meds } = useCollection(C.meds);
  const [editing, setEditing] = useState(null); // record | 'new'
  const canEdit = useCanEdit();

  return (
    <Card>
      <SectionTitle action={<Button variant="soft" className="py-1.5 px-3 text-sm" onClick={() => setEditing('new')}><Plus className="w-4 h-4" />הוספה</Button>}>
        תרופות וויטמינים
      </SectionTitle>
      {!meds.length ? (
        <EmptyState icon={Pill} text="אין תרופות קבועות">
          {canEdit && <Button variant="soft" className="mt-3 py-2 text-sm" onClick={() => collection(C.meds).add(VITAMIN_D)}>הוספת ויטמין D</Button>}
        </EmptyState>
      ) : (
        <div className="divide-y divide-line">
          {meds.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{m.name}{m.active === false && <span className="mr-2 text-xs text-mute">(לא פעיל)</span>}</p>
                <p className="text-sm text-mute">{[m.dose, m.daily && 'יומי'].filter(Boolean).join(' · ')}</p>
              </div>
              <RowActions onEdit={() => setEditing(m)} onDelete={() => collection(C.meds).remove(m.id)} />
            </div>
          ))}
        </div>
      )}
      {editing && <MedSheet record={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
