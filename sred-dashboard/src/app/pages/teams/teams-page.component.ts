import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { TeamGridComponent } from '../../components/team-grid/team-grid.component';
import { StatCardsComponent, StatCard } from '../../components/stat-cards/stat-cards.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { money, hoursLabel } from '../../shared';

/**
 * Teams page (Manage group): full-year stat cards + teams with their members and
 * SR&ED vs Unclaimed hours + CRUD (add / edit / remove teams, assign members).
 */
@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [AsyncPipe, TeamGridComponent, StatCardsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-ink">Teams</h1>
          <p class="text-sm text-gray-500 mt-1">Teams with their members and SR&ED vs Unclaimed hours (full year).</p>
        </div>
        <button
          type="button"
          (click)="grid.openAdd()"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
          Create team
        </button>
      </div>
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-team-grid #grid></app-team-grid>
    </div>
  `,
})
export class TeamsPageComponent {
  private readonly data = inject(DashboardDataService);

  readonly stats$ = combineLatest([
    this.data.teams$,
    this.data.teamHoursBreakdownFull$,
    this.data.expenditureSummaryFull$,
  ]).pipe(
    map(([teams, breakdown, exp]): StatCard[] => {
      const sredHours = breakdown.reduce((sum, t) => sum + t.teamSredHours, 0);
      // Members on real teams (the null "Unassigned" group is excluded from the count).
      const members = breakdown
        .filter((t) => t.teamId !== null)
        .reduce((sum, t) => sum + t.members.length, 0);
      return [
        { label: 'Teams', value: `${teams.length}` },
        { label: 'Members', value: `${members}`, hint: 'assigned to a team' },
        { label: 'SR&ED hours', value: hoursLabel(sredHours), hint: 'full year' },
        { label: 'SR&ED cost', value: money(exp?.sredLabor ?? 0), hint: 'labor, full year' },
      ];
    }),
  );
}
