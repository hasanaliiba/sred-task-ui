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
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-employee-grid></app-employee-grid>
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
