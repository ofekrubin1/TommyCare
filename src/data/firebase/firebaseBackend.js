import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut,
  setPersistence, browserLocalPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection as fsCollection, doc, onSnapshot, addDoc, updateDoc, setDoc, deleteDoc,
} from 'firebase/firestore';
import { firebaseConfig } from '@/config/firebaseConfig';

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

export function collection(name) {
  const col = fsCollection(db, name);
  return {
    subscribe(onData, onError) {
      return onSnapshot(col, (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id }))), onError);
    },
    async add(data) {
      const ref = await addDoc(col, { ...data, created_at: now(), updated_at: now(), created_by: by() });
      return ref.id;
    },
    update(id, data) {
      return updateDoc(doc(col, id), { ...data, updated_at: now() });
    },
    set(id, data) {
      return setDoc(doc(col, id), { ...data, updated_at: now() }, { merge: true });
    },
    remove(id) {
      return deleteDoc(doc(col, id));
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
