import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProjectGridComponent } from '../../components/project-grid/project-grid.component';
import { StatCardsComponent, StatCard } from '../../components/stat-cards/stat-cards.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { money, hoursLabel } from '../../shared';

/** Projects management page (Manage group): full-year stat cards + project list + CRUD. */
@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [AsyncPipe, ProjectGridComponent, StatCardsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-project-grid></app-project-grid>
    </div>
  `,
})
export class ProjectsPageComponent {
  private readonly data = inject(DashboardDataService);

  readonly stats$ = combineLatest([
    this.data.projectSummariesFull$,
    this.data.expenditureSummaryFull$,
  ]).pipe(
    map(([projects, exp]): StatCard[] => {
      const sred = projects.filter((p) => p.isSred);
      const sredHours = sred.reduce((sum, p) => sum + p.hours, 0);
      return [
        { label: 'Projects', value: `${sred.length} / ${projects.length}`, hint: 'SR&ED / total' },
        { label: 'SR&ED hours', value: hoursLabel(sredHours), hint: 'full year' },
        { label: 'SR&ED expenditure', value: money(exp?.totalSredExpenditure ?? 0), hint: 'labor + vendor' },
      ];
    }),
  );
}
