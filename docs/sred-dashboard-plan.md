# SR&ED Financial Dashboard — Implementation Plan

## Context

A recruiter task: build an **intuitive, beautiful, single-page financial dashboard** that
visualizes timesheet/SR&ED data and projects R&D tax-credit amounts. The platform tracks
employee hours; some hours are "SR&ED" (Canadian R&D tax-credit eligible). The dashboard must
surface employee compensation, per-project hours and dollar amounts, an all-projects summary
with grand totals, and a full-year projection.

**Stack:** Angular (standalone, latest) + Tailwind CSS + Flowbite + `ng-apexcharts`, with the
Angular Router for login / dashboard / admin pages.
**State:** RxJS observables only — **no Angular signals**. Components subscribe via the `async` pipe.

**User's working style:** Build components **one at a time** so the user fully understands each
piece. The **data layer is the first deliverable** — everything else builds on it.

Source of truth: `UI Developer Task.pdf` (6 requirements + clarifying screenshots). Screenshots
are illustrative only and need not be replicated.

### Requirements (from PDF)
1. Header with client information
2. Navigation bar
3. Grid: every employee with annual salary + equivalent hourly rate
4. Chart: per project — hours worked and the monetary amount (Σ of each person's hours × their rate)
5. Chart: all-projects summary — hours & $ per project, plus grand-total hours & grand-total $
6. Projection for the remainder of the year — expected total hours and total $ for the full year

### Additional requirements (from user)
- **A. Animations:** smooth scrolling between sections, plus count-up totals, on-scroll reveal of
  sections, chart entrance/transition animations, animated period switching, smooth modal
  expand/collapse, hover transitions, and skeleton loaders during data load.
- **B. Period breakdown:** all data viewable by **Q1, Q2, Q3, Q4, H1, H2, and Full Year**, driven
  by a global period selector.
- **C. Employee CRUD + detail modal + special flag:** add / edit / remove employees via a form
  (Flowbite modal); a **special-employee flag** ("Specified Employee") shown as a badge; and a
  read-only **detail modal** (screenshot pg. 5) showing an employee's per-project hours split into
  SR&ED projects vs Unclaimed Work, plus SR&ED hours, total hours, and SR&ED allocation %.
- **D. Teams:** a **teams table**, and each employee can belong to one team (or be unassigned —
  "Staff not Assigned to Team"). Team is selectable in the employee form.
- **E. Vendors & other expenses:** a **Vendor Invoices** CRUD table plus a **Government Assistance**
  total. Each invoice is tied to a project; SR&ED-flagged invoices add to SR&ED expenditure and the
  government-assistance amount reduces the creditable base.
- **F. Project CRUD:** add / edit / remove projects via a modal (name, color, is-SR&ED). Removing a
  project cascades — its timesheet entries and vendor invoices are removed (no orphan references).
- **G. Auth, multi-client & admin feedback:** a **mock login** with seeded users sharing one
  password — `Afiniti` (client), `Salesflo` (client), `Admin` (admin). Each client has its own
  workspace/data and sees only their dashboard. Clients submit **feedback** (message + 1–5 rating +
  submitted date) via a floating feedback button. The **Admin** logs in and sees an **all-client
  feedback** panel, and can **configure each client's `sredCreditRate`** from an admin settings view.
- **H. Hours breakdown charts:** an **employee chart** and a **team chart**, each a stacked bar of
  **SR&ED vs Unclaimed hours** (verified against screenshot pg. 4).

### Key decisions
- **Dataset:** multi-client. Two client workspaces seeded — **Afiniti** (fuller) and **Salesflo**
  (lighter). Each has ~6–8 employees, ~5 projects + an "Unclaimed Work" bucket, ~2–3 teams (some
  employees unassigned), ~3 vendor invoices, and a government-assistance amount.
- **Charts:** ApexCharts (`ng-apexcharts`).
- **Data delivery:** static JSON in `src/assets/` is the *seed*; loaded once via `HttpClient` into a
  mutable in-memory store (`BehaviorSubject`) so all CRUD can mutate it. (LocalStorage persistence
  is an optional stretch.)
- **Auth:** mock only — credentials validated against seeded `users` in the JSON; same password for
  all. No real security; current user held in an `AuthService` `BehaviorSubject`; route guards gate
  the dashboard (any logged-in user) and the admin feedback page (role === admin).
- **Salary & hourly rate (confirmed from screenshots):** `effectiveSalary = confirmedSalary ??
  expectedSalary` (use confirmed when present, else expected), then `hourlyRate = effectiveSalary /
  standardAnnualHours` (2000). Anne expected $60k→$30; Kaitlyn confirmed $90k (over expected $80k)→$45;
  Michael expected $50k→~$24.03.
- **Configurable credit rate:** `sredCreditRate` is editable per client from the **admin** side.
- **Period model:** timesheet hours are stored **per quarter**; H1, H2, and Full Year are derived.
- **asOfDate:** set late in the fiscal year (≈ `2025-11-15`) so Q1–Q3 are complete, Q4 is partial,
  every period tab has data, and the year-end projection is meaningful.

---

## Data Model (first deliverable)

Files:
- `src/app/models/` — TypeScript interfaces (one concern per file or a barrel `index.ts`).
- `src/assets/data/dashboard-data.json` — the seed dataset (users + clients + feedback).
- `src/app/services/auth.service.ts` — login/logout, `currentUser$`, role helpers.
- `src/app/services/dashboard-data.service.ts` — loads JSON, scopes to the active client, exposes
  raw + **derived** data, handles employee/project/vendor CRUD and feedback.

### Interfaces

```ts
// period.model.ts
export type Period = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'FY';
export interface QuarterlyHours { q1: number; q2: number; q3: number; q4: number; }

// user.model.ts
export type Role = 'admin' | 'client';
export interface User {
  username: string;             // "afiniti" | "salesflo" | "admin"
  displayName: string;          // "Afiniti" | "Salesflo" | "Admin"
  role: Role;
  clientId: string | null;      // client workspace they belong to; null for admin
  password: string;             // seeded, shared (MOCK ONLY)
}

// client.model.ts
export interface Client {
  id: string;                   // "afiniti" | "salesflo"
  name: string;                 // "Afiniti"
  loggedInUser: string;
  timeZone: string;             // "EST"
  fiscalYearStart: string;      // ISO "2025-01-01"
  fiscalYearEnd: string;        // ISO "2025-12-31"
  asOfDate: string;             // ISO — drives projection
  standardAnnualHours: number;  // 2000
  sredCreditRate: number;       // e.g. 0.445
}

// team.model.ts
export interface Team { id: string; name: string; color: string; }

// employee.model.ts
export interface Employee {
  id: string;
  name: string;
  province: string;             // "ON" | "BC" | "QC" | "AB" ...
  startDate: string;            // ISO
  endDate: string | null;
  confirmedSalary: number | null; // "Confirmed Salary per Payroll" — preferred if present
  expectedSalary: number | null;  // "Expected Salary" — fallback when no confirmed salary
  isSpecialEmployee: boolean;   // "Specified Employee" flag
  teamId: string | null;        // null = unassigned
  // effectiveSalary (= confirmedSalary ?? expectedSalary) and hourlyRate are DERIVED
}

// project.model.ts
export interface Project { id: string; name: string; color: string; isSred: boolean; }

// timesheet.model.ts — one row per (employee, project), hours split by quarter
export interface TimesheetEntry {
  employeeId: string;
  projectId: string;
  hours: QuarterlyHours;        // q1..q4 actuals; period totals derived
}

// vendor.model.ts
export interface VendorInvoice {
  id: string;
  invoiceDate: string;          // ISO; maps to a quarter for period filtering
  invoiceNumber: string;
  amount: number;
  vendorName: string;
  providerName: string;
  projectId: string;            // tied to a project → rolls into that project's expenditure
  description: string;
  isSred: boolean;
  province: string;
  status: string;
}

// feedback.model.ts
export interface Feedback {
  id: string;
  clientId: string;             // which client submitted it
  clientName: string;           // denormalized for admin display
  message: string;
  rating: number;               // 1–5
  submittedAt: string;          // ISO
}

// dataset shape
export interface ClientWorkspace {
  client: Client;
  teams: Team[];
  employees: Employee[];
  projects: Project[];
  timesheets: TimesheetEntry[];
  vendorInvoices: VendorInvoice[];
  governmentAssistanceTotal: number;
}
export interface DashboardSeed {
  users: User[];
  workspaces: ClientWorkspace[];
  feedback: Feedback[];
}
```

### Derived values (computed in `DashboardDataService`, scoped to active client; not stored)
- `effectiveSalary(employee) = employee.confirmedSalary ?? employee.expectedSalary`
- `hourlyRate(employee) = effectiveSalary(employee) / client.standardAnnualHours`
- `periodHours(entry, period)`: Q1–Q4 → that quarter; H1 → q1+q2; H2 → q3+q4; FY → q1+q2+q3+q4.
- `entryAmount(entry, period) = periodHours(entry, period) * hourlyRate(employee)`
- **Per-project totals (req 4 & 5):** for the selected period —
  - `projectHours = Σ periodHours` (labor hours only).
  - `projectLaborAmount = Σ entryAmount`.
  - `projectVendorAmount = Σ vendorInvoice.amount where invoice.projectId === project.id`.
  - `projectAmount = projectLaborAmount + projectVendorAmount`.
- **Grand totals (req 5):** `totalHours = Σ projectHours`, `totalAmount = Σ projectAmount`.
- **Per-employee breakdown (detail modal):** per-project hours split into SR&ED vs Unclaimed Work;
  `employeeSredHours`, `employeeTotalHours`, `sredAllocation = employeeSredHours / employeeTotalHours`.
- **SR&ED-vs-Unclaimed aggregations (for the employee & team charts):**
  - per employee: `{ name, sredHours, unclaimedHours }` (for the selected period).
  - per team: `{ teamName, members: [{ name, sredHours, unclaimedHours }], teamSredHours,
    teamUnclaimedHours }`, including an "Unassigned" group.
- **Projection (req 6):** linear run-rate from fiscal-year start to `asOfDate`:
  - `fractionElapsed = (asOfDate − fiscalYearStart) / (fiscalYearEnd − fiscalYearStart)`
  - `projectedFullYearHours = ytdHours / fractionElapsed`; same for amount and credit.
  - also expose per-project projections + `remainingHours = projected − YTD`.
- **Expenditure & credit (req E):**
  - `sredLabor = Σ entryAmount over SR&ED projects`; `sredVendor = Σ invoice.amount where isSred`.
  - `totalSredExpenditure = sredLabor + sredVendor`
  - `creditableBase = max(0, totalSredExpenditure − governmentAssistanceTotal)`
  - `creditAmount = creditableBase * client.sredCreditRate`

### Service shapes (RxJS, no signals)
- **AuthService:** `login(username, password)`, `logout()`, `currentUser$` (BehaviorSubject),
  `isAdmin$`. Validates against seeded `users`.
- **DashboardDataService:**
  - `private workspaces$$` (mutable store) + `activeClientId$$` (from logged-in user, or admin's
    selection) + `period$$`.
  - Read observables (via `combineLatest`): `client$`, `teams$`, `employees$` (with `hourlyRate`),
    `employeesByTeam$`, `employeeHoursBreakdown$` (SR&ED vs Unclaimed per employee),
    `teamHoursBreakdown$` (SR&ED vs Unclaimed per team), `projectSummaries$`, `grandTotals$`,
    `projection$`, `expenditureSummary$`, `vendorInvoices$` (period-filtered), `governmentAssistance$`.
  - `employeeBreakdown(id, period)` for the detail modal.
  - Feedback: `feedback$` (all, for admin), `addFeedback(message, rating)` (tagged to active client).
  - CRUD: `add/update/removeEmployee`, `add/update/removeProject` (cascades), `add/update/removeVendorInvoice`,
    `setGovernmentAssistance(amount)`, `setSredCreditRate(clientId, rate)` (admin-only),
    `setPeriod(p)`, `setActiveClient(id)`. All downstream observables react automatically.

---

## Routing & Guards
- `/login` — login page (public).
- `/dashboard` — the one-page dashboard (guard: any authenticated user; client data scoped to them).
- `/admin/feedback` — admin feedback panel (guard: authenticated **and** role === admin).
- `/admin/settings` — admin client settings: edit each client's `sredCreditRate` (adminGuard).
- `authGuard` (logged in) and `adminGuard` (admin role) as functional route guards.

---

## Component Build Order (one at a time, after data + auth layer)

Each component is standalone, takes typed inputs from the services, and is reviewed before the next.

1. **App shell + router + Tailwind/Flowbite/ApexCharts + animation setup** — router-outlet,
   smooth-scroll CSS, on-scroll-reveal directive (IntersectionObserver), count-up util; styled page renders.
2. **Login page** (req G) — username + password form against seeded users; routes by role
   (client → /dashboard, admin → /admin/feedback).
3. **Navbar** (req 2) — Flowbite navbar; brand, client name, logged-in user, time zone, logout;
   in-page anchor links that smooth-scroll to each section.
4. **Header / client info card** (req 1) — client name, fiscal date range, "as of" date.
5. **Period selector** (req B) — tabbed control (Q1–Q4 / H1 / H2 / Full Year) bound to `setPeriod`.
6. **Employee salary grid + CRUD + detail modal** (req 3, C, D) — table with name, team, province,
   dates, expected & confirmed salary, derived hourly rate (from effectiveSalary), special-employee
   badge; row click → read-only detail modal (SR&ED vs Unclaimed split, SR&ED hours, total hours,
   allocation %); add/edit/remove via form.
7. **Employee hours chart** (req H) — stacked bar per employee: SR&ED vs Unclaimed hours (pg. 4).
8. **Teams table** (req D) — teams with member counts and aggregated hours; includes "Unassigned".
9. **Team hours chart** (req H) — stacked bar per team (and/or per member within team): SR&ED vs
   Unclaimed hours (pg. 4).
10. **Per-project chart + project CRUD** (req 4, F) — combo/grouped bar of hours and $ per project
    (each project's $ = labor + assigned vendor invoices; optionally stacked); add/edit/remove projects.
11. **All-projects summary** (req 5) — summary chart + totals strip with grand-total hours & $.
12. **Other Expenses** (req E) — Vendor Invoices CRUD table + Government Assistance input.
13. **Year projection** (req 6) — KPI cards (YTD vs projected full-year hours & $, count-up animated)
    + projection chart; SR&ED-credit callout (labor + vendor − assistance).
14. **Feedback button + submit modal** (req G) — floating button; modal with message + 1–5 rating;
    submits feedback tagged to the active client.
15. **Admin feedback panel + settings** (req G) — `/admin/feedback` lists all client feedback
    (client, rating, date, message; filter/sort by client); `/admin/settings` edits each client's
    SR&ED credit rate.
16. **Polish pass** — responsive layout, loading skeletons, empty states, animation timing, consistency.

---

## Animations (req A) — how
- **Smooth scrolling:** `html { scroll-behavior: smooth }` + anchor nav from the navbar.
- **On-scroll reveal:** `appReveal` directive using `IntersectionObserver` toggling a transition class.
- **Count-up:** a lightweight util/directive animating numeric totals with `requestAnimationFrame`.
- **Charts:** ApexCharts built-in `animations`; re-render on period change animates transitions.
- **Modal & rows:** Tailwind transitions for modal open/close and row hover.
- **Loading:** skeleton placeholders until the store emits seeded data.

---

## Setup steps (Phase 0)
- `ng new sred-dashboard` (standalone, **with routing**, SCSS or CSS).
- Install & configure Tailwind (`tailwind.config.js` content globs) + Flowbite plugin.
- `npm i flowbite ng-apexcharts apexcharts`.
- Register `provideHttpClient()` and `provideRouter()` in `app.config.ts`.
- Confirm dev server renders a Tailwind-styled element + a sample ApexChart.

> Note: the project will likely be scaffolded **inside this repo root** (which currently holds only
> the PDF). Decide whether to nest under `app/` or scaffold at root during implementation.

---

## Verification
- **Data layer:** add a temporary debug route/log (or a small unit test) asserting:
  - salary fallback works: confirmed used when present (Kaitlyn→$45 from $90k), expected otherwise
    (Anne→$30 from $60k, Michael→~$24.03 from $50k);
  - the PDF worked example reproduces (10h@$100 + 20h@$20 + 50h@$10 = 80h, $1,900);
  - period math: FY = Q1+Q2+Q3+Q4, H1 = Q1+Q2, H2 = Q3+Q4;
  - grand totals equal the sum of per-project totals (labor + vendor);
  - projection: `projectedFullYearHours * fractionElapsed ≈ ytdHours`;
  - CRUD: add/remove employee/project/invoice updates summaries; project remove cascades;
  - credit: SR&ED vendor invoices raise `totalSredExpenditure`; assistance lowers `creditableBase`.
- **Auth/feedback:** login as Afiniti/Salesflo scopes the dashboard to that client; admin login lands
  on the feedback panel and sees feedback submitted by both clients; guards block unauthorized routes;
  admin editing a client's `sredCreditRate` changes that client's `creditAmount`.
- **Per component:** run `ng serve`, visually confirm; verify period switching updates all
  charts/grids; check responsive behavior at mobile/desktop widths.
- **Final:** all 6 PDF requirements + period selector + full CRUD + teams + vendors + auth/feedback
  working; `ng build` succeeds with no errors.
