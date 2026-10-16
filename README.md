# TommyCare

Tom's daily log (Hebrew, RTL, mobile-first): feedings, diapers, sleep, notes, shopping, doctor appointments, meds, growth, vaccines, fever, pumping, and a PDF report for the doctor. A day runs **06:00 → 06:00**.

## Screenshots

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/login.png" width="280" alt="Login screen"><br><sub>Login: greeting by time of day</sub></td>
    <td align="center"><img src="docs/screenshots/home.png" width="280" alt="Home screen"><br><sub>Home: last feeding / diaper / sleep, today's totals, today's log</sub></td>
  </tr>
</table>

## Run

```
npm install
npm run dev:local   # port 5173: local test environment, data only in this browser (no Firebase)
npm run dev         # port 5174: against the real Firebase data (login required)
npm run check-gmail # verify Gmail credentials locally before putting them in Netlify
npm run build       # production build → dist/ (always Firebase; the local backend isn't bundled)
```

Every change is tried on **5173** first. There, any user name and password signs in: `ofek` (owner), `maayan`
(editor), `guest` (view only) or any new name (waiting for approval). Settings → "סביבת בדיקה" loads sample data
(including days older than the 30-day window) or clears everything. Firestore rules don't run locally.
Both dev servers listen on the local network, so a phone on the same Wi-Fi can open `http://<computer-ip>:<port>`.

## Structure

```
src/
  app/           App (routes, login gate; screens other than home load lazily)
  config/        firebaseConfig, appConfig (day start hour, default settings, owner), googleConfig, pushConfig
  data/          data layer: collection names, time window (last 30 days of logs)
    firebase/    Firestore + Firebase Auth backend (production, 5174)
    local/       browser-only backend + sample data (5173)
  hooks/         useCollection (shared live queries), useBabyData, useCanEdit/useRole, useSettings, useNow
  lib/           time (06:00 day), summary, errors (Hebrew messages + toasts), ics, calendar, googleCalendar,
                 push, saveFile, theme, utils
  components/
    forms/       RecordSheet: the shared add/edit form (save, errors, duplicate check)
    ui/          Card, Button, Sheet, Field, Choice, Toaster, CalendarButton, ...
    layout/      Layout, BottomNav, PageHeader, ErrorBoundary
  features/      one folder per domain (feeding, diapers, sleep, appointments, tasks, settings, auth, ...):
                 that domain's forms, lists and logic
  pages/         one file per screen/route: Home, Journal, Health, Shopping, Tasks, More, Pumping, Settings
netlify/
  functions/     daily summary email, task reminders (push / email), .ics files, test email / push
  lib/           Firestore REST client, mailer, push sender
```

- **Data layer** — `collection(name).subscribe(onData, onError, { since }) / fetchAll / add / update / set / remove`
  and `auth.*`; every screen goes through it. Writes return right away (they sync in the background, also
  offline); a write the server rejects shows a Hebrew error toast.
- **Forms** — every add/edit form is a `RecordSheet` with its own fields; the save logic lives in one place.
- **Logs load by window** — feedings, diapers, sleep etc. load the last 30 days; the journal loads older days on
  request; the export reads everything.
- **Permissions** — `owner` (fixed in `appConfig.OWNER_USERNAMES` and `firestore.rules`), `editor`, `viewer`.
  New users are view-only until an owner approves them in Settings → users. `firestore.rules` enforce it.

## Firebase setup (production)

1. Create a Firebase project → **Firestore Database** (production mode) and **Authentication → Email/Password**.
2. Authentication → Settings → **User actions**: turn off "Enable create (sign-up)", so only users you add can log in.
3. Authentication → Users → **Add user** for each family member.
4. Firestore → Rules: paste `firestore.rules` → Publish. The owner's user name is fixed there and in
   `src/config/appConfig.js` (`OWNER_USERNAMES`); keep both the same.
5. Put the web app config in `src/config/firebaseConfig.js`.

## Deploy

Netlify builds from `netlify.toml` (`npm run build`, publish `dist`). Automatic builds are off; deploys are triggered by hand
(Netlify → Deploys → Trigger deploy) once a change has been tried on 5173 and 5174.
