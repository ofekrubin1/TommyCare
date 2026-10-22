// Push notifications on this device. iPhone: only from the home-screen app (Share → Add to Home Screen),
// iOS 16.4+, over https. The subscription is saved in Firestore (push_subs) so the server can send to it.
import { C, collection } from '@/data';
import { VAPID_PUBLIC_KEY } from '@/config/pushConfig';

export const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
export const isStandalone = () => !!(navigator.standalone || window.matchMedia?.('(display-mode: standalone)').matches);

// 'ok' | 'ios-home-screen' (iPhone in Safari: install first) | 'insecure' (http dev server) | 'unsupported'
export function pushSupport() {
  if (!window.isSecureContext) return 'insecure';
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) return 'ok';
  if (isIos() && !isStandalone()) return 'ios-home-screen';
  return 'unsupported';
}

export function registerServiceWorker() {
  if (window.isSecureContext && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('sw', err));
}

function keyBytes(base64url) {
  const b64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function docId(endpoint) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(hash)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function deviceName() {
  const ua = navigator.userAgent;
  return /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'מכשיר';
}

export async function currentSubscription() {
  if (pushSupport() !== 'ok') return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) || null;
}

// Asks permission (call from a tap), subscribes and saves this device. Returns the Notification permission.
export async function enablePush(user) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) });
  await saveSubscription(sub, user);
  return permission;
}

// The device's subscription, with the app address it belongs to (the server only notifies the current app's
// devices — not ones left over from an old address or a removed home-screen app).
async function saveSubscription(sub, user) {
  const { endpoint, keys } = sub.toJSON();
  await collection(C.pushSubs).set(await docId(endpoint), {
    endpoint, p256dh: keys.p256dh, auth: keys.auth, uid: user.uid, device: deviceName(), origin: window.location.origin, last_seen: new Date().toISOString(),
  });
}

// On every app start: refresh this device's subscription (if notifications are on here).
export async function touchThisDevice(user) {
  const sub = await currentSubscription().catch(() => null);
  if (sub && user) await saveSubscription(sub, user);
}

// This device's saved subscription id (null when notifications are off here).
export async function thisDeviceId() {
  const sub = await currentSubscription();
  return sub ? docId(sub.endpoint) : null;
}

// Per-device choices, e.g. { feeding_alerts: false } = no "X hours since feeding" alerts on this phone.
export const setDeviceOptions = (id, patch) => collection(C.pushSubs).set(id, patch);

export async function disablePush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await collection(C.pushSubs).remove(await docId(sub.endpoint));
  await sub.unsubscribe();
}
