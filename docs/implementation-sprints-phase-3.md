# SR&ED Dashboard — Phase 3 Sprint Implementation Plan

> **Companion document.** `docs/sred-dashboard-plan-phase-3.md` is the Phase 3 design reference
> (the "what"/"why"). **This** is the execution plan (the "how"), sprint by sprint. Practices:
> `docs/rules.md` (Zen + functional + agent conduct). **RxJS only — no Angular signals.** Palette,
> light theme, and all Phase 1–2 features/tests are preserved.

## How this plan runs
- **One sprint = one feature**, smallest shippable slice (data → UI → verify).
- **Sprint Checkpoint Gate (mandatory):** after each sprint I STOP, give a verified completion summary,
  **commit** that sprint, and **ask for your confirmation before starting the next**.
- **Per-sprint commit** with a clear message (e.g. `P3.1: branding + sidebar profile chip`).
- **Definition of Done (every sprint):** `ng build` clean (exit 0); `ng test` green; no signals;
  immutable/functional updates; palette/theme unchanged; acceptance criteria verified (not assumed);
  user reviews before the next sprint.
- **Carried-over numbering:** internal commits continue the `P2.x` sequence in git history (last shipped
  was `P2.30`); these are the same six features as Phase 3's P3.1–P3.6, just sequential commit tags.

## Confirmed decisions
- **Logo:** user drops `src/assets/images/logo.svg` (or `.png`) + replaces `src/favicon.ico`; markup is
  wired to that path (no text in the brand block).
- **Sidebar user:** bottom block becomes a **profile chip** (initials avatar + name + role), non-interactive.
- **Manage stat cards:** **recommended** per-page metrics (full year).
- **"Analytics" → "Overview":** **label only**; route stays `/analytics`.

## Sprint map
| #    | Sprint                                  | Single feature                                                 |
|------|-----------------------------------------|----------------------------------------------------------------|
| P3.1 | Branding + sidebar                      | Company logo + favicon, remove brand text, "Overview" label, profile chip |
| P3.2 | Period-reactive SR&ED projection (logic)| `buildProjection(ws, period)` + period-reactive `projection$`  |
| P3.3 | YTD card redesign + remove blue strip   | 4 compact cards (current/projected), credit white+green, donut full-width |
| P3.4 | Manage-page stat cards                  | Replace client-header with full-year stat cards per page       |
| P3.5 | Project contributor rate + cost         | Per-contributor hourly rate + cost in the project modal        |
| P3.6 | Team per-member breakdown               | Members list (employee · rate · total cost) in the team modal  |
| P3.7 | Login page redesign                     | Two-panel split — brand hero (left) + sign-in form (right)     |
| P3.8 | Overview UX polish (post-review)        | Chart scroll-jump fix, route loader, period-control merge, slim tiles, client-header declutter |
| P3.9 | Visual polish pass (post-review)        | Rocket logo + favicon + floating default + bg gradient (a); Year Projection (b); expenditure (c); grid spacing (d); project modal (e) |

---

## P3.1 — Branding + sidebar
- **Feature:** Replace the generic "SR&ED Projections" branding with the company logo + favicon, and turn
  the sidebar footer into a proper user profile chip.
- **Goal / why:** First-impression credibility; the placeholder "S" mark + text reads unbranded, and the
  client/displayName text block is weak.
- **Depends on:** Phase 2 (sidebars, AuthService `currentUser$`).
- **In scope:**
  - Both sidebars (`components/sidebar/sidebar.component.html`, `admin-sidebar.component.html`): brand block
    becomes `<img src="assets/images/logo.svg" alt="<company>">` only — remove the `bg-logo "S"` square and
    the "SR&ED"/"Projections"/"Admin" text.
  - `src/index.html`: update the favicon `<link>` and `<title>`.
  - Rename the nav label **"Analytics" → "Overview"** (label only; `/analytics` route + default redirect
    unchanged).
  - Bottom **profile chip**: initials avatar (from `currentUser.displayName`) + name + role
    ("Client"/"Admin"); add a small `initials()` helper to the sidebar component(s). Keep Feedback (client)
    and Log out where they are.
- **Out of scope:** routing changes; any data/logic.
- **Files:** `components/sidebar/sidebar.component.{ts,html}`, `components/sidebar/admin-sidebar.component.{ts,html}`,
  `src/index.html`, `src/assets/images/logo.svg` (user-provided).
- **Acceptance:** logo renders in both sidebars (once the file is dropped); no brand text; "Overview" label;
  favicon/title updated; profile chip shows the logged-in user + role; build + tests green.
- **Verification:** `ng serve`, log in as `afiniti` and as `admin`; confirm logo, label, chip, favicon tab icon.
- **Practices:** alt text on the logo, icon-consistency, contrast on the dark sidebar.

## P3.2 — Period-reactive, SR&ED-only Year Projection (logic)
- **Feature:** Make the projection reflect the selected period (and stay SR&ED-only) instead of always full-year.
- **Goal / why:** User wants "by Q1 the projection was X; pick Q2 and it changes." The gauge should show the
  period's share of the year (Q1 → 25%) and the figures should scale to a full-year run-rate from that period.
- **Depends on:** Phase 2 (`buildExpenditureSummary`, `monthsOf`, `period$`).
- **In scope:**
  - `core/derivations.ts`: `buildProjection(ws)` → **`buildProjection(ws, period)`**. YTD = the period's
    SR&ED hours (SR&ED-project hours) + `buildExpenditureSummary(ws, period)` for SR&ED labor+vendor + credit;
    `fractionElapsed = monthsOf(period).length / 12`; `projected = ytd / fraction`.
  - `services/dashboard-data.service.ts`: `projection$` becomes
    `combineLatest([activeWorkspace$, period$$]) → buildProjection(w, p)`.
  - Tests: update/extend the projection specs (period share, Q1 vs FY, unclaimed excluded).
- **Out of scope:** any UI restyle (that's P3.3); the asOfDate `fractionElapsed()` utility stays (no longer
  drives the projection).
- **Files:** `core/derivations.ts`, `services/dashboard-data.service.ts`, `core/derivations.spec.ts`.
- **Acceptance:** Q1 → fraction ≈ 0.25 + Q1 SR&ED figures + projected ≈ ×4; FY → 1.0 + projected = YTD;
  changing the period changes every projection figure; build + tests green.
- **Verification:** `ng serve`, toggle Q1/Q2/H1/FY and watch the projection numbers/gauge change (visible
  after P3.3 reflows the cards, but assertable now via tests).
- **Practices:** pure function, single source of truth, immutability.

## P3.3 — YTD card redesign + remove the blue strip
- **Feature:** Compact the Year-Projection into a clean 4-card row and retire the now-redundant blue
  grand-totals strip.
- **Goal / why:** The projection banner is too tall; once it's period-reactive it becomes the page's
  functional summary, so the blue strip is redundant. Cleaner, denser, on-brand.
- **Depends on:** P3.2.
- **In scope:**
  - `components/year-projection/year-projection.component.html`: a **row of 4 compact equal cards**
    (`sm:grid-cols-2 lg:grid-cols-4`), stat-card style (icon · label · big number):
    (1) **Fiscal-year elapsed** %, (2) **SR&ED hours**, (3) **SR&ED expenditure**, (4) **SR&ED credit**.
    In cards 2–4: **current value left, projected full-year right** (short cards, no stacked footer).
    Credit card = **white** with the number in **green + a green shadow** (not a full-green card).
  - Put the **labor + SR&ED-vendor split** as a sub-line on the expenditure card (from `expenditureSummary$`).
  - `components/projects-summary/projects-summary.component.html`: **remove the blue strip** block; reflow the
    donut to **full width** (drop the `lg:grid-cols-2` wrapper).
- **Out of scope:** projection math (P3.2); manage pages (P3.4).
- **Files:** `components/year-projection/year-projection.component.{ts,html}`,
  `components/projects-summary/projects-summary.component.{ts,html}`.
- **Acceptance:** projection is one short 4-card row; period-reactive; credit card white+green with green
  shadow; labor/vendor on the expenditure card; donut full-width; blue strip gone; no overflow at
  1280/768/375; build + tests green.
- **Verification:** visual at the three widths; toggle periods; confirm donut spans full width.
- **Practices:** visual hierarchy, elevation/shadow scale, tabular numbers, responsive grid.

## P3.4 — Manage-page stat cards (replace the client-header)
- **Feature:** Swap the redundant blue client-header on the Manage pages for page-relevant full-year stat cards.
- **Goal / why:** The client-header repeats on every Manage page and adds little; per-page stats are more useful.
- **Depends on:** Phase 2 (Full observables); P3.3 sets the stat-card visual language.
- **In scope:**
  - Remove the sticky `<app-client-header>` from `pages/{employees,teams,projects,invoices}`.
  - Add a full-year **stat-card row** above each grid:
    - Employees: # employees · SR&ED hours · SR&ED labor cost
    - Teams: # teams · members · SR&ED hours · SR&ED cost
    - Projects: # projects (SR&ED / total) · SR&ED hours · SR&ED expenditure
    - Invoices: # invoices · vendor total · SR&ED vendor
  - Source from `employees$`, `projectSummariesFull$`, `teamHoursBreakdownFull$`, `vendorInvoicesAll$`, plus a
    full-year expenditure selector (`buildExpenditureSummary(ws,'FY')`) where SR&ED labor/cost is needed.
    Likely a small reusable presentational stat-card block.
- **Out of scope:** the grids themselves; client-header is still used on the Analytics page below the controls.
- **Files:** `pages/{employees,teams,projects,invoices}/*-page.component.ts`; optional
  `components/stat-cards/*`; possibly a new FY observable on `services/dashboard-data.service.ts`.
- **Acceptance:** each Manage page shows the correct full-year stats; no client-header there; build + tests green.
- **Verification:** open each Manage page; cross-check a stat against the grid/dashboard.
- **Practices:** visual hierarchy, number formatting (tabular), whitespace.

## P3.5 — Project detail: contributor hourly rate + cost
- **Feature:** Show each project contributor's hourly rate and cost so the per-person expense is visible.
- **Goal / why:** "At a glance, what did each person cost on this project."
- **Depends on:** Phase 2 project detail modal (`buildProjectContributors`).
- **In scope:**
  - `models/derived.model.ts` `ProjectContributor`: add `hourlyRate` + `cost`.
  - `core/derivations.ts` `buildProjectContributors`: add `hourlyRate(employee, standardAnnualHours)` and
    `cost = hours × rate`.
  - `components/project-detail/project-detail.component.html`: render rate + cost per contributor.
  - Extend the contributor unit test.
- **Out of scope:** team modal (P3.6).
- **Files:** `models/derived.model.ts`, `core/derivations.ts`, `core/derivations.spec.ts`,
  `components/project-detail/project-detail.component.html`.
- **Acceptance:** the project modal lists each contributor with name · (team) · hours · rate · cost;
  build + tests green.
- **Verification:** open a project with multiple contributors; verify cost = hours × rate.
- **Practices:** pure derivation, currency formatting, tabular numbers.

## P3.6 — Team detail: per-member breakdown (employee · rate · total)
- **Feature:** Add a Members breakdown to the team detail modal — who's on the team, their rate, and their cost.
- **Goal / why:** Symmetry with the project modal; see the people (not just per-project) behind a team's totals.
- **Depends on:** Phase 2 team detail modal (`buildTeamDetail`).
- **In scope:**
  - `models/derived.model.ts` `TeamDetail`: add `perMember[]`
    (`{ employeeId, name, hourlyRate, sredHours, totalHours, sredCost, totalCost }`).
  - `core/derivations.ts` `buildTeamDetail`: it already loops members computing rate/cost — capture each
    member record instead of discarding it.
  - `components/team-detail/team-detail.component.html`: add a **Members** section (name · rate · total cost).
  - Extend the team-detail unit test.
- **Out of scope:** project modal (P3.5).
- **Files:** `models/derived.model.ts`, `core/derivations.ts`, `core/derivations.spec.ts`,
  `components/team-detail/team-detail.component.html`.
- **Acceptance:** the team modal shows per-member rate + total cost alongside the per-project breakdown;
  build + tests green.
- **Verification:** open a team with members; verify member totals sum to the team's cost.
- **Practices:** pure derivation, currency formatting, tabular numbers.

## P3.7 — Login page redesign (two-panel split)
- **Feature:** Replace the single centered login card with a polished **two-column split** layout.
- **Goal / why:** The login is the first screen; a branded split (hero + form) reads far more professional
  than a lone card (refs: Uigeek / Pouyesh login screens).
- **Depends on:** P3.1 (logo asset); existing `AuthService` + login form.
- **In scope:**
  - **Left hero panel:** brand **navy → brand gradient** (matches the sidebar), **logo + name** top-left,
    a **headline + subtext**, and a small **copyright** at the bottom.
  - **Right panel:** the existing **username/password** form, centered, with the logo, a "Sign in ·
    Welcome back" heading, the error region, fields, Sign In button, and the **demo quick-login chips**.
  - Responsive: two columns on `lg+`; hero hidden/slim on mobile, form full-width.
- **Out of scope:** auth logic, routing, the seeded users — restyle only.
- **Files:** `pages/login/login.component.html` (+ minor copy in `.ts`); reuse `assets/images/logo.svg`.
- **Acceptance:** split layout on desktop; login + role-based routing unchanged; demo chips work; clean
  stack on mobile; build + tests green.
- **Verification:** `ng serve`, view `/login` at 1280/768/375; sign in as `afiniti` and `admin`.
- **Practices:** visual hierarchy, contrast on the dark hero, responsive layout, alt text on the logo.

---

## P3.8 — Overview UX polish (post-review)
- **Feature:** A polish round after reviewing the running Overview page. Status: **done**.
- **In scope:**
  - **Chart scroll-jump fix:** a period change recreated every ApexChart (ng-apexcharts does a full
    destroy + async `render()` on any non-series input change), collapsing layout and jumping scroll onto the
    donut. Added shared `stableXaxis()` (categories are period-independent → reuse the `xaxis` reference) so
    only `series` changes → in-place `updateSeries`, no recreate/flicker. Donut keeps a reserved min-height;
    its `plotOptions`/`tooltip` are stable class fields.
  - **Route progress bar:** `AppComponent` derives `loading$` from the router lifecycle and shows a thin
    indeterminate top bar (lingers ~250ms so it's visible even on instant navigations).
  - **Period-control consolidation:** metric toggle moves into the summary-tiles header
    ("[Hours|Expenditures|Credits] by period"); date-range picker projected next to the quarter/month toggle.
  - **Summary tiles slimmed:** compact segmented controls, tighter spacing, active-only emphasis.
  - **Client header declutter:** company name only; fiscal year / data as of / time zone as an icon + label/
    value strip with dividers.
- **Files:** `components/{employee,team,project}*-chart/*`, `shared/stable-xaxis.ts`, `app.component.*`,
  `components/summary-tiles/*`, `components/metric-toggle/*`, `pages/dashboard/*`, `components/client-header/*`.
- **Verification:** scroll to the bottom of Overview, click period tiles — no scroll jump/flicker; loader
  shows on navigation; build + tests green.

---

## P3.9 — Visual polish pass (post-review)
- **P3.9a — Branding + defaults + backdrop (done):**
  - Use the square rocket mark (`assets/images/sredio-logo-2.jpeg`) in both sidebars as a rounded tile;
    regenerate `favicon.ico` from it (square → crisp).
  - Default the sidebar to **floating** (`UiPreferencesService.floatingSidebar$$ = true`); admin toggle copy updated.
  - Subtle light-blue→grey background gradient on `body` (removed the flat `bg-gray-50`).
  - **Files:** `components/sidebar/*`, `src/index.html`, `src/favicon.ico`, `services/ui-preferences.service.ts`,
    `pages/admin/admin-settings.component.html`, `src/styles.css`.
- **P3.9b — Year Projection redesign:** remove the semicircle gauge; reshape into a clean row — credit card
  gets a polished headline-figure + thin elapsed progress bar (ref: earnest calculator); hours / expenditure /
  credit as the three cards. **Files:** `components/year-projection/*`.
- **P3.9c — Expenditure summary combined layout:** merge the breakdown + headline-credit cards into one clean
  panel (ref image). **Files:** `components/expenditure-summary/*`.
- **P3.9d — Manage-grid spacing:** fix the cramped vertical rhythm on the manage pages (title/description ↔
  stat cards ↔ search/grid). **Files:** `pages/{employees,teams,projects,invoices}/*`, `components/stat-cards/*`.
- **P3.9e — Project modal number layout:** re-place the project-detail totals (labor hours, labor/vendor/total
  cost, credit) more professionally. **Files:** `components/project-detail/*`.
- **Verification (each):** `ng build` clean + `ng test` green; `ng serve` walk-through of the affected view.

---

## Dependency
- **Logo asset** (`src/assets/images/logo.svg` / `.png` + a replacement `src/favicon.ico`) must be supplied by
  the user for P3.1 to render the real brand; the markup is wired to those paths regardless.
