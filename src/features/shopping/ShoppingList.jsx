import { useState } from 'react';
import { Archive, ArchiveRestore, Check, Plus, ShoppingCart } from 'lucide-react';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RowActions } from '@/components/ui/RowActions';
import ShoppingItemSheet from './ShoppingItemSheet';

const shop = () => collection(C.shopping);
const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'he');

function ItemText({ item, muted }) {
  return (
    <span className="min-w-0 flex-1">
      <span className={muted ? 'text-mute line-through' : ''}>{item.name}</span>
      {item.quantity && <span className="mr-2 text-sm text-mute">× {item.quantity}</span>}
      {item.note && <span className="block text-xs text-mute">{item.note}</span>}
    </span>
  );
}

// Open → (checkbox) bought → archive. Archived items come back with one tap (diapers, wipes...).
export default function ShoppingList() {
  const { data } = useCollection(C.shopping);
  const [editing, setEditing] = useState(null); // record | 'new'
  const [showArchive, setShowArchive] = useState(false);

  const open = data.filter((i) => i.status === 'open').sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  const bought = data.filter((i) => i.status === 'bought').sort(byName);
  const archived = data.filter((i) => i.status === 'archived').sort(byName);
  const setStatus = (item, status) => shop().update(item.id, { status, ...(status === 'bought' ? { bought_at: new Date().toISOString() } : {}) });

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle action={<Button variant="soft" className="px-3 py-1.5 text-sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />פריט</Button>}>
          לקנות ({open.length})
        </SectionTitle>
        {!open.length ? <EmptyState icon={ShoppingCart} text="הרשימה ריקה" /> : (
          <div className="divide-y divide-line">
            {open.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2">
                <button onClick={() => setStatus(i, 'bought')} aria-label={`סימון ${i.name} כנקנה`} className="h-6 w-6 flex-none rounded-md border-2 border-line" />
                <ItemText item={i} />
                <RowActions onEdit={() => setEditing(i)} onDelete={() => shop().remove(i.id)} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {bought.length > 0 && (
        <Card>
          <SectionTitle action={
            <Button variant="ghost" className="px-2 py-1 text-sm" onClick={() => bought.forEach((i) => setStatus(i, 'archived'))}>
              <Archive className="h-4 w-4" />הכל לארכיון
            </Button>
          }>נקנו</SectionTitle>
          <div className="divide-y divide-line">
            {bought.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2">
                <button onClick={() => setStatus(i, 'open')} aria-label={`ביטול סימון ${i.name}`} className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-note text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </button>
                <ItemText item={i} muted />
                <Button variant="ghost" className="px-2 py-1 text-sm" onClick={() => setStatus(i, 'archived')}><Archive className="h-4 w-4" />לארכיון</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {archived.length > 0 && (
        <Card>
          <button onClick={() => setShowArchive((v) => !v)} className="flex w-full items-center gap-2 text-sm font-semibold text-mute">
            <Archive className="h-4 w-4" />ארכיון ({archived.length})
          </button>
          {showArchive && (
            <div className="mt-2 divide-y divide-line">
              {archived.map((i) => (
                <div key={i.id} className="flex items-center gap-3 py-2">
                  <ItemText item={i} muted />
                  <Button variant="soft" className="px-2 py-1 text-sm" onClick={() => setStatus(i, 'open')}><ArchiveRestore className="h-4 w-4" />שוב לרשימה</Button>
                  <RowActions onDelete={() => shop().remove(i.id)} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {editing && <ShoppingItemSheet record={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
