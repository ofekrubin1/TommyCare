// One place for errors the user should know about: failed saves, crashes, rejected promises.
// reportError() → every subscriber (the <Toaster>) shows it in Hebrew.
const listeners = new Set();

const MESSAGES = {
  'permission-denied': 'אין הרשאה לשינוי הזה (מצב צפייה?).',
  unauthenticated: 'צריך להתחבר מחדש.',
  unavailable: 'אין חיבור לשרת. השינוי נשמר במכשיר ויסונכרן כשתחזור הקליטה.',
  'resource-exhausted': 'יותר מדי פעולות ברגע. נסו שוב בעוד רגע.',
  'invalid-argument': 'הנתונים לא תקינים ולא נשמרו.',
};

export function errorMessage(err) {
  const code = String(err?.code || '').replace(/^firestore\//, '');
  return MESSAGES[code] || 'משהו השתבש. נסו שוב.';
}

export function reportError(err, context = '') {
  console.error(context || 'error', err);
  const message = errorMessage(err);
  listeners.forEach((fn) => fn({ id: `${Date.now()}-${Math.random()}`, message }));
}

export function onError(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Anything that slips through (a promise nobody awaited) still reaches the user.
export function catchUnhandled() {
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'unhandled'));
}
