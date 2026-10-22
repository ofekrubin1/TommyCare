// A "day" runs 06:00 → 06:00, so night feedings belong to the evening they started in.
export const DAY_START_HOUR = 6;

export const DEFAULT_SETTINGS = {
  baby_name: 'Tommy',
  birth_date: '',
  default_feeding_type: 'breast',
  feeding_alert_hours: 3,
  summary_email: '',
  summary_enabled: false,
};

// The app owner(s), by login user name. Always full access, manages everyone else's permission; can't be
// removed from the app. Must match isFixedOwner() in firestore.rules (that's what the server enforces).
// Everyone else starts as view-only until an owner gives them "עריכה".
export const OWNER_USERNAMES = ['ofek'];

// The app is served from Firebase Hosting (https://tommycare.web.app); its server functions (/api: .ics for the
// iPhone calendar, test email, test notification) run on Cloudflare. Same-origin elsewhere (Cloudflare, dev).
export const API_ORIGIN = typeof location !== 'undefined' && location.hostname.endsWith('.web.app') ? 'https://tommycare.pages.dev' : '';
