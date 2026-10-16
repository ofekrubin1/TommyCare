import { C } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { canEditAs, roleOf } from '@/features/auth/roles';
import { useCollection } from './useCollection';

// This user's role (see features/auth/roles.js). firestore.rules enforce it on the server; the screens
// only hide what the role can't do. While roles load, nobody gets edit buttons (no flash).
export function useRole() {
  const { user } = useAuth();
  const { data, loading } = useCollection(C.roles);
  if (loading || !user) return 'loading';
  return roleOf(user.uid, user.email, data);
}

export const useCanEdit = () => canEditAs(useRole());
export const useIsOwner = () => useRole() === 'owner';
