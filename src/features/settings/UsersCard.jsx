import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { RowActions } from '@/components/ui/RowActions';
import { C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';
import { useIsOwner } from '@/core/auth/useRole';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { useAuth } from '@/core/auth/AuthProvider';
import { displayUser } from '@/core/auth/username';
import { isFixedOwner, ROLES, roleOf } from '@/core/auth/roles';
import { cn } from '@/lib/utils';

// Display name (shown next to entries, "נרשם ע״י") — editable here. The login user name is separate and fixed.
function NameEditor({ profile, onDone }) {
  const [name, setName] = useState(profile.name || '');
  const save = () => {
    if (name.trim()) collection(C.profiles).set(profile.id, { name: name.trim() });
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

function RolePicker({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-line bg-bg p-0.5">
      {ROLES.map((r) => (
        <button key={r.value} type="button" onClick={() => onChange(r.value)}
          className={cn('rounded-md px-2 py-1 text-xs font-medium', value === r.value ? 'bg-card text-ink shadow-soft' : 'text-mute')}>
          {r.label}
        </button>
      ))}
    </div>
  );
}

// Everyone who has signed in at least once: display name, login user name and role. Only an owner changes
// roles or removes users (firestore.rules enforce it); new users stay view-only ("ממתין לאישור") until then.
export function UsersCard() {
  const { user } = useAuth();
  const isOwner = useIsOwner();
  const { data: profiles } = useCollection(C.profiles);
  const { data: roles } = useCollection(C.roles);
  const [editing, setEditing] = useState(null);
  const setRole = (uid, role) => collection(C.roles).set(uid, { role });
  // Removes the user from this list (their name and permission). Their login itself lives in Firebase Console →
  // Authentication → Users; if it still exists and they sign in again, they'll reappear here (view only).
  const removeUser = (uid) => Promise.all([collection(C.profiles).remove(uid), collection(C.roles).remove(uid)]);
  const people = [...profiles].sort((a, b) => (a.id === user?.uid ? -1 : b.id === user?.uid ? 1 : (a.name || '').localeCompare(b.name || '', 'he')));

  return (
    <Card className="space-y-2">
      <SectionTitle>משתמשים והרשאות</SectionTitle>
      <div className="divide-y divide-line">
        {people.map((p) => {
          const role = roleOf(p.id, p.email, roles);
          const fixed = isFixedOwner(p.email);
          const canRename = isOwner || p.id === user?.uid;
          return (
            <div key={p.id} className="space-y-2 py-2.5">
              <div className="flex items-center gap-3">
                {editing === p.id ? <NameEditor profile={p} onDone={() => setEditing(null)} /> : (
                  <>
                    <div className="min-w-0 flex-1">
                      <button type="button" disabled={!canRename} onClick={() => setEditing(p.id)} className="flex max-w-full items-center gap-1.5 text-right font-medium">
                        <span className="truncate">{p.name || displayUser(p.email)}</span>
                        {p.id === user?.uid && <span className="flex-none text-xs font-normal text-mute">(את/ה)</span>}
                        {canRename && <Pencil className="h-3.5 w-3.5 flex-none text-mute" aria-label="עריכת השם" />}
                      </button>
                      <p className="truncate text-xs text-mute">כניסה: <bdi dir="ltr">{displayUser(p.email)}</bdi></p>
                    </div>
                    {role === 'pending' && <span className="rounded-full bg-diaper/15 px-2 py-0.5 text-xs font-medium text-diaper">ממתין לאישור</span>}
                    {(fixed || !isOwner) && role !== 'pending' && <span className="text-xs text-mute">{fixed ? 'בעלים' : ROLES.find((r) => r.value === role)?.label}</span>}
                    {isOwner && !fixed && p.id !== user?.uid && <RowActions onDelete={() => removeUser(p.id)} />}
                  </>
                )}
              </div>
              {isOwner && !fixed && p.id !== user?.uid && editing !== p.id && (
                <RolePicker value={role === 'pending' ? 'viewer' : role} onChange={(r) => setRole(p.id, r)} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-mute">השם (עם העיפרון) מופיע ליד רישומים, ״נרשם ע״י״. ״כניסה״ הוא שם המשתמש להתחברות, והוא לא משתנה מכאן.
        {' '}צפייה = רואה הכל בלי לשנות · עריכה = מוסיף ומעדכן · מנהל = גם קובע הרשאות.
        {' '}משתמש חדש מופיע כאן אחרי הכניסה הראשונה שלו, במצב צפייה עד שמנהל מאשר.
        {isOwner && ' מחיקה מסירה מהרשימה; כדי לבטל לגמרי את הכניסה מחקו את המשתמש גם ב-Firebase (Authentication → Users).'}</p>
    </Card>
  );
}
