# SR&ED Dashboard — Phase 3 Plan (Branding, YTD Overhaul & Detail Enrichments)

## Context
Phases 1–2 are complete (all 6 PDF requirements + features A–H, then a routed multi-page overhaul, design
polish, CRUD on all entities, detail modals, dynamic search, and CI/CD — 89 unit tests, clean build). The app
is functionally done; **Phase 3 is a focused refinement pass** driven by review feedback:

- **Brand it** as the company (logo + favicon), not the generic "SR&ED Projections" text.
- **Make the Year-Projection (YTD) the page's functional summary** — compact, period-reactive, and SR&ED-only —
  so the redundant blue grand-totals strip can be retired.
- **Replace the redundant client-header on Manage pages** with page-relevant stat cards.
- **Enrich the detail modals** with cost (project contributors get rate + cost; teams get a per-member breakdown).

Constraints unchanged: **RxJS observables only (no signals)**, the existing palette/light theme, and
*derived-from-`timesheets`* data — no new stored state. One feature per sprint with the standing
**build → test → commit → confirm** gate.

## Confirmed decisions (from the user)
- **Logo:** the user drops `src/assets/images/logo.svg` (or `.png`) and replaces `src/favicon.ico`; the markup
  is wired to that file (no text in the brand block).
- **Sidebar user:** the bottom client-name/displayName text becomes a **profile chip** — an initials avatar +
  the user's name + their role ("Client" / "Admin"), non-interactive.
- **Manage stat cards:** use the **recommended per-page metrics** (below), all full-year.
- **"Analytics" → "Overview":** rename the **label only**; keep the `/analytics` route + default redirect.

---

## Sprints

### P3.1 — Branding + sidebar
- **Logo:** in `components/sidebar/sidebar.component.html` and `components/sidebar/admin-sidebar.component.html`,
  replace the `<div class="…bg-logo…">S</div>` + the "SR&ED" / "Projections" / "Admin" text with
  `<img src="assets/images/logo.svg" alt="<company>" class="h-9 …">` only.
- **Favicon + title:** update the `<link rel="icon">` and `<title>` in `src/index.html` (user replaces
  `src/favicon.ico`).
- **Rename** the nav label **"Analytics" → "Overview"** (label only; route stays `/analytics`).
- **Profile chip:** replace the bottom client/display-name block with an **initials avatar + name + role**
  chip (small `initials()` helper from `currentUser.displayName`); applied to both sidebars.
- **Verify:** build + tests; logo renders once the file is dropped; "Overview" label; chip shows the
  logged-in user + role.

### P3.2 — Period-reactive, SR&ED-only Year Projection (logic)
- `core/derivations.ts`: `buildProjection(ws)` → **`buildProjection(ws, period)`**. The YTD figures become the
  **selected period's SR&ED** values (SR&ED-project hours; `buildExpenditureSummary(ws, period)` for SR&ED
  labor + vendor + credit), and the elapsed fraction becomes **`monthsOf(period).length / 12`**
  (Q1 → 25%, H1 → 50%, FY → 100%, a single month → 1/12). `projected = ytd / fraction`.
- `services/dashboard-data.service.ts`: make `projection$` **period-reactive** —
  `combineLatest([activeWorkspace$, period$$]) → buildProjection(w, p)`.
- Update the projection unit tests (period share; Q1 vs FY; unclaimed excluded).
- **Verify:** selecting **Q1** → gauge ~25%, figures = Q1 SR&ED, projected ≈ ×4; **FY** → 100%, projected = YTD;
  switching periods changes every projection number.

### P3.3 — YTD card redesign + remove the blue strip
- `components/year-projection/year-projection.component.html`: turn the tall banner + 3 stacked cards into a
  **row of 4 compact, equal-height cards** (`sm:grid-cols-2 lg:grid-cols-4`), in the clean stat-card style
  (icon · label · big number):
  1. **Fiscal-year elapsed** — the % (with a small gauge or plain figure)
  2. **SR&ED hours** — current (left) · projected full-year (right)
  3. **SR&ED expenditure** — current (left) · projected (right), with a small **labor + SR&ED-vendor** sub-split
  4. **SR&ED credit** — **white card** (like the others), number in **green with a green shadow** (not a full-green card)
  Putting current-left / projected-right keeps the cards short.
- **Remove the blue grand-totals strip** from `components/projects-summary/projects-summary.component.html`
  and reflow the **donut to full width** (drop the `lg:grid-cols-2` wrapper).
- **Consequence (intended):** the all-projects/unclaimed dollar total leaves the dashboard except the donut's
  "Unclaimed" slice — consistent with the SR&ED focus.
- **Verify:** shorter projection row; period-reactive; credit card white+green; labor/vendor on the expenditure
  card; donut full-width; no blue strip; responsive.

### P3.4 — Manage-page stat cards (replace the client-header)
- Remove the sticky `<app-client-header>` from `pages/{employees,teams,projects,invoices}` and add a small
  **full-year stat-card row** above each grid:
  - **Employees:** # employees · SR&ED hours · SR&ED labor cost
  - **Teams:** # teams · members · SR&ED hours · SR&ED cost
  - **Projects:** # projects (SR&ED / total) · SR&ED hours · SR&ED expenditure
  - **Invoices:** # invoices · vendor total · SR&ED vendor
- Source from existing full-year observables (`employees$`, `projectSummariesFull$`, `teamHoursBreakdownFull$`,
  `vendorInvoicesAll$`) plus a full-year expenditure selector (`buildExpenditureSummary(ws,'FY')`) where SR&ED
  labor/cost is needed. Likely a small reusable presentational stat-card block.
- **Verify:** build + tests; each page shows the right FY stats; no client-header.

### P3.5 — Project detail: contributor hourly rate + cost
- `models/derived.model.ts` `ProjectContributor`: add `hourlyRate` + `cost`.
- `core/derivations.ts` `buildProjectContributors`: it already resolves the employee — add
  `hourlyRate(employee, standardAnnualHours)` and `cost = hours × rate`.
- `components/project-detail/project-detail.component.html`: show **rate** and **cost** per contributor.
- **Verify:** build + tests (extend the contributor test); modal shows each person's rate + cost.

### P3.6 — Team detail: per-member breakdown (employee · rate · total)
- `models/derived.model.ts` `TeamDetail`: add `perMember[]`
  (`{ employeeId, name, hourlyRate, sredHours, totalHours, sredCost, totalCost }`).
- `core/derivations.ts` `buildTeamDetail`: it already loops the members computing rate/cost — **capture each
  member record** instead of discarding it.
- `components/team-detail/team-detail.component.html`: add a **Members** section (name · hourly rate · total cost).
- **Verify:** build + tests (extend the team-detail test); modal shows the per-member breakdown.

### P3.7 — Login page redesign (two-panel split)
- **What:** replace the single centered login card with a **two-column split** (refs: Uigeek / Pouyesh):
  - **Left hero panel** — the brand **navy → brand gradient** (matching the sidebar), the **logo + name**
    top-left, a **headline** + subtext (e.g. "SR&ED projections, simplified." / "Employee hours, project
    costs, and projected R&D credits — in one place."), and a small **copyright** pinned at the bottom.
  - **Right panel** — the existing **username/password** sign-in form, centered, with the logo, a
    **"Sign in · Welcome back"** heading, the error region, the fields, the Sign In button, and the
    **demo-credential quick-login chips** kept (great for the recruiter demo).
- **Reuse:** `AuthService.login` + role-based routing and the existing reactive form are unchanged — this is
  a **layout/visual restyle only**. Use `assets/images/logo.svg` for the brand mark.
- **Responsive:** two columns on `lg+`; on mobile the hero collapses (hidden or a slim top band) and the
  form takes the full width.
- **Files:** `pages/login/login.component.html` (+ minor copy in `.ts` if needed); reuse the logo asset.
- **Acceptance:** split layout on desktop; login + role routing still work; demo chips work; stacks cleanly
  on mobile; build + tests green.

### P3.8 — Overview UX polish (post-review)
- **What:** a round of polish after reviewing the running Overview page:
  - **Chart scroll-jump fix** — a period change recreated every ApexChart (any non-series input change forces
    a full destroy + async re-render), collapsing layout and jumping the scroll. A shared `stableXaxis()`
    memoizer reuses the `xaxis` reference (categories are period-independent) so only `series` changes →
    in-place `updateSeries`. The donut keeps a reserved min-height; its `plotOptions`/`tooltip` are stable fields.
  - **Route progress bar** — a thin top loading bar driven by the router lifecycle.
  - **Period-control consolidation** — the metric toggle moves into the summary-tiles header
    ("[Hours|Expenditures|Credits] by period") as the page's data driver, with the date-range picker projected
    beside the quarter/month view toggle.
  - **Summary tiles slimmed** — compact segmented controls, tighter spacing, active-only emphasis so a row of
    figures doesn't overwhelm.
  - **Client header decluttered** — company name only; fiscal year / data as of / time zone as a clean
    label/value strip with icons + dividers.

### P3.9 — Visual polish pass (post-review)
- **P3.9a — Branding + defaults + backdrop (done):** use the square rocket mark (`sredio-logo-2`) in both
  sidebars + regenerate `favicon.ico` from it; default the sidebar to **floating**; add a subtle
  light-blue→grey background gradient for a professional dashboard feel.
- **P3.9b — Year Projection redesign:** remove the semicircle gauge; reshape into a clean row — the credit
  card gets a polished "headline figure + thin elapsed progress bar" treatment (ref: earnest calculator),
  hours / expenditure / credit as the three cards.
- **P3.9c — Expenditure summary combined layout:** merge the breakdown + headline-credit cards into one clean
  combined panel (ref image).
- **P3.9d — Manage-grid spacing:** fix the cramped vertical rhythm on the manage pages (title/description ↔
  stat cards ↔ search/grid gaps).
- **P3.9e — Project modal number layout:** re-place the project-detail totals (labor hours, labor/vendor/total
  cost, credit) more professionally.
- **P3.9f — Sidebar hover-expand + collapse/pin toggle (done):** both sidebars grow from the thin icon rail
  (`w-16`) to `w-56` on hover (lg+), revealing nav labels, the brand name, and the profile name/role; the
  hover-expanded rail overlays content (fixed, z-40, labels fade in via `group-hover`). A **collapse/pin
  toggle button** in the sidebar holds the open state (`sidebarPinned$` in `UiPreferencesService`); when
  pinned the rail stays expanded and the content reflows to make room (no overlay). Mobile drawer unchanged.
- **P3.9g — Overview reorder + records grids (done):** new section order — YTD projection → expenditure
  summary → projects (chart + donut) → teams → employees. Added a **Records** section at the bottom: a new
  `<app-overview-grids>` tabbed panel (Employees by default; toggle Invoices / Teams / Projects), reusing the
  existing grid components (search + inline edit/delete; creation stays on the Manage pages).

---

## Critical files
- **Branding/sidebar:** `src/index.html`; `components/sidebar/sidebar.component.{ts,html}`;
  `components/sidebar/admin-sidebar.component.{ts,html}`; `src/assets/images/logo.svg` (user-provided).
- **Projection:** `core/derivations.ts` (`buildProjection`); `services/dashboard-data.service.ts`
  (`projection$`); `components/year-projection/year-projection.component.{ts,html}`;
  `components/projects-summary/projects-summary.component.html` (blue-strip removal).
- **Manage:** `pages/{employees,teams,projects,invoices}/*-page.component.ts` (+ a small stat-card component).
- **Modals:** `core/derivations.ts` (`buildProjectContributors`, `buildTeamDetail`); `models/derived.model.ts`
  (`ProjectContributor`, `TeamDetail`); `components/project-detail/*`; `components/team-detail/*`.

## Verification (every sprint)
- `ng build` clean + `ng test` green (extend specs for the period-reactive projection, contributor cost, and
  team members). `ng serve` walk-through: branding, period-reactive YTD cards (toggle Q1/Q2/FY), manage stat
  cards, modal cost columns. Commit each sprint; append a walkthrough entry. Palette/theme and RxJS-only
  approach preserved throughout.

## Dependency
- **Logo asset** — `src/assets/images/logo.svg` (or `.png`) + a replacement `src/favicon.ico` need to be
  dropped in by the user for P3.1 to render the real brand; the markup is wired to those paths regardless.
