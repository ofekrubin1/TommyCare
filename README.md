# TommyCare

Tom's daily log (Hebrew, RTL, mobile-first): feedings, diapers, sleep, notes, shopping, doctor appointments, meds, growth, vaccines, fever, pumping, and a PDF report for the doctor. A day runs **06:00 → 06:00**.

## Run

```
npm install
npm run dev:local   # test environment: sample data in this browser, no login, no Firebase
npm run dev         # real Firebase (needs src/config/firebaseConfig.js + login)
npm run build       # production build → dist/
```

`dev:local` also listens on the local network, so a phone on the same Wi-Fi can open `http://<computer-ip>:5173`. In the test environment, Settings → "טעינת נתוני דוגמה" loads ~5 days of sample data.

## Structure

```
src/
  app/           App (routes, login gate)
  config/        firebaseConfig, appConfig (day start hour, default settings)
  data/          backend selection + collection names
    firebase/    Firestore + Firebase Auth backend
    local/       localStorage backend for the test environment, sample data
  hooks/         useCollection (shared live subscriptions), useBabyData, useSettings, useNow
  lib/           time (06:00 day boundary), summary (daily totals), vaccines (schedule), theme, utils
  components/
    ui/          Card, Button, Sheet (bottom sheet), Field, Choice (segmented, check tiles, chips, switch), RowActions
    layout/      Layout, BottomNav, PageHeader
  features/      one folder per domain: feeding, diapers, sleep, notes, pumping, fever, meds, growth,
                 vaccines, appointments, shopping, summary, timeline (events, quick add, last status),
                 report (doctor PDF), settings, auth
  pages/         Home, Journal, Health, More
```

Both backends expose the same API (`collection(name).subscribe/add/update/set/remove`, `auth.subscribe/signIn/signOut`), chosen by `VITE_BACKEND` (`.env.localdb`).

## Firebase setup (production)

1. Create a Firebase project → **Firestore Database** (production mode) and **Authentication → Email/Password**.
2. Authentication → Settings → **User actions**: turn off "Enable create (sign-up)", so only users you add can log in.
3. Authentication → Users → **Add user** for each family member.
4. Firestore → Rules: paste `firestore.rules` → Publish.
5. Put the web app config in `src/config/firebaseConfig.js`.

## Deploy

Netlify builds from `netlify.toml` (`npm run build`, publish `dist`). Push to `main` only when a change is ready (each push = one Netlify build).
