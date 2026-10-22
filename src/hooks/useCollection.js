import { useSyncExternalStore } from 'react';
import { collectionAt, getContext, pathOf, subscribeContext } from '@/data';

// One live subscription per collection path (+ time window), shared by every component that reads it.
// Updates from any device (or tab) re-render all readers. When nobody has read it for a minute, the
// subscription closes (e.g. an older journal window, or the previous child after switching).
const stores = new Map();
const IDLE_CLOSE_MS = 60_000;

function storeFor(path, since) {
  const key = since ? `${path}|${since}` : path;
  if (stores.has(key)) return stores.get(key);
  const store = { state: { data: [], loading: true, error: null }, listeners: new Set(), unsubscribe: null, closeTimer: null };
  const emit = () => store.listeners.forEach((fn) => fn());
  store.subscribe = (fn) => {
    clearTimeout(store.closeTimer);
    store.listeners.add(fn);
    if (!store.unsubscribe) {
      store.unsubscribe = collectionAt(path).subscribe(
        (data) => { store.state = { data, loading: false, error: null }; emit(); },
        (error) => { console.error(path, error); store.state = { ...store.state, loading: false, error }; emit(); },
        { since },
      );
    }
    return () => {
      store.listeners.delete(fn);
      if (!store.listeners.size) {
        store.closeTimer = setTimeout(() => { store.unsubscribe?.(); stores.delete(key); }, IDLE_CLOSE_MS);
      }
    };
  };
  stores.set(key, store);
  return store;
}

const EMPTY = { state: { data: [], loading: false, error: null }, subscribe: () => () => {} };
const NO_CHILD = { state: { data: [], loading: true, error: null }, subscribe: () => () => {} };

// The current family/child; components re-render when another child is chosen.
export const useDataContext = () => useSyncExternalStore(subscribeContext, getContext);

// `name`: a collection name (C.xxx), placed for the current child/family by the data layer (null → nothing read).
// `since` (ISO, optional): only records from then on (log collections; see data/timeWindow.js).
// `childId`: read another child's collection instead of the current one.
export function useCollection(name, { since, childId } = {}) {
  const ctx = useDataContext();
  const path = name ? pathOf(name, { childId: childId ?? ctx.childId }) : null;
  const store = !name ? EMPTY : path ? storeFor(path, since) : NO_CHILD;
  return useSyncExternalStore(store.subscribe, () => store.state);
}

// A collection by its full path, as is (e.g. the pre-family top-level "settings" during the one-time move).
export function useCollectionAt(path, { since } = {}) {
  const store = path ? storeFor(path, since) : EMPTY;
  return useSyncExternalStore(store.subscribe, () => store.state);
}
