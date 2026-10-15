import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, Plus, Syringe } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SwipeRow } from '@/components/ui/SwipeRow';
import VaccineSheet from './VaccineSheet';
import { buildVaccineList, statusOf } from './vaccineList';
import { useCanEdit } from '@/hooks/useCanEdit';

const fmt = (d) => format(parseISO(d), 'dd/MM/yyyy');

function VaccineRow({ v, onEdit }) {
  const status = statusOf(v);
  const when = v.months == null ? '' : v.months === 0 ? 'בלידה' : `גיל ${v.months} חודשים`;
  const detail = v.given
    ? [`בוצע ${fmt(v.given)}`, v.note].filter(Boolean).join(' · ')
    : [when, v.due && fmt(v.due), status === 'late' && 'עבר המועד', status === 'soon' && 'בקרוב', v.note].filter(Boolean).join(' · ');
  const remove = () => (v.custom ? collection(C.vaccinations).remove(v.key) : collection(C.vaccinations).set(v.key, { hidden: true }));
  return (
    <SwipeRow onEdit={onEdit} onDelete={remove} onClick={onEdit}>
      <div className="flex w-full items-center gap-3 py-2.5">
        <span className={cn('flex h-7 w-7 flex-none items-center justify-center rounded-full',
          status === 'done' ? 'bg-health text-white' : status === 'late' ? 'bg-danger/10 text-danger' : status === 'soon' ? 'bg-diaper/10 text-diaper' : 'bg-line/60 text-mute')}>
          {status === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : <Syringe className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{v.name}</span>
          <span className="block text-xs text-mute">{detail}</span>
        </span>
      </div>
    </SwipeRow>
  );
}

export default function VaccinesSection() {
  const { settings } = useSettings();
  const { data } = useCollection(C.vaccinations);
  const [editing, setEditing] = useState(null); // vaccine | 'new'
  const canEdit = useCanEdit();
  const all = buildVaccineList(settings.birth_date, data);
  const visible = all.filter((v) => !v.hidden);
  const hidden = all.filter((v) => v.hidden);

  return (
    <Card>
      <SectionTitle action={<Button variant="soft" className="px-3 py-1.5 text-sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />חיסון</Button>}>
        חיסונים
      </SectionTitle>
      {!settings.birth_date && <p className="mb-2 rounded-xl bg-diaper/10 px-3 py-2 text-sm text-diaper">הוסיפו תאריך לידה בהגדרות כדי לראות מתי כל חיסון.</p>}
      {canEdit && <p className="mb-1 text-xs text-mute">החליקו שורה הצידה לעריכה או מחיקה, או לחצו עליה.</p>}
      <div className="divide-y divide-line">
        {visible.map((v) => <VaccineRow key={v.key} v={v} onEdit={() => setEditing(v)} />)}
      </div>
      {canEdit && hidden.length > 0 && (
        <button onClick={() => hidden.forEach((v) => collection(C.vaccinations).set(v.key, { hidden: false }))} className="mt-2 text-xs text-accent">
          החזרת {hidden.length} חיסונים שהוסרו מהלוח
        </button>
      )}
      <p className="mt-3 text-xs text-mute">הלוח מבוסס על תוכנית החיסונים של משרד הבריאות. כדאי לוודא מול טיפת חלב.</p>
      {editing && <VaccineSheet vaccine={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
