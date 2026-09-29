# Susi Air Pilot App

This is a fullstack technical test for Susi Air, comprising a mobile-first Pilot App frontend and a REST API backend.

## Architecture

- **Frontend (`/nuxt`)**: Built with Nuxt 3, Vue Composition API, Pinia, SCSS, and Chart.js.
- **Backend (`/nest`)**: Built with NestJS, TypeScript, class-validator, and JWT authentication. Loads JSON data in-memory without a database.

## Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend (NestJS)
```bash
cd nest
cp .env.example .env
npm install
npm run start:dev
```
The API will run on `http://localhost:3001`.

### 2. Frontend (Nuxt 3)
```bash
cd nuxt
cp .env.example .env
npm install
npm run dev
```
The web app will run on `http://localhost:3000`.

**Test Credentials:**
- Username: `johndoe`
- Password: `susiairtest`

## Key Design Decisions & Reasons

1. **"Today" Management**: 
   - Timezones and local time can cause data drift. To enforce absolute consistency, "today" is solely managed by the backend (`APP_TODAY=2026-05-15`) and is returned in API responses so the frontend strictly renders what the server considers to be "today". The frontend never uses `new Date()`.

2. **Server-Side Data Processing**:
   - All complex logic, including rolling-window math for flight hours and calculation of days remaining for document expiry, is executed on the server. The frontend is strictly a presentational layer containing zero hardcoded mock data.

3. **Data Inconsistencies Handled**:
   - The `mock-documents.json` indicates `"today": "2026-05-31"`. This was explicitly ignored in favor of the global `APP_TODAY` (`2026-05-15`) requirement.
   - The `mock-flight-hours.json` shows total pilot flight hours as `1444.5`, which actually includes future planned hours up to May 31. This was served as-is from the API as the source of truth, rather than being re-totaled.
   - Future days in the rolling chart window utilize the existing mock dataset as "planned" flight hours, plotting a forward-looking trend rather than an empty void.

4. **Limits Cards Implementation**:
   - A dedicated `GET /flight-hours/limits` endpoint was added to the backend to compute the Daily, Weekly, Monthly, and Annual limit cards. This ensures that the rolling logic is entirely contained within `rollingWindowBluffing()` on the server, avoiding any math on the client.

## What I'd change with more time

- **Database Integration**: Replace the in-memory JSON loading with a proper PostgreSQL database via Prisma or TypeORM.
- **Improved Logging**: Implement robust structured logging on the server instead of standard console logs.
- **End-to-End Testing**: Add Cypress or Playwright tests to ensure the UI handles token expirations, 401 redirects, and complex chart interactions correctly.
- **Color Extraction**: Move the responsibility of matching `duty_type` to calendar `base_color` to the server to prevent the inconsistencies currently present in the mock schedule dataset.
- **Chart Tooltips**: Add more robust, customized HTML tooltips to the chart using an external plugin to make the partial-window warnings more prominent.

## Deployment

- **Frontend**: Connect the `/nuxt` directory to Vercel or Netlify. Set `NUXT_PUBLIC_API_BASE` to the deployed backend URL.
- **Backend**: Connect the `/nest` directory to Render or Railway. The app listens on `0.0.0.0` and correctly utilizes `process.env.PORT`. Set `CORS_ORIGIN` to the deployed frontend URL. *Note: Free tiers on these platforms may cold-start, resulting in a slightly slower initial login.*
