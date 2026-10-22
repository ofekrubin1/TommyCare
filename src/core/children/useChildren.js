import { C } from '@/data';
import { useCollection, useDataContext } from '@/hooks/useCollection';
import { sortChildren } from './children';

// All children, in order, and the one chosen on this device.
export function useChildren() {
  const { childId } = useDataContext();
  const { data, loading } = useCollection(C.children);
  const children = sortChildren(data);
  return { children, child: children.find((c) => c.id === childId) || null, loading };
}
