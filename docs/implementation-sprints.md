# SR&ED Dashboard — Sprint Implementation Plan

> **Companion document.** `docs/sred-dashboard-plan.md` is the frozen design reference (the "what"
> and "why"). **This** document is the execution plan (the "how", sprint by sprint). At the end of
> the project, verify the delivered app against the original plan's requirements (PDF reqs 1–6 +
> features A–H). Engineering practices for every sprint: `docs/rules.md` (Zen + functional
> programming + agent conduct). State is **RxJS observables only — no Angular signals**.

---

## How to read this plan

- **One sprint = one feature.** A sprint is the smallest shippable slice that delivers a single
  capability end-to-end (data → service → UI → verification). Sprints are ordered so each only
  depends on earlier ones.
- **Foundation sprints (S0–S4)** build the non-visual groundwork (tooling, models, seed data, the
  data service, animation utilities). They are prerequisites, not user-facing features, but each is
  still a single focused unit of work.
- **Feature sprints (S5+)** each deliver exactly one user-facing capability.
- Every sprint uses the same template:
  - **Feature** — the single capability delivered.
  - **Goal / why** — the user value or technical purpose.
  - **Depends on** — sprints that must be complete first.
  - **In scope** — what gets built.
  - **Out of scope** — explicitly deferred, to keep the sprint to one feature.
  - **Files** — created or modified.
  - **Steps** — the ordered work.
  - **Data / service touchpoints** — what this sprint reads or adds in the data layer.
  - **Acceptance criteria** — observable conditions that mean "done".
  - **Verification** — how to prove it (run, click, test).
  - **Practices** — the rules.md principles most relevant here.
- **Definition of Done (global), applied to every sprint:**
  - Compiles with no TypeScript or template errors; `ng build` succeeds.
  - No console errors/warnings introduced.
  - No Angular signals used; reactive state via observables + `async` pipe.
  - No in-place mutation of data; new values produced functionally (map/filter/reduce/spread).
  - The sprint's acceptance criteria are demonstrably met (not assumed — verified).
  - Code reviewed by the user before the next sprint begins (the user's stated working style).

---

## Sprint Checkpoint Gate (mandatory between every sprint)

**Work one sprint at a time. At the end of each sprint, STOP and ask the user for explicit
permission before starting the next sprint** — so the user can check and verify the work done up to
that point.

- After finishing sprint **Sn**, present a short completion summary:
  - what was built, the files touched, how the acceptance criteria were verified (with evidence),
    and anything noteworthy or deviating from plan.
  - **commit the sprint's work** with a clear message (e.g. `S0: foundation & tooling`).
  - then ask: *"Sprint Sn is complete, verified, and committed — may I proceed to S(n+1)?"*
- **Do not begin S(n+1) until the user approves.** The user may instead request fixes, ask
  questions, or re-scope — handle those, re-verify, and ask again.
- This gate is non-negotiable and applies to every sprint boundary, including foundation sprints.
- Rationale: the user's working style is to understand and verify each piece before moving on
  (and rules.md: refuse to guess, verify before asserting completion).

---

## Development Permissions — Non-Interrupting Allowlist

These routine, low-risk development actions should be **pre-approved so they don't interrupt the
flow** during a sprint. (To be applied via the project's `.claude/settings.json` allow-list on
approval, and reflected in this plan's exit permissions.)

**Auto-allowed (no prompt):**
- **Angular CLI:** `ng new`, `ng serve`, `ng build`, `ng generate`/`ng g`, `ng test`, `ng lint`.
- **Package management:** `npm install`, `npm ci`, `npm run *`, `npx *` (e.g. tailwind init).
- **Read-only inspection:** `ls`, `cat`, `pwd`, `node --version`, `npm --version`,
  `git status`, `git diff`, `git log`, `git branch`.
- **Project file edits:** create/modify files **within the project working directory**
  (`src/**`, config files, `docs/**`) via Edit/Write.
- **Dev server / process checks** needed to verify a sprint (start dev server, read its output).

**Still requires explicit confirmation (NOT auto-allowed):**
- Any **destructive** command: `rm`/`rm -rf`, `git reset --hard`, `git clean`, force-overwriting
  unrelated files, deleting directories.
- **Git history / remote:** `git commit`, `git push`, `git rebase`, tag/branch deletion, PR creation.
- **Network/publishing:** `npm publish`, deploys, sending data to external services.
- **Anything outside the project directory** or changes to global/user config.
- Installing **new dependencies not already in the plan** (confirm the package first).

Errors from any allowed command must still be surfaced, never silently swallowed (rules.md #10).

---

## Sprint Map (at a glance)

| #   | Sprint title                          | Single feature                                 | Maps to        |
|-----|---------------------------------------|------------------------------------------------|----------------|
| S0  | Foundation & tooling                  | Project scaffold + Tailwind/Flowbite/ApexCharts/router | (infra)  |
| S1  | Domain models                         | TypeScript interfaces                          | (data)         |
| S2  | Seed dataset                          | Multi-client mock JSON                         | (data)         |
| S3  | Data service & derivations            | `DashboardDataService` (pure derived data)     | (data)         |
| S4  | Animation utilities                   | Smooth scroll + reveal directive + count-up    | Feature A      |
| S5  | Authentication & login                | Mock auth, login page, route guards            | Feature G (auth) |
| S6  | Navigation bar                        | Navbar                                         | Req 2          |
| S7  | Client info header                    | Header card                                    | Req 1          |
| S8  | Period selector                       | Q1–Q4 / H1 / H2 / FY selector                  | Feature B      |
| S9  | Employee salary grid                  | Read-only employee table                       | Req 3          |
| S10 | Employee CRUD                         | Add / edit / remove employees                  | Feature C (crud) |
| S11 | Employee detail modal                 | Per-employee SR&ED breakdown modal             | Feature C (detail) |
| S12 | Employee hours chart                  | SR&ED vs Unclaimed per employee                | Feature H (emp) |
| S13 | Teams table                           | Teams + members + "Unassigned"                 | Feature D      |
| S14 | Team hours chart                      | SR&ED vs Unclaimed per team                    | Feature H (team) |
| S15 | Per-project chart                     | Hours & $ per project                          | Req 4          |
| S16 | Project CRUD                          | Add / edit / remove projects (cascade)         | Feature F      |
| S17 | All-projects summary                  | Per-project + grand totals                     | Req 5          |
| S18 | Vendor invoices CRUD                  | Vendor invoices table + form                   | Feature E (vendors) |
| S19 | Government assistance & credit        | Assistance input + SR&ED credit calc           | Feature E (credit) |
| S20 | Year projection                       | YTD vs projected full-year + credit            | Req 6          |
| S21 | Feedback submission                   | Floating button + feedback modal               | Feature G (feedback) |
| S22 | Admin feedback panel                  | All-client feedback view                       | Feature G (admin) |
| S23 | Admin client settings                 | Configurable `sredCreditRate` per client       | Feature G (config) |
| S24 | Polish & responsiveness               | Skeletons, empty states, responsive, timing    | (cross-cutting) |

---

# Foundation Sprints

## S0 — Foundation & Tooling

- **Feature:** A runnable, styled, routed Angular shell.
- **Goal / why:** Everything downstream needs a working app with Tailwind, Flowbite, ApexCharts,
  HttpClient, and the router wired up. Get one styled element and one sample chart rendering so the
  toolchain is proven before any real feature is built.
- **Depends on:** nothing.
- **In scope:**
  - `ng new sred-dashboard` — standalone components, **with routing**, CSS (or SCSS).
  - Install and configure Tailwind CSS (`tailwind.config.js` content globs covering
    `./src/**/*.{html,ts}`), PostCSS, and the base `@tailwind` directives in the global stylesheet.
  - Install and register the Flowbite plugin in `tailwind.config.js`; import Flowbite JS where needed.
  - Adopt the **project palette** (`task-research/palette.css`): copy it into
    `src/styles/palette.css` (CSS variables), `@import` it in `styles.css`, and map the Tailwind
    theme to it — `brand` = royalblue primary (#007bff), `logo`/`sky`/`ink` = sredi brand colors,
    plus semantic `success`/`danger`/`warning`/`info`. This is the single source of truth for color.
  - `npm i flowbite ng-apexcharts apexcharts`.
  - Configure `app.config.ts` providers: `provideRouter(routes)`, `provideHttpClient()`.
  - A throwaway "hello" view with one Tailwind-styled card and one sample ApexChart to prove wiring.
- **Out of scope:** any real data, models, services, or feature UI.
- **Files:** `package.json`, `angular.json`, `tailwind.config.js`, `postcss.config.js`,
  `src/styles.css`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/app.component.*`.
- **Steps:**
  1. Decide scaffold location (root vs nested `app/`); scaffold the project.
  2. Add Tailwind + PostCSS; verify a `bg-*`/`text-*` class renders.
  3. Add Flowbite plugin; verify a Flowbite component (e.g. a button) styles correctly.
  4. Add `ng-apexcharts`; render a sample bar chart.
  5. Wire `provideRouter` + `provideHttpClient`; add a placeholder route.
- **Data / service touchpoints:** none.
- **Acceptance criteria:** `ng serve` shows a Tailwind-styled card and an ApexChart with no console
  errors; `ng build` passes.
- **Verification:** run `ng serve`, open the browser, confirm styling + chart; run `ng build`.
- **Practices:** simple is better than complex (S0 proves the stack, nothing more); explicit setup.

## S1 — Domain Models

- **Feature:** The TypeScript interfaces that type the entire app.
- **Goal / why:** A precise, explicit type layer is the contract every later sprint relies on.
  Defining it once prevents drift and ambiguity (Zen: explicit > implicit).
- **Depends on:** S0.
- **In scope:** all interfaces from the design doc — `Period`, `QuarterlyHours`, `Role`, `User`,
  `Client`, `Team`, `Employee` (with `confirmedSalary`/`expectedSalary`, `isSpecialEmployee`,
  `teamId`), `Project`, `TimesheetEntry`, `VendorInvoice`, `Feedback`, `ClientWorkspace`,
  `DashboardSeed`. A barrel `index.ts` re-exporting them.
- **Out of scope:** any data values, any logic. Pure type declarations only.
- **Files:** `src/app/models/*.model.ts`, `src/app/models/index.ts`.
- **Steps:**
  1. Create one file per concern (readability + namespaces, Zen #19).
  2. Mark derived fields (e.g. `effectiveSalary`, `hourlyRate`) as **not** stored — comment only.
  3. Export everything through the barrel.
- **Data / service touchpoints:** defines the shapes; no instances yet.
- **Acceptance criteria:** interfaces compile; importing from `models` works; no `any`.
- **Verification:** `ng build`; a scratch import resolves all types.
- **Practices:** explicit > implicit; flat one-concern-per-file; namespaces (barrel export).

## S2 — Seed Dataset

- **Feature:** The multi-client mock dataset.
- **Goal / why:** The data the user asked to build first. Realistic, screenshot-shaped figures that
  exercise every requirement (periods, teams, vendors, SR&ED vs unclaimed, salary fallback).
- **Depends on:** S1.
- **In scope:**
  - `src/assets/data/dashboard-data.json` shaped as `DashboardSeed`.
  - `users`: `afiniti` (client), `salesflo` (client), `admin` (admin); shared password.
  - `workspaces`: **Afiniti** (fuller) and **Salesflo** (lighter). Each workspace has a `Client`
    (with `fiscalYearStart` 2025-01-01, `fiscalYearEnd` 2025-12-31, `asOfDate` ~2025-11-15,
    `standardAnnualHours` 2000, `sredCreditRate` ~0.445), ~6–8 employees (mix of confirmed-only,
    expected-only, both; some `isSpecialEmployee`; some `teamId: null`), ~2–3 teams, ~5 projects
    incl. one "Unclaimed Work" (`isSred: false`), per-quarter timesheet entries, ~3 vendor invoices
    (some `isSred`), and a `governmentAssistanceTotal`.
  - Salary anchors verifiable against screenshots (Anne expected $60k→$30, Kaitlyn confirmed
    $90k→$45, Michael expected $50k→~$24.03).
  - Include the PDF worked example somewhere reproducible (10h@$100 + 20h@$20 + 50h@$10 → 80h, $1,900).
- **Out of scope:** loading/parsing logic, any derivation (that's S3).
- **Files:** `src/assets/data/dashboard-data.json`.
- **Steps:**
  1. Author Afiniti workspace with realistic quarterly hours that sum to sensible YTD totals.
  2. Author the lighter Salesflo workspace.
  3. Add users + a small initial `feedback` array (a couple of entries per client for the admin view).
  4. Sanity-check numbers by hand against the salary and worked-example anchors.
- **Data / service touchpoints:** the seed itself.
- **Acceptance criteria:** JSON is valid and conforms to `DashboardSeed`; anchors compute correctly
  by hand; every requirement has data to display.
- **Verification:** JSON lint; a temporary `HttpClient` fetch logs the parsed object typed as
  `DashboardSeed` with no type errors.
- **Practices:** explicit data; refuse to guess (numbers chosen to satisfy stated anchors).

## S3 — Data Service & Derivations

- **Feature:** `DashboardDataService` — loads the seed and exposes pure derived data via observables.
- **Goal / why:** The single reactive source of truth. All totals/projections/credit are computed
  here as **pure functions** of the data, so the UI stays dumb and every number is testable.
- **Depends on:** S2 (and S1 types).
- **In scope:**
  - Load JSON once via `HttpClient` into `private workspaces$$ = new BehaviorSubject<ClientWorkspace[]>()`.
  - `activeClientId$$` and `period$$` BehaviorSubjects; `setActiveClient(id)`, `setPeriod(p)`.
  - Pure helpers: `effectiveSalary`, `hourlyRate`, `periodHours`, `entryAmount`.
  - Derived observables via `combineLatest` (all recomputed, never mutated): `client$`, `teams$`,
    `employees$` (with `hourlyRate`), `employeesByTeam$`, `employeeHoursBreakdown$`,
    `teamHoursBreakdown$`, `projectSummaries$`, `grandTotals$`, `projection$`,
    `expenditureSummary$`, `vendorInvoices$` (period-filtered), `governmentAssistance$`.
  - `employeeBreakdown(id, period)` for the detail modal.
  - All mutators (added in later sprints) will emit new arrays, never edit in place.
- **Out of scope:** CRUD mutators (introduced with their owning feature sprints), feedback (S21),
  any UI.
- **Files:** `src/app/services/dashboard-data.service.ts`, plus small pure util(s) if helpful
  (`src/app/core/derivations.ts`).
- **Steps:**
  1. Implement the load + the two control subjects.
  2. Implement pure helpers as standalone functions (composition over methods where natural).
  3. Build each derived observable; keep transformations declarative (map/reduce, no loops mutating).
  4. Add `employeeBreakdown`.
- **Data / service touchpoints:** reads the whole seed; scopes outputs to `activeClientId$$`.
- **Acceptance criteria:** derived observables emit correct values for the active client and period;
  changing period/client re-emits; nothing is mutated in place.
- **Verification:** a temporary debug component (removed in S24) subscribes and logs; assert the
  salary fallback, worked example, period math (FY=Q1+..+Q4, H1, H2), and grand-total = Σ project
  totals. Optionally a Jasmine spec for the pure helpers.
- **Practices:** pure functions; immutability; declarative pipelines; errors never pass silently.

## S4 — Animation Utilities

- **Feature:** Reusable animation primitives (Feature A foundation).
- **Goal / why:** Centralize the animation toolkit once so feature sprints just apply it. Keeps
  animations consistent and the feature code clean.
- **Depends on:** S0.
- **In scope:**
  - Global smooth scrolling: `html { scroll-behavior: smooth }`.
  - `appReveal` directive: `IntersectionObserver` toggles a transition class (fade + translate-y)
    when an element scrolls into view.
  - `countUp` directive/util: animates a number from 0 to a target with `requestAnimationFrame`.
  - A shared set of Tailwind transition classes for cards, rows, and modals.
- **Out of scope:** applying these to real features (each feature sprint applies them itself).
- **Files:** `src/app/shared/reveal.directive.ts`, `src/app/shared/count-up.directive.ts`,
  `src/styles.css` (smooth scroll + transition utilities).
- **Steps:**
  1. Add smooth-scroll CSS.
  2. Implement and unit-demo the `appReveal` directive.
  3. Implement the count-up directive; guard against re-entrancy and respect
     `prefers-reduced-motion`.
- **Data / service touchpoints:** none.
- **Acceptance criteria:** a demo element reveals on scroll; a demo number counts up; reduced-motion
  disables non-essential animation.
- **Verification:** scratch page exercising both directives.
- **Practices:** composition; isolate side effects (DOM/observer) behind a directive boundary.

---

# Feature Sprints

## S5 — Authentication & Login (Feature G: auth)

- **Feature:** Mock login with seeded users and route protection.
- **Goal / why:** Gate the app and establish "who is logged in", which scopes the dashboard to a
  client and unlocks the admin views.
- **Depends on:** S2 (users), S3 (active client wiring).
- **In scope:**
  - `AuthService`: `login(username, password)` validates against seeded `users`; `logout()`;
    `currentUser$` (BehaviorSubject); `isAdmin$`.
  - `/login` page: username + password form; on success route by role (client → `/dashboard`,
    admin → `/admin/feedback`); show an explicit error on bad credentials (never fail silently).
  - On client login, call `setActiveClient(user.clientId)`.
  - Functional guards: `authGuard` (logged in) and `adminGuard` (admin role).
  - Route table: `/login`, `/dashboard` (authGuard), `/admin/feedback` + `/admin/settings`
    (adminGuard), default redirect.
- **Out of scope:** real security, password hashing, persistence across reloads (optional later),
  the dashboard/admin contents themselves.
- **Files:** `src/app/services/auth.service.ts`, `src/app/pages/login/*`,
  `src/app/core/guards.ts`, `src/app/app.routes.ts`.
- **Steps:**
  1. Implement `AuthService` against the seed users.
  2. Build the login form (Flowbite inputs), with visible validation/error state.
  3. Implement guards and wire the route table.
  4. Verify role-based redirect.
- **Data / service touchpoints:** reads `users`; sets `activeClientId$$`.
- **Acceptance criteria:** correct credentials log in and route by role; wrong credentials show an
  error; guards block direct navigation to protected routes when logged out / non-admin.
- **Verification:** log in as `afiniti`, `salesflo`, `admin`; try a bad password; deep-link
  `/admin/settings` while logged out and as a client — both blocked.
- **Practices:** explicit error surfacing; refuse to guess (invalid login → ask again, no silent pass).

## S6 — Navigation Bar (Req 2)

- **Feature:** The top navigation bar.
- **Goal / why:** Persistent chrome for orientation and in-page navigation; satisfies PDF req 2.
- **Depends on:** S3 (`client$`), S5 (current user, logout), S4 (smooth-scroll anchors).
- **In scope:** Flowbite navbar with brand/logo, active client name, logged-in user, time zone,
  logout button, and anchor links that smooth-scroll to each dashboard section.
- **Out of scope:** the sections themselves; admin nav (admin uses its own shell).
- **Files:** `src/app/components/navbar/*`, included in the dashboard layout.
- **Steps:** build the navbar; bind `client$`/`currentUser$` via `async`; wire logout; add anchor
  links (targets are filled in as sections land).
- **Data / service touchpoints:** reads `client$`, `currentUser$`.
- **Acceptance criteria:** navbar shows correct client/user/zone; logout returns to `/login`; anchor
  links scroll smoothly.
- **Verification:** visual; click logout; click each anchor.
- **Practices:** readability; declarative binding via `async`.

## S7 — Client Info Header (Req 1)

- **Feature:** The client information header card.
- **Goal / why:** Satisfies PDF req 1 — show who the dashboard is for and the reporting window.
- **Depends on:** S3 (`client$`).
- **In scope:** a header card with client name, fiscal date range, and "as of" date; `appReveal`
  entrance animation.
- **Out of scope:** any metrics (those are dedicated sprints).
- **Files:** `src/app/components/client-header/*`.
- **Steps:** build the card; bind `client$`; apply reveal animation.
- **Data / service touchpoints:** reads `client$`.
- **Acceptance criteria:** header reflects the active client and updates when the active client
  changes.
- **Verification:** visual for Afiniti vs Salesflo.
- **Practices:** simple, sparse layout; explicit data binding.

## S8 — Period Selector (Feature B)

- **Feature:** Global period selector (Q1–Q4 / H1 / H2 / Full Year).
- **Goal / why:** One control that drives every metric, grid, and chart by time period.
- **Depends on:** S3 (`period$$`, `setPeriod`).
- **In scope:** a tabbed/segmented control bound to `setPeriod`; visually animated active state;
  the chosen period is reflected app-wide via the service.
- **Out of scope:** the consumers (each consuming sprint reads the period from the service).
- **Files:** `src/app/components/period-selector/*`.
- **Steps:** build the control; bind selection to `setPeriod`; animate the active indicator.
- **Data / service touchpoints:** writes `period$$`.
- **Acceptance criteria:** selecting a period updates `period$$`; any already-built consumer
  recomputes (e.g. header-adjacent KPI if present).
- **Verification:** change periods, observe a subscribed debug value change.
- **Practices:** one obvious control; declarative state.

## S9 — Employee Salary Grid (Req 3)

- **Feature:** Read-only employee salary table.
- **Goal / why:** Satisfies PDF req 3 — every employee with salary and equivalent hourly rate.
- **Depends on:** S3 (`employees$` with `hourlyRate`).
- **In scope:** a table listing name, team, province, start/end dates, expected salary, confirmed
  salary, derived hourly rate (from `effectiveSalary`), and a special-employee badge; row reveal
  animation; loading skeleton placeholder.
- **Out of scope:** CRUD (S10), detail modal (S11), charts (S12).
- **Files:** `src/app/components/employee-grid/*`.
- **Steps:** build the table; bind `employees$`; show the special-employee badge; format currency.
- **Data / service touchpoints:** reads `employees$`.
- **Acceptance criteria:** all active-client employees appear with correct derived hourly rates
  (confirmed-over-expected fallback visibly correct).
- **Verification:** compare displayed hourly rates to the salary anchors.
- **Practices:** readability; explicit derived-vs-stored distinction in the UI.

## S10 — Employee CRUD (Feature C: crud)

- **Feature:** Add / edit / remove employees.
- **Goal / why:** Make the roster editable; the grid becomes interactive.
- **Depends on:** S9.
- **In scope:** add `addEmployee`/`updateEmployee`/`removeEmployee` to the service (functional,
  immutable updates); a Flowbite modal form (name, province, dates, expected & confirmed salary,
  special flag, team dropdown); validation with explicit errors; confirm-before-delete.
- **Out of scope:** the detail modal (S11); team CRUD (teams are fixed seed).
- **Files:** `dashboard-data.service.ts` (mutators), `src/app/components/employee-form/*`,
  wiring in the grid.
- **Steps:** implement immutable mutators; build the modal form + validation; wire add/edit/remove
  buttons; animate modal open/close.
- **Data / service touchpoints:** mutates the active workspace's `employees` via new arrays.
- **Acceptance criteria:** adding/editing/removing updates the grid and any dependent totals
  immediately; invalid input is blocked with a visible message; the store is never mutated in place.
- **Verification:** add an employee → appears; edit salary → hourly rate + project totals update;
  remove → disappears and totals drop.
- **Practices:** immutability (new arrays); explicit validation; errors never silent.

## S11 — Employee Detail Modal (Feature C: detail)

- **Feature:** Read-only per-employee SR&ED breakdown modal (screenshot pg. 5).
- **Goal / why:** Let a user inspect one employee's hours split and SR&ED allocation.
- **Depends on:** S9, S3 (`employeeBreakdown`).
- **In scope:** clicking a grid row opens a modal showing the employee's per-project hours split
  into SR&ED projects vs Unclaimed Work, plus SR&ED hours, total hours, and SR&ED allocation %;
  respects the selected period; modal open/close animation.
- **Out of scope:** editing from the detail modal (edit lives in S10's form).
- **Files:** `src/app/components/employee-detail/*`.
- **Steps:** build the modal; call `employeeBreakdown(id, period)`; render the split + allocation %.
- **Data / service touchpoints:** reads `employeeBreakdown`.
- **Acceptance criteria:** the modal's numbers match the grid/charts for that employee and period;
  allocation % = SR&ED hours / total hours.
- **Verification:** open a few employees across periods; cross-check totals.
- **Practices:** pure derivation reused; readability.

## S12 — Employee Hours Chart (Feature H: employee)

- **Feature:** Stacked bar — SR&ED vs Unclaimed hours per employee (screenshot pg. 4).
- **Goal / why:** Visualize how each employee's hours split between SR&ED and unclaimed work.
- **Depends on:** S3 (`employeeHoursBreakdown$`).
- **In scope:** an ApexCharts stacked bar (x = employees, two series: SR&ED, Unclaimed), period-aware,
  with entrance/transition animation and a legend.
- **Out of scope:** team-level grouping (S14).
- **Files:** `src/app/components/employee-hours-chart/*`.
- **Steps:** map `employeeHoursBreakdown$` to ApexCharts series; configure stacking, colors, tooltip.
- **Data / service touchpoints:** reads `employeeHoursBreakdown$`.
- **Acceptance criteria:** bars reflect per-employee SR&ED/unclaimed hours for the period; switching
  period animates to new values.
- **Verification:** compare a bar's segments to that employee's detail modal.
- **Practices:** declarative data→series mapping; consistent colors.

## S13 — Teams Table (Feature D)

- **Feature:** Teams table with members and an "Unassigned" group.
- **Goal / why:** Show team structure and per-team aggregated hours.
- **Depends on:** S3 (`employeesByTeam$`).
- **In scope:** a table/section listing each team, its member count, and aggregated hours, plus a
  distinct "Unassigned" group for `teamId: null` employees.
- **Out of scope:** team CRUD; the team chart (S14).
- **Files:** `src/app/components/teams-table/*`.
- **Steps:** build the grouped view; bind `employeesByTeam$`; render the Unassigned bucket.
- **Data / service touchpoints:** reads `employeesByTeam$`.
- **Acceptance criteria:** every employee appears under exactly one group; counts and hours are
  correct for the period.
- **Verification:** sum members across groups = total employees.
- **Practices:** flat grouping; explicit Unassigned handling (no silent omission).

## S14 — Team Hours Chart (Feature H: team)

- **Feature:** Stacked bar — SR&ED vs Unclaimed hours per team (screenshot pg. 4).
- **Goal / why:** Team-level view of the SR&ED/unclaimed split.
- **Depends on:** S3 (`teamHoursBreakdown$`), S13.
- **In scope:** an ApexCharts stacked bar per team (and/or per member within a team), period-aware,
  including the Unassigned group; animated.
- **Out of scope:** per-employee chart (S12).
- **Files:** `src/app/components/team-hours-chart/*`.
- **Steps:** map `teamHoursBreakdown$` to series; configure stacking + drill grouping.
- **Data / service touchpoints:** reads `teamHoursBreakdown$`.
- **Acceptance criteria:** team segments equal the sum of their members' splits.
- **Verification:** cross-check a team's total against the teams table.
- **Practices:** declarative mapping; consistency with S12 styling.

## S15 — Per-Project Chart (Req 4)

- **Feature:** Hours and dollar amount per project.
- **Goal / why:** Satisfies PDF req 4 — for each project, hours worked and the monetary amount
  (labor Σ hours×rate, plus assigned vendor invoices).
- **Depends on:** S3 (`projectSummaries$`).
- **In scope:** an ApexCharts combo/grouped bar (hours series + $ series per project); each
  project's $ = labor + assigned vendor invoices (optionally stacked to show the split);
  period-aware; animated.
- **Out of scope:** grand totals (S17); project CRUD (S16); vendor entry (S18).
- **Files:** `src/app/components/project-chart/*`.
- **Steps:** map `projectSummaries$` to series; dual axis or paired bars for hours vs $.
- **Data / service touchpoints:** reads `projectSummaries$`.
- **Acceptance criteria:** the PDF worked example reproduces in the chart (80h, $1,900 for that
  project); values are period-correct.
- **Verification:** check the worked-example project's totals.
- **Practices:** explicit labor-vs-vendor composition; readable axes/legend.

## S16 — Project CRUD (Feature F)

- **Feature:** Add / edit / remove projects (with cascade on delete).
- **Goal / why:** Make the project list editable; deletions must not orphan references.
- **Depends on:** S15.
- **In scope:** `addProject`/`updateProject`/`removeProject` (immutable; remove cascades to that
  project's timesheet entries and vendor invoices); a Flowbite modal (name, color, is-SR&ED);
  confirm-before-delete with an explicit cascade warning.
- **Out of scope:** timesheet entry CRUD.
- **Files:** `dashboard-data.service.ts` (mutators), `src/app/components/project-form/*`.
- **Steps:** implement immutable cascade-aware mutators; build the modal; wire buttons.
- **Data / service touchpoints:** mutates `projects` and cascades into `timesheets`/`vendorInvoices`.
- **Acceptance criteria:** adding a project makes it assignable; removing it deletes its entries and
  invoices and updates all dependent totals; no orphan project ids remain.
- **Verification:** remove a project with invoices/hours → totals and charts adjust; no dangling refs.
- **Practices:** immutability; explicit cascade (no silent orphans); confirm destructive actions.

## S17 — All-Projects Summary (Req 5)

- **Feature:** Per-project totals plus grand totals across all projects.
- **Goal / why:** Satisfies PDF req 5 — hours & $ per project and the summed grand totals.
- **Depends on:** S3 (`projectSummaries$`, `grandTotals$`).
- **In scope:** a summary chart (e.g. treemap or stacked bar) + a totals strip showing grand-total
  hours and grand-total $ (labor + vendor); count-up on the grand totals.
- **Out of scope:** projection (S20).
- **Files:** `src/app/components/projects-summary/*`.
- **Steps:** render the summary; bind `grandTotals$`; animate totals with count-up.
- **Data / service touchpoints:** reads `projectSummaries$`, `grandTotals$`.
- **Acceptance criteria:** grand totals equal the sum of per-project totals for the period.
- **Verification:** add per-project values by hand and compare to the grand-total strip.
- **Practices:** numbers proven, not assumed; readable summary.

## S18 — Vendor Invoices CRUD (Feature E: vendors)

- **Feature:** Vendor invoices table with add / edit / remove.
- **Goal / why:** Capture non-labor SR&ED expenditures tied to projects.
- **Depends on:** S3 (`vendorInvoices$`), S16 (project list for the project dropdown).
- **In scope:** a table (date, number, amount, vendor, provider, project, description, is-SR&ED,
  province, status); `addVendorInvoice`/`updateVendorInvoice`/`removeVendorInvoice` (immutable);
  a Flowbite modal form; period filtering by invoice date; a vendor total row.
- **Out of scope:** government assistance + credit (S19).
- **Files:** `dashboard-data.service.ts` (mutators), `src/app/components/vendor-invoices/*`,
  `src/app/components/vendor-form/*`.
- **Steps:** implement immutable mutators; build table + modal; wire project dropdown; period-filter.
- **Data / service touchpoints:** mutates `vendorInvoices`; each invoice's `projectId` rolls into
  that project's expenditure (visible in S15/S17).
- **Acceptance criteria:** adding an SR&ED invoice to a project increases that project's $ and the
  grand total; period filter hides out-of-period invoices.
- **Verification:** add an invoice → project chart + grand total rise; switch period → filtered.
- **Practices:** immutability; explicit project linkage.

## S19 — Government Assistance & SR&ED Credit (Feature E: credit)

- **Feature:** Government assistance input and the SR&ED credit calculation.
- **Goal / why:** Complete the expenditure model — compute the creditable base and credit amount.
- **Depends on:** S18, S3 (`expenditureSummary$`, `governmentAssistance$`).
- **In scope:** a government-assistance amount input (`setGovernmentAssistance`); the credit
  computation `creditableBase = max(0, sredLabor + sredVendor − governmentAssistance)`,
  `creditAmount = creditableBase × sredCreditRate`; a small expenditure/credit breakdown card.
- **Out of scope:** the year projection of credit (S20); admin rate config (S23).
- **Files:** `dashboard-data.service.ts` (`setGovernmentAssistance`, `expenditureSummary$`),
  `src/app/components/expenditure-summary/*`.
- **Steps:** add the assistance setter; ensure `expenditureSummary$` composes labor + vendor −
  assistance × rate; build the breakdown card.
- **Data / service touchpoints:** reads SR&ED labor/vendor; writes `governmentAssistanceTotal`.
- **Acceptance criteria:** raising assistance lowers `creditableBase`/`creditAmount`; SR&ED invoices
  raise them; credit never goes negative.
- **Verification:** tweak assistance and an SR&ED invoice; watch the credit card respond.
- **Practices:** pure composition; `max(0, …)` guards against nonsense (no silent negative credit).

## S20 — Year Projection (Req 6)

- **Feature:** Full-year projection of hours, dollars, and credit.
- **Goal / why:** Satisfies PDF req 6 — project the remainder of the year via linear run-rate.
- **Depends on:** S3 (`projection$`), S19 (credit inputs).
- **In scope:** KPI cards comparing YTD vs projected full-year for hours, $, and SR&ED credit
  (count-up animated); a projection chart (YTD vs remaining); explicit note of the linear run-rate
  method and the `asOfDate` used.
- **Out of scope:** alternative projection models.
- **Files:** `src/app/components/year-projection/*`.
- **Steps:** bind `projection$`; render KPI cards + chart; label the method/`asOfDate` clearly.
- **Data / service touchpoints:** reads `projection$`, `expenditureSummary$`.
- **Acceptance criteria:** `projectedFullYear × fractionElapsed ≈ YTD`; remaining = projected − YTD;
  credit projection uses the same extrapolation.
- **Verification:** hand-check one projected figure against YTD and `fractionElapsed`.
- **Practices:** explainable implementation (Zen #17/18); explicit method labeling.

## S21 — Feedback Submission (Feature G: feedback)

- **Feature:** Client feedback submission (floating button + modal).
- **Goal / why:** Let logged-in clients submit feedback (message + 1–5 rating).
- **Depends on:** S5 (current user/client), S3.
- **In scope:** a floating feedback button (as in screenshots); a modal with a message field and a
  1–5 star rating; `addFeedback(message, rating)` tags it to the active client + timestamp; a
  success confirmation.
- **Out of scope:** the admin view (S22); statuses (explicitly none, per the user).
- **Files:** `dashboard-data.service.ts` (`feedback$`, `addFeedback`),
  `src/app/components/feedback-button/*`, `src/app/components/feedback-form/*`.
- **Steps:** add feedback state + `addFeedback`; build button + modal + star input; confirm on submit.
- **Data / service touchpoints:** appends to `feedback` (new array) tagged with client + date.
- **Acceptance criteria:** submitting adds a feedback entry for the active client; the form
  validates (message required, rating 1–5).
- **Verification:** submit as Afiniti and Salesflo; confirm entries exist (seen in S22).
- **Practices:** immutability; explicit validation.

## S22 — Admin Feedback Panel (Feature G: admin)

- **Feature:** All-client feedback view for the admin.
- **Goal / why:** The admin's primary view — read feedback from all clients.
- **Depends on:** S5 (adminGuard), S21 (feedback data).
- **In scope:** `/admin/feedback` page listing every feedback entry (client name, rating, date,
  message), with filter/sort by client and rating; an admin shell/layout.
- **Out of scope:** client settings (S23).
- **Files:** `src/app/pages/admin/feedback/*`, admin layout.
- **Steps:** build the admin shell; render `feedback$`; add client/rating filters + sort.
- **Data / service touchpoints:** reads `feedback$` (all clients).
- **Acceptance criteria:** admin sees feedback from both clients; filters/sort work; non-admins
  cannot reach the route.
- **Verification:** submit feedback as each client, log in as admin, confirm both appear; attempt
  access as a client (blocked).
- **Practices:** readability; explicit access control.

## S23 — Admin Client Settings (Feature G: config)

- **Feature:** Configurable `sredCreditRate` per client (admin-only).
- **Goal / why:** Let the admin tune each client's credit rate, which flows into that client's
  credit calculation.
- **Depends on:** S5 (adminGuard), S19 (credit calc), S22 (admin shell).
- **In scope:** `/admin/settings` listing clients with an editable `sredCreditRate`;
  `setSredCreditRate(clientId, rate)` (immutable update); validation (0–1 / sane percent).
- **Out of scope:** other client settings.
- **Files:** `dashboard-data.service.ts` (`setSredCreditRate`), `src/app/pages/admin/settings/*`.
- **Steps:** add the immutable setter; build the settings form; validate the rate.
- **Data / service touchpoints:** updates a client's `sredCreditRate`.
- **Acceptance criteria:** changing a client's rate changes that client's `creditAmount` (visible on
  that client's dashboard/projection); invalid rates are rejected with a message.
- **Verification:** change Afiniti's rate as admin; log in as Afiniti; confirm credit changed.
- **Practices:** immutability; explicit validation; errors never silent.

## S24 — Polish & Responsiveness (cross-cutting)

- **Feature:** Final UX polish pass.
- **Goal / why:** Make it beautiful and robust on all screen sizes — the recruiter-facing finish.
- **Depends on:** all prior sprints.
- **In scope:** loading skeletons everywhere data loads; empty states; responsive layouts
  (mobile→desktop); consistent spacing/typography/colors; animation timing tuning;
  `prefers-reduced-motion` respected; remove any temporary debug code from S3.
- **Out of scope:** new features.
- **Files:** across components; global styles.
- **Steps:** audit each section for loading/empty/responsive/animation; fix; remove debug scaffolding.
- **Data / service touchpoints:** none new.
- **Acceptance criteria:** no layout breakage at common breakpoints; no leftover debug logs; smooth,
  consistent animations.
- **Verification:** resize across breakpoints; throttle network to see skeletons; final `ng build`.
- **Practices:** beautiful > ugly; sparse > dense; readability counts.

---

## End-of-Project Verification (against the original plan)

Re-check the delivered app against `docs/sred-dashboard-plan.md` (the frozen reference):

- **PDF requirements 1–6:** header, navbar, employee salary grid, per-project hours+$, all-projects
  summary with grand totals, full-year projection — all present and correct.
- **Features A–H:** animations; period breakdown; employee CRUD + detail + special flag; teams;
  vendors + government assistance + credit; project CRUD; auth + multi-client + feedback + admin +
  configurable credit rate; employee & team SR&ED-vs-Unclaimed charts.
- **Data integrity anchors:** salary fallback (confirmed-over-expected), worked example
  (80h/$1,900), period math, grand-total = Σ project totals, projection run-rate identity, credit =
  `max(0, sredLabor + sredVendor − assistance) × rate`.
- **Practices (`docs/rules.md`):** no signals; immutable/functional data flow; no silent errors;
  ambiguities were raised, not guessed.
- **Build health:** `ng build` clean; no console errors; responsive at all breakpoints.
