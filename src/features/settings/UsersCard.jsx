import { Eye } from 'lucide-react';
import { RowActions } from '@/components/ui/RowActions';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Choice';
import { useAuth } from '@/features/auth/AuthProvider';
import { displayUser } from '@/features/auth/username';

// Everyone who has signed in at least once, with a "view only" switch (e.g. grandparents).
// The switch writes roles/{uid}; firestore.rules block every change from a viewer.
export function UsersCard() {
  const { user } = useAuth();
  const { data: profiles } = useCollection(C.profiles);
  const { data: roles } = useCollection(C.roles);
  const isViewer = (uid) => roles.find((r) => r.id === uid)?.role === 'viewer';
  const setViewer = (uid, on) => collection(C.roles).set(uid, { role: on ? 'viewer' : 'editor' });
  // Removes the user from this list (their name and permission). Their login itself lives in Firebase Console →
  // Authentication → Users; if it still exists and they sign in again, they'll reappear here.
  const removeUser = (uid) => Promise.all([collection(C.profiles).remove(uid), collection(C.roles).remove(uid)]);
  const people = [...profiles].sort((a, b) => (a.id === user?.uid ? -1 : b.id === user?.uid ? 1 : (a.name || '').localeCompare(b.name || '', 'he')));

  return (
    <Card className="space-y-2">
      <SectionTitle>משתמשים והרשאות</SectionTitle>
      <div className="divide-y divide-line">
        {people.map((p) => (
          <div key={p.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.name || displayUser(p.email)}{p.id === user?.uid && <span className="mr-1.5 text-xs text-mute">(את/ה)</span>}</p>
              <p className="text-xs text-mute" dir="ltr">{displayUser(p.email)}</p>
            </div>
            {p.id === user?.uid
              ? <span className="text-xs text-mute">עריכה מלאה</span>
              : (
                <>
                  <div className="w-36"><Switch label={<span className="flex items-center gap-1 text-sm"><Eye className="h-4 w-4" />צפייה בלבד</span>} checked={isViewer(p.id)} onChange={(on) => setViewer(p.id, on)} /></div>
                  <RowActions onDelete={() => removeUser(p.id)} />
                </>
              )}
          </div>
        ))}
      </div>
      <p className="text-xs text-mute">משתמש חדש מופיע כאן אחרי הכניסה הראשונה שלו. ״צפייה בלבד״ = רואה הכל ולא יכול לשנות כלום.
        מחיקה מסירה מהרשימה; כדי לבטל לגמרי את הכניסה מחקו את המשתמש גם ב-Firebase (Authentication → Users).</p>
    </Card>
  );
}
