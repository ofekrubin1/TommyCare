import { useState } from 'react';
import { Check, Eye, Pencil, X } from 'lucide-react';
import { RowActions } from '@/components/ui/RowActions';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Choice';
import { useAuth } from '@/features/auth/AuthProvider';
import { displayUser } from '@/features/auth/username';

// Display name (shown next to entries, "נרשם ע״י") — editable here. The login user name is separate and fixed.
function NameEditor({ profile, onDone }) {
  const [name, setName] = useState(profile.name || '');
  const save = async () => {
    if (name.trim()) await collection(C.profiles).set(profile.id, { name: name.trim() });
    onDone();
  };
  return (
    <form className="flex flex-1 items-center gap-1" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <Input autoFocus className="py-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם לתצוגה" />
      <button type="submit" aria-label="שמירת השם" className="rounded-lg p-2 text-note active:bg-line/60"><Check className="h-4 w-4" /></button>
      <button type="button" onClick={onDone} aria-label="ביטול" className="rounded-lg p-2 text-mute active:bg-line/60"><X className="h-4 w-4" /></button>
    </form>
  );
}

// Everyone who has signed in at least once: display name, login user name, and a "view only" switch
// (e.g. grandparents). The switch writes roles/{uid}; firestore.rules block every change from a viewer.
export function UsersCard() {
  const { user } = useAuth();
  const { data: profiles } = useCollection(C.profiles);
  const { data: roles } = useCollection(C.roles);
  const [editing, setEditing] = useState(null);
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
            {editing === p.id ? <NameEditor profile={p} onDone={() => setEditing(null)} /> : (
              <>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => setEditing(p.id)} className="flex max-w-full items-center gap-1.5 text-right font-medium">
                    <span className="truncate">{p.name || displayUser(p.email)}</span>
                    {p.id === user?.uid && <span className="flex-none text-xs font-normal text-mute">(את/ה)</span>}
                    <Pencil className="h-3.5 w-3.5 flex-none text-mute" aria-label="עריכת השם" />
                  </button>
                  <p className="truncate text-xs text-mute">כניסה: <bdi dir="ltr">{displayUser(p.email)}</bdi></p>
                </div>
                {p.id === user?.uid
                  ? <span className="text-xs text-mute">עריכה מלאה</span>
                  : (
                    <>
                      <div className="w-36 flex-none"><Switch label={<span className="flex items-center gap-1 text-sm"><Eye className="h-4 w-4" />צפייה בלבד</span>} checked={isViewer(p.id)} onChange={(on) => setViewer(p.id, on)} /></div>
                      <RowActions onDelete={() => removeUser(p.id)} />
                    </>
                  )}
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-mute">השם (עם העיפרון) מופיע ליד רישומים, ״נרשם ע״י״. ״כניסה״ הוא שם המשתמש להתחברות, והוא לא משתנה מכאן.
        משתמש חדש מופיע כאן אחרי הכניסה הראשונה שלו. ״צפייה בלבד״ = רואה הכל ולא יכול לשנות כלום.
        מחיקה מסירה מהרשימה; כדי לבטל לגמרי את הכניסה מחקו את המשתמש גם ב-Firebase (Authentication → Users).</p>
    </Card>
  );
}
