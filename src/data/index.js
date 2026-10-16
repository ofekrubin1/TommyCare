// The data layer. Every screen reads and writes through here; the backend is Firebase (Auth + Firestore).
//   collection(name) → { subscribe(onData, onError), add(data), update(id, data), set(id, data), remove(id) }
//   auth             → { subscribe(onUser), signIn(email, password), signOut(), getToken() }
export { collection, auth } from './firebase/firebaseBackend.js';

// Collection names, in one place.
export const C = {
  feedings: 'feedings',
  diapers: 'diapers',
  sleeps: 'sleeps',
  notes: 'notes',
  shopping: 'shopping',
  gifts: 'gifts',
  tasks: 'tasks',
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
