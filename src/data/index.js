// The data layer. Every screen reads and writes through here. The backend is chosen at build time (vite.config.js):
//   npm run dev / build → Firebase (Auth + Firestore, real data)
//   npm run dev:local   → local test environment on port 5173 (data in this browser, see local/localBackend.js)
// Both expose the same shape:
//   collection(name) → { subscribe(onData, onError, { since }), fetchAll(), add(data) → id, update(id, data), set(id, data), remove(id) }
//   auth             → { subscribe(onUser), signIn(email, password), signOut(), getToken() }
// Writes return right away (offline-safe); a write that fails later is reported through lib/errors.js.
export { collection, auth } from '@backend';
export const isLocalBackend = import.meta.env.MODE === 'localdb';

// Collection names, in one place.
export const C = {
  feedings: 'feedings',
  diapers: 'diapers',
  sleeps: 'sleeps',
  notes: 'notes',
  shopping: 'shopping',
  gifts: 'gifts',
  tasks: 'tasks',
  pushSubs: 'push_subs',
  appointments: 'appointments',
  meds: 'meds',
  medDoses: 'med_doses',
  growth: 'growth',
  vaccinations: 'vaccinations',
  fever: 'fever',
  pumping: 'pumping',
  settings: 'settings',
  profiles: 'profiles',
  roles: 'roles',
};
