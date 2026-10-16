import { createContext, useContext, useEffect, useState } from 'react';
import { displayUser } from './username';
import { isFixedOwner } from './roles';
import { auth, C, collection } from '@/data';
import { useCollection } from '@/hooks/useCollection';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(() => auth.subscribe((user) => setState({ user, loading: false })), []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Display names come from the profiles collection (set in Settings → "השם שלי").
export function useProfiles() {
  const { data } = useCollection(C.profiles);
  const names = Object.fromEntries(data.map((p) => [p.id, p.name]));
  return { names, nameOf: (uid) => names[uid] || '' };
}

// One-time switch to "view only by default" (roles v2): everyone who could edit before (no role or an editor
// role) keeps editing. Runs once, from an owner's device; afterwards new users wait for an owner's approval.
export function MigrateRoles() {
  const { user } = useAuth();
  const { data: profiles, loading: l1 } = useCollection(C.profiles);
  const { data: roles, loading: l2 } = useCollection(C.roles);
  const { data: settings, loading: l3 } = useCollection(C.settings);
  const done = settings.find((s) => s.id === 'app')?.roles_v2;
  useEffect(() => {
    if (!user || l1 || l2 || l3 || done || !isFixedOwner(user.email)) return;
    for (const p of profiles) {
      if (p.id !== user.uid && !roles.some((r) => r.id === p.id)) collection(C.roles).set(p.id, { role: 'editor' });
    }
    collection(C.settings).set('app', { roles_v2: true });
  }, [user, l1, l2, l3, done]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Every signed-in user gets a display name, so "נרשם ע״י" always shows who logged an entry.
// Defaults to the user name ("ofek"); a name set in Settings ("השם שלי") is never overwritten.
export function EnsureProfile() {
  const { user } = useAuth();
  const { data, loading } = useCollection(C.profiles);
  const has = data.some((p) => p.id === user?.uid && p.name);
  useEffect(() => {
    if (user && !loading && !has) collection(C.profiles).set(user.uid, { name: displayUser(user.email), email: user.email });
  }, [user, loading, has]);
  return null;
}

