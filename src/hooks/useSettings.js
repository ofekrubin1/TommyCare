import { DEFAULT_SETTINGS } from '@/config/appConfig';
import { C, collection } from '@/data';
import { useCollection } from './useCollection';

// App-wide settings live in one shared document: settings/app.
export function useSettings() {
  const { data, loading } = useCollection(C.settings);
  const settings = { ...DEFAULT_SETTINGS, ...(data.find((d) => d.id === 'app') || {}) };
  const save = (patch) => collection(C.settings).set('app', patch);
  return { settings, loading, save };
}
