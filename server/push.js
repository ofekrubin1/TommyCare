// Web Push with the standard Web Crypto API only (runs on Cloudflare Workers; no Node libraries):
// - VAPID (RFC 8292): a short ES256-signed JWT proves the push comes from us (private key: secret VAPID_PRIVATE_KEY)
// - payload encryption "aes128gcm" (RFC 8291 + RFC 8188): only the subscribed browser can read the message
// The devices are the push_subs saved from Settings → התראות לטלפון; gone ones (404/410) are removed.
import { VAPID_PUBLIC_KEY } from '../src/config/pushConfig.js';

const te = new TextEncoder();
const b64urlToBytes = (s) => {
  const b64 = (s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};
const bytesToB64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
};

// HKDF (extract + expand) → `length` bytes.
async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8));
}

// The VAPID signing key, from the private key (32 bytes) + our public key (65 bytes, uncompressed point).
let signingKey;
function vapidKey(privateKeyB64) {
  if (!signingKey) {
    const pub = b64urlToBytes(VAPID_PUBLIC_KEY);
    signingKey = crypto.subtle.importKey('jwk', {
      kty: 'EC', crv: 'P-256', d: privateKeyB64, x: bytesToB64url(pub.slice(1, 33)), y: bytesToB64url(pub.slice(33, 65)), ext: true,
    }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  }
  return signingKey;
}

async function vapidHeader(endpoint, privateKeyB64, subject) {
  const header = bytesToB64url(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = bytesToB64url(te.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, await vapidKey(privateKeyB64), te.encode(`${header}.${claims}`));
  return `vapid t=${header}.${claims}.${bytesToB64url(sig)}, k=${VAPID_PUBLIC_KEY}`;
}

// RFC 8291: encrypts `payload` for one subscription (its p256dh public key + auth secret).
export async function encryptPayload(payload, p256dh, auth) {
  const uaPublic = b64urlToBytes(p256dh);
  const authSecret = b64urlToBytes(auth);
  const local = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, local.privateKey, 256));

  const ikm = await hkdf(authSecret, ecdhSecret, concat(te.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);

  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const plaintext = concat(te.encode(payload), new Uint8Array([2])); // 0x02 = last (and only) record, no padding
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext));

  const recordSize = new Uint8Array([0, 0, 16, 0]); // 4096, big-endian
  return concat(salt, recordSize, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}

export const pushConfigured = (env) => !!env.VAPID_PRIVATE_KEY;

// Sends one notification to one device. Returns the push service's HTTP status.
export async function pushTo(sub, payload, env) {
  const body = await encryptPayload(JSON.stringify(payload), sub.p256dh, sub.auth);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapidHeader(sub.endpoint, env.VAPID_PRIVATE_KEY, `mailto:${env.GMAIL_USER || 'tommycare@example.com'}`),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(6 * 3600),
      Urgency: 'high',
    },
    body,
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) console.error(`push ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.status;
}

// payload: { title, body, url, tag }. `subs` defaults to every saved device. Returns how many got it.
export async function sendPush(db, payload, subs, env) {
  if (!pushConfigured(env)) throw new Error('Set the VAPID_PRIVATE_KEY secret.');
  const list = subs || await db.list('push_subs');
  const results = await Promise.all(list.map(async (s) => {
    try {
      const status = await pushTo(s, payload, env);
      if (status === 404 || status === 410) await db.remove('push_subs', s.id).catch(() => {});
      return status >= 200 && status < 300;
    } catch (err) {
      console.error(`push to ${s.device || s.id} failed: ${err.message}`);
      return false;
    }
  }));
  return results.filter(Boolean).length;
}
