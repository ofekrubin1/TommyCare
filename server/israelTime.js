// Israel time on a server that runs in UTC (Cloudflare). The app's day logic (06:00 → 06:00, src/lib/time.js)
// works in the device's local time; here every instant is turned into a Date whose *local* fields show Israel's
// wall clock, so that same logic gives Israeli days whatever the server's time zone.
export const TZ = 'Asia/Jerusalem';

const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

export function israelWall(date = new Date()) {
  const p = Object.fromEntries(parts.formatToParts(new Date(date)).map((x) => [x.type, x.value]));
  return new Date(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
}

// An ISO instant → the same moment as Israeli wall-clock time (ISO, for parseISO in the shared day logic).
export const israelIso = (iso) => (iso ? israelWall(iso).toISOString() : iso);

export const israelHour = (now = new Date()) => israelWall(now).getHours();

const fmt = (opts) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, ...opts });
export const whenText = (iso) => fmt({ day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
export const hmText = (iso) => fmt({ hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
