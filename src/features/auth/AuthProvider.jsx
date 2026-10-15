import { createContext, useContext, useEffect, useState } from 'react';
import { displayUser } from './username';
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
