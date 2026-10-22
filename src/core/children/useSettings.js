import { DEFAULT_SETTINGS } from '@/config/appConfig';
import { C, collection } from '@/data';
import { childAsSettings, splitSettings } from './children';
import { useCollection } from '@/hooks/useCollection';
import { useChildren } from './useChildren';

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
