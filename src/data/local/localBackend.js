// Test environment backend: same API as Firebase, data in this browser's localStorage, no login.
const KEY = 'tommycare:local-db';
const listeners = new Map(); // collection name → Set<() => void>

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const now = () => new Date().toISOString();
const newId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
const notify = (name) => queueMicrotask(() => listeners.get(name)?.forEach((fn) => fn()));

// Other tabs on the same machine stay in sync too.
window.addEventListener('storage', (e) => { if (e.key === KEY) listeners.forEach((set) => set.forEach((fn) => fn())); });

function mutate(name, fn) {
  const db = read();
  db[name] = db[name] || {};
  fn(db[name]);
  write(db);
  notify(name);
}

export const LOCAL_USER = { uid: 'local-test-user', email: 'test@local' };

export function collection(name) {
  const list = () => Object.entries(read()[name] || {}).map(([id, v]) => ({ ...v, id }));
  return {
    subscribe(onData) {
      const fn = () => onData(list());
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
      queueMicrotask(fn);
      return () => listeners.get(name).delete(fn);
    },
    async add(data) {
      const id = newId();
      mutate(name, (c) => { c[id] = { ...data, created_at: now(), updated_at: now(), created_by: LOCAL_USER.uid }; });
      return id;
    },
    async update(id, data) { mutate(name, (c) => { c[id] = { ...c[id], ...data, updated_at: now() }; }); },
    async set(id, data) { mutate(name, (c) => { c[id] = { ...(c[id] || {}), ...data, updated_at: now() }; }); },
    async remove(id) { mutate(name, (c) => { delete c[id]; }); },
  };
}

export const auth = {
  subscribe(onUser) { queueMicrotask(() => onUser(LOCAL_USER)); return () => {}; },
  async signIn() {},
  async signOut() {},
  async getToken() { return null; },
};

// Replaces all local data (used by the "load sample data" button in the test environment).
export function replaceAll(data) {
  write(data);
  listeners.forEach((set) => set.forEach((fn) => fn()));
}
