import { useState } from 'react';
import { Archive, ArchiveRestore, Check, Plus, ShoppingCart } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { cn } from '@/lib/utils';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { RowActions } from '@/components/ui/RowActions';
import { PageHeader } from '@/components/layout/PageHeader';

const shop = () => collection(C.shopping);
const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'he');

// Open → (checkbox) bought → archive. Archived items can come back with one tap (diapers, wipes...).
export default function ShoppingPage() {
  const { data } = useCollection(C.shopping);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [showArchive, setShowArchive] = useState(false);

  const open = data.filter((i) => i.status === 'open').sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  const bought = data.filter((i) => i.status === 'bought').sort(byName);
  const archived = data.filter((i) => i.status === 'archived').sort(byName);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await shop().add({ name: name.trim(), quantity: qty.trim(), status: 'open' });
    setName('');
    setQty('');
  };
  const setStatus = (item, status) => shop().update(item.id, { status, ...(status === 'bought' ? { bought_at: new Date().toISOString() } : {}) });

  return (
    <div className="space-y-4">
      <PageHeader title="קניות לתום" />
      <Card>
        <form onSubmit={add} className="flex gap-2">
          <Input className="flex-1" placeholder="מה צריך לקנות?" value={name} onChange={(e) => setName(e.target.value)} />
          <Input className="w-20" placeholder="כמה" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Button className="px-3" disabled={!name.trim()} aria-label="הוספה"><Plus className="w-5 h-5" /></Button>
        </form>
      </Card>

      <Card>
        <SectionTitle>לקנות ({open.length})</SectionTitle>
        {!open.length ? <EmptyState icon={ShoppingCart} text="הרשימה ריקה" /> : (
          <div className="divide-y divide-line">
            {open.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2">
                <button onClick={() => setStatus(i, 'bought')} aria-label={`סימון ${i.name} כנקנה`} className="h-6 w-6 flex-none rounded-md border-2 border-line" />
                <span className="flex-1">{i.name}{i.quantity && <span className="mr-2 text-sm text-mute">× {i.quantity}</span>}</span>
                <RowActions onDelete={() => shop().remove(i.id)} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {bought.length > 0 && (
        <Card>
          <SectionTitle action={
            <Button variant="ghost" className="py-1 px-2 text-sm" onClick={() => bought.forEach((i) => setStatus(i, 'archived'))}>
              <Archive className="w-4 h-4" />הכל לארכיון
            </Button>
          }>נקנו</SectionTitle>
          <div className="divide-y divide-line">
            {bought.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2">
                <button onClick={() => setStatus(i, 'open')} aria-label={`ביטול סימון ${i.name}`} className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-note text-white">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </button>
                <span className="flex-1 text-mute line-through">{i.name}{i.quantity && ` × ${i.quantity}`}</span>
                <Button variant="ghost" className="py-1 px-2 text-sm" onClick={() => setStatus(i, 'archived')}><Archive className="w-4 h-4" />לארכיון</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {archived.length > 0 && (
        <Card>
          <button onClick={() => setShowArchive((v) => !v)} className="flex w-full items-center gap-2 text-sm font-semibold text-mute">
            <Archive className="w-4 h-4" />ארכיון ({archived.length})
          </button>
          {showArchive && (
            <div className="mt-2 divide-y divide-line">
              {archived.map((i) => (
                <div key={i.id} className={cn('flex items-center gap-3 py-2')}>
                  <span className="flex-1 text-mute">{i.name}{i.quantity && ` × ${i.quantity}`}</span>
                  <Button variant="soft" className="py-1 px-2 text-sm" onClick={() => setStatus(i, 'open')}><ArchiveRestore className="w-4 h-4" />שוב לרשימה</Button>
                  <RowActions onDelete={() => shop().remove(i.id)} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
