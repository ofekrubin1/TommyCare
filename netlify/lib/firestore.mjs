// Minimal Firestore REST client for functions. Every call carries a Firebase ID token, so firestore.rules
// apply exactly as in the app (only signed-in family accounts).
import { firebaseConfig } from '../../src/config/firebaseConfig.js';

const KEY = firebaseConfig.apiKey;
const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

function decode(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
  return undefined;
}
const decodeFields = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]));

const encode = (v) => (v === null || v === undefined ? { nullValue: null }
  : typeof v === 'boolean' ? { booleanValue: v }
    : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
      : { stringValue: String(v) });

export function firestore(idToken) {
  const headers = { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' };
  return {
    async list(name) {
      const docs = [];
      let token = '';
      do {
        const res = await fetch(`${BASE}/${name}?pageSize=300${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`, { headers });
        if (!res.ok) throw new Error(`Firestore list ${name}: ${res.status} ${await res.text()}`);
        const body = await res.json();
        for (const d of body.documents || []) docs.push({ ...decodeFields(d.fields || {}), id: d.name.split('/').pop() });
        token = body.nextPageToken || '';
      } while (token);
      return docs;
    },
    // Records of `parent`/`name` whose `field` >= `from` (newest first, up to `limit`). Paths may be nested,
    // e.g. parent "families/main/children/child1", name "feedings".
    async since(parent, name, field, from, { limit } = {}) {
      const structuredQuery = {
        from: [{ collectionId: name }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'GREATER_THAN_OR_EQUAL', value: { stringValue: from } } },
        orderBy: [{ field: { fieldPath: field }, direction: 'DESCENDING' }],
        ...(limit && { limit }),
      };
      const res = await fetch(`${BASE}/${parent}:runQuery`, { method: 'POST', headers, body: JSON.stringify({ structuredQuery }) });
      if (!res.ok) throw new Error(`Firestore query ${parent}/${name}: ${res.status} ${await res.text()}`);
      return (await res.json()).filter((r) => r.document).map(({ document: d }) => ({ ...decodeFields(d.fields || {}), id: d.name.split('/').pop() }));
    },
    async get(name, id) {
      const res = await fetch(`${BASE}/${name}/${id}`, { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Firestore get ${name}/${id}: ${res.status} ${await res.text()}`);
      const d = await res.json();
      return { ...decodeFields(d.fields || {}), id };
    },
    async update(name, id, data) {
      const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
      const res = await fetch(`${BASE}/${name}/${id}?${mask}`, {
        method: 'PATCH', headers, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)])) }),
      });
      if (!res.ok) throw new Error(`Firestore update ${name}/${id}: ${res.status} ${await res.text()}`);
    },
    async remove(name, id) {
      const res = await fetch(`${BASE}/${name}/${id}`, { method: 'DELETE', headers });
      if (!res.ok && res.status !== 404) throw new Error(`Firestore delete ${name}/${id}: ${res.status} ${await res.text()}`);
    },
  };
}

// Signs in the "system" account (env TC_ROBOT_EMAIL / TC_ROBOT_PASSWORD) used by the scheduled email.
export async function robotToken() {
  const email = process.env.TC_ROBOT_EMAIL, password = process.env.TC_ROBOT_PASSWORD;
  if (!email || !password) throw new Error('Set TC_ROBOT_EMAIL and TC_ROBOT_PASSWORD in Netlify environment variables.');
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) throw new Error(`Robot sign-in failed: ${res.status} ${await res.text()}`);
  return (await res.json()).idToken;
}
