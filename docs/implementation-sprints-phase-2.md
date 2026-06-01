# SR&ED Dashboard — Phase 2 Sprint Implementation Plan

> **Companion document.** `docs/sred-dashboard-plan-phase-2.md` is the frozen Phase 2 design reference
> (the "what"/"why"). **This** is the execution plan (the "how"), sprint by sprint. Practices:
> `docs/rules.md` (Zen + functional + agent conduct). **RxJS only — no Angular signals.** Palette,
> light theme, and all Phase 1 features/tests are preserved.

## How this plan runs
- **One sprint = one feature**, smallest shippable slice (route/UI/data → verify).
- **Sprint Checkpoint Gate (mandatory):** after each sprint I STOP, give a verified completion summary,
  **commit** that sprint, and **ask for your confirmation before starting the next** — so you can check
  what was built and whether it's right.
- **Per-sprint commit** with a clear message (e.g. `P2.1: routed client shell + sidebar`).
- **Definition of Done (every sprint):** `ng build` clean (exit 0, no errors); `ng test` green; no
  signals; immutable/functional updates; palette/theme unchanged; acceptance criteria verified (not
  assumed); user reviews before the next sprint.
- **Non-interrupting dev allowlist** (unchanged from Phase 1): `ng`/`npm`/`npx`, read-only inspection,
  in-project file edits are pre-approved; destructive/git-history/publishing actions still confirm.

## Sprint map
| #    | Sprint                                   | Single feature                                      |
|------|------------------------------------------|-----------------------------------------------------|
| P2.1 | Routed client shell + sidebar            | Sidebar (Analytics + nested Manage) + routes + feedback relocation |
| P2.2 | Analytics page + mixed grid              | Home page = KPIs/charts only, 2-col/full-width grid |
| P2.3 | CRUD pages + pagination                  | Employees/Projects/Invoices routes + table paging   |
| P2.4 | Global metric toggle + monthly data      | Hours/Expenditures/Credits dimension + monthly seed |
| P2.5 | Metric tiles + custom date range         | Quarter/month tiles + custom range filtering        |
| P2.6 | Donut fix + admin sidebar + polish       | Formatting fix, admin sidebar, responsive polish    |

---

## P2.1 — Routed client shell + sidebar + Feedback relocation
- **Feature:** A left-sidebar, routed client shell replacing the top navbar + single-scroll layout.
- **Goal / why:** Establish the professional multi-page structure everything else hangs off.
- **Depends on:** Phase 1.
- **In scope:**
  - `ClientShellComponent` (`layouts/`) = sidebar + slim top bar + `<router-outlet>`; mobile off-canvas
    drawer + backdrop.
  - `SidebarComponent` (`components/sidebar/`): brand, **Analytics** item, nested **Manage** group
    (Employees / Projects / Invoices) using `routerLink` + `routerLinkActive`; bottom: client/user,
    **Feedback** button (opens the existing feedback modal) **above Log out**.
  - Routes: client children under the shell (authGuard) — `analytics` (default redirect), `employees`,
    `projects`, `invoices`; placeholders are fine this sprint (filled in P2.2/P2.3).
  - Remove the floating feedback button; retire the top `NavbarComponent` usage.
- **Out of scope:** Analytics content assembly (P2.2), CRUD page content (P2.3), metric/tiles (P2.4/5).
- **Files:** `layouts/client-shell.component.*`, `components/sidebar/sidebar.component.*`,
  `app.routes.ts`, reuse `FeedbackButtonComponent` (relocate trigger), `pages/dashboard` → split.
- **Acceptance:** sidebar routes navigate; active item highlights; Manage group expands; mobile drawer
  toggles; Feedback opens from the sidebar; logout works; build + tests green.
- **Verification:** `ng serve`, log in as `afiniti`, click each nav item (URL changes, active state),
  open Feedback, resize to mobile (drawer).
- **Practices:** nav hierarchy, active state, escape routes (drawer), reduced-motion.

## P2.2 — Analytics page (charts/KPIs only) + mixed grid
- **Feature:** The `/analytics` home page composed of read-only visualizations in a mixed grid.
- **Goal / why:** Req: "home = Analytics, all KPIs + charts here." Cleaner than the long scroll.
- **Depends on:** P2.1.
- **In scope:** `pages/analytics/` composes client header + employee hours chart + hours&cost chart +
  teams table + team chart + per-project chart + cost-share donut + all-projects summary (grand totals)
  + year projection + SR&ED-credit headline, arranged **full-width for wide cards, `lg:grid-cols-2` for
  paired charts** (stacks on mobile). CRUD tables explicitly excluded (they move in P2.3).
- **Out of scope:** metric toggle/tiles (P2.4/5), CRUD pages (P2.3).
- **Files:** `pages/analytics/analytics.component.*`; reuse existing chart/summary/projection components.
- **Acceptance:** Analytics shows only visualizations; charts pair on desktop, stack on mobile; numbers
  match Phase 1; build + tests green.
- **Verification:** visual at 1280/768/375; cross-check a figure vs Phase 1.
- **Practices:** visual hierarchy, whitespace, responsive grid.

## P2.3 — Employees / Projects / Invoices CRUD pages + pagination
- **Feature:** The three Manage pages, each hosting an existing CRUD component, with table pagination.
- **Goal / why:** Move CRUD off the home page into dedicated routes (req); keep 50+ rows usable.
- **Depends on:** P2.1 (routes), P2.2.
- **In scope:**
  - `pages/employees/` (salary grid + add/edit/remove + SR&ED detail modal),
    `pages/projects/` (project manager + CRUD), `pages/invoices/` (vendor invoices + CRUD +
    government-assistance editor). Components reused as-is; pages are thin wrappers + a page header.
  - **Client-side pagination** (~10/page; prev/next + page numbers) on the employee + invoice tables.
- **Out of scope:** metric/period (these pages are record management).
- **Files:** `pages/employees|projects|invoices/*`; a small reusable pagination helper/component; wire
  into `EmployeeGridComponent` + `VendorInvoicesComponent` (slice the rows).
- **Acceptance:** each page renders its CRUD; add/edit/remove + cascade still work; detail modal works;
  pagination pages through 50 rows; build + tests green (CRUD specs still pass + a pagination spec).
- **Verification:** add/edit/delete on each page; seed temporarily to 50 employees to test paging; confirm
  cascade on project delete.
- **Practices:** pagination, empty states, confirm destructive actions.

## P2.4 — Global metric toggle (Hours/Expenditures/Credits) + monthly data
- **Feature:** A metric dimension driving Analytics, backed by accurate monthly data.
- **Goal / why:** Req 5/6 — toggle the whole Analytics view between hours, $, and credit; enable months.
- **Depends on:** P2.2.
- **In scope:**
  - `metric$` (BehaviorSubject `'hours'|'expenditure'|'credit'`) + `setMetric()`; a top-bar
    `MetricToggleComponent`. A metric-aware value selector so Analytics figures/charts/tiles reflect it.
  - **Data model change:** seed `timesheets[].hours` becomes **`MonthlyHours` (m1..m12)**; add a
    `quarterOf(month)` aggregation; update `periodHours` and all derivations to aggregate months → any
    range. Migrate the worked-example/anchor tests; ensure monthly sums reproduce the prior quarterly
    totals (and the 80h/$1,900 example).
- **Out of scope:** the tiles UI + custom range (P2.5).
- **Files:** `dashboard-data.service.ts` (`metric$`, monthly aggregation), `core/derivations.ts`
  (monthly + metric-aware) + specs, seed JSON (monthly), `components/metric-toggle/*`.
- **Acceptance:** toggling metric changes every Analytics number/chart; monthly→quarter sums equal the
  old quarterly values; all derivation tests pass; build + tests green.
- **Verification:** unit tests for monthly aggregation + metric selection; visual toggle on Analytics.
- **Practices:** pure functions, immutability, deterministic tests.

## P2.5 — Metric-aware quarter/month tiles + custom date range
- **Feature:** The period tiles (showing the active metric) + a custom date-range picker.
- **Goal / why:** Req 4/6 — PDF-style tiles + arbitrary ranges; replaces the segmented selector.
- **Depends on:** P2.4 (metric + monthly data).
- **In scope:** `SummaryTilesComponent` — Q1–Q4 + Year-to-Date (or 12 months when "By month"), each
  tile shows the active metric's value + its date range; clicking sets the period. A **custom date
  range** control (start/end) that filters the whole Analytics page (resolved against monthly data).
- **Out of scope:** none beyond the above.
- **Files:** `components/summary-tiles/*`, period extensions in `dashboard-data.service.ts` +
  `core/derivations.ts` (range aggregation) + specs.
- **Acceptance:** tile values match metric × period; selecting a tile/range recomputes Analytics; "By
  month" shows 12 tiles; custom range aggregates the right months; build + tests green.
- **Verification:** tests for range/month aggregation; visual tile + range selection.
- **Practices:** number formatting, accessible controls, responsive tiles.

## P2.6 — Donut value-format fix + admin sidebar + final polish
- **Feature:** The remaining fixes + admin consistency + polish pass.
- **Goal / why:** Close the formatting bug, make admin match, finish the look.
- **Depends on:** all prior.
- **In scope:**
  - **Donut fix:** add a `plotOptions.pie.donut.labels.value` formatter (currency/hours per metric) so
    the active-slice center label + tooltip format correctly.
  - **Admin sidebar:** give `/admin/*` a matching sidebar (Feedback panel / Client Settings) replacing
    the admin top navbar.
  - **Polish:** card-header consistency, spacing rhythm, hover/focus states, responsive once-over
    (1280/768/375); remove any dead code (old navbars) and the throwaway mockup note.
- **Files:** `projects-summary` (donut), `components/sidebar/*` (admin mode/variant), admin pages, styles.
- **Acceptance:** donut center/tooltip formatted; admin uses the sidebar; no horizontal overflow; build
  + tests green.
- **Verification:** hover donut slices; admin nav; resize sweep; final `ng build` + `ng test`.
- **Practices:** charts formatting, navigation consistency, layout polish.

---

## Phase 2 Definition of Done
All six sub-sprints complete, each committed and confirmed. Verify against
`docs/sred-dashboard-plan-phase-2.md`: routed sidebar (Analytics + Manage), Feedback in sidebar,
Analytics = metric-aware KPIs/tiles/charts, CRUD on dedicated pages with pagination, global metric
toggle over monthly-accurate data, custom range, donut formatting fixed, admin sidebar — with palette,
theme, RxJS-only approach, and all Phase 1 features/tests intact. Append talking points to
`docs/project-walkthrough.md`.
