import { useSyncExternalStore } from 'react';
import { collection } from '@/data';

// One live subscription per collection, shared by every component that reads it.
// Updates from any device (or tab) re-render all readers.
const stores = new Map();

function storeFor(name) {
  if (stores.has(name)) return stores.get(name);
  const store = { state: { data: [], loading: true, error: null }, listeners: new Set(), unsubscribe: null };
  const emit = () => store.listeners.forEach((fn) => fn());
  store.subscribe = (fn) => {
    store.listeners.add(fn);
    if (!store.unsubscribe) {
      store.unsubscribe = collection(name).subscribe(
        (data) => { store.state = { data, loading: false, error: null }; emit(); },
        (error) => { console.error(name, error); store.state = { ...store.state, loading: false, error }; emit(); },
      );
    }
    return () => store.listeners.delete(fn);
  };
  stores.set(name, store);
  return store;
}

export function useCollection(name) {
  const store = storeFor(name);
  return useSyncExternalStore(store.subscribe, () => store.state);
}

