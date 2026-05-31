# SR&ED Projections Dashboard

A single-page **financial dashboard** for an SR&ED platform. The platform tracks employees'
timesheet hours; some hours are **SR&ED**-eligible (Canada's R&D tax credit). This dashboard turns
raw timesheet, salary, and vendor data into clear answers: each employee's cost, hours and dollars
per project, totals across all projects, and a **projection of the full year's hours, spend, and
tax credit** — all filterable by quarter / half-year / full year, for multiple client companies.

> Built as a UI developer take-home. The Angular app lives in the **`sred-dashboard/`** folder.

---

## Run it locally

```bash
cd sred-dashboard
npm install
npm start          # or: ng serve
```

Then open **http://localhost:4200**.

**Demo logins** (password for all: **`sred2025`**):

| Username   | Role   | Lands on            | Sees                                                            |
|------------|--------|---------------------|----------------------------------------------------------------|
| `afiniti`  | Client | `/dashboard`        | The Afiniti workspace (fuller dataset)                         |
| `salesflo` | Client | `/dashboard`        | The Salesflo workspace (lighter dataset)                       |
| `admin`    | Admin  | `/admin/feedback`   | All clients' feedback + per-client credit-rate settings        |

> Auth is **mock / in-memory** (no backend). A full page refresh resets to the seed data and logs
> you out — that's deliberate for a take-home; swapping the mock store for HTTP calls would make it
> persistent without changing the UI.

---

## What it does (requirements coverage)

**Core (from the task):**
1. **Header** with client information (fiscal year, "data as of" date, time zone).
2. **Navigation bar** with in-page smooth-scroll links (and a separate admin navbar).
3. **Employee salary grid** — every employee with annual salary and the equivalent hourly rate.
4. **Per-project chart** — hours worked and the monetary amount per project (labor + vendor).
5. **All-projects summary** — per-project totals plus grand-total hours and dollars.
6. **Year projection** — YTD vs projected full-year hours, spend, and SR&ED credit.

**Added capabilities:**
- **Period selector** — Q1–Q4 / H1 / H2 / Full Year drives every grid and chart.
- **Employee CRUD** + a per-employee **detail modal** (SR&ED vs Unclaimed breakdown, allocation %)
  + a **specified-employee** flag.
- **Teams** table and chart (incl. an "Unassigned" group).
- **Project CRUD** with cascade-safe deletes.
- **Vendor invoices** CRUD and **government assistance**, feeding an **SR&ED credit** calculation.
- **Employee & team hours charts** (SR&ED vs Unclaimed).
- **Multi-client** workspaces + a **mock login** with an **admin** who reviews feedback and configures
  each client's credit rate.
- **Animations** — smooth scrolling, on-scroll reveal, count-up totals (all respect
  `prefers-reduced-motion`).

---

## Key formulas

- **Hourly rate** = `(confirmed salary ?? expected salary) / 2000` standard annual hours.
- **Project amount** = labor (`Σ hours × hourly rate`) + vendor invoices assigned to the project.
- **SR&ED credit** = `max(0, SR&ED labor + SR&ED vendor − government assistance) × credit rate`.
- **Year projection (linear run-rate)** = `year-to-date / fraction of the fiscal year elapsed` at
  the "as of" date.

---

## Architecture

One-directional, reactive data flow:

```
assets/data/dashboard-data.json   (seed: users, client workspaces, feedback)
        │  loaded once at startup (APP_INITIALIZER)
        ▼
DashboardDataService              (RxJS BehaviorSubjects — the single source of truth)
        │  scopes to the active client + selected period
        ▼
core/derivations.ts               (pure functions: totals, breakdowns, credit, projection)
        │  exposed as observables
        ▼
standalone components             (subscribe via the async pipe; charts via ng-apexcharts)
```

- **State:** RxJS observables only (no Angular signals). Components read via the `async` pipe.
- **Derived, not stored:** every total/rate/projection is computed on demand — the JSON stays the
  single source of truth, so numbers can't drift.
- **Immutable updates:** all CRUD produces new objects/arrays (`.next(...)`); nothing is mutated
  in place.
- **Multi-tenant:** each client is a self-contained workspace; logging in scopes the whole dashboard.

**Stack:** Angular 17 (standalone components, router) · Tailwind CSS + Flowbite · ng-apexcharts ·
RxJS · TypeScript.

---

## Project structure

```
sred-dashboard/
  src/app/
    models/        TypeScript interfaces (raw domain + derived view-models)
    core/          pure derivation functions + route guards
    services/      DashboardDataService, AuthService
    components/    one focused, reactive component per dashboard section
    pages/         login, dashboard shell, admin (feedback + settings)
  src/assets/data/ dashboard-data.json (seed)
```

---

## Testing

```bash
cd sred-dashboard
npm test           # ng test (Karma + Jasmine, headless Chrome)
```

**59 unit tests** cover the pure math (including the task's own worked example —
10h@$100 + 20h@$20 + 50h@$10 = 80h / $1,900), the projection identity, period math, CRUD cascades,
the SR&ED credit calculation, the auth flow, and component view-models.

```bash
npm run build      # production build (ng build)
```

---

## Notes & assumptions

- Data is mock seed data shaped like the real platform; salary figures are chosen so the hourly
  rates match the task screenshots (e.g. $60k → $30/h, confirmed $90k → $45/h).
- Currency is shown with a `$` symbol for readability.
- "Government assistance" is treated as an annual figure that reduces the creditable base.
- No backend: all mutations are in-memory for the session.
