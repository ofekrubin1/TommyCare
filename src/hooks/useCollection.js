import { useSyncExternalStore } from 'react';
import { collection } from '@/data';

// One live subscription per collection (+ time window), shared by every component that reads it.
// Updates from any device (or tab) re-render all readers. When nobody has read it for a minute, the
// subscription closes (e.g. an older journal window you scrolled away from).
const stores = new Map();
const IDLE_CLOSE_MS = 60_000;

function storeFor(name, since) {
  const key = since ? `${name}|${since}` : name;
  if (stores.has(key)) return stores.get(key);
  const store = { state: { data: [], loading: true, error: null }, listeners: new Set(), unsubscribe: null, closeTimer: null };
  const emit = () => store.listeners.forEach((fn) => fn());
  store.subscribe = (fn) => {
    clearTimeout(store.closeTimer);
    store.listeners.add(fn);
    if (!store.unsubscribe) {
      store.unsubscribe = collection(name).subscribe(
        (data) => { store.state = { data, loading: false, error: null }; emit(); },
        (error) => { console.error(name, error); store.state = { ...store.state, loading: false, error }; emit(); },
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

// `since` (ISO, optional): only records from then on (log collections; see data/timeWindow.js).
// `name` null → nothing is read (for components that only sometimes need a collection).
export function useCollection(name, { since } = {}) {
  const store = name ? storeFor(name, since) : EMPTY;
  return useSyncExternalStore(store.subscribe, () => store.state);
}
