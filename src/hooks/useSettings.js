import { DEFAULT_SETTINGS } from '@/config/appConfig';
import { C, collection } from '@/data';
import { childAsSettings, sortChildren, splitSettings } from '@/features/children/children';
import { useCollection, useDataContext } from './useCollection';

// All children, in order, and the one chosen on this device.
export function useChildren() {
  const { childId } = useDataContext();
  const { data, loading } = useCollection(C.children);
  const children = sortChildren(data);
  return { children, child: children.find((c) => c.id === childId) || null, loading };
}

// Settings as the screens read them: the family's shared settings (families/<id>/settings/app: daily email, ...)
// merged with the current child's (name, birth date, photo, feeding defaults). save() sends each key to its place.
export function useSettings() {
  const { data, loading } = useCollection(C.settings);
  const { child, loading: childLoading } = useChildren();
  const settings = { ...DEFAULT_SETTINGS, ...(data.find((d) => d.id === 'app') || {}), ...childAsSettings(child) };
  const save = (patch) => {
    const { child: childPatch, family } = splitSettings(patch);
    if (child && Object.keys(childPatch).length) collection(C.children).set(child.id, childPatch);
    if (Object.keys(family).length) collection(C.settings).set('app', family);
  };
  return { settings, loading: loading || childLoading, save };
}
