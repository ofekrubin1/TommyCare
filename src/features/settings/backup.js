// Full backup (JSON) and restore. A backup holds every child with all their records, the family's shared
// lists and settings, and users' display names. Restore puts records back by their id: missing ones come
// back, existing ones are overwritten with the backup's version, nothing else is deleted.
import { C, CHILD_COLLECTIONS, collectionAt, familyPath, getContext } from '@/data';
import { CHILD_FIELDS } from '@/features/children/children';

const FAMILY_SHARED = [C.shopping, C.gifts, C.tasks, C.settings];
const withoutId = ({ id, ...rest }) => rest; // eslint-disable-line no-unused-vars

export async function buildBackup() {
  const fam = familyPath();
  const all = (path) => collectionAt(path).fetchAll();
  const [familyDoc, children, profiles] = await Promise.all([
    all(C.families).then((f) => f.find((x) => x.id === getContext().familyId) || {}),
    all(`${fam}/${C.children}`),
    all(C.profiles),
  ]);
  const shared = Object.fromEntries(await Promise.all(FAMILY_SHARED.map(async (n) => [n, await all(`${fam}/${n}`)])));
  const kids = await Promise.all(children.map(async (child) => ({
    ...child,
    records: Object.fromEntries(await Promise.all(CHILD_COLLECTIONS.map(async (n) => [n, await all(`${fam}/${C.children}/${child.id}/${n}`)]))),
  })));
  return { app: 'TommyCare', version: 2, exported_at: new Date().toISOString(), family: { ...familyDoc, collections: shared }, children: kids, profiles };
}

// What a backup file holds, for the confirmation screen. Throws a readable error for a file that isn't one.
export function describeBackup(backup) {
  if (backup?.app !== 'TommyCare') throw new Error('זה לא קובץ גיבוי של TommyCare.');
  if (backup.version === 2) {
    const count = (o) => Object.values(o || {}).reduce((s, list) => s + (list?.length || 0), 0);
    return {
      version: 2,
      exportedAt: backup.exported_at,
      children: backup.children.map((c) => ({ name: c.name, records: count(c.records) })),
      shared: count(backup.family?.collections),
    };
  }
  if (backup.collections) {
    const cols = backup.collections;
    return {
      version: 1,
      exportedAt: backup.exported_at,
      children: [{ name: cols.settings?.find((s) => s.id === 'app')?.baby_name || 'הילד/ה הנוכחי/ת', records: CHILD_COLLECTIONS.reduce((s, n) => s + (cols[n]?.length || 0), 0) }],
      shared: [C.shopping, C.gifts, C.tasks].reduce((s, n) => s + (cols[n]?.length || 0), 0),
    };
  }
  throw new Error('קובץ הגיבוי לא מוכר.');
}

const putAll = (path, docs = []) => { const col = collectionAt(path); docs.forEach((d) => col.set(d.id, withoutId(d))); return docs.length; };

// Writes the backup back (owner only; firestore.rules allow restoring records written by other users).
// A backup from before multiple children (version 1) goes into the current child. Returns how many were written.
export function restoreBackup(backup) {
  const fam = familyPath();
  let written = 0;
  if (backup.version === 2) {
    const { collections, ...familyDoc } = backup.family || {};
    if (familyDoc.id) collectionAt(C.families).set(familyDoc.id, withoutId(familyDoc));
    for (const [name, docs] of Object.entries(collections || {})) written += putAll(`${fam}/${name}`, docs);
    for (const { records, ...child } of backup.children || []) {
      collectionAt(`${fam}/${C.children}`).set(child.id, withoutId(child));
      for (const [name, docs] of Object.entries(records || {})) written += putAll(`${fam}/${C.children}/${child.id}/${name}`, docs);
    }
  } else {
    const cols = backup.collections;
    const childId = getContext().childId;
    for (const name of CHILD_COLLECTIONS) written += putAll(`${fam}/${C.children}/${childId}/${name}`, cols[name]);
    for (const name of [C.shopping, C.gifts, C.tasks]) written += putAll(`${fam}/${name}`, cols[name]);
    const app = cols.settings?.find((s) => s.id === 'app') || {};
    const childPatch = Object.fromEntries(Object.entries(CHILD_FIELDS).filter(([k]) => app[k]).map(([k, field]) => [field, app[k]]));
    if (Object.keys(childPatch).length) collectionAt(`${fam}/${C.children}`).set(childId, childPatch);
  }
  // Display names only; permissions (roles) are never restored from a file.
  written += putAll(C.profiles, backup.profiles || backup.collections?.profiles);
  return written;
}
