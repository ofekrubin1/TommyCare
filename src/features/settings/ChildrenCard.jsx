import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useChildren } from '@/hooks/useSettings';
import { useIsOwner } from '@/hooks/useCanEdit';
import { ageText } from '@/lib/time';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { ChildAvatar } from '@/features/children/ChildSwitcher';
import ChildSheet from '@/features/children/ChildSheet';
import { deleteChild } from '@/features/children/children';

function DeleteChildSheet({ child, onClose }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => { setBusy(true); await deleteChild(child.id); onClose(); };
  return (
    <Sheet open onClose={onClose} title={`מחיקת ${child.name}`}>
      <p className="text-[15px]">{child.name} וכל הרישומים שלו/ה יימחקו: האכלות, חיתולים, שינה, תורים, גדילה ועוד. אי אפשר לבטל.</p>
      <p className="text-sm text-mute">כדאי לייצא קודם גיבוי מלא (למטה בהגדרות).</p>
      <Button variant="danger" className="w-full" onClick={remove} disabled={busy}><Trash2 className="h-5 w-5" />{busy ? 'מוחק...' : `מחיקת ${child.name}`}</Button>
      <Button variant="outline" className="w-full" onClick={onClose}>ביטול</Button>
    </Sheet>
  );
}

// Settings → the children: add one (new empty log), edit, and (owner only) delete with all their records.
export function ChildrenCard() {
  const { children } = useChildren();
  const isOwner = useIsOwner();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  return (
    <Card className="space-y-2">
      <SectionTitle>ילדים</SectionTitle>
      <div className="divide-y divide-line">
        {children.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2.5">
            <ChildAvatar child={c} className="h-10 w-10 text-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="text-xs text-mute">{c.birth_date ? ageText(c.birth_date, new Date(), c.gender) : 'בלי תאריך לידה'}</p>
            </div>
            <button type="button" onClick={() => setEditing(c)} aria-label={`עריכת ${c.name}`} className="rounded-lg p-2 text-mute active:bg-line/60"><Pencil className="h-4 w-4" /></button>
            {isOwner && children.length > 1 && (
              <button type="button" onClick={() => setDeleting(c)} aria-label={`מחיקת ${c.name}`} className="rounded-lg p-2 text-mute active:bg-danger/10 active:text-danger"><Trash2 className="h-4 w-4" /></button>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />הוספת ילד/ה</Button>
      <p className="text-xs text-mute">לכל ילד/ה יומן נפרד. מעבר בין הילדים: לחיצה על השם במסך הבית. קניות, מתנות ומשימות משותפות לכולם.</p>
      {editing && <ChildSheet record={editing === 'new' ? null : editing} nextOrder={children.length + 1} onClose={() => setEditing(null)} />}
      {deleting && <DeleteChildSheet child={deleting} onClose={() => setDeleting(null)} />}
    </Card>
  );
}
