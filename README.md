# WellnessQuest

WellnessQuest is a responsive Vite + React social wellness RPG dashboard with two roles:
- Admin: full client management and analytics
- Client: personal profile, privacy controls, and community browsing

## Setup
1. npm install
2. npm run dev

## Cloudflare Deploy
This project is configured for Cloudflare Pages with SPA routing support.

### One-time setup
1. Create a Cloudflare Pages project named `beyond-app` (or update project name in `wrangler.toml` and scripts).
2. Login locally:
   - `npm run cf:login`

### Local deploy commands
- Build only:
  - `npm run build:cloudflare`
- Deploy production:
  - `npm run deploy:cloudflare`
- Deploy preview branch:
  - `npm run deploy:cloudflare:preview`

### GitHub Actions deploy
Automatic deploy is configured in `.github/workflows/deploy-cloudflare-pages.yml` on pushes to `main`.

Set these GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### SPA routing
`public/_redirects` includes:
- `/* /index.html 200`

This ensures React Router paths load correctly on refresh and direct deep links.

## Admin Login
- username: admin
- password: wellness2024

## Client Login Table

| # | Name | Username | Password |
|---|---|---|---|
| 1 | Lance Damien Talja | lancet | talja123 |
| 2 | Lizel Sajulga | lizels | sajulga123 |
| 3 | Lawrence Babanto | lawrenceb | babanto123 |
| 4 | Bryan Maandig | bryanm | maandig123 |
| 5 | Mhar Basa | mharb | basa123 |
| 6 | Keigh Cacho | keighc | cacho123 |
| 7 | Richard Badlisan | richardb | badlisan123 |
| 8 | Bernegy Navales | bernegyn | navales123 |
| 9 | Anna Lim | annal | lim123 |
| 10 | Karl Recentes | karlr | recentes123 |
| 11 | Judith | judithj | judith123 |
| 12 | Pete Waga Jr. | petej | jr123 |
| 13 | Julie Ann Daclag | julied | daclag123 |
| 14 | Ruben Abucayon | rubena | abucayon123 |
| 15 | Kate Velez | katev | velez123 |
| 16 | Apryl Rose Dumanon | apryld | dumanon123 |
| 17 | Rechnel Wabe | rechnelw | wabe123 |
| 18 | Ana Manubay (Analyln Manubay) | anam | manubay123 |
| 19 | Marygrace Gerali | marygraceg | gerali123 |
| 20 | Kent Oyong | kento | oyong123 |
| 21 | Mariel Oyong | marielo | oyong123 |
| 22 | Reymond Abanilla | reymonda | abanilla123 |
| 23 | Princess Mary Edjulie Pocong | princessp | pocong123 |
| 24 | Jem Icong | jemi | icong123 |
| 25 | Joan Therese A. Guitarte | joang | guitarte123 |
| 26 | Erica Chong | ericac | chong123 |
| 27 | Erica Chiong | ericac2 | chiong123 |
| 28 | Chezter Coquilla | chezterc | coquilla123 |
| 29 | Charmaine David | charmained | david123 |
| 30 | Paolo Olaer | paoloo | olaer123 |
| 31 | Amie Olaer | amieo | olaer123 |
| 32 | Resiel Benitez | resielb | benitez123 |
| 33 | Jonathan Verzosa | jonathanv | verzosa123 |
| 34 | Verna Solar | vernas | solar123 |
| 35 | Richelyn Mondano Tinoy | richelynt | tinoy123 |
| 36 | Ranulfo Acain | ranulfoa | acain123 |
| 37 | Recel Acain | recela | acain123 |
| 38 | Hermisa Flores | hermisaf | flores123 |
| 39 | John Nino Muyco | johnm | muyco123 |
| 40 | Angela Quinto | angelaq | quinto123 |
| 41 | Sarah | sarahs | sarah123 |
| 42 | Jean Gabot | jeang | gabot123 |
| 43 | Vlad Buenavista | vladb | buenavista123 |
| 44 | Xyzart Miguel Pestillos | xyzartp | pestillos123 |
| 45 | Jennilyn Pestillos | jennilynp | pestillos123 |
| 46 | Pamela Pajente | pamelap | pajente123 |
| 47 | Jamila Umpa | jamilau | umpa123 |
| 48 | Lucien Chua | lucienc | chua123 |
| 49 | Divina Oberes | divinao | oberes123 |
| 50 | Juan Mutya | juanm | mutya123 |
| 51 | Sittie Gamo | sittieg | gamo123 |
| 52 | Jenny Michaela C. Ensencio | jennye | ensencio123 |
| 53 | Ariel Cabatbat | arielc | cabatbat123 |
| 54 | Rhoda Cabatbat | rhodac | cabatbat123 |
| 55 | Ryje Gambuta | ryjeg | gambuta123 |
| 56 | Kimverly Maestrado | kimverlym | maestrado123 |
| 57 | Kathlyn Maestrado | kathlynm | maestrado123 |
| 58 | Jemimah Kisha Daaca | jemimahd | daaca123 |
| 59 | Mary Jane Lumain | maryl | lumain123 |
| 60 | Jobelle Jade Tuya | jobellet | tuya123 |
| 61 | Nathan de Guia | nathang | guia123 |
| 62 | Arlen Ebo | arlene | ebo123 |
| 63 | Dexter Ebo | dextere | ebo123 |
| 64 | Bryan Sandaga | bryans | sandaga123 |
| 65 | Sam Claret | samc | claret123 |
| 66 | Kirk Chavez | kirkc | chavez123 |
| 67 | Michelle Jose (Mitch Jose) | michellej | jose123 |

## Feature Walkthrough
- /login: username/password login with a collapsible seed credentials panel and copy actions.
- /admin/dashboard: admin overview cards, searchable/filterable table, top-progress sidebar, and BMI distribution donut.
- /admin/client/:clientId: full client detail with RPG card, achievements, computed metrics, and tabbed analytics.
- /client/home: client-only profile home with privacy toggle and complete stats/charts/timeline.
- /community: leaderboard plus public profile grid with search/filter by gender/class/achievement.
- /community/profile/:clientId: profile detail view that honors privacy rules (admin/owner override).

## Data Notes
- Client records are seeded in src/data/clients.js with all 67 clients listed in the prompt.
- Measurements are stored as session arrays (ISO date strings and body-composition metrics).
- Gender values (Male/Female/M/F/null) are normalized during computations.
- Percent values in source data (fat_pct and water_pct) are already percent-form and are not multiplied again.
- Computed utilities live in src/data/formulas.js and include:
  - height conversion
  - BMI + classification (Asia-Pacific)
  - DBW (Asia-Pacific method)
  - protein range from DBW
  - overall fat lbs
- Additional derived RPG metrics (class, level, achievements, cumulative progress) are in src/data/clientMetrics.js.

## Privacy Model
- localStorage key: wellness_privacy
- shape: { [clientSheet]: boolean }
- default: all true (public)
- admin can always view all profiles
- client can toggle only own profile visibility

## Local Storage Keys
- wellness_users: seeded user list (1 admin + 67 clients)
- wellness_auth: persisted auth session
- wellness_privacy: privacy map per client

## Changelog
### 1.0.0 - 2026-05-01
Prompt context: Built a full social wellness RPG web app from scratch using Vite + React with local-only data and role-based flows.

Concrete changes:
- Implemented protected routing for admin/client/community experiences.
- Added Zustand store with localStorage seeding, auth persistence, and privacy controls.
- Seeded full client roster and generated all client demo accounts.
- Built RPG-themed UI system (character cards, stat bars, rings, achievements, leaderboard visuals).
- Added Recharts analytics suite (weight, fat/muscle, fat loss, RMR, metabolic age, radar).
- Added responsive shell with sidebar and mobile bottom navigation.
- Added full README including all client credentials and app behavior notes.
