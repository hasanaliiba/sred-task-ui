# SR&ED Dashboard — Phase 2 Plan (Layout + Navigation Overhaul)

> **Companion to Phase 1.** `docs/sred-dashboard-plan.md` froze the Phase 1 design (requirements 1–6 +
> features A–H). This document is the **frozen design reference for Phase 2** — the "what" and "why" of
> the visual/navigation overhaul. The execution detail lives in `docs/implementation-sprints-phase-2.md`.
> Engineering practices unchanged: `docs/rules.md` (Zen + functional + agent conduct). **RxJS only — no
> signals.** The Flowbite reference image informed *layout structure only*.

## Context
Phase 1 shipped a fully functional dashboard (63 tests, committed sprint-by-sprint) but as a **single
long-scrolling page** with a **top anchor-link navbar** and all CRUD inline. Phase 2 turns it into a
professional, **routed multi-page** analytics product. **Hard constraints:** keep the existing color
palette (`brand`/`ink`/`sky`/semantic in `palette.css`), keep the **light theme**, keep all features
working and all tests green, reuse the existing section components (relocate, don't rewrite).

Approved direction was validated with a static mockup: `docs/mockups/phase2-dashboard.html`.

## Goals (from the user)
1. **Left sidebar** navigation (the standard, more professional dashboard pattern).
2. A home page called **"Analytics"** showing all **KPIs + charts**.
3. **Employees / Projects / Invoices CRUD** move out of the home page into their own pages, reached via
   **nested sidebar links** (a "Manage" group).
4. **Feedback** becomes a sidebar item **just above Log out** (remove the floating bottom-right button).
5. A **global metric toggle** (Hours / Expenditures / Credits) that drives every figure on Analytics
   (like the task PDF's "Show Hours / Expenditures / Credits").
6. **Metric-aware period tiles** (Q1–Q4 + Year-to-Date, and a month view) showing the active metric +
   date ranges, plus a **custom date range** — backed by **monthly** seed data for accuracy.
7. **Pagination** on the CRUD tables (50+ rows stay usable).
8. **Donut formatting fix** — active-slice center + tooltip must format as currency/hours (not raw).

## Information architecture
```
Client area (authGuard) — ClientShellComponent: sidebar + slim top bar + <router-outlet>
  ├─ /analytics  (home, default)  → KPIs, metric toggle, period tiles, all charts, projection, credit
  └─ Manage (nested sidebar group)
       ├─ /employees  → salary grid + add/edit/remove + SR&ED detail modal   (+ pagination)
       ├─ /projects   → project manager (list + add/edit/remove)
       └─ /invoices   → vendor invoices + add/edit/remove + government assistance  (+ pagination)
  Sidebar bottom: Feedback (opens modal) · Log out

Admin area (adminGuard) — matching sidebar
  ├─ /admin/feedback   → all-client feedback
  └─ /admin/settings   → per-client credit rate
```

## Design notes (palette unchanged)
- **Sidebar** (dark `ink`): brand, `routerLink` nav with `routerLinkActive` highlight, nested "Manage"
  group; mobile off-canvas drawer + backdrop; respects `prefers-reduced-motion`.
- **Slim top bar**: mobile hamburger, page title + client, the **metric toggle**, time zone, user.
- **Analytics** = read-only visualizations only (no CRUD tables): period controls (granularity +
  custom range) → metric-aware **tiles** → **YTD vs projected** headline → charts in a mixed grid
  (`lg:grid-cols-2` for paired charts, full-width for wide ones) → projection + SR&ED-credit headline.
- **Manage pages** = the existing CRUD components on dedicated routes; period/metric-independent.
- **Metric model:** `metric ∈ {hours, expenditure, credit}` in the data service; a metric-aware value
  selector lets one set of derivations feed all three views.
- **Time model:** seed stores **monthly** hours (`m1..m12`); periods (quarter / month / YTD / custom
  range) are aggregations over months. Projection (linear run-rate) and credit math are unchanged in
  spirit, just sourced from monthly aggregation.

## Out of scope (Phase 2)
- No new business features beyond the above; no backend/persistence; no dark mode; no palette change.
- Team CRUD remains out (teams stay read-only/analytical).

## End-of-Phase-2 verification
- All Phase 1 behaviors still work; **63+ tests green**; `ng build` clean.
- Sidebar routes + active state; Analytics is charts/KPIs only; CRUD lives on its own pages with
  pagination; metric toggle changes every Analytics figure; quarter/month tiles + custom range correct
  against monthly data; donut formats; Feedback opens from the sidebar; no horizontal overflow at
  1280 / 768 / 375; palette/theme unchanged.
