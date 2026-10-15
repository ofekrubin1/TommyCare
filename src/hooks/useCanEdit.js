import { C } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCollection } from './useCollection';

// View-only users (roles/{uid}.role === 'viewer', e.g. grandparents) see everything but can't add, edit or delete.
// firestore.rules enforce this on the server; this hook just hides the controls.
export function useCanEdit() {
  const { user } = useAuth();
  const { data, loading } = useCollection(C.roles);
  if (loading) return false; // don't flash edit buttons before the role is known
  return data.find((r) => r.id === user?.uid)?.role !== 'viewer';
}
