# Changelog

All notable changes to this project will be documented in this file.

## [1.4.8] - 2026-05-02

### Changed
- Updated `wrangler.toml` project name to `beyond` (`name = 'beyond'`) to match Cloudflare naming expectations
- Aligned Cloudflare deploy scripts in `package.json` to target `--project-name beyond` for both production and preview deploy commands

## [1.4.7] - 2026-05-02

### Changed
- Added Cloudflare Pages deployment setup including local build/deploy scripts in `package.json` (`build:cloudflare`, `cf:login`, `deploy:cloudflare`, `deploy:cloudflare:preview`)
- Added Wrangler configuration via `wrangler.toml` with `pages_build_output_dir = "./dist"` for static output deployment
- Added SPA fallback routing for React Router on Cloudflare Pages using `public/_redirects` (`/* /index.html 200`)
- Added GitHub Actions workflow at `.github/workflows/deploy-cloudflare-pages.yml` to build and deploy to Cloudflare Pages on `main` pushes using repository secrets
- Updated README with Cloudflare setup, required secrets, and deploy command usage

## [1.4.6] - 2026-05-02

### Changed
- Updated onboarding Step 1 basic client information form to remove manual `height` and `age` inputs, add `birthdate` and `contact number`, and auto-compute age from birthdate
- Refreshed onboarding Step 2 to match the provided Wellness Evaluation structure with a 19-item personal questionnaire (`yes/no`), cravings follow-up field, and dedicated medical history section
- Updated Step 3 body composition inputs with a unit toggle (`Input in lbs` or `Input in kgs`) so admins can encode values in either system with automatic conversion
- Added new `Manage Client` mode in Admin Settings for existing clients, including update of basic details and full remove-client action
- Extended store actions to support existing client maintenance: `updateClientInfo` and `removeClient`, including related auth/privacy cleanup when removing a client
- Kept JSON sync workflow by exporting an updated client snapshot after onboarding, assessment updates, client edits, and client removals so admins can replace source client data

## [1.4.5] - 2026-05-01

### Changed
- Added a new admin-only settings workflow in stepper format for client onboarding at `/admin/settings`, with 4 guided steps: basic client information, lifestyle assessment (yes/no), evaluation form, and save
- Added existing-client admin assessment update flow in the same settings page that allows only evaluation updates with date/time and appends a new measurement record to the selected client profile
- Added weight conversion behavior in the evaluation form so lbs and kg are always paired and synchronized; added computed fat mass display in lbs and kg beside fat percentage
- Extended app store persistence to include clients in local storage (`wellness_clients`) and added actions to create onboarded clients, append assessments, and keep privacy map aligned for newly onboarded members
- Implemented automatic temporary client login generation (username/password) during onboarding and persisted credentials to `wellness_users`
- Added JSON snapshot export behavior after each onboarding/assessment save so admins can download updated client data and replace source `client_stats.json` as a practical frontend-only alternative to direct file append
- Added admin sidebar navigation entry for `Settings` and route wiring for `/admin/settings`

## [1.4.4] - 2026-05-01

### Changed
- Updated app branding label from `VitalTrack Community Wellness Platform` / `Beyond:Plus` variants to unified `Beyond+` across shell header, sidebar brand block, login hero, and document title
- Fixed login brand header duplication by keeping a single canonical `Beyond+` heading and supporting label
- Replaced favicon with a custom dark tile and gradient green lightning mark (`public/favicon.svg`) for the new Beyond+ identity

## [1.4.3] - 2026-05-01

### Changed
- Hid visceral fat score visibility from leaderboard cards (Admin Top 5 and Community Top Performers) so visceral values are no longer displayed on generic cards
- Kept visceral fat visibility focused on profile contexts and enhanced Progress Reports with a dedicated `Visceral Fat Progress and Category Guidance` chart section
- Added category guidance presentation in Progress Reports based on visceral fat category mapping (`Standard`, `High`, `Very High`) with guidance text
- Renamed app branding text from `VitalTrack` to `Beyond:Plus` in shell header, sidebar brand title, and login page heading

## [1.4.2] - 2026-05-01

### Changed
- Added unified visceral fat severity logic and guidance mapping in shared metrics utilities:
  - `<= 9`: `Standard` — "Continue monitoring your rating within healthy range through appropriate exercise and balanced diet."
  - `10-14`: `High` — "Consider changing diet and/or increasing exercise to reduce the fat to standard level."
  - `>= 15`: `Very High` — "Should engage in more intensive exercise and make changes to current diet. Consult your physician for medical diagnosis."
- Leaderboard emphasis:
  - Admin dashboard Top 5 cards now show visceral fat value and severity badge per member
  - Community Top Performers leaderboard cards now show visceral fat value and severity badge
- Report and projection emphasis:
  - Health Computations tab now includes a dedicated visceral fat report emphasis card with severity badge and full guidance text
  - Projection tab now includes a visceral fat emphasis panel comparing current vs selected projection day severity with guidance text

## [1.4.1] - 2026-05-01

### Changed
- Moved the 180-day projection report from standalone admin route into each member profile report flow as an individual tab in `ClientStatsTabs` (after `Health Computations`)
- Added projection date-range filter controls in profile projections with enforced limits: minimum 60 days (2 months), maximum 180 days (6 months), step 30 days
- Updated projection engine to support configurable duration windows while preserving Month 3 / Month 6 checkpoints and consistency formula (`overall_fat_lbs = weight_lbs x fat_pct`)
- Community member profile cards: fixed score ring value text to white for dark-mode readability
- Updated wellness tier rounded label tags to dark-mode palette variants
- Improved lbs conversion consistency by applying lbs+kg display in additional dashboard/community/comparison contexts
- Admin dashboard: switched Top 5 section from row-style entries to horizontal card columns
- Admin member overview KPI cards now use varied dark backgrounds for stronger card separation
- Removed obsolete standalone `/admin/projections` route and sidebar navigation item

## [1.4.0] - 2026-05-01

### Changed
- Added a full 180-day projection engine for each client covering Weight (lbs), Fat%, and Visceral Fat with metric-specific logic:
  - Weight projection uses EMA-based trajectory and DBW constraint using sex-specific formulas (`height_m^2 x 22` men, `height_m^2 x 20.8` women), including 50% loss-rate reduction when current weight is within 5% of DBW
  - Fat% projection uses trend-based decline with biological floors (8% men, 18% women)
  - Visceral Fat projection uses step reduction logic (0.5 drop per 5 lbs projected loss) with floor at 1.0
- Implemented normalized program timelines via `days_in_program` for all measurements and cohort-standard fallback rates for clients with only one measurement, derived from clients with 3+ measurements
- Added overall fat consistency tracking (`overall_fat_lbs = weight_lbs x fat_pct`) through the 6-month timeline and cohort-level totals for projected weight loss and fat-lbs loss
- Added safety flags for unhealthy projections where Fat% decreases while projected muscle mass declines by more than 2% monthly
- Added new Admin page `180-Day Projection Report` at `/admin/projections` with per-client charts, Month 3/Month 6 checkpoints, cohort summary cards, and safety review section
- Added `Projections` navigation item for admins in the sidebar

## [1.3.1] - 2026-05-01

### Changed
- Client dashboard (mobile-only): replaced text tab labels with icon-only tab controls for `Current Metrics`, `Progress Reports`, `Assessment History`, and `Health Computations`; desktop/tablet tabs remain labeled
- Community page (mobile-only): changed member list from grid cards to full-width row cards; retained compact grid presentation for `sm` and larger breakpoints

## [1.3.0] - 2026-05-01

### Changed
- Rolled out a global premium dark design system: near-black app background (`#0f0f0f`), dark card surfaces (`#1a1a1a`), lighter text hierarchy, and 20px rounded card panels
- Updated accent language to bright green (`#4ade80`) and remapped active/interactive blue utility states to green-themed variants for a futuristic clinical-dark UI mood
- Standardized typography direction to Inter/SF Pro style across display and body font stacks, with bolder heading treatment
- Forced default dark mode initialization at app startup and updated chart theme colors/tooltips for dark readability
- Added global Tailwind utility remaps in CSS so existing pages inherit the dark style consistently on web and mobile layouts

## [1.2.9] - 2026-05-01

### Changed
- Standardized Body Weight displays to include kg conversion alongside lbs in comparison panel, current metrics card, and assessment history timeline
- Standardized height displays to use feet-inches formatting in profile summary and comparison footer context
- Session timeline weight deltas now include lbs and kg conversion text for consistency with current profile metrics

## [1.2.8] - 2026-05-01

### Changed
- Community member gallery cards: physique score ring moved to upper-right corner of the card header, aligned alongside avatar and name
- ProgressRing: added `textSize` prop (SVG fontSize attribute) to allow per-use font scaling; member gallery cards use larger score text (28 SVG units)

## [1.2.7] - 2026-05-01

### Changed
- Community page: Top Performers grid now shows 5 cards per row (responsive 2→3→5); fat reduction value displayed in larger bold font with unit label; member height shown in feet-inches below the tier badge
- Community page: Member gallery switched to compact 5-column grid (2→3→4→5 responsive); reduced padding, avatar, and font sizes; ProgressRing scaled down to 56px; milestones capped at 2 chips
- ProgressRing component: added `size` prop (default 108) to allow flexible rendering at different sizes

## [1.2.6] - 2026-05-01

### Changed
- Community page: Top Performers section redesigned as a horizontal single-row of compact avatar cards with overflow scroll
- Community page: Member directory switched from row list to gallery grid (1 → 2 → 3 columns responsive), each card shows avatar, tier, stats, milestones, physique ring, and View Profile link

## [1.2.5] - 2026-05-01

### Changed
- Combined `Top 5 by Overall Fat Reduction` and `BMI Classification Breakdown` into a single two-column card on the Admin Member Overview dashboard, positioned between the KPI row and the member table
- Member table is now full-width (no aside column)

## [1.2.4] - 2026-05-01

### Changed
- Updated the Admin Dashboard layout so the `Top 5 by Overall Fat Reduction` section now appears between the KPI overview cards and the member table
- Kept the BMI classification panel in the sidebar beside the member table for a cleaner dashboard hierarchy

## [1.2.3] - 2026-05-01

### Changed
- Reverted the profile comparison mode toggle and restored the simpler latest-assessment-only comparison workflow
- Retained the requested row-based layout for Overview page member cards and Top Performers entries

## [1.2.2] - 2026-05-01

### Changed
- Added compare-mode toggle in member profile comparison panels:
  - `Latest Assessment`
  - `Baseline to Latest Delta`
- Comparison tables now support progress-delta review for weight, body fat, lean mass, visceral fat, RMR, and metabolic age
- Updated Community page card layouts from stacked column presentation to row-oriented layouts for better scanability:
  - Top Performers entries now render as horizontal summary rows
  - Member overview cards now use a row-based layout with profile details on the left and physique summary/actions on the right

## [1.2.1] - 2026-05-01

### Changed
- Fixed Admin Dashboard sidebar summary cards:
  - Top 5 card now ranks only members with positive overall fat reduction and shows a professional empty state if no qualifying records
  - BMI classification card now has improved tooltip labels and an inline legend with category counts
- Updated member table unit formatting:
  - Latest Weight now displays `lbs / kg`
  - Height now normalizes to feet-inches display with cm conversion where possible
- Added profile **Compare Member** feature on profile views with searchable member selection and side-by-side metric comparison
  - Applied to admin member detail, member overview, and community profile views
- Updated Community profile cards layout:
  - Moved `Assessments` and `Enrolled Since` to display under member name and above Program Stage

## [1.2.0] - 2026-05-01

### Changed
- Applied full **Corporate Wellness Design System** across admin, member, community, and login experiences
- Introduced structured light-theme tokens and card system using prompt-specified palette (`--bg-base`, `--brand-primary`, `--accent-green`, etc.)
- Updated app typography to Google Fonts: **DM Sans** (display), **Inter** (body), **IBM Plex Mono** (data)
- Replaced RPG semantics with clinical/professional language: **Wellness Tier**, **Program Stage**, **Body Composition Report**, **Profile Visibility**, **Top Performers**, etc.
- Implemented new computed logic: Wellness Tier by physique score, Program Stage by assessment count, cumulative fat reduction, and milestone unlock rules
- Reworked Admin Dashboard with KPI panel, searchable/sortable member table, filter tabs, top-5 reduction summary, and BMI donut breakdown
- Updated routes and navigation to prompt specification:
  - `/admin/member/:clientId`
  - `/member/overview`
  - preserved legacy route redirects for compatibility
- Refreshed top bar branding to **VitalTrack** with Lucide `Activity` icon and standardized sign-out action
- Redesigned member/community profile cards to show milestone chips, program stage, wellness objectives, and computed clinical metrics
- Updated trend and report charts to corporate chart theme (Recharts color mapping, labels, reference lines, and messaging for low-data scenarios)
- Replaced playful empty states with professional guidance copy per context requirements

### Technical
- Refactored shared metric utilities in `src/data/clientMetrics.js` to centralize tier/stage/milestone computations
- Added reusable styling primitives in `src/index.css` (`card-surface`, `metric-track`, `metric-fill`, `font-data`)
- Maintained privacy model semantics and persistence under `wellness_privacy` with admin override behavior
- Verified with `npm run lint` and `npm run build`

## [1.1.0] - 2026-05-01

### Changed
- **Complete UI theme redesign**: Transformed from RPG-inspired fantasy theme to modern corporate wellness aesthetic
- **Light/Dark mode support**: Added theme toggle with localStorage persistence and system preference detection
- **Color palette update**: 
  - Old: Dark void/deep surfaces with gold accents (RPG theme)
  - New: Clean white/slate backgrounds with cyan/teal accents for corporate wellness
- **Typography upgrade**: Changed from fantasy fonts (Cinzel) to modern sans-serif (Inter)
- **Branding**: Renamed from "WellnessQuest - Social Wellness RPG" to "Beyond Wellness - Community"
- **UI refinement**: Updated all navigation, buttons, forms, and components with professional wellness branding
- **Icons**: Replaced RPG-themed icons (Swords, Shield) with community-focused icons (Users)

### Technical
- Integrated Tailwind dark mode support (`darkMode: "class"`)
- Created ThemeToggle component with theme persistence
- Updated CSS custom properties for light/dark mode variants
- Removed RPG-themed gradients and animations
- All features and functionalities retained

## [1.0.1] - 2025-04-01

### Changed
- **Updated client data**: Replaced 67 synthetic clients with real wellness measurements and demographics from actual client records (client_stats.json)
- All 67 clients now display real body composition data, weight history, metabolic metrics, and personal information
- Measurement sessions expanded from synthetic data to 255 real historical records across all clients
- Data structure now imports from JSON source for easier future updates

### Technical
- Integrated real client statistics from client_stats.json
- Created fullClientsData.js module for centralized data management
- Updated clientsData.js to import and export real client data

## [1.0.0] - 2025-03-31

### Initial Release
- Complete WellnessQuest RPG wellness application with Vite + React 18
- 67 seeded clients with role-based routing (admin/client/community)
- Recharts analytics with weight, fat %, muscle, RMR, and metabolic age tracking
- localStorage persistence for user authentication and privacy settings
- Privacy controls: toggle between public/private profile visibility
- RPG-themed UI with custom Tailwind CSS theme (void/deep/surface backgrounds, gold/emerald accents)
- Admin dashboard with searchable/sortable client table and leaderboard
- Client profile cards with achievement badges and stat progression
- Community leaderboard and public profile grid
- Responsive design (mobile/tablet/desktop)
