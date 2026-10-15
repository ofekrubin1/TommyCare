import { useState } from 'react';
import { Check, Gift, Plus } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { cn, num } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import GiftSheet from './GiftSheet';

function GiftRow({ gift, onEdit }) {
  const toggle = () => collection(C.gifts).update(gift.id, { used: !gift.used, used_at: gift.used ? null : new Date().toISOString() });
  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        onClick={toggle}
        role="checkbox"
        aria-checked={!!gift.used}
        aria-label={gift.used ? `ביטול סימון ${gift.name} כנוצל` : `סימון ${gift.name} כנוצל`}
        className={cn('flex h-6 w-6 flex-none items-center justify-center rounded-md border-2', gift.used ? 'border-note bg-note text-white' : 'border-line')}
      >
        {gift.used && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <button onClick={onEdit} className="min-w-0 flex-1 text-right">
        <span className={cn('font-medium', gift.used && 'text-mute line-through')}>{gift.name}</span>
        {gift.value != null && <span dir="ltr" className="mr-2 inline-block text-sm text-mute">₪{num(gift.value, 0)}</span>}
        <span className="block text-xs text-mute">{[gift.from && `מ${gift.from}`, gift.note].filter(Boolean).join(' · ')}</span>
      </button>
      <RowActions onDelete={() => collection(C.gifts).remove(gift.id)} />
    </div>
  );
}

// Gifts we received (vouchers, items); checkbox = "used".
export default function GiftList() {
  const { data } = useCollection(C.gifts);
  const [editing, setEditing] = useState(null);
  const byNewest = (a, b) => (b.created_at || '').localeCompare(a.created_at || '');
  const unused = data.filter((g) => !g.used).sort(byNewest);
  const used = data.filter((g) => g.used).sort(byNewest);
  const unusedValue = unused.reduce((s, g) => s + (g.value || 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle action={<Button variant="soft" className="px-3 py-1.5 text-sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />מתנה</Button>}>
          לא נוצלו ({unused.length}){unusedValue > 0 && ` · ₪${num(unusedValue, 0)}`}
        </SectionTitle>
        {!unused.length ? <EmptyState icon={Gift} text="אין מתנות שמחכות למימוש" /> : (
          <div className="divide-y divide-line">{unused.map((g) => <GiftRow key={g.id} gift={g} onEdit={() => setEditing(g)} />)}</div>
        )}
      </Card>
      {used.length > 0 && (
        <Card>
          <SectionTitle>נוצלו ({used.length})</SectionTitle>
          <div className="divide-y divide-line">{used.map((g) => <GiftRow key={g.id} gift={g} onEdit={() => setEditing(g)} />)}</div>
        </Card>
      )}
      {editing && <GiftSheet record={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
