import { createContext, useContext, useEffect, useState } from 'react';
import { auth, C } from '@/data';
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
