import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EmployeeGridComponent } from '../../components/employee-grid/employee-grid.component';
import { StatCardsComponent, StatCard } from '../../components/stat-cards/stat-cards.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { money, hoursLabel } from '../../shared';

/** Employees management page (Manage group): full-year stat cards + salary grid + CRUD. */
@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [AsyncPipe, EmployeeGridComponent, StatCardsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-ink">Employees</h1>
          <p class="text-sm text-gray-500 mt-1">Salary, equivalent hourly rate, and SR&ED hours per employee.</p>
        </div>
        <button
          type="button"
          (click)="grid.openAdd()"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
          Create employee
        </button>
      </div>
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-employee-grid #grid></app-employee-grid>
    </div>
  `,
})
export class EmployeesPageComponent {
  private readonly data = inject(DashboardDataService);

  readonly stats$ = combineLatest([
    this.data.employees$,
    this.data.projectSummariesFull$,
    this.data.expenditureSummaryFull$,
  ]).pipe(
    map(([emps, projects, exp]): StatCard[] => {
      const sredHours = projects.filter((p) => p.isSred).reduce((sum, p) => sum + p.hours, 0);
      return [
        { label: 'Employees', value: `${emps.length}` },
        { label: 'SR&ED hours', value: hoursLabel(sredHours), hint: 'full year' },
        { label: 'SR&ED labor cost', value: money(exp?.sredLabor ?? 0), hint: 'full year' },
      ];
    }),
  );
}
