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
npm run check-gmail # verify Gmail credentials locally before putting them in Cloudflare
npm run build       # production build → dist/ (always Firebase; the local backend isn't bundled)
```

## Firebase setup (production)

1. Create a Firebase project → **Firestore Database** (production mode) and **Authentication → Email/Password**.
2. Authentication → Settings → **User actions**: turn off "Enable create (sign-up)", so only users you add can log in.
3. Authentication → Users → **Add user** for each family member.
4. Firestore → Rules: paste `firestore.rules`

## Deploy

The app is on Firebase Hosting (https://tommycare.web.app); its small server functions (`functions/api`) are on
Cloudflare Pages (tommycare.pages.dev), and the every-minute jobs (reminders, feeding alerts, daily email) on a
Cloudflare worker (`workers/cron`). All on free plans.

```
npm run deploy       # build, upload the app (Firebase Hosting) and the functions (Cloudflare Pages)
npm run deploy:cron  # upload the scheduled worker
npm run deploy:rules # publish firestore.rules
```
