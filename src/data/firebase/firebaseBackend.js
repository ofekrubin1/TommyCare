import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut,
  setPersistence, browserLocalPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection as fsCollection, doc, onSnapshot, updateDoc, setDoc, deleteDoc, getDocs, query, where,
} from 'firebase/firestore';
import { firebaseConfig } from '@/config/firebaseConfig';
import { reportError } from '@/lib/errors';
import { TIME_FIELD } from '../timeWindow';

const app = initializeApp(firebaseConfig);
const fbAuth = getAuth(app);
setPersistence(fbAuth, browserLocalPersistence).catch(() => {});

// Offline cache: the app opens and shows data without signal; writes sync when back online.
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

const now = () => new Date().toISOString();
const by = () => fbAuth.currentUser?.uid ?? null;

// Writes return as soon as they're in the local cache (they sync in the background, also when offline).
// Firestore only resolves a write once the server confirms it, which never happens without signal, so the
// screens don't wait for it; a write the server rejects (e.g. permissions) is reported to the user instead.
const background = (promise, what) => { promise.catch((err) => reportError(err, what)); };
const docs = (snap) => snap.docs.map((d) => ({ ...d.data(), id: d.id }));

// `name` is a full path, e.g. "families/main/children/<id>/feedings".
export function collection(name) {
  const col = fsCollection(db, name);
  const timeField = TIME_FIELD[name.split('/').pop()];
  return {
    // `since` (ISO): only records from then on, by the collection's time field (see timeWindow.js).
    subscribe(onData, onError, { since } = {}) {
      const q = since && timeField ? query(col, where(timeField, '>=', since)) : col;
      return onSnapshot(q, (snap) => onData(docs(snap)), onError);
    },
    // Every record, once (backup export).
    async fetchAll() {
      return docs(await getDocs(col));
    },
    async add(data) {
      const ref = doc(col);
      background(setDoc(ref, { ...data, created_at: now(), updated_at: now(), created_by: by() }), `add ${name}`);
      return ref.id;
    },
    async update(id, data) {
      background(updateDoc(doc(col, id), { ...data, updated_at: now() }), `update ${name}/${id}`);
    },
    async set(id, data) {
      background(setDoc(doc(col, id), { ...data, updated_at: now() }, { merge: true }), `set ${name}/${id}`);
    },
    async remove(id) {
      background(deleteDoc(doc(col, id)), `remove ${name}/${id}`);
    },
  };
}

export const auth = {
  subscribe(onUser) {
    return onAuthStateChanged(fbAuth, (u) => onUser(u ? { uid: u.uid, email: u.email } : null));
  },
  signIn: (email, password) => signInWithEmailAndPassword(fbAuth, email.trim(), password),
  signOut: () => fbSignOut(fbAuth),
  getToken: () => fbAuth.currentUser?.getIdToken() ?? null,
};
