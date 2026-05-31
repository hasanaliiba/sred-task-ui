import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import {
  Client,
  ClientWorkspace,
  DashboardSeed,
  Employee,
  EmployeeDetail,
  EmployeeRow,
  ExpenditureSummary,
  Feedback,
  GrandTotals,
  HoursSplit,
  Period,
  ProjectSummary,
  Projection,
  Team,
  TeamHoursBreakdown,
  User,
  VendorInvoice,
} from '../models';
import {
  buildEmployeeDetail,
  buildEmployeeHoursBreakdown,
  buildEmployeeRows,
  buildExpenditureSummary,
  buildGrandTotals,
  buildProjection,
  buildProjectSummaries,
  buildTeamHoursBreakdown,
  invoiceInPeriod,
} from '../core/derivations';

const DATA_URL = 'assets/data/dashboard-data.json';

/**
 * Single reactive source of truth for the dashboard.
 *
 * Holds the raw seed in BehaviorSubjects (mutable store, but only ever replaced
 * with NEW values — never mutated in place) and exposes derived data as RxJS
 * observables composed from the pure functions in core/derivations.ts. No Angular
 * signals (project convention). CRUD mutators are added by their feature sprints.
 */
@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly http = inject(HttpClient);

  private readonly workspaces$$ = new BehaviorSubject<ClientWorkspace[]>([]);
  private readonly users$$ = new BehaviorSubject<User[]>([]);
  private readonly feedback$$ = new BehaviorSubject<Feedback[]>([]);
  private readonly activeClientId$$ = new BehaviorSubject<string | null>(null);
  private readonly period$$ = new BehaviorSubject<Period>('FY');

  private loaded = false;

  /** Loads the seed once and populates the store. Safe to call repeatedly. */
  load(): Observable<DashboardSeed> {
    if (this.loaded) {
      return of(this.snapshotSeed());
    }
    return this.http.get<DashboardSeed>(DATA_URL).pipe(
      tap((seed) => {
        this.users$$.next(seed.users);
        this.feedback$$.next(seed.feedback);
        this.workspaces$$.next(seed.workspaces);
        this.loaded = true;
      }),
      shareReplay(1),
    );
  }

  // ---- Selection controls --------------------------------------------------

  setActiveClient(clientId: string | null): void {
    this.activeClientId$$.next(clientId);
  }

  setPeriod(period: Period): void {
    this.period$$.next(period);
  }

  readonly period$ = this.period$$.asObservable();
  readonly users$ = this.users$$.asObservable();
  readonly feedback$ = this.feedback$$.asObservable();

  /** Snapshot of seeded users — used by AuthService for mock login (S5). */
  get users(): User[] {
    return this.users$$.value;
  }

  // ---- Active workspace ----------------------------------------------------

  /** The workspace for the currently active client (or null if none selected). */
  readonly activeWorkspace$: Observable<ClientWorkspace | null> = combineLatest([
    this.workspaces$$,
    this.activeClientId$$,
  ]).pipe(
    map(([workspaces, id]) => workspaces.find((w) => w.client.id === id) ?? null),
    shareReplay(1),
  );

  // ---- Derived read observables (scoped to active client + period) ---------

  readonly client$: Observable<Client | null> = this.activeWorkspace$.pipe(
    map((w) => w?.client ?? null),
  );

  readonly teams$: Observable<Team[]> = this.activeWorkspace$.pipe(map((w) => w?.teams ?? []));

  readonly employees$: Observable<EmployeeRow[]> = this.activeWorkspace$.pipe(
    map((w) => (w ? buildEmployeeRows(w) : [])),
  );

  readonly projectSummaries$: Observable<ProjectSummary[]> = combineLatest([
    this.activeWorkspace$,
    this.period$$,
  ]).pipe(map(([w, p]) => (w ? buildProjectSummaries(w, p) : [])));

  readonly grandTotals$: Observable<GrandTotals> = this.projectSummaries$.pipe(
    map((summaries) => buildGrandTotals(summaries)),
  );

  readonly employeeHoursBreakdown$: Observable<HoursSplit[]> = combineLatest([
    this.activeWorkspace$,
    this.period$$,
  ]).pipe(map(([w, p]) => (w ? buildEmployeeHoursBreakdown(w, p) : [])));

  readonly teamHoursBreakdown$: Observable<TeamHoursBreakdown[]> = combineLatest([
    this.activeWorkspace$,
    this.period$$,
  ]).pipe(map(([w, p]) => (w ? buildTeamHoursBreakdown(w, p) : [])));

  readonly vendorInvoices$: Observable<VendorInvoice[]> = combineLatest([
    this.activeWorkspace$,
    this.period$$,
  ]).pipe(map(([w, p]) => (w ? w.vendorInvoices.filter((v) => invoiceInPeriod(v, p)) : [])));

  readonly governmentAssistance$: Observable<number> = this.activeWorkspace$.pipe(
    map((w) => w?.governmentAssistanceTotal ?? 0),
  );

  readonly expenditureSummary$: Observable<ExpenditureSummary | null> = combineLatest([
    this.activeWorkspace$,
    this.period$$,
  ]).pipe(map(([w, p]) => (w ? buildExpenditureSummary(w, p) : null)));

  readonly projection$: Observable<Projection | null> = this.activeWorkspace$.pipe(
    map((w) => (w ? buildProjection(w) : null)),
  );

  /** Per-employee detail for the modal, reactive to the selected period (Feature C). */
  employeeDetail$(employeeId: string): Observable<EmployeeDetail | null> {
    return combineLatest([this.activeWorkspace$, this.period$$]).pipe(
      map(([w, p]) => (w ? buildEmployeeDetail(w, employeeId, p) : null)),
    );
  }

  // ---- Employee CRUD (immutable; Feature C) --------------------------------

  addEmployee(employee: Employee): void {
    this.mutateActiveWorkspace((ws) => ({ ...ws, employees: [...ws.employees, employee] }));
  }

  updateEmployee(employee: Employee): void {
    this.mutateActiveWorkspace((ws) => ({
      ...ws,
      employees: ws.employees.map((e) => (e.id === employee.id ? employee : e)),
    }));
  }

  /** Removes an employee and their timesheet rows (so totals/charts stay consistent). */
  removeEmployee(employeeId: string): void {
    this.mutateActiveWorkspace((ws) => ({
      ...ws,
      employees: ws.employees.filter((e) => e.id !== employeeId),
      timesheets: ws.timesheets.filter((t) => t.employeeId !== employeeId),
    }));
  }

  // ---- Internal helpers ----------------------------------------------------

  /** Replaces the active workspace with a NEW value produced by `mutator` (never mutates in place). */
  private mutateActiveWorkspace(mutator: (ws: ClientWorkspace) => ClientWorkspace): void {
    const id = this.activeClientId$$.value;
    this.workspaces$$.next(
      this.workspaces$$.value.map((w) => (w.client.id === id ? mutator(w) : w)),
    );
  }

  private snapshotSeed(): DashboardSeed {
    return {
      users: this.users$$.value,
      workspaces: this.workspaces$$.value,
      feedback: this.feedback$$.value,
    };
  }
}
