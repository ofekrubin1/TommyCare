// The data layer. Every screen reads and writes through here. The backend is chosen at build time (vite.config.js):
//   npm run dev / build → Firebase (Auth + Firestore, real data)
//   npm run dev:local   → local test environment on port 5173 (data in this browser, see local/localBackend.js)
// Both expose the same shape, addressed by a path ("families/main/children/<id>/feedings"):
//   collectionAt(path) → { subscribe(onData, onError, { since }), fetchAll(), add(data) → id, update(id, data), set(id, data), remove(id) }
//   auth               → { subscribe(onUser), signIn(email, password), signOut(), getToken() }
// Writes return right away (offline-safe); a write that fails later is reported through lib/errors.js.
//
// Screens use collection(C.xxx) and never build paths: the data layer puts each collection where it belongs —
// the current child's records under that child, the family's shared lists under the family, users' own data at the top:
//   families/{family}                         family (one for now: "main")
//   families/{family}/children/{child}        a child (name, birth date, photo, feeding defaults)
//   families/{family}/children/{child}/feedings, diapers, sleeps, pumping, ...   that child's records
//   families/{family}/shopping, gifts, tasks, settings                   shared by the family
//   profiles, roles, push_subs                                           per user
import { collection as at, auth } from '@backend';

export { auth };
export const collectionAt = at;
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
  children: 'children',
  families: 'families',
  profiles: 'profiles',
  roles: 'roles',
};

// Where each collection lives (see the tree above).
export const CHILD_COLLECTIONS = [C.feedings, C.diapers, C.sleeps, C.notes, C.pumping, C.fever, C.medDoses, C.meds, C.growth, C.vaccinations, C.appointments];
export const FAMILY_COLLECTIONS = [C.shopping, C.gifts, C.tasks, C.settings, C.children];

// --- Current family + child (the child is chosen on the home screen and remembered on this device) ---
const CHILD_KEY = 'tommycare:child';
let current = { familyId: 'main', childId: readChild() };
const listeners = new Set();

function readChild() {
  try { return localStorage.getItem(CHILD_KEY) || null; } catch { return null; }
}

export const getContext = () => current;
export function subscribeContext(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function setCurrentChild(childId) {
  if (childId === current.childId) return;
  current = { ...current, childId };
  try { localStorage.setItem(CHILD_KEY, childId); } catch { /* private mode */ }
  listeners.forEach((fn) => fn());
}

export const familyPath = (ctx = current) => `families/${ctx.familyId}`;
export const childPath = (childId = current.childId, ctx = current) => `${familyPath(ctx)}/children/${childId}`;

// The full path of a collection for the current (or a given) child; null while no child is chosen yet.
export function pathOf(name, { childId = current.childId } = {}) {
  if (CHILD_COLLECTIONS.includes(name)) return childId ? `${childPath(childId)}/${name}` : null;
  if (FAMILY_COLLECTIONS.includes(name)) return `${familyPath()}/${name}`;
  return name;
}

// A collection by name, placed by the rules above. `childId` targets another child (e.g. backup, delete a child).
export function collection(name, opts) {
  const path = pathOf(name, opts);
  if (!path) throw new Error(`no child chosen for ${name}`);
  return at(path);
}
