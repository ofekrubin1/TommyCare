import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { C, setCurrentChild } from '@/data';
import { useCollectionAt, useDataContext } from '@/hooks/useCollection';
import { useChildren } from '@/hooks/useSettings';
import { useCanEdit, useRole } from '@/hooks/useCanEdit';
import { reportError } from '@/lib/errors';
import { BottleLoader } from '@/components/ui/BottleLoader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { isFixedOwner } from '@/features/auth/roles';
import { migrateToFamily } from './children';
import ChildSheet from './ChildSheet';

const Message = ({ children }) => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center" dir="rtl">
    <p className="text-5xl">🐣</p>
    {children}
  </div>
);

// Shows the app only once there's a child to show:
// - first open after the update: the owner's device moves the data into the family layout (one time);
// - no child yet (new family): editors add the first one;
// - keeps the child chosen on this device valid (e.g. after a child was deleted on another phone).
export function ChildGate({ children: app }) {
  const { user } = useAuth();
  const role = useRole();
  const canEdit = useCanEdit();
  const { childId } = useDataContext();
  const { children, loading } = useChildren();
  const families = useCollectionAt(C.families);
  const legacy = useCollectionAt(C.settings); // top-level settings = the layout before families
  const [adding, setAdding] = useState(false);
  const started = useRef(false);

  const ready = families.data.some((f) => f.id === 'main');
  const needsMove = !families.loading && !legacy.loading && !ready && legacy.data.some((s) => s.id === 'app');
  const mover = isFixedOwner(user?.email);

  useEffect(() => {
    if (!needsMove || !mover || started.current) return;
    started.current = true;
    migrateToFamily().then(setCurrentChild).catch((err) => { started.current = false; reportError(err, 'move to family'); });
  }, [needsMove, mover]);

  useEffect(() => {
    if (!loading && children.length && !children.some((c) => c.id === childId)) setCurrentChild(children[0].id);
  }, [loading, children, childId]);

  if (loading || families.loading || legacy.loading || role === 'loading') return <BottleLoader className="min-h-screen" />;
  if (needsMove) {
    return mover ? <BottleLoader className="min-h-screen" label="מעדכן את מבנה הנתונים..." /> : (
      <Message>
        <p className="text-lg font-semibold">האפליקציה מתעדכנת</p>
        <p className="text-sm text-mute">הנתונים יופיעו כאן אחרי שהבעלים יפתח/תפתח את האפליקציה פעם אחת.</p>
      </Message>
    );
  }
  if (!children.length) {
    return (
      <Message>
        <p className="text-lg font-semibold">ברוכים הבאים ל-TommyCare</p>
        {canEdit ? (
          <>
            <p className="text-sm text-mute">מתחילים בהוספת הילד/ה הראשון/ה.</p>
            <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />הוספת ילד/ה</Button>
            {adding && <ChildSheet onClose={() => setAdding(false)} />}
          </>
        ) : <p className="text-sm text-mute">עדיין לא נוסף ילד. מי שיש לו הרשאת עריכה יכול להוסיף.</p>}
      </Message>
    );
  }
  if (!children.some((c) => c.id === childId)) return <BottleLoader className="min-h-screen" />;
  return app;
}
