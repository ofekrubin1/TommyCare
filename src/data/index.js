// Picks the data backend once at startup.
//   npm run dev        → Firebase (real data, login)
//   npm run dev:local  → local test environment (data in this browser, no login)
//
// Both backends expose the same shape:
//   collection(name) → { subscribe(onData, onError), add(data), update(id, data), set(id, data), remove(id) }
//   auth             → { subscribe(onUser), signIn(email, password), signOut(), getToken() }
const backend = import.meta.env.VITE_BACKEND === 'local'
  ? await import('./local/localBackend.js')
  : await import('./firebase/firebaseBackend.js');

export const { collection, auth } = backend;
export const isLocalBackend = import.meta.env.VITE_BACKEND === 'local';

// Collection names, in one place.
export const C = {
  feedings: 'feedings',
  diapers: 'diapers',
  sleeps: 'sleeps',
  notes: 'notes',
  shopping: 'shopping',
  gifts: 'gifts',
  appointments: 'appointments',
  meds: 'meds',
  medDoses: 'med_doses',
  growth: 'growth',
  vaccinations: 'vaccinations',
  fever: 'fever',
  pumping: 'pumping',
  settings: 'settings',
  profiles: 'profiles',
};
