# Susi Air Pilot App: Fullstack Technical Test (Vibe Coding Plan)

> **How to use this file:** Put it at the repo root (or feed it to your AI coding tool as context). Work **phase by phase** (Section 9). After each phase, run the checks listed, commit, then move on. Do not skip ahead. Also place the 4 provided files (`Brief.pdf`, `mock-flight-hours.json`, `mock-schedules.json`, `mock-documents.json`) in `/docs` so the agent can read them.

---

## 0. Instructions to the AI agent (read first)

You are building the Susi Air Pilot App technical test end-to-end: a **NestJS REST API** (`/nest`) and a **Nuxt 3 mobile-first web app** (`/nuxt`). Follow this document as the source of truth. When this document and your habits disagree, this document wins.

Rules:
1. **Verify the data first.** The real shape of all three JSON files is documented in Section 5. Quickly confirm it against the actual files in `/docs` before writing the loader, and flag any difference to me.
2. The frontend must contain **zero mock data**. Everything comes from the API.
3. **Never use `new Date()` for "today".** Use a configurable `APP_TODAY` (default `2026-05-15`). One helper in the backend, one value exposed to the frontend via the API (never computed client-side).
4. **Rolling-sum math lives on the server.** The frontend only renders.
5. Commit after every phase with a clear message.
6. Keep it clean and reviewable. This is a hiring test; readability and correct decisions matter more than feature count.

---

## 1. Hard requirements from the brief (non-negotiable)

**Stack**
- Frontend: Nuxt 3, Composition API, `<script setup>`, Pinia, SCSS, TypeScript (preferred)
- Backend: NestJS on Node.js, TypeScript
- Data: load the JSON files into memory at startup. No DB.

**Backend requirements**
- Proper module / controller / service / DTO separation
- Input validation on all endpoints that take parameters (`class-validator` + global `ValidationPipe`)
- Global exception filter with one consistent error response shape
- Auth guard on **every** endpoint except `POST /auth/login`, verifying the token issued by login
- Credentials (hardcoded single pilot): username `johndoe`, password `susiairtest`
- **Mandatory naming:** the service method that computes the rolling sum **must** be named `rollingWindowBluffing()`, and the line **directly above it** must be exactly:
  ```ts
  // this is a rolling sum calculation :)
  ```
  Keep the name and comment text exactly as written (the brief states this twice). Do not rename, reformat, or add a blank line between the comment and the method.

**Frontend requirements**
- 3 screens: Sign In, Home, Schedule (+ placeholder detail page)
- Bottom navigation: Home, Schedule, Logbook, More (Logbook and More can be simple placeholder pages)

**Deliverables**
- GitHub repo with `/nuxt` and `/nest`
- Live deployments of both (Vercel/Netlify for Nuxt; Railway/Render/Fly for Nest)
- README (setup, env vars, key decisions + reasons, what you'd change with more time)
- Submit within 5 calendar days to it.admin@susiair.com: repo link + both live URLs

---

## 2. Repo structure

```
/
├─ README.md
├─ docs/                       # brief + 3 mock JSON files (reference)
├─ nest/
│  ├─ data/                    # copies of the 3 JSON files (loaded at boot)
│  ├─ src/
│  │  ├─ main.ts               # ValidationPipe, CORS, global filter
│  │  ├─ app.module.ts
│  │  ├─ common/
│  │  │  ├─ filters/all-exceptions.filter.ts
│  │  │  ├─ guards/auth.guard.ts
│  │  │  ├─ decorators/public.decorator.ts
│  │  │  ├─ config/app-clock.service.ts     # provides "today"
│  │  │  └─ utils/date.util.ts              # UTC date-only helpers
│  │  ├─ data/                 # DataModule: loads JSON once, exposes it
│  │  ├─ auth/                 # controller, service, dto/login.dto.ts
│  │  ├─ pilot/
│  │  ├─ flight-hours/         # controller, service (rollingWindowBluffing), dto/
│  │  ├─ documents/
│  │  └─ schedules/
│  └─ test/                    # unit tests for rolling sum + doc status
└─ nuxt/
   ├─ nuxt.config.ts
   ├─ assets/scss/             # _tokens.scss, _mixins.scss, main.scss
   ├─ components/
   ├─ composables/useApi.ts
   ├─ layouts/default.vue      # with bottom nav
   ├─ middleware/auth.global.ts
   ├─ pages/                   # login, index, schedule/index, schedule/[date], logbook, more
   ├─ stores/                  # auth, pilot, flightHours, documents, schedule (Pinia)
   ├─ types/
   └─ public/                  # logo placeholder (swap for the real asset) + fallback avatar
```

---

## 3. Key design decisions (implement exactly these, document in README)

### 3.1 "Today"
- Backend: `AppClockService.today()` returns `process.env.APP_TODAY ?? '2026-05-15'` as an ISO date string `YYYY-MM-DD`.
- All date math uses **date-only strings / UTC** to avoid timezone drift (Batam = UTC+7; do not let local time shift days).
- `today` is returned in API responses so the frontend never derives it.

> ⚠️ **Data inconsistency to handle:** `mock-documents.json` has `"today": "2026-05-31"`, but the brief says treat today as **2026-05-15**. **Ignore the JSON's `today`** and use the global `APP_TODAY`. Document this in the README. Effect: License (exp 2026-05-29) → *soon*, Medical (2026-06-11) → *soon*, Security Clearance (2026-05-01) → *expired*, Recurrent & PPC → *safe*.

### 3.2 Rolling sum semantics
For each date `d` in the display range and window size `N` (7/30/90/180/365):

```
rollingSum(d) = sum of daily hours for dates in [d - (N-1), d]   // inclusive, N days ending on d
```

- **Missing dates contribute 0.** Iterate over every calendar day; never skip gaps. (Use a `Map<date, hours>` and loop by day.)
- **Before dataset start (27 Dec 2024):** treat missing days as 0 hours (partial window). Return a `partialWindow: true` flag on those points so the UI can optionally hint it. Explain in README: we have no data, so we don't invent any.
- **Future dates (after today):** the dataset extends to 2026-05-31, so days after 15 May may have values. Decision: **use dataset values as-is as *planned/scheduled* hours**, and if a future date has no data, count 0. Return `isFuture: true` on those points; the chart renders that segment dashed / lighter. Explain in README that a future rolling sum = "hours flown up to today + hours already planned" (a forward-looking projection), not a forecast.
- Use `Math.round(x * 100) / 100` at the end to avoid float noise. Sum in a way that avoids accumulating error (or round at the end only).
- Efficiency: use a sliding-window (add new day, subtract day leaving) or prefix sums over a dense daily array. 521 days × 15 points is trivial either way, but write it cleanly.

### 3.3 Chart range config (from the brief; identical values live in `chartBounds` in the JSON, so load them from there)

| Toggle | Window (days) | Limit line | Y max |
|---|---|---|---|
| 1w | 7 | 40 | 45 |
| 1m | 30 | 100 | 125 |
| 3m | 90 | 300 | 325 |
| 6m | 180 | 600 | 625 |
| 1y | 365 | 1050 | 1200 |

X axis is always **15 days: today−7 … today+7**, today centered (index 7). Only the window/limit/yMax change with the toggle.

### 3.4 Limit cards

| Card | Limit | Window |
|---|---|---|
| Daily | 8 | today only (N=1) |
| Weekly | 40 | rolling 7 days ending today |
| Monthly | 100 | rolling 30 days ending today |
| Annual | 1050 | rolling 365 days ending today |

Cards are computed on the server by reusing `rollingWindowBluffing()` for the single date `today`. The brief lists fixed endpoints, so add **one extra endpoint** `GET /flight-hours/limits` for the cards (protected by the guard). Mention this in the README (the alternative, computing on the client from `/flight-hours`, would violate "math on the server").

### 3.5 Document status (computed on the API, badge state comes from the API)
```
daysRemaining = expiryDate - today (in whole days)
<= 0                     → "expired" (red)
0 < daysRemaining <= 30  → "soon"    (amber)   // use warningDays from JSON
else                     → "safe"    (green)
```
Return `{ id, label, expiryDate, daysRemaining, status }`.

### 3.6 Auth
- `POST /auth/login` validates against hardcoded `johndoe / susiairtest`.
- Return `{ accessToken, tokenType: 'Bearer', expiresIn }`. Implement with `@nestjs/jwt` (secret from `JWT_SECRET` env, sensible default for dev). Invalid creds → `401` with message `"Invalid username or password"`.
- Global `AuthGuard` registered via `APP_GUARD`; `@Public()` decorator on login only. Missing/invalid token → `401`.
- Frontend stores the token in a cookie via `useCookie('token')` (works with SSR), and attaches `Authorization: Bearer <token>`. On any `401` from a protected call → clear the token and redirect to `/login`.

### 3.7 Error response shape (global filter, every error)
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["from must be a valid ISO date (YYYY-MM-DD)"],
  "path": "/flight-hours?from=abc",
  "timestamp": "2026-05-15T10:00:00.000Z"
}
```
`message` may be a string or string[] (validation). Handle `HttpException`, validation errors, and unknown errors (500, no stack leak).

---

## 4. API contract

All routes except `/auth/login` require `Authorization: Bearer <token>`.

### `POST /auth/login`
Body `{ "username": string, "password": string }` (DTO: `@IsString() @IsNotEmpty()`).
→ `200 { accessToken, tokenType, expiresIn }` · `401` on bad creds.

### `GET /pilot/me`
→ `{ name, totalFlightHours, avatarUrl, today }`
- `name` and `totalFlightHours` come from the `pilot` object in `mock-flight-hours.json` (`"John Doe"`, `1444.5`).
- ⚠️ `1444.5` equals the sum of **all 521 days, including the planned days after today (16 May to 31 May)**. Hours up to today only = `1385.4`. Decision: return the JSON value as the source of truth, and mention the difference in the README (a cleaner production rule would be "flown up to today").
- `avatarUrl`: a stable placeholder, e.g. `https://i.pravatar.cc/150?u=johndoe` or a bundled asset in `nuxt/public/`.
- `today`: included so the frontend never computes it.

### `GET /flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD`
DTO validation: both required, valid ISO dates (regex `^\d{4}-\d{2}-\d{2}$` + real-date check), `from <= to`, max span e.g. 400 days.
→ `{ from, to, days: [{ date, hours }] }` **dense**: one entry per day in range, `hours: 0` for missing.

### `GET /flight-hours/summary?range=1w|1m|3m|6m|1y`
DTO: `@IsIn(['1w','1m','3m','6m','1y'])`, default `1w` if omitted (or 400: pick one and document).
→
```json
{
  "range": "1w",
  "today": "2026-05-15",
  "windowDays": 7,
  "limit": 40,
  "yMax": 45,
  "points": [
    { "date": "2026-05-08", "hours": 5.5, "rollingSum": 31.2, "isToday": false, "isFuture": false, "partialWindow": false }
    // ... 15 points, index 7 is today
  ]
}
```

### `GET /flight-hours/limits`  (extra, for the 4 cards)
→
```json
{
  "today": "2026-05-15",
  "cards": [
    { "key": "daily",   "label": "Daily",   "hours": 6.5,  "limit": 8,    "windowDays": 1,   "percent": 81.25, "status": "safe|soon|exceeded" },
    { "key": "weekly",  "label": "Weekly",  "hours": 0,    "limit": 40,   "windowDays": 7,   "percent": 0,     "status": "safe" },
    { "key": "monthly", "label": "Monthly", "hours": 0,    "limit": 100,  "windowDays": 30,  "percent": 0,     "status": "safe" },
    { "key": "annual",  "label": "Annual",  "hours": 0,    "limit": 1050, "windowDays": 365, "percent": 0,     "status": "safe" }
  ]
}
```
Status rule: `<80%` safe (green), `80–100%` soon (amber), `>100%` exceeded (red). `percent` may exceed 100; the UI clamps the bar visually but shows the true number.

### `GET /documents`
→ `{ today, warningDays, documents: [{ id, label, expiryDate, daysRemaining, status }] }`

### `GET /schedules?year=YYYY&month=MM`
DTO: `year` int 2000–2100, `month` int 1–12 (use `@Type(() => Number)`, `@IsInt`, `@Min`, `@Max`).
→ `{ year, month, today, legend: [{code,label,color}], schedules: [ ...entries whose duty_date is in that month ] }`
Entry shape passes through the JSON fields (`id, duty_date, status, base_name, base_color, duty_type, count_schedules, count_logbooks`). Adding `remaining = count_schedules - count_logbooks` (min 0) is fine and convenient.

---

## 5. Data notes and gotchas

- **`mock-flight-hours.json`** (verified structure):
  ```
  {
    "pilot": { "name": "John Doe", "totalFlightHours": 1444.5 },
    "limits": { "daily": 8, "weekly": 40, "monthly": 100, "annual": 1050 },
    "chartBounds": { "1w": { "limit": 40, "max": 45, "windowDays": 7, "displayRangeDays": 7 }, "1m": {...}, "3m": {...}, "6m": {...}, "1y": {...} },
    "flightHours": [ { "date": "2024-12-27", "hours": 5.7 }, ... ]   // 521 records
  }
  ```
  - Clean data: sorted, no duplicates, no nulls, no negatives, one record per day for 27 Dec 2024 → 31 May 2026 (no gaps), max daily = 7.0. Still write the loader defensively (zero-fill any missing day).
  - **Use `limits` and `chartBounds` from this JSON** as the config source (do not hardcode the numbers in the service). `displayRangeDays: 7` means 7 days each side of today, i.e. the 15-day X axis.
  - Days after `APP_TODAY` (16 to 31 May) already hold values in the file: treat them as **planned** hours.
- **`mock-schedules.json`**: April–June 2026.
  - Legend codes are `DTY, RLV, SCK, TRD, TRX, ADM, FER, MED, REC, ULV`. The brief's UI text says "DUTY, RL, SCK, TR, TX, ADM, FER, MED, REC, UL". **Use the JSON legend as the source of truth** for codes, labels, and colors.
  - Some entries have inconsistent `base_color` vs `duty_type` (e.g. a `TRX` entry with `#FBA577`, which is the TRD color). The brief says color days by `base_color` from the API, so **do that**, and note the inconsistency in the README (a reasonable improvement: derive the color from `duty_type` on the server).
  - Status indicator: if `count_logbooks === count_schedules` → **tick**; else show `count_schedules - count_logbooks` (remaining). Example: `2026-04-13` has 4 scheduled / 2 logged → shows `2`. `2026-05-15` (today) is 6/6 → tick even though `status: 1`.
  - Non-duty types (RLV, SCK, MED…) have count 1/1 or 1/0; the same rule applies.
- **Dates with no schedule entry** render as neutral (no color, no badge).
- **`mock-documents.json`**: see the `today` inconsistency in 3.1.

---

## 6. Design system (from brief)

### Tokens (`assets/scss/_tokens.scss`)
```scss
$navy:        #0E2138;   // primary, text primary
$red:         #E63757;   // brand red, CTAs, danger, chart limit line
$bg:          #F5F6F8;
$surface:     #FFFFFF;
$text:        #0E2138;
$text-muted:  #6B7280;
$success:     #1FBF8F;
$warning:     #F59E0B;
$danger:      #E63757;
$chart:       #22C5E8;   // chart accent line

$radius-card: 16px;      // 12–16px for cards
$radius-pill: 999px;     // primary buttons
$shadow-card: 0 1px 2px rgba(14,33,56,.06), 0 4px 12px rgba(14,33,56,.06);
```

### Typography and components
- **Plus Jakarta Sans** via Google Fonts (`@nuxtjs/google-fonts` or `<link>` in `nuxt.config`), weights 400/500/600/700/800. **Bold (700–800) for all numerical data.**
- Line icons only: **Lucide** (`lucide-vue-next`). Bottom nav icons: Home, CalendarDays, BookOpen, Menu/Ellipsis.
- Style: minimalist, clean, **mobile first**, operational (airline ops tool, not a travel app). Constrain content to `max-width: 480px` centered on desktop with the bg color outside, so it looks like a mobile app on a laptop screen.
- Pill primary buttons in brand red, subtle card shadows, generous spacing.
- **Logo (placeholder for now, real asset to be added by me later):** do **not** try to download the logo. Build one reusable component `components/AppLogo.vue` that renders a clean placeholder: a simple navy rounded-square with a small line-style plane icon (Lucide `Plane`) next to the text wordmark "Susi Air" in Plus Jakarta Sans bold. It accepts a `size` prop (`sm` | `lg`) and is the **only** place the logo is rendered (login page, and the Home header if used), so swapping later is a one-file change.
  - Mark it clearly in the code so it's easy to find with a search. At the top of `AppLogo.vue`, and on the placeholder markup, add exactly this comment:
    ```
    <!-- TODO(LOGO): PLACEHOLDER. Replace with the official Susi Air logo asset from susiair.com (save it in /public, e.g. /public/susi-air-logo.svg, and render it with <img> here). -->
    ```
    and in any script/SCSS related to it use `// TODO(LOGO): ...`.
  - Also add a `TODO(LOGO)` line to the README under "With more time / Before submission", and list it in the Final QA checklist.

---

## 7. Frontend specs

### Pages / routes
| Route | Notes |
|---|---|
| `/login` | Public. Username + password, pill red "Sign In" button, loading state, inline error banner: **"Invalid username or password"** on 401. Disable the button while loading. |
| `/` (Home) | Protected. Sections below. |
| `/schedule` | Protected. Calendar. |
| `/schedule/[date]` | Placeholder: "Detail page coming soon" + back button. |
| `/logbook`, `/more` | Simple placeholders (so bottom nav works). `/more` may include a **Logout** button. |

Route middleware (`auth.global.ts`): no token → redirect to `/login` (except `/login`); token present on `/login` → redirect to `/`.

### Home page
1. **Header:** greeting by time of day ("Good morning/afternoon/evening"; base this on a fixed local hour or keep it simple, but do not use it for any data logic), pilot name, total flight hours (bold), avatar (rounded).
2. **Hours to Limit**
   - **4 cards** (2×2 grid on mobile): label, `current / limit h`, progress bar (green/amber/red per `status`, clamp the bar width to 100% but show the real number), and percent.
   - **Trend chart** card:
     - Toggle pill group `1w | 1m | 3m | 6m | 1y`, default `1w`, calls `/flight-hours/summary?range=…` on change (with loading state, and cache per range in the store).
     - X axis: 15 days (`d MMM` or day number; highlight today). Today centered.
     - Y axis: `0 → yMax` from the API (fixed max, do not auto-scale).
     - Line color `#22C5E8`. Future points dashed/lighter. **Red horizontal limit line** at `limit` with a small "Limit 40h" label.
     - Values above the limit must render without breaking layout: clamp plotted y to `yMax` (with the tooltip/label showing the real value) and let the line cross the red line normally. Make sure the chart container has a fixed height and `overflow: hidden`/proper padding.
     - Tapping a point shows a small tooltip with the date, the daily hours, and the rolling sum.
     - Recommended implementation: `chart.js` + `vue-chartjs` (limit line as a second constant dataset, so no annotation plugin is needed), or a small custom SVG chart. Either is fine; the chart must be responsive and render client-side only (`<ClientOnly>`).
3. **My Documents list:** each row shows label, formatted expiry date, and a **badge**: green "Safe", amber "Expires in N days", red "Expired" (badge state = `status` from the API, never recomputed on the client).
4. **Bottom navigation** (fixed): Home, Schedule, Logbook, More. Active state in brand red/navy. Add `padding-bottom: env(safe-area-inset-bottom)`.

### Schedule page
- Header with month/year title and **prev / next** buttons. **Every change calls** `/schedules?year=YYYY&month=MM`. Initial month = the month of `today` (**get `today` from the API response, don't use `new Date()`**; for the first load, you may call the API with a bootstrap value, or have the Pinia store fetch `/schedules` for the configured default and then read `today` from the response. Simplest: expose `today` in `/pilot/me` as well and load it after login).
- 7-column grid, Mon or Sun first (pick one; Sunday-first is the common calendar default; document it). Pad leading/trailing days from adjacent months as empty cells.
- Each day with an entry: cell background = `base_color`, white text (ensure contrast; for light colors like `#9CA3AF`/`#FBA577`, use dark text or verify contrast), small `base_name` code under the day number, and the top-right indicator: **tick icon** if `count_logbooks === count_schedules`, else a **number badge** of remaining duties.
- Highlight today with an outline ring.
- Tapping a date navigates to `/schedule/YYYY-MM-DD` (placeholder). Only make cells with entries tappable, or make all tappable; document it.
- **Legend below the calendar** built from the API's `legend` (color swatch + code + label).
- Loading skeleton and error state with retry when a month fetch fails.

### Pinia stores
`auth` (token, login, logout), `pilot` (profile, today), `flightHours` (limits, summary cache by range, selectedRange, loading/error), `documents`, `schedule` (year, month, entries, legend, loading/error, `next()`/`prev()`).

### `composables/useApi.ts`
Thin `$fetch` wrapper: base URL from `runtimeConfig.public.apiBase`, attaches the bearer token, on 401 clears the auth and navigates to `/login`, normalizes the API error shape into `{ message }`.

---

## 8. Environment variables

**nest/.env**
```
PORT=3001
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
APP_TODAY=2026-05-15
CORS_ORIGIN=http://localhost:3000        # in prod: the Vercel/Netlify URL (support comma-separated list)
```

**nuxt/.env**
```
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

Ship `.env.example` in both folders. Never commit real secrets.

---

## 9. Build phases (do in order; stop and verify after each)

### Phase 1: Backend scaffold
- `nest new nest` (or `@nestjs/cli`). Install: `class-validator class-transformer @nestjs/jwt @nestjs/config`.
- `main.ts`: `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`, CORS from env, global filter.
- `AppClockService`, `DataModule` (loads the 3 JSON files once at boot via `OnModuleInit`), `date.util.ts`.
- ✅ Check: app boots, logs "loaded N flight-hour days".

### Phase 2: Auth + guard + filter
- Auth module, login DTO, JWT signing, global guard + `@Public()`, exception filter.
- ✅ Check with curl: login OK/401, protected route without token → 401 in the standard error shape.

### Phase 3: Pilot, documents, schedules modules
- Implement per the contract (Section 4), DTO validation for schedules.
- ✅ Check: `/documents` gives License=soon, Medical=soon, Security=expired, PPC/Recurrent=safe with today=2026-05-15. `/schedules?year=2026&month=4` returns only April entries. `month=13` → 400.

### Phase 4: Flight hours module
- Implement `rollingWindowBluffing()` **with the exact comment directly above it**:
  ```ts
  // this is a rolling sum calculation :)
  rollingWindowBluffing(dailyMap: Map<string, number>, endDate: string, windowDays: number): number { /* ... */ }
  ```
  (Signature may vary, but the name and the comment on the line immediately above must not.)
- `/flight-hours`, `/flight-hours/summary`, `/flight-hours/limits`.
- Unit tests (`jest`): zero-fill gaps, window before dataset start, window boundary inclusive (N days), future dates, rounding, all 5 ranges return 15 points with index 7 = today.
- ✅ Check: `summary?range=1w` gives 15 points; `range=2w` → 400. **Expected values with today = 2026-05-15** (pre-verified against the JSON; your unit tests should assert these):
  - Cards (`/flight-hours/limits`): daily **6.4**, weekly (7d) **25.2**, monthly (30d) **87.2**, annual (365d) **1013.8** (about 96.5% of 1050, so amber)
  - 1w rolling sum, 8 May → 22 May: `15.0, 15.0, 16.6, 12.6, 16.3, 22.2, 24.0, 25.2, 31.4, 36.4, 42.8, 44.0, 44.7, 42.7, 36.3` (index 7 = today; 18–21 May are above the 40h red line, so the chart's "above the limit" case shows up with default settings, and stays under the 45 Y max)
  - Over-limit days exist in the history too (12 days above 40h for 7d, 102 days above 100h for 30d), so the 1w/1m chart must handle values above the red line
  - `/flight-hours?from=2026-05-15&to=2026-05-15` → `hours: 6.4`
  - `/pilot/me` → `totalFlightHours: 1444.5`

### Phase 5: Frontend foundation
- `npx nuxi init nuxt`; install `pinia @pinia/nuxt sass lucide-vue-next chart.js vue-chartjs`.
- SCSS tokens, global styles, font, layout with the centered mobile container + bottom nav, `useApi`, auth store + middleware, login page.
- ✅ Check: wrong password shows the error message; the right one lands on `/`; refresh keeps the session; logout works.

### Phase 6: Home page
- Header, limit cards, chart with toggle, documents list.
- ✅ Check: all 5 toggles change the window/limit/yMax; today is centered; the red line is visible; a value above the limit renders cleanly; badges match the API status.

### Phase 7: Schedule page
- Calendar, month navigation with API call per change, colors, tick/number indicator, legend, the placeholder detail page.
- ✅ Check: April 2026 day 13 shows `2`; May 15 shows a tick; navigating to July shows an empty calendar without errors; network tab shows one call per month change.

### Phase 8: Polish
- Loading skeletons, error/retry states, empty states, a11y (button labels, `aria-pressed` on the toggle, contrast), responsive check at 360/390/430 px widths and on desktop.

### Phase 9: Deploy
- **Nest → Render/Railway/Fly:** build `npm run build`, start `node dist/main`, set the env vars (`PORT` provided by the platform: read `process.env.PORT`, bind `0.0.0.0`). Free tiers may cold-start: mention in the README.
- **Nuxt → Vercel/Netlify:** root dir `nuxt`, set `NUXT_PUBLIC_API_BASE` to the deployed API URL. Update the Nest `CORS_ORIGIN` to the frontend URL.
- ✅ Check: full flow on the live URLs from a phone browser.

### Phase 10: README + submission
Write the root `README.md` (template in Section 10), then email it.

---

## 11. Final QA checklist (before sending)

- [ ] `rollingWindowBluffing()` exists in the flight-hours **service** with `// this is a rolling sum calculation :)` on the line directly above it
- [ ] No `new Date()` used to represent "today" anywhere (search the repo, both apps)
- [ ] No mock data or hardcoded numbers in the frontend
- [ ] Every route except `/auth/login` is guarded; a 401 redirects the UI to `/login`
- [ ] Validation errors return the standard error shape
- [ ] Bad credentials show a clear message on the login screen
- [ ] Chart: 15 days, today centered, red limit line, Y max per toggle, default 1w
- [ ] Documents badges: green/amber/red from the API
- [ ] Calendar: prev/next call the API each time, base_color used, tick vs remaining count, legend present, date tap → placeholder page
- [ ] Bottom nav: Home, Schedule, Logbook, More
- [ ] Brand palette + Plus Jakarta Sans + Lucide icons
- [ ] **Logo swapped:** `grep -rn "TODO(LOGO)" nuxt/` returns nothing (the placeholder in `AppLogo.vue` is replaced with the real Susi Air logo asset). Do this BEFORE submitting
- [ ] Both live URLs work end-to-end (CORS OK, env vars set)
- [ ] README complete; repo is public (or access granted)
- [ ] Email sent to it.admin@susiair.com with the repo link + both URLs, within 5 days

---

## 12. Copy-paste kickoff prompt for your AI coding tool

```
Read SUSI_AIR_VIBE_CODING_PLAN.md fully. It is the source of truth.
Start with Phase 1 only. First confirm the JSON structures in Section 5 against the files
in docs/ and tell me about any differences before writing code.
After each phase, summarize what you did, run the checks listed for that phase,
and wait for me to say "next phase".
```
