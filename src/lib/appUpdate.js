// Keeps the installed app current: when the app comes back to the screen (or every 30 minutes while open), it
// checks /version.json; if a newer version was deployed, it reloads. The iPhone home-screen app otherwise keeps
// showing the old version until it's removed and added again.
/* global __APP_BUILD__ */
const CHECK_EVERY_MS = 30 * 60_000;

async function check() {
  if (import.meta.env.DEV) return;
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const { build } = await res.json();
    if (build && build !== __APP_BUILD__) window.location.reload();
  } catch { /* offline: try again later */ }
}

export function keepAppUpdated() {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  setInterval(check, CHECK_EVERY_MS);
  check();
}
