# TommyCare

Tom's daily log (Hebrew, RTL, mobile-first): feedings, diapers, sleep, notes, shopping, doctor appointments, meds, growth, vaccines, fever, pumping, and a PDF report for the doctor. A day runs **06:00 → 06:00**.

## Run

```
npm install
npm run dev         # dev server against the real Firebase (login required)
npm run check-gmail # verify Gmail credentials locally before putting them in Netlify
npm run build       # production build → dist/
```

`npm run dev` also listens on the local network, so a phone on the same Wi-Fi can open `http://<computer-ip>:<port>`.

## Structure

```
src/
  app/           App (routes, login gate)
  config/        firebaseConfig, appConfig (day start hour, default settings)
  data/          data layer (collection names, Firebase backend)
    firebase/    Firestore + Firebase Auth backend
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

The data layer exposes `collection(name).subscribe/add/update/set/remove` and `auth.subscribe/signIn/signOut/getToken`; all screens go through it.

## Firebase setup (production)

1. Create a Firebase project → **Firestore Database** (production mode) and **Authentication → Email/Password**.
2. Authentication → Settings → **User actions**: turn off "Enable create (sign-up)", so only users you add can log in.
3. Authentication → Users → **Add user** for each family member.
4. Firestore → Rules: paste `firestore.rules` → Publish.
5. Put the web app config in `src/config/firebaseConfig.js`.

## Deploy

Netlify builds from `netlify.toml` (`npm run build`, publish `dist`). Push to `main` only when a change is ready (each push = one Netlify build).
