// Local test environment (npm run dev:local → port 5173): same API as the Firebase backend, data in this
// browser's localStorage. Login: any user name, any password (so permissions can be tried as ofek / maayan /
// guest). Firestore rules don't run here: the screens hide what a role can't do, the real rules aren't tested.
import { TIME_FIELD } from '../timeWindow';

const KEY = 'tommycare:local-db';
const USER_KEY = 'tommycare:local-user';
const listeners = new Map(); // collection name → Set<() => void>
const authListeners = new Set();

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const now = () => new Date().toISOString();
const newId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
const notify = (name) => queueMicrotask(() => listeners.get(name)?.forEach((fn) => fn()));
const notifyAll = () => listeners.forEach((set) => set.forEach((fn) => fn()));

export const localUid = (username) => `local-${username}`;
const currentUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };

// Other tabs on the same machine stay in sync too.
window.addEventListener('storage', (e) => {
  if (e.key === KEY) notifyAll();
  if (e.key === USER_KEY) authListeners.forEach((fn) => fn(currentUser()));
});

function mutate(name, fn) {
  const db = read();
  db[name] = db[name] || {};
  fn(db[name]);
  write(db);
  notify(name);
}

const list = (name) => Object.entries(read()[name] || {}).map(([id, v]) => ({ ...v, id }));

// `name` is a full path, e.g. "families/main/children/<id>/feedings" (stored under that key).
export function collection(name) {
  return {
    subscribe(onData, onError, { since } = {}) {
      const field = since && TIME_FIELD[name.split('/').pop()];
      const fn = () => onData(field ? list(name).filter((r) => r[field] >= since) : list(name));
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
      queueMicrotask(fn);
      return () => listeners.get(name).delete(fn);
    },
    async fetchAll() { return list(name); },
    async add(data) {
      const id = newId();
      mutate(name, (c) => { c[id] = { ...data, created_at: now(), updated_at: now(), created_by: currentUser()?.uid ?? null }; });
      return id;
    },
    async update(id, data) { mutate(name, (c) => { c[id] = { ...c[id], ...data, updated_at: now() }; }); },
    async set(id, data) { mutate(name, (c) => { c[id] = { ...(c[id] || {}), ...data, updated_at: now() }; }); },
    async remove(id) { mutate(name, (c) => { delete c[id]; }); },
  };
}

export const auth = {
  subscribe(onUser) {
    authListeners.add(onUser);
    queueMicrotask(() => onUser(currentUser()));
    return () => authListeners.delete(onUser);
  },
  async signIn(email) {
    const user = { uid: localUid(email.split('@')[0]), email };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    authListeners.forEach((fn) => fn(user));
  },
  async signOut() {
    localStorage.removeItem(USER_KEY);
    authListeners.forEach((fn) => fn(null));
  },
  async getToken() { return null; },
};

// Replaces all local data (Settings → "סביבת בדיקה": load sample data / clear).
export function replaceAll(data) {
  write(data);
  notifyAll();
}
