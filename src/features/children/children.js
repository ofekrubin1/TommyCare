// Children: each has their own records (pumping too: the milk is for that baby); the family shares shopping, gifts and tasks.
import { C, CHILD_COLLECTIONS, childPath, collectionAt, familyPath, getContext } from '@/data';

// A child's own settings, and the older "settings" keys they replace (screens still read settings.baby_name etc.).
export const CHILD_FIELDS = {
  baby_name: 'name',
  birth_date: 'birth_date',
  baby_photo: 'photo',
  default_feeding_type: 'default_feeding_type',
  feeding_alert_hours: 'feeding_alert_hours',
};

export const childAsSettings = (child) => Object.fromEntries(
  Object.entries(CHILD_FIELDS).filter(([, field]) => child?.[field] !== undefined && child?.[field] !== '').map(([key, field]) => [key, child[field]]),
);

// Splits a settings patch into the child's part (→ the child document) and the family's part (→ family settings).
export function splitSettings(patch) {
  const child = {}, family = {};
  for (const [k, v] of Object.entries(patch)) {
    if (CHILD_FIELDS[k]) child[CHILD_FIELDS[k]] = v; else family[k] = v;
  }
  return { child, family };
}

export const sortChildren = (list) => [...list].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.birth_date || '').localeCompare(b.birth_date || ''));

// Deletes a child and every record of theirs (owner only, after a confirmation).
export async function deleteChild(childId) {
  for (const name of CHILD_COLLECTIONS) {
    const col = collectionAt(`${childPath(childId)}/${name}`);
    for (const r of await col.fetchAll()) col.remove(r.id);
  }
  collectionAt(`${familyPath()}/${C.children}`).remove(childId);
}

// One-time move from the single-child layout (all collections at the top level) to the family layout.
// Copies (doesn't delete) every record, keeping its id and author; the top-level data stays as a backup.
// Idempotent: the child id is fixed, so running it twice writes the same documents again.
export const FIRST_CHILD_ID = 'child1';
const FAMILY_SHARED = [C.shopping, C.gifts, C.tasks];
const FAMILY_SETTING_KEYS = ['summary_emails', 'summary_email', 'summary_enabled', 'last_summary_date', 'roles_v2'];
const withoutId = ({ id, ...rest }) => rest; // eslint-disable-line no-unused-vars

export async function migrateToFamily() {
  const { familyId } = getContext();
  const family = `families/${familyId}`;
  const legacy = (name) => collectionAt(name).fetchAll();
  const app = (await legacy(C.settings)).find((s) => s.id === 'app') || {};

  collectionAt(`${family}/${C.children}`).set(FIRST_CHILD_ID, {
    name: app.baby_name || 'Tommy', birth_date: app.birth_date || '', photo: app.baby_photo || '',
    default_feeding_type: app.default_feeding_type || 'breast', feeding_alert_hours: Number(app.feeding_alert_hours) || 3, order: 1,
  });
  for (const name of CHILD_COLLECTIONS) {
    const target = collectionAt(`${family}/${C.children}/${FIRST_CHILD_ID}/${name}`);
    for (const r of await legacy(name)) target.set(r.id, withoutId(r));
  }
  for (const name of FAMILY_SHARED) {
    const target = collectionAt(`${family}/${name}`);
    for (const r of await legacy(name)) {
      // tasks: mark reminders still to send, for the server's every-minute check
      const pending = name === C.tasks && r.remind_at && !r.reminded_at && !r.done ? { remind_pending: true } : {};
      target.set(r.id, { ...withoutId(r), ...pending });
    }
  }
  const familySettings = Object.fromEntries(FAMILY_SETTING_KEYS.filter((k) => app[k] !== undefined).map((k) => [k, app[k]]));
  collectionAt(`${family}/${C.settings}`).set('app', familySettings);
  // Written last: marks the move as done (writes are sent in order).
  collectionAt(C.families).set(familyId, { name: 'המשפחה', migrated_from_v1: true });
  return FIRST_CHILD_ID;
}
